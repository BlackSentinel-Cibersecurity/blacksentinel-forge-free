'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import {
  Users,
  Search,
  Mail,
  Shield,
  Clock,
  Activity,
  UserPlus,
  Crown,
  Eye,
} from 'lucide-react';

const teamMembers = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@blacksentinel.io', role: 'Admin', avatar: 'SC', lastActive: '2 min ago', workflows: 12, approvals: 48, status: 'online' },
  { id: '2', name: 'Marcus Rodriguez', email: 'marcus@blacksentinel.io', role: 'SOC Lead', avatar: 'MR', lastActive: '5 min ago', workflows: 8, approvals: 124, status: 'online' },
  { id: '3', name: 'Aisha Patel', email: 'aisha@blacksentinel.io', role: 'Analyst', avatar: 'AP', lastActive: '15 min ago', workflows: 5, approvals: 67, status: 'online' },
  { id: '4', name: 'James Wilson', email: 'james@blacksentinel.io', role: 'Analyst', avatar: 'JW', lastActive: '1 hr ago', workflows: 3, approvals: 32, status: 'away' },
  { id: '5', name: 'Elena Volkov', email: 'elena@blacksentinel.io', role: 'Engineer', avatar: 'EV', lastActive: '3 hrs ago', workflows: 15, approvals: 89, status: 'offline' },
  { id: '6', name: 'David Kim', email: 'david@blacksentinel.io', role: 'Viewer', avatar: 'DK', lastActive: '1 day ago', workflows: 0, approvals: 0, status: 'offline' },
];

const activityTimeline = [
  { user: 'Sarah Chen', action: 'Deployed workflow', target: 'Phishing Auto-Response v2.1', time: '2 min ago' },
  { user: 'Marcus Rodriguez', action: 'Approved execution', target: 'Endpoint Isolation', time: '5 min ago' },
  { user: 'Aisha Patel', action: 'Created playbook', target: 'Incident Escalation Guide', time: '15 min ago' },
  { user: 'James Wilson', action: 'Updated connector', target: 'Splunk Enterprise config', time: '1 hr ago' },
  { user: 'Elena Volkov', action: 'Rotated secret', target: 'AWS_ACCESS_KEY_ID', time: '3 hrs ago' },
  { user: 'Sarah Chen', action: 'Invited member', target: 'alex@blacksentinel.io', time: '4 hrs ago' },
];

const roles = ['Admin', 'SOC Lead', 'Analyst', 'Engineer', 'Viewer'];

export default function TeamPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  const filtered = teamMembers.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const roleIcon = (role: string) => {
    if (role === 'Admin') return <Crown className="w-3 h-3 text-forge-orange" />;
    if (role === 'SOC Lead') return <Shield className="w-3 h-3 text-forge-blue" />;
    if (role === 'Viewer') return <Eye className="w-3 h-3 text-forge-gray-medium" />;
    return <Activity className="w-3 h-3 text-forge-green" />;
  };

  const statusColor = (status: string) => {
    if (status === 'online') return 'bg-forge-green';
    if (status === 'away') return 'bg-forge-yellow';
    return 'bg-forge-gray-medium';
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
                <Users className="w-6 h-6" /> Team
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Manage team members, roles, and permissions</p>
            </div>
            <button className="forge-btn-primary flex items-center gap-2" onClick={() => setShowInvite(!showInvite)}>
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          </div>

          {showInvite && (
            <div className="forge-card p-6 mb-6 forge-border-glow">
              <h3 className="font-medium text-forge-white mb-4">Invite Team Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-forge-gray-medium mb-1 block">Email</label>
                  <input className="forge-input w-full" placeholder="colleague@company.com" />
                </div>
                <div>
                  <label className="text-xs text-forge-gray-medium mb-1 block">Role</label>
                  <select className="forge-input w-full">{roles.map((r) => <option key={r}>{r}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs text-forge-gray-medium mb-1 block">Name</label>
                  <input className="forge-input w-full" placeholder="Full name" />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="forge-btn-primary text-sm">Send Invite</button>
                <button className="forge-btn-secondary text-sm" onClick={() => setShowInvite(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-gray-medium" />
            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="forge-input w-full pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filtered.map((member) => (
              <div key={member.id} className="forge-card p-5 hover:border-forge-orange/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-forge-orange/20 flex items-center justify-center text-forge-orange font-bold text-sm">
                        {member.avatar}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-forge-black-secondary ${statusColor(member.status)}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-forge-white">{member.name}</h3>
                      <p className="text-xs text-forge-gray-medium flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="forge-badge-blue flex items-center gap-1">{roleIcon(member.role)} {member.role}</span>
                  <span className="text-xs text-forge-gray-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {member.lastActive}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-forge-gray-dark/30 rounded">
                    <div className="text-forge-gray-medium">Workflows</div>
                    <div className="text-forge-white font-bold">{member.workflows}</div>
                  </div>
                  <div className="p-2 bg-forge-gray-dark/30 rounded">
                    <div className="text-forge-gray-medium">Approvals</div>
                    <div className="text-forge-white font-bold">{member.approvals}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="forge-card p-6">
            <h3 className="font-medium text-forge-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activityTimeline.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-forge-gray-dark/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-forge-orange" />
                  <div className="flex-1">
                    <span className="text-sm text-forge-white font-medium">{item.user}</span>
                    <span className="text-sm text-forge-gray-light"> {item.action} </span>
                    <span className="text-sm text-forge-orange">{item.target}</span>
                  </div>
                  <span className="text-xs text-forge-gray-medium whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
