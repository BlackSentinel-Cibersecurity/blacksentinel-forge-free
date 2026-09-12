'use client';

import { Search, Bell, Moon, Sun, Menu, User } from 'lucide-react';
import { useForgeStore } from '@/stores/forge-store';

export function Header() {
  const { theme, setTheme, toggleSidebar, globalSearchQuery, setGlobalSearchQuery } =
    useForgeStore();

  return (
    <header className="h-16 bg-forge-black-secondary/80 backdrop-blur-sm border-b border-forge-gray-dark flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-forge-gray-medium hover:text-forge-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forge-gray-medium" />
          <input
            type="text"
            placeholder="Search workflows, connectors, actions..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="forge-input pl-10 w-96 text-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-forge-gray-medium bg-forge-gray-dark px-1.5 py-0.5 rounded">
            /
          </kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Real-time indicator */}
        <div className="flex items-center gap-2 text-xs text-forge-gray-medium">
          <div className="w-2 h-2 rounded-full bg-forge-green animate-pulse" />
          <span>Live</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-forge-gray-medium hover:text-forge-white transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative text-forge-gray-medium hover:text-forge-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-forge-red rounded-full text-[10px] flex items-center justify-center text-white font-bold">
            3
          </span>
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 text-forge-gray-medium hover:text-forge-white transition-colors">
          <div className="w-8 h-8 rounded-full bg-forge-gray-dark flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
