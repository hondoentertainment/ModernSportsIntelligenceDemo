import { beforeEach, describe, expect, it } from 'vitest';
import { addReferralEdge, calculateReputation, getReferralCount, verifyListing } from '../../lib/trading/marketplaceService';

describe('marketplaceService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('computes reputation and verifies listing', () => {
        const rep = calculateReputation('u1', 0.9, 0.05, 0.95);
        const listing = verifyListing('l1', 0.9, 0.8);
        expect(rep.score).toBeGreaterThan(80);
        expect(listing.verified).toBe(true);
    });

    it('tracks referral edges', () => {
        addReferralEdge('u1', 'u2');
        addReferralEdge('u1', 'u3');
        expect(getReferralCount('u1')).toBe(2);
    });
});
