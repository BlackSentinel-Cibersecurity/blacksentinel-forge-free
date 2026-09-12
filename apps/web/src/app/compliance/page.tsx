'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  Clock,
  TrendingUp,
  ChevronRight,
  Eye,
  BarChart3,
} from 'lucide-react';

const frameworks = [
  { name: 'SOC 2', score: 92, controls: 114, passed: 105, failed: 4, partial: 5, lastAudit: '2026-06-01', status: 'compliant' },
  { name: 'ISO 27001', score: 88, controls: 93, passed: 82, failed: 6, partial: 5, lastAudit: '2026-05-15', status: 'compliant' },
  { name: 'NIST CSF', score: 79, controls: 108, passed: 85, failed: 12, partial: 11, lastAudit: '2026-04-20', status: 'partial' },
  { name: 'PCI-DSS', score: 95, controls: 329, passed: 312, failed: 8, partial: 9, lastAudit: '2026-06-10', status: 'compliant' },
  { name: 'HIPAA', score: 84, controls: 67, passed: 56, failed: 7, partial: 4, lastAudit: '2026-03-01', status: 'partial' },
];

const recentControls = [
  { id: 'AC-1', name: 'Access Control Policy', framework: 'SOC 2', status: 'passed', evidence: 'Policy doc uploaded' },
  { id: 'AC-2', name: 'Account Management', framework: 'SOC 2', status: 'passed', evidence: 'Automated review' },
  { id: 'AC-3', name: 'Access Enforcement', framework: 'ISO 27001', status: 'failed', evidence: 'Missing MFA config' },
  { id: 'AU-1', name: 'Audit Policy', framework: 'NIST CSF', status: 'passed', evidence: 'SIEM integration' },
  { id: 'AU-2', name: 'Audit Events', framework: 'NIST CSF', status: 'partial', evidence: '80% coverage' },
  { id: 'CA-1', name: 'Certification Policy', framework: 'PCI-DSS', status: 'passed', evidence: 'Certificate management' },
  { id: 'CM-1', name: 'Configuration Management', framework: 'SOC 2', status: 'failed', evidence: 'Drift detected' },
  { id: 'IR-1', name: 'Incident Response Plan', framework: 'HIPAA', status: 'passed', evidence: 'Playbook active' },
];

export default function CompliancePage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'evidence' | 'reports'>('overview');

  const scoreColor = (score: number) => {
    if (score >= 90) return 'bg-forge-green';
    if (score >= 75) return 'bg-forge-yellow';
    return 'bg-forge-red';
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
                <Shield className="w-6 h-6" /> Compliance
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Compliance posture monitoring and evidence collection</p>
            </div>
            <button className="forge-btn-primary flex items-center gap-2"><FileText className="w-4 h-4" /> Generate Report</button>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {(['overview', 'controls', 'evidence', 'reports'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab ? 'forge-btn-primary' : 'forge-card text-forge-gray-light hover:text-forge-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                {frameworks.map((fw) => (
                  <div
                    key={fw.name}
                    className={`forge-card p-5 cursor-pointer transition-all ${
                      selectedFramework === fw.name ? 'forge-border-glow' : 'hover:border-forge-orange/30'
                    }`}
                    onClick={() => setSelectedFramework(selectedFramework === fw.name ? null : fw.name)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Shield className="w-5 h-5 text-forge-orange" />
                      <span className={`forge-badge ${fw.status === 'compliant' ? 'forge-badge-green' : 'forge-badge-yellow'}`}>
                        {fw.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-forge-white mb-1">{fw.name}</h3>
                    <div className="text-2xl font-bold forge-text-gradient mb-2">{fw.score}%</div>
                    <div className="w-full h-2 bg-forge-gray-dark rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full ${scoreColor(fw.score)} transition-all`} style={{ width: `${fw.score}%` }} />
                    </div>
                    <div className="text-xs text-forge-gray-medium">
                      {fw.passed}/{fw.controls} controls passed
                    </div>
                  </div>
                ))}
              </div>

              {selectedFramework && (
                <div className="forge-card p-6">
                  <h3 className="text-lg font-medium text-forge-white mb-4">{selectedFramework} Control Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {frameworks.filter((f) => f.name === selectedFramework).map((fw) => (
                      <div key={fw.name} className="space-y-3">
                        <div className="p-3 bg-forge-green/10 rounded-lg"><div className="text-xl font-bold text-forge-green">{fw.passed}</div><div className="text-xs text-forge-gray-medium">Passed</div></div>
                        <div className="p-3 bg-forge-red/10 rounded-lg"><div className="text-xl font-bold text-forge-red">{fw.failed}</div><div className="text-xs text-forge-gray-medium">Failed</div></div>
                        <div className="p-3 bg-forge-yellow/10 rounded-lg"><div className="text-xl font-bold text-forge-yellow">{fw.partial}</div><div className="text-xs text-forge-gray-medium">Partial</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'controls' && (
            <div className="forge-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-forge-gray-dark">
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Control ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Framework</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {recentControls.map((ctrl) => (
                    <tr key={ctrl.id} className="border-b border-forge-gray-dark/50 hover:bg-forge-gray-dark/30">
                      <td className="px-6 py-3 font-mono text-sm text-forge-orange">{ctrl.id}</td>
                      <td className="px-6 py-3 text-sm text-forge-white">{ctrl.name}</td>
                      <td className="px-6 py-3"><span className="forge-badge-blue">{ctrl.framework}</span></td>
                      <td className="px-6 py-3">
                        <span className={`forge-badge ${ctrl.status === 'passed' ? 'forge-badge-green' : ctrl.status === 'failed' ? 'forge-badge-red' : 'forge-badge-yellow'}`}>{ctrl.status}</span>
                      </td>
                      <td className="px-6 py-3 text-xs text-forge-gray-light">{ctrl.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="forge-card p-6">
              <h3 className="text-lg font-medium text-forge-white mb-4">Evidence Collector</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-forge-gray-dark/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2"><Upload className="w-4 h-4 text-forge-orange" /><span className="text-sm font-medium text-forge-white">Upload Evidence</span></div>
                  <p className="text-xs text-forge-gray-medium mb-3">Upload documents, screenshots, and compliance artifacts.</p>
                  <button className="forge-btn-primary text-xs">Select Files</button>
                </div>
                <div className="p-4 bg-forge-gray-dark/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2"><Eye className="w-4 h-4 text-forge-blue" /><span className="text-sm font-medium text-forge-white">Auto-Collected</span></div>
                  <p className="text-xs text-forge-gray-medium mb-3">24 evidence items automatically collected from connected systems.</p>
                  <button className="forge-btn-secondary text-xs">View Evidence</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="forge-card p-6">
              <h3 className="text-lg font-medium text-forge-white mb-4">Compliance Reports</h3>
              <div className="space-y-3">
                {['SOC 2 Type II Report', 'ISO 27001 Statement of Applicability', 'PCI-DSS ROC', 'HIPAA Risk Assessment', 'NIST CSF Gap Analysis'].map((report, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-forge-gray-dark/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-forge-orange" />
                      <span className="text-sm text-forge-white">{report}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-forge-gray-medium">Generated Jun {10 + i}, 2026</span>
                      <button className="forge-btn-secondary text-xs px-2 py-1"><Download className="w-3 h-3 mr-1" /> PDF</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
