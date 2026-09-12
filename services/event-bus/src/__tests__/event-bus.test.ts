import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus, EventBusConfig } from '../index';

const defaultConfig: EventBusConfig = {
  maxRetries: 2,
  deadLetterQueueSize: 50,
  deduplicationWindow: 5000,
  enableTracing: false,
};

const makeEvent = (overrides: Record<string, unknown> = {}) => ({
  tenantId: 'tenant-1',
  source: 'test',
  type: 'test.event',
  data: { key: 'value' },
  ...overrides,
});

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus(defaultConfig);
  });

  it('publish triggers matching subscribers', async () => {
    const handler = vi.fn();
    bus.subscribe('test.event', handler);

    await bus.publish(makeEvent());

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'test.event' }),
    );
  });

  it('publish does not trigger non-matching subscribers', async () => {
    const handler = vi.fn();
    bus.subscribe('other.event', handler);

    await bus.publish(makeEvent());

    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribe stops events', async () => {
    const handler = vi.fn();
    const subId = bus.subscribe('test.event', handler);

    await bus.publish(makeEvent());
    expect(handler).toHaveBeenCalledOnce();

    bus.unsubscribe(subId);

    await bus.publish(makeEvent());
    expect(handler).toHaveBeenCalledTimes(1); // still only 1 call
  });

  it('deduplication prevents duplicate processing', async () => {
    const handler = vi.fn();
    bus.subscribe('test.event', handler);

    await bus.publish(makeEvent());
    await bus.publish(makeEvent()); // duplicate within dedup window

    expect(handler).toHaveBeenCalledOnce();
  });

  it('failed handler adds to dead letter queue', async () => {
    const failingHandler = vi.fn().mockRejectedValue(new Error('handler error'));
    bus.subscribe('test.event', failingHandler);

    await bus.publish(makeEvent());

    // Wait for retries: maxRetries=2, backoff 1s+2s = 3s minimum
    await new Promise((r) => setTimeout(r, 8000));

    const dlq = bus.getDeadLetterQueue();
    expect(dlq.length).toBeGreaterThanOrEqual(1);
  }, 15000);

  it('retry handler retries before failing', async () => {
    let callCount = 0;
    const handler = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 3) throw new Error('not yet');
    });
    bus.subscribe('test.event', handler);

    await bus.publish(makeEvent());
    await new Promise((r) => setTimeout(r, 8000));

    expect(handler.mock.calls.length).toBeGreaterThanOrEqual(3);
  }, 15000);

  it('getStats returns correct counts', async () => {
    bus.subscribe('test.event', () => {});
    bus.subscribe('test.event', () => {});

    await bus.publish(makeEvent());

    const stats = bus.getStats();
    expect(stats.totalPublished).toBe(1);
    expect(stats.totalProcessed).toBe(1);
    expect(stats.activeSubscriptions).toBe(2);
  });

  it('priority ordering works', async () => {
    const order: number[] = [];
    bus.subscribe('test.event', async () => { order.push(1); }, { priority: 1 });
    bus.subscribe('test.event', async () => { order.push(2); }, { priority: 3 });
    bus.subscribe('test.event', async () => { order.push(3); }, { priority: 2 });

    await bus.publish(makeEvent());

    expect(order).toEqual([2, 3, 1]);
  });

  it('wildcard subscriber receives all events', async () => {
    const handler = vi.fn();
    bus.subscribe('*', handler);

    await bus.publish(makeEvent({ type: 'foo.bar' }));
    await bus.publish(makeEvent({ type: 'baz.qux' }));

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('filter subscriber only receives matching events', async () => {
    const handler = vi.fn();
    bus.subscribe('test.event', handler, {
      filter: (event) => event.data.severity === 'high',
    });

    await bus.publish(makeEvent({ data: { severity: 'high' } }));
    await bus.publish(makeEvent({ data: { severity: 'low' } }));

    expect(handler).toHaveBeenCalledOnce();
  });
});
