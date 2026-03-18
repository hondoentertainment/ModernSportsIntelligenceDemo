/**
 * useUsageGate — enforces subscription usage limits.
 *
 * Returns gate functions that check limits before allowing actions.
 * Reads the cached profile from localStorage (msi_user_profile) and
 * the billing tier config from billingService.
 */

import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_TIERS, checkUsageLimit } from '../lib/utils/billingService';

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

    // Read current usage from cached profile
    let used = 0;
    try {
      const profile = localStorage.getItem('msi_user_profile');
      if (profile) {
        const parsed = JSON.parse(profile);
        used = parsed.ai_valuations_used ?? 0;
      }
    } catch {
      // ignore
    }

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
