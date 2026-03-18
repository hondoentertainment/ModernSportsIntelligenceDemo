import { useState, useEffect, useCallback } from 'react';
import { fetchAgentRecommendations } from './differentiatorData';
import type { AgentRecommendationRecord } from '../types';

export interface UseAgentRecommendationsResult {
  recommendations: AgentRecommendationRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Production-ready hook for loading agent recommendations with loading,
 * error state, and refetch. Callers should show toast on error when appropriate.
 */
export function useAgentRecommendations(ownerUserId: string | undefined): UseAgentRecommendationsResult {
  const [recommendations, setRecommendations] = useState<AgentRecommendationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ownerUserId) {
      setRecommendations([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAgentRecommendations(ownerUserId);
      setRecommendations(data ?? []);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load recommendations';
      setError(message);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [ownerUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { recommendations, loading, error, refetch: load };
}
