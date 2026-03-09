import React, { useMemo } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  Clock,
  Target,
  ShieldAlert,
  Zap,
  BarChart3,
  ArrowRightLeft,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  MarketAnomaly,
  AnomalyType,
  AnomalySeverity,
  detectAnomalies,
  acknowledgeAnomaly,
} from '../lib/anomalyDetectionService';

interface AnomalyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomaly: MarketAnomaly | null;
  inventory: CardInventory[];
}

const severityColors: Record<AnomalySeverity, { text: string; bg: string; border: string; dot: string }> = {
  critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500' },
  high: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  medium: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-500' },
  low: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', dot: 'bg-slate-400' },
};

const typeIcons: Record<AnomalyType, React.ReactNode> = {
  spike: <TrendingUp size={20} />,
  crash: <TrendingDown size={20} />,
  arbitrage: <ArrowRightLeft size={20} />,
  mispricing: <Target size={20} />,
  volume_surge: <BarChart3 size={20} />,
  stale_price: <Clock size={20} />,
};

const typeLabels: Record<AnomalyType, string> = {
  spike: 'Price Spike',
  crash: 'Price Crash',
  arbitrage: 'Arbitrage',
  mispricing: 'Mispricing',
  volume_surge: 'Volume Surge',
  stale_price: 'Stale Price',
};

export const AnomalyDetailModal: React.FC<AnomalyDetailModalProps> = ({
  isOpen,
  onClose,
  anomaly,
  inventory,
}) => {
  const relatedAnomalies = useMemo(() => {
    if (!anomaly) return [];
    const all = detectAnomalies(inventory);
    return all
      .filter(a => a.id !== anomaly.id && a.sport === anomaly.sport && a.type === anomaly.type)
      .slice(0, 4);
  }, [anomaly, inventory]);

  if (!isOpen || !anomaly) return null;

  const sev = severityColors[anomaly.severity];
  const detectedDate = new Date(anomaly.detectedAt);
  const expiresDate = new Date(anomaly.expiresAt);
  const now = new Date();
  const hoursRemaining = Math.max(0, Math.round((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60)));

  const priceMax = Math.max(anomaly.priceAtDetection, anomaly.expectedPrice);
  const actualBarWidth = priceMax > 0 ? (anomaly.priceAtDetection / priceMax) * 100 : 0;
  const expectedBarWidth = priceMax > 0 ? (anomaly.expectedPrice / priceMax) * 100 : 0;

  const handleAcknowledge = () => {
    acknowledgeAnomaly(anomaly.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className={`p-8 border-b border-slate-700 flex items-center justify-between ${sev.bg}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 ${sev.bg} ${sev.text} rounded-2xl border ${sev.border}`}>
              {typeIcons[anomaly.type]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sev.bg} ${sev.text} border ${sev.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                  {anomaly.severity}
                </span>
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                  {typeLabels[anomaly.type]}
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                {anomaly.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">{anomaly.description}</p>

          {/* Price Comparison */}
          <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Price Comparison</p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Actual Price</span>
                  <span className="font-mono text-white">${anomaly.priceAtDetection.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${anomaly.deviationPercent > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, actualBarWidth)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Expected Price</span>
                  <span className="font-mono text-slate-300">${anomaly.expectedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500/60 transition-all duration-500"
                    style={{ width: `${Math.min(100, expectedBarWidth)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deviation & Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Deviation</p>
              <div className="flex items-center gap-2">
                {anomaly.deviationPercent > 0 ? (
                  <TrendingUp size={18} className="text-green-400" />
                ) : anomaly.deviationPercent < 0 ? (
                  <TrendingDown size={18} className="text-red-400" />
                ) : (
                  <Info size={18} className="text-slate-400" />
                )}
                <span className={`text-2xl font-bebas tracking-wider ${
                  anomaly.deviationPercent > 0 ? 'text-green-400' : anomaly.deviationPercent < 0 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {anomaly.deviationPercent > 0 ? '+' : ''}{anomaly.deviationPercent.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Confidence</p>
              <div className="space-y-2">
                <span className="text-2xl font-bebas tracking-wider text-white">{anomaly.confidence}%</span>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      anomaly.confidence >= 80 ? 'bg-green-500' : anomaly.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${anomaly.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Arbitrage details (only for arbitrage/mispricing type) */}
          {(anomaly.type === 'arbitrage' || anomaly.type === 'mispricing') && (
            <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={16} className="text-purple-400" />
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                  {anomaly.type === 'arbitrage' ? 'Arbitrage Details' : 'Pricing Analysis'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Spread Amount</span>
                  <span className="font-mono text-white text-sm">
                    ${Math.abs(anomaly.priceAtDetection - anomaly.expectedPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Risk Assessment</span>
                  <span className={`text-sm font-bold ${
                    anomaly.severity === 'critical' || anomaly.severity === 'high' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {anomaly.severity === 'critical' ? 'High Risk' : anomaly.severity === 'high' ? 'Medium Risk' : 'Low Risk'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Timeline</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <AlertCircle size={14} />
                <span>Detected</span>
              </div>
              <span className="font-mono text-slate-300">
                {detectedDate.toLocaleDateString()} {detectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={14} />
                <span>Expires</span>
              </div>
              <span className={`font-mono ${hoursRemaining < 12 ? 'text-amber-400' : 'text-slate-300'}`}>
                {hoursRemaining > 0 ? `${hoursRemaining}h remaining` : 'Expired'}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-lime transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, (hoursRemaining / 168) * 100))}%` }}
              />
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="p-5 bg-brand-lime/5 border border-brand-lime/20 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-lime/10 rounded-lg mt-0.5">
                <Zap size={16} className="text-brand-lime" />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest mb-1.5">
                  Recommended Action
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{anomaly.actionRecommendation}</p>
              </div>
            </div>
          </div>

          {/* Related Anomalies */}
          {relatedAnomalies.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                Related Anomalies in {anomaly.sport}
              </p>
              <div className="space-y-2">
                {relatedAnomalies.map(related => {
                  const rs = severityColors[related.severity];
                  return (
                    <div
                      key={related.id}
                      className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${rs.dot}`} />
                        <span className="text-white font-medium">{related.player}</span>
                        <span className="text-slate-500">{typeLabels[related.type]}</span>
                      </div>
                      <span className={`font-mono ${related.deviationPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {related.deviationPercent > 0 ? '+' : ''}{related.deviationPercent.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Acknowledge Button */}
          {!anomaly.isAcknowledged && (
            <button
              onClick={handleAcknowledge}
              className="w-full flex items-center justify-center gap-2 p-4 bg-brand-lime/10 hover:bg-brand-lime/20 text-brand-lime border border-brand-lime/30 rounded-2xl font-bebas tracking-widest text-lg transition-all"
            >
              <CheckCircle2 size={20} />
              Acknowledge Anomaly
            </button>
          )}

          {anomaly.isAcknowledged && (
            <div className="flex items-center justify-center gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-slate-400 text-sm">
              <CheckCircle2 size={16} />
              Already Acknowledged
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetailModal;
