import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isPublicDemoEnabled } from '../lib/demoSession';

export const PUBLIC_DEMO_LABEL = 'Try the demo — no account needed';

/** Login, signup, and other public pages. Hidden when the build flag is off. */
const PublicDemoEntry: React.FC<{ className?: string }> = ({ className }) => {
  const { demoLogin, isDemoMode } = useAuth();
  const navigate = useNavigate();
  if (!isDemoMode && !isPublicDemoEnabled()) return null;

  return (
    <button
      type="button"
      onClick={() => {
        demoLogin();
        navigate('/');
      }}
      className={
        className ??
        'w-full py-3 px-4 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-100 font-bold text-sm hover:bg-amber-500/25 transition-all flex items-center justify-center gap-2'
      }
    >
      <Zap size={16} aria-hidden />
      {PUBLIC_DEMO_LABEL}
    </button>
  );
};

export default PublicDemoEntry;
