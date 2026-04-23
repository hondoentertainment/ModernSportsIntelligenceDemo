// @ts-nocheck
import React from 'react';
import { ArbitrageNode } from '../types.ts';
import { ArrowLeftRight, TrendingUp, Info } from 'lucide-react';

interface ArbitrageNodeCardProps {
    node: ArbitrageNode;
    onViewDetails?: (node: ArbitrageNode) => void;
}

const ArbitrageNodeCard: React.FC<ArbitrageNodeCardProps> = ({ node, onViewDetails }) => {
    const isPositive = node.opportunityScore > 75;

    return (
        <div className="card-glass p-6 group hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <ArrowLeftRight size={20} />
                    </div>
                    <div>
                        <h3 className="font-bebas text-xl tracking-wider text-white">Arbitrage Node {node.id.slice(0, 4)}</h3>
                        <span className={`text-[10px] uppercase tracking-widest ${node.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {node.status}
                        </span>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    SCORE: {node.opportunityScore}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">{node.sourceAsset.assetClass}</span>
                    <div className="font-bold text-slate-200 truncate">{node.sourceAsset.name}</div>
                    <div className="text-indigo-400 font-bebas text-lg">${node.sourceAsset.currentValue.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">{node.targetAsset.assetClass}</span>
                    <div className="font-bold text-slate-200 truncate">{node.targetAsset.name}</div>
                    <div className="text-indigo-400 font-bebas text-lg">${node.targetAsset.currentValue.toLocaleString()}</div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <TrendingUp size={16} className="text-indigo-400" />
                <span className="text-sm font-medium text-indigo-200">
                    Correlation Delta: <span className="text-indigo-400 font-bold">+{node.correlationDelta}%</span>
                </span>
            </div>

            <p className="text-sm text-slate-400 line-clamp-2 mb-6 italic leading-relaxed">
                "{node.rationale}"
            </p>

            <button
                onClick={() => onViewDetails?.(node)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-lg text-sm font-bold tracking-widest transition-all text-slate-300 hover:text-white"
            >
                <Info size={16} />
                VIEW FULL RATIONALE
            </button>
        </div>
    );
};

export default ArbitrageNodeCard;
