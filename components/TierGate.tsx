/**
 * TierGate — Subscription tier-based feature gating component.
 *
 * Wraps feature pages/components and checks if the user's subscription
 * tier grants access. Shows an upgrade prompt if not.
 *
 * Usage:
 *   <TierGate requiredTier="pro">
 *     <ExpensiveFeaturePage />
 *   </TierGate>
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ArrowUpRight } from 'lucide-react';

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'alpha';

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  alpha: 3,
};

interface TierGateProps {
  children: ReactNode;
  requiredTier: SubscriptionTier;
  featureName?: string;
}

function getUserTier(): SubscriptionTier {
  // Read tier from localStorage profile cache
  try {
    const profile = localStorage.getItem('msi_user_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed.subscription_tier && TIER_RANK[parsed.subscription_tier as SubscriptionTier] !== undefined) {
        return parsed.subscription_tier as SubscriptionTier;
      }
    }
  } catch {
    // ignore
  }
  return 'free';
}

const TierGate: React.FC<TierGateProps> = ({ children, requiredTier, featureName }) => {
  const { isDemoMode } = useAuth();

  // In demo mode, allow access to everything for evaluation
  if (isDemoMode) {
    return <>{children}</>;
  }

  const userTier = getUserTier();
  const hasAccess = TIER_RANK[userTier] >= TIER_RANK[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 p-8">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <Lock className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="text-xl font-bold text-white">
        {featureName || 'This Feature'} requires {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
      </h2>
      <p className="text-sm text-slate-400 max-w-md">
        Upgrade your subscription to unlock this feature and get access to
        advanced analytics, AI-powered insights, and institutional-grade tools.
      </p>
      <a
        href="#/billing"
        className="inline-flex items-center gap-2 px-6 py-3 bg-lime-400 text-gray-900 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors"
      >
        View Plans <ArrowUpRight size={14} />
      </a>
      <p className="text-xs text-slate-600">
        Current plan: <span className="text-slate-400 uppercase font-bold">{userTier}</span>
      </p>
    </div>
  );
};

export default TierGate;
export { TIER_RANK };
