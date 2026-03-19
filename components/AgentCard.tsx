import React from 'react';
import { AgentInsight } from '../types';
import { MultiAgentService } from '../lib/utils/MultiAgentService';
import { Brain, TrendingUp, ShieldAlert, BadgeDollarSign, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface AgentCardProps {
    agent: AgentInsight;
    isLoading?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isLoading }) => {
    const persona = MultiAgentService.getPersona(agent.agentId);

    const getSentimentIcon = () => {
        switch (agent.sentiment) {
            case 'positive': return <CheckCircle2 className="text-brand-lime" size={16} />;
            case 'negative': return <XCircle className="text-brand-red" size={16} />;
            default: return <AlertCircle className="text-brand-orange" size={16} />;
        }
    };

    const getAgentIcon = () => {
        switch (agent.agentId) {
            case 'scout': return <TrendingUp size={20} />;
            case 'risk': return <ShieldAlert size={20} />;
            case 'negotiator': return <BadgeDollarSign size={20} />;
            default: return <Brain size={20} />;
        }
    };

    const getSentimentGlow = () => {
        switch (agent.sentiment) {
            case 'positive': return 'shadow-[0_0_20px_rgba(217,249,157,0.1)] border-brand-lime/20';
            case 'negative': return 'shadow-[0_0_20px_rgba(239,68,68,0.1)] border-brand-red/20';
            default: return 'shadow-[0_0_20px_rgba(249,115,22,0.1)] border-brand-orange/20';
        }
    };

    if (isLoading) {
        return (
            <div className="luminous-card p-6 rounded-2xl border border-slate-800 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800" />
                    <div className="flex-1">
                        <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-800 rounded w-5/6" />
                </div>
            </div>
        );
    }

    return (
        <div className={`luminous-card p-6 rounded-2xl border transition-all duration-500 hover:scale-[1.02] ${getSentimentGlow()}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img src={persona.avatar} alt={agent.agentName} className="w-12 h-12 rounded-full object-cover border-2 border-slate-800" />
                        <div className="absolute -bottom-1 -right-1 bg-brand-charcoal p-1 rounded-full border border-slate-700 text-brand-lime">
                            {getAgentIcon()}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bebas text-xl tracking-wide text-white">{agent.agentName}</h3>
                        <p className="text-[10px] text-brand-muted uppercase font-black tracking-widest leading-none">{agent.persona}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-900/50 border border-slate-800">
                    {getSentimentIcon()}
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                        {Math.round(agent.confidence * 100)}% CONF
                    </span>
                </div>
            </div>

            <div className="relative">
                <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{agent.insight}"
                </p>
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-brand-lime/20 to-transparent rounded-full" />
            </div>
        </div>
    );
};

export default AgentCard;
