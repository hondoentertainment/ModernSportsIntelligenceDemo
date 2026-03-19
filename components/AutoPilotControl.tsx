import React, { useMemo, useState, useEffect } from 'react';
import { AutonomousExecutionService } from '../lib/trading/AutonomousExecutionService';
import { AutoPilotConfig, RiskCollar, AutonomousAction } from '../types';
import { Shield, Zap, Settings, AlertCircle, CheckCircle2, History, TrendingUp, DollarSign, Play, Check, X } from 'lucide-react';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory';

const AutoPilotControl: React.FC = () => {
    const { inventory } = useSupabaseInventory();
    const [config, setConfig] = useState<AutoPilotConfig>(AutonomousExecutionService.getConfig());
    const [actions, setActions] = useState<AutonomousAction[]>(AutonomousExecutionService.getActions());
    const [preview, setPreview] = useState<Awaited<ReturnType<typeof AutonomousExecutionService.previewAutonomousCycle>> | null>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);

    const toggleActive = () => {
        const newConfig = { ...config, isActive: !config.isActive };
        setConfig(newConfig);
        AutonomousExecutionService.saveConfig(newConfig);
    };

    const updateCollar = (field: keyof RiskCollar, value: any) => {
        const newConfig = {
            ...config,
            collar: { ...config.collar, [field]: value }
        };
        setConfig(newConfig);
        AutonomousExecutionService.saveConfig(newConfig);
    };

    const handleBlockedPlayersChange = (value: string) => {
        const players = value.split(',').map(part => part.trim()).filter(Boolean);
        updateCollar('blockedPlayers', players);
    };

    const refreshActions = () => {
        setActions(AutonomousExecutionService.getActions());
    };

    const runPreview = async () => {
        setIsPreviewing(true);
        const nextPreview = await AutonomousExecutionService.previewAutonomousCycle(inventory);
        setPreview(nextPreview);
        refreshActions();
        setIsPreviewing(false);
    };

    const handleDecision = async (actionId: string, decision: 'approve' | 'reject') => {
        const updated = await AutonomousExecutionService.decideAction(actionId, decision, 'war-room');
        setActions(updated);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            refreshActions();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const pendingApprovals = useMemo(() => AutonomousExecutionService.getPendingApprovals(actions), [actions]);

    return (
        <div className="luminous-card p-6 rounded-3xl border border-white/10 bg-brand-charcoal/40 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${config.isActive ? 'bg-brand-lime text-brand-charcoal animate-pulse shadow-lg shadow-brand-lime/20' : 'bg-slate-800 text-slate-400'}`}>
                        <Zap size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bebas tracking-wide text-white">Auto-Pilot Command</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Phase 30: Autonomous Execution</p>
                    </div>
                </div>
                <button
                    onClick={toggleActive}
                    className={`relative w-16 h-8 rounded-full transition-all duration-500 ${config.isActive ? 'bg-brand-lime' : 'bg-slate-800'}`}
                >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-500 shadow-sm ${config.isActive ? 'translate-x-8' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Risk Collar Settings */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-brand-lime mb-2">
                        <Shield size={16} />
                        <h3 className="font-bold text-xs uppercase tracking-wider">Risk Collar Configuration</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-3">Max Cycle Budget</label>
                            <div className="flex items-center gap-3">
                                <DollarSign size={14} className="text-brand-lime" />
                                <input
                                    type="number"
                                    value={config.collar.maxBudget}
                                    onChange={(e) => updateCollar('maxBudget', parseInt(e.target.value))}
                                    className="bg-transparent text-xl font-bold text-white w-full focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-3">Max Per Asset</label>
                            <div className="flex items-center gap-3">
                                <TrendingUp size={14} className="text-brand-orange" />
                                <input
                                    type="number"
                                    value={config.collar.maxSpendPerAsset}
                                    onChange={(e) => updateCollar('maxSpendPerAsset', parseInt(e.target.value))}
                                    className="bg-transparent text-xl font-bold text-white w-full focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-3">Min Confidence</label>
                                <input
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={config.collar.minActionConfidence || 0}
                                    onChange={(e) => updateCollar('minActionConfidence', parseFloat(e.target.value))}
                                    className="bg-transparent text-xl font-bold text-white w-full focus:outline-none"
                                />
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-3">Approval Above</label>
                                <input
                                    type="number"
                                    value={config.collar.requireApprovalAbove || 0}
                                    onChange={(e) => updateCollar('requireApprovalAbove', parseInt(e.target.value))}
                                    className="bg-transparent text-xl font-bold text-white w-full focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-3">Blocked Players</label>
                            <input
                                type="text"
                                value={(config.collar.blockedPlayers || []).join(', ')}
                                onChange={(e) => handleBlockedPlayersChange(e.target.value)}
                                placeholder="Comma-separated names"
                                className="bg-transparent text-sm font-medium text-white w-full focus:outline-none placeholder:text-slate-500"
                            />
                        </div>

                        <div className="flex gap-2">
                            {['Conservative', 'Balanced', 'Aggressive'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => updateCollar('riskTolerance', mode)}
                                    className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${config.collar.riskTolerance === mode
                                            ? 'bg-brand-lime text-brand-charcoal shadow-lg shadow-brand-lime/10'
                                            : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={runPreview}
                            disabled={isPreviewing || inventory.length === 0}
                            className="w-full py-3 rounded-xl bg-brand-lime text-brand-charcoal font-black text-[10px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500"
                        >
                            <Play size={13} />
                            {isPreviewing ? 'Previewing Cycle...' : 'Preview Policy-Gated Cycle'}
                        </button>
                    </div>
                </div>

                {/* Live Execution Log */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-brand-orange">
                            <History size={16} />
                            <h3 className="font-bold text-xs uppercase tracking-wider">Execution Log</h3>
                        </div>
                        {config.isActive && (
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
                                <span className="text-[8px] font-black text-brand-lime uppercase tracking-widest">Listening...</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-black/20 rounded-2xl border border-white/5 flex-1 p-4 overflow-y-auto max-h-[280px] no-scrollbar">
                        {actions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
                                <Settings className="mb-2 animate-spin-slow" size={24} />
                                <p className="text-[10px] font-bold uppercase tracking-widest">No Autonomous Actions Recorded</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {actions.map((action) => (
                                    <div key={action.id} className="p-3 rounded-xl bg-white/5 border-l-2 border-brand-lime flex gap-3 items-start group hover:bg-white/[0.08] transition-colors">
                                        <div className="mt-1">
                                            {action.type === 'BUY' ? <Zap className="text-brand-lime" size={12} /> :
                                                action.type === 'SELL' ? <AlertCircle className="text-brand-orange" size={12} /> :
                                                    <TrendingUp className="text-brand-blue" size={12} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <h4 className="text-[10px] font-black text-white truncate uppercase tracking-widest">{action.type}: {action.assetName}</h4>
                                                <span className="text-[8px] text-slate-500 whitespace-nowrap">{new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 leading-tight line-clamp-2">{action.rationale}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {preview && (
                <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Cycle Preview</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{preview.thesis.recommendedAction}</p>
                        </div>
                        <span className="text-[10px] text-brand-lime font-black uppercase tracking-widest">
                            Cash Delta {preview.impact.projectedNetCashDelta >= 0 ? '+' : ''}${preview.impact.projectedNetCashDelta.toFixed(0)}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {preview.actions.map(action => (
                            <div key={action.id} className="p-3 rounded-xl bg-brand-charcoal/70 border border-slate-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">{action.type} {action.assetName}</p>
                                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{action.policyReason}</p>
                                <p className="text-[9px] text-brand-lime font-black uppercase tracking-widest mt-2">
                                    {action.policyDecision} {action.estimatedEdgePct ? `| Edge ${action.estimatedEdgePct}%` : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pendingApprovals.length > 0 && (
                <div className="mb-8 space-y-3">
                    <div className="flex items-center gap-2 text-brand-orange">
                        <AlertCircle size={16} />
                        <h3 className="font-bold text-xs uppercase tracking-wider">Approval Queue</h3>
                    </div>
                    {pendingApprovals.map(action => (
                        <div key={action.id} className="p-4 rounded-2xl border border-brand-orange/20 bg-brand-orange/5 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                                <p className="text-[11px] font-black uppercase tracking-widest text-white">{action.type} {action.assetName}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{action.policyReason}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDecision(action.id, 'approve')}
                                    className="px-4 py-2 rounded-xl bg-brand-lime text-brand-charcoal text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    <Check size={12} /> Approve
                                </button>
                                <button
                                    onClick={() => handleDecision(action.id, 'reject')}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    <X size={12} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {config.isActive && (
                <div className="bg-brand-lime/10 border border-brand-lime/20 p-4 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="text-brand-lime mt-0.5" size={16} />
                    <p className="text-[10px] text-brand-lime font-medium leading-relaxed">
                        Strategist Prime is actively monitoring market signals. Actions will be logged above.
                        <strong> Budget Lock Active:</strong> Purchases capped at ${config.collar.maxBudget} total.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AutoPilotControl;
