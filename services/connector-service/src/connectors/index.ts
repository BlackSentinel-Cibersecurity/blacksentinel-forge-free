// ============================================================================
// BlackSentinel Forge - Base Connector SDK
// ============================================================================

import {
  Connector,
  ConnectorAction,
  ConnectorEvent,
  ConnectorInstance,
  ConnectorParameter,
} from '@blacksentinel/shared';
import { EventEmitter } from 'events';

export interface ConnectorContext {
  instance: ConnectorInstance;
  secrets: Record<string, string>;
  config: Record<string, unknown>;
}

export abstract class BaseConnector extends EventEmitter {
  abstract metadata: Connector;

  protected context: ConnectorContext;

  constructor(context: ConnectorContext) {
    super();
    this.context = context;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract healthCheck(): Promise<boolean>;

  async executeAction(
    actionId: string,
    parameters: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const action = this.metadata.actions.find((a) => a.id === actionId);
    if (!action) {
      throw new Error(`Action not found: ${actionId}`);
    }

    this.validateParameters(action, parameters);

    try {
      const result = await this.performAction(actionId, parameters);
      this.emit('action:executed', { actionId, parameters, result });
      return result;
    } catch (error) {
      this.emit('action:failed', { actionId, parameters, error: (error as Error).message });
      throw error;
    }
  }

  protected abstract performAction(
    actionId: string,
    parameters: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;

  protected validateParameters(action: ConnectorAction, parameters: Record<string, unknown>): void {
    for (const param of action.parameters) {
      if (param.required && !(param.name in parameters)) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }
    }
  }

  protected getSecret(name: string): string {
    const value = this.context.secrets[name];
    if (!value) {
      throw new Error(`Secret not found: ${name}`);
    }
    return value;
  }

  protected getConfig<T = unknown>(key: string): T {
    return this.context.config[key] as T;
  }
}

// ---------------------------------------------------------------------------
// Connector Registry
// ---------------------------------------------------------------------------

export class ConnectorRegistry {
  private connectors: Map<string, typeof BaseConnector> = new Map();
  private instances: Map<string, BaseConnector> = new Map();

  register(connectorClass: typeof BaseConnector): void {
    const temp = new (connectorClass as new (ctx: ConnectorContext) => BaseConnector)({
      instance: {} as ConnectorInstance,
      secrets: {},
      config: {},
    });
    this.connectors.set(temp.metadata.id, connectorClass);
  }

  async createInstance(
    connectorId: string,
    context: ConnectorContext,
  ): Promise<BaseConnector> {
    const ConnectorClass = this.connectors.get(connectorId);
    if (!ConnectorClass) {
      throw new Error(`Connector not found: ${connectorId}`);
    }

    const instance = new ConnectorClass(context);
    this.instances.set(context.instance.id, instance);
    return instance;
  }

  getInstance(instanceId: string): BaseConnector | undefined {
    return this.instances.get(instanceId);
  }

  removeInstance(instanceId: string): void {
    this.instances.delete(instanceId);
  }

  listAvailable(): string[] {
    return Array.from(this.connectors.keys());
  }

  listInstances(): string[] {
    return Array.from(this.instances.keys());
  }
}

// ---------------------------------------------------------------------------
// Built-in Connectors (Stubs)
// ---------------------------------------------------------------------------

export class AWSCloudConnector extends BaseConnector {
  metadata: Connector = {
    id: 'aws-cloud',
    name: 'AWS Cloud',
    description: 'Amazon Web Services integration',
    version: '1.0.0',
    category: 'cloud',
    icon: 'aws',
    color: '#FF9900',
    author: 'BlackSentinel',
    actions: [
      {
        id: 'ec2-isolate',
        name: 'Isolate EC2 Instance',
        description: 'Apply isolation security group to an EC2 instance',
        parameters: [
          { name: 'instanceId', type: 'string', description: 'EC2 instance ID', required: true },
          { name: 'region', type: 'string', description: 'AWS region', required: true },
        ],
        returnType: 'object',
        requiredPermissions: ['ec2:ModifyInstanceAttribute'],
        timeout: 30000,
      },
      {
        id: 's3-block-public',
        name: 'Block Public S3 Access',
        description: 'Remove public access from an S3 bucket',
        parameters: [
          { name: 'bucketName', type: 'string', description: 'S3 bucket name', required: true },
        ],
        returnType: 'object',
        requiredPermissions: ['s3:PutBucketPublicAccessBlock'],
        timeout: 15000,
      },
    ],
    events: [
      { id: 'cloudtrail-event', name: 'CloudTrail Event', description: 'AWS CloudTrail events', schema: {} },
      { id: 'guardduty-finding', name: 'GuardDuty Finding', description: 'GuardDuty findings', schema: {} },
    ],
    config: { authType: 'api-key' },
    status: 'active',
    rating: 4.8,
    installCount: 15000,
    documentation: 'https://docs.blacksentinel.com/connectors/aws',
  };

  async connect(): Promise<void> {
    // Validate AWS credentials
    this.getSecret('aws-access-key-id');
    this.getSecret('aws-secret-access-key');
  }

  async disconnect(): Promise<void> {}

  async healthCheck(): Promise<boolean> {
    return true;
  }

  protected async performAction(
    actionId: string,
    parameters: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    switch (actionId) {
      case 'ec2-isolate':
        return { success: true, instanceId: parameters.instanceId, status: 'isolated' };
      case 's3-block-public':
        return { success: true, bucket: parameters.bucketName, publicAccessBlocked: true };
      default:
        throw new Error(`Unknown action: ${actionId}`);
    }
  }
}

export class CrowdStrikeEDRConnector extends BaseConnector {
  metadata: Connector = {
    id: 'crowdstrike-edr',
    name: 'CrowdStrike Falcon',
    description: 'CrowdStrike EDR integration',
    version: '1.0.0',
    category: 'edr',
    icon: 'crowdstrike',
    color: '#E42527',
    author: 'BlackSentinel',
    actions: [
      {
        id: 'host-isolate',
        name: 'Isolate Host',
        description: 'Network isolate a CrowdStrike managed endpoint',
        parameters: [
          { name: 'hostId', type: 'string', description: 'CrowdStrike host ID', required: true },
        ],
        returnType: 'object',
        requiredPermissions: ['hostgroups:write'],
        timeout: 30000,
      },
      {
        id: 'host-unisolate',
        name: 'Unisolate Host',
        description: 'Remove network isolation from a host',
        parameters: [
          { name: 'hostId', type: 'string', description: 'CrowdStrike host ID', required: true },
        ],
        returnType: 'object',
        requiredPermissions: ['hostgroups:write'],
        timeout: 30000,
      },
      {
        id: 'search-detections',
        name: 'Search Detections',
        description: 'Search for detections matching criteria',
        parameters: [
          { name: 'filter', type: 'string', description: 'FQL filter string', required: false },
          { name: 'limit', type: 'number', description: 'Max results', required: false },
        ],
        returnType: 'array',
        requiredPermissions: ['detections:read'],
        timeout: 15000,
      },
    ],
    events: [
      { id: 'detection', name: 'Detection', description: 'New detection event', schema: {} },
      { id: 'incident', name: 'Incident', description: 'Incident created/updated', schema: {} },
    ],
    config: { authType: 'bearer' },
    status: 'active',
    rating: 4.9,
    installCount: 22000,
    documentation: 'https://docs.blacksentinel.com/connectors/crowdstrike',
  };

  async connect(): Promise<void> {
    this.getSecret('crowdstrike-client-id');
    this.getSecret('crowdstrike-client-secret');
  }

  async disconnect(): Promise<void> {}

  async healthCheck(): Promise<boolean> {
    return true;
  }

  protected async performAction(
    actionId: string,
    parameters: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    switch (actionId) {
      case 'host-isolate':
        return { success: true, hostId: parameters.hostId, status: 'isolated' };
      case 'host-unisolate':
        return { success: true, hostId: parameters.hostId, status: 'unisolated' };
      case 'search-detections':
        return { detections: [], total: 0 };
      default:
        throw new Error(`Unknown action: ${actionId}`);
    }
  }
}

export class ServiceNowConnector extends BaseConnector {
  metadata: Connector = {
    id: 'servicenow',
    name: 'ServiceNow',
    description: 'ServiceNow ITSM integration',
    version: '1.0.0',
    category: 'ticketing',
    icon: 'servicenow',
    color: '#62D84E',
    author: 'BlackSentinel',
    actions: [
      {
        id: 'create-incident',
        name: 'Create Incident',
        description: 'Create a new incident in ServiceNow',
        parameters: [
          { name: 'shortDescription', type: 'string', description: 'Incident title', required: true },
          { name: 'description', type: 'string', description: 'Incident description', required: true },
          { name: 'priority', type: 'number', description: 'Priority (1-5)', required: true },
          { name: 'assignmentGroup', type: 'string', description: 'Assignment group', required: false },
        ],
        returnType: 'object',
        requiredPermissions: ['incident:create'],
        timeout: 15000,
      },
      {
        id: 'update-incident',
        name: 'Update Incident',
        description: 'Update an existing incident',
        parameters: [
          { name: 'incidentId', type: 'string', description: 'Incident sys_id', required: true },
          { name: 'state', type: 'number', description: 'New state', required: false },
          { name: 'notes', type: 'string', description: 'Work notes', required: false },
        ],
        returnType: 'object',
        requiredPermissions: ['incident:write'],
        timeout: 15000,
      },
    ],
    events: [
      { id: 'incident-created', name: 'Incident Created', description: 'New incident', schema: {} },
      { id: 'incident-updated', name: 'Incident Updated', description: 'Incident state changed', schema: {} },
    ],
    config: { authType: 'basic' },
    status: 'active',
    rating: 4.5,
    installCount: 18000,
    documentation: 'https://docs.blacksentinel.com/connectors/servicenow',
  };

  async connect(): Promise<void> {
    this.getSecret('servicenow-instance');
    this.getSecret('servicenow-username');
    this.getSecret('servicenow-password');
  }

  async disconnect(): Promise<void> {}

  async healthCheck(): Promise<boolean> {
    return true;
  }

  protected async performAction(
    actionId: string,
    parameters: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    switch (actionId) {
      case 'create-incident':
        return { success: true, incidentId: `INC${Date.now()}`, number: `INC${Date.now()}` };
      case 'update-incident':
        return { success: true, incidentId: parameters.incidentId };
      default:
        throw new Error(`Unknown action: ${actionId}`);
    }
  }
}

export class SlackConnector extends BaseConnector {
  metadata: Connector = {
    id: 'slack',
    name: 'Slack',
    description: 'Slack messaging integration',
    version: '1.0.0',
    category: 'communication',
    icon: 'slack',
    color: '#4A154B',
    author: 'BlackSentinel',
    actions: [
      {
        id: 'send-message',
        name: 'Send Message',
        description: 'Send a message to a Slack channel',
        parameters: [
          { name: 'channel', type: 'string', description: 'Channel name or ID', required: true },
          { name: 'message', type: 'string', description: 'Message text', required: true },
          { name: 'blocks', type: 'array', description: 'Block Kit blocks', required: false },
        ],
        returnType: 'object',
        requiredPermissions: ['chat:write'],
        timeout: 10000,
      },
      {
        id: 'send-approval-request',
        name: 'Send Approval Request',
        description: 'Send an interactive approval request',
        parameters: [
          { name: 'channel', type: 'string', description: 'Channel name or ID', required: true },
          { name: 'title', type: 'string', description: 'Request title', required: true },
          { name: 'description', type: 'string', description: 'Request description', required: true },
          { name: 'approvers', type: 'array', description: 'User IDs to approve', required: true },
        ],
        returnType: 'object',
        requiredPermissions: ['chat:write', 'actions:write'],
        timeout: 10000,
      },
    ],
    events: [
      { id: 'message', name: 'Message', description: 'New message in channel', schema: {} },
      { id: 'reaction', name: 'Reaction', description: 'Reaction added', schema: {} },
    ],
    config: { authType: 'bearer' },
    status: 'active',
    rating: 4.7,
    installCount: 30000,
    documentation: 'https://docs.blacksentinel.com/connectors/slack',
  };

  async connect(): Promise<void> {
    this.getSecret('slack-bot-token');
  }

  async disconnect(): Promise<void> {}

  async healthCheck(): Promise<boolean> {
    return true;
  }

  protected async performAction(
    actionId: string,
    parameters: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    switch (actionId) {
      case 'send-message':
        return { success: true, channel: parameters.channel, timestamp: Date.now() };
      case 'send-approval-request':
        return { success: true, channel: parameters.channel, ts: Date.now() };
      default:
        throw new Error(`Unknown action: ${actionId}`);
    }
  }
}
