import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { generateId } from '@blacksentinel/shared';
import { editionConfig } from '../config/edition';

const router = Router();

const items = [
  { id: 'mp_1', name: 'AWS CloudTrail Sync', author: 'BlackSentinel', category: 'cloud-security', description: 'Sync AWS CloudTrail events into Forge for real-time compliance monitoring', version: '2.1.0', installs: 1847, rating: 4.8, featured: true, pricing: 'free', icon: 'aws-cloudtrail.png' },
  { id: 'mp_2', name: 'Slack Alert Bridge', author: 'BlackSentinel', category: 'notifications', description: 'Forward Forge alerts and compliance notifications to Slack channels', version: '3.0.1', installs: 3201, rating: 4.9, featured: true, pricing: 'free', icon: 'slack-bridge.png' },
  { id: 'mp_3', name: 'PCI-DSS Auto-Scanner', author: 'SecurityLabs', category: 'compliance', description: 'Automated PCI-DSS control scanning with evidence collection', version: '1.4.2', installs: 562, rating: 4.5, featured: false, pricing: '$49/mo', icon: 'pci-scanner.png' },
  { id: 'mp_4', name: 'Terraform Drift Detector', author: 'InfraGard', category: 'infrastructure', description: 'Detect infrastructure drift between Terraform state and actual resources', version: '1.0.0', installs: 891, rating: 4.3, featured: true, pricing: 'free', icon: 'terraform-drift.png' },
  { id: 'mp_5', name: 'Secret Rotation Scheduler', author: 'VaultWorks', category: 'secrets', description: 'Advanced secret rotation policies with approval workflows', version: '2.3.0', installs: 1102, rating: 4.7, featured: false, pricing: '$29/mo', icon: 'secret-rotate.png' },
  { id: 'mp_6', name: 'ISO 27001 Evidence Bot', author: 'ComplianceAI', category: 'compliance', description: 'Auto-collect and organize evidence for ISO 27001 audits', version: '1.2.0', installs: 423, rating: 4.6, featured: false, pricing: '$39/mo', icon: 'iso-bot.png' },
];

const reviews = [
  { id: 'rev_1', itemId: 'mp_1', userId: 'usr_2', userName: 'Priya Sharma', rating: 5, comment: 'Excellent integration. CloudTrail events flow in seamlessly.', createdAt: '2026-06-15T10:00:00Z' },
  { id: 'rev_2', itemId: 'mp_1', userId: 'usr_3', userName: 'Jordan Blake', rating: 4, comment: 'Works well but initial setup docs could be clearer.', createdAt: '2026-06-20T14:00:00Z' },
  { id: 'rev_3', itemId: 'mp_2', userId: 'usr_1', userName: 'Marcus Chen', rating: 5, comment: 'Our team lives in Slack, this is indispensable.', createdAt: '2026-05-10T09:00:00Z' },
  { id: 'rev_4', itemId: 'mp_3', userId: 'usr_3', userName: 'Jordan Blake', rating: 4, comment: 'Solid scanner, saves hours of manual control checks.', createdAt: '2026-06-01T11:00:00Z' },
];

const installations = new Map<string, { installedAt: string; status: string }>();

const categories = [
  { id: 'cat_1', name: 'cloud-security', label: 'Cloud Security', count: 12 },
  { id: 'cat_2', name: 'notifications', label: 'Notifications', count: 8 },
  { id: 'cat_3', name: 'compliance', label: 'Compliance', count: 15 },
  { id: 'cat_4', name: 'infrastructure', label: 'Infrastructure', count: 10 },
  { id: 'cat_5', name: 'secrets', label: 'Secrets', count: 6 },
  { id: 'cat_6', name: 'monitoring', label: 'Monitoring', count: 9 },
];

router.get('/', requirePermission('marketplace', 'read'), (req: Request, res: Response) => {
  try {
    const { search, category, pricing } = req.query;
    let filtered = items;
    if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes((search as string).toLowerCase()));
    if (category) filtered = filtered.filter(i => i.category === category);
    if (pricing) filtered = filtered.filter(i => i.pricing === pricing);
    res.json({ success: true, data: filtered, meta: { total: filtered.length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to list marketplace items', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/featured', requirePermission('marketplace', 'read'), (req: Request, res: Response) => {
  try {
    const featured = items.filter(i => i.featured);
    res.json({ success: true, data: featured, meta: { total: featured.length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get featured items', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/categories', requirePermission('marketplace', 'read'), (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: categories, meta: { total: categories.length }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get categories', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/:id', requirePermission('marketplace', 'read'), (req: Request, res: Response) => {
  try {
    const item = items.find(i => i.id === req.params.id);
    if (!item) { res.status(404).json({ success: false, error: 'Item not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    const itemReviews = reviews.filter(r => r.itemId === item.id);
    const installed = installations.has(item.id);
    res.json({ success: true, data: { ...item, reviews: itemReviews, installed }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get item', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.post('/:id/install', requirePermission('marketplace', 'write'), (req: Request, res: Response) => {
  try {
    const item = items.find(i => i.id === req.params.id);
    if (!item) { res.status(404).json({ success: false, error: 'Item not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    if (!editionConfig.limits.paidMarketplaceItemsEnabled && item.pricing !== 'free') {
      res.status(403).json({ success: false, error: `'${item.name}' requires a paid plan (${item.pricing}). Upgrade to install it.`, timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    if (installations.has(item.id)) {
      res.status(409).json({ success: false, error: 'Item already installed', timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    installations.set(item.id, { installedAt: new Date().toISOString(), status: 'active' });
    item.installs++;
    res.json({ success: true, data: { itemId: item.id, name: item.name, installedAt: new Date().toISOString(), status: 'active' }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to install item', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.post('/:id/uninstall', requirePermission('marketplace', 'write'), (req: Request, res: Response) => {
  try {
    const item = items.find(i => i.id === req.params.id);
    if (!item) { res.status(404).json({ success: false, error: 'Item not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    if (!installations.has(item.id)) {
      res.status(404).json({ success: false, error: 'Item not installed', timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    installations.delete(item.id);
    item.installs = Math.max(0, item.installs - 1);
    res.json({ success: true, data: { itemId: item.id, name: item.name, uninstalledAt: new Date().toISOString() }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to uninstall item', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/:id/reviews', requirePermission('marketplace', 'read'), (req: Request, res: Response) => {
  try {
    const item = items.find(i => i.id === req.params.id);
    if (!item) { res.status(404).json({ success: false, error: 'Item not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    const itemReviews = reviews.filter(r => r.itemId === item.id);
    res.json({ success: true, data: itemReviews, meta: { total: itemReviews.length, avgRating: item.rating }, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get reviews', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.post('/:id/reviews', requirePermission('marketplace', 'write'), (req: Request, res: Response) => {
  try {
    const item = items.find(i => i.id === req.params.id);
    if (!item) { res.status(404).json({ success: false, error: 'Item not found', timestamp: new Date().toISOString(), traceId: generateId() }); return; }
    const { rating, comment, userName } = req.body;
    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: 'Rating must be between 1 and 5', timestamp: new Date().toISOString(), traceId: generateId() });
      return;
    }
    const review = { id: `rev_${generateId()}`, itemId: item.id, userId: 'usr_current', userName: userName || 'Anonymous', rating, comment, createdAt: new Date().toISOString() };
    reviews.push(review);
    const itemReviews = reviews.filter(r => r.itemId === item.id);
    item.rating = Math.round((itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length) * 10) / 10;
    res.status(201).json({ success: true, data: review, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to submit review', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

export function createMarketplaceRoutes(): Router {
  return router;
}
