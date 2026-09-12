// ============================================================================
// BlackSentinel Forge - Database Seed Script
// ============================================================================

import prisma from './database';
import { hashPassword } from '../middleware/auth';

async function seed() {
  try {
    logger.info('Seeding database...');

    // Create default tenant
    const tenant = await prisma.tenant.create({
      data: {
        id: 'tenant_default',
        name: 'BlackSentinel Demo',
        plan: 'enterprise',
        settings: {
          timezone: 'UTC',
          locale: 'en',
          maxConcurrentWorkflows: 100,
          defaultApprovalTimeout: 3600000,
          ssoEnabled: false,
          auditRetentionDays: 365,
        },
        quotas: {
          maxWorkflows: 1000,
          maxExecutionsPerMonth: 100000,
          maxConnectors: 100,
          maxUsers: 50,
          maxSecrets: 200,
          storageGb: 100,
        },
      },
    });
    logger.info({ tenantId: tenant.id }, 'Default tenant created');

    // Create admin user
    const adminPassword = await hashPassword('admin123456');
    const admin = await prisma.user.create({
      data: {
        id: 'usr_admin',
        tenantId: tenant.id,
        email: 'admin@blacksentinel.com',
        name: 'Forge Admin',
        passwordHash: adminPassword,
        role: 'admin',
        permissions: [
          { resource: '*', actions: ['read', 'write', 'execute', 'delete', 'approve'] },
        ],
        mfaEnabled: false,
        status: 'active',
      },
    });
    logger.info({ userId: admin.id }, 'Admin user created');

    // Create sample workflows
    const phishingWorkflow = await prisma.workflow.create({
      data: {
        tenantId: tenant.id,
        name: 'Phishing Auto-Response',
        description: 'Automated phishing detection and containment workflow',
        status: 'active',
        category: 'phishing',
        riskLevel: 'medium',
        tags: ['phishing', 'auto-response', 'containment'],
        createdBy: admin.id,
        nodes: [
          { id: 'n1', type: 'trigger', position: { x: 100, y: 200 }, data: { label: 'Email Alert', config: { eventSource: 'email' } } },
          { id: 'n2', type: 'ai-decision', position: { x: 300, y: 200 }, data: { label: 'AI Analysis', config: {} } },
          { id: 'n3', type: 'condition', position: { x: 500, y: 200 }, data: { label: 'Severity Check', config: { conditions: [{ field: 'severity', operator: 'greater_than', value: 7 }] } } },
          { id: 'n4', type: 'isolation', position: { x: 700, y: 100 }, data: { label: 'Isolate Endpoint', config: {} } },
          { id: 'n5', type: 'action', position: { x: 700, y: 300 }, data: { label: 'Block IOCs', config: {} } },
          { id: 'n6', type: 'notification', position: { x: 900, y: 200 }, data: { label: 'Notify SOC', config: {} } },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2' },
          { id: 'e2', source: 'n2', target: 'n3' },
          { id: 'e3', source: 'n3', target: 'n4', sourceHandle: 'true', label: 'High' },
          { id: 'e4', source: 'n3', target: 'n5', sourceHandle: 'false', label: 'Low' },
          { id: 'e5', source: 'n4', target: 'n6' },
          { id: 'e6', source: 'n5', target: 'n6' },
        ],
      },
    });

    const ransomWorkflow = await prisma.workflow.create({
      data: {
        tenantId: tenant.id,
        name: 'Ransomware Containment',
        description: 'Emergency ransomware isolation and recovery protocol',
        status: 'active',
        category: 'ransomware',
        riskLevel: 'critical',
        tags: ['ransomware', 'emergency', 'isolation'],
        createdBy: admin.id,
        nodes: [
          { id: 'n1', type: 'trigger', position: { x: 100, y: 200 }, data: { label: 'EDR Alert', config: {} } },
          { id: 'n2', type: 'ai-decision', position: { x: 300, y: 200 }, data: { label: 'Risk Assessment', config: {} } },
          { id: 'n3', type: 'parallel', position: { x: 500, y: 200 }, data: { label: 'Parallel Response', config: { branches: ['isolate', 'backup', 'notify'] } } },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2' },
          { id: 'e2', source: 'n2', target: 'n3' },
        ],
      },
    });

    logger.info({ count: 2 }, 'Sample workflows created');

    // Create sample connectors
    await prisma.connectorInstance.createMany({
      data: [
        {
          tenantId: tenant.id,
          connectorId: 'crowdstrike-edr',
          name: 'CrowdStrike Falcon',
          config: { baseUrl: 'https://api.crowdstrike.com' },
          secrets: ['crowdstrike-client-id', 'crowdstrike-client-secret'],
          status: 'connected',
        },
        {
          tenantId: tenant.id,
          connectorId: 'servicenow',
          name: 'ServiceNow ITSM',
          config: { instance: 'dev12345' },
          secrets: ['servicenow-username', 'servicenow-password'],
          status: 'connected',
        },
        {
          tenantId: tenant.id,
          connectorId: 'slack',
          name: 'Slack Workspace',
          config: { workspace: 'blacksentinel' },
          secrets: ['slack-bot-token'],
          status: 'connected',
        },
      ],
    });
    logger.info({ count: 3 }, 'Sample connectors created');

    // Create sample playbooks
    await prisma.playbook.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: 'Phishing Response Kit',
          description: 'Complete phishing investigation and response automation',
          category: 'phishing',
          difficulty: 'intermediate',
          tags: ['phishing', 'email', 'ioc'],
          author: 'BlackSentinel',
          version: '2.1.0',
          rating: 4.8,
          installCount: 1247,
          isOfficial: true,
          dependencies: ['crowdstrike-edr', 'servicenow', 'slack'],
          risks: ['False positive blocking', 'User disruption'],
          validations: ['Test with sandbox emails', 'Verify IOC extraction'],
        },
        {
          tenantId: tenant.id,
          name: 'Ransomware Emergency',
          description: 'Full ransomware containment and recovery automation',
          category: 'ransomware',
          difficulty: 'advanced',
          tags: ['ransomware', 'emergency', 'containment'],
          author: 'BlackSentinel',
          version: '3.0.0',
          rating: 4.9,
          installCount: 892,
          isOfficial: true,
          dependencies: ['crowdstrike-edr', 'aws-cloud', 'servicenow'],
          risks: ['Business disruption', 'Data loss'],
          validations: ['Test in isolated environment', 'Verify backup integrity'],
        },
      ],
    });
    logger.info({ count: 2 }, 'Sample playbooks created');

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error({ err: error }, 'Seed failed');
    process.exit(1);
  }
}

// Simple logger for seed script
const logger = {
  info: (obj: unknown, msg?: string) => console.log('[SEED]', msg || '', obj),
  error: (obj: unknown, msg?: string) => console.error('[SEED]', msg || '', obj),
};

seed();
