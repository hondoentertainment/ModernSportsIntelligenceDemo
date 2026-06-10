import React, { useMemo, useState, useEffect } from 'react';
import { Brain, MessageSquare, Shield, Zap, Target, Search, X, Activity } from 'lucide-react';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory';
import { CatalystEngine } from '../lib/utils/catalystEngine';

interface SwarmMessage {
    id: string;
    agentId: 'scout' | 'market' | 'risk' | 'negotiator';
    agentName: string;
    text: string;
    timestamp: string;
    impact: 'low' | 'medium' | 'high';
}

const AGENTS = {
    scout: { name: 'Scout Prime', icon: <Search size={14} />, color: 'text-brand-lime' },
    market: { name: 'Market Sentinel', icon: <Zap size={14} />, color: 'text-brand-blue' },
    risk: { name: 'Risk Warden', icon: <Shield size={14} />, color: 'text-brand-orange' },
    negotiator: { name: 'The Closer', icon: <Target size={14} />, color: 'text-brand-teal' }
};

const DUMMY_FEED: SwarmMessage[] = [
    {
        id: '1',
        agentId: 'market',
        agentName: 'Market Sentinel',
        text: 'NBA playoff liquidity window opening. Detected 12% increase in high-end Prizm volume.',
        timestamp: '2m ago',
        impact: 'high'
    },
    {
        id: '2',
        agentId: 'scout',
        agentName: 'Scout Prime',
        text: 'Elly De La Cruz exit speed up 4mph this week. Correlation with 2024 Chrome prices strengthening.',
        timestamp: '5m ago',
        impact: 'medium'
    },
    {
        id: '3',
        agentId: 'risk',
        agentName: 'Risk Warden',
        text: 'Portfolio concentration in 1990s inserts exceeds 35%. Recommendation: Hedge with vintage MLB.',
        timestamp: '14m ago',
        impact: 'low'
    }
];

interface SwarmFeedProps {
    isOpen: boolean;
    onClose: () => void;
}

const SwarmFeed: React.FC<SwarmFeedProps> = ({ isOpen, onClose }) => {
    const { inventory } = useSupabaseInventory();
    const [query, setQuery] = useState('');
    const scenarioMessages = useMemo<SwarmMessage[]>(() => {
        return CatalystEngine.generateScenarios(inventory).slice(0, 3).map((scenario, index) => ({
            id: `scenario-${scenario.id}`,
            agentId: scenario.bias === 'defensive' ? 'risk' : scenario.bias === 'bullish' ? 'scout' : 'market',
            agentName: scenario.bias === 'defensive' ? 'Risk Warden' : scenario.bias === 'bullish' ? 'Scout Prime' : 'Market Sentinel',
            text: `${scenario.headline}. ${scenario.assetName} has ${scenario.expectedMovePct}% upside window with ${scenario.downsidePct}% downside guardrail.`,
            timestamp: `${index + 1}m ago`,
            impact: scenario.expectedMovePct >= 10 ? 'high' : scenario.expectedMovePct >= 6 ? 'medium' : 'low'
        }));
    }, [inventory]);
    const messages = useMemo(() => {
        const feed = [...scenarioMessages, ...DUMMY_FEED];
        if (!query.trim()) return feed;
        const needle = query.toLowerCase();
        return feed.filter(message =>
            message.text.toLowerCase().includes(needle) ||
            message.agentName.toLowerCase().includes(needle)
        );
    }, [query, scenarioMessages]);

    // Toggle scroll lock on body when drawer is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Side-Drawer */}
            <aside className={`fixed top-0 right-0 h-full w-full sm:w-80 lg:w-96 z-50 bg-brand-charcoal border-l border-slate-800 shadow-[20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-brand-slate/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-lime/10 rounded-xl text-brand-lime animate-pulse">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bebas tracking-wide text-white">Live Swarm Feed</h3>
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest leading-none">Internal Analyst Dialogue</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full text-brand-muted hover:text-white transition-colors"
                        aria-label="Close swarm feed"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Feed Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar" tabIndex={0} role="region" aria-label="Swarm analyst messages">
                    {messages.map((msg, i) => (
                        <div
                            key={msg.id}
                            className="bg-brand-slate border border-slate-800 rounded-2xl p-4 space-y-3 relative group hover:border-brand-lime/20 transition-all animate-in slide-in-from-right-8 duration-500"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 bg-brand-charcoal rounded-lg ${AGENTS[msg.agentId].color}`}>
                                        {AGENTS[msg.agentId].icon}
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{msg.agentName}</span>
                                </div>
                                <span className="text-[9px] font-bold text-brand-muted uppercase">{msg.timestamp}</span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                {msg.text}
                            </p>

                            <div className="flex items-center gap-2 pt-1">
                                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${msg.impact === 'high' ? 'bg-brand-red/10 text-brand-red' :
                                        msg.impact === 'medium' ? 'bg-brand-orange/10 text-brand-orange' :
                                            'bg-slate-800 text-slate-500'
                                    }`}>
                                    {msg.impact} Impact
                                </div>
                                <Activity size={10} className="text-slate-700" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Input Teaser */}
                <div className="p-6 border-t border-slate-800 bg-brand-slate/30">
                    <div className="relative">
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Filter by player, catalyst, or agent..."
                            className="w-full bg-brand-charcoal border border-slate-800 rounded-xl py-3 px-4 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-brand-lime"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700">
                            <MessageSquare size={14} />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default SwarmFeed;
