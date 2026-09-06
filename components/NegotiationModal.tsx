import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  Send,
  Bot,
  DollarSign,
  CheckCircle2,
  ShoppingBag,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Zap,
  Package,
} from 'lucide-react';
import { NegotiationSession, NegotiableItem } from '../types';
import { NegotiationService } from '../lib/trading/negotiationService';
import { recordNegotiation } from '../lib/trading/negotiationAnalytics';
import {
    getNegotiationPlaybooks,
    getSelectedPlaybook,
    getSelectedPlaybookId,
    setSelectedPlaybookId,
} from '../lib/trading/negotiationPlaybooks';
import { counterSourceLabel } from '../lib/trading/negotiationContext';
import {
  buildLotNegotiableItem,
  collectLotLines,
  quoteLot,
  type LotPricingMode,
} from '../lib/trading/lotNegotiation';
import { logger } from '../lib/logger';
import CardImage from './CardImage.tsx';
import ImageLightbox from './ImageLightbox.tsx';

interface NegotiationModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetItem: NegotiableItem | null;
    lotCatalog?: NegotiableItem[];
    onSuccess: (_finalPrice: number) => void;
}

const SENTIMENT_ICONS = {
    positive: <ThumbsUp className="w-3.5 h-3.5" />,
    neutral: <Minus className="w-3.5 h-3.5" />,
    negative: <ThumbsDown className="w-3.5 h-3.5" />,
    aggressive: <Zap className="w-3.5 h-3.5" />,
};

const NegotiationModal: React.FC<NegotiationModalProps> = ({
    isOpen,
    onClose,
    targetItem,
    lotCatalog = [],
    onSuccess,
}) => {
    const [session, setSession] = useState<NegotiationSession | null>(null);
    const [offerInput, setOfferInput] = useState('');
    const [maxWilling, setMaxWilling] = useState<string>('');
    const [step, setStep] = useState<'config' | 'arena' | 'result'>('config');
    const [agentThinking, setAgentThinking] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [pricingMode, setPricingMode] = useState<LotPricingMode>('package');
    const [playbookId, setPlaybookId] = useState(getSelectedPlaybookId);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recordedIds = useRef<Set<string>>(new Set());
    const userEditedMax = useRef(false);

    const catalog = useMemo(() => {
        const rows = [...lotCatalog];
        if (targetItem && !rows.some((row) => row.id && row.id === targetItem.id)) {
            rows.unshift(targetItem);
        }
        return rows;
    }, [lotCatalog, targetItem]);

    const selectedItems = useMemo(
        () => catalog.filter((item) => item.id && selectedIds.includes(item.id)),
        [catalog, selectedIds],
    );
    const lotLines = useMemo(() => collectLotLines(selectedItems), [selectedItems]);
    const quote = useMemo(() => quoteLot(lotLines, pricingMode), [lotLines, pricingMode]);
    const dealItem = useMemo(
        () => (lotLines.length > 0 ? buildLotNegotiableItem(lotLines, pricingMode) : targetItem),
        [lotLines, pricingMode, targetItem],
    );

    const persistOutcome = useCallback((next: NegotiationSession, outcome?: 'accepted' | 'walked') => {
        if (recordedIds.current.has(next.id)) return;
        recordedIds.current.add(next.id);
        try {
            recordNegotiation(next, getSelectedPlaybook().label, outcome);
        } catch {
            recordedIds.current.delete(next.id);
        }
    }, []);

    useEffect(() => {
        if (isOpen && targetItem) {
            setStep('config');
            setSession(null);
            setOfferInput('');
            setMaxWilling('');
            userEditedMax.current = false;
            setLightboxOpen(false);
            const seedIds = targetItem.id ? [targetItem.id] : [];
            if (targetItem.lotItems && targetItem.lotItems.length > 1 && targetItem.id) {
                setSelectedIds([targetItem.id]);
                setPricingMode(targetItem.pricingMode || 'package');
            } else {
                setSelectedIds(seedIds);
                setPricingMode('package');
            }
        }
    }, [isOpen, targetItem]);

    useEffect(() => {
        if (step !== 'config' || userEditedMax.current) return;
        if (quote.itemCount >= 1 && quote.suggestedMax > 0) {
            setMaxWilling(String(quote.suggestedMax));
        }
    }, [quote.itemCount, quote.suggestedMax, step]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.messages]);

    const toggleCatalogItem = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]));
    };

    const startSession = () => {
        if (!dealItem || !maxWilling) return;
        const newSession = NegotiationService.startNegotiation(dealItem, parseFloat(maxWilling));
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
                persistOutcome(updatedSession, 'accepted');
                setStep('result');
            }
        } catch  {
            const fallback = NegotiationService.processUserOffer(session, { amount });
            setSession(fallback);
            if (fallback.status === 'accepted') {
                persistOutcome(fallback, 'accepted');
                setStep('result');
            }
        } finally {
            setAgentThinking(false);
        }
    };

    const handleWalkAway = () => {
        if (session && step === 'arena') {
            persistOutcome(session, 'walked');
        }
        onClose();
    };

    const handleAutoAgent = async () => {
        if (!session || session.status !== 'active') return;

        setAgentThinking(true);
        try {
            // Artificial delay to make it feel like the agent is "working"
            await new Promise(resolve => setTimeout(resolve, 1500));

            const updatedSession = await NegotiationService.autoNegotiateRound(session);
            setSession(updatedSession);

            if (updatedSession.status === 'accepted') {
                persistOutcome(updatedSession, 'accepted');
                setStep('result');
            } else if (updatedSession.status === 'active') {
                // If the user wants to keep going, they can click again, 
                // or we can add a toggle for "Full Auto"
            }
        } catch (error) {
            logger.error("Auto-Agent failure:", error);
            const fallback = NegotiationService.processUserOffer(session, {
                amount: Math.min(session.maxWillingToPay, session.sellerAsk),
                content: `Let's close this at $${Math.min(session.maxWillingToPay, session.sellerAsk)}.`
            });
            setSession(fallback);
            if (fallback.status === 'accepted') {
                persistOutcome(fallback, 'accepted');
                setStep('result');
            }
        } finally {
            setAgentThinking(false);
        }
    };

    if (!isOpen || !targetItem || !dealItem) return null;

    const isLot = quote.itemCount >= 2;
    const displayName = dealItem.player || dealItem.name || 'Card';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleWalkAway} />

            <div className="relative w-full max-w-2xl bg-brand-charcoal border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-brand-charcoal/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bebas tracking-wide text-white">Negotiation <span className="text-brand-blue">Arena</span></h2>
                            <p className="text-[10px] uppercase tracking-widest text-brand-muted font-bold">
                                {session
                                    ? counterSourceLabel(session.counterSource)
                                    : isLot
                                        ? 'Demo lot · simulated seller'
                                        : 'Gemini when available · demo fallback otherwise'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleWalkAway} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors" aria-label="Close negotiation">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'config' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <CardImage
                                    src={dealItem.image}
                                    playerName={displayName}
                                    year={dealItem.year}
                                    manufacturer={dealItem.manufacturer}
                                    className="w-20 h-20 rounded-xl shrink-0"
                                    enableLightbox={true}
                                    onImageClick={() => setLightboxOpen(true)}
                                />
                                <div>
                                    <h3 className="font-bold text-lg text-white">{displayName}</h3>
                                    <p className="text-brand-muted text-sm">
                                        {isLot
                                            ? `${quote.itemCount} cards · ${quote.mode === 'package' ? 'package ask' : 'sum of singles'}`
                                            : `${dealItem.year || ''} ${dealItem.manufacturer || ''}`.trim()}
                                    </p>
                                    <p className="text-brand-lime font-mono font-bold mt-1 text-xl">${quote.ask || dealItem.price || dealItem.currentValue}</p>
                                </div>
                            </div>

                            {catalog.length > 1 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                            <Package size={16} /> Build a lot
                                        </p>
                                        <p className="text-[10px] uppercase tracking-widest text-brand-muted font-bold">
                                            Demo marketplace · not live tape
                                        </p>
                                    </div>
                                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {catalog.map((item) => {
                                            const id = item.id || item.player || item.name || 'item';
                                            const checked = selectedIds.includes(id);
                                            const lotCount = item.lotItems?.length ?? 0;
                                            return (
                                                <li key={id}>
                                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleCatalogItem(id)}
                                                            className="accent-brand-lime w-4 h-4"
                                                        />
                                                        <span className="flex-1 text-sm text-white">
                                                            {item.player || item.name}
                                                            {lotCount >= 2 && (
                                                                <span className="ml-2 text-[10px] uppercase tracking-widest text-brand-orange font-bold">
                                                                    {lotCount}-card lot
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="font-mono text-xs text-slate-400">
                                                            ${item.price || item.currentValue || 0}
                                                        </span>
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {isLot && (
                                <div className="space-y-3 rounded-2xl border border-brand-orange/20 bg-brand-orange/5 p-4">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPricingMode('package')}
                                            className={`flex-1 min-h-[44px] rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                pricingMode === 'package'
                                                    ? 'bg-brand-orange text-brand-charcoal'
                                                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                                            }`}
                                        >
                                            Package ${quote.packagePrice}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPricingMode('sum')}
                                            className={`flex-1 min-h-[44px] rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                pricingMode === 'sum'
                                                    ? 'bg-brand-orange text-brand-charcoal'
                                                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                                            }`}
                                        >
                                            Sum ${quote.sumAsk}
                                        </button>
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-1">
                                        {lotLines.map((line) => (
                                            <li key={line.id} className="flex justify-between gap-3">
                                                <span>{line.player || line.name}</span>
                                                <span className="font-mono text-slate-400">${line.price}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-xs text-slate-400">
                                        Package is a demo {quote.packageDiscountPct}% lot discount off the sum of singles — not a live dealer quote.
                                    </p>
                                    {getSelectedPlaybook().id !== 'bundle_friendly' && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPlaybookId('bundle_friendly')}
                                            className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:text-white"
                                        >
                                            Apply Bundle Discount playbook
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-300" htmlFor="arena-playbook">
                                    Negotiation playbook
                                </label>
                                <select
                                    id="arena-playbook"
                                    value={playbookId}
                                    onChange={(e) => {
                                        setSelectedPlaybookId(e.target.value);
                                        setPlaybookId(e.target.value);
                                    }}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-blue"
                                >
                                    {getNegotiationPlaybooks().map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500">
                                    {getSelectedPlaybook().agentDirective} Gemini uses this when available; otherwise the demo seller follows the same bands.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-300">Max Willing to Pay</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="number"
                                        value={maxWilling}
                                        onChange={e => {
                                            userEditedMax.current = true;
                                            setMaxWilling(e.target.value);
                                        }}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-mono font-bold focus:outline-none focus:border-brand-blue transition-colors"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    Your agent will not exceed this amount. The seller does not see this.
                                    {isLot ? ` Suggested ceiling $${quote.suggestedMax} (demo).` : ''}
                                </p>
                            </div>

                            <button
                                onClick={startSession}
                                disabled={!maxWilling || quote.itemCount < 1}
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
                                                <div className={`flex items-center gap-1 mb-1.5 text-[10px] font-bold uppercase tracking-wider ${msg.sentiment === 'positive' ? 'text-green-400' :
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
                                    <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleAutoAgent}
                                        disabled={agentThinking}
                                        className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Bot size={12} /> Auto-Negotiate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleWalkAway}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-400 transition-colors"
                                    >
                                        Walk away
                                    </button>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">
                                        Ask: ${session.sellerAsk} | Your Max: ${session.maxWillingToPay}
                                        {session.sellerFirmnessLabel ? ` | Seller: ${session.sellerFirmnessLabel}` : ''}
                                    </span>
                                </div>
                                {agentThinking && session.messages.some(m => m.content.includes('[AGENT]')) && (
                                    <div className="bg-brand-blue/5 border border-brand-blue/10 p-3 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-1">Agent Strategy</p>
                                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                            Comparing seller ask against market velocity. Staying within budget while maintaining deal momentum.
                                        </p>
                                    </div>
                                )}
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
                                <p className="text-brand-muted">
                                    You acquired {session.targetItem.lotSize && session.targetItem.lotSize >= 2 ? 'this lot' : 'this asset'} for <span className="text-brand-lime font-bold">${session.currentUserOffer}</span>.
                                </p>
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

            <ImageLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                src={dealItem.image}
                alt={displayName}
                caption={displayName ? `${displayName} • ${dealItem.year || ''} ${dealItem.manufacturer || ''}`.trim() : undefined}
            />
        </div>
    );
};

export default NegotiationModal;
