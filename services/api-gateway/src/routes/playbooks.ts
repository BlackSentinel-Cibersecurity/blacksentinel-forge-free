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

const mockPlaybooks = [
  { id: 'pb-001', name: 'Incident Response', description: 'Automated incident detection and response', category: 'security', version: '1.2.0', author: 'BlackSentinel', downloads: 1250, rating: 4.8 },
  { id: 'pb-002', name: 'CI/CD Pipeline', description: 'Standard CI/CD workflow for microservices', category: 'devops', version: '2.0.1', author: 'BlackSentinel', downloads: 3200, rating: 4.9 },
  { id: 'pb-003', name: 'Data Backup', description: 'Automated backup and restore procedures', category: 'operations', version: '1.0.5', author: 'Community', downloads: 890, rating: 4.5 },
  { id: 'pb-004', name: 'Threat Intelligence', description: 'AI-powered threat detection and analysis', category: 'security', version: '1.1.0', author: 'BlackSentinel', downloads: 2100, rating: 4.7 },
];

const mockCategories = [
  { id: 'security', name: 'Security', count: 12 },
  { id: 'devops', name: 'DevOps', count: 18 },
  { id: 'operations', name: 'Operations', count: 8 },
  { id: 'compliance', name: 'Compliance', count: 6 },
  { id: 'monitoring', name: 'Monitoring', count: 10 },
];

export function createPlaybookRoutes(): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    try {
      const { category, author, search } = req.query;
      let filtered = [...mockPlaybooks];
      if (category) filtered = filtered.filter(p => p.category === category);
      if (author) filtered = filtered.filter(p => p.author === author);
      if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes((search as string).toLowerCase()));

      res.json({ success: true, data: filtered, meta: { total: filtered.length }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch playbooks', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/categories', (req: Request, res: Response) => {
    try {
      res.json({ success: true, data: mockCategories, meta: { total: mockCategories.length }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch categories', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/featured', (req: Request, res: Response) => {
    try {
      const featured = mockPlaybooks.filter(p => p.rating >= 4.7);
      res.json({ success: true, data: featured, meta: { total: featured.length }, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch featured playbooks', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.get('/:id', (req: Request, res: Response) => {
    try {
      const playbook = mockPlaybooks.find(p => p.id === req.params.id);
      if (!playbook) {
        res.status(404).json({ success: false, error: 'Playbook not found', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      const detailed = {
        ...playbook,
        steps: [
          { id: 'step-1', name: 'Detection', description: 'Identify triggers', config: {} },
          { id: 'step-2', name: 'Analysis', description: 'Analyze severity', config: {} },
          { id: 'step-3', name: 'Response', description: 'Execute response actions', config: {} },
        ],
        requirements: ['connector-slack', 'connector-pagerduty'],
        changelog: [{ version: '1.2.0', date: '2026-06-20', changes: ['Added auto-scaling support'] }],
      };
      res.json({ success: true, data: detailed, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch playbook', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  router.post('/:id/install', (req: Request, res: Response) => {
    try {
      const playbook = mockPlaybooks.find(p => p.id === req.params.id);
      if (!playbook) {
        res.status(404).json({ success: false, error: 'Playbook not found', timestamp: new Date().toISOString(), traceId: generateId() });
        return;
      }
      const installation = {
        id: generateId(),
        playbookId: req.params.id,
        status: 'installed',
        installedAt: new Date().toISOString(),
        configuration: req.body.configuration || {},
      };
      res.json({ success: true, data: installation, timestamp: new Date().toISOString(), traceId: generateId() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to install playbook', timestamp: new Date().toISOString(), traceId: generateId() });
    }
  });

  return router;
}
