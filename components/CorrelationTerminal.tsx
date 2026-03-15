import React, { useMemo } from 'react';
import { CardInventory, Sport } from '../types';
import { CorrelationService } from '../lib/CorrelationService';

interface CorrelationTerminalProps {
    inventory: CardInventory[];
}

export const CorrelationTerminal: React.FC<CorrelationTerminalProps> = ({ inventory }) => {
    const activeCards = inventory.filter(c => c.status !== 'sold');
    const sports = Array.from(new Set(activeCards.map(c => c.sport))) as Sport[];

    const matrix = useMemo(() => CorrelationService.calculateCorrelationMatrix(inventory), [inventory]);
    const score = useMemo(() => CorrelationService.calculateDiversificationScore(inventory), [inventory]);

    const getHeatmapColor = (correlation: number) => {
        if (correlation === 1) return 'rgba(217, 249, 157, 0.4)'; // Perfect (diagonal)
        if (correlation > 0.4) return 'rgba(217, 249, 157, 0.2)'; // High
        if (correlation > 0.2) return 'rgba(217, 249, 157, 0.1)'; // Med
        return 'rgba(255, 255, 255, 0.05)'; // Low
    };

    const getStabilityRating = (s: number) => {
        if (s >= 80) return { label: 'Institutional Stability', color: '#D9F99D' };
        if (s >= 50) return { label: 'Balanced Alpha', color: '#60A5FA' };
        return { label: 'Concentrated Risk', color: '#F87171' };
    };

    const rating = getStabilityRating(score);

    if (activeCards.length === 0) return null;

    return (
        <div className="correlation-terminal bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-8 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">Correlation Analyzer</h3>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Institutional-grade asset clustering</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Diversification Score</p>
                    <div className="flex items-center gap-3 justify-end">
                        <span className="text-sm font-black uppercase tracking-widest" style={{ color: rating.color }}>{rating.label}</span>
                        <span className="text-4xl font-mono font-black text-white">{score}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Heatmap Matrix */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full border-separate border-spacing-2">
                            <thead>
                                <tr>
                                    <th></th>
                                    {sports.map(s => (
                                        <th key={s} className="pb-4 text-[9px] font-black text-brand-muted uppercase tracking-tighter text-center w-16">{s.slice(0, 4)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sports.map(sportA => (
                                    <tr key={sportA}>
                                        <td className="pr-4 text-[9px] font-black text-brand-muted uppercase tracking-tighter text-right h-12">{sportA.slice(0, 4)}</td>
                                        {sports.map(sportB => {
                                            const point = matrix.find(p => p.sportA === sportA && p.sportB === sportB);
                                            const correlation = point?.correlation || 0;
                                            return (
                                                <td
                                                    key={sportB}
                                                    className="rounded-lg text-center transition-all hover:scale-105 cursor-help"
                                                    style={{
                                                        backgroundColor: getHeatmapColor(correlation),
                                                        border: correlation === 1 ? '1px solid rgba(217, 249, 157, 0.2)' : '1px solid transparent'
                                                    }}
                                                    title={`${sportA} vs ${sportB}: ${Math.round(correlation * 100)}% correlation`}
                                                >
                                                    <span className="text-[10px] font-mono font-bold text-white/50">{correlation === 1 ? '1.0' : correlation.toFixed(2)}</span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[9px] text-brand-muted italic mt-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-lime"></div>
                        Calculated using MSI 30d Asset Correlation Algorithm
                    </p>
                </div>

                {/* Legend / Metrics */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-brand-charcoal/30 border border-slate-800/50 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-lime/10 blur-[40px] rounded-full"></div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Risk Exposure</p>
                        <div className="space-y-4">
                            {sports.map(sport => {
                                const count = activeCards.filter(c => c.sport === sport).length;
                                const percent = Math.round((count / activeCards.length) * 100);
                                return (
                                    <div key={sport} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-white uppercase">{sport}</span>
                                            <span className="text-brand-muted">{percent}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-brand-charcoal rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-brand-lime transition-all duration-1000"
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-brand-lime/5 border border-brand-lime/10 rounded-2xl">
                        <div className="bg-brand-lime/20 p-2 rounded-lg text-brand-lime">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <p className="text-[9px] font-medium text-brand-muted leading-relaxed uppercase">
                            Hedge advisor identifies <span className="text-brand-lime font-black">low correlation pathways</span> to protect capital during regional market corrections.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
