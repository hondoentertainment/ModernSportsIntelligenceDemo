
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, LogOut, Settings, Zap, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDALSyncStatus } from '../lib/dal/useDALSyncStatus';
import { useAlerts } from '../lib/utils/useAlerts';
import { useShortcutGlyph } from '../lib/utils/useShortcutGlyph';
import SwarmFeed from './SwarmFeed';

interface HeaderProps {
  onToggleWallHUD?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleWallHUD }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSwarmOpen, setIsSwarmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut, isDemoMode } = useAuth();
  const { syncing, hydrated, lastError } = useDALSyncStatus();
  const { unreadCount } = useAlerts();
  const glyph = useShortcutGlyph();
  const syncLabel = syncing ? 'saving' : !hydrated ? 'loading' : lastError ? 'error' : 'synced';
  const syncDotClass = syncing || !hydrated ? 'bg-brand-blue animate-bounce' : lastError ? 'bg-red-500' : 'bg-brand-lime animate-pulse';
  const syncTextClass = syncing || !hydrated ? 'text-brand-blue' : lastError ? 'text-red-400' : 'text-brand-lime';
  const navigate = useNavigate();
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        requestAnimationFrame(() => userMenuButtonRef.current?.focus());
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showDropdown]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Collector';
  const displayEmail = user?.email || 'demo@sportsintel.io';

  const hasUnread = unreadCount > 0;
  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount);
  const bellAriaLabel = hasUnread ? `Notifications (${unreadCount} unread)` : 'Notifications';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 glass-header border-b border-slate-800/50">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Search className="text-brand-muted group-focus-within:text-brand-lime transition-colors" size={18} />
          </div>
          <input
            id="omni-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards, players, sets..."
            aria-label="Search cards, players, and sets"
            className="w-full bg-brand-slate border border-slate-800 rounded-full py-2.5 pl-10 pr-4 text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-brand-lime transition-all placeholder:text-slate-500 font-medium"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <kbd
              className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100"
              aria-label={`Open command palette with ${glyph.combo('K')}`}
            >
              {glyph.combo('K')}
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5 ml-4">
        <button
          type="button"
          onClick={() => setIsSwarmOpen(true)}
          className="p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center text-brand-muted hover:text-brand-lime hover:bg-brand-slate rounded-full transition-all relative group"
          title="Open Swarm Intelligence"
          aria-label="Open Swarm Intelligence"
        >
          <Zap size={20} className="group-hover:animate-pulse" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-lime rounded-full"></span>
        </button>

        <button
          type="button"
          onClick={onToggleWallHUD}
          className="p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center text-brand-muted hover:text-brand-lime hover:bg-brand-slate rounded-full transition-all relative group"
          title="Institutional Wall HUD"
          aria-label="Institutional Wall HUD"
        >
          <Maximize2 size={20} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/alerts')}
          aria-label={bellAriaLabel}
          title={bellAriaLabel}
          data-testid="header-bell"
          className="p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center text-brand-muted hover:text-brand-lime hover:bg-brand-slate rounded-full transition-all relative"
        >
          <Bell size={20} />
          {hasUnread && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-brand-red text-white text-[9px] font-black flex items-center justify-center rounded-full px-1 shadow-lg"
              aria-hidden="true"
            >
              {badgeText}
            </span>
          )}
        </button>

        <div
          role="status"
          aria-live="polite"
          aria-label={syncLabel === 'synced' ? 'Cloud sync active' : syncLabel === 'saving' ? 'Saving data' : syncLabel === 'loading' ? 'Loading data' : `Sync error: ${lastError}`}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-charcoal border border-slate-800 rounded-full group cursor-help transition-all hover:bg-brand-slate"
          title={syncLabel === 'synced' ? 'Cloud Sync Active' : syncLabel === 'saving' ? 'Saving...' : syncLabel === 'loading' ? 'Loading...' : lastError ?? 'Sync Error'}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${syncDotClass}`}></div>
          <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${syncTextClass}`}>
            {syncLabel}
          </span>
          {lastError && (
            <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center" title={lastError}>
              <span className="text-[8px] text-red-500 font-bold">!</span>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

        <div className="relative">
          <button
            ref={userMenuButtonRef}
            type="button"
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

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div role="menu" className="absolute right-0 top-full mt-2 w-56 bg-brand-slate border border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-700">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
                </div>
                <div className="p-2" role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-xl transition-colors text-left"
                  >
                    <Settings size={16} aria-hidden />
                    Settings
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut size={16} aria-hidden />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <SwarmFeed isOpen={isSwarmOpen} onClose={() => setIsSwarmOpen(false)} />
    </header>
  );
};

export default Header;
