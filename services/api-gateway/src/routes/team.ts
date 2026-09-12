import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { generateId } from '@blacksentinel/shared';

const router = Router();

const members = [
  { id: 'usr_1', name: 'Marcus Chen', email: 'marcus@blacksentinel.io', role: 'admin', status: 'active', joinedAt: '2025-06-01T00:00:00Z', lastActive: '2026-06-28T10:00:00Z', permissions: ['secrets:read', 'secrets:write', 'compliance:read', 'compliance:write', 'team:manage'] },
  { id: 'usr_2', name: 'Priya Sharma', email: 'priya@blacksentinel.io', role: 'engineer', status: 'active', joinedAt: '2025-08-15T00:00:00Z', lastActive: '2026-06-28T09:30:00Z', permissions: ['secrets:read', 'compliance:read', 'observability:read'] },
  { id: 'usr_3', name: 'Jordan Blake', email: 'jordan@blacksentinel.io', role: 'auditor', status: 'active', joinedAt: '2026-01-10T00:00:00Z', lastActive: '2026-06-27T16:00:00Z', permissions: ['compliance:read', 'compliance:assess', 'observability:read'] },
  { id: 'usr_4', name: 'Aisha Patel', email: 'aisha@blacksentinel.io', role: 'engineer', status: 'invited', joinedAt: null, lastActive: null, permissions: ['secrets:read'] },
];

const activityLogs = [
  { id: 'act_1', userId: 'usr_1', action: 'secret.rotate', detail: 'Rotated AWS_SECRET_KEY', timestamp: '2026-06-28T10:00:00Z' },
  { id: 'act_2', userId: 'usr_1', action: 'team.invite', detail: 'Invited aisha@blacksentinel.io', timestamp: '2026-06-28T09:45:00Z' },
  { id: 'act_3', userId: 'usr_2', action: 'compliance.report.generate', detail: 'Generated SOC 2 Q1 report', timestamp: '2026-06-27T14:00:00Z' },
];

router.get('/', requirePermission('team', 'read'), (req: Request, res: Response) => {
  try {
    const { role, status } = req.query;
    let filtered = members;
    if (role) filtered = filtered.filter(m => m.role === role);
    if (status) filtered = filtered.filter(m => m.status === status);
    res.json({ success: true, data: filtered, meta: { total: filtered.length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to list members', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/:id', requirePermission('team', 'read'), (req: Request, res: Response) => {
  try {
    const member = members.find(m => m.id === req.params.id);
    if (!member) { res.status(404).json({ success: false, error: 'Member not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    res.json({ success: true, data: member, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get member', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.post('/', requirePermission('team', 'manage'), (req: Request, res: Response) => {
  try {
    const { email, name, role, permissions } = req.body;
    if (members.find(m => m.email === email)) {
      res.status(409).json({ success: false, error: 'Member already exists', timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    const newMember = {
      id: `usr_${generateId()}`,
      name,
      email,
      role: role || 'viewer',
      status: 'invited',
      joinedAt: null,
      lastActive: null,
      permissions: permissions || ['secrets:read'],
    };
    members.push(newMember);
    res.status(201).json({ success: true, data: newMember, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to invite member', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.put('/:id', requirePermission('team', 'manage'), (req: Request, res: Response) => {
  try {
    const idx = members.findIndex(m => m.id === req.params.id);
    if (idx === -1) { res.status(404).json({ success: false, error: 'Member not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    members[idx] = { ...members[idx], ...req.body };
    res.json({ success: true, data: members[idx], timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update member', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.delete('/:id', requirePermission('team', 'manage'), (req: Request, res: Response) => {
  try {
    const idx = members.findIndex(m => m.id === req.params.id);
    if (idx === -1) { res.status(404).json({ success: false, error: 'Member not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    const removed = members.splice(idx, 1)[0];
    res.json({ success: true, data: { removed: removed.id, email: removed.email }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove member', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/:id/activity', requirePermission('team', 'read'), (req: Request, res: Response) => {
  try {
    const member = members.find(m => m.id === req.params.id);
    if (!member) { res.status(404).json({ success: false, error: 'Member not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    const logs = activityLogs.filter(l => l.userId === req.params.id);
    res.json({ success: true, data: logs, meta: { total: logs.length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get activity', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.post('/:id/delegate', requirePermission('team', 'manage'), (req: Request, res: Response) => {
  try {
    const member = members.find(m => m.id === req.params.id);
    if (!member) { res.status(404).json({ success: false, error: 'Member not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    const { delegateTo } = req.body;
    const delegate = members.find(m => m.id === delegateTo);
    if (!delegate) { res.status(400).json({ success: false, error: 'Delegate not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    res.json({ success: true, data: { delegatedBy: member.id, delegateTo: delegate.id, permissions: member.permissions, effectiveUntil: new Date(Date.now() + 7 * 86400000).toISOString() }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delegate', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

export function createTeamRoutes(): Router {
  return router;
}
