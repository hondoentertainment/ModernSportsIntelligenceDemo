// @ts-nocheck

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';
import { NAV_ITEMS } from '../constants.tsx';
import { MOBILE_NAV_IDS } from '../lib/utils/productSurface';
import { usePWAInstall } from '../lib/utils/usePWAInstall';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const { isInstallable, promptInstall } = usePWAInstall();

  const mobileItems = NAV_ITEMS.filter(item =>
    MOBILE_NAV_IDS.includes(item.id as typeof MOBILE_NAV_IDS[number])
  );

  return (
    <nav aria-label="Mobile navigation" className="mobile-nav-safe md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around min-h-16 px-2">
      {mobileItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.id}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl
              ${isActive ? 'text-brand-lime' : 'text-brand-muted'}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium tracking-tight uppercase">{item.label}</span>
          </Link>
        );
      })}
      {isInstallable && (
        <button
          type="button"
          onClick={promptInstall}
          className="flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl text-brand-lime animate-pulse"
          aria-label="Install app"
        >
          <Download size={20} />
          <span className="text-[10px] font-medium tracking-tight uppercase">Install</span>
        </button>
      )}
    </nav>
  );
};

export default MobileNav;
