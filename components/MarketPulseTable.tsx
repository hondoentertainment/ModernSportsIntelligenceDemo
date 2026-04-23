// @ts-nocheck

import React from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { CardInventory } from '../types';

interface MarketPulseTableProps {
    items: CardInventory[];
}

const MarketPulseTable: React.FC<MarketPulseTableProps> = ({ items }) => {
    return (
        <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800/50 bg-brand-charcoal/80">
                            <th className="px-4 py-3 text-[10px] font-black text-brand-muted uppercase tracking-widest whitespace-nowrap">Asset</th>
                            <th className="px-4 py-3 text-[10px] font-black text-brand-muted uppercase tracking-widest whitespace-nowrap">Status</th>
                            <th className="px-4 py-3 text-[10px] font-black text-brand-muted uppercase tracking-widest whitespace-nowrap">Valuation</th>
                            <th className="px-4 py-3 text-[10px] font-black text-brand-muted uppercase tracking-widest whitespace-nowrap">24h Δ</th>
                            <th className="px-4 py-3 text-[10px] font-black text-brand-muted uppercase tracking-widest whitespace-nowrap">Liquidity</th>
                            <th className="px-4 py-3 text-[10px] font-black text-brand-muted uppercase tracking-widest whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const change = (Math.random() * 4 - 2).toFixed(2);
                            const isPositive = parseFloat(change) >= 0;

                            return (
                                <tr key={item.id} className="border-b border-slate-900/50 hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-10 bg-slate-900 rounded border border-slate-800 overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-700">NA</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-white leading-tight">{item.player}</p>
                                                <p className="text-[9px] text-brand-muted font-medium">{item.year} {item.manufacturer}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${item.isGraded ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-800 text-slate-500'}`}>
                                            {item.isGraded ? `${item.gradingCompany} ${item.grade}` : 'RAW'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-[11px] font-mono font-bold text-white tracking-tight">
                                            ${item.currentValue.toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={`flex items-center gap-1 text-[10px] font-black ${isPositive ? 'text-brand-green' : 'text-brand-red'}`}>
                                            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            {isPositive ? '+' : ''}{change}%
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-lime"
                                                    style={{ width: `${60 + Math.random() * 30}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-500">PRO</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="p-1.5 hover:bg-brand-lime hover:text-brand-charcoal rounded-md transition-all text-brand-muted">
                                            <ArrowUpRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="p-3 bg-brand-charcoal/30 flex justify-between items-center border-t border-slate-800">
                <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                    <Clock size={10} /> Market latency: 1.4s
                </p>
                <button className="text-[9px] font-black text-brand-lime uppercase tracking-widest hover:text-white transition-colors">
                    View All Active Quotes
                </button>
            </div>
        </div>
    );
};

export default MarketPulseTable;
