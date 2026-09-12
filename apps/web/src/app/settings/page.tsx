'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import {
  Settings,
  Shield,
  Bell,
  Plug,
  Globe,
  Clock,
  Key,
  Webhook,
  Mail,
  MessageSquare,
  Lock,
  Users,
  Smartphone,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'integrations'>('general');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold forge-text-gradient flex items-center gap-2">
                <Settings className="w-6 h-6" /> Settings
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Configure your BlackSentinel Forge instance</p>
            </div>
            <button className="forge-btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {([
              { key: 'general', label: 'General', icon: Globe },
              { key: 'security', label: 'Security', icon: Shield },
              { key: 'notifications', label: 'Notifications', icon: Bell },
              { key: 'integrations', label: 'Integrations', icon: Plug },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  activeTab === key ? 'forge-btn-primary' : 'forge-card text-forge-gray-light hover:text-forge-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {activeTab === 'general' && (
            <div className="forge-card p-6 max-w-2xl space-y-6">
              <div>
                <label className="text-xs text-forge-gray-medium mb-1 block">Instance Name</label>
                <input className="forge-input w-full" defaultValue="BlackSentinel Forge - Production" />
              </div>
              <div>
                <label className="text-xs text-forge-gray-medium mb-1 block">Timezone</label>
                <select className="forge-input w-full" defaultValue="UTC">
                  <option>UTC</option><option>America/New_York</option><option>Europe/London</option><option>Asia/Tokyo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-forge-gray-medium mb-1 block">Locale</label>
                <select className="forge-input w-full" defaultValue="en-US">
                  <option>en-US</option><option>en-GB</option><option>de-DE</option><option>ja-JP</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-forge-gray-medium mb-1 block">Default Dashboard Layout</label>
                <select className="forge-input w-full">
                  <option>Grid View</option><option>List View</option><option>Compact</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="forge-card p-6 max-w-2xl space-y-6">
              <h3 className="font-medium text-forge-white flex items-center gap-2"><Lock className="w-4 h-4" /> Authentication</h3>
              <div className="flex items-center justify-between p-3 bg-forge-gray-dark/30 rounded-lg">
                <div><div className="text-sm text-forge-white">Multi-Factor Authentication</div><div className="text-xs text-forge-gray-medium">Require MFA for all users</div></div>
                <div className="w-10 h-5 bg-forge-orange rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" /></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-forge-gray-dark/30 rounded-lg">
                <div><div className="text-sm text-forge-white">SSO Integration</div><div className="text-xs text-forge-gray-medium">Enable SAML/OIDC single sign-on</div></div>
                <div className="w-10 h-5 bg-forge-gray-medium rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5" /></div>
              </div>
              <div>
                <label className="text-xs text-forge-gray-medium mb-1 block">Session Timeout (minutes)</label>
                <input className="forge-input w-full" type="number" defaultValue={60} />
              </div>
              <div>
                <label className="text-xs text-forge-gray-medium mb-1 block">IP Whitelist</label>
                <textarea className="forge-input w-full h-20 font-mono text-sm" placeholder="10.0.0.0/8&#10;192.168.0.0/16" defaultValue="10.0.0.0/8&#10;192.168.0.0/16" />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="forge-card p-6 max-w-2xl space-y-6">
              <h3 className="font-medium text-forge-white flex items-center gap-2"><Mail className="w-4 h-4" /> Email Notifications</h3>
              <div className="space-y-2">
                {['Workflow failures', 'Approval requests', 'Security alerts', 'Compliance violations'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 bg-forge-gray-dark/30 rounded-lg">
                    <span className="text-sm text-forge-white">{item}</span>
                    <div className="w-10 h-5 bg-forge-orange rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" /></div>
                  </div>
                ))}
              </div>
              <h3 className="font-medium text-forge-white flex items-center gap-2 mt-4"><MessageSquare className="w-4 h-4" /> Slack Integration</h3>
              <div>
                <label className="text-xs text-forge-gray-medium mb-1 block">Webhook URL</label>
                <input className="forge-input w-full" placeholder="https://hooks.slack.com/services/..." />
              </div>
              <div>
                <label className="text-xs text-forge-gray-medium mb-1 block">Channel</label>
                <input className="forge-input w-full" defaultValue="#security-alerts" />
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6 max-w-2xl">
              <div className="forge-card p-6">
                <h3 className="font-medium text-forge-white flex items-center gap-2 mb-4"><Key className="w-4 h-4" /> API Keys</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Production API Key', created: '2026-06-01', lastUsed: '2 min ago' },
                    { name: 'CI/CD Pipeline Key', created: '2026-05-15', lastUsed: '1 hr ago' },
                    { name: 'Development Key', created: '2026-04-20', lastUsed: '3 days ago' },
                  ].map((key) => (
                    <div key={key.name} className="flex items-center justify-between p-3 bg-forge-gray-dark/30 rounded-lg">
                      <div>
                        <div className="text-sm text-forge-white font-mono">{key.name}</div>
                        <div className="text-xs text-forge-gray-medium">Created: {key.created} | Last used: {key.lastUsed}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="forge-btn-secondary text-xs px-2 py-1">Regenerate</button>
                        <button className="forge-btn-secondary text-xs px-2 py-1 text-forge-red">Revoke</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="forge-btn-primary text-sm mt-4"><Key className="w-4 h-4 mr-2 inline" /> Generate New Key</button>
              </div>
              <div className="forge-card p-6">
                <h3 className="font-medium text-forge-white flex items-center gap-2 mb-4"><Webhook className="w-4 h-4" /> Outbound Webhooks</h3>
                <div className="space-y-2">
                  {[
                    { url: 'https://api.example.com/webhook', events: 'workflow.completed, alert.triggered', status: 'active' },
                    { url: 'https://hooks.zapier.com/...', events: 'incident.created', status: 'active' },
                  ].map((wh) => (
                    <div key={wh.url} className="flex items-center justify-between p-3 bg-forge-gray-dark/30 rounded-lg">
                      <div>
                        <div className="text-sm text-forge-white font-mono text-xs">{wh.url}</div>
                        <div className="text-xs text-forge-gray-medium mt-1">{wh.events}</div>
                      </div>
                      <span className="forge-badge-green">{wh.status}</span>
                    </div>
                  ))}
                </div>
                <button className="forge-btn-primary text-sm mt-4"><Webhook className="w-4 h-4 mr-2 inline" /> Add Webhook</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
