
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, DollarSign, CheckCircle2, ShoppingBag, Loader2, ThumbsUp, ThumbsDown, Minus, Zap } from 'lucide-react';
import { NegotiationSession, NegotiationMessage } from '../types';
import { NegotiationService } from '../lib/negotiationService';

interface NegotiationModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetItem: any; // Using any for flexibility with mock data
    onSuccess: (finalPrice: number) => void;
}

const SENTIMENT_ICONS = {
    positive: <ThumbsUp className="w-3.5 h-3.5" />,
    neutral: <Minus className="w-3.5 h-3.5" />,
    negative: <ThumbsDown className="w-3.5 h-3.5" />,
    aggressive: <Zap className="w-3.5 h-3.5" />,
};

const NegotiationModal: React.FC<NegotiationModalProps> = ({ isOpen, onClose, targetItem, onSuccess }) => {
    const [session, setSession] = useState<NegotiationSession | null>(null);
    const [offerInput, setOfferInput] = useState('');
    const [maxWilling, setMaxWilling] = useState<string>('');
    const [step, setStep] = useState<'config' | 'arena' | 'result'>('config');
    const [agentThinking, setAgentThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && targetItem) {
            setStep('config');
            setSession(null);
            setOfferInput('');
            setMaxWilling('');
        }
    }, [isOpen, targetItem]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.messages]);

    const startSession = () => {
        if (!targetItem || !maxWilling) return;
        const newSession = NegotiationService.startNegotiation(targetItem, parseFloat(maxWilling));
        setSession(newSession);
        setStep('arena');
    };

    const handleSendOffer = async () => {
        if (!session || !offerInput) return;

        const amount = parseFloat(offerInput);
        if (isNaN(amount)) return;

        setOfferInput('');
        setAgentThinking(true);

        try {
            const updatedSession = await NegotiationService.processUserOfferWithGemini(session, { amount });
            setSession(updatedSession);
            if (updatedSession.status === 'accepted') {
                setStep('result');
            }
        } catch (e) {
            const fallback = NegotiationService.processUserOffer(session, { amount });
            setSession(fallback);
            if (fallback.status === 'accepted') setStep('result');
        } finally {
            setAgentThinking(false);
        }
    };

    const handleWalkAway = () => {
        onClose();
    };

    const handleAutoAgent = async () => {
        if (!session) return;
        const nextOffer = Math.min(session.maxWillingToPay, Math.floor(session.currentUserOffer + (session.sellerAsk - session.currentUserOffer) * 0.5));

        setAgentThinking(true);
        try {
            const updatedSession = await NegotiationService.processUserOfferWithGemini(session, {
                amount: nextOffer,
                content: `[AUTO-AGENT] I'm authorized to offer $${nextOffer}. This is a fair market valuation.`
            });
            setSession(updatedSession);
            if (updatedSession.status === 'accepted') setStep('result');
        } catch {
            const fallback = NegotiationService.processUserOffer(session, {
                amount: nextOffer,
                content: `[AUTO-AGENT] I offer $${nextOffer}.`
            });
            setSession(fallback);
            if (fallback.status === 'accepted') setStep('result');
        } finally {
            setAgentThinking(false);
        }
    };

    if (!isOpen || !targetItem) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-brand-charcoal border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-brand-charcoal/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bebas tracking-wide text-white">Negotiation <span className="text-brand-blue">Arena</span></h2>
                            <p className="text-[10px] uppercase tracking-widest text-brand-muted font-bold">Powered by Gemini Logic</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'config' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <img src={targetItem.image} alt={targetItem.name} className="w-20 h-20 rounded-xl object-cover" />
                                <div>
                                    <h3 className="font-bold text-lg text-white">{targetItem.player || targetItem.name}</h3>
                                    <p className="text-brand-muted text-sm">{targetItem.year} {targetItem.manufacturer}</p>
                                    <p className="text-brand-lime font-mono font-bold mt-1 text-xl">${targetItem.price || targetItem.currentValue}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-300">Max Willing to Pay</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="number"
                                        value={maxWilling}
                                        onChange={e => setMaxWilling(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-mono font-bold focus:outline-none focus:border-brand-blue transition-colors"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Your agent will not exceed this amount. The seller does not see this.</p>
                            </div>

                            <button
                                onClick={startSession}
                                disabled={!maxWilling}
                                className="w-full py-4 bg-brand-blue hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-blue/20"
                            >
                                Enter Arena
                            </button>
                        </div>
                    )}

                    {step === 'arena' && session && (
                        <div className="space-y-6 h-full flex flex-col">
                            {/* Chat Feed */}
                            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
                                {session.messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user'
                                            ? 'bg-brand-blue text-white rounded-br-none'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                            }`}>
                                            {msg.sender === 'seller' && msg.sentiment && (
                                                <div className={`flex items-center gap-1 mb-1.5 text-[10px] font-bold uppercase tracking-wider ${
                                                    msg.sentiment === 'positive' ? 'text-green-400' :
                                                    msg.sentiment === 'negative' || msg.sentiment === 'aggressive' ? 'text-amber-400' : 'text-slate-400'
                                                }`}>
                                                    {SENTIMENT_ICONS[msg.sentiment as keyof typeof SENTIMENT_ICONS] || SENTIMENT_ICONS.neutral}
                                                    <span>{msg.sentiment}</span>
                                                </div>
                                            )}
                                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                            {msg.offerAmount && (
                                                <div className="mt-2 text-xs font-black uppercase tracking-widest opacity-70">
                                                    Offer: ${msg.offerAmount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {agentThinking && (
                                    <div className="flex justify-start">
                                        <div className="p-4 rounded-2xl rounded-bl-none bg-slate-800 border border-slate-700 flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 text-brand-teal animate-spin" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Controls */}
                            <div className="pt-4 border-t border-slate-800 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                        <input
                                            type="number"
                                            value={offerInput}
                                            onChange={e => setOfferInput(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-9 pr-3 text-white font-mono text-sm focus:outline-none focus:border-brand-blue"
                                            placeholder="Counter offer..."
                                            onKeyDown={e => e.key === 'Enter' && handleSendOffer()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendOffer}
                                        disabled={!offerInput}
                                        aria-label="Send Offer"
                                        className="p-3 bg-brand-blue rounded-xl text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={handleAutoAgent}
                                        disabled={agentThinking}
                                        className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Bot size={12} /> Auto-Negotiate
                                    </button>
                                    <span className="text-[10px] font-mono text-slate-500">
                                        Ask: ${session.sellerAsk} | Your Max: ${session.maxWillingToPay}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'result' && session && (
                        <div className="text-center space-y-6 py-8 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-brand-lime/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={48} className="text-brand-lime" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bebas text-white">Deal Secured!</h2>
                                <p className="text-brand-muted">You acquired this asset for <span className="text-brand-lime font-bold">${session.currentUserOffer}</span>.</p>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm text-slate-400">
                                <p>Saved ${(session.targetItem.price - session.currentUserOffer).toFixed(2)} off listing price.</p>
                            </div>

                            <button
                                onClick={() => {
                                    onSuccess(session.currentUserOffer);
                                    onClose();
                                }}
                                className="w-full py-4 bg-brand-lime text-brand-charcoal font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-brand-lime/20 flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={18} /> Add to Portfolio
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NegotiationModal;
