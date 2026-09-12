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

const mockEvents = [
  { id: 'evt-001', type: 'workflow.completed', source: 'exec-001', payload: { workflowId: 'wf-001' }, timestamp: '2026-06-26T10:05:00Z' },
  { id: 'evt-002', type: 'connector.disconnected', source: 'conn-003', payload: { reason: 'timeout' }, timestamp: '2026-06-26T10:00:00Z' },
  { id: 'evt-003', type: 'approval.requested', source: 'apr-001', payload: { workflowId: 'wf-001' }, timestamp: '2026-06-26T10:00:00Z' },
];

const mockSubscriptions = [
  { id: 'sub-001', eventType: 'workflow.*', webhookUrl: 'https://example.com/webhook', active: true, createdAt: '2026-06-25T10:00:00Z' },
  { id: 'sub-002', type: 'connector.disconnected', webhookUrl: 'https://example.com/alerts', active: true, createdAt: '2026-06-24T10:00:00Z' },
];

const mockDeadLetter = [
  { id: 'dl-001', event: mockEvents[1], error: 'Webhook delivery failed: timeout', attempts: 3, lastAttempt: '2026-06-26T10:01:00Z' },
];

export function createEventRoutes(): Router {
  const router = Router();

  router.post('/publish', (req: Request, res: Response) => {
    try {
      const { type, source, payload } = req.body;
      if (!type || !payload) {
        res.status(400).json({ success: false, error: 'Type and payload are required', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      const event = {
        id: generateId(),
        type,
        source: source || 'api-gateway',
        payload,
        publishedAt: new Date().toISOString(),
      };
      res.json({ success: true, data: event, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to publish event', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/history', (req: Request, res: Response) => {
    try {
      const { type, source, limit = '50' } = req.query;
      let filtered = [...mockEvents];
      if (type) filtered = filtered.filter(e => e.type === type);
      if (source) filtered = filtered.filter(e => e.source === source);

      res.json({ success: true, data: filtered, meta: { total: filtered.length, limit: Number(limit) }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch event history', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/subscriptions', (req: Request, res: Response) => {
    try {
      res.json({ success: true, data: mockSubscriptions, meta: { total: mockSubscriptions.length }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch subscriptions', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.post('/subscribe', (req: Request, res: Response) => {
    try {
      const { eventType, webhookUrl, filters } = req.body;
      if (!eventType || !webhookUrl) {
        res.status(400).json({ success: false, error: 'Event type and webhook URL are required', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      const subscription = {
        id: generateId(),
        eventType,
        webhookUrl,
        filters: filters || {},
        active: true,
        createdAt: new Date().toISOString(),
      };
      res.json({ success: true, data: subscription, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create subscription', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/dead-letter', (req: Request, res: Response) => {
    try {
      res.json({ success: true, data: mockDeadLetter, meta: { total: mockDeadLetter.length }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch dead letter queue', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  return router;
}
