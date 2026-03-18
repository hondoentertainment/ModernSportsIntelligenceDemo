
import React, { useState, useEffect } from 'react';
import { X, Sun, TrendingUp, TrendingDown, ArrowUpRight, Zap, History } from 'lucide-react';
import { CardInventory } from '../types.ts';
import { getHistoricalDelta, getMarketInsight } from '../lib/analytics/marketHistory.ts';

interface MorningBriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: CardInventory[];
}

const MorningBriefingModal: React.FC<MorningBriefingModalProps> = ({ isOpen, onClose, inventory }) => {
    const [delta, setDelta] = useState<any>(null);
    const [insight, setInsight] = useState('');
    const [isFirstSync, setIsFirstSync] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const historicalDelta = getHistoricalDelta(24);
            const marketInsight = getMarketInsight(inventory);

            setDelta(historicalDelta);
            setInsight(marketInsight);

            // If no delta, it means we only have 1 or 0 snapshots
            if (!historicalDelta && inventory.length > 0) {
                setIsFirstSync(true);
            }
        }
    }, [isOpen, inventory]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-brand-slate border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500">
                {/* Decorative Sun Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/20 blur-[80px] rounded-full"></div>

                <div className="p-8 space-y-8 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
                                <Sun size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bebas tracking-wide text-white">Morning Briefing</h2>
                                <p className="text-xs text-brand-muted font-medium">Your portfolio snapshot</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-brand-charcoal/50 border border-slate-800 rounded-2xl">
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Overnight Change</p>
                            {delta ? (
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl font-mono font-bold ${delta.isPositive ? 'text-brand-lime' : 'text-red-400'}`}>
                                        {delta.isPositive ? '+' : '-'}${Math.abs(Math.round(delta.gainValue)).toLocaleString()}
                                    </span>
                                    {delta.isPositive ? <TrendingUp size={16} className="text-brand-lime" /> : <TrendingDown size={16} className="text-red-400" />}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-500">
                                    <History size={16} className="animate-pulse" />
                                    <span className="text-sm font-bold uppercase tracking-widest">Awaiting Delta</span>
                                </div>
                            )}
                        </div>
                        <div className="p-5 bg-brand-charcoal/50 border border-slate-800 rounded-2xl">
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Portfolio Delta</p>
                            {delta ? (
                                <div>
                                    <div className={`text-xl font-mono font-bold ${delta.isPositive ? 'text-brand-green' : 'text-red-400'}`}>
                                        {delta.isPositive ? '+' : ''}{delta.gainPercent.toFixed(1)}%
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">vs Previous Sync</p>
                                </div>
                            ) : (
                                <div className="text-[10px] text-slate-500 font-medium">
                                    {isFirstSync ? 'Next sync will trigger comparison.' : 'Deploy assets to start tracking.'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 bg-brand-lime/5 border border-brand-lime/10 rounded-2xl flex items-start gap-4">
                        <Zap className="text-brand-lime shrink-0 mt-1" size={18} />
                        <div>
                            <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest mb-1">Market Insight</p>
                            <p className="text-sm text-slate-200 font-medium leading-relaxed">
                                {insight}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-lime/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        Access Dashboard <ArrowUpRight size={16} strokeWidth={3} />
                    </button>

                    {isFirstSync && (
                        <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest font-black animate-pulse">
                            System Calibration in Progress...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MorningBriefingModal;
