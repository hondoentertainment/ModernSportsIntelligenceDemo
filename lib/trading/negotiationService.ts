import { NegotiationSession, NegotiableItem } from '../../types';
import { getNegotiationResponse, getAgenticOffer } from '../utils/gemini';
import { getSelectedPlaybook, type NegotiationPlaybook } from './negotiationPlaybooks';
import {
    buildAgentPromptAddendum,
    buildSellerPromptAddendum,
    estimateSellerFirmness,
    playbookCounterThresholds,
} from './negotiationContext';

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
        const lotSize = Array.isArray(targetItem.lotItems) ? targetItem.lotItems.length : 0;
        const ask = targetItem.price || targetItem.currentValue || 100;
        const name = targetItem.player || targetItem.name || 'this card';
        const isLot = lotSize >= 2;
        return {
            id: crypto.randomUUID(),
            targetItem: {
                id: targetItem.id || crypto.randomUUID(),
                name,
                price: ask,
                image: targetItem.image || '',
                lotSize: isLot ? lotSize : undefined,
                pricingMode: isLot ? (targetItem.pricingMode || 'package') : undefined,
            },
            currentUserOffer: 0,
            sellerAsk: ask,
            maxWillingToPay,
            status: 'active',
            messages: [{
                id: crypto.randomUUID(),
                sender: 'seller',
                content: isLot
                    ? `I'm asking $${ask} for this ${lotSize}-card lot (${targetItem.pricingMode === 'sum' ? 'sum of singles' : 'package price'}). What's your offer?`
                    : `I'm asking $${ask} for this. What's your offer?`,
                timestamp: new Date().toISOString(),
                offerAmount: ask
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    static processUserOffer(
        session: NegotiationSession,
        offerAttributes: { amount: number, content?: string },
        playbook: NegotiationPlaybook = getSelectedPlaybook(),
    ): NegotiationSession {
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

        // Logic to determine Seller Response (playbook-aligned deterministic fallback)
        const spread = newSession.sellerAsk - offerAttributes.amount;
        const percentGap = newSession.sellerAsk > 0 ? spread / newSession.sellerAsk : 1;
        const thresholds = playbookCounterThresholds(playbook);
        const firmness = estimateSellerFirmness(percentGap, playbook);
        newSession.counterSource = 'deterministic';
        newSession.sellerFirmness = firmness.score;
        newSession.sellerFirmnessLabel = firmness.label;

        if (percentGap <= thresholds.acceptGapPct) {
            newSession.status = 'accepted';
            newSession.messages.push({
                id: crypto.randomUUID(),
                sender: 'seller',
                content: SELLER_RESPONSES.accept[Math.floor(Math.random() * SELLER_RESPONSES.accept.length)],
                timestamp: new Date().toISOString(),
                sentiment: 'positive'
            });
        } else if (percentGap > thresholds.lowballGapPct) {
            const nextAsk = Math.floor(newSession.sellerAsk * 0.95);
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
            const span = thresholds.concessionMax - thresholds.concessionMin;
            const move = spread * (thresholds.concessionMin + Math.random() * span);
            const nextAsk = Math.floor(newSession.sellerAsk - move);

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
        const playbook = getSelectedPlaybook();
        const percentGap = session.sellerAsk > 0
            ? (session.sellerAsk - offerAttributes.amount) / session.sellerAsk
            : 1;
        const firmness = estimateSellerFirmness(percentGap, playbook);
        const geminiResponse = await getNegotiationResponse(
            session.targetItem.name,
            session.targetItem.price,
            offerAttributes.amount,
            session.maxWillingToPay,
            session.sellerAsk,
            session.messages.map(m => `${m.sender}: ${m.content}`),
            undefined,
            { promptAddendum: buildSellerPromptAddendum(playbook, firmness) },
        );

        if (geminiResponse) {
            const next = this.applySellerResponse(session, offerAttributes, geminiResponse);
            next.counterSource = 'gemini';
            next.sellerFirmness = geminiResponse.sellerFirmness ?? firmness.score;
            next.sellerFirmnessLabel = firmness.label;
            return next;
        }
        return this.processUserOffer(session, offerAttributes, playbook);
    }

    private static applySellerResponse(
        session: NegotiationSession,
        offerAttributes: { amount: number; content?: string },
        response: { action: string; sentiment: string; message: string; counterAmount?: number; sellerFirmness?: number }
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

        const playbook = getSelectedPlaybook();
        const agentOffer = await getAgenticOffer(
            session.targetItem.name,
            session.targetItem.price || 100,
            session.sellerAsk,
            session.maxWillingToPay,
            session.currentUserOffer,
            session.messages.map(m => `${m.sender}: ${m.content}`),
            undefined,
            { promptAddendum: buildAgentPromptAddendum(playbook) },
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
