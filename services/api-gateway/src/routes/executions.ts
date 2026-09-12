import { Router, Request, Response } from 'express';
import { generateId } from '@blacksentinel/shared';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: string;
  timestamp: string;
  traceId: string;
}

const mockExecutions = [
  { id: 'exec-001', workflowId: 'wf-001', status: 'running', startedAt: '2026-06-26T10:00:00Z', tenantId: 'tenant-001' },
  { id: 'exec-002', workflowId: 'wf-002', status: 'completed', startedAt: '2026-06-26T09:00:00Z', completedAt: '2026-06-26T09:05:00Z', tenantId: 'tenant-001' },
  { id: 'exec-003', workflowId: 'wf-001', status: 'failed', startedAt: '2026-06-26T08:00:00Z', error: 'Timeout exceeded', tenantId: 'tenant-002' },
];

const mockLogs = [
  { id: 'log-001', executionId: 'exec-001', level: 'info', message: 'Workflow started', timestamp: '2026-06-26T10:00:00Z' },
  { id: 'log-002', executionId: 'exec-001', level: 'info', message: 'Step 1 completed', timestamp: '2026-06-26T10:00:05Z' },
  { id: 'log-003', executionId: 'exec-001', level: 'warn', message: 'Step 2 retried', timestamp: '2026-06-26T10:00:10Z' },
];

const mockMetrics = {
  totalExecutions: 156,
  running: 3,
  completed: 140,
  failed: 13,
  avgDurationMs: 12500,
  successRate: 0.897,
};

export function createExecutionRoutes(): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    try {
      const { status, workflowId, limit = '50', offset = '0' } = req.query;
      let filtered = [...mockExecutions];

      if (status) filtered = filtered.filter(e => e.status === status);
      if (workflowId) filtered = filtered.filter(e => e.workflowId === workflowId);

      const response: ApiResponse = {
        success: true,
        data: filtered,
        meta: { total: filtered.length, limit: Number(limit), offset: Number(offset) },
        timestamp: new Date().toISOString(),
        traceId: generateId(),
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch executions', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/:id', (req: Request, res: Response) => {
    try {
      const execution = mockExecutions.find(e => e.id === req.params.id);
      if (!execution) {
        res.status(404).json({ success: false, error: 'Execution not found', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      res.json({ success: true, data: execution, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch execution', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.post('/:id/cancel', (req: Request, res: Response) => {
    try {
      const execution = mockExecutions.find(e => e.id === req.params.id);
      if (!execution) {
        res.status(404).json({ success: false, error: 'Execution not found', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      if (execution.status !== 'running') {
        res.status(400).json({ success: false, error: 'Can only cancel running executions', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      execution.status = 'cancelled';
      res.json({ success: true, data: { ...execution, cancelledAt: new Date().toISOString() }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to cancel execution', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/:id/logs', (req: Request, res: Response) => {
    try {
      const logs = mockLogs.filter(l => l.executionId === req.params.id);
      res.json({ success: true, data: logs, meta: { total: logs.length }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch logs', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/:id/metrics', (req: Request, res: Response) => {
    try {
      res.json({ success: true, data: mockMetrics, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch metrics', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  return router;
}
