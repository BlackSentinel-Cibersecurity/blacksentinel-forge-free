// ============================================================================
// BlackSentinel Forge - API Client
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface RequestConfig {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('forge_token', token);
    } else {
      localStorage.removeItem('forge_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = typeof window !== 'undefined' ? localStorage.getItem('forge_token') : null;
    }
    return this.token;
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, params } = config;

    let url = `${this.baseUrl}/api/v1${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const token = this.getToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || 'Request failed', response.status, data.error?.code);
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ data: { user: unknown; token: string } }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(email: string, password: string, name: string, tenantName: string) {
    return this.request<{ data: { user: unknown; token: string } }>('/auth/register', {
      method: 'POST',
      body: { email, password, name, tenantName },
    });
  }

  // Workflows
  async getWorkflows(params?: Record<string, string>) {
    return this.request<{ data: unknown[]; meta: unknown }>('/workflows', { params });
  }

  async getWorkflow(id: string) {
    return this.request<{ data: unknown }>(`/workflows/${id}`);
  }

  async createWorkflow(data: Record<string, unknown>) {
    return this.request<{ data: unknown }>('/workflows', { method: 'POST', body: data });
  }

  async updateWorkflow(id: string, data: Record<string, unknown>) {
    return this.request<{ data: unknown }>(`/workflows/${id}`, { method: 'PUT', body: data });
  }

  async deleteWorkflow(id: string) {
    return this.request<{ data: unknown }>(`/workflows/${id}`, { method: 'DELETE' });
  }

  async executeWorkflow(id: string, data?: Record<string, unknown>) {
    return this.request<{ data: unknown }>(`/workflows/${id}/execute`, { method: 'POST', body: data });
  }

  // Executions
  async getExecutions(params?: Record<string, string>) {
    return this.request<{ data: unknown[]; meta: unknown }>('/executions', { params });
  }

  async getExecution(id: string) {
    return this.request<{ data: unknown }>(`/executions/${id}`);
  }

  // Connectors
  async getConnectors() {
    return this.request<{ data: unknown[] }>('/connectors');
  }

  async executeConnectorAction(instanceId: string, actionId: string, parameters: Record<string, unknown>) {
    return this.request<{ data: unknown }>(`/connectors/${instanceId}/execute-action`, {
      method: 'POST',
      body: { actionId, parameters },
    });
  }

  // AI
  async generateWorkflow(description: string) {
    return this.request<{ data: unknown }>('/ai/generate-workflow', { method: 'POST', body: { description } });
  }

  async makeAIDecision(type: string, context: Record<string, unknown>) {
    return this.request<{ data: unknown }>('/ai/make-decision', { method: 'POST', body: { type, context } });
  }

  // Approvals
  async getPendingApprovals() {
    return this.request<{ data: unknown[] }>('/approvals/pending');
  }

  async approveRequest(id: string, comment?: string) {
    return this.request<{ data: unknown }>(`/approvals/${id}/approve`, { method: 'POST', body: { comment } });
  }

  async rejectRequest(id: string, comment?: string) {
    return this.request<{ data: unknown }>(`/approvals/${id}/reject`, { method: 'POST', body: { comment } });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<{ data: unknown }>('/dashboard/stats');
  }

  // Playbooks
  async getPlaybooks(params?: Record<string, string>) {
    return this.request<{ data: unknown[] }>('/playbooks', { params });
  }

  // Secrets
  async getSecrets() {
    return this.request<{ data: unknown[] }>('/secrets');
  }

  async createSecret(data: Record<string, unknown>) {
    return this.request<{ data: unknown }>('/secrets', { method: 'POST', body: data });
  }

  // Compliance
  async getComplianceFrameworks() {
    return this.request<{ data: unknown[] }>('/compliance/frameworks');
  }

  // Observability
  async getMetrics() {
    return this.request<{ data: unknown }>('/observability/metrics');
  }

  async getTraces() {
    return this.request<{ data: unknown[] }>('/observability/traces');
  }

  // Team
  async getTeamMembers() {
    return this.request<{ data: unknown[] }>('/team');
  }

  // Settings
  async getSettings() {
    return this.request<{ data: unknown }>('/settings/general');
  }

  async updateSettings(data: Record<string, unknown>) {
    return this.request<{ data: unknown }>('/settings/general', { method: 'PUT', body: data });
  }

  // Marketplace
  async getMarketplaceItems(params?: Record<string, string>) {
    return this.request<{ data: unknown[] }>('/marketplace', { params });
  }

  // Audit
  async getAuditLogs(params?: Record<string, string>) {
    return this.request<{ data: unknown[] }>('/audit', { params });
  }
}

class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const api = new ApiClient(API_BASE);
export { ApiError };
