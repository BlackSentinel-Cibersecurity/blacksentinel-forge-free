// ============================================================================
// BlackSentinel Forge - Workflow Queue
// ============================================================================

import { EventEmitter } from 'events';

export interface QueueConfig {
  maxConcurrent: number;
}

export interface QueueItem {
  id: string;
  workflowId: string;
  priority: number;
  payload: Record<string, unknown>;
  enqueuedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class WorkflowQueue extends EventEmitter {
  private queue: QueueItem[] = [];
  private processing: Map<string, QueueItem> = new Map();
  private config: QueueConfig;

  constructor(config: QueueConfig) {
    super();
    this.config = config;
  }

  async enqueue(item: Omit<QueueItem, 'status' | 'enqueuedAt'>): Promise<QueueItem> {
    const queueItem: QueueItem = {
      ...item,
      status: 'pending',
      enqueuedAt: new Date().toISOString(),
    };

    this.queue.push(queueItem);
    this.queue.sort((a, b) => b.priority - a.priority);

    this.emit('enqueued', queueItem);
    this.processNext();

    return queueItem;
  }

  private async processNext(): Promise<void> {
    if (this.processing.size >= this.config.maxConcurrent) {
      return;
    }

    const next = this.queue.shift();
    if (!next) return;

    next.status = 'processing';
    this.processing.set(next.id, next);

    this.emit('processing', next);
  }

  complete(id: string, result?: Record<string, unknown>): void {
    const item = this.processing.get(id);
    if (item) {
      item.status = 'completed';
      this.processing.delete(id);
      this.emit('completed', { ...item, result });
      this.processNext();
    }
  }

  fail(id: string, error: Error): void {
    const item = this.processing.get(id);
    if (item) {
      item.status = 'failed';
      this.processing.delete(id);
      this.emit('failed', { ...item, error });
      this.processNext();
    }
  }

  getPending(): QueueItem[] {
    return [...this.queue];
  }

  getProcessing(): QueueItem[] {
    return Array.from(this.processing.values());
  }

  getStats(): { pending: number; processing: number; total: number } {
    return {
      pending: this.queue.length,
      processing: this.processing.size,
      total: this.queue.length + this.processing.size,
    };
  }

  clear(): void {
    this.queue = [];
    this.processing.clear();
  }
}
