'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  GitBranch,
  Play,
  Puzzle,
  Key,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  FileText,
  Users,
  BookOpen,
  Store,
} from 'lucide-react';
import { useForgeStore } from '@/stores/forge-store';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: GitBranch, label: 'Workflows', href: '/workflows' },
  { icon: Play, label: 'Executions', href: '/executions' },
  { icon: Zap, label: 'Event Orchestration', href: '/events' },
  { icon: Puzzle, label: 'Connectors', href: '/connectors' },
  { icon: Bell, label: 'Approvals', href: '/approvals' },
  { icon: BookOpen, label: 'Playbooks', href: '/playbooks' },
  { icon: Store, label: 'Marketplace', href: '/marketplace' },
  { icon: Key, label: 'Secrets', href: '/secrets' },
  { icon: Shield, label: 'Compliance', href: '/compliance' },
  { icon: BarChart3, label: 'Observability', href: '/observability' },
  { icon: FileText, label: 'Audit Log', href: '/audit' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const toggleSidebar = useForgeStore((s) => s.toggleSidebar);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-forge-black-secondary border-r border-forge-gray-dark z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-forge-gray-dark">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg forge-gradient flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm forge-text-gradient">BLACKSENTINEL</span>
              <span className="text-[10px] text-forge-gray-medium block -mt-1">FORGE</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg forge-gradient flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-forge-gray-medium hover:text-forge-white transition-colors p-1"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <item.icon className="w-5 h-5 text-forge-gray-medium group-hover:text-forge-orange transition-colors flex-shrink-0" />
                {!collapsed && (
                  <span className="text-forge-gray-light group-hover:text-forge-white transition-colors">
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Status indicator */}
      {!collapsed && (
        <div className="p-4 border-t border-forge-gray-dark">
          <div className="forge-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-forge-green animate-pulse" />
              <span className="text-xs font-medium text-forge-green">System Online</span>
            </div>
            <div className="text-[10px] text-forge-gray-medium">
              Engine: Active | AI: Processing | 12 Integrations
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
