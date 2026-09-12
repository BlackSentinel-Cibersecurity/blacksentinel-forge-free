'use client';

import { useEffect, useState } from 'react';
import {
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bot,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  Shield,
  Brain,
  GitBranch,
  Pause,
} from 'lucide-react';
import { useForgeStore } from '@/stores/forge-store';

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="forge-card p-5 group hover:border-forge-gray-medium transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              changeType === 'up' ? 'text-forge-green' : 'text-forge-red'
            }`}
          >
            {changeType === 'up' ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-forge-white mb-1">{value}</div>
      <div className="text-sm text-forge-gray-medium">{title}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity Item
// ---------------------------------------------------------------------------
function ActivityItem({
  title,
  description,
  time,
  status,
}: {
  title: string;
  description: string;
  time: string;
  status: 'success' | 'error' | 'running' | 'warning';
}) {
  const statusColors = {
    success: 'bg-forge-green',
    error: 'bg-forge-red',
    running: 'bg-forge-orange animate-pulse',
    warning: 'bg-forge-yellow',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-forge-gray-dark/50 last:border-0">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${statusColors[status]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-forge-white truncate">{title}</div>
        <div className="text-xs text-forge-gray-medium truncate">{description}</div>
      </div>
      <div className="text-xs text-forge-gray-medium whitespace-nowrap">{time}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Execution Row
// ---------------------------------------------------------------------------
function ExecutionRow({
  workflow,
  status,
  duration,
  triggeredBy,
}: {
  workflow: string;
  status: string;
  duration: string;
  triggeredBy: string;
}) {
  const statusStyles: Record<string, string> = {
    completed: 'forge-badge-green',
    running: 'forge-badge-orange',
    failed: 'forge-badge-red',
    paused: 'forge-badge-yellow',
    waiting: 'forge-badge-blue',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-forge-gray-dark/50 last:border-0 hover:bg-forge-gray-dark/20 transition-colors px-2 -mx-2 rounded">
      <div className="flex items-center gap-3">
        <GitBranch className="w-4 h-4 text-forge-gray-medium" />
        <div>
          <div className="text-sm font-medium text-forge-white">{workflow}</div>
          <div className="text-xs text-forge-gray-medium">by {triggeredBy}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-forge-gray-medium">{duration}</span>
        <span className={`forge-badge ${statusStyles[status] || 'forge-badge-blue'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Decision Card
// ---------------------------------------------------------------------------
function AIDecisionCard() {
  return (
    <div className="forge-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-forge-purple" />
        <h3 className="font-semibold text-forge-white">AI Decision Engine</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-forge-gray-medium">Decisions Today</span>
          <span className="text-sm font-bold text-forge-white">847</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-forge-gray-medium">Auto-executed</span>
          <span className="text-sm font-bold text-forge-green">723 (85.4%)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-forge-gray-medium">Pending Approval</span>
          <span className="text-sm font-bold text-forge-yellow">91</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-forge-gray-medium">Rejected</span>
          <span className="text-sm font-bold text-forge-red">33</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-forge-gray-dark/30 rounded-lg">
        <div className="text-xs text-forge-gray-medium mb-1">Latest Decision</div>
        <div className="text-sm text-forge-white">
          Isolate endpoint <span className="text-forge-orange">EP-2847</span> due to
          ransomware detection
        </div>
        <div className="text-xs text-forge-gray-medium mt-1">Confidence: 94.2% | Risk: High</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// System Health
// ---------------------------------------------------------------------------
function SystemHealth() {
  const services = [
    { name: 'Workflow Engine', status: 'healthy', latency: '12ms' },
    { name: 'AI Engine', status: 'healthy', latency: '45ms' },
    { name: 'Event Bus', status: 'healthy', latency: '3ms' },
    { name: 'Connector Service', status: 'healthy', latency: '8ms' },
    { name: 'API Gateway', status: 'healthy', latency: '15ms' },
    { name: 'Approval Service', status: 'healthy', latency: '6ms' },
  ];

  return (
    <div className="forge-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-forge-green" />
        <h3 className="font-semibold text-forge-white">System Health</h3>
      </div>

      <div className="space-y-2">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-forge-green" />
              <span className="text-sm text-forge-gray-light">{service.name}</span>
            </div>
            <span className="text-xs text-forge-gray-medium">{service.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
export function Dashboard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forge-white">Command Center</h1>
          <p className="text-sm text-forge-gray-medium mt-1">
            Real-time automation intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-forge-gray-medium">Last updated</div>
            <div className="text-sm font-mono text-forge-white">
              {time.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Automations"
          value="24"
          change="+12%"
          changeType="up"
          icon={Zap}
          color="bg-forge-orange"
        />
        <StatCard
          title="Executions Today"
          value="1,847"
          change="+23%"
          changeType="up"
          icon={Play}
          color="bg-forge-blue"
        />
        <StatCard
          title="Time Saved"
          value="342h"
          change="+18%"
          changeType="up"
          icon={Clock}
          color="bg-forge-green"
        />
        <StatCard
          title="Error Rate"
          value="0.3%"
          change="-0.2%"
          changeType="down"
          icon={AlertTriangle}
          color="bg-forge-red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Executions */}
        <div className="lg:col-span-2 forge-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-forge-white">Recent Executions</h3>
            <button className="text-xs text-forge-orange hover:text-forge-orange-bright transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-0">
            <ExecutionRow
              workflow="Phishing Response - Auto Contain"
              status="completed"
              duration="2.3s"
              triggeredBy="SIEM Alert"
            />
            <ExecutionRow
              workflow="Ransomware Isolation Protocol"
              status="running"
              duration="45s"
              triggeredBy="EDR Detection"
            />
            <ExecutionRow
              workflow="IAM Anomaly Investigation"
              status="completed"
              duration="8.1s"
              triggeredBy="User Behavior"
            />
            <ExecutionRow
              workflow="Vulnerability Patch Deployment"
              status="waiting"
              duration="--"
              triggeredBy="Scheduled"
            />
            <ExecutionRow
              workflow="Cloud Security Posture Check"
              status="completed"
              duration="1.7s"
              triggeredBy="Cron Job"
            />
            <ExecutionRow
              workflow="Insider Threat Detection"
              status="failed"
              duration="12.4s"
              triggeredBy="UEBA Alert"
            />
            <ExecutionRow
              workflow="DLP Policy Enforcement"
              status="completed"
              duration="0.8s"
              triggeredBy="API Webhook"
            />
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <SystemHealth />
          <AIDecisionCard />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="forge-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-forge-orange" />
            <h3 className="font-semibold text-forge-white">Recent Activity</h3>
          </div>
          <div>
            <ActivityItem
              title="Ransomware workflow executed"
              description="Isolated 3 endpoints, blocked 12 IOCs, created ServiceNow incident"
              time="2m ago"
              status="success"
            />
            <ActivityItem
              title="AI generated new playbook"
              description="Auto-generated phishing response playbook based on recent threats"
              time="8m ago"
              status="success"
            />
            <ActivityItem
              title="Connector sync failed"
              description="CrowdStrike API rate limit exceeded, retrying in 60s"
              time="15m ago"
              status="warning"
            />
            <ActivityItem
              title="Compliance check completed"
              description="SOC 2 Type II - 94% compliance score maintained"
              time="1h ago"
              status="success"
            />
            <ActivityItem
              title="Secret rotation completed"
              description="47 API keys rotated across 12 connectors"
              time="2h ago"
              status="success"
            />
          </div>
        </div>

        {/* Automation Performance */}
        <div className="forge-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-forge-orange" />
            <h3 className="font-semibold text-forge-white">Top Automations</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Phishing Auto-Response', runs: 1247, success: 99.2, time: '1.8s' },
              { name: 'Endpoint Isolation', runs: 892, success: 98.7, time: '2.1s' },
              { name: 'IOC Blocking', runs: 2341, success: 99.9, time: '0.3s' },
              { name: 'Vulnerability Scan', runs: 456, success: 97.4, time: '45s' },
              { name: 'IAM Policy Check', runs: 1023, success: 99.1, time: '3.2s' },
            ].map((auto, i) => (
              <div key={auto.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-forge-gray-medium w-4">{i + 1}</span>
                  <div>
                    <div className="text-sm text-forge-white">{auto.name}</div>
                    <div className="text-xs text-forge-gray-medium">{auto.runs} runs</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-forge-green">{auto.success}%</div>
                  <div className="text-xs text-forge-gray-medium">{auto.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export Play icon for internal use
function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
