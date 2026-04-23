// @ts-nocheck

import React, { useMemo, useState } from 'react';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory';
import { FiscalService } from '../lib/utils/FiscalService';
import { TaxStrategyAgent } from '../lib/utils/TaxStrategyAgent';
import { Shield, TrendingDown, AlertTriangle, Info, PieChart } from 'lucide-react';
import { TaxExitSimulator } from './TaxExitSimulator';

const FiscalHealthWidget: React.FC = () => {
    const { inventory } = useSupabaseInventory();
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    const taxData = FiscalService.calculateTaxLiability(inventory);
    const exposure = FiscalService.get1099KExposure(inventory);
    const insights = TaxStrategyAgent.generateInsights(inventory);
    const recommendations = useMemo(() => FiscalService.optimizeExitPlan(inventory).slice(0, 3), [inventory]);
    const selectedCard = inventory.find(card => card.id === selectedCardId) || null;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const thresholdPercent = Math.min(100, (exposure.volume / exposure.threshold) * 100);

    return (
        <div className="luminous-card rounded-[2rem] p-8 border border-slate-800 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/5 blur-[100px] rounded-full -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bebas tracking-wide text-white">Fiscal Shield Center</h3>
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest leading-none">Phase 27 Tax Intelligence</p>
                        </div>
                    </div>
                    <div className="text-[8px] font-black text-brand-lime uppercase tracking-[0.2em] px-2 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full">Swarm Active</div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Est. Tax Liability</p>
                        <p className="text-3xl font-mono font-bold text-red-400">{formatCurrency(taxData.total)}</p>
                        <div className="flex gap-3 mt-1 text-[9px] font-bold uppercase">
                            <span className="text-white/40">ST: <span className="text-white/60">{formatCurrency(taxData.shortTerm)}</span></span>
                            <span className="text-white/40">LT: <span className="text-white/60">{formatCurrency(taxData.longTerm)}</span></span>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">1099-K Progress</p>
                            <span className="text-[10px] font-mono text-white/50">{formatCurrency(exposure.volume)}</span>
                        </div>
                        <div className="h-2.5 bg-brand-charcoal rounded-full overflow-hidden border border-slate-800">
                            <div
                                className={`h-full transition-all duration-1000 ${exposure.isNearThreshold ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'bg-brand-blue shadow-[0_0_12px_rgba(59,130,246,0.4)]'}`}
                                style={{ width: `${thresholdPercent}%` }}
                            />
                        </div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mt-2 text-right tracking-widest">Threshold: {formatCurrency(exposure.threshold)}</p>
                    </div>
                </div>

                {/* Agent Insights Swarm */}
                <div className="space-y-3 pt-4 border-t border-slate-800/50">
                    <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Fiscal Strategist Insights</h4>
                    {insights.slice(0, 2).map((insight, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl flex gap-3 items-start border ${insight.sentiment === 'negative' ? 'bg-red-500/5 border-red-500/10 text-red-200/80' :
                                insight.sentiment === 'positive' ? 'bg-brand-lime/5 border-brand-lime/10 text-brand-lime/80' :
                                    'bg-white/5 border-white/5 text-white/60'
                            }`}>
                            {insight.sentiment === 'negative' ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> :
                                insight.sentiment === 'positive' ? <TrendingDown className="w-3.5 h-3.5 mt-0.5 shrink-0" /> :
                                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                            <p className="text-[11px] leading-relaxed font-medium">{insight.insight}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">After-Tax Exit Optimizer</h4>
                        <span className="text-[8px] font-black uppercase tracking-[0.18em] text-brand-lime">Top 3</span>
                    </div>
                    {recommendations.map(recommendation => (
                        <button
                            key={recommendation.cardId}
                            onClick={() => setSelectedCardId(recommendation.cardId)}
                            className="w-full text-left p-4 rounded-2xl border border-slate-800 bg-brand-charcoal/50 hover:border-brand-lime/30 transition-all"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-white">{recommendation.assetName}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{recommendation.recommendedAction} via {recommendation.targetVenue}</p>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-lime">
                                    {recommendation.liftVsBase > 0 ? `+$${recommendation.liftVsBase.toFixed(0)}` : 'Stage'}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {selectedCard && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedCardId(null)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <TaxExitSimulator card={selectedCard} onClose={() => setSelectedCardId(null)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiscalHealthWidget;
