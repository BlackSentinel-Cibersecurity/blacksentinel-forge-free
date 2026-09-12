import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { generateId } from '@blacksentinel/shared';

const router = Router();

const secrets = [
  { id: 'sec_1', name: 'DATABASE_URL', value: 'postgresql://***', environment: 'production', createdAt: '2025-11-01T08:00:00Z', updatedAt: '2025-12-15T14:30:00Z', rotationIntervalDays: 90 },
  { id: 'sec_2', name: 'AWS_SECRET_KEY', value: 'wJalr***', environment: 'production', createdAt: '2025-10-20T10:00:00Z', updatedAt: '2026-01-10T09:15:00Z', rotationIntervalDays: 60 },
  { id: 'sec_3', name: 'STRIPE_API_KEY', value: 'sk_live_***', environment: 'production', createdAt: '2026-02-05T12:00:00Z', updatedAt: '2026-02-05T12:00:00Z', rotationIntervalDays: 120 },
  { id: 'sec_4', name: 'REDIS_PASSWORD', value: 'r3d1s***', environment: 'staging', createdAt: '2026-03-01T16:00:00Z', updatedAt: '2026-03-01T16:00:00Z', rotationIntervalDays: 30 },
];

const accessLogs = [
  { id: 'log_1', secretId: 'sec_1', accessedBy: 'user_1', action: 'read', timestamp: '2026-06-28T10:00:00Z', ip: '192.168.1.100' },
  { id: 'log_2', secretId: 'sec_1', accessedBy: 'service_worker', action: 'decrypt', timestamp: '2026-06-28T11:30:00Z', ip: '10.0.0.5' },
  { id: 'log_3', secretId: 'sec_2', accessedBy: 'user_2', action: 'rotate', timestamp: '2026-06-27T14:00:00Z', ip: '192.168.1.105' },
];

function mask(value: string): string {
  if (value.length <= 6) return '***';
  return value.slice(0, 3) + '***' + value.slice(-3);
}

router.get('/', requirePermission('secrets', 'read'), (req: Request, res: Response) => {
  try {
    const { environment } = req.query;
    let filtered = secrets;
    if (environment) filtered = secrets.filter(s => s.environment === environment);

    const masked = filtered.map(s => ({ ...s, value: mask(s.value) }));

    res.json({
      success: true,
      data: masked,
      meta: { total: masked.length, page: 1, limit: 20 },
      timestamp: new Date().toISOString(),
      traceId: generateId(),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to list secrets', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/:id', requirePermission('secrets', 'read'), (req: Request, res: Response) => {
  try {
    const secret = secrets.find(s => s.id === req.params.id);
    if (!secret) {
      res.status(404).json({ success: false, error: 'Secret not found', timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    res.json({ success: true, data: { ...secret, value: mask(secret.value) }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get secret', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.post('/', requirePermission('secrets', 'write'), (req: Request, res: Response) => {
  try {
    const { name, value, environment, rotationIntervalDays } = req.body;
    const newSecret = {
      id: `sec_${generateId()}`,
      name,
      value: mask(value),
      environment: environment || 'production',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rotationIntervalDays: rotationIntervalDays || 90,
    };
    secrets.push(newSecret);
    res.status(201).json({ success: true, data: newSecret, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create secret', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.put('/:id', requirePermission('secrets', 'write'), (req: Request, res: Response) => {
  try {
    const idx = secrets.findIndex(s => s.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: 'Secret not found', timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    secrets[idx] = { ...secrets[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: { ...secrets[idx], value: mask(secrets[idx].value) }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update secret', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.delete('/:id', requirePermission('secrets', 'delete'), (req: Request, res: Response) => {
  try {
    const idx = secrets.findIndex(s => s.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: 'Secret not found', timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    secrets.splice(idx, 1);
    res.json({ success: true, data: { deleted: true }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete secret', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.post('/:id/rotate', requirePermission('secrets', 'rotate'), (req: Request, res: Response) => {
  try {
    const idx = secrets.findIndex(s => s.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: 'Secret not found', timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    secrets[idx] = { ...secrets[idx], updatedAt: new Date().toISOString() };
    res.json({ success: true, data: { ...secrets[idx], value: mask(secrets[idx].value), rotatedAt: new Date().toISOString() }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to rotate secret', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/:id/access-log', requirePermission('secrets', 'read'), (req: Request, res: Response) => {
  try {
    const logs = accessLogs.filter(l => l.secretId === req.params.id);
    res.json({ success: true, data: logs, meta: { total: logs.length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get access log', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

export function createSecretsRoutes(): Router {
  return router;
}
