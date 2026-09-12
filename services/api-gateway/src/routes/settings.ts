import { Router, Request, Response } from 'express';
import { requirePermission } from '../middleware/auth';
import { generateId } from '@blacksentinel/shared';

const router = Router();

const generalSettings = {
  organizationName: 'BlackSentinel Forge',
  defaultTimezone: 'America/New_York',
  dateFormat: 'YYYY-MM-DD',
  language: 'en',
  auditLogRetentionDays: 365,
  maxConcurrentExecutions: 50,
  allowPublicAutomations: false,
};

const securitySettings = {
  mfa: { enabled: true, enforceForAll: true, methods: ['totp', 'webauthn'] },
  sso: { enabled: false, provider: null, callbackUrl: null },
  session: { timeoutMinutes: 60, maxConcurrentSessions: 5, refreshTokenExpiryDays: 30 },
  passwordPolicy: { minLength: 12, requireUppercase: true, requireNumbers: true, requireSymbols: true, maxAgeDays: 90 },
  ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
  apiRateLimit: { requestsPerMinute: 120, burstLimit: 20 },
};

const notificationSettings = {
  email: { enabled: true, alerts: true, reports: true, complianceUpdates: true, teamChanges: true },
  slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/services/T***', channel: '#security-alerts' },
  pagerduty: { enabled: false, integrationKey: null },
  webhook: { enabled: true, url: 'https://internal.black sentinel.io/webhooks/events', secret: 'whsec_***' },
};

const integrationSettings = {
  github: { enabled: true, org: 'blacksentinel', repos: ['forge', 'shield', 'sentinel-agent'], installationToken: 'ghs_***' },
  jira: { enabled: true, instance: 'blacksentinel.atlassian.net', project: 'SEC', apiToken: '***' },
  datadog: { enabled: false, apiKey: null, site: 'datadoghq.com' },
  slack: { enabled: true, botToken: 'xoxb-***', workspace: 'BlackSentinel' },
};

router.get('/general', requirePermission('settings', 'read'), (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: generalSettings, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get general settings', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.put('/general', requirePermission('settings', 'write'), (req: Request, res: Response) => {
  try {
    const updated = { ...generalSettings, ...req.body, updatedAt: new Date().toISOString() };
    Object.assign(generalSettings, updated);
    res.json({ success: true, data: generalSettings, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update general settings', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/security', requirePermission('settings', 'read'), (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: securitySettings, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get security settings', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.put('/security', requirePermission('settings', 'security'), (req: Request, res: Response) => {
  try {
    if (req.body.mfa) securitySettings.mfa = { ...securitySettings.mfa, ...req.body.mfa };
    if (req.body.sso) securitySettings.sso = { ...securitySettings.sso, ...req.body.sso };
    if (req.body.session) securitySettings.session = { ...securitySettings.session, ...req.body.session };
    if (req.body.passwordPolicy) securitySettings.passwordPolicy = { ...securitySettings.passwordPolicy, ...req.body.passwordPolicy };
    if (req.body.ipWhitelist) securitySettings.ipWhitelist = req.body.ipWhitelist;
    if (req.body.apiRateLimit) securitySettings.apiRateLimit = { ...securitySettings.apiRateLimit, ...req.body.apiRateLimit };
    res.json({ success: true, data: securitySettings, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update security settings', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/notifications', requirePermission('settings', 'read'), (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: notificationSettings, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get notification settings', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.put('/notifications', requirePermission('settings', 'write'), (req: Request, res: Response) => {
  try {
    if (req.body.email) notificationSettings.email = { ...notificationSettings.email, ...req.body.email };
    if (req.body.slack) notificationSettings.slack = { ...notificationSettings.slack, ...req.body.slack };
    if (req.body.pagerduty) notificationSettings.pagerduty = { ...notificationSettings.pagerduty, ...req.body.pagerduty };
    if (req.body.webhook) notificationSettings.webhook = { ...notificationSettings.webhook, ...req.body.webhook };
    res.json({ success: true, data: notificationSettings, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update notification settings', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.get('/integrations', requirePermission('settings', 'read'), (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: integrationSettings, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get integration settings', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

router.put('/integrations', requirePermission('settings', 'write'), (req: Request, res: Response) => {
  try {
    if (req.body.github) integrationSettings.github = { ...integrationSettings.github, ...req.body.github };
    if (req.body.jira) integrationSettings.jira = { ...integrationSettings.jira, ...req.body.jira };
    if (req.body.datadog) integrationSettings.datadog = { ...integrationSettings.datadog, ...req.body.datadog };
    if (req.body.slack) integrationSettings.slack = { ...integrationSettings.slack, ...req.body.slack };
    res.json({ success: true, data: integrationSettings, timestamp: new Date().toISOString(), traceId: generateId() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update integration settings', timestamp: new Date().toISOString(), traceId: generateId() });
  }
});

export function createSettingsRoutes(): Router {
  return router;
}
