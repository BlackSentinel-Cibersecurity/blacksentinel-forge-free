'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import {
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Timer,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Server,
  Wifi,
  XCircle,
} from 'lucide-react';

const metrics = [
  { label: 'Executions / Hour', value: '1,247', change: '+12%', icon: Activity, color: 'text-forge-orange' },
  { label: 'Error Rate', value: '0.8%', change: '-0.2%', icon: AlertTriangle, color: 'text-forge-red' },
  { label: 'P50 Latency', value: '42ms', change: '-5ms', icon: Timer, color: 'text-forge-green' },
  { label: 'P95 Latency', value: '180ms', change: '+12ms', icon: Timer, color: 'text-forge-yellow' },
  { label: 'P99 Latency', value: '450ms', change: '+30ms', icon: Timer, color: 'text-forge-orange' },
  { label: 'Uptime', value: '99.97%', change: '+0.01%', icon: TrendingUp, color: 'text-forge-green' },
];

const traces = [
  { id: 'tr-001', operation: 'Phishing Auto-Response', duration: '12.4s', status: 'success', timestamp: '10:30:15', spans: 5 },
  { id: 'tr-002', operation: 'SOC Alert Triage', duration: '3.2s', status: 'success', timestamp: '10:28:00', spans: 3 },
  { id: 'tr-003', operation: 'Ransomware Containment', duration: '45.1s', status: 'error', timestamp: '10:15:00', spans: 4 },
  { id: 'tr-004', operation: 'Threat Intel Enrichment', duration: '8.7s', status: 'success', timestamp: '10:10:00', spans: 4 },
  { id: 'tr-005', operation: 'User Provisioning', duration: '5.1s', status: 'success', timestamp: '10:05:00', spans: 4 },
  { id: 'tr-006', operation: 'Malware Sandbox Analysis', duration: '120.3s', status: 'success', timestamp: '09:50:00', spans: 5 },
];

const logs = [
  { level: 'error', timestamp: '10:30:18', service: 'ransomware-containment', message: 'Endpoint isolation failed: timeout after 30s' },
  { level: 'warn', timestamp: '10:29:55', service: 'siem-connector', message: 'Rate limit approaching: 450/500 requests per minute' },
  { level: 'info', timestamp: '10:28:00', service: 'soc-alert-triage', message: 'Workflow completed successfully: 3 nodes executed' },
  { level: 'info', timestamp: '10:25:00', service: 'threat-intel', message: 'IOC enrichment completed: 12 indicators processed' },
  { level: 'error', timestamp: '10:20:00', service: 'siem-connector', message: 'Connection lost to Splunk: reconnecting...' },
  { level: 'info', timestamp: '10:15:00', service: 'ai-engine', message: 'Model loaded: Threat Classifier v3.2 (99.4% accuracy)' },
  { level: 'warn', timestamp: '10:10:00', service: 'workflow-engine', message: 'High memory usage detected: 85% utilization' },
  { level: 'info', timestamp: '10:05:00', service: 'scheduler', message: 'Cron job executed: Vulnerability Scan Orchestrator' },
];

const services = [
  { name: 'Workflow Engine', status: 'healthy', latency: '12ms', cpu: '34%', memory: '62%' },
  { name: 'AI Engine', status: 'healthy', latency: '45ms', cpu: '78%', memory: '81%' },
  { name: 'SIEM Connector', status: 'degraded', latency: '120ms', cpu: '45%', memory: '55%' },
  { name: 'EDR Connector', status: 'healthy', latency: '8ms', cpu: '22%', memory: '40%' },
  { name: 'Scheduler', status: 'healthy', latency: '2ms', cpu: '5%', memory: '15%' },
  { name: 'API Gateway', status: 'healthy', latency: '15ms', cpu: '28%', memory: '45%' },
];

export default function ObservabilityPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [activeTab, setActiveTab] = useState<'metrics' | 'traces' | 'logs' | 'services'>('metrics');
  const [logFilter, setLogFilter] = useState('all');

  const filteredLogs = logs.filter((l) => logFilter === 'all' || l.level === logFilter);

  const statusIcon = (status: string) => {
    if (status === 'healthy') return <CheckCircle2 className="w-4 h-4 text-forge-green" />;
    if (status === 'degraded') return <AlertTriangle className="w-4 h-4 text-forge-yellow" />;
    return <XCircle className="w-4 h-4 text-forge-red" />;
  };

  const logLevelBadge = (level: string) => {
    if (level === 'error') return <span className="forge-badge-red">ERROR</span>;
    if (level === 'warn') return <span className="forge-badge-yellow">WARN</span>;
    return <span className="forge-badge-green">INFO</span>;
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
                <BarChart3 className="w-6 h-6" /> Observability
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Real-time metrics, traces, and service health monitoring</p>
            </div>
            <button className="forge-btn-secondary flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</button>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {(['metrics', 'traces', 'logs', 'services'] as const).map((tab) => (
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

          {activeTab === 'metrics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {metrics.map((m) => (
                <div key={m.label} className="forge-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <m.icon className={`w-5 h-5 ${m.color}`} />
                    <span className="text-xs text-forge-green flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {m.change}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-forge-white">{m.value}</div>
                  <div className="text-xs text-forge-gray-medium mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'traces' && (
            <div className="forge-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-forge-gray-dark">
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Operation</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Duration</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Spans</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {traces.map((t) => (
                    <tr key={t.id} className="border-b border-forge-gray-dark/50 hover:bg-forge-gray-dark/30 cursor-pointer">
                      <td className="px-6 py-3 text-sm text-forge-white">{t.operation}</td>
                      <td className="px-6 py-3">
                        <span className={`forge-badge ${t.status === 'success' ? 'forge-badge-green' : 'forge-badge-red'}`}>{t.status}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-forge-gray-light font-mono">{t.duration}</td>
                      <td className="px-6 py-3 text-sm text-forge-gray-light">{t.spans}</td>
                      <td className="px-6 py-3 text-sm text-forge-gray-light font-mono">{t.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logs' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                {['all', 'error', 'warn', 'info'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setLogFilter(level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      logFilter === level ? 'forge-btn-primary' : 'forge-card text-forge-gray-light hover:text-forge-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="forge-card p-4 font-mono text-sm space-y-1 max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-1 hover:bg-forge-gray-dark/30 px-2 rounded">
                    <span className="text-forge-gray-medium">{log.timestamp}</span>
                    {logLevelBadge(log.level)}
                    <span className="text-forge-blue">{log.service}</span>
                    <span className="text-forge-gray-light">{log.message}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div key={svc.name} className="forge-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-forge-gray-medium" />
                      <h3 className="font-medium text-forge-white">{svc.name}</h3>
                    </div>
                    {statusIcon(svc.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-forge-gray-dark/30 rounded">
                      <div className="text-forge-gray-medium">Latency</div>
                      <div className="text-forge-white font-mono">{svc.latency}</div>
                    </div>
                    <div className="p-2 bg-forge-gray-dark/30 rounded">
                      <div className="text-forge-gray-medium">CPU</div>
                      <div className="text-forge-white font-mono">{svc.cpu}</div>
                    </div>
                    <div className="p-2 bg-forge-gray-dark/30 rounded">
                      <div className="text-forge-gray-medium">Memory</div>
                      <div className="text-forge-white font-mono">{svc.memory}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
