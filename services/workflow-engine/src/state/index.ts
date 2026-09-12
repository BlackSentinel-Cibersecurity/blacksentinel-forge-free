// ============================================================================
// BlackSentinel Forge - Execution State Machine
// ============================================================================

import { ExecutionStatus } from '@blacksentinel/shared';

type StateTransition = {
  from: ExecutionStatus;
  to: ExecutionStatus;
  guard?: () => boolean;
};

const TRANSITIONS: StateTransition[] = [
  { from: 'pending', to: 'running' },
  { from: 'pending', to: 'cancelled' },
  { from: 'running', to: 'paused' },
  { from: 'running', to: 'waiting-approval' },
  { from: 'running', to: 'completed' },
  { from: 'running', to: 'failed' },
  { from: 'running', to: 'cancelled' },
  { from: 'running', to: 'timeout' },
  { from: 'paused', to: 'running' },
  { from: 'paused', to: 'cancelled' },
  { from: 'waiting-approval', to: 'running' },
  { from: 'waiting-approval', to: 'failed' },
  { from: 'waiting-approval', to: 'cancelled' },
  { from: 'timeout', to: 'running' },
  { from: 'timeout', to: 'failed' },
];

export class StateMachine {
  private currentState: ExecutionStatus = 'pending';
  private history: { from: ExecutionStatus; to: ExecutionStatus; timestamp: string }[] = [];

  transition(to: ExecutionStatus): boolean {
    const validTransition = TRANSITIONS.find(
      (t) => t.from === this.currentState && t.to === to,
    );

    if (!validTransition) {
      return false;
    }

    if (validTransition.guard && !validTransition.guard()) {
      return false;
    }

    this.history.push({
      from: this.currentState,
      to,
      timestamp: new Date().toISOString(),
    });

    this.currentState = to;
    return true;
  }

  getCurrentState(): ExecutionStatus {
    return this.currentState;
  }

  getHistory(): { from: ExecutionStatus; to: ExecutionStatus; timestamp: string }[] {
    return [...this.history];
  }

  canTransition(to: ExecutionStatus): boolean {
    return TRANSITIONS.some(
      (t) => t.from === this.currentState && t.to === to,
    );
  }

  reset(): void {
    this.currentState = 'pending';
    this.history = [];
  }
}
