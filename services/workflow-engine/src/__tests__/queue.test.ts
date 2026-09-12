import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowQueue, QueueItem } from '../queue';

describe('WorkflowQueue', () => {
  let queue: WorkflowQueue;

  beforeEach(() => {
    queue = new WorkflowQueue({ maxConcurrent: 2 });
  });

  const makeItem = (id: string, priority: number): Omit<QueueItem, 'status' | 'enqueuedAt'> => ({
    id,
    workflowId: `wf-${id}`,
    priority,
    payload: { data: id },
  });

  it('enqueue adds item and returns queue item', async () => {
    const item = await queue.enqueue(makeItem('1', 1));
    expect(item.id).toBe('1');
    expect(item.status).toBe('processing');
    expect(item.enqueuedAt).toBeDefined();
  });

  it('pending items are sorted by priority', async () => {
    const q = new WorkflowQueue({ maxConcurrent: 1 });

    await q.enqueue(makeItem('low', 1));
    await q.enqueue(makeItem('high', 10));
    await q.enqueue(makeItem('med', 5));

    expect(q.getProcessing()).toHaveLength(1);
    expect(q.getPending()).toHaveLength(2);
    expect(q.getPending()[0].id).toBe('high');
    expect(q.getPending()[1].id).toBe('med');
  });

  it('respects maxConcurrent limit', async () => {
    await queue.enqueue(makeItem('1', 1));
    await queue.enqueue(makeItem('2', 1));
    await queue.enqueue(makeItem('3', 1));

    const processing = queue.getProcessing();
    expect(processing).toHaveLength(2);

    const stats = queue.getStats();
    expect(stats.processing).toBe(2);
    expect(stats.pending).toBe(1);
  });

  it('complete removes from processing and emits event', async () => {
    const completedCb = vi.fn();
    queue.on('completed', completedCb);

    await queue.enqueue(makeItem('1', 1));
    queue.complete('1', { result: 'done' });

    const stats = queue.getStats();
    expect(stats.processing).toBe(0);
    expect(completedCb).toHaveBeenCalledOnce();
    expect(completedCb).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', result: { result: 'done' } }),
    );
  });

  it('fail removes from processing and emits event', async () => {
    const failedCb = vi.fn();
    queue.on('failed', failedCb);

    await queue.enqueue(makeItem('1', 1));
    queue.fail('1', new Error('something broke'));

    const stats = queue.getStats();
    expect(stats.processing).toBe(0);
    expect(failedCb).toHaveBeenCalledOnce();
  });

  it('getStats returns correct counts', async () => {
    await queue.enqueue(makeItem('1', 1));
    await queue.enqueue(makeItem('2', 2));
    await queue.enqueue(makeItem('3', 3));

    const stats = queue.getStats();
    expect(stats.pending).toBe(1);
    expect(stats.processing).toBe(2);
    expect(stats.total).toBe(3);
  });

  it('clear empties queue and processing', async () => {
    await queue.enqueue(makeItem('1', 1));
    await queue.enqueue(makeItem('2', 2));

    queue.clear();

    expect(queue.getPending()).toHaveLength(0);
    expect(queue.getProcessing()).toHaveLength(0);
    expect(queue.getStats()).toEqual({ pending: 0, processing: 0, total: 0 });
  });

  it('processes next item after completion', async () => {
    await queue.enqueue(makeItem('1', 1));
    await queue.enqueue(makeItem('2', 2));
    await queue.enqueue(makeItem('3', 3));

    expect(queue.getProcessing()).toHaveLength(2);
    expect(queue.getPending()).toHaveLength(1);

    queue.complete('1');
    expect(queue.getProcessing()).toHaveLength(2);
    expect(queue.getPending()).toHaveLength(0);
  });
});
