import { describe, it, expect, beforeEach } from 'vitest';
import { StateMachine } from '../state';

describe('StateMachine', () => {
  let sm: StateMachine;

  beforeEach(() => {
    sm = new StateMachine();
  });

  it('initial state is pending', () => {
    expect(sm.getCurrentState()).toBe('pending');
  });

  it('can transition from pending to running', () => {
    const result = sm.transition('running');
    expect(result).toBe(true);
    expect(sm.getCurrentState()).toBe('running');
  });

  it('cannot transition from pending to completed (invalid)', () => {
    const result = sm.transition('completed');
    expect(result).toBe(false);
    expect(sm.getCurrentState()).toBe('pending');
  });

  it('transitions through full lifecycle: pending->running->completed', () => {
    expect(sm.transition('running')).toBe(true);
    expect(sm.getCurrentState()).toBe('running');

    expect(sm.transition('completed')).toBe(true);
    expect(sm.getCurrentState()).toBe('completed');
  });

  it('records transition history', () => {
    sm.transition('running');
    sm.transition('paused');

    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({ from: 'pending', to: 'running' });
    expect(history[1]).toMatchObject({ from: 'running', to: 'paused' });
    expect(history[0].timestamp).toBeDefined();
    expect(history[1].timestamp).toBeDefined();
  });

  it('canTransition returns correct boolean', () => {
    expect(sm.canTransition('running')).toBe(true);
    expect(sm.canTransition('completed')).toBe(false);
    expect(sm.canTransition('cancelled')).toBe(true);

    sm.transition('running');
    expect(sm.canTransition('completed')).toBe(true);
    expect(sm.canTransition('pending')).toBe(false);
  });

  it('reset returns to initial state and clears history', () => {
    sm.transition('running');
    sm.transition('completed');
    expect(sm.getHistory()).toHaveLength(2);

    sm.reset();
    expect(sm.getCurrentState()).toBe('pending');
    expect(sm.getHistory()).toHaveLength(0);
  });

  it('can transition from running to failed', () => {
    sm.transition('running');
    const result = sm.transition('failed');
    expect(result).toBe(true);
    expect(sm.getCurrentState()).toBe('failed');
  });

  it('supports cancellation from pending', () => {
    const result = sm.transition('cancelled');
    expect(result).toBe(true);
    expect(sm.getCurrentState()).toBe('cancelled');
  });

  it('supports waiting-approval state', () => {
    sm.transition('running');
    const result = sm.transition('waiting-approval');
    expect(result).toBe(true);
    expect(sm.getCurrentState()).toBe('waiting-approval');
  });
});
