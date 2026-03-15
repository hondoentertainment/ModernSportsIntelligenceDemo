
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, LogOut, Settings, Terminal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseInventory } from '../lib/useSupabaseInventory';
import FeatureSearch from './FeatureSearch';

const Header: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut, isDemoMode } = useAuth();
  const { syncStatus, lastSyncError } = useSupabaseInventory();
  const navigate = useNavigate();

  const isCommand = searchQuery.startsWith('/');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Collector';
  const displayEmail = user?.email || 'demo@sportsintel.io';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 glass-header border-b border-slate-800/50">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isCommand ? (
              <Terminal className="text-brand-lime animate-pulse" size={16} />
            ) : (
              <Search className="text-brand-muted group-focus-within:text-brand-lime transition-colors" size={18} />
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isCommand ? "Enter terminal command (e.g. /scan, /buy, /compare)..." : "MSI Intel: Search card populations, market caps, or trajectories..."}
            aria-label="Search cards, commands, and market data"
            className={`w-full bg-brand-slate border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-slate-500 font-medium ${isCommand ? 'border-brand-lime/50 ring-brand-lime/20 text-brand-lime font-mono' : 'border-slate-800 focus:ring-brand-lime'}`}
          />
          {isCommand && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/30 text-[9px] font-black text-brand-lime uppercase tracking-widest animate-pulse">
              Terminal Active
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5 ml-4">
        <FeatureSearch />

        <button
          aria-label="Notifications"
          className="p-2 text-brand-muted hover:text-brand-lime hover:bg-brand-slate rounded-full transition-all relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-lime rounded-full" aria-hidden="true"></span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-charcoal border border-slate-800 rounded-full group cursor-help transition-all hover:bg-brand-slate" title={syncStatus === 'synced' ? 'Cloud Sync Active' : syncStatus === 'migrating' ? 'Migrating Data...' : 'Local Storage Mode'}>
          <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-brand-lime animate-pulse' : syncStatus === 'migrating' ? 'bg-brand-blue animate-bounce' : 'bg-slate-600'}`}></div>
          <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${syncStatus === 'synced' ? 'text-brand-lime' : syncStatus === 'migrating' ? 'text-brand-blue' : 'text-slate-500'}`}>
            {syncStatus}
          </span>
          {lastSyncError && (
            <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center" title={lastSyncError}>
              <span className="text-[8px] text-red-500 font-bold">!</span>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            aria-haspopup="menu"
            aria-expanded={showDropdown}
            aria-label={`User menu for ${displayName}`}
            className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-brand-slate transition-all border border-transparent hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <User size={18} className="text-brand-lime" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none text-white">
                {displayName}
                {isDemoMode && <span className="ml-1 text-amber-400">(Demo)</span>}
              </p>
              <p className="text-[10px] text-brand-muted mt-0.5 uppercase font-bold truncate max-w-[120px]">{displayEmail}</p>
            </div>
            <ChevronDown size={14} className={`text-brand-muted group-hover:text-white transition-all ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div role="menu" className="absolute right-0 top-full mt-2 w-56 bg-brand-slate border border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-700">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-xl transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

