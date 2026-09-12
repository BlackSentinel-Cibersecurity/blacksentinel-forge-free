'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import {
  Key,
  Plus,
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Trash2,
  Settings,
  Lock,
  History,
} from 'lucide-react';

const mockSecrets = [
  { id: '1', name: 'CROWDSTRIKE_API_KEY', type: 'API Key', path: '/secrets/edr/crowdstrike', lastRotated: '2026-06-15', expiresAt: '2026-09-15', status: 'active', environment: 'production' },
  { id: '2', name: 'SPLUNK_HEC_TOKEN', type: 'Token', path: '/secrets/siem/splunk', lastRotated: '2026-06-01', expiresAt: '2026-12-01', status: 'active', environment: 'production' },
  { id: '3', name: 'SERVICENOW_CLIENT_SECRET', type: 'OAuth Secret', path: '/secrets/itsm/servicenow', lastRotated: '2026-04-20', expiresAt: '2026-07-20', status: 'expiring', environment: 'production' },
  { id: '4', name: 'AWS_ACCESS_KEY_ID', type: 'Access Key', path: '/secrets/cloud/aws', lastRotated: '2026-06-28', expiresAt: '2026-07-28', status: 'active', environment: 'production' },
  { id: '5', name: 'SLACK_BOT_TOKEN', type: 'Bot Token', path: '/secrets/comms/slack', lastRotated: '2026-06-10', expiresAt: '2026-12-10', status: 'active', environment: 'production' },
  { id: '6', name: 'JIRA_API_TOKEN', type: 'API Token', path: '/secrets/project/jira', lastRotated: '2026-03-01', expiresAt: '2026-06-01', status: 'expired', environment: 'production' },
  { id: '7', name: 'VAULT_ROOT_TOKEN', type: 'Root Token', path: '/secrets/vault/root', lastRotated: '2026-06-29', expiresAt: '2026-07-29', status: 'active', environment: 'production' },
  { id: '8', name: 'TLS_CERT_PRIVATE_KEY', type: 'Certificate', path: '/secrets/certs/tls', lastRotated: '2026-01-15', expiresAt: '2027-01-15', status: 'active', environment: 'production' },
];

const accessLog = [
  { timestamp: '10:30:15', user: 'SOC Analyst', action: 'Read', secret: 'CROWDSTRIKE_API_KEY', ip: '10.0.1.100' },
  { timestamp: '10:28:00', user: 'Automation Engine', action: 'Read', secret: 'SPLUNK_HEC_TOKEN', ip: '10.0.1.50' },
  { timestamp: '10:15:00', user: 'Admin', action: 'Rotate', secret: 'AWS_ACCESS_KEY_ID', ip: '10.0.1.10' },
  { timestamp: '09:45:00', user: 'CI/CD Pipeline', action: 'Read', secret: 'JIRA_API_TOKEN', ip: '10.0.2.20' },
  { timestamp: '09:30:00', user: 'SOC Lead', action: 'Create', secret: 'NEW_WEBHOOK_SECRET', ip: '10.0.1.100' },
];

export default function SecretsPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [activeTab, setActiveTab] = useState<'vault' | 'create' | 'rotation' | 'access'>('vault');
  const [search, setSearch] = useState('');
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const toggleValue = (id: string) => setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));

  const statusBadge = (status: string) => {
    if (status === 'active') return <span className="forge-badge-green"><CheckCircle2 className="w-3 h-3 mr-1" />Active</span>;
    if (status === 'expiring') return <span className="forge-badge-yellow"><AlertTriangle className="w-3 h-3 mr-1" />Expiring</span>;
    return <span className="forge-badge-red"><Clock className="w-3 h-3 mr-1" />Expired</span>;
  };

  const filtered = mockSecrets.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold forge-text-gradient flex items-center gap-2">
                <Key className="w-6 h-6" /> Secrets Vault
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Secure secret management with rotation policies</p>
            </div>
            <button className="forge-btn-primary flex items-center gap-2" onClick={() => setActiveTab('create')}>
              <Plus className="w-4 h-4" /> Add Secret
            </button>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {(['vault', 'create', 'rotation', 'access'] as const).map((tab) => (
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

          {activeTab === 'vault' && (
            <>
              <div className="relative max-w-md mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-gray-medium" />
                <input
                  type="text"
                  placeholder="Search secrets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="forge-input w-full pl-10"
                />
              </div>
              <div className="forge-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-forge-gray-dark">
                      <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Type</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Path</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Last Rotated</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Expires</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Status</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((secret) => (
                      <tr key={secret.id} className="border-b border-forge-gray-dark/50 hover:bg-forge-gray-dark/30">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-forge-gray-medium" />
                            <span className="font-mono text-sm text-forge-white">{secret.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3"><span className="forge-badge-blue">{secret.type}</span></td>
                        <td className="px-6 py-3 text-xs text-forge-gray-light font-mono">{secret.path}</td>
                        <td className="px-6 py-3 text-sm text-forge-gray-light">{secret.lastRotated}</td>
                        <td className="px-6 py-3 text-sm text-forge-gray-light">{secret.expiresAt}</td>
                        <td className="px-6 py-3">{statusBadge(secret.status)}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => toggleValue(secret.id)} className="p-2 hover:bg-forge-gray-dark rounded-lg transition-colors">
                              {showValues[secret.id] ? <EyeOff className="w-4 h-4 text-forge-gray-medium" /> : <Eye className="w-4 h-4 text-forge-gray-medium" />}
                            </button>
                            <button className="p-2 hover:bg-forge-gray-dark rounded-lg transition-colors"><RefreshCw className="w-4 h-4 text-forge-blue" /></button>
                            <button className="p-2 hover:bg-forge-gray-dark rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-forge-red" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'create' && (
            <div className="forge-card p-6 max-w-xl">
              <h3 className="text-lg font-medium text-forge-white mb-4">Create New Secret</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-forge-gray-medium mb-1 block">Secret Name</label>
                  <input className="forge-input w-full" placeholder="e.g., CROWDSTRIKE_API_KEY" />
                </div>
                <div>
                  <label className="text-xs text-forge-gray-medium mb-1 block">Secret Type</label>
                  <select className="forge-input w-full"><option>API Key</option><option>Token</option><option>OAuth Secret</option><option>Certificate</option><option>Password</option></select>
                </div>
                <div>
                  <label className="text-xs text-forge-gray-medium mb-1 block">Path</label>
                  <input className="forge-input w-full" placeholder="/secrets/category/name" />
                </div>
                <div>
                  <label className="text-xs text-forge-gray-medium mb-1 block">Secret Value</label>
                  <textarea className="forge-input w-full h-24 font-mono" placeholder="Enter or paste secret value" />
                </div>
                <button className="forge-btn-primary w-full">Create Secret</button>
              </div>
            </div>
          )}

          {activeTab === 'rotation' && (
            <div className="forge-card p-6">
              <h3 className="text-lg font-medium text-forge-white mb-4">Rotation Policies</h3>
              <div className="space-y-3">
                {mockSecrets.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-forge-gray-dark/30 rounded-lg">
                    <span className="font-mono text-sm text-forge-white">{s.name}</span>
                    <div className="flex items-center gap-4 text-sm text-forge-gray-medium">
                      <span>Every 90 days</span>
                      <span>Next: {s.expiresAt}</span>
                      <button className="forge-btn-secondary text-xs px-2 py-1"><Settings className="w-3 h-3 mr-1" /> Configure</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="forge-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-forge-gray-dark">
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Timestamp</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Action</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Secret</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {accessLog.map((log, i) => (
                    <tr key={i} className="border-b border-forge-gray-dark/50 hover:bg-forge-gray-dark/30">
                      <td className="px-6 py-3 text-sm text-forge-gray-light font-mono">{log.timestamp}</td>
                      <td className="px-6 py-3 text-sm text-forge-white">{log.user}</td>
                      <td className="px-6 py-3"><span className={`forge-badge ${log.action === 'Rotate' ? 'forge-badge-yellow' : log.action === 'Create' ? 'forge-badge-green' : 'forge-badge-blue'}`}>{log.action}</span></td>
                      <td className="px-6 py-3 font-mono text-sm text-forge-gray-light">{log.secret}</td>
                      <td className="px-6 py-3 text-sm text-forge-gray-light font-mono">{log.ip}</td>
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
