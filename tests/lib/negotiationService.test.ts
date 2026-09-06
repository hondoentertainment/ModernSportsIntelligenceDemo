
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NegotiationService } from '../../lib/trading/negotiationService';
import { getPlaybookById } from '../../lib/trading/negotiationPlaybooks';
import { getNegotiationResponse } from '../../lib/utils/gemini';

vi.mock('../../lib/utils/gemini', async () => {
    const actual = await vi.importActual<typeof import('../../lib/utils/gemini')>('../../lib/utils/gemini');
    return {
        ...actual,
        getNegotiationResponse: vi.fn(),
        getAgenticOffer: vi.fn(),
    };
});

describe('NegotiationService', () => {
    beforeEach(() => {
        vi.mocked(getNegotiationResponse).mockReset();
    });

    const mockItem = {
        id: 'test-item-1',
        name: 'Test Card',
        price: 100,
        image: 'test.jpg'
    };

    it('should initialize a negotiation session correctly', () => {
        const session = NegotiationService.startNegotiation(mockItem, 120);

        expect(session.id).toBeDefined();
        expect(session.targetItem.id).toBe(mockItem.id);
        expect(session.maxWillingToPay).toBe(120);
        expect(session.sellerAsk).toBe(100);
        expect(session.messages).toHaveLength(1);
        expect(session.messages[0].sender).toBe('seller');
        expect(session.messages[0].content).toMatch(/asking \$100 for this\./);
        expect(session.status).toBe('active');
        expect(session.targetItem.lotSize).toBeUndefined();
    });

    it('starts a lot session with package copy', () => {
        const lot = {
            id: 'lot-1',
            name: 'Lot of 2: A, B',
            player: 'Lot of 2: A, B',
            price: 180,
            image: '',
            pricingMode: 'package' as const,
            lotItems: [
                { id: 'a', name: 'A', price: 100 },
                { id: 'b', name: 'B', price: 100 },
            ],
        };
        const session = NegotiationService.startNegotiation(lot, 170);
        expect(session.targetItem.lotSize).toBe(2);
        expect(session.targetItem.pricingMode).toBe('package');
        expect(session.messages[0].content).toMatch(/2-card lot \(package price\)/);
    });

    it('should accept an offer close to the ask price', () => {
        const session = NegotiationService.startNegotiation(mockItem, 120);
        // Offer 96 (4% deviation)
        const updatedSession = NegotiationService.processUserOffer(session, { amount: 96 });

        expect(updatedSession.status).toBe('accepted');
        expect(updatedSession.messages.length).toBeGreaterThan(1);
        const lastMessage = updatedSession.messages[updatedSession.messages.length - 1];
        expect(lastMessage.sender).toBe('seller');
        expect(lastMessage.sentiment).toBe('positive');
    });

    it('should reject a lowball offer', () => {
        const session = NegotiationService.startNegotiation(mockItem, 120);
        // Offer 50 (50% deviation)
        const updatedSession = NegotiationService.processUserOffer(session, { amount: 50 });

        expect(updatedSession.status).toBe('active'); // Should remain active but countered strict
        const lastMessage = updatedSession.messages[updatedSession.messages.length - 1];
        expect(lastMessage.sender).toBe('seller');
        expect(lastMessage.sentiment).toBe('negative');
        // Verify seller barely moved
        expect(updatedSession.sellerAsk).toBeGreaterThanOrEqual(90);
    });

    it('should counter a reasonable offer', () => {
        const session = NegotiationService.startNegotiation(mockItem, 120);
        // Offer 80 (20% deviation)
        const updatedSession = NegotiationService.processUserOffer(session, { amount: 80 });

        expect(updatedSession.status).toBe('active');
        const lastMessage = updatedSession.messages[updatedSession.messages.length - 1];
        expect(lastMessage.sender).toBe('seller');
        expect(lastMessage.sentiment).toBe('neutral');
        // Verify seller moved somewhat
        expect(updatedSession.sellerAsk).toBeLessThan(100);
        expect(updatedSession.sellerAsk).toBeGreaterThan(80);
        expect(updatedSession.counterSource).toBe('deterministic');
        expect(updatedSession.sellerFirmnessLabel).toBeTruthy();
    });

    it('uses a tighter accept band for Lowball & Walk', () => {
        const session = NegotiationService.startNegotiation(mockItem, 120);
        const playbook = getPlaybookById('lowball_walk')!;
        const updated = NegotiationService.processUserOffer(session, { amount: 96 }, playbook);
        expect(updated.status).toBe('active');
        expect(updated.counterSource).toBe('deterministic');
    });

    it('applies Gemini seller counters when the generate path returns a payload', async () => {
        vi.mocked(getNegotiationResponse).mockResolvedValueOnce({
            action: 'counter',
            sentiment: 'neutral',
            message: 'I can do 92 — simulated seller.',
            counterAmount: 92,
            sellerFirmness: 0.61,
            reasoning: 'Offer is constructive.',
        });
        const session = NegotiationService.startNegotiation(mockItem, 120);
        const updated = await NegotiationService.processUserOfferWithGemini(session, { amount: 80 });
        expect(updated.counterSource).toBe('gemini');
        expect(updated.sellerAsk).toBe(92);
        expect(updated.messages.at(-1)?.content).toMatch(/simulated seller/);
    });

    it('falls back to deterministic logic when Gemini returns null', async () => {
        vi.mocked(getNegotiationResponse).mockResolvedValueOnce(null);
        const session = NegotiationService.startNegotiation(mockItem, 120);
        const updated = await NegotiationService.processUserOfferWithGemini(session, { amount: 96 });
        expect(updated.counterSource).toBe('deterministic');
        expect(updated.status).toBe('accepted');
    });
});
