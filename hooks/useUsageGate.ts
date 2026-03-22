/**
 * useUsageGate — enforces subscription usage limits.
 *
 * Returns gate functions that check limits before allowing actions.
 * Reads the cached profile from SyncedStore (`msi_user_profile`, set by AuthContext)
 * and the billing tier config from billingService.
 */

import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/dal/syncStore';
import { SUBSCRIPTION_TIERS } from '../lib/utils/billingService';

type CachedProfile = { ai_valuations_used?: number } | null;

export interface UsageGateResult {
  /** Check if user can add another card. Returns { allowed: boolean; message?: string } */
  canAddCard: (currentCardCount: number) => { allowed: boolean; limit: number; message?: string };
  /** Check if user can use another AI valuation. Returns { allowed: boolean; message?: string } */
  canUseAiValuation: () => { allowed: boolean; limit: number; message?: string };
  /** The user's current tier */
  tier: string;
}

export function useUsageGate(): UsageGateResult {
  const { userTier, isDemoMode } = useAuth();

  const canAddCard = useCallback((currentCardCount: number) => {
    if (isDemoMode) return { allowed: true, limit: -1 };

    const tierConfig = SUBSCRIPTION_TIERS[userTier];
    const limit = tierConfig.limits.cards;

    if (limit === -1) return { allowed: true, limit: -1 };

    if (currentCardCount >= limit) {
      return {
        allowed: false,
        limit,
        message: `You've reached the ${limit}-card limit on the ${tierConfig.name} plan. Upgrade to add more cards.`,
      };
    }
    return { allowed: true, limit };
  }, [userTier, isDemoMode]);

  const canUseAiValuation = useCallback(() => {
    if (isDemoMode) return { allowed: true, limit: -1 };

    const tierConfig = SUBSCRIPTION_TIERS[userTier];
    const limit = tierConfig.limits.aiValuations;

    if (limit === -1) return { allowed: true, limit: -1 };

    const profile = store.get<CachedProfile>('msi_user_profile', null);
    const used =
      profile && typeof profile === 'object' ? (profile.ai_valuations_used ?? 0) : 0;

    if (used >= limit) {
      return {
        allowed: false,
        limit,
        message: `You've used all ${limit} AI valuations this month on the ${tierConfig.name} plan. Upgrade for more.`,
      };
    }
    return { allowed: true, limit };
  }, [userTier, isDemoMode]);

  return { canAddCard, canUseAiValuation, tier: userTier };
}
