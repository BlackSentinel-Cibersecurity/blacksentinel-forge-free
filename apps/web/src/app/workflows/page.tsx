'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import { useDebounce } from '@/hooks';
import {
  GitBranch,
  Plus,
  Search,
  Filter,
  Play,
  Copy,
  Trash2,
  Edit3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreVertical,
} from 'lucide-react';

const mockWorkflows = [
  { id: '1', name: 'Phishing Auto-Response', status: 'active', category: 'Incident Response', riskLevel: 'medium', lastRun: '2 min ago', successRate: 98.2, runs: 1247 },
  { id: '2', name: 'Ransomware Containment', status: 'active', category: 'Incident Response', riskLevel: 'high', lastRun: '15 min ago', successRate: 99.1, runs: 389 },
  { id: '3', name: 'User Provisioning', status: 'active', category: 'IT Operations', riskLevel: 'low', lastRun: '1 hr ago', successRate: 100, runs: 5621 },
  { id: '4', name: 'Vulnerability Scan Orchestration', status: 'paused', category: 'Vulnerability Mgmt', riskLevel: 'low', lastRun: '3 hrs ago', successRate: 95.4, runs: 892 },
  { id: '5', name: 'SOC Alert Triage', status: 'active', category: 'SOC', riskLevel: 'medium', lastRun: '30 sec ago', successRate: 97.8, runs: 12450 },
  { id: '6', name: 'Cloud Compliance Check', status: 'draft', category: 'Compliance', riskLevel: 'low', lastRun: 'Never', successRate: 0, runs: 0 },
  { id: '7', name: 'Malware Sandbox Analysis', status: 'active', category: 'Threat Intel', riskLevel: 'high', lastRun: '5 min ago', successRate: 96.7, runs: 2103 },
  { id: '8', name: 'Incident Escalation', status: 'active', category: 'Incident Response', riskLevel: 'medium', lastRun: '45 min ago', successRate: 99.5, runs: 876 },
  { id: '9', name: 'Backup Verification', status: 'paused', category: 'IT Operations', riskLevel: 'low', lastRun: '1 day ago', successRate: 94.2, runs: 365 },
  { id: '10', name: 'Threat Intel Enrichment', status: 'active', category: 'Threat Intel', riskLevel: 'low', lastRun: '10 sec ago', successRate: 99.9, runs: 24800 },
];

const categories = ['All', 'Incident Response', 'IT Operations', 'Vulnerability Mgmt', 'SOC', 'Compliance', 'Threat Intel'];

export default function WorkflowsPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = mockWorkflows.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || w.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const statusBadge = (status: string) => {
    if (status === 'active') return <span className="forge-badge-green"><CheckCircle2 className="w-3 h-3 mr-1" />Active</span>;
    if (status === 'paused') return <span className="forge-badge-yellow"><AlertTriangle className="w-3 h-3 mr-1" />Paused</span>;
    return <span className="forge-badge-blue"><Clock className="w-3 h-3 mr-1" />Draft</span>;
  };

  const riskBadge = (risk: string) => {
    if (risk === 'high') return <span className="forge-badge-red">High</span>;
    if (risk === 'medium') return <span className="forge-badge-orange">Medium</span>;
    return <span className="forge-badge-green">Low</span>;
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
                <GitBranch className="w-6 h-6" /> Workflows
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Manage and monitor your automation workflows</p>
            </div>
            <button className="forge-btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Workflow
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-gray-medium" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="forge-input w-full pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-forge-gray-medium" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    categoryFilter === cat
                      ? 'forge-btn-primary'
                      : 'forge-card text-forge-gray-light hover:text-forge-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="forge-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forge-gray-dark">
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Risk</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Last Run</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Success Rate</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((wf) => (
                  <tr key={wf.id} className="border-b border-forge-gray-dark/50 hover:bg-forge-gray-dark/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-forge-white">{wf.name}</div>
                      <div className="text-xs text-forge-gray-medium">{wf.runs.toLocaleString()} runs</div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(wf.status)}</td>
                    <td className="px-6 py-4"><span className="forge-badge-blue">{wf.category}</span></td>
                    <td className="px-6 py-4">{riskBadge(wf.riskLevel)}</td>
                    <td className="px-6 py-4 text-sm text-forge-gray-light">{wf.lastRun}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-forge-gray-dark rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${wf.successRate >= 98 ? 'bg-forge-green' : wf.successRate >= 95 ? 'bg-forge-yellow' : 'bg-forge-red'}`}
                            style={{ width: `${wf.successRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-forge-gray-light">{wf.successRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 hover:bg-forge-gray-dark rounded-lg transition-colors" title="Edit"><Edit3 className="w-4 h-4 text-forge-gray-medium" /></button>
                        <button className="p-2 hover:bg-forge-gray-dark rounded-lg transition-colors" title="Execute"><Play className="w-4 h-4 text-forge-green" /></button>
                        <button className="p-2 hover:bg-forge-gray-dark rounded-lg transition-colors" title="Clone"><Copy className="w-4 h-4 text-forge-blue" /></button>
                        <button className="p-2 hover:bg-forge-gray-dark rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-forge-red" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-forge-gray-medium">
            <span>Showing {filtered.length} of {mockWorkflows.length} workflows</span>
            <span>{mockWorkflows.filter((w) => w.status === 'active').length} active</span>
          </div>
        </main>
      </div>
    </div>
  );
}
