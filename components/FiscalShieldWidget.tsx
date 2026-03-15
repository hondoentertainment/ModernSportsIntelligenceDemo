
import React from 'react';
import { CardInventory } from '../types';
import { FiscalService } from '../lib/FiscalService';
import { TaxStrategyAgent } from '../lib/TaxStrategyAgent';
import { Shield, TrendingDown, AlertTriangle, Info } from 'lucide-react';

interface FiscalShieldWidgetProps {
    inventory: CardInventory[];
}

export const FiscalShieldWidget: React.FC<FiscalShieldWidgetProps> = ({ inventory }) => {
    const taxData = FiscalService.calculateTaxLiability(inventory);
    const exposure = FiscalService.get1099KExposure(inventory);
    const insights = TaxStrategyAgent.generateInsights(inventory);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const thresholdPercent = Math.min(100, (exposure.volume / exposure.threshold) * 100);

    return (
        <div className="fiscal-shield-widget glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bebas tracking-wider flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Fiscal Shield Center
                </h3>
                <div className="text-xs text-white/40 uppercase tracking-widest">Phase 27 Active</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Tax Liability */}
                <div className="stat-group">
                    <span className="text-sm text-white/50 block mb-1">Est. Tax Liability</span>
                    <div className="text-3xl font-bold text-red-400">{formatCurrency(taxData.total)}</div>
                    <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-white/40">ST: {formatCurrency(taxData.shortTerm)}</span>
                        <span className="text-white/40">LT: {formatCurrency(taxData.longTerm)}</span>
                    </div>
                </div>

                {/* 1099-K Progress */}
                <div className="stat-group">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm text-white/50">1099-K Threshold</span>
                        <span className="text-xs text-white/40">{formatCurrency(exposure.volume)} / {formatCurrency(exposure.threshold)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full transition-all duration-1000 ${exposure.isNearThreshold ? 'bg-orange-500' : 'bg-blue-500'}`}
                            style={{ width: `${thresholdPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Agent Insights Swarm */}
            <div className="insights-swarm space-y-3">
                {insights.map((insight, idx) => (
                    <div key={idx} className={`p-3 rounded-lg flex gap-3 items-start border ${insight.sentiment === 'negative' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                            insight.sentiment === 'positive' ? 'bg-green-500/10 border-green-500/20 text-green-200' :
                                'bg-white/5 border-white/10 text-white/80'
                        }`}>
                        {insight.sentiment === 'negative' ? <AlertTriangle className="w-4 h-4 mt-1 shrink-0" /> :
                            insight.sentiment === 'positive' ? <TrendingDown className="w-4 h-4 mt-1 shrink-0" /> :
                                <Info className="w-4 h-4 mt-1 shrink-0" />}
                        <p className="text-xs leading-relaxed">{insight.insight}</p>
                    </div>
                ))}
            </div>

            {/* Decorative Gradient Overlay */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
        </div>
    );
};
