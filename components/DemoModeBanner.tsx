import React from 'react';
import { Link } from 'react-router-dom';
import { isActiveDemoSession, isPublicDemoSession } from '../lib/demoSession';

/** Persistent demo chrome. Real signed-in sessions do not render this. */
const DemoModeBanner: React.FC = () => {
  if (!isActiveDemoSession()) return null;
  const readOnly = isPublicDemoSession();
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-amber-100"
    >
      <p className="text-xs leading-relaxed">
        <span className="mr-2 font-black uppercase tracking-widest text-amber-300">Demo mode</span>
        {readOnly
          ? 'Seeded demo cards on this browser. Read-only — nothing is saved to an account.'
          : 'Seeded demo cards on this browser. This is not a signed-in account.'}
      </p>
      <Link
        to="/signup"
        className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-lime px-3 text-xs font-black uppercase tracking-widest text-brand-charcoal"
      >
        Sign up
      </Link>
    </div>
  );
};

export default DemoModeBanner;
