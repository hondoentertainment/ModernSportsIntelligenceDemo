// @ts-nocheck
import React, { useMemo } from 'react';
import { Microscope, ChevronRight, AlertTriangle, Shield, BarChart3 } from 'lucide-react';
import {
  getTrackedCards,
  getRecentComps,
  formatCurrency,
} from '../lib/analytics/compForensicsService';

interface CompForensicsWidgetProps {
  onOpenModal?: () => void;
}

const CompForensicsWidget: React.FC<CompForensicsWidgetProps> = ({ onOpenModal }) => {
  const cards = useMemo(() => getTrackedCards(), []);
  const recentComps = useMemo(() => getRecentComps(20), []);

  const totalCards = cards.length;
  const avgConfidence = Math.round(cards.reduce((s, c) => s + c.fmvConfidence, 0) / cards.length);
  const outliersFound = recentComps.filter(c => c.is_outlier).length;
  const mispricingAlerts = recentComps.filter(c => c.is_outlier && (c.outlier_reason === 'shill_bid' || c.outlier_reason === 'price_manipulation')).length;

  const topCard = cards.sort((a, b) => b.fmv - a.fmv)[0];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Microscope className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Comp Forensics</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Tracked</p>
          <p className="text-lg font-bold text-cyan-400">{totalCards}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Confidence</p>
          <p className="text-lg font-bold text-emerald-400">{avgConfidence}%</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Outliers</p>
          <p className="text-lg font-bold text-amber-400">{outliersFound}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Alerts</p>
          <p className="text-lg font-bold text-red-400">{mispricingAlerts}</p>
        </div>
      </div>

      {/* Top Tracked Card */}
      {topCard && (
        <div className="p-4 border-b border-slate-700">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            Highest Value Card
          </h4>
          <button
            onClick={onOpenModal}
            className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors text-left group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate mb-1">{topCard.name}</p>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                  {topCard.compCount} comps
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {topCard.fmvConfidence}% conf
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-sm font-bold text-white">{formatCurrency(topCard.fmv)}</span>
              <span className="text-[10px] text-slate-500">FMV</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Mispricing Alerts */}
      {mispricingAlerts > 0 && (
        <div className="p-4 border-b border-slate-700">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Mispricing Alerts
          </h4>
          <div className="space-y-2">
            {recentComps
              .filter(c => c.is_outlier && (c.outlier_reason === 'shill_bid' || c.outlier_reason === 'price_manipulation'))
              .slice(0, 2)
              .map(comp => (
                <div key={comp.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-red-500/5 border-red-500/20 text-xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium truncate block">{comp.cardName}</span>
                    <span className="text-red-400 text-[10px]">{comp.outlier_reason === 'shill_bid' ? 'Shill bid detected' : 'Price manipulation'}</span>
                  </div>
                  <span className="text-white font-bold ml-2">{formatCurrency(comp.price)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Data Quality */}
      <div className="p-4">
        <div className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Data Quality</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-cyan-400 font-bold">{recentComps.length} comps</span>
            <span className="px-2 py-0.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              {avgConfidence}% avg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompForensicsWidget;
