'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  addEdge,
  Connection,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play,
  Pause,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Settings,
  Trash2,
  Copy,
  GitBranch,
  Zap,
  Bot,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Repeat,
  Webhook,
  Shield,
  Ticket,
  Search,
  Merge,
  ArrowRight,
  ChevronDown,
  Plus,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Custom Node Components
// ---------------------------------------------------------------------------

function TriggerNode({ data }: { data: { label: string; config?: Record<string, unknown> } }) {
  return (
    <div className="forge-card border-forge-orange/50 p-3 min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-forge-orange" />
        <span className="text-xs font-medium text-forge-orange">TRIGGER</span>
      </div>
      <div className="text-sm font-semibold text-forge-white">{data.label}</div>
    </div>
  );
}

function ActionNode({ data }: { data: { label: string; connector?: string } }) {
  return (
    <div className="forge-card border-forge-blue/50 p-3 min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <Play className="w-4 h-4 text-forge-blue" />
        <span className="text-xs font-medium text-forge-blue">ACTION</span>
      </div>
      <div className="text-sm font-semibold text-forge-white">{data.label}</div>
      {data.connector && (
        <div className="text-xs text-forge-gray-medium mt-1">via {data.connector}</div>
      )}
    </div>
  );
}

function ConditionNode({ data }: { data: { label: string } }) {
  return (
    <div className="forge-card border-forge-yellow/50 p-3 min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <Filter className="w-4 h-4 text-forge-yellow" />
        <span className="text-xs font-medium text-forge-yellow">CONDITION</span>
      </div>
      <div className="text-sm font-semibold text-forge-white">{data.label}</div>
    </div>
  );
}

function AIDecisionNode({ data }: { data: { label: string; confidence?: number } }) {
  return (
    <div className="forge-card border-forge-purple/50 p-3 min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <Bot className="w-4 h-4 text-forge-purple" />
        <span className="text-xs font-medium text-forge-purple">AI DECISION</span>
      </div>
      <div className="text-sm font-semibold text-forge-white">{data.label}</div>
      {data.confidence && (
        <div className="text-xs text-forge-gray-medium mt-1">
          Confidence: {data.confidence}%
        </div>
      )}
    </div>
  );
}

function ApprovalNode({ data }: { data: { label: string; approvers?: string[] } }) {
  return (
    <div className="forge-card border-forge-yellow/50 p-3 min-w-[180px] bg-forge-yellow/5">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-forge-yellow" />
        <span className="text-xs font-medium text-forge-yellow">APPROVAL</span>
      </div>
      <div className="text-sm font-semibold text-forge-white">{data.label}</div>
    </div>
  );
}

function IsolationNode({ data }: { data: { label: string; target?: string } }) {
  return (
    <div className="forge-card border-forge-red/50 p-3 min-w-[180px] bg-forge-red/5">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-4 h-4 text-forge-red" />
        <span className="text-xs font-medium text-forge-red">ISOLATE</span>
      </div>
      <div className="text-sm font-semibold text-forge-white">{data.label}</div>
    </div>
  );
}

function NotificationNode({ data }: { data: { label: string; channel?: string } }) {
  return (
    <div className="forge-card border-forge-green/50 p-3 min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="w-4 h-4 text-forge-green" />
        <span className="text-xs font-medium text-forge-green">NOTIFY</span>
      </div>
      <div className="text-sm font-semibold text-forge-white">{data.label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Node Types Registry
// ---------------------------------------------------------------------------

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  'ai-decision': AIDecisionNode,
  approval: ApprovalNode,
  isolation: IsolationNode,
  notification: NotificationNode,
};

// ---------------------------------------------------------------------------
// Sample Workflow
// ---------------------------------------------------------------------------

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 50, y: 200 },
    data: { label: 'SIEM Alert Received', config: { eventSource: 'splunk' } },
  },
  {
    id: '2',
    type: 'ai-decision',
    position: { x: 300, y: 200 },
    data: { label: 'AI Threat Assessment', confidence: 94 },
  },
  {
    id: '3',
    type: 'condition',
    position: { x: 550, y: 200 },
    data: { label: 'Severity > 7?' },
  },
  {
    id: '4',
    type: 'isolation',
    position: { x: 800, y: 100 },
    data: { label: 'Isolate Endpoint', target: 'EP-2847' },
  },
  {
    id: '5',
    type: 'action',
    position: { x: 800, y: 300 },
    data: { label: 'Block IOCs', connector: 'firewall' },
  },
  {
    id: '6',
    type: 'approval',
    position: { x: 1050, y: 100 },
    data: { label: 'Manager Approval', approvers: ['soc-lead'] },
  },
  {
    id: '7',
    type: 'action',
    position: { x: 1300, y: 100 },
    data: { label: 'Create Incident', connector: 'servicenow' },
  },
  {
    id: '8',
    type: 'notification',
    position: { x: 1300, y: 300 },
    data: { label: 'Notify SOC Team', channel: 'slack' },
  },
  {
    id: '9',
    type: 'action',
    position: { x: 1550, y: 200 },
    data: { label: 'Update Asset Inventory', connector: 'cmdb' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', label: 'High', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-5', source: '3', target: '5', sourceHandle: 'false', label: 'Low', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4-6', source: '4', target: '6', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e6-7', source: '6', target: '7', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5-8', source: '5', target: '8', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e7-9', source: '7', target: '9', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e8-9', source: '8', target: '9', markerEnd: { type: MarkerType.ArrowClosed } },
];

// ---------------------------------------------------------------------------
// Node Palette
// ---------------------------------------------------------------------------

const nodePalette = [
  { type: 'trigger', label: 'Trigger', icon: Zap, color: 'text-forge-orange' },
  { type: 'action', label: 'Action', icon: Play, color: 'text-forge-blue' },
  { type: 'condition', label: 'Condition', icon: Filter, color: 'text-forge-yellow' },
  { type: 'ai-decision', label: 'AI Decision', icon: Bot, color: 'text-forge-purple' },
  { type: 'approval', label: 'Approval', icon: Shield, color: 'text-forge-yellow' },
  { type: 'isolation', label: 'Isolate', icon: AlertTriangle, color: 'text-forge-red' },
  { type: 'notification', label: 'Notify', icon: Bell, color: 'text-forge-green' },
];

// ---------------------------------------------------------------------------
// Workflow Designer
// ---------------------------------------------------------------------------

export function WorkflowDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge({ ...connection, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds),
      );
    },
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Left Panel - Node Palette */}
      <div className="w-64 forge-card p-4 flex-shrink-0">
        <h3 className="font-semibold text-forge-white mb-4">Node Palette</h3>
        <div className="space-y-2">
          {nodePalette.map((item) => (
            <button
              key={item.type}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-forge-gray-dark transition-colors text-left group"
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-sm text-forge-gray-light group-hover:text-forge-white">
                {item.label}
              </span>
              <Plus className="w-3 h-3 text-forge-gray-medium ml-auto opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>

        {/* Selected Node Properties */}
        {selectedNode && (
          <div className="mt-6 pt-6 border-t border-forge-gray-dark">
            <h4 className="text-sm font-semibold text-forge-white mb-3">Properties</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-forge-gray-medium">Label</label>
                <input
                  type="text"
                  value={selectedNode.data.label as string}
                  className="forge-input w-full mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-forge-gray-medium">Type</label>
                <div className="forge-input mt-1 text-sm text-forge-gray-light">
                  {selectedNode.type}
                </div>
              </div>
              <div>
                <label className="text-xs text-forge-gray-medium">ID</label>
                <div className="forge-input mt-1 text-xs text-forge-gray-medium font-mono">
                  {selectedNode.id}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 forge-card overflow-hidden relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`forge-btn-primary flex items-center gap-2 text-sm ${
              isRunning ? 'bg-forge-red hover:bg-forge-red' : ''
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Stop' : 'Run'}
          </button>
          <button className="forge-btn-secondary flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="forge-btn-secondary text-sm">
            <Undo className="w-4 h-4" />
          </button>
          <button className="forge-btn-secondary text-sm">
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          <div className="forge-card px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs text-forge-gray-medium">Nodes:</span>
            <span className="text-xs font-bold text-forge-white">{nodes.length}</span>
          </div>
          <div className="forge-card px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs text-forge-gray-medium">Edges:</span>
            <span className="text-xs font-bold text-forge-white">{edges.length}</span>
          </div>
          {isRunning && (
            <div className="forge-card px-3 py-1.5 flex items-center gap-2 border-forge-green/50">
              <div className="w-2 h-2 rounded-full bg-forge-green animate-pulse" />
              <span className="text-xs text-forge-green">Running</span>
            </div>
          )}
        </div>

        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          defaultEdgeOptions={{
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
          className="bg-forge-black"
          proOptions={{ hideAttribution: true }}
        >
          <Controls
            className="!bg-forge-black-secondary !border-forge-gray-dark !rounded-lg"
          />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger': return '#FF6B00';
                case 'action': return '#3B82F6';
                case 'condition': return '#FACC15';
                case 'ai-decision': return '#A855F7';
                case 'approval': return '#FACC15';
                case 'isolation': return '#EF4444';
                case 'notification': return '#22C55E';
                default: return '#3C3C3C';
              }
            }}
            maskColor="rgba(11, 11, 11, 0.8)"
            className="!bg-forge-black-secondary !border-forge-gray-dark"
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#3C3C3C"
          />
        </ReactFlow>
      </div>

      {/* Right Panel - Execution Log */}
      <div className="w-80 forge-card p-4 flex-shrink-0 overflow-y-auto">
        <h3 className="font-semibold text-forge-white mb-4">Execution Log</h3>
        <div className="space-y-2">
          {[
            { node: 'SIEM Alert Received', status: 'completed', time: '0.1s', icon: CheckCircle, color: 'text-forge-green' },
            { node: 'AI Threat Assessment', status: 'completed', time: '2.3s', icon: CheckCircle, color: 'text-forge-green' },
            { node: 'Severity Check', status: 'completed', time: '0.05s', icon: CheckCircle, color: 'text-forge-green' },
            { node: 'Isolate Endpoint', status: 'running', time: '45s', icon: Clock, color: 'text-forge-orange animate-pulse' },
            { node: 'Block IOCs', status: 'pending', time: '--', icon: Clock, color: 'text-forge-gray-medium' },
          ].map((log, i) => (
            <div key={i} className="forge-card p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <log.icon className={`w-3 h-3 ${log.color}`} />
                  <span className="text-xs font-medium text-forge-white">{log.node}</span>
                </div>
                <span className="text-xs text-forge-gray-medium">{log.time}</span>
              </div>
              <div className={`text-xs ${log.color}`}>{log.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
