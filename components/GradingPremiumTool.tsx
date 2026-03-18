import React, { useState } from 'react';
import { CardInventory, GradingPremiumAnalysis } from '../types';
import { getGradingPremiumAnalysis } from '../lib/utils/gemini';
import { logger } from '../lib/logger';
import { Calculator, TrendingUp, AlertCircle, ChevronRight, Loader2, Sparkles, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';

interface Props {
    card: CardInventory;
}

const GradingPremiumTool: React.FC<Props> = ({ card }) => {
    const [analysis, setAnalysis] = useState<GradingPremiumAnalysis | null>(null);
    const [loading, setLoading] = useState(false);

    const performAnalysis = async () => {
        setLoading(true);
        try {
            const result = await getGradingPremiumAnalysis(card);
            setAnalysis(result);
        } catch (error) {
            logger.error('Grading analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case 'Submit': return 'text-brand-lime border-brand-lime/30 bg-brand-lime/10';
            case 'Hold Raw': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            case 'Sell Now': return 'text-brand-red border-brand-red/30 bg-brand-red/10';
            default: return 'text-slate-400 border-slate-700 bg-slate-800/50';
        }
    };

    return (
        <div className="space-y-6">
            {!analysis && !loading ? (
                <div className="p-8 rounded-3xl bg-brand-charcoal/50 border border-slate-800 text-center space-y-4">
                    <div className="w-16 h-16 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-lime mx-auto mb-2 border border-brand-lime/20">
                        <Calculator size={32} />
                    </div>
                    <h3 className="text-xl font-bebas text-white tracking-wide">Grading Spread Analysis</h3>
                    <p className="text-sm text-brand-muted max-w-xs mx-auto">
                        Analyze the current market spread between Raw and Gem Mint (PSA 10) copies to determine grading ROI.
                    </p>
                    <button
                        onClick={performAnalysis}
                        className="px-8 py-3 bg-brand-lime text-brand-charcoal font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-xl shadow-brand-lime/20"
                    >
                        RUN PREMIUM AUDIT
                    </button>
                </div>
            ) : loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-brand-lime" size={48} />
                    <div className="text-center">
                        <p className="font-bebas text-2xl text-white tracking-widest">CALCULATING ALPHA SPREAD...</p>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Institutional Data Grounding Active</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Recommendation Header */}
                    <div className={`p-6 rounded-3xl border ${getRecommendationColor(analysis!.recommendation)} flex items-center justify-between`}>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Strategic Verdict</p>
                            <h3 className="text-3xl font-bebas tracking-wide">{analysis!.recommendation}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Net Alpha</p>
                            <p className="text-3xl font-mono font-black text-white">
                                {analysis!.potentialNetGain > 0 ? '+' : ''}${Math.round(analysis!.potentialNetGain).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Price Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-brand-slate/30 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Raw Baseline</p>
                            <p className="text-lg font-mono font-black text-white">${Math.round(analysis!.rawPrice).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-brand-lime/5 border border-brand-lime/20 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1">
                                <Sparkles size={10} className="text-brand-lime" />
                            </div>
                            <p className="text-[9px] font-black text-brand-lime uppercase tracking-widest mb-2">PSA 10 Target</p>
                            <p className="text-lg font-mono font-black text-white">${Math.round(analysis!.psa10Price).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-brand-slate/30 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">PSA 9 / BGS 9</p>
                            <p className="text-lg font-mono font-black text-white">${Math.round(analysis!.psa9Price).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-brand-slate/30 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">BGS 9.5 Gem</p>
                            <p className="text-lg font-mono font-black text-white">${Math.round(analysis!.bgs95Price).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Rationale */}
                    <div className="p-6 bg-brand-charcoal/50 border border-slate-800 rounded-3xl relative">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="text-brand-lime" size={16} />
                            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Market Intelligence Rationale</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed italic">
                            "{analysis!.rationale}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                <DollarSign size={10} />
                                Calculated Fees: ${analysis!.gradingFees}
                            </div>
                            <button
                                onClick={() => setAnalysis(null)}
                                className="text-[10px] font-black text-brand-lime uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Recalculate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradingPremiumTool;
