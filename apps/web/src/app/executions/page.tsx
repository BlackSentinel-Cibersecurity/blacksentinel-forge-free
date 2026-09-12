'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import { useDebounce } from '@/hooks';
import {
  Play,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Calendar,
  Timer,
  ArrowRight,
} from 'lucide-react';

const mockExecutions = [
  { id: 'exec-001', workflowName: 'Phishing Auto-Response', status: 'success', duration: '12.4s', trigger: 'webhook', startedAt: '2026-06-29T10:30:00Z', completedAt: '2026-06-29T10:30:12Z', nodes: [
    { name: 'Email Trigger', status: 'success', duration: '0.2s' },
    { name: 'IOC Extraction', status: 'success', duration: '1.8s' },
    { name: 'AI Analysis', status: 'success', duration: '4.1s' },
    { name: 'Endpoint Isolation', status: 'success', duration: '3.2s' },
    { name: 'Notify SOC', status: 'success', duration: '0.5s' },
  ]},
  { id: 'exec-002', workflowName: 'SOC Alert Triage', status: 'success', duration: '3.2s', trigger: 'schedule', startedAt: '2026-06-29T10:28:00Z', completedAt: '2026-06-29T10:28:03Z', nodes: [
    { name: 'SIEM Poll', status: 'success', duration: '0.8s' },
    { name: 'Alert Classification', status: 'success', duration: '1.2s' },
    { name: 'Auto-Enrichment', status: 'success', duration: '0.9s' },
  ]},
  { id: 'exec-003', workflowName: 'Ransomware Containment', status: 'failed', duration: '45.1s', trigger: 'manual', startedAt: '2026-06-29T10:15:00Z', completedAt: '2026-06-29T10:15:45Z', nodes: [
    { name: 'EDR Alert', status: 'success', duration: '0.1s' },
    { name: 'AI Risk Assessment', status: 'success', duration: '2.3s' },
    { name: 'Endpoint Isolation', status: 'failed', duration: '30.0s' },
    { name: 'Backup Verify', status: 'skipped', duration: '—' },
  ]},
  { id: 'exec-004', workflowName: 'Threat Intel Enrichment', status: 'success', duration: '8.7s', trigger: 'webhook', startedAt: '2026-06-29T10:10:00Z', completedAt: '2026-06-29T10:10:09Z', nodes: [
    { name: 'IOC Ingest', status: 'success', duration: '0.3s' },
    { name: 'VT Lookup', status: 'success', duration: '3.1s' },
    { name: 'OTX Query', status: 'success', duration: '2.8s' },
    { name: 'Enrichment Store', status: 'success', duration: '0.4s' },
  ]},
  { id: 'exec-005', workflowName: 'User Provisioning', status: 'success', duration: '5.1s', trigger: 'api', startedAt: '2026-06-29T10:05:00Z', completedAt: '2026-06-29T10:05:05Z', nodes: [
    { name: 'Request Parse', status: 'success', duration: '0.1s' },
    { name: 'AD Create', status: 'success', duration: '1.2s' },
    { name: 'O365 Assign', status: 'success', duration: '2.1s' },
    { name: 'Welcome Email', status: 'success', duration: '0.3s' },
  ]},
  { id: 'exec-006', workflowName: 'Vulnerability Scan Orchestration', status: 'running', duration: '—', trigger: 'schedule', startedAt: '2026-06-29T10:32:00Z', completedAt: null, nodes: [
    { name: 'Target Discovery', status: 'success', duration: '4.2s' },
    { name: 'Nessus Scan', status: 'running', duration: '—' },
    { name: 'Report Generate', status: 'pending', duration: '—' },
  ]},
  { id: 'exec-007', workflowName: 'Malware Sandbox Analysis', status: 'success', duration: '120.3s', trigger: 'webhook', startedAt: '2026-06-29T09:50:00Z', completedAt: '2026-06-29T09:52:00Z', nodes: [
    { name: 'File Ingest', status: 'success', duration: '0.5s' },
    { name: 'Static Analysis', status: 'success', duration: '15.2s' },
    { name: 'Dynamic Analysis', status: 'success', duration: '98.1s' },
    { name: 'IOC Extraction', status: 'success', duration: '3.4s' },
    { name: 'Report', status: 'success', duration: '1.1s' },
  ]},
  { id: 'exec-008', workflowName: 'SOC Alert Triage', status: 'failed', duration: '1.8s', trigger: 'webhook', startedAt: '2026-06-29T09:45:00Z', completedAt: '2026-06-29T09:45:02Z', nodes: [
    { name: 'SIEM Poll', status: 'failed', duration: '1.8s' },
  ]},
];

export default function ExecutionsPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = mockExecutions.filter((e) => statusFilter === 'all' || e.status === statusFilter);

  const statusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-forge-green" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-forge-red" />;
    if (status === 'running') return <RefreshCw className="w-4 h-4 text-forge-blue animate-spin" />;
    return <Clock className="w-4 h-4 text-forge-gray-medium" />;
  };

  const nodeStatus = (status: string) => {
    if (status === 'success') return <CheckCircle2 className="w-3 h-3 text-forge-green" />;
    if (status === 'failed') return <XCircle className="w-3 h-3 text-forge-red" />;
    if (status === 'running') return <RefreshCw className="w-3 h-3 text-forge-blue animate-spin" />;
    return <Clock className="w-3 h-3 text-forge-gray-medium" />;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold forge-text-gradient flex items-center gap-2">
                <Play className="w-6 h-6" /> Executions
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">View execution history and trace node-by-node activity</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-forge-gray-medium">
                <span className="forge-badge-green">{mockExecutions.filter((e) => e.status === 'success').length} succeeded</span>
                <span className="forge-badge-red">{mockExecutions.filter((e) => e.status === 'failed').length} failed</span>
                <span className="forge-badge-blue">{mockExecutions.filter((e) => e.status === 'running').length} running</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {['all', 'success', 'failed', 'running'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  statusFilter === s ? 'forge-btn-primary' : 'forge-card text-forge-gray-light hover:text-forge-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((exec) => (
              <div key={exec.id} className="forge-card overflow-hidden">
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-forge-gray-dark/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === exec.id ? null : exec.id)}
                >
                  {expandedId === exec.id ? <ChevronDown className="w-4 h-4 text-forge-gray-medium" /> : <ChevronRight className="w-4 h-4 text-forge-gray-medium" />}
                  {statusIcon(exec.status)}
                  <div className="flex-1">
                    <div className="font-medium text-forge-white">{exec.workflowName}</div>
                    <div className="text-xs text-forge-gray-medium">{exec.id}</div>
                  </div>
                  <span className={`forge-badge ${exec.status === 'success' ? 'forge-badge-green' : exec.status === 'failed' ? 'forge-badge-red' : 'forge-badge-blue'}`}>{exec.status}</span>
                  <div className="text-right">
                    <div className="text-sm text-forge-gray-light flex items-center gap-1"><Timer className="w-3 h-3" />{exec.duration}</div>
                    <div className="text-xs text-forge-gray-medium capitalize">{exec.trigger}</div>
                  </div>
                  <div className="text-right text-xs text-forge-gray-medium">
                    <div>{new Date(exec.startedAt).toLocaleTimeString()}</div>
                    {exec.completedAt && <div>{new Date(exec.completedAt).toLocaleTimeString()}</div>}
                  </div>
                </div>

                {expandedId === exec.id && (
                  <div className="border-t border-forge-gray-dark px-6 py-4">
                    <h4 className="text-xs font-medium text-forge-gray-medium uppercase mb-3">Node Execution Trace</h4>
                    <div className="space-y-2">
                      {exec.nodes.map((node, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {nodeStatus(node.status)}
                          <span className="text-sm text-forge-white w-40">{node.name}</span>
                          <ArrowRight className="w-3 h-3 text-forge-gray-dark" />
                          <span className={`text-xs px-2 py-0.5 rounded ${node.status === 'success' ? 'forge-badge-green' : node.status === 'failed' ? 'forge-badge-red' : node.status === 'running' ? 'forge-badge-blue' : 'forge-badge'}`}>{node.status}</span>
                          <span className="text-xs text-forge-gray-medium ml-auto">{node.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
