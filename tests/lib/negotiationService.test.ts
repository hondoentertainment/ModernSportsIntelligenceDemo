// @ts-nocheck

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
        expect(session.status).toBe('active');
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
