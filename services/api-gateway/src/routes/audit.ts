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

const mockAuditEntries = [
  { id: 'aud-001', action: 'workflow.created', resource: 'wf-001', userId: 'user-001', tenantId: 'tenant-001', details: { name: 'Deploy Pipeline' }, timestamp: '2026-06-26T10:00:00Z', ipAddress: '192.168.1.100' },
  { id: 'aud-002', action: 'connector.connected', resource: 'conn-001', userId: 'user-002', tenantId: 'tenant-001', details: { type: 'slack' }, timestamp: '2026-06-26T09:55:00Z', ipAddress: '192.168.1.101' },
  { id: 'aud-003', action: 'approval.approved', resource: 'apr-001', userId: 'admin-001', tenantId: 'tenant-001', details: { comment: 'Looks good' }, timestamp: '2026-06-26T09:50:00Z', ipAddress: '10.0.0.50' },
  { id: 'aud-004', action: 'user.login', resource: 'user-001', userId: 'user-001', tenantId: 'tenant-001', details: { method: 'sso' }, timestamp: '2026-06-26T09:45:00Z', ipAddress: '192.168.1.100' },
];

const mockStats = {
  totalEntries: 1245,
  entriesLast24h: 89,
  entriesLast7d: 567,
  topActions: [
    { action: 'user.login', count: 342 },
    { action: 'workflow.executed', count: 234 },
    { action: 'connector.connected', count: 123 },
  ],
  activeUsers: 15,
};

export function createAuditRoutes(): Router {
  const router = Router();

  router.get('/entries', (req: Request, res: Response) => {
    try {
      const { action, userId, resource, startDate, endDate, limit = '50', offset = '0' } = req.query;
      let filtered = [...mockAuditEntries];

      if (action) filtered = filtered.filter(e => e.action === action);
      if (userId) filtered = filtered.filter(e => e.userId === userId);
      if (resource) filtered = filtered.filter(e => e.resource === resource);
      if (startDate) filtered = filtered.filter(e => e.timestamp >= (startDate as string));
      if (endDate) filtered = filtered.filter(e => e.timestamp <= (endDate as string));

      res.json({
        success: true,
        data: filtered,
        meta: { total: filtered.length, limit: Number(limit), offset: Number(offset) },
        timestamp: new Date().toISOString(),
        traceId: generateId(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch audit entries', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/by-id/:id', (req: Request, res: Response) => {
    try {
      const entry = mockAuditEntries.find(e => e.id === req.params.id);
      if (!entry) {
        res.status(404).json({ success: false, error: 'Audit entry not found', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      res.json({ success: true, data: entry, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch audit entry', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/stats', (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      let stats = { ...mockStats };
      if (startDate || endDate) {
        stats = { ...stats, totalEntries: 450, entriesLast24h: 32 };
      }
      res.json({ success: true, data: stats, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch audit stats', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.post('/export', (req: Request, res: Response) => {
    try {
      const { format = 'csv', filters } = req.body;
      const validFormats = ['csv', 'json', 'pdf'];
      if (!validFormats.includes(format)) {
        res.status(400).json({ success: false, error: `Invalid format. Must be one of: ${validFormats.join(', ')}`, timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      const exportJob = {
        id: generateId(),
        format,
        filters: filters || {},
        status: 'processing',
        estimatedRows: mockAuditEntries.length,
        createdAt: new Date().toISOString(),
        downloadUrl: null,
      };
      res.json({ success: true, data: exportJob, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to export audit logs', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  return router;
}
