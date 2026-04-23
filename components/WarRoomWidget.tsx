// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory';
import { MultiAgentService } from '../lib/utils/MultiAgentService';
import { CollaborativeThesis } from '../types';
import { Brain, RefreshCw, Target, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CatalystEngine } from '../lib/utils/catalystEngine';
import { WidgetErrorBoundary } from './ui/WidgetErrorBoundary';

const WarRoomWidget: React.FC = () => {
    const { inventory } = useSupabaseInventory();
    const [thesis, setThesis] = useState<CollaborativeThesis | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const scenarios = CatalystEngine.generateScenarios(inventory).slice(0, 2);

    const generateThesis = async () => {
        setIsGenerating(true);
        const result = await MultiAgentService.getCollaborativeThesis(inventory);
        if (result) {
            setThesis(result);
        }
        setIsGenerating(false);
    };

    useEffect(() => {
        if (inventory.length > 0 && !thesis) {
            generateThesis();
        }
    }, [inventory]);

    return (
        <WidgetErrorBoundary title="Analyst War Room">
        <div className="luminous-card rounded-[2rem] p-8 border border-slate-800 relative overflow-hidden group shadow-2xl">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-lime/10 rounded-xl text-brand-lime">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bebas tracking-wide text-white">Analyst War Room</h3>
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest leading-none">Committee Sentiment</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); generateThesis(); }}
                        disabled={isGenerating || inventory.length === 0}
                        className="p-2 hover:bg-slate-800 rounded-lg text-brand-muted hover:text-brand-lime transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                    </button>
                </div>

                {isGenerating ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-800 rounded w-full" />
                        <div className="h-4 bg-slate-800 rounded w-11/12" />
                    </div>
                ) : thesis ? (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-300 leading-relaxed font-medium line-clamp-2">
                            {thesis.summary}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={14} className="text-brand-lime" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Bullish Bias</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-brand-orange" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Risk Guarded</span>
                            </div>
                        </div>

                        {scenarios.length > 0 && (
                            <div className="space-y-2">
                                {scenarios.map(scenario => (
                                    <div key={scenario.id} className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white">{scenario.headline}</p>
                                        <p className="text-[9px] text-slate-400 mt-1">{scenario.triggerWindow} | {scenario.suggestedAction} | {scenario.expectedMovePct}% setup</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            to="/guilds"
                            className="w-full py-3 bg-brand-charcoal hover:bg-brand-slate border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all flex items-center justify-center gap-2 group"
                        >
                            Access Intelligence Guilds <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-xs text-brand-muted">Awaiting committee convening...</p>
                    </div>
                )}
            </div>
        </div>
        </WidgetErrorBoundary>
    );
};

export default WarRoomWidget;
