// ============================================================================
// BlackSentinel Forge - Workflow Engine Core
// ============================================================================

import {
  Workflow,
  WorkflowExecution,
  WorkflowNode,
  WorkflowEdge,
  ExecutionStatus,
  NodeExecution,
  ExecutionError,
  generateId,
  generateCorrelationId,
} from '@blacksentinel/shared';
import { EventEmitter } from 'events';
// state/, executors/, and queue/ live at src/ (siblings of engine/), not inside
// engine/ itself — these were pointing one level too shallow (TS2307), a
// pre-existing bug that made this file unresolvable, not something introduced here.
import { StateMachine } from '../state';
import { NodeExecutorRegistry } from '../executors';
import { WorkflowQueue } from '../queue';

export interface EngineConfig {
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
}

export class WorkflowEngine extends EventEmitter {
  private stateMachine: StateMachine;
  private executorRegistry: NodeExecutorRegistry;
  private queue: WorkflowQueue;
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private config: EngineConfig;

  constructor(config: EngineConfig) {
    super();
    this.config = config;
    this.stateMachine = new StateMachine();
    this.executorRegistry = new NodeExecutorRegistry();
    this.queue = new WorkflowQueue({
      maxConcurrent: config.maxConcurrentExecutions,
    });
  }

  async execute(
    workflow: Workflow,
    triggerData: Record<string, unknown>,
    options: {
      userId?: string;
      correlationId?: string;
      parentExecutionId?: string;
    } = {},
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: generateId(),
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      tenantId: workflow.tenantId,
      status: 'pending',
      trigger: 'manual',
      triggerData,
      inputData: triggerData,
      nodeExecutions: [],
      startedAt: new Date().toISOString(),
      correlationId: options.correlationId || generateCorrelationId(),
      parentExecutionId: options.parentExecutionId,
      tags: [],
      executedBy: options.userId || 'system',
    };

    this.activeExecutions.set(execution.id, execution);
    this.emit('execution:started', execution);

    try {
      await this.runExecution(workflow, execution);
    } catch (error) {
      execution.status = 'failed';
      execution.error = {
        code: 'ENGINE_ERROR',
        message: (error as Error).message,
        stack: (error as Error).stack,
        timestamp: new Date().toISOString(),
        recoverable: false,
      };
      this.emit('execution:failed', execution);
    }

    execution.completedAt = new Date().toISOString();
    execution.duration = new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime();

    this.activeExecutions.delete(execution.id);
    this.emit('execution:completed', execution);

    return execution;
  }

  private async runExecution(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
    execution.status = 'running';

    const startNode = workflow.nodes.find((n) => n.type === 'start');
    if (!startNode) {
      throw new Error('Workflow has no start node');
    }

    const executionOrder = this.topologicalSort(workflow.nodes, workflow.edges);

    for (const nodeId of executionOrder) {
      // TS narrows `execution.status` to the 'running' literal from the assignment
      // above and doesn't know cancelExecution()/pauseExecution() can mutate it
      // externally between the `await`s in this loop — this check is real and
      // needed (a caller cancelling mid-run must stop the loop), so cast away the
      // stale narrowing instead of removing the check (TS2367 is a false positive
      // here; a plain `: ExecutionStatus`-annotated local still inherits the same
      // narrowing via TS's aliased-condition analysis, so it needs the `as` cast).
      const currentStatus = execution.status as ExecutionStatus;
      if (currentStatus === 'cancelled' || currentStatus === 'failed') {
        break;
      }

      const node = workflow.nodes.find((n) => n.id === nodeId);
      if (!node || node.type === 'start' || node.type === 'end') {
        continue;
      }

      const nodeExecution = await this.executeNode(workflow, execution, node);
      execution.nodeExecutions.push(nodeExecution);

      if (nodeExecution.status === 'failed' && node.data.onError === 'stop') {
        execution.status = 'failed';
        execution.error = nodeExecution.error;
        break;
      }

      if (nodeExecution.status === 'waiting-approval') {
        execution.status = 'waiting-approval';
        this.emit('execution:waiting-approval', { execution, nodeExecution });
        return;
      }

      this.emit('node:completed', { executionId: execution.id, nodeExecution });
    }

    if (execution.status === 'running') {
      execution.status = 'completed';
    }
  }

  private async executeNode(
    workflow: Workflow,
    execution: WorkflowExecution,
    node: WorkflowNode,
  ): Promise<NodeExecution> {
    const nodeExecution: NodeExecution = {
      nodeId: node.id,
      nodeType: node.type,
      status: 'running',
      input: this.resolveInputs(workflow, node, execution),
      startedAt: new Date().toISOString(),
      retryCount: 0,
    };

    try {
      const executor = this.executorRegistry.get(node.type);
      if (!executor) {
        throw new Error(`No executor found for node type: ${node.type}`);
      }

      const result = await this.executeWithRetry(
        () => executor.execute(node, nodeExecution.input, execution),
        node.data.retryPolicy || {
          maxRetries: this.config.maxRetries,
          backoffMs: this.config.backoffMs,
          backoffMultiplier: this.config.backoffMultiplier,
          maxBackoffMs: 30000,
        },
      );

      nodeExecution.output = result;
      nodeExecution.status = 'completed';
      nodeExecution.completedAt = new Date().toISOString();
      nodeExecution.duration =
        new Date(nodeExecution.completedAt).getTime() - new Date(nodeExecution.startedAt).getTime();
    } catch (error) {
      nodeExecution.status = 'failed';
      nodeExecution.error = {
        code: 'NODE_EXECUTION_FAILED',
        message: (error as Error).message,
        stack: (error as Error).stack,
        nodeId: node.id,
        timestamp: new Date().toISOString(),
        recoverable: true,
      };
    }

    return nodeExecution;
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryPolicy: { maxRetries: number; backoffMs: number; backoffMultiplier: number; maxBackoffMs: number },
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retryPolicy.maxRetries) {
          const delay = Math.min(
            retryPolicy.backoffMs * Math.pow(retryPolicy.backoffMultiplier, attempt),
            retryPolicy.maxBackoffMs,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  private resolveInputs(
    workflow: Workflow,
    node: WorkflowNode,
    execution: WorkflowExecution,
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    for (const inputPort of node.inputs) {
      const incomingEdge = workflow.edges.find(
        (e) => e.target === node.id && e.targetHandle === inputPort.id,
      );

      if (incomingEdge) {
        const sourceNodeExec = execution.nodeExecutions.find(
          (ne) => ne.nodeId === incomingEdge.source,
        );
        if (sourceNodeExec?.output) {
          inputs[inputPort.label] = sourceNodeExec.output;
        }
      } else {
        inputs[inputPort.label] = execution.inputData[inputPort.label];
      }
    }

    return inputs;
  }

  private topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of nodes) {
      adjList.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const edge of edges) {
      adjList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      sorted.push(nodeId);
      for (const neighbor of adjList.get(nodeId) || []) {
        const newDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    return sorted;
  }

  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      this.emit('execution:paused', execution);
    }
  }

  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      this.emit('execution:resumed', execution);
    }
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.status = 'cancelled';
      this.emit('execution:cancelled', execution);
      this.activeExecutions.delete(executionId);
    }
  }

  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }
}
