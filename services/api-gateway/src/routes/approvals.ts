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

const mockApprovals = [
  { id: 'apr-001', workflowId: 'wf-001', executionId: 'exec-001', status: 'pending', requestedBy: 'user-001', requestedAt: '2026-06-26T10:00:00Z', description: 'Deploy to production environment' },
  { id: 'apr-002', workflowId: 'wf-002', executionId: 'exec-002', status: 'pending', requestedBy: 'user-002', requestedAt: '2026-06-26T09:00:00Z', description: 'Scale up database replicas' },
  { id: 'apr-003', workflowId: 'wf-001', executionId: 'exec-003', status: 'approved', requestedBy: 'user-001', approvedBy: 'admin-001', approvedAt: '2026-06-25T15:00:00Z', description: 'Update SSL certificates' },
];

export function createApprovalRoutes(): Router {
  const router = Router();

  router.get('/pending', (req: Request, res: Response) => {
    try {
      const { assignedTo } = req.query;
      let pending = mockApprovals.filter(a => a.status === 'pending');
      if (assignedTo) pending = pending.filter(a => (a as any).assignedTo === assignedTo);

      res.json({ success: true, data: pending, meta: { total: pending.length }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch pending approvals', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.post('/:id/approve', (req: Request, res: Response) => {
    try {
      const approval = mockApprovals.find(a => a.id === req.params.id);
      if (!approval) {
        res.status(404).json({ success: false, error: 'Approval not found', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      if (approval.status !== 'pending') {
        res.status(400).json({ success: false, error: 'Approval is not pending', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      approval.status = 'approved';
      (approval as any).approvedBy = req.body.approverId || 'admin-001';
      (approval as any).approvedAt = new Date().toISOString();
      (approval as any).comment = req.body.comment;

      res.json({ success: true, data: approval, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to approve', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.post('/:id/reject', (req: Request, res: Response) => {
    try {
      const approval = mockApprovals.find(a => a.id === req.params.id);
      if (!approval) {
        res.status(404).json({ success: false, error: 'Approval not found', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      if (approval.status !== 'pending') {
        res.status(400).json({ success: false, error: 'Approval is not pending', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      approval.status = 'rejected';
      (approval as any).rejectedBy = req.body.approverId || 'admin-001';
      (approval as any).rejectedAt = new Date().toISOString();
      (approval as any).reason = req.body.reason;

      res.json({ success: true, data: approval, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to reject', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.post('/:id/delegate', (req: Request, res: Response) => {
    try {
      const approval = mockApprovals.find(a => a.id === req.params.id);
      if (!approval) {
        res.status(404).json({ success: false, error: 'Approval not found', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      const { delegateTo, reason } = req.body;
      if (!delegateTo) {
        res.status(400).json({ success: false, error: 'Delegate target is required', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      (approval as any).delegatedTo = delegateTo;
      (approval as any).delegatedAt = new Date().toISOString();
      (approval as any).delegationReason = reason;

      res.json({ success: true, data: approval, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delegate', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/history', (req: Request, res: Response) => {
    try {
      const { status, limit = '50' } = req.query;
      let history = [...mockApprovals];
      if (status) history = history.filter(a => a.status === status);

      res.json({ success: true, data: history, meta: { total: history.length, limit: Number(limit) }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch history', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  return router;
}
