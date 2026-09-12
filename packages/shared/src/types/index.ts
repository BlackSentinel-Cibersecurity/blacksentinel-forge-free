// ============================================================================
// BlackSentinel Forge - Core Type Definitions
// ============================================================================

// ---------------------------------------------------------------------------
// Identity & Auth
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  mfaEnabled: boolean;
  ssoProvider?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  tenantId: string;
  status: 'active' | 'disabled' | 'locked';
}

export type UserRole = 'admin' | 'operator' | 'analyst' | 'viewer' | 'approver';

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'execute' | 'delete' | 'approve')[];
  conditions?: Record<string, unknown>;
}

export interface Tenant {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: TenantSettings;
  quotas: TenantQuotas;
  createdAt: string;
}

export interface TenantSettings {
  timezone: string;
  locale: string;
  maxConcurrentWorkflows: number;
  defaultApprovalTimeout: number;
  allowedIpRanges?: string[];
  ssoEnabled: boolean;
  auditRetentionDays: number;
}

export interface TenantQuotas {
  maxWorkflows: number;
  maxExecutionsPerMonth: number;
  maxConnectors: number;
  maxUsers: number;
  maxSecrets: number;
  storageGb: number;
}

// ---------------------------------------------------------------------------
// Workflow Core
// ---------------------------------------------------------------------------

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived' | 'deleted';

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  version: number;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  metadata: WorkflowMetadata;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: WorkflowCategory;
  riskLevel: RiskLevel;
  estimatedDuration?: number;
  requiredApprovals: number;
  isTemplate: boolean;
  folderId?: string;
}

export type WorkflowCategory =
  | 'phishing'
  | 'ransomware'
  | 'malware'
  | 'insider-threat'
  | 'vulnerability'
  | 'iam'
  | 'cloud'
  | 'active-directory'
  | 'kubernetes'
  | 'devsecops'
  | 'soc'
  | 'incident-response'
  | 'compliance'
  | 'custom';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

// `Workflow.metadata` referenced this type without it ever being defined anywhere
// in the codebase (confirmed via repo-wide search) — a pre-existing compile-breaking
// bug (TS2304). No code in workflow-engine/ai-engine reads or writes specific
// properties on it, so there is no behavioral contract to infer a concrete shape
// from. Defined as an open bag, matching the same pattern already used for
// `ApprovalRequest.metadata` and `NodeData.config` elsewhere in this file, rather
// than inventing fields with no evidence they're needed.
export type WorkflowMetadata = Record<string, unknown>;

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  inputs: NodePort[];
  outputs: NodePort[];
  metadata: NodeMetadata;
}

export type NodeType =
  | 'trigger'
  | 'condition'
  | 'action'
  | 'transform'
  | 'approval'
  | 'parallel'
  | 'loop'
  | 'error-handler'
  | 'ai-decision'
  | 'human-input'
  | 'sub-workflow'
  | 'connector'
  | 'delay'
  | 'webhook'
  | 'notification'
  | 'ticket'
  | 'isolation'
  | 'lookup'
  | 'aggregate'
  | 'start'
  | 'end';

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'regex' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface NodeData {
  label: string;
  description?: string;
  config: Record<string, unknown>;
  connector?: string;
  action?: string;
  conditions?: Condition[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
  onError?: 'continue' | 'stop' | 'retry' | 'branch';
}

export interface NodePort {
  id: string;
  type: 'input' | 'output';
  dataType: string;
  label: string;
  required: boolean;
  connected: boolean;
}

export interface NodeMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  version: number;
  executionCount: number;
  avgDuration: number;
  errorRate: number;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  condition?: Condition;
  animated?: boolean;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: unknown;
  required: boolean;
  secret: boolean;
  description?: string;
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  config: TriggerConfig;
  enabled: boolean;
}

export type TriggerType =
  | 'manual'
  | 'webhook'
  | 'schedule'
  | 'event'
  | 'siem-alert'
  | 'edr-event'
  | 'vulnerability-detected'
  | 'iam-change'
  | 'cloud-event'
  | 'kubernetes-event'
  | 'api-call'
  | 'email'
  | 'slack-message'
  | 'threshold'
  | 'composite';

export interface TriggerConfig {
  webhookPath?: string;
  cron?: string;
  eventSource?: string;
  eventType?: string;
  conditions?: Condition[];
  deduplicationWindow?: number;
  maxTriggerRate?: number;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'waiting-approval'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout'
  | 'error';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: number;
  tenantId: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  triggerData: Record<string, unknown>;
  inputData: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  nodeExecutions: NodeExecution[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: ExecutionError;
  correlationId: string;
  parentExecutionId?: string;
  tags: string[];
  executedBy: string | 'system';
  retryOf?: string;
}

export interface NodeExecution {
  nodeId: string;
  nodeType: NodeType;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: ExecutionError;
  retryCount: number;
  aiDecision?: AIDecisionRecord;
  approvalRequest?: ApprovalRequest;
}

export interface ExecutionError {
  code: string;
  message: string;
  stack?: string;
  nodeId?: string;
  timestamp: string;
  recoverable: boolean;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// AI Decision Engine
// ---------------------------------------------------------------------------

export interface AIDecision {
  id: string;
  tenantId: string;
  type: AIDecisionType;
  context: DecisionContext;
  recommendation: DecisionRecommendation;
  confidence: number;
  explanation: string;
  riskScore: number;
  alternatives: DecisionAlternative[];
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

export type AIDecisionType =
  | 'execute-automation'
  | 'skip-automation'
  | 'request-approval'
  | 'escalate'
  | 'isolate-asset'
  | 'block-indicator'
  | 'notify-team'
  | 'create-ticket'
  | 'modify-workflow'
  | 'optimize-path'
  | 'risk-assessment';

export interface DecisionContext {
  incidentId?: string;
  alertId?: string;
  affectedAssets: string[];
  threatIndicators: string[];
  historicalData: Record<string, unknown>;
  currentRiskScore: number;
  timeOfDay: string;
  organizationalImpact: number;
  blastRadius: number;
}

export interface DecisionRecommendation {
  action: string;
  workflowId?: string;
  parameters: Record<string, unknown>;
  expectedOutcome: string;
  estimatedDuration: number;
  requiredResources: string[];
}

export interface DecisionAlternative {
  action: string;
  pros: string[];
  cons: string[];
  riskLevel: RiskLevel;
}

export interface AIDecisionRecord {
  decisionId: string;
  type: AIDecisionType;
  confidence: number;
  explanation: string;
  accepted: boolean;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Connectors
// ---------------------------------------------------------------------------

export type ConnectorCategory =
  | 'cloud'
  | 'siem'
  | 'edr'
  | 'vulnerability'
  | 'iam'
  | 'ticketing'
  | 'communication'
  | 'devops'
  | 'container'
  | 'network'
  | 'email'
  | 'endpoint'
  | 'compliance'
  | 'threat-intelligence'
  | 'custom';

export interface Connector {
  id: string;
  name: string;
  description: string;
  version: string;
  category: ConnectorCategory;
  icon: string;
  color: string;
  author: string;
  actions: ConnectorAction[];
  events: ConnectorEvent[];
  config: ConnectorConfig;
  status: 'active' | 'inactive' | 'deprecated';
  rating: number;
  installCount: number;
  documentation: string;
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  parameters: ConnectorParameter[];
  returnType: string;
  requiredPermissions: string[];
  timeout: number;
}

export interface ConnectorEvent {
  id: string;
  name: string;
  description: string;
  schema: Record<string, unknown>;
}

export interface ConnectorParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: unknown;
  secret?: boolean;
  options?: unknown[];
}

export interface ConnectorConfig {
  authType: 'api-key' | 'oauth2' | 'basic' | 'certificate' | 'bearer';
  baseUrl?: string;
  rateLimit?: number;
  batchSize?: number;
}

export interface ConnectorInstance {
  id: string;
  connectorId: string;
  tenantId: string;
  name: string;
  config: Record<string, unknown>;
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt?: string;
  secrets: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Approvals
// ---------------------------------------------------------------------------

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'delegated' | 'cancelled';

export interface ApprovalRequest {
  id: string;
  tenantId: string;
  executionId: string;
  nodeId: string;
  workflowId: string;
  type: ApprovalType;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  requestedBy: string;
  assignedTo: string[];
  approvers: ApprovalEntry[];
  metadata: Record<string, unknown>;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ApprovalType = 'single' | 'multi-level' | 'parallel' | 'consensus' | 'conditional';

export interface ApprovalEntry {
  userId: string;
  status: ApprovalStatus;
  comment?: string;
  timestamp?: string;
  delegatedTo?: string;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export interface ForgeEvent {
  id: string;
  tenantId: string;
  source: string;
  type: string;
  data: Record<string, unknown>;
  metadata: EventMetadata;
  timestamp: string;
  processed: boolean;
}

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  sessionId?: string;
  version: string;
  traceId?: string;
}

// ---------------------------------------------------------------------------
// Playbooks
// ---------------------------------------------------------------------------

export interface Playbook {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  workflowTemplate: Partial<Workflow>;
  inputs: PlaybookInput[];
  outputs: PlaybookOutput[];
  dependencies: string[];
  risks: string[];
  validations: string[];
  metrics: PlaybookMetrics;
  author: string;
  version: string;
  rating: number;
  installCount: number;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlaybookInput {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: unknown;
}

export interface PlaybookOutput {
  name: string;
  type: string;
  description: string;
}

export interface PlaybookMetrics {
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  lastExecutedAt?: string;
  errorRate: number;
}

// ---------------------------------------------------------------------------
// Automation Marketplace
// ---------------------------------------------------------------------------

export interface MarketplaceItem {
  id: string;
  playbookId: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  author: string;
  version: string;
  rating: number;
  reviewCount: number;
  installCount: number;
  tags: string[];
  screenshots: string[];
  documentation: string;
  changelog: string;
  license: string;
  dependencies: string[];
  compatibility: string[];
  featured: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Knowledge Graph
// ---------------------------------------------------------------------------

export interface KnowledgeNode {
  id: string;
  type: 'automation' | 'asset' | 'incident' | 'tool' | 'team' | 'outcome' | 'threat';
  label: string;
  properties: Record<string, unknown>;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  properties: Record<string, unknown>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    lastUpdated: string;
  };
}

// ---------------------------------------------------------------------------
// Observability
// ---------------------------------------------------------------------------

export interface TraceSpan {
  id: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'ok' | 'error' | 'timeout';
  attributes: Record<string, unknown>;
  events: TraceEvent[];
}

export interface TraceEvent {
  name: string;
  timestamp: string;
  attributes: Record<string, unknown>;
}

export interface MetricPoint {
  timestamp: string;
  value: number;
  labels: Record<string, string>;
}

export interface MetricSeries {
  name: string;
  points: MetricPoint[];
  unit: string;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'rate';
}

// ---------------------------------------------------------------------------
// Compliance
// ---------------------------------------------------------------------------

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  controls: ComplianceControl[];
}

export interface ComplianceControl {
  id: string;
  framework: string;
  name: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-assessed';
  evidence: ComplianceEvidence[];
  automatedCheck: boolean;
  lastAssessedAt?: string;
}

export interface ComplianceEvidence {
  id: string;
  controlId: string;
  type: 'screenshot' | 'log' | 'config' | 'report' | 'certificate';
  url: string;
  description: string;
  collectedAt: string;
  verifiedBy?: string;
}

// ---------------------------------------------------------------------------
// Vault / Secrets
// ---------------------------------------------------------------------------

export interface Secret {
  id: string;
  tenantId: string;
  name: string;
  path: string;
  type: 'api-key' | 'password' | 'certificate' | 'token' | 'ssh-key' | 'generic';
  lastRotatedAt: string;
  expiresAt?: string;
  rotationPolicy?: RotationPolicy;
  accessPolicy: SecretAccessPolicy;
  tags: string[];
  createdAt: string;
}

export interface RotationPolicy {
  enabled: boolean;
  intervalDays: number;
  autoRotate: boolean;
  notificationDaysBefore: number;
}

export interface SecretAccessPolicy {
  allowedWorkflows: string[];
  allowedUsers: string[];
  allowedConnectors: string[];
  ipWhitelist?: string[];
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, unknown>;
  refreshInterval: number;
}

export type WidgetType =
  | 'active-automations'
  | 'execution-history'
  | 'error-rate'
  | 'avg-response-time'
  | 'incidents-today'
  | 'time-saved'
  | 'system-health'
  | 'ai-decisions'
  | 'connector-status'
  | 'risk-score'
  | 'sla-compliance'
  | 'top-workflows'
  | 'recent-activity'
  | 'approval-queue'
  | 'threat-feed'
  | 'custom-metric'
  | 'knowledge-graph'
  | 'compliance-score';

// ---------------------------------------------------------------------------
// API Responses
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: ApiError;
  timestamp: string;
  traceId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}
