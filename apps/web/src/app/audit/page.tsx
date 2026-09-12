'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import { useDebounce } from '@/hooks';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  Globe,
  ChevronDown,
} from 'lucide-react';

const auditLogs = [
  { timestamp: '2026-06-29 10:30:15', user: 'admin@blacksentinel.io', action: 'workflow.execute', resource: 'Workflow', resourceId: 'wf-001', ip: '10.0.1.10', details: 'Phishing Auto-Response' },
  { timestamp: '2026-06-29 10:28:00', user: 'soc-lead@blacksentinel.io', action: 'approval.approve', resource: 'Approval', resourceId: 'apr-003', ip: '10.0.1.25', details: 'Approved SIEM rule deployment' },
  { timestamp: '2026-06-29 10:15:00', user: 'ai-engine', action: 'secret.rotate', resource: 'Secret', resourceId: 'sec-004', ip: '10.0.1.50', details: 'AWS_ACCESS_KEY_ID rotated' },
  { timestamp: '2026-06-29 10:05:00', user: 'admin@blacksentinel.io', action: 'connector.configure', resource: 'Connector', resourceId: 'conn-003', ip: '10.0.1.10', details: 'Updated Palo Alto Panorama config' },
  { timestamp: '2026-06-29 09:45:00', user: 'soc-analyst@blacksentinel.io', action: 'workflow.create', resource: 'Workflow', resourceId: 'wf-012', ip: '10.0.1.15', details: 'Created new malware analysis workflow' },
  { timestamp: '2026-06-29 09:30:00', user: 'admin@blacksentinel.io', action: 'team.invite', resource: 'Team', resourceId: 'user-015', ip: '10.0.1.10', details: 'Invited new team member' },
  { timestamp: '2026-06-29 09:15:00', user: 'ci-pipeline', action: 'secret.read', resource: 'Secret', resourceId: 'sec-001', ip: '10.0.2.20', details: 'CI/CD pipeline accessed API key' },
  { timestamp: '2026-06-29 09:00:00', user: 'admin@blacksentinel.io', action: 'settings.update', resource: 'Settings', resourceId: 'global', ip: '10.0.1.10', details: 'Updated notification settings' },
  { timestamp: '2026-06-29 08:45:00', user: 'soc-analyst@blacksentinel.io', action: 'workflow.delete', resource: 'Workflow', resourceId: 'wf-008', ip: '10.0.1.15', details: 'Deleted deprecated workflow' },
  { timestamp: '2026-06-29 08:30:00', user: 'ai-engine', action: 'decision.auto', resource: 'AI Decision', resourceId: 'dec-892', ip: '10.0.1.50', details: 'Auto-executed endpoint isolation' },
  { timestamp: '2026-06-29 08:15:00', user: 'admin@blacksentinel.io', action: 'connector.test', resource: 'Connector', resourceId: 'conn-001', ip: '10.0.1.10', details: 'Tested CrowdStrike Falcon connection' },
  { timestamp: '2026-06-29 08:00:00', user: 'system', action: 'compliance.scan', resource: 'Compliance', resourceId: 'comp-scan-001', ip: '10.0.1.50', details: 'Automated compliance scan completed' },
];

const actions = ['All', 'workflow.execute', 'approval.approve', 'secret.rotate', 'connector.configure', 'workflow.create', 'team.invite', 'settings.update', 'workflow.delete', 'decision.auto', 'connector.test', 'compliance.scan'];

export default function AuditPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [dateRange, setDateRange] = useState('today');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = auditLogs.filter((log) => {
    const matchesSearch = log.user.toLowerCase().includes(debouncedSearch.toLowerCase()) || log.resource.toLowerCase().includes(debouncedSearch.toLowerCase()) || log.details.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const actionBadge = (action: string) => {
    if (action.includes('delete')) return <span className="forge-badge-red">{action}</span>;
    if (action.includes('create') || action.includes('invite')) return <span className="forge-badge-green">{action}</span>;
    if (action.includes('execute') || action.includes('auto')) return <span className="forge-badge-orange">{action}</span>;
    return <span className="forge-badge-blue">{action}</span>;
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
                <FileText className="w-6 h-6" /> Audit Log
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Complete audit trail of all system activities</p>
            </div>
            <button className="forge-btn-primary flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-gray-medium" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="forge-input w-full pl-10"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="forge-input"
            >
              {actions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <div className="flex items-center gap-2">
              {['today', '7d', '30d', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    dateRange === range ? 'forge-btn-primary' : 'forge-card text-forge-gray-light hover:text-forge-white'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range === 'today' ? 'Today' : range}
                </button>
              ))}
            </div>
          </div>

          <div className="forge-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forge-gray-dark">
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Timestamp</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">User</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Action</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Resource</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Resource ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">IP Address</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={i} className="border-b border-forge-gray-dark/50 hover:bg-forge-gray-dark/30">
                    <td className="px-6 py-3 text-sm text-forge-gray-light font-mono whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-6 py-3 text-sm text-forge-white">{log.user}</td>
                    <td className="px-6 py-3">{actionBadge(log.action)}</td>
                    <td className="px-6 py-3 text-sm text-forge-gray-light">{log.resource}</td>
                    <td className="px-6 py-3 font-mono text-xs text-forge-orange">{log.resourceId}</td>
                    <td className="px-6 py-3 text-sm text-forge-gray-light font-mono">{log.ip}</td>
                    <td className="px-6 py-3 text-xs text-forge-gray-light max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-forge-gray-medium">
            Showing {filtered.length} of {auditLogs.length} audit entries
          </div>
        </main>
      </div>
    </div>
  );
}
