import { NegotiationSession, NegotiationMessage, NegotiableItem } from '../types';
import { getNegotiationResponse, getAgenticOffer } from './gemini';

// Mock responses for the simulated seller (fallback when Gemini unavailable)
const SELLER_RESPONSES = {
    initial: [
        "I can't go that low, this is a rare piece.",
        "That's a bit of a lowball, but I'm listening.",
        "I appreciate the offer, but the market is higher right now."
    ],
    counter: [
        "Meet me in the middle at ${price}?",
        "I can do ${price}, but that's my floor.",
        "How about ${price}? It's a fair value."
    ],
    accept: [
        "You drive a hard bargain. Deal.",
        "Fine, I'll let it go for that.",
        "Accepted. It's yours."
    ],
    reject: [
        "No way, I'd rather keep it.",
        "That's too low. Verification failed.",
        "I'm walking away. Good luck finding another one."
    ]
};

export class NegotiationService {
    static startNegotiation(targetItem: NegotiableItem, maxWillingToPay: number): NegotiationSession {
        return {
            id: crypto.randomUUID(),
            targetItem: {
                id: targetItem.id,
                name: targetItem.player || targetItem.name,
                price: targetItem.price || targetItem.currentValue || 100,
                image: targetItem.image
            },
            currentUserOffer: 0,
            sellerAsk: targetItem.price || targetItem.currentValue || 100,
            maxWillingToPay,
            status: 'active',
            messages: [{
                id: crypto.randomUUID(),
                sender: 'seller',
                content: `I'm asking $${targetItem.price || 100} for this. What's your offer?`,
                timestamp: new Date().toISOString(),
                offerAmount: targetItem.price || 100
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    static processUserOffer(session: NegotiationSession, offerAttributes: { amount: number, content?: string }): NegotiationSession {
        const newSession = { ...session };

        // Add User Message
        newSession.messages.push({
            id: crypto.randomUUID(),
            sender: 'user',
            content: offerAttributes.content || `I offer $${offerAttributes.amount}.`,
            offerAmount: offerAttributes.amount,
            timestamp: new Date().toISOString()
        });
        newSession.currentUserOffer = offerAttributes.amount;

        // Logic to determine Seller Response
        const spread = newSession.sellerAsk - offerAttributes.amount;
        const percentGap = spread / newSession.sellerAsk;

        let sellerAction: 'accept' | 'counter' | 'reject' = 'counter';
        let nextAsk = newSession.sellerAsk;

        if (percentGap <= 0.05) {
            // Within 5%, accept
            sellerAction = 'accept';
            newSession.status = 'accepted';
            newSession.messages.push({
                id: crypto.randomUUID(),
                sender: 'seller',
                content: SELLER_RESPONSES.accept[Math.floor(Math.random() * SELLER_RESPONSES.accept.length)],
                timestamp: new Date().toISOString(),
                sentiment: 'positive'
            });
        } else if (percentGap > 0.4) {
            // User lowballed > 40%, reject or stiff counter
            sellerAction = 'reject'; // Or strict counter
            // For simulation, let's just counter strictly
            nextAsk = Math.floor(newSession.sellerAsk * 0.95); // seller barely moves
            newSession.messages.push({
                id: crypto.randomUUID(),
                sender: 'seller',
                content: SELLER_RESPONSES.initial[Math.floor(Math.random() * SELLER_RESPONSES.initial.length)] + ` I can't go below $${nextAsk}.`,
                offerAmount: nextAsk,
                timestamp: new Date().toISOString(),
                sentiment: 'negative'
            });
            newSession.sellerAsk = nextAsk;
        } else {
            // Standard counter: Meet halfway-ish
            const move = spread * (0.3 + Math.random() * 0.2); // Seller moves 30-50% of the gap
            nextAsk = Math.floor(newSession.sellerAsk - move);

            newSession.messages.push({
                id: crypto.randomUUID(),
                sender: 'seller',
                content: SELLER_RESPONSES.counter[Math.floor(Math.random() * SELLER_RESPONSES.counter.length)].replace('${price}', `$${nextAsk}`),
                offerAmount: nextAsk,
                timestamp: new Date().toISOString(),
                sentiment: 'neutral'
            });
            newSession.sellerAsk = nextAsk;
        }

        newSession.updatedAt = new Date().toISOString();
        return newSession;
    }

    /**
     * Process user offer with Gemini-driven seller response.
     * Falls back to mock logic if Gemini unavailable.
     */
    static async processUserOfferWithGemini(
        session: NegotiationSession,
        offerAttributes: { amount: number; content?: string }
    ): Promise<NegotiationSession> {
        const geminiResponse = await getNegotiationResponse(
            session.targetItem.name,
            session.targetItem.price,
            offerAttributes.amount,
            session.maxWillingToPay,
            session.sellerAsk,
            session.messages.map(m => `${m.sender}: ${m.content}`)
        );

        if (geminiResponse) {
            return this.applySellerResponse(session, offerAttributes, geminiResponse);
        }
        return this.processUserOffer(session, offerAttributes);
    }

    private static applySellerResponse(
        session: NegotiationSession,
        offerAttributes: { amount: number; content?: string },
        response: { action: string; sentiment: string; message: string; counterAmount?: number }
    ): NegotiationSession {
        const newSession = { ...session };
        newSession.messages.push({
            id: crypto.randomUUID(),
            sender: 'user',
            content: offerAttributes.content || `I offer $${offerAttributes.amount}.`,
            offerAmount: offerAttributes.amount,
            timestamp: new Date().toISOString()
        });
        newSession.currentUserOffer = offerAttributes.amount;

        if (response.action === 'accept') {
            newSession.status = 'accepted';
            newSession.messages.push({
                id: crypto.randomUUID(),
                sender: 'seller',
                content: response.message,
                timestamp: new Date().toISOString(),
                sentiment: (response.sentiment as any) || 'positive'
            });
        } else if (response.action === 'counter' && typeof response.counterAmount === 'number') {
            newSession.sellerAsk = Math.round(response.counterAmount);
            newSession.messages.push({
                id: crypto.randomUUID(),
                sender: 'seller',
                content: response.message,
                offerAmount: newSession.sellerAsk,
                timestamp: new Date().toISOString(),
                sentiment: (response.sentiment as any) || 'neutral'
            });
        } else {
            newSession.messages.push({
                id: crypto.randomUUID(),
                sender: 'seller',
                content: response.message,
                timestamp: new Date().toISOString(),
                sentiment: (response.sentiment as any) || 'negative'
            });
            newSession.sellerAsk = Math.floor(newSession.sellerAsk * 0.95);
        }

        newSession.updatedAt = new Date().toISOString();
        return newSession;
    }

    // Auto-Agent logic: The "Agent" negotiates on behalf of the user
    static async autoNegotiateRound(session: NegotiationSession): Promise<NegotiationSession> {
        if (session.status !== 'active') return session;

        const agentOffer = await getAgenticOffer(
            session.targetItem.name,
            session.targetItem.price || 100,
            session.sellerAsk,
            session.maxWillingToPay,
            session.currentUserOffer,
            session.messages.map(m => `${m.sender}: ${m.content}`)
        );

        if (!agentOffer) {
            // Fallback: simple increment
            const nextOffer = Math.min(
                session.maxWillingToPay,
                Math.floor(session.currentUserOffer + (session.sellerAsk - session.currentUserOffer) * 0.3)
            );
            return this.processUserOfferWithGemini(session, {
                amount: nextOffer,
                content: `I'm authorized to offer $${nextOffer}.`
            });
        }

        // Apply Agent's message and offer
        return this.processUserOfferWithGemini(session, {
            amount: agentOffer.offerAmount,
            content: `[AGENT] ${agentOffer.message}`
        });
    }
}
