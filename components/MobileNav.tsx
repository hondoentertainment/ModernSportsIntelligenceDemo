
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants.tsx';

const MobileNav: React.FC = () => {
  const location = useLocation();
  // Filter for key mobile items using updated IDs from CardX
  const mobileItems = NAV_ITEMS.filter(item => 
    ['dashboard', 'collection', 'mlbstats', 'prospects', 'favorites'].includes(item.id)
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around h-16 px-2">
      {mobileItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.id}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors px-4 py-1.5 rounded-xl
              ${isActive ? 'text-brand-lime' : 'text-brand-muted'}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium tracking-tight uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
