// @ts-nocheck
import React, { useMemo } from 'react';
import { TrendingUp, ChevronRight, Target, Bell } from 'lucide-react';
import {
  getPricePredictions,
  getModelAccuracy,
  getTopMovers,
  getAlertThresholds,
  getConfidenceConfig,
  formatCurrency,
} from '../lib/analytics/pricePredictionService';

interface PricePredictionWidgetProps {
  onOpenModal?: () => void;
}

export const PricePredictionWidget: React.FC<PricePredictionWidgetProps> = ({ onOpenModal }) => {
  const predictions = useMemo(() => getPricePredictions(), []);
  const accuracy = useMemo(() => getModelAccuracy(), []);
  const topMovers = useMemo(() => getTopMovers('up', 3), []);
  const alerts = useMemo(() => getAlertThresholds(), []);

  const avgAccuracy = useMemo(() => {
    if (accuracy.length === 0) return 0;
    return (accuracy.reduce((sum, a) => sum + a.accuracyPercent, 0) / accuracy.length).toFixed(1);
  }, [accuracy]);

  const topMover = topMovers[0] || null;
  const activeAlerts = useMemo(() => alerts.filter(a => !a.isTriggered).length, [alerts]);

  const highestConfidence = useMemo(() => {
    return predictions
      .filter(p => p.confidence >= 85)
      .sort((a, b) => b.confidence - a.confidence)[0] || null;
  }, [predictions]);

  const confidenceConfig = useMemo(() => {
    return highestConfidence ? getConfidenceConfig(highestConfidence.confidence) : null;
  }, [highestConfidence]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">AI Price Predictions</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Predictions</p>
          <p className="text-lg font-bold text-blue-400">{predictions.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Accuracy</p>
          <p className="text-lg font-bold text-emerald-400">{avgAccuracy}%</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Top Mover</p>
          <p className="text-lg font-bold text-white truncate">
            {topMover ? `${topMover.name} +${topMover.changePercent.toFixed(0)}%` : 'N/A'}
          </p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Alerts</p>
          <p className="text-lg font-bold text-amber-400">{activeAlerts}</p>
        </div>
      </div>

      {/* Highest confidence prediction */}
      {highestConfidence && confidenceConfig && (
        <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-4">
          <Target size={14} className="text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Top Prediction</p>
            <p className="text-xs text-white font-medium truncate">{highestConfidence.player} &mdash; {confidenceConfig.label}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-blue-400">{formatCurrency(highestConfidence.targetPrice)}</p>
            <p className="text-[10px] text-slate-500">{highestConfidence.confidence}% conf</p>
          </div>
        </div>
      )}

      {/* Bottom footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-brand-lime" />
          <span className="text-xs text-slate-400">Models: <span className="text-white font-bold">{accuracy.length}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bell size={12} className="text-amber-400" />
          <span className="text-xs text-slate-400">
            Active Alerts: <span className="text-amber-400 font-bold">{activeAlerts}</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default PricePredictionWidget;
