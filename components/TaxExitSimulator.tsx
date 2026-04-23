// @ts-nocheck

import React, { useState } from 'react';
import { CardInventory } from '../types';
import { FiscalService } from '../lib/utils/FiscalService';
import { Calculator, DollarSign, Percent, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { showToast } from '../lib/utils/toast';

interface TaxExitSimulatorProps {
    card: CardInventory;
    onClose?: () => void;
    onConfirm?: (cardId: string) => void;
}

export const TaxExitSimulator: React.FC<TaxExitSimulatorProps> = ({ card, onClose, onConfirm }) => {
    const [targetPrice, setTargetPrice] = useState<number>(card.currentValue || 0);
    const recommendations = FiscalService.optimizeExitPlan([card]);

    const simulation = FiscalService.simulateExit(card, targetPrice);
    const bestVenue = simulation.venueEstimates[0];
    const recommendation = recommendations[0];

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="tax-exit-simulator glass-card p-6 rounded-xl border border-white/10 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bebas tracking-wider flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-400" />
                    Tax Exit Simulator
                </h3>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="mb-8">
                <label className="text-xs text-white/40 uppercase tracking-widest block mb-2 font-medium">Simulated Sale Price</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-2xl font-bold text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-white/60">Gross Sale Price</span>
                    <span className="font-medium text-white">{formatCurrency(targetPrice)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-white/60 flex items-center gap-1.5">
                        Cost Basis <Info className="w-3 h-3 text-white/30" />
                    </span>
                    <span className="text-red-400">-{formatCurrency(simulation.totalBasis)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-white/60">Marketplace Fees (~13%)</span>
                    <span className="text-red-400">-{formatCurrency(simulation.saleFees)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-white/60">Estimated Tax Liability</span>
                    <span className="text-red-400">-{formatCurrency(simulation.estimatedTax)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-white/60">Tax Treatment</span>
                    <span className="font-medium text-white">{simulation.taxTreatment}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-white/60">Best Venue</span>
                    <span className="font-medium text-emerald-300">{bestVenue.venue}</span>
                </div>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 relative overflow-hidden">
                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <span className="text-xs text-blue-300 uppercase tracking-widest block mb-1">Net Retention profit</span>
                        <div className="text-3xl font-bold text-blue-100">{formatCurrency(simulation.netProfit)}</div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-blue-300 uppercase tracking-widest block mb-1">Total ROI</span>
                        <div className="text-xl font-bold text-green-400 flex items-center justify-end gap-1">
                            <Percent className="w-4 h-4" />
                            {simulation.roi.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            {recommendation && (
                <div className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2 text-emerald-300">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Optimizer Recommendation</span>
                    </div>
                    <p className="text-sm text-emerald-100">{recommendation.recommendedAction} via {recommendation.targetVenue}</p>
                    <p className="text-xs text-emerald-200/80 mt-1">{recommendation.reason}</p>
                </div>
            )}

            <button
                onClick={() => {
                    showToast('success', `Exit plan staged for ${card.player}.`);
                    onConfirm?.(card.id);
                }}
                className="w-full mt-6 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-white/90 active:scale-95 transition-all text-sm"
            >
                Confirm Institutional Exit
                <ArrowRight className="w-4 h-4" />
            </button>

            {/* Shared Info Component */}
            <div className="mt-4 p-2 text-[10px] text-white/30 text-center leading-relaxed">
                Calculations are simulated and for informational purposes only. Consult a tax professional for official reporting.
            </div>
        </div>
    );
};

const Info = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
)

