'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useForgeStore } from '@/stores/forge-store';
import { useDebounce } from '@/hooks';
import {
  Store,
  Search,
  Star,
  Download,
  Filter,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap,
  Puzzle,
  Clock,
} from 'lucide-react';

const marketplaceItems = [
  { id: '1', name: 'Advanced Threat Intelligence Pack', author: 'BlackSentinel Labs', rating: 4.9, installs: 5600, version: '2.4.0', category: 'Threat Intel', featured: true, description: 'Premium threat intelligence feeds with automated IOC enrichment and correlation.', tags: ['threat-intel', 'IOC', 'enrichment'] },
  { id: '2', name: 'Cloud Security Suite', author: 'CloudForge Inc', rating: 4.7, installs: 3200, version: '1.8.2', category: 'Cloud Security', featured: true, description: 'Multi-cloud security monitoring and compliance automation for AWS, Azure, and GCP.', tags: ['cloud', 'CSPM', 'compliance'] },
  { id: '3', name: 'SOC Analyst Toolkit', author: 'SecurityOps Team', rating: 4.6, installs: 8900, version: '3.1.0', category: 'SOC Operations', featured: false, description: 'Essential toolkit for SOC analysts with alert triage and escalation workflows.', tags: ['SOC', 'alert', 'triage'] },
  { id: '4', name: 'Ransomware Defense Pack', author: 'CyberDefense Pro', rating: 4.8, installs: 2100, version: '2.0.1', category: 'Incident Response', featured: false, description: 'Comprehensive ransomware detection, containment, and recovery automation.', tags: ['ransomware', 'defense', 'recovery'] },
  { id: '5', name: 'Compliance Automation Hub', author: 'GRC Solutions', rating: 4.5, installs: 4500, version: '1.5.3', category: 'Compliance', featured: false, description: 'Automated compliance monitoring for SOC2, ISO27001, HIPAA, and PCI-DSS.', tags: ['compliance', 'GRC', 'audit'] },
  { id: '6', name: 'Network Forensics Engine', author: 'ForensicLab', rating: 4.4, installs: 1800, version: '1.2.0', category: 'Forensics', featured: false, description: 'Deep packet inspection and network traffic analysis for incident investigation.', tags: ['forensics', 'network', 'PCAP'] },
  { id: '7', name: 'Identity Protection Suite', author: 'IdentityFirst', rating: 4.7, installs: 3900, version: '2.3.1', category: 'Identity', featured: false, description: 'Identity threat detection and response with UEBA and privilege analytics.', tags: ['identity', 'UEBA', 'IAM'] },
  { id: '8', name: 'API Security Gateway', author: 'SecureAPI Co', rating: 4.6, installs: 2400, version: '1.9.0', category: 'API Security', featured: false, description: 'API security monitoring with OWASP Top 10 protection and rate limiting.', tags: ['API', 'OWASP', 'security'] },
];

const featuredItem = marketplaceItems.find((i) => i.featured)!;

export default function MarketplacePage() {
  const sidebarOpen = useForgeStore((s) => s.sidebarOpen);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const categories = ['All', ...new Set(marketplaceItems.map((i) => i.category))];
  const filtered = marketplaceItems.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-forge-orange fill-forge-orange' : 'text-forge-gray-dark'}`} />
      ))}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold forge-text-gradient flex items-center gap-2">
                <Store className="w-6 h-6" /> Marketplace
              </h1>
              <p className="text-forge-gray-medium text-sm mt-1">Discover and install connectors, playbooks, and integrations</p>
            </div>
          </div>

          {/* Featured Banner */}
          <div className="forge-card p-6 mb-6 forge-border-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-forge-orange/5 to-transparent" />
            <div className="relative flex items-center gap-6">
              <div className="flex-1">
                <span className="forge-badge-orange mb-2 inline-flex"><TrendingUp className="w-3 h-3 mr-1" /> Featured</span>
                <h2 className="text-xl font-bold text-forge-white mb-2">{featuredItem.name}</h2>
                <p className="text-sm text-forge-gray-light mb-3">{featuredItem.description}</p>
                <div className="flex items-center gap-4 text-sm text-forge-gray-medium">
                  <span>by {featuredItem.author}</span>
                  <span className="flex items-center gap-1">{renderStars(featuredItem.rating)} {featuredItem.rating}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {featuredItem.installs.toLocaleString()}</span>
                </div>
              </div>
              <button className="forge-btn-primary px-6 py-3">Install Now</button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-gray-medium" />
              <input
                type="text"
                placeholder="Search marketplace..."
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
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`forge-card p-5 hover:border-forge-orange/30 transition-all cursor-pointer group ${
                  selectedItem === item.id ? 'forge-border-glow' : ''
                }`}
                onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
              >
                <div className="h-24 bg-forge-gray-dark rounded-lg mb-3 flex items-center justify-center">
                  <Puzzle className="w-8 h-8 text-forge-gray-medium group-hover:text-forge-orange transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="forge-badge-blue">{item.category}</span>
                  <span className="text-xs text-forge-gray-medium">v{item.version}</span>
                </div>
                <h3 className="font-medium text-forge-white mb-1 group-hover:text-forge-orange transition-colors">{item.name}</h3>
                <p className="text-xs text-forge-gray-light mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(item.rating)}
                  <span className="text-xs text-forge-gray-medium">{item.rating}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-forge-gray-medium mb-3">
                  <span>by {item.author}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {item.installs.toLocaleString()}</span>
                </div>
                <button className="w-full forge-btn-primary text-xs py-2">Install</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
