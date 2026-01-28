
import React, { useState, useEffect } from 'react';
import { X, Sun, TrendingUp, TrendingDown, ArrowUpRight, Zap } from 'lucide-react';
import { CardInventory } from '../types.ts';

interface MorningBriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: CardInventory[];
}

const MorningBriefingModal: React.FC<MorningBriefingModalProps> = ({ isOpen, onClose, inventory }) => {
    // Simulated daily stats
    const [stats, setStats] = useState({
        overnightGain: 0,
        topMover: { player: '', percent: 0 },
        marketTrend: '',
        marketTrendDirection: 'up' as 'up' | 'down' | 'flat'
    });

    useEffect(() => {
        if (isOpen && inventory.length > 0) {
            // Calculate simulated overnight gain (0.5% - 2.5%)
            const gainPercent = 0.5 + Math.random() * 2;
            const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
            const gainValue = totalValue * (gainPercent / 100);

            // Find a random "top mover"
            const randomCard = inventory[Math.floor(Math.random() * inventory.length)];

            // Random trend
            const trends = [
                { text: "Vintage Baseball is heating up", dir: 'up' },
                { text: "Modern Basketball liquidity tightening", dir: 'flat' },
                { text: "NFL Off-season buy window open", dir: 'up' },
                { text: "Prospect market showing volatility", dir: 'down' }
            ] as const;
            const trend = trends[Math.floor(Math.random() * trends.length)];

            setStats({
                overnightGain: gainValue,
                topMover: {
                    player: randomCard.player,
                    percent: 2 + Math.random() * 8
                },
                marketTrend: trend.text,
                marketTrendDirection: trend.dir
            });
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
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-mono font-bold text-brand-lime">
                                    +${Math.round(stats.overnightGain).toLocaleString()}
                                </span>
                                <TrendingUp size={16} className="text-brand-lime" />
                            </div>
                        </div>
                        <div className="p-5 bg-brand-charcoal/50 border border-slate-800 rounded-2xl">
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Top Mover</p>
                            <div className="truncate">
                                <div className="text-sm font-bold text-white truncate">{stats.topMover.player}</div>
                                <div className="text-xs font-mono font-bold text-brand-green">+{stats.topMover.percent.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-brand-lime/5 border border-brand-lime/10 rounded-2xl flex items-start gap-4">
                        <Zap className="text-brand-lime shrink-0 mt-1" size={18} />
                        <div>
                            <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest mb-1">Market Insight</p>
                            <p className="text-sm text-slate-200 font-medium leading-relaxed">
                                {stats.marketTrend}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-lime/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        Access Dashboard <ArrowUpRight size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MorningBriefingModal;
