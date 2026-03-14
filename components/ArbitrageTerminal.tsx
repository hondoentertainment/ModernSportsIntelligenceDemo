import React, { useMemo } from 'react';
import { CardInventory, TargetWatchlist } from '../types';
import { ArbitrageService } from '../lib/ArbitrageService';
import { Sparkles, TrendingDown, ArrowRight, Clock } from 'lucide-react';

interface ArbitrageTerminalProps {
    inventory: CardInventory[];
    targets: TargetWatchlist[];
}

export const ArbitrageTerminal: React.FC<ArbitrageTerminalProps> = ({ inventory, targets }) => {
    const signals = useMemo(() => ArbitrageService.getArbitrageSignals(inventory, targets), [inventory, targets]);

    // Filter for actionable buys/flashes first
    const buySignals = signals.filter(s => s.type !== 'Overvalued').slice(0, 4);

    if (buySignals.length === 0) {
        return (
            <div className="p-8 bg-brand-charcoal/50 border border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 h-full">
                <div className="bg-brand-lime/10 p-4 rounded-full text-brand-lime opacity-50">
                    <Sparkles size={32} />
                </div>
                <div>
                    <h4 className="font-bebas text-2xl tracking-widest text-slate-500">Market Efficient</h4>
                    <p className="text-slate-600 text-xs uppercase tracking-widest mt-1">No significant arbitrage gaps detected</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-brand-charcoal/50 border border-brand-lime/20 rounded-[2.5rem] p-8 space-y-6 h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-lime/10 transition-colors duration-1000"></div>

            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">Flash <span className="text-brand-lime">Arbitrage</span></h3>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">High-Conviction Deficiencies</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center text-brand-lime">
                    <TrendingDown size={24} />
                </div>
            </div>

            <div className="relative z-10 space-y-4">
                {buySignals.map((signal) => (
                    <div key={signal.id} className="p-4 bg-black/40 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-brand-lime/40 transition-all cursor-pointer group/item">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                {signal.type === 'Flash Sale' ? (
                                    <Clock size={16} className="text-brand-lime animate-pulse" />
                                ) : (
                                    <TrendingDown size={16} className="text-brand-blue" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover/item:text-brand-lime transition-colors">{signal.assetName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">{signal.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                    <span className="text-[10px] font-mono font-bold text-brand-lime">{signal.score}/100</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-lg font-mono font-black text-brand-green">{signal.delta.toFixed(1)}%</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted group-hover/item:text-white transition-colors flex items-center justify-end gap-1">
                                Review <ArrowRight size={10} />
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
