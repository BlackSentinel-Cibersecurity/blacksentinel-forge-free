'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import {
  Zap,
  Webhook,
  Clock,
  Monitor,
  Terminal,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  Filter,
  ChevronDown,
  ChevronRight,
  Archive,
  Shield,
} from 'lucide-react';

const eventSources = [
  { name: 'SIEM Integration', type: 'siem', icon: Monitor, status: 'active', eventsToday: 2450, rate: '42/min' },
  { name: 'EDR Agents', type: 'edr', icon: Shield, status: 'active', eventsToday: 1820, rate: '31/min' },
  { name: 'Webhooks', type: 'webhook', icon: Webhook, status: 'active', eventsToday: 890, rate: '15/min' },
  { name: 'Cron Scheduler', type: 'cron', icon: Clock, status: 'active', eventsToday: 144, rate: '1/min' },
  { name: 'Manual Triggers', type: 'manual', icon: Terminal, status: 'active', eventsToday: 23, rate: '—' },
];

const recentEvents = [
  { id: '1', source: 'SIEM', type: 'alert.created', timestamp: '2 min ago', severity: 'high', title: 'Brute force detected on DC01' },
  { id: '2', source: 'EDR', type: 'endpoint.isolated', timestamp: '5 min ago', severity: 'critical', title: 'Host 10.0.1.45 isolated - malware' },
  { id: '3', source: 'Webhook', type: 'github.push', timestamp: '8 min ago', severity: 'low', title: 'Repository push to main branch' },
  { id: '4', source: 'SIEM', type: 'alert.triggered', timestamp: '12 min ago', severity: 'medium', title: 'Anomalous login pattern detected' },
  { id: '5', source: 'Cron', type: 'scan.completed', timestamp: '15 min ago', severity: 'low', title: 'Scheduled vulnerability scan finished' },
  { id: '6', source: 'EDR', type: 'threat.detected', timestamp: '18 min ago', severity: 'critical', title: 'Ransomware behavior on WS-PROD-03' },
  { id: '7', source: 'Manual', type: 'workflow.triggered', timestamp: '22 min ago', severity: 'low', title: 'User-triggered incident response' },
  { id: '8', source: 'Webhook', type: 'jira.issue', timestamp: '30 min ago', severity: 'medium', title: 'New high-priority ticket created' },
];

const deadLetterQueue = [
  { id: 'dlq-1', source: 'SIEM', eventType: 'alert.correlated', error: 'Timeout: upstream service unavailable', retries: 3, timestamp: '10:15:00Z' },
  { id: 'dlq-2', source: 'EDR', eventType: 'endpoint.telemetry', error: 'Parse error: unexpected schema', retries: 5, timestamp: '10:08:00Z' },
  { id: 'dlq-3', source: 'Webhook', eventType: 'github.webhook', error: 'Auth failed: invalid signature', retries: 2, timestamp: '09:45:00Z' },
];

export default function EventsPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [activeTab, setActiveTab] = useState<'sources' | 'events' | 'deadletter'>('events');

  const severityBadge = (sev: string) => {
    if (sev === 'critical') return <span className="forge-badge-red">Critical</span>;
    if (sev === 'high') return <span className="forge-badge-orange">High</span>;
    if (sev === 'medium') return <span className="forge-badge-yellow">Medium</span>;
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
                <Zap className="w-6 h-6" /> Event Orchestration
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Monitor and manage event sources and processing pipelines</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="forge-badge-green"><CheckCircle2 className="w-3 h-3 mr-1" />{eventSources.length} Sources Active</span>
              <span className="forge-badge-orange">{deadLetterQueue.length} Dead Letters</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {(['sources', 'events', 'deadletter'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab ? 'forge-btn-primary' : 'forge-card text-forge-gray-light hover:text-forge-white'
                }`}
              >
                {tab === 'deadletter' ? 'Dead Letter Queue' : tab}
              </button>
            ))}
          </div>

          {activeTab === 'sources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventSources.map((src) => (
                <div key={src.name} className="forge-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-forge-orange/10 flex items-center justify-center">
                      <src.icon className="w-5 h-5 text-forge-orange" />
                    </div>
                    <span className="forge-badge-green">{src.status}</span>
                  </div>
                  <h3 className="font-medium text-forge-white mb-1">{src.name}</h3>
                  <div className="text-xs text-forge-gray-medium mb-3 capitalize">Type: {src.type}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forge-gray-light">{src.eventsToday.toLocaleString()} events today</span>
                    <span className="text-forge-orange">{src.rate}</span>
                  </div>
                  <button className="mt-3 w-full forge-btn-secondary text-xs flex items-center justify-center gap-2">
                    <Settings className="w-3 h-3" /> Configure
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-2">
              {recentEvents.map((evt) => (
                <div key={evt.id} className="forge-card p-4 flex items-center gap-4 hover:border-forge-orange/30 transition-colors">
                  <div className="flex-shrink-0">
                    {evt.severity === 'critical' || evt.severity === 'high' ? (
                      <AlertTriangle className="w-5 h-5 text-forge-orange" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-forge-green" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-forge-white text-sm">{evt.title}</div>
                    <div className="text-xs text-forge-gray-medium flex items-center gap-2 mt-1">
                      <span className="forge-badge-blue">{evt.source}</span>
                      <span>{evt.type}</span>
                    </div>
                  </div>
                  {severityBadge(evt.severity)}
                  <span className="text-xs text-forge-gray-medium whitespace-nowrap">{evt.timestamp}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'deadletter' && (
            <div className="forge-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-forge-gray-dark">
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Source</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Event Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Error</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Retries</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Time</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-forge-gray-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deadLetterQueue.map((dlq) => (
                    <tr key={dlq.id} className="border-b border-forge-gray-dark/50 hover:bg-forge-gray-dark/30">
                      <td className="px-6 py-3"><span className="forge-badge-blue">{dlq.source}</span></td>
                      <td className="px-6 py-3 text-sm text-forge-white">{dlq.eventType}</td>
                      <td className="px-6 py-3 text-sm text-forge-red max-w-xs truncate">{dlq.error}</td>
                      <td className="px-6 py-3 text-sm text-forge-gray-light">{dlq.retries}</td>
                      <td className="px-6 py-3 text-sm text-forge-gray-light font-mono">{dlq.timestamp}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="forge-btn-secondary text-xs px-2 py-1"><RefreshCw className="w-3 h-3 mr-1" />Retry</button>
                          <button className="forge-btn-secondary text-xs px-2 py-1"><Archive className="w-3 h-3 mr-1" />Archive</button>
                        </div>
                      </td>
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
