// @ts-nocheck
import React, { useMemo } from 'react';
import { Factory, ChevronRight, AlertTriangle, TrendingDown } from 'lucide-react';
import {
  getProductSets,
  getScarcityIndices,
  getSaturationAlerts,
  formatNumber,
} from '../lib/analytics/printRunIntelligenceService';

interface PrintRunIntelligenceWidgetProps {
  onOpenModal?: () => void;
}

const PrintRunIntelligenceWidget: React.FC<PrintRunIntelligenceWidgetProps> = ({ onOpenModal }) => {
  const sets = useMemo(() => getProductSets(), []);
  const scarcityIndices = useMemo(() => getScarcityIndices(), []);
  const alerts = useMemo(() => getSaturationAlerts(), []);

  const avgOverproduction = useMemo(() => {
    if (sets.length === 0) return 0;
    return Math.round(sets.reduce((sum, s) => sum + s.overproductionScore, 0) / sets.length);
  }, [sets]);

  const topScarce = useMemo(() => {
    const sorted = [...scarcityIndices].sort((a, b) => b.scarcityScore - a.scarcityScore);
    return sorted[0];
  }, [scarcityIndices]);

  const criticalAlert = useMemo(() => {
    return alerts.find(a => a.severity === 'critical') ?? alerts[0];
  }, [alerts]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-orange-400" />
          <h3 className="text-base font-bold text-white">Print Run Intelligence</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4-Stat Grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Sets Tracked</p>
          <p className="text-lg font-bold text-white">{sets.length}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Scarcity Alerts</p>
          <p className="text-lg font-bold text-amber-400">{alerts.length}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Avg Overprod.</p>
          <p className={`text-lg font-bold ${avgOverproduction >= 70 ? 'text-red-400' : avgOverproduction >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {avgOverproduction}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Top Scarce</p>
          <p className="text-lg font-bold text-emerald-400 truncate" title={topScarce?.setName}>
            {topScarce?.scarcityScore ?? 0}
          </p>
        </div>
      </div>

      {/* Highlight: Critical Alert */}
      {criticalAlert && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400" /> Top Alert
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              criticalAlert.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {criticalAlert.severity.toUpperCase()}
            </span>
          </div>
          <p className="text-xs font-medium text-white truncate">{criticalAlert.setName}</p>
          <p className="text-[10px] text-slate-500 truncate">{criticalAlert.alertType}</p>
        </div>
      )}

      {/* Bottom: Market Absorption */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenModal}
          className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors bg-orange-500/10 border-orange-500/20 hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-orange-400">
                {formatNumber(sets.reduce((sum, s) => sum + s.baseRunEstimate, 0))} total cards
              </p>
              <p className="text-[10px] text-slate-400">
                Across {sets.length} tracked product sets
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};

export default PrintRunIntelligenceWidget;
