// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory';
import { MultiAgentService } from '../lib/utils/MultiAgentService';
import { AutonomousExecutionService } from '../lib/trading/AutonomousExecutionService';
import { CollaborativeThesis } from '../types';
import AgentCard from './AgentCard';
import AutoPilotControl from './AutoPilotControl';
import { Brain, RefreshCw, Send, ShieldCheck, Target, TrendingUp, Info, Activity, Zap, Download } from 'lucide-react';
import { showToast } from '../lib/utils/toast';
import { store } from '../lib/dal/syncStore';
import { safeParseCollaborativeThesis } from '../lib/schemas';
import { downloadWarRoomThesisJson } from '../lib/utils/warRoomThesisAudit';

const WAR_ROOM_THESIS_STORAGE_KEY = 'msi_war_room_last_thesis_v1';

const AnalystWarRoom: React.FC = () => {
    const { inventory } = useSupabaseInventory();
    const [thesis, setThesis] = useState<CollaborativeThesis | null>(() => {
        const raw = store.get<unknown>(WAR_ROOM_THESIS_STORAGE_KEY, null);
        const parsed = safeParseCollaborativeThesis(raw);
        if (raw !== null && parsed === null) {
            store.remove(WAR_ROOM_THESIS_STORAGE_KEY);
        }
        return parsed;
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [autoPilot, setAutoPilot] = useState(AutonomousExecutionService.getConfig().isActive);
    const [isExecuting, setIsExecuting] = useState(false);

    const generateThesis = async () => {
        setIsGenerating(true);
        try {
            const config = AutonomousExecutionService.getConfig();
            const result = await MultiAgentService.getCollaborativeThesis(inventory, config.isActive, 'war-room');

            if (result) {
                setThesis(result);
                store.set(WAR_ROOM_THESIS_STORAGE_KEY, result);
                if (config.isActive) {
                    // If autopilot is active, also trigger the execution cycle logic in the background
                    AutonomousExecutionService.runAutonomousCycle(inventory);
                }
            }
        } catch {
            showToast('error', 'Unable to refresh intelligence right now. Please retry.');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (inventory.length > 0 && !thesis) {
            generateThesis();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inventory]);

    // Polling for autopilot status changes (simplified for demo)
    useEffect(() => {
        const interval = setInterval(() => {
            const current = AutonomousExecutionService.getConfig().isActive;
            if (current !== autoPilot) {
                setAutoPilot(current);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [autoPilot]);

    const handleExecute = async () => {
        setIsExecuting(true);
        try {
            const actions = await AutonomousExecutionService.previewAutonomousCycle(inventory);
            if (!autoPilot) {
                showToast('info', `Preview staged ${actions.actions.length} policy-scored actions. Enable Auto-Pilot to commit them.`);
            } else {
                const live = await AutonomousExecutionService.runAutonomousCycle(inventory);
                showToast('success', `Auto-Pilot queued ${live.length} actions for review.`);
            }
        } catch {
            showToast('error', 'Unable to execute strategy right now. Please retry.');
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="space-y-8 reveal-section">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-5xl font-bebas tracking-tighter text-white">Analyst War Room</h1>
                    <p className="text-brand-muted flex items-center gap-2">
                        <Brain className="text-brand-lime" size={16} />
                        Institutional Multi-Agent Committee Active
                        {autoPilot && (
                            <span className="flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-brand-lime/10 border border-brand-lime/20 rounded-full text-[10px] text-brand-lime font-black uppercase tracking-widest">
                                <Zap size={10} className="animate-pulse" /> Auto-Pilot Engaged
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {thesis && !isGenerating && (
                        <button
                            type="button"
                            onClick={() => {
                                const ok = downloadWarRoomThesisJson(thesis);
                                showToast(
                                    ok ? 'success' : 'error',
                                    ok
                                        ? 'Thesis audit JSON downloaded.'
                                        : 'Could not export thesis JSON. Try again or copy fields manually.',
                                );
                            }}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-5 py-3 rounded-xl font-bold transition-all"
                        >
                            <Download size={18} />
                            EXPORT THESIS JSON
                        </button>
                    )}
                    <button
                        onClick={generateThesis}
                        disabled={isGenerating || inventory.length === 0}
                        className="flex items-center gap-2 bg-brand-charcoal hover:bg-brand-slate text-brand-lime border border-brand-lime/30 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <RefreshCw className={`group-hover:rotate-180 transition-transform duration-500 ${isGenerating ? 'animate-spin' : ''}`} size={18} />
                        {isGenerating ? 'CONVENING COMMITTEE...' : 'REFRESH INTELLIGENCE'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                        Multi-agent output is AI-generated guidance. Use it as decision support and verify with live comps before executing trades.
                    </div>

                    {thesis && !isGenerating && thesis.runMetadata && (
                        <div
                            className="rounded-xl border border-slate-700 bg-brand-charcoal/60 p-4 text-[11px] text-slate-400 font-mono space-y-1.5"
                            role="status"
                        >
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted font-sans">Run traceability</p>
                            <p>
                                <span className="text-slate-500">Input fingerprint</span>{' '}
                                <span className="text-brand-lime break-all">{thesis.runMetadata.inputHash}</span>
                            </p>
                            <p>
                                <span className="text-slate-500">Prompt version</span> {thesis.runMetadata.promptVersion}
                            </p>
                            <p>
                                <span className="text-slate-500">Model</span> {thesis.runMetadata.modelId}
                            </p>
                            <p>
                                <span className="text-slate-500">Strategist agent</span>{' '}
                                {thesis.runMetadata.includeStrategist ? 'included' : 'excluded'}
                            </p>
                        </div>
                    )}
                    {thesis && !isGenerating && !thesis.runMetadata && (
                        <p className="text-[11px] text-slate-500 border border-slate-800 rounded-lg px-3 py-2 bg-slate-900/40">
                            This thesis was saved before run traceability fields were added. Refresh intelligence to attach fingerprint, prompt version, and model id.
                        </p>
                    )}

                    {/* Auto-Pilot Control (NEW) */}
                    <AutoPilotControl />

                    {!thesis && !isGenerating ? (
                        <div className="luminous-card p-12 rounded-3xl border border-slate-800 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-brand-slate rounded-2xl flex items-center justify-center text-brand-lime mb-6 border border-brand-lime/20">
                                <Brain size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Awaiting Intelligence Ingestion</h2>
                            <p className="text-brand-muted max-w-md mx-auto">
                                The multi-agent committee requires portfolio data to generate institutional-grade investment theses.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Main Thesis Panel */}
                            <div className="luminous-card p-8 rounded-3xl border border-brand-lime/20 relative overflow-hidden">
                                {/* Background Accent */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-brand-lime/10 rounded-lg">
                                        <Target className="text-brand-lime" size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bebas tracking-wide text-white">Collaborative Thesis</h2>
                                </div>

                                {isGenerating ? (
                                    <div className="space-y-4 animate-pulse">
                                        <div className="h-4 bg-slate-800 rounded w-full" />
                                        <div className="h-4 bg-slate-800 rounded w-11/12" />
                                        <div className="h-4 bg-slate-800 rounded w-5/6" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <p className="text-xl text-slate-200 leading-relaxed font-medium">
                                            {thesis?.summary}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-lime mb-3 flex items-center gap-2">
                                                    <TrendingUp size={12} /> Key Signals
                                                </h4>
                                                <ul className="space-y-2">
                                                    {thesis?.keyTakeaways.map((takeaway, i) => (
                                                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime mt-1.5 shrink-0" />
                                                            {takeaway}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-3 flex items-center gap-2">
                                                    <ShieldCheck size={12} /> Risk Vector
                                                </h4>
                                                <p className="text-sm text-slate-300 leading-relaxed">
                                                    {thesis?.riskAssessment}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-brand-lime p-1 rounded-2xl shadow-xl shadow-brand-lime/20">
                                            <div className="bg-brand-charcoal rounded-[14px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-brand-lime rounded-xl text-brand-charcoal">
                                                        <Send size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-lime">Recommended Action</p>
                                                        <h3 className="text-sm md:text-xl font-bold text-white">{thesis?.recommendedAction}</h3>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleExecute}
                                                    disabled={isExecuting || inventory.length === 0}
                                                    className="whitespace-nowrap bg-brand-lime text-brand-charcoal font-black py-3 px-6 rounded-xl hover:scale-105 transition-transform disabled:bg-slate-700 disabled:text-slate-400"
                                                >
                                                    {isExecuting ? 'STAGING...' : 'EXECUTE STRATEGY'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tactical Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="luminous-card p-6 rounded-2xl border border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Activity className="text-brand-lime" size={18} />
                                        <h4 className="font-bebas text-lg tracking-wide">Market Volatility</h4>
                                    </div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-3xl font-bold">14.2%</span>
                                        <span className="text-brand-red text-xs font-bold mb-1">+2.1%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-orange w-1/4" />
                                    </div>
                                </div>
                                <div className="luminous-card p-6 rounded-2xl border border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Target className="text-brand-lime" size={18} />
                                        <h4 className="font-bebas text-lg tracking-wide">Liquidity Index</h4>
                                    </div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-3xl font-bold">High</span>
                                        <span className="text-brand-lime text-xs font-bold mb-1">A+</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-lime w-[85%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Agents */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bebas text-2xl tracking-wide text-white">Committee Members</h3>
                        <Info className="text-brand-muted" size={16} />
                    </div>
                    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 no-scrollbar">
                        {isGenerating ? (
                            <>
                                <AgentCard agent={{ agentId: 'scout', agentName: 'Scout Prime', persona: '', insight: '', sentiment: 'neutral', confidence: 0 }} isLoading />
                                <AgentCard agent={{ agentId: 'market', agentName: 'Market Sentinel', persona: '', insight: '', sentiment: 'neutral', confidence: 0 }} isLoading />
                                <AgentCard agent={{ agentId: 'risk', agentName: 'Risk Warden', persona: '', insight: '', sentiment: 'neutral', confidence: 0 }} isLoading />
                                <AgentCard agent={{ agentId: 'negotiator', agentName: 'The Closer', persona: '', insight: '', sentiment: 'neutral', confidence: 0 }} isLoading />
                                {autoPilot && <AgentCard agent={{ agentId: 'strategist', agentName: 'Strategist Prime', persona: '', insight: '', sentiment: 'neutral', confidence: 0 }} isLoading />}
                            </>
                        ) : (
                            thesis?.agents.map((agent) => (
                                <AgentCard key={agent.agentId} agent={agent} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalystWarRoom;
