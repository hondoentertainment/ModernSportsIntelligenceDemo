import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { MacroSignal, MacroTrend } from '../types.ts';
import { fetchMacroSignals, analyzeMacroImpactOnPortfolio } from '../lib/macroSentinel.ts';

interface Props {
    portfolioValue: number;
}

const MacroSentinelWidget: React.FC<Props> = ({ portfolioValue }) => {
    const [signals, setSignals] = useState<MacroSignal[]>([]);
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadMacroData = async () => {
            setLoading(true);
            try {
                const data = await fetchMacroSignals();
                setSignals(data);
                const aiInsight = await analyzeMacroImpactOnPortfolio(portfolioValue, data);
                setAnalysis(aiInsight);
            } catch (error) {
                console.error('Failed to load macro signals:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMacroData();
    }, [portfolioValue]);

    const getTrendIcon = (trend: MacroTrend) => {
        switch (trend) {
            case 'bullish': return <TrendingUp size={16} className="text-green-400" />;
            case 'bearish': return <TrendingDown size={16} className="text-red-400" />;
            default: return <Activity size={16} className="text-yellow-400" />;
        }
    };

    const getImpactBadge = (impact: 'High' | 'Medium' | 'Low') => {
        const colors = {
            'High': 'bg-red-500/20 text-red-400 border-red-500/30',
            'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'Low': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors[impact]}`}>
                {impact} Impact
            </span>
        );
    };

    if (loading) {
        return (
            <div className="glass-panel p-6 rounded-xl flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-3">
                    <Activity className="animate-spin text-brand-lime" size={32} />
                    <p className="font-bebas tracking-widest text-[#8F9BB3]">CALIBRATING SENORS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden group">
            {/* Background glow focus */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-opacity duration-1000 opacity-50 group-hover:opacity-100" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h2 className="font-bebas text-2xl tracking-widest text-white flex items-center gap-2">
                        <ShieldAlert className="text-brand-red" size={24} />
                        Macro-Sentinel
                    </h2>
                    <p className="text-xs text-[#8F9BB3] font-medium tracking-wide">PHASE 24 GLOBAL EARLY WARNING SYSTEM</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="bg-black/40 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse shadow-[0_0_8px_rgba(255,51,102,0.8)]" />
                        <span className="text-[10px] font-bold tracking-widest text-brand-red uppercase">Live Monitoring</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400/50" />
                        <span className="text-[8px] font-bold text-[#8F9BB3] uppercase tracking-[0.2em]">Grounded by Google Search</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-6 relative z-10">
                {signals.map((signal) => (
                    <div key={signal.id} className="bg-black/30 p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                {getTrendIcon(signal.trend)}
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">{signal.indicator}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#8F9BB3]">{signal.value}</span>
                                {getImpactBadge(signal.impact)}
                            </div>
                        </div>
                        <p className="text-xs text-[#8F9BB3] leading-relaxed">{signal.description}</p>
                    </div>
                ))}
            </div>

            {/* AI Analysis Box */}
            {analysis && (
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-brand-lime/10 to-transparent border border-brand-lime/20 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu size={14} className="text-brand-lime" />
                        <span className="text-xs font-bold text-brand-lime uppercase tracking-widest">AI Portfolio Threat Assessment</span>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed font-medium">
                        "{analysis}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default MacroSentinelWidget;
