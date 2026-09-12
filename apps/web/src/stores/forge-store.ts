// ============================================================================
// BlackSentinel Forge - Global State Store (Zustand)
// ============================================================================

import { create } from 'zustand';
import {
  Workflow,
  WorkflowExecution,
  ConnectorInstance,
  ApprovalRequest,
  AIDecision,
  DashboardWidget,
  User,
} from '@blacksentinel/shared';

interface ForgeState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;

  // Workflows
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  setWorkflows: (workflows: Workflow[]) => void;
  setSelectedWorkflow: (workflow: Workflow | null) => void;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  removeWorkflow: (id: string) => void;

  // Executions
  activeExecutions: WorkflowExecution[];
  executionHistory: WorkflowExecution[];
  setActiveExecutions: (executions: WorkflowExecution[]) => void;
  addExecution: (execution: WorkflowExecution) => void;
  updateExecution: (id: string, updates: Partial<WorkflowExecution>) => void;

  // Connectors
  connectors: ConnectorInstance[];
  setConnectors: (connectors: ConnectorInstance[]) => void;

  // Approvals
  pendingApprovals: ApprovalRequest[];
  setPendingApprovals: (approvals: ApprovalRequest[]) => void;
  removeApproval: (id: string) => void;

  // AI
  aiDecisions: AIDecision[];
  setAIDecisions: (decisions: AIDecision[]) => void;

  // Dashboard
  dashboardWidgets: DashboardWidget[];
  setDashboardWidgets: (widgets: DashboardWidget[]) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;

  // UI State
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useForgeStore = create<ForgeState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Workflows
  workflows: [],
  selectedWorkflow: null,
  setWorkflows: (workflows) => set({ workflows }),
  setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
  addWorkflow: (workflow) => set((state) => ({ workflows: [...state.workflows, workflow] })),
  updateWorkflow: (id, updates) =>
    set((state) => ({
      workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),
  removeWorkflow: (id) =>
    set((state) => ({ workflows: state.workflows.filter((w) => w.id !== id) })),

  // Executions
  activeExecutions: [],
  executionHistory: [],
  setActiveExecutions: (executions) => set({ activeExecutions: executions }),
  addExecution: (execution) =>
    set((state) => ({ activeExecutions: [...state.activeExecutions, execution] })),
  updateExecution: (id, updates) =>
    set((state) => ({
      activeExecutions: state.activeExecutions.map((e) =>
        e.id === id ? { ...e, ...updates } : e,
      ),
    })),

  // Connectors
  connectors: [],
  setConnectors: (connectors) => set({ connectors }),

  // Approvals
  pendingApprovals: [],
  setPendingApprovals: (approvals) => set({ pendingApprovals: approvals }),
  removeApproval: (id) =>
    set((state) => ({
      pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
    })),

  // AI
  aiDecisions: [],
  setAIDecisions: (decisions) => set({ aiDecisions: decisions }),

  // Dashboard
  dashboardWidgets: [
    { id: '1', type: 'active-automations', title: 'Active Automations', position: { x: 0, y: 0, w: 4, h: 3 }, config: {}, refreshInterval: 5000 },
    { id: '2', type: 'execution-history', title: 'Execution History', position: { x: 4, y: 0, w: 8, h: 3 }, config: {}, refreshInterval: 10000 },
    { id: '3', type: 'error-rate', title: 'Error Rate', position: { x: 0, y: 3, w: 3, h: 2 }, config: {}, refreshInterval: 30000 },
    { id: '4', type: 'avg-response-time', title: 'Avg Response Time', position: { x: 3, y: 3, w: 3, h: 2 }, config: {}, refreshInterval: 30000 },
    { id: '5', type: 'incidents-today', title: 'Incidents Today', position: { x: 6, y: 3, w: 3, h: 2 }, config: {}, refreshInterval: 60000 },
    { id: '6', type: 'time-saved', title: 'Time Saved', position: { x: 9, y: 3, w: 3, h: 2 }, config: {}, refreshInterval: 60000 },
    { id: '7', type: 'ai-decisions', title: 'AI Decisions', position: { x: 0, y: 5, w: 6, h: 3 }, config: {}, refreshInterval: 10000 },
    { id: '8', type: 'approval-queue', title: 'Approval Queue', position: { x: 6, y: 5, w: 6, h: 3 }, config: {}, refreshInterval: 5000 },
  ],
  setDashboardWidgets: (widgets) => set({ dashboardWidgets: widgets }),
  updateWidget: (id, updates) =>
    set((state) => ({
      dashboardWidgets: state.dashboardWidgets.map((w) =>
        w.id === id ? { ...w, ...updates } : w,
      ),
    })),

  // UI State
  sidebarOpen: true,
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),

  // Search
  globalSearchQuery: '',
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
