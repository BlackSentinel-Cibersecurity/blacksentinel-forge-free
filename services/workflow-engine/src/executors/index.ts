// ============================================================================
// BlackSentinel Forge - Node Executor Registry
// ============================================================================

import {
  WorkflowNode,
  NodeType,
  WorkflowExecution,
} from '@blacksentinel/shared';
import { EventEmitter } from 'events';

export interface NodeExecutor {
  type: NodeType;
  execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
    execution: WorkflowExecution,
  ): Promise<Record<string, unknown>>;
  validate?(node: WorkflowNode): string[];
}

export class NodeExecutorRegistry extends EventEmitter {
  private executors: Map<NodeType, NodeExecutor> = new Map();

  register(executor: NodeExecutor): void {
    this.executors.set(executor.type, executor);
  }

  get(type: NodeType): NodeExecutor | undefined {
    return this.executors.get(type);
  }

  has(type: NodeType): boolean {
    return this.executors.has(type);
  }

  list(): NodeType[] {
    return Array.from(this.executors.keys());
  }
}

// ---------------------------------------------------------------------------
// Built-in Node Executors
// ---------------------------------------------------------------------------

export class ConditionExecutor implements NodeExecutor {
  type: NodeType = 'condition';

  async execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { conditions = [] } = node.data.config;
    const results = (conditions as Record<string, unknown>[]).map((cond: Record<string, unknown>) => {
      const value = input[cond.field as string];
      switch (cond.operator) {
        case 'equals': return value === cond.value;
        case 'not_equals': return value !== cond.value;
        case 'greater_than': return Number(value) > Number(cond.value);
        case 'less_than': return Number(value) < Number(cond.value);
        case 'contains': return String(value).includes(String(cond.value));
        case 'regex': return new RegExp(cond.value as string).test(String(value));
        default: return false;
      }
    });

    return {
      results,
      branch: results.every(Boolean) ? 'true' : 'false',
    };
  }
}

export class TransformExecutor implements NodeExecutor {
  type: NodeType = 'transform';

  async execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { transformations = [] } = node.data.config;
    const result = { ...input };

    for (const transform of transformations as Record<string, unknown>[]) {
      switch (transform.type) {
        case 'map': {
          const { sourceField, targetField, mapping } = transform;
          result[targetField as string] = mapping
            ? (mapping as Record<string, unknown>)[input[sourceField as string] as string]
            : input[sourceField as string];
          break;
        }
        case 'filter': {
          const { field, condition } = transform;
          const value = input[field as string];
          if (condition === 'not_empty' && (!value || value === '')) {
            throw new Error(`Field ${field as string} is empty`);
          }
          break;
        }
        case 'merge': {
          const { fields, targetField } = transform;
          result[targetField as string] = (fields as string[]).map((f) => input[f]).filter(Boolean);
          break;
        }
        case 'extract': {
          const { pattern, sourceField, targetField } = transform;
          const match = String(input[sourceField as string]).match(new RegExp(pattern as string));
          result[targetField as string] = match ? match[1] : null;
          break;
        }
      }
    }

    return result;
  }
}

export class DelayExecutor implements NodeExecutor {
  type: NodeType = 'delay';

  async execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { duration = 1000 } = node.data.config;
    await new Promise((resolve) => setTimeout(resolve, duration as number));
    return { ...input, delayed: true, delayDuration: duration };
  }
}

export class NotificationExecutor implements NodeExecutor {
  type: NodeType = 'notification';

  async execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { channel, template, recipients } = node.data.config;
    // In production, this would send actual notifications
    return {
      sent: true,
      channel,
      recipients,
      template,
      timestamp: new Date().toISOString(),
    };
  }
}

export class ApprovalExecutor implements NodeExecutor {
  type: NodeType = 'approval';

  async execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { approvalType = 'single', timeout = 3600000, requiredApprovers = 1 } = node.data.config;
    // This signals the engine to pause and wait for approval
    return {
      pending: true,
      approvalType,
      timeout,
      requiredApprovers,
      requestedAt: new Date().toISOString(),
    };
  }
}

export class ParallelExecutor implements NodeExecutor {
  type: NodeType = 'parallel';

  async execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { branches = [] } = node.data.config;
    const branchList = branches as unknown[];
    return {
      branchCount: branchList.length,
      branchInputs: branchList.map((_: unknown, index: number) => ({
        branchIndex: index,
        ...input,
      })),
    };
  }
}

export class LoopExecutor implements NodeExecutor {
  type: NodeType = 'loop';

  async execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { items, maxIterations = 100 } = node.data.config;
    const itemList = (items || input.items || []) as unknown[];
    const max = maxIterations as number;
    return {
      iterations: Math.min(itemList.length, max),
      items: itemList.slice(0, max),
      currentIndex: 0,
    };
  }
}

export class ErrorHandlerExecutor implements NodeExecutor {
  type: NodeType = 'error-handler';

  async execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { strategy = 'retry' } = node.data.config;
    const error = input.error as Record<string, unknown>;

    switch (strategy) {
      case 'retry':
        return { action: 'retry', error, attempt: (input.attempt as number || 0) + 1 };
      case 'skip':
        return { action: 'skip', error, skipped: true };
      case 'escalate':
        return { action: 'escalate', error, escalated: true };
      case 'fallback':
        return { action: 'fallback', error, fallbackValue: node.data.config.fallbackValue };
      default:
        return { action: 'stop', error };
    }
  }
}

export class WebhookExecutor implements NodeExecutor {
  type: NodeType = 'webhook';

  async execute(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { url, method = 'POST', headers = {} } = node.data.config;
    // In production, this would make actual HTTP calls
    return {
      called: true,
      url,
      method,
      response: { status: 200, body: 'ok' },
    };
  }
}

export function registerDefaultExecutors(registry: NodeExecutorRegistry): void {
  registry.register(new ConditionExecutor());
  registry.register(new TransformExecutor());
  registry.register(new DelayExecutor());
  registry.register(new NotificationExecutor());
  registry.register(new ApprovalExecutor());
  registry.register(new ParallelExecutor());
  registry.register(new LoopExecutor());
  registry.register(new ErrorHandlerExecutor());
  registry.register(new WebhookExecutor());
}
