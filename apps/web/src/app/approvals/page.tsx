'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Shield,
  Timer,
  Forward,
  History,
  ChevronRight,
} from 'lucide-react';

const mockApprovals = [
  { id: 'apr-001', title: 'Endpoint Isolation - Host 10.0.1.45', description: 'AI recommends network isolation of compromised endpoint detected by CrowdStrike Falcon. High-confidence ransomware indicators found.', riskLevel: 'high', requester: 'AI Copilot', workflow: 'Ransomware Containment', expiresAt: '2026-06-29T11:30:00Z', createdAt: '10:30:15Z', nodes: ['EDR Alert', 'AI Risk Assessment'] },
  { id: 'apr-002', title: 'Block Malicious IPs on Firewall', description: 'Auto-block 3 IPs associated with active C2 communication detected in SIEM correlation.', riskLevel: 'medium', requester: 'SOC Alert Triage', workflow: 'Threat Response', expiresAt: '2026-06-29T12:00:00Z', createdAt: '10:28:00Z', nodes: ['IOC Extraction', 'Threat Intel Lookup'] },
  { id: 'apr-003', title: 'Execute Vulnerability Remediation', description: 'Apply critical patch KB5028168 to 12 production servers. Window: maintenance slot tonight.', riskLevel: 'low', requester: 'Vuln Scan Orchestrator', workflow: 'Vulnerability Management', expiresAt: '2026-06-30T06:00:00Z', createdAt: '09:15:00Z', nodes: ['Scan Results', 'Patch Assessment'] },
  { id: 'apr-004', title: 'Disable Compromised User Accounts', description: '3 accounts showing credential stuffing patterns. Temporary lock pending investigation.', riskLevel: 'high', requester: 'User Provisioning', workflow: 'Identity Protection', expiresAt: '2026-06-29T11:00:00Z', createdAt: '10:20:00Z', nodes: ['Login Anomaly Detection', 'Risk Scoring'] },
];

const approvalHistory = [
  { id: 'h-1', title: 'SIEM Rule Deployment', action: 'approved', approver: 'Admin', timestamp: '09:45:00Z' },
  { id: 'h-2', title: 'Quarantine Email Batch', action: 'approved', approver: 'SOC Lead', timestamp: '09:30:00Z' },
  { id: 'h-3', title: 'Firewall Rule Change', action: 'rejected', approver: 'Admin', timestamp: '09:15:00Z' },
  { id: 'h-4', title: 'User Account Reset', action: 'approved', approver: 'Help Desk', timestamp: '08:50:00Z' },
  { id: 'h-5', title: 'Cloud IAM Policy Update', action: 'approved', approver: 'Cloud Admin', timestamp: '08:20:00Z' },
];

export default function ApprovalsPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const riskBadge = (risk: string) => {
    if (risk === 'high') return <span className="forge-badge-red"><AlertTriangle className="w-3 h-3 mr-1" />High Risk</span>;
    if (risk === 'medium') return <span className="forge-badge-orange"><Shield className="w-3 h-3 mr-1" />Medium Risk</span>;
    return <span className="forge-badge-green"><CheckCircle2 className="w-3 h-3 mr-1" />Low Risk</span>;
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
                <Bell className="w-6 h-6" /> Approvals
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Review and approve pending automation actions</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="forge-badge-orange">{mockApprovals.length} Pending</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {(['pending', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab ? 'forge-btn-primary' : 'forge-card text-forge-gray-light hover:text-forge-white'
                }`}
              >
                {tab === 'pending' ? `Pending (${mockApprovals.length})` : 'History'}
              </button>
            ))}
          </div>

          {activeTab === 'pending' && (
            <div className="space-y-4">
              {mockApprovals.map((approval) => (
                <div key={approval.id} className="forge-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-forge-white">{approval.title}</h3>
                        {riskBadge(approval.riskLevel)}
                      </div>
                      <p className="text-sm text-forge-gray-light mb-3">{approval.description}</p>
                      <div className="flex items-center gap-4 text-xs text-forge-gray-medium">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {approval.requester}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {approval.createdAt}</span>
                        <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Expires: {new Date(approval.expiresAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-forge-gray-medium">Pipeline:</span>
                        {approval.nodes.map((node, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className="forge-badge-blue">{node}</span>
                            {i < approval.nodes.length - 1 && <ChevronRight className="w-3 h-3 text-forge-gray-dark" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-forge-gray-dark">
                    <button className="forge-btn-primary flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button className="forge-btn-secondary flex items-center gap-2 text-forge-red border-forge-red/30 hover:bg-forge-red/10">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button className="forge-btn-secondary flex items-center gap-2">
                      <Forward className="w-4 h-4" /> Delegate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="forge-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-forge-gray-dark">
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Title</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Action</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Approver</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalHistory.map((h) => (
                    <tr key={h.id} className="border-b border-forge-gray-dark/50 hover:bg-forge-gray-dark/30">
                      <td className="px-6 py-3 text-sm text-forge-white">{h.title}</td>
                      <td className="px-6 py-3">
                        <span className={`forge-badge ${h.action === 'approved' ? 'forge-badge-green' : 'forge-badge-red'}`}>{h.action}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-forge-gray-light">{h.approver}</td>
                      <td className="px-6 py-3 text-sm text-forge-gray-light font-mono">{h.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
