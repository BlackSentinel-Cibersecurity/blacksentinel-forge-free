// ============================================================================
// BlackSentinel Forge - Event Bus & Orchestration Engine
// ============================================================================

import {
  ForgeEvent,
  EventMetadata,
  generateId,
  generateCorrelationId,
} from '@blacksentinel/shared';
import { EventEmitter } from 'events';

export type EventHandler = (event: ForgeEvent) => Promise<void>;

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  filter?: (event: ForgeEvent) => boolean;
  priority: number;
  enabled: boolean;
}

export interface EventBusConfig {
  maxRetries: number;
  deadLetterQueueSize: number;
  deduplicationWindow: number;
  enableTracing: boolean;
}

export class EventBus extends EventEmitter {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventHistory: ForgeEvent[] = [];
  private deadLetterQueue: ForgeEvent[] = [];
  private processedEvents: Set<string> = new Set();
  private config: EventBusConfig;

  constructor(config: EventBusConfig) {
    super();
    this.config = config;
  }

  async publish(event: Omit<ForgeEvent, 'id' | 'timestamp' | 'processed' | 'metadata'>): Promise<void> {
    const fullEvent: ForgeEvent = {
      ...event,
      id: generateId(),
      timestamp: new Date().toISOString(),
      processed: false,
      metadata: {
        version: '1.0',
        correlationId: generateCorrelationId(),
      },
    };

    // Deduplication check
    const dedupKey = `${event.source}:${event.type}:${JSON.stringify(event.data)}`;
    if (this.processedEvents.has(dedupKey)) {
      this.emit('event:deduplicated', fullEvent);
      return;
    }

    this.processedEvents.add(dedupKey);
    setTimeout(() => this.processedEvents.delete(dedupKey), this.config.deduplicationWindow);

    this.eventHistory.push(fullEvent);
    this.emit('event:published', fullEvent);

    await this.routeEvent(fullEvent);
  }

  subscribe(
    eventType: string,
    handler: EventHandler,
    options: { filter?: (event: ForgeEvent) => boolean; priority?: number } = {},
  ): string {
    const subscription: EventSubscription = {
      id: generateId(),
      eventType,
      handler,
      filter: options.filter,
      priority: options.priority || 0,
      enabled: true,
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription.id;
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  private async routeEvent(event: ForgeEvent): Promise<void> {
    const matchingSubscriptions = Array.from(this.subscriptions.values())
      .filter((sub) => {
        if (!sub.enabled) return false;
        if (sub.eventType !== '*' && sub.eventType !== event.type) return false;
        if (sub.filter && !sub.filter(event)) return false;
        return true;
      })
      .sort((a, b) => b.priority - a.priority);

    for (const subscription of matchingSubscriptions) {
      try {
        await subscription.handler(event);
        event.processed = true;
        this.emit('event:processed', { event, subscriptionId: subscription.id });
      } catch (error) {
        this.emit('event:handler-error', {
          event,
          subscriptionId: subscription.id,
          error: (error as Error).message,
        });

        if (this.config.maxRetries > 0) {
          await this.retryHandler(subscription, event);
        } else {
          this.addToDeadLetterQueue(event);
        }
      }
    }

    if (!event.processed) {
      this.addToDeadLetterQueue(event);
    }
  }

  private async retryHandler(subscription: EventSubscription, event: ForgeEvent): Promise<void> {
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        await subscription.handler(event);
        event.processed = true;
        return;
      } catch {
        continue;
      }
    }
    this.addToDeadLetterQueue(event);
  }

  private addToDeadLetterQueue(event: ForgeEvent): void {
    this.deadLetterQueue.push(event);
    if (this.deadLetterQueue.length > this.config.deadLetterQueueSize) {
      this.deadLetterQueue.shift();
    }
    this.emit('event:dead-letter', event);
  }

  getEventHistory(limit = 100): ForgeEvent[] {
    return this.eventHistory.slice(-limit);
  }

  getDeadLetterQueue(): ForgeEvent[] {
    return [...this.deadLetterQueue];
  }

  getStats(): {
    totalPublished: number;
    totalProcessed: number;
    totalDeadLetter: number;
    activeSubscriptions: number;
  } {
    return {
      totalPublished: this.eventHistory.length,
      totalProcessed: this.eventHistory.filter((e) => e.processed).length,
      totalDeadLetter: this.deadLetterQueue.length,
      activeSubscriptions: Array.from(this.subscriptions.values()).filter((s) => s.enabled).length,
    };
  }
}

// ---------------------------------------------------------------------------
// Event Types - Standard Forge Events
// ---------------------------------------------------------------------------

export const EVENT_TYPES = {
  // Workflow events
  WORKFLOW_CREATED: 'workflow.created',
  WORKFLOW_UPDATED: 'workflow.updated',
  WORKFLOW_DELETED: 'workflow.deleted',
  WORKFLOW_EXECUTED: 'workflow.executed',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
  WORKFLOW_PAUSED: 'workflow.paused',
  WORKFLOW_RESUMED: 'workflow.resumed',

  // Execution events
  EXECUTION_STARTED: 'execution.started',
  EXECUTION_COMPLETED: 'execution.completed',
  EXECUTION_FAILED: 'execution.failed',
  EXECUTION_CANCELLED: 'execution.cancelled',
  EXECUTION_TIMEOUT: 'execution.timeout',
  EXECUTION_WAITING_APPROVAL: 'execution.waiting-approval',

  // Node events
  NODE_EXECUTED: 'node.executed',
  NODE_FAILED: 'node.failed',
  NODE_SKIPPED: 'node.skipped',

  // AI events
  AI_DECISION_MADE: 'ai.decision.made',
  AI_DECISION_ACCEPTED: 'ai.decision.accepted',
  AI_DECISION_REJECTED: 'ai.decision.rejected',
  AI_WORKFLOW_GENERATED: 'ai.workflow.generated',
  AI_OPTIMIZATION_SUGGESTED: 'ai.optimization.suggested',

  // Connector events
  CONNECTOR_CONNECTED: 'connector.connected',
  CONNECTOR_DISCONNECTED: 'connector.disconnected',
  CONNECTOR_ERROR: 'connector.error',
  CONNECTOR_ACTION_EXECUTED: 'connector.action.executed',

  // Approval events
  APPROVAL_REQUESTED: 'approval.requested',
  APPROVAL_GRANTED: 'approval.granted',
  APPROVAL_DENIED: 'approval.denied',
  APPROVAL_EXPIRED: 'approval.expired',
  APPROVAL_DELEGATED: 'approval.delegated',

  // Threat events
  THREAT_DETECTED: 'threat.detected',
  THREAT_CONTAINED: 'threat.contained',
  THREAT_ESCALATED: 'threat.escalated',
  IOC_BLOCKED: 'ioc.blocked',
  ASSET_ISOLATED: 'asset.isolated',

  // System events
  SYSTEM_HEALTH_CHECK: 'system.health.check',
  SYSTEM_ALERT: 'system.alert',
  SYSTEM_METRIC: 'system.metric',
  SECRET_ROTATED: 'secret.rotated',
  INTEGRATION_SYNCED: 'integration.synced',

  // User events
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_ACTION: 'user.action',
} as const;
