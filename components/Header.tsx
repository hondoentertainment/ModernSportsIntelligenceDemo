
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Collector';
  const displayEmail = user?.email || 'demo@sportsintel.io';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-brand-charcoal/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-lime transition-colors" size={18} />
          <input
            type="text"
            placeholder="Global search across collection & MLB database..."
            className="w-full bg-brand-slate border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-lime transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5 ml-4">
        <button className="p-2 text-brand-muted hover:text-brand-lime hover:bg-brand-slate rounded-full transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-lime rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
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
              <div className="absolute right-0 top-full mt-2 w-56 bg-brand-slate border border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
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

