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

const mockStats = {
  totalWorkflows: 24,
  activeWorkflows: 12,
  totalExecutions: 156,
  successRate: 0.897,
  avgExecutionTime: 12500,
  activeConnectors: 5,
  pendingApprovals: 3,
  eventsLast24h: 342,
};

const mockWidgets = [
  { id: 'widget-001', type: 'chart', title: 'Execution Success Rate', config: { chartType: 'line', timeRange: '7d' }, position: { x: 0, y: 0, w: 6, h: 4 } },
  { id: 'widget-002', type: 'counter', title: 'Active Workflows', config: { value: 12, trend: '+2' }, position: { x: 6, y: 0, w: 3, h: 2 } },
  { id: 'widget-003', type: 'table', title: 'Recent Executions', config: { columns: ['id', 'status', 'duration'], limit: 10 }, position: { x: 0, y: 4, w: 12, h: 4 } },
];

const mockRealTimeMetrics = {
  activeConnections: 45,
  requestsPerSecond: 128,
  avgResponseTime: 45,
  errorRate: 0.02,
  cpuUsage: 0.65,
  memoryUsage: 0.72,
};

export function createDashboardRoutes(): Router {
  const router = Router();

  router.get('/stats', (req: Request, res: Response) => {
    try {
      res.json({ success: true, data: mockStats, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch stats', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/widgets', (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      let filtered = [...mockWidgets];
      if (type) filtered = filtered.filter(w => w.type === type);

      res.json({ success: true, data: filtered, meta: { total: filtered.length }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch widgets', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.post('/widget', (req: Request, res: Response) => {
    try {
      const { type, title, config, position } = req.body;
      if (!type || !title) {
        res.status(400).json({ success: false, error: 'Type and title are required', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      const widget = {
        id: generateId(),
        type,
        title,
        config: config || {},
        position: position || { x: 0, y: 0, w: 6, h: 4 },
        createdAt: new Date().toISOString(),
      };
      res.json({ success: true, data: widget, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create widget', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.put('/widget/:id', (req: Request, res: Response) => {
    try {
      const widget = mockWidgets.find(w => w.id === req.params.id);
      if (!widget) {
        res.status(404).json({ success: false, error: 'Widget not found', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      const updated = { ...widget, ...req.body, id: widget.id, updatedAt: new Date().toISOString() };
      res.json({ success: true, data: updated, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update widget', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/real-time-metrics', (req: Request, res: Response) => {
    try {
      res.json({ success: true, data: mockRealTimeMetrics, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch real-time metrics', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  return router;
}
