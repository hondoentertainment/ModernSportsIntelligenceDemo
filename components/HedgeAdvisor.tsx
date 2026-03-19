import React, { useMemo } from 'react';
import { CardInventory } from '../types';
import { CorrelationService, HedgeRecommendation } from '../lib/analytics/CorrelationService';
import { AlertTriangle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface HedgeAdvisorProps {
    inventory: CardInventory[];
    onDeployHedge?: () => void;
}

export const HedgeAdvisor: React.FC<HedgeAdvisorProps> = ({ inventory, onDeployHedge }) => {
    const recommendations = useMemo(() => CorrelationService.getHedgingRecommendations(inventory), [inventory]);

    const getImpactStyles = (impact: HedgeRecommendation['impact']) => {
        switch (impact) {
            case 'High': return { color: '#F87171', bg: 'rgba(248, 113, 113, 0.1)', icon: <AlertTriangle size={18} /> };
            case 'Medium': return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: <Zap size={18} /> };
            case 'Low': return { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.1)', icon: <ShieldCheck size={18} /> };
        }
    };

    if (recommendations.length === 0) {
        return (
            <div className="p-8 bg-brand-slate border border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 h-full">
                <div className="bg-brand-lime/10 p-4 rounded-full text-brand-lime">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h4 className="font-bebas text-2xl tracking-widest text-white">Stability Confirmed</h4>
                    <p className="text-brand-muted text-xs uppercase tracking-widest mt-1">Portfolio diversification at institutional parity</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hedge-advisor bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 h-full">
            <div>
                <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">Hedge <span className="text-brand-lime">Advisor</span></h3>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Strategic risk mitigation triggers</p>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[380px] no-scrollbar pr-2">
                {recommendations.map((rec) => {
                    const styles = getImpactStyles(rec.impact);
                    return (
                        <div key={rec.id} className="p-5 bg-brand-charcoal/30 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-all group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: styles.bg, color: styles.color }}>
                                        {styles.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-brand-lime transition-colors">{rec.title}</h4>
                                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: styles.color }}>{rec.impact} Impact Node</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-brand-muted font-medium leading-relaxed">
                                {rec.description}
                            </p>

                            <div className="pt-2">
                                <div className="flex items-center gap-2 text-[10px] font-black text-brand-lime uppercase tracking-widest">
                                    Recommendation <ArrowRight size={12} />
                                </div>
                                <p className="text-[11px] text-white mt-1 font-bold">
                                    {rec.action}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={onDeployHedge}
                className="w-full py-4 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-white rounded-2xl transition-all hover:border-brand-lime/30 hover:text-brand-lime"
            >
                Deploy Virtual Hedge Nodes
            </button>
        </div>
    );
};
