// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { CrossAssetInsight, ArbitrageNode } from '../types.ts';
import { ArbitrageAgentService } from '../lib/trading/ArbitrageAgentService.ts';
import ArbitrageNodeCard from './ArbitrageNodeCard.tsx';
import { Network, ShieldAlert, Cpu, RefreshCw, Layers, TrendingUp } from 'lucide-react';
import { WidgetErrorBoundary } from './ui/WidgetErrorBoundary';

const ArbitrageSwarmDashboard: React.FC = () => {
    const [insight, setInsight] = useState<CrossAssetInsight | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchInsight = async () => {
        setLoading(true);
        const result = await ArbitrageAgentService.getCrossAssetAnalysis();
        if (result) setInsight(result);
        setLoading(false);
    };

    useEffect(() => {
        fetchInsight();
    }, []);

    if (loading) {
        return (
            <WidgetErrorBoundary title="Arbitrage Swarm">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <RefreshCw className="text-indigo-500 animate-spin" size={48} />
                    <div className="font-bebas text-2xl text-slate-400 tracking-widest animate-pulse">Convening Arbitrage Swarm...</div>
                </div>
            </WidgetErrorBoundary>
        );
    }

    const getFlightColor = (status: string) => {
        switch (status) {
            case 'Critical': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
            case 'Volatile': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            default: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        }
    };

    return (
        <WidgetErrorBoundary title="Arbitrage Swarm">
        <div className="space-y-8 p-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <Network size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Phase 29: Cross-Asset Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-bebas tracking-wider text-white">Arbitrage Swarm Dashboard</h1>
                    <p className="text-slate-400 max-w-2xl mt-2 text-sm leading-relaxed">
                        Institutional-grade correlation tracking across luxury asset classes. Our specialized swarm identifies capital flight patterns and alpha opportunities between Sports Cards, Watches, and Fine Art.
                    </p>
                </div>

                <div className={`px-6 py-4 rounded-xl border flex flex-col items-center justify-center min-w-[200px] transition-all duration-500 ${getFlightColor(insight?.liquidityFlightStatus || 'Stable')}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Liquidity Flight</span>
                    </div>
                    <div className="text-2xl font-bebas tracking-tighter">{insight?.liquidityFlightStatus || 'STABLE'}</div>
                </div>
            </div>

            {/* Agent Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insight?.agents.map((agent) => (
                    <div key={agent.agentId} className="card-glass p-6 border-l-4 border-l-indigo-500/50">
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={ArbitrageAgentService.getPersona(agent.agentId).avatar}
                                alt={agent.agentName}
                                className="w-12 h-12 rounded-full border-2 border-indigo-500/30 ring-4 ring-indigo-500/10"
                            />
                            <div>
                                <h4 className="font-bebas text-lg text-white tracking-wide">{agent.agentName}</h4>
                                <div className="text-[9px] text-indigo-400 uppercase font-bold tracking-widest">{agent.persona}</div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-4 leading-relaxed italic">"{agent.insight}"</p>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                            <span>Sentiment: <span className={agent.sentiment === 'positive' ? 'text-emerald-400' : 'text-amber-400'}>{agent.sentiment}</span></span>
                            <span>Conf: {(agent.confidence * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Arbitrage Nodes Section */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <Layers className="text-indigo-400" size={24} />
                    <h2 className="text-2xl font-bebas tracking-wider text-white">Active Arbitrage Nodes</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {insight?.topArbitrageNodes.map((node) => (
                        <ArbitrageNodeCard key={node.id} node={node} />
                    ))}
                </div>
            </div>

            {/* Market Correlation Summary */}
            <div className="card-glass p-8 bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-indigo-400" size={20} />
                    <h3 className="font-bebas text-xl text-white tracking-widest uppercase">Committee Summary</h3>
                </div>
                <p className="text-lg text-slate-200 font-medium leading-relaxed italic">
                    "{insight?.summary}"
                </p>
                <button
                    onClick={fetchInsight}
                    className="mt-6 flex items-center gap-2 px-6 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-full text-[10px] font-bold tracking-widest text-indigo-300 hover:text-white transition-all"
                >
                    <RefreshCw size={12} />
                    RE-CONVENE SWARM
                </button>
            </div>
        </div>
        </WidgetErrorBoundary>
    );
};

export default ArbitrageSwarmDashboard;
