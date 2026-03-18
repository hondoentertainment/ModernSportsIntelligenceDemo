import { store } from '../dal/syncStore';

// Phase 40: Marketplace and Network Effects

const REPUTATION_KEY = 'msi_market_reputation';
const REFERRAL_KEY = 'msi_market_referrals';

export interface ReputationProfile {
    userId: string;
    fillRate: number; // 0-1
    disputeRate: number; // 0-1
    onTimeRate: number; // 0-1
    score: number; // 0-100
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface ListingVerification {
    listingId: string;
    authenticityConfidence: number; // 0-1
    metadataCompleteness: number; // 0-1
    verified: boolean;
}

function tierFromScore(score: number): ReputationProfile['tier'] {
    if (score >= 90) return 'Platinum';
    if (score >= 75) return 'Gold';
    if (score >= 55) return 'Silver';
    return 'Bronze';
}

export function calculateReputation(userId: string, fillRate: number, disputeRate: number, onTimeRate: number): ReputationProfile {
    const score = Math.max(0, Math.min(100, Math.round((fillRate * 50) + ((1 - disputeRate) * 30) + (onTimeRate * 20))));
    return {
        userId,
        fillRate,
        disputeRate,
        onTimeRate,
        score,
        tier: tierFromScore(score)
    };
}

export function verifyListing(listingId: string, authenticityConfidence: number, metadataCompleteness: number): ListingVerification {
    return {
        listingId,
        authenticityConfidence,
        metadataCompleteness,
        verified: authenticityConfidence >= 0.8 && metadataCompleteness >= 0.7
    };
}

export function saveReputation(profile: ReputationProfile): void {
    const all = store.get<Record<string, ReputationProfile>>(REPUTATION_KEY, {});
    all[profile.userId] = profile;
    store.set(REPUTATION_KEY, all);
}

export function getReputation(userId: string): ReputationProfile | null {
    try {
        const all = store.get<Record<string, ReputationProfile>>(REPUTATION_KEY, {});
        return all[userId] || null;
    } catch {
        return null;
    }
}

export function addReferralEdge(fromUserId: string, toUserId: string): void {
    const graph = store.get<Record<string, string[]>>(REFERRAL_KEY, {});
    const edges = new Set(graph[fromUserId] || []);
    edges.add(toUserId);
    graph[fromUserId] = [...edges];
    store.set(REFERRAL_KEY, graph);
}

export function getReferralCount(userId: string): number {
    const graph = store.get<Record<string, string[]>>(REFERRAL_KEY, {});
    return (graph[userId] || []).length;
}
