
import React from 'react';
import { Search, Bell, ChevronDown, User } from 'lucide-react';

const Header: React.FC = () => {
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

        <button className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-brand-slate transition-all border border-transparent hover:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
            <User size={18} className="text-brand-lime" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none text-white">Alex Rivera</p>
            <p className="text-[10px] text-brand-muted mt-0.5 uppercase font-bold">Tier 1 Collector</p>
          </div>
          <ChevronDown size={14} className="text-brand-muted group-hover:text-white transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Header;
