import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  TrendingUp,
  Clock,
  Save,
  Info,
} from 'lucide-react';
import { CardInventory, ExitPlan } from '../types';
import { LiquidityService } from '../lib/analytics/liquidityService';
import { LiquidityBadge } from './LiquidityBadge';

interface ExitStrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: CardInventory;
    onSave: (_cardId: string, _exitPlan: ExitPlan) => void;
}

export const ExitStrategyModal: React.FC<ExitStrategyModalProps> = ({
    isOpen,
    onClose,
    card,
    onSave
}) => {
    const [targetPrice, setTargetPrice] = useState<number>(0);
    const [timeframe, setTimeframe] = useState<ExitPlan['timeframe']>('Medium (6-12m)');
    const [strategy, setStrategy] = useState<ExitPlan['strategy']>('Take Profit');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (card.exitPlan) {
            setTargetPrice(card.exitPlan.targetPrice);
            setTimeframe(card.exitPlan.timeframe);
            setStrategy(card.exitPlan.strategy);
            setNotes(card.exitPlan.notes || '');
        } else {
            // Generate AI recommendation
            const rec = LiquidityService.generateExitRecommendation(card);
            setTargetPrice(rec.targetPrice || 0);
            setTimeframe(rec.timeframe || 'Medium (6-12m)');
            setStrategy(rec.strategy || 'Take Profit');
            setNotes(rec.notes || '');
        }
    }, [card]);

    if (!isOpen) return null;

    const handleSave = () => {
        const exitPlan: ExitPlan = {
            id: card.exitPlan?.id || `exit-${Date.now()}`,
            targetPrice,
            timeframe,
            strategy,
            notes,
            createdAt: card.exitPlan?.createdAt || new Date().toISOString()
        };
        onSave(card.id, exitPlan);
        onClose();
    };

    const liquidityScore = card.liquidityScore || LiquidityService.calculateLiquidityScore(card);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-brand-slate border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-brand-charcoal/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">Exit Strategy Terminal</h2>
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">{card.player} - {card.year} {card.set}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Market Context */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-brand-charcoal/50 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-2">Liquidity Score</p>
                            <LiquidityBadge score={liquidityScore} size="lg" />
                        </div>
                        <div className="p-4 bg-brand-charcoal/50 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-2">Current Nav</p>
                            <p className="text-xl font-mono font-black text-brand-lime">${(card.currentValue || card.purchasePrice || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Configuration Form */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Target size={14} className="text-brand-lime" /> Target Exit Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted font-mono">$</span>
                                <input
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-12 pr-6 text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-lime/20 transition-all text-xl"
                                />
                            </div>
                            <p className="mt-2 text-[9px] text-brand-muted font-medium">Estimated ROI at target: <span className="text-brand-green">+{Math.round(((targetPrice - (card.purchasePrice || 1)) / (card.purchasePrice || 1)) * 100)}%</span></p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock size={14} className="text-brand-lime" /> Target Timeframe
                                </label>
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value as any)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-4 text-white hover:border-slate-700 transition-all focus:outline-none"
                                >
                                    <option>Short (3m)</option>
                                    <option>Medium (6-12m)</option>
                                    <option>Long (1-3y)</option>
                                    <option>Held (3y+)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Info size={14} className="text-brand-lime" /> Strategy Node
                                </label>
                                <select
                                    value={strategy}
                                    onChange={(e) => setStrategy(e.target.value as any)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-4 text-white hover:border-slate-700 transition-all focus:outline-none"
                                >
                                    <option>Take Profit</option>
                                    <option>Cut Loss</option>
                                    <option>Institutional Hold</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Intelligence Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Why are you targeting this exit?"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand-lime/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-brand-charcoal/20 border-t border-slate-800">
                    <button
                        onClick={handleSave}
                        className="w-full py-5 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-lime/20 active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                    >
                        <Save size={18} />
                        Commit Strategy
                    </button>
                </div>
            </div>
        </div>
    );
};
