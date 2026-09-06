
import { describe, it, expect } from 'vitest';
import { NegotiationService } from '../../lib/trading/negotiationService';

describe('NegotiationService', () => {
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
    });
});
