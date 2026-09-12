'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import { useDebounce } from '@/hooks';
import {
  Puzzle,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  Link,
  Unlink,
  RefreshCw,
  Shield,
  Wifi,
  WifiOff,
  Activity,
} from 'lucide-react';

const connectors = [
  { id: '1', name: 'CrowdStrike Falcon', category: 'EDR', status: 'connected', health: 'healthy', lastSync: '30 sec ago', icon: 'CS', version: '3.2.1' },
  { id: '2', name: 'Splunk Enterprise', category: 'SIEM', status: 'connected', health: 'healthy', lastSync: '1 min ago', icon: 'SP', version: '2.8.0' },
  { id: '3', name: 'Palo Alto Panorama', category: 'Firewall', status: 'connected', health: 'degraded', lastSync: '5 min ago', icon: 'PA', version: '1.4.2' },
  { id: '4', name: 'ServiceNow ITSM', category: 'ITSM', status: 'connected', health: 'healthy', lastSync: '2 min ago', icon: 'SN', version: '4.1.0' },
  { id: '5', name: 'Slack Workspace', category: 'Communication', status: 'connected', health: 'healthy', lastSync: '10 sec ago', icon: 'SL', version: '2.3.4' },
  { id: '6', name: 'VirusTotal', category: 'Threat Intel', status: 'connected', health: 'healthy', lastSync: '3 min ago', icon: 'VT', version: '3.0.1' },
  { id: '7', name: 'Microsoft Defender', category: 'EDR', status: 'disconnected', health: 'offline', lastSync: '2 days ago', icon: 'MD', version: '2.1.0' },
  { id: '8', name: 'AWS CloudTrail', category: 'Cloud', status: 'connected', health: 'healthy', lastSync: '45 sec ago', icon: 'AW', version: '1.7.3' },
  { id: '9', name: 'Jira Software', category: 'Project Mgmt', status: 'error', health: 'error', lastSync: '15 min ago', icon: 'JI', version: '2.5.1' },
  { id: '10', name: 'Okta SSO', category: 'Identity', status: 'connected', health: 'healthy', lastSync: '1 min ago', icon: 'OK', version: '3.4.0' },
  { id: '11', name: 'MISP Threat Intel', category: 'Threat Intel', status: 'connected', health: 'healthy', lastSync: '5 min ago', icon: 'MI', version: '1.2.0' },
  { id: '12', name: 'Terraform Cloud', category: 'Infrastructure', status: 'disconnected', health: 'offline', lastSync: '5 days ago', icon: 'TF', version: '1.0.2' },
];

export default function ConnectorsPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const debouncedSearch = useDebounce(search, 300);

  const categories = ['All', ...new Set(connectors.map((c) => c.category))];
  const filtered = connectors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const statusIcon = (status: string) => {
    if (status === 'connected') return <CheckCircle2 className="w-4 h-4 text-forge-green" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-forge-red" />;
    return <WifiOff className="w-4 h-4 text-forge-gray-medium" />;
  };

  const healthBadge = (health: string) => {
    if (health === 'healthy') return <span className="forge-badge-green"><Activity className="w-3 h-3 mr-1" />Healthy</span>;
    if (health === 'degraded') return <span className="forge-badge-yellow"><AlertTriangle className="w-3 h-3 mr-1" />Degraded</span>;
    if (health === 'error') return <span className="forge-badge-red"><XCircle className="w-3 h-3 mr-1" />Error</span>;
    return <span className="forge-badge"><WifiOff className="w-3 h-3 mr-1" />Offline</span>;
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
                <Puzzle className="w-6 h-6" /> Connectors
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Manage integrations with security tools and services</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="forge-badge-green">{connectors.filter((c) => c.status === 'connected').length} Connected</span>
              <span className="forge-badge-red">{connectors.filter((c) => c.status === 'error').length} Errors</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-gray-medium" />
              <input
                type="text"
                placeholder="Search connectors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="forge-input w-full pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((connector) => (
              <div key={connector.id} className="forge-card p-5 hover:border-forge-orange/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{connector.icon}</div>
                  {statusIcon(connector.status)}
                </div>
                <h3 className="font-medium text-forge-white mb-1 group-hover:text-forge-orange transition-colors">{connector.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="forge-badge-blue">{connector.category}</span>
                  <span className="text-xs text-forge-gray-medium">v{connector.version}</span>
                </div>
                <div className="mb-3">{healthBadge(connector.health)}</div>
                <div className="text-xs text-forge-gray-medium mb-3">Last sync: {connector.lastSync}</div>
                <div className="flex items-center gap-2">
                  {connector.status === 'connected' ? (
                    <>
                      <button className="flex-1 forge-btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                        <Settings className="w-3 h-3" /> Configure
                      </button>
                      <button className="flex-1 forge-btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                        <Wifi className="w-3 h-3" /> Test
                      </button>
                      <button className="p-1.5 forge-card hover:bg-forge-red/10 rounded-lg transition-colors" title="Disconnect">
                        <Unlink className="w-3.5 h-3.5 text-forge-red" />
                      </button>
                    </>
                  ) : (
                    <button className="w-full forge-btn-primary text-xs py-1.5 flex items-center justify-center gap-1">
                      <Link className="w-3 h-3" /> Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
