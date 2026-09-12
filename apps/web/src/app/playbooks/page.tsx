'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import { useDebounce } from '@/hooks';
import {
  BookOpen,
  Search,
  Star,
  Download,
  Filter,
  Shield,
  Zap,
  Bug,
  Lock,
  Cloud,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const playbooks = [
  { id: '1', name: 'Phishing Incident Response', category: 'Incident Response', difficulty: 'Intermediate', rating: 4.8, installs: 1240, description: 'Complete playbook for handling phishing attacks from detection to remediation.', tags: ['phishing', 'email', 'SOC'] },
  { id: '2', name: 'Ransomware Containment', category: 'Incident Response', difficulty: 'Advanced', rating: 4.9, installs: 890, description: 'Emergency response procedures for ransomware outbreaks with containment strategies.', tags: ['ransomware', 'critical', 'containment'] },
  { id: '3', name: 'User Access Review', category: 'Compliance', difficulty: 'Beginner', rating: 4.5, installs: 2100, description: 'Quarterly access review automation for SOC2 and ISO27001 compliance.', tags: ['access', 'review', 'compliance'] },
  { id: '4', name: 'Vulnerability Patching', category: 'Vulnerability Mgmt', difficulty: 'Intermediate', rating: 4.6, installs: 1560, description: 'Automated patch management workflow with rollback capabilities.', tags: ['patching', 'vulnerability', 'maintenance'] },
  { id: '5', name: 'Cloud Security Audit', category: 'Cloud Security', difficulty: 'Advanced', rating: 4.7, installs: 780, description: 'AWS/Azure/GCP security posture assessment and hardening recommendations.', tags: ['cloud', 'audit', 'CSPM'] },
  { id: '6', name: 'SIEM Alert Tuning', category: 'SOC Operations', difficulty: 'Intermediate', rating: 4.3, installs: 1890, description: 'Systematic approach to tuning SIEM rules to reduce false positives.', tags: ['SIEM', 'tuning', 'optimization'] },
  { id: '7', name: 'Malware Analysis Pipeline', category: 'Threat Intel', difficulty: 'Advanced', rating: 4.8, installs: 650, description: 'Automated malware sandboxing and IOC extraction workflow.', tags: ['malware', 'sandbox', 'analysis'] },
  { id: '8', name: 'Incident Communication', category: 'Communication', difficulty: 'Beginner', rating: 4.2, installs: 3200, description: 'Automated stakeholder notification and status page updates during incidents.', tags: ['communication', 'notification', 'status'] },
  { id: '9', name: 'Data Breach Response', category: 'Incident Response', difficulty: 'Expert', rating: 4.9, installs: 420, description: 'Complete data breach response playbook with legal and regulatory requirements.', tags: ['breach', 'data', 'regulatory'] },
];

const categories = ['All', 'Incident Response', 'Compliance', 'Vulnerability Mgmt', 'Cloud Security', 'SOC Operations', 'Threat Intel', 'Communication'];

export default function PlaybooksPage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = playbooks.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const difficultyColor = (diff: string) => {
    if (diff === 'Expert') return 'forge-badge-red';
    if (diff === 'Advanced') return 'forge-badge-orange';
    if (diff === 'Intermediate') return 'forge-badge-yellow';
    return 'forge-badge-green';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-forge-orange fill-forge-orange' : 'text-forge-gray-dark'}`}
      />
    ));
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
                <BookOpen className="w-6 h-6" /> Playbooks
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Pre-built security response playbooks and procedures</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-gray-medium" />
              <input
                type="text"
                placeholder="Search playbooks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="forge-input w-full pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pb) => (
              <div key={pb.id} className="forge-card p-5 hover:border-forge-orange/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <span className="forge-badge-blue">{pb.category}</span>
                  <span className={`forge-badge ${difficultyColor(pb.difficulty)}`}>{pb.difficulty}</span>
                </div>
                <h3 className="font-medium text-forge-white mb-2 group-hover:text-forge-orange transition-colors">{pb.name}</h3>
                <p className="text-xs text-forge-gray-light mb-4 line-clamp-2">{pb.description}</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">{renderStars(pb.rating)}</div>
                  <span className="text-xs text-forge-gray-medium">{pb.rating}</span>
                </div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {pb.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-forge-gray-dark text-forge-gray-medium">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-forge-gray-dark">
                  <span className="text-xs text-forge-gray-medium flex items-center gap-1">
                    <Download className="w-3 h-3" /> {pb.installs.toLocaleString()} installs
                  </span>
                  <button className="forge-btn-primary text-xs py-1.5 px-3">Install</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
