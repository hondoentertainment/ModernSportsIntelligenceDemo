// @ts-nocheck

import React from 'react';
import { TrendingUp, Shield, Zap, Sparkles, FileDown, ArrowUpRight } from 'lucide-react';

interface DeepDiverReportProps {
    cardName?: string;
}

const DeepDiverReport: React.FC<DeepDiverReportProps> = ({ cardName = "2024 Topps Chrome Elly De La Cruz" }) => {
    return (
        <div className="bg-brand-charcoal border border-slate-800 rounded-2xl overflow-hidden p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={120} className="text-brand-lime" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-lime/10 rounded-xl text-brand-lime">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bebas tracking-wide text-white">Analyst Desk</h3>
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Institutional Alpha Report</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-black text-white uppercase tracking-widest transition-all">
                        <FileDown size={14} /> Export PDF
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse"></div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Active Coverage: {cardName}</h4>
                        </div>
                        <div className="p-4 bg-brand-slate/50 border border-slate-800 rounded-xl space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Market Sentiment</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={14} className="text-brand-green" />
                                        <span className="text-sm font-bold text-white">Bullish / Accumulate</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Scarcity Alpha</p>
                                    <p className="text-sm font-bold text-white">Top 2% of Population</p>
                                </div>
                            </div>
                            <p className="text-xs text-brand-muted leading-relaxed italic">
                                "Recent performance hydration shows velocity-to-swing-miss parity at elite levels. Market liquidity is tightening as institutional hold-time increases."
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-brand-charcoal border border-slate-800 rounded-xl">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Breakout Probability</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-mono font-bold text-brand-lime">92.4%</span>
                                <Zap size={14} className="text-brand-lime animate-pulse" />
                            </div>
                        </div>
                        <div className="p-3 bg-brand-charcoal border border-slate-800 rounded-xl">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">ROI Projection (12mo)</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-mono font-bold text-white">+42.8%</span>
                                <TrendingUp size={14} className="text-brand-green" />
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-brand-lime text-brand-charcoal font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 group">
                        Unlock Full Narrative Intelligence
                        <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeepDiverReport;
