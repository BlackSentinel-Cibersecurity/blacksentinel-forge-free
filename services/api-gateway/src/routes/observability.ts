import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { generateId } from '@blacksentinel/shared';

const router = Router();

const metrics = {
  executions: { total: 148392, success: 145210, failed: 3182, rate: 97.85 },
  latency: { p50: 120, p95: 450, p99: 1200, avg: 185 },
  errors: { total: 3182, byType: { timeout: 892, validation: 645, auth: 421, external: 1224 } },
  period: { start: '2026-06-28T00:00:00Z', end: '2026-06-29T00:00:00Z' },
};

const traces = [
  { id: 'tr_1', operation: 'POST /api/v1/automations/execute', service: 'automation-engine', duration: 342, status: 'success', startedAt: '2026-06-28T10:00:00Z', spanCount: 5 },
  { id: 'tr_2', operation: 'GET /api/v1/secrets', service: 'api-gateway', duration: 45, status: 'success', startedAt: '2026-06-28T10:01:00Z', spanCount: 3 },
  { id: 'tr_3', operation: 'POST /api/v1/compliance/assess', service: 'compliance-engine', duration: 2300, status: 'error', startedAt: '2026-06-28T10:02:00Z', spanCount: 8 },
];

const traceDetail = {
  id: 'tr_1', operation: 'POST /api/v1/automations/execute', service: 'automation-engine', status: 'success',
  spans: [
    { id: 'sp_1', name: 'http.request', service: 'api-gateway', duration: 342, startTime: '2026-06-28T10:00:00Z', status: 'success' },
    { id: 'sp_2', name: 'auth.validate_token', service: 'auth-service', duration: 12, startTime: '2026-06-28T10:00:00.010Z', status: 'success' },
    { id: 'sp_3', name: 'db.query', service: 'data-layer', duration: 45, startTime: '2026-06-28T10:00:00.025Z', status: 'success' },
    { id: 'sp_4', name: 'automation.execute_steps', service: 'automation-engine', duration: 280, startTime: '2026-06-28T10:00:00.060Z', status: 'success' },
    { id: 'sp_5', name: 'cache.set', service: 'cache-service', duration: 5, startTime: '2026-06-28T10:00:00.340Z', status: 'success' },
  ],
};

const logs = [
  { id: 'lg_1', level: 'info', service: 'api-gateway', message: 'Request processed successfully', timestamp: '2026-06-28T10:00:00Z', traceId: 'tr_2' },
  { id: 'lg_2', level: 'error', service: 'compliance-engine', message: 'Assessment timeout: database connection pool exhausted', timestamp: '2026-06-28T10:02:03Z', traceId: 'tr_3' },
  { id: 'lg_3', level: 'warn', service: 'automation-engine', message: 'Step execution latency exceeded threshold (2s)', timestamp: '2026-06-28T10:00:01Z', traceId: 'tr_1' },
];

const alerts = [
  { id: 'al_1', title: 'High error rate on compliance-engine', severity: 'critical', service: 'compliance-engine', triggeredAt: '2026-06-28T10:05:00Z', acknowledged: false },
  { id: 'al_2', title: 'Memory usage above 85% on automation-engine', severity: 'warning', service: 'automation-engine', triggeredAt: '2026-06-28T09:50:00Z', acknowledged: false },
  { id: 'al_3', title: 'Database connection pool nearing limit', severity: 'warning', service: 'data-layer', triggeredAt: '2026-06-28T09:45:00Z', acknowledged: true },
];

const health = [
  { service: 'api-gateway', status: 'healthy', uptime: '30d 14h', version: '2.4.1', lastCheck: '2026-06-28T10:10:00Z' },
  { service: 'automation-engine', status: 'healthy', uptime: '30d 14h', version: '1.8.3', lastCheck: '2026-06-28T10:10:00Z' },
  { service: 'compliance-engine', status: 'degraded', uptime: '15d 2h', version: '1.2.0', lastCheck: '2026-06-28T10:10:00Z' },
  { service: 'data-layer', status: 'healthy', uptime: '30d 14h', version: '3.1.2', lastCheck: '2026-06-28T10:10:00Z' },
  { service: 'auth-service', status: 'healthy', uptime: '30d 14h', version: '1.5.7', lastCheck: '2026-06-28T10:10:00Z' },
];

router.get('/metrics', requirePermission('observability', 'read'), (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: metrics, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get metrics', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/traces', requirePermission('observability', 'read'), (req: Request, res: Response) => {
  try {
    const { service, status } = req.query;
    let filtered = traces;
    if (service) filtered = filtered.filter(t => t.service === service);
    if (status) filtered = filtered.filter(t => t.status === status);
    res.json({ success: true, data: filtered, meta: { total: filtered.length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to list traces', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/traces/:id', requirePermission('observability', 'read'), (req: Request, res: Response) => {
  try {
    if (req.params.id !== traceDetail.id) {
      res.status(404).json({ success: false, error: 'Trace not found', timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    res.json({ success: true, data: traceDetail, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get trace', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/logs', requirePermission('observability', 'read'), (req: Request, res: Response) => {
  try {
    const { level, service } = req.query;
    let filtered = logs;
    if (level) filtered = filtered.filter(l => l.level === level);
    if (service) filtered = filtered.filter(l => l.service === service);
    res.json({ success: true, data: filtered, meta: { total: filtered.length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to query logs', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/alerts', requirePermission('observability', 'read'), (req: Request, res: Response) => {
  try {
    const active = alerts.filter(a => !a.acknowledged);
    res.json({ success: true, data: active, meta: { total: active.length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to list alerts', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.post('/alerts/:id/acknowledge', requirePermission('observability', 'write'), (req: Request, res: Response) => {
  try {
    const alert = alerts.find(a => a.id === req.params.id);
    if (!alert) { res.status(404).json({ success: false, error: 'Alert not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    alert.acknowledged = true;
    res.json({ success: true, data: alert, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to acknowledge alert', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/health/services', requirePermission('observability', 'read'), (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: health, meta: { total: health.length, healthy: health.filter(h => h.status === 'healthy').length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get health', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

export function createObservabilityRoutes(): Router {
  return router;
}
