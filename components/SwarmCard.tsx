import React from 'react';
import { SwarmInsight } from '../types';
import { TrendingUp, TrendingDown, Minus, Info, Zap } from 'lucide-react';

interface SwarmCardProps {
    insight: SwarmInsight;
}

const SwarmCard: React.FC<SwarmCardProps> = ({ insight }) => {
    const getSentimentIcon = () => {
        switch (insight.sentiment) {
            case 'bullish': return <TrendingUp className="text-brand-lime" size={16} />;
            case 'bearish': return <TrendingDown className="text-brand-orange" size={16} />;
            default: return <Minus className="text-slate-400" size={16} />;
        }
    };

    const getSentimentColor = () => {
        switch (insight.sentiment) {
            case 'bullish': return 'text-brand-lime';
            case 'bearish': return 'text-brand-orange';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="luminous-card rounded-2xl p-6 border border-slate-800 hover:border-brand-lime/30 transition-all group relative overflow-hidden">
            {/* Decorative Glow */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 blur-[60px] rounded-full opacity-20 pointer-events-none ${insight.sentiment === 'bullish' ? 'bg-brand-lime' : insight.sentiment === 'bearish' ? 'bg-brand-orange' : 'bg-slate-500'
                }`} />

            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h4 className="text-lg font-bebas tracking-wide text-white group-hover:text-brand-lime transition-colors">
                            {insight.title}
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${getSentimentColor()} flex items-center gap-1`}>
                                {getSentimentIcon()}
                                {insight.sentiment}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">•</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Impact: {insight.impactScore}/100
                            </span>
                        </div>
                    </div>
                    <div className="flex -space-x-2">
                        {insight.participatingAgents.map((agent, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-brand-charcoal bg-slate-800 flex items-center justify-center text-[8px] font-black text-white uppercase"
                                title={`${agent} Participating`}
                            >
                                {agent[0]}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{insight.description}"
                </p>

                <div className="flex flex-wrap gap-2">
                    {insight.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-900/50 border border-slate-800 rounded text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <Zap size={12} className="text-brand-lime" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">
                            Confidence: {(insight.confidence * 100).toFixed(0)}%
                        </span>
                    </div>
                    <button className="text-[10px] font-black text-brand-lime uppercase tracking-widest hover:underline flex items-center gap-1">
                        Deep Dive <Info size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwarmCard;
