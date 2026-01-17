
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { NAV_ITEMS } from '../constants.tsx';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const location = useLocation();

  return (
    <aside 
      className={`fixed top-0 left-0 h-full z-40 bg-brand-charcoal border-r border-slate-800 transition-all duration-300 hidden md:flex flex-col
      ${isOpen ? 'w-64' : 'w-20'}`}
    >
      <div className="p-6 flex items-center justify-between">
        <div className={`flex items-center gap-3 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
          <div className="bg-brand-lime p-1.5 rounded-lg shadow-lg shadow-brand-lime/20">
            <Zap className="text-brand-charcoal fill-current" size={20} />
          </div>
          <span className="font-bebas text-2xl tracking-wider whitespace-nowrap text-white">CardX</span>
        </div>
        <button 
          onClick={toggle}
          className="p-1.5 rounded-lg bg-brand-slate border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                ${isActive 
                  ? 'bg-brand-lime text-brand-charcoal font-bold' 
                  : 'text-brand-muted hover:bg-brand-slate hover:text-slate-100'}`}
            >
              <div className={`${isActive ? 'text-brand-charcoal' : 'text-brand-muted group-hover:text-brand-lime transition-colors'}`}>
                {item.icon}
              </div>
              {isOpen && <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{item.label}</span>}
              {!isOpen && (
                <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className={`p-5 rounded-2xl bg-brand-slate border border-slate-800 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 overflow-hidden'}`}>
          <p className="text-[10px] text-brand-muted font-black uppercase mb-3 tracking-widest">Portfolio Health</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold">Good</span>
            <span className="text-brand-lime text-xs font-bold">78%</span>
          </div>
          <div className="h-1 bg-brand-charcoal rounded-full overflow-hidden">
             <div className="h-full bg-brand-lime w-[78%]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
