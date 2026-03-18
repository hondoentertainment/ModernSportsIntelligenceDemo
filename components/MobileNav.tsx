
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
      {isInstallable && (
        <button
          onClick={promptInstall}
          className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-brand-lime animate-pulse"
          aria-label="Install App"
        >
          <Download size={20} />
          <span className="text-[10px] font-medium tracking-tight uppercase">Install</span>
        </button>
      )}
    </nav>
  );
};

export default MobileNav;
