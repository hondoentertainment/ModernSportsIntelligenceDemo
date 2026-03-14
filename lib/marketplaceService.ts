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
    const raw = localStorage.getItem(REPUTATION_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[profile.userId] = profile;
    localStorage.setItem(REPUTATION_KEY, JSON.stringify(all));
}

export function getReputation(userId: string): ReputationProfile | null {
    try {
        const raw = localStorage.getItem(REPUTATION_KEY);
        const all = raw ? JSON.parse(raw) : {};
        return all[userId] || null;
    } catch {
        return null;
    }
}

export function addReferralEdge(fromUserId: string, toUserId: string): void {
    const raw = localStorage.getItem(REFERRAL_KEY);
    const graph: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const edges = new Set(graph[fromUserId] || []);
    edges.add(toUserId);
    graph[fromUserId] = [...edges];
    localStorage.setItem(REFERRAL_KEY, JSON.stringify(graph));
}

export function getReferralCount(userId: string): number {
    const raw = localStorage.getItem(REFERRAL_KEY);
    const graph: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    return (graph[userId] || []).length;
}
