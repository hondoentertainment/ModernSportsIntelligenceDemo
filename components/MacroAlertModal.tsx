// @ts-nocheck
import React, { useMemo } from 'react';
import { X, AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { MacroAlert, getIndicatorHistory, getRelatedIndicators, MacroIndicator } from '../lib/analytics/macroSentinelService';

interface MacroAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: MacroAlert | null;
}

const MacroAlertModal: React.FC<MacroAlertModalProps> = ({ isOpen, onClose, alert }) => {
  const history = useMemo(() => {
    if (!alert) return [];
    return getIndicatorHistory(alert.indicator.id, 6);
  }, [alert]);

  const relatedIndicators = useMemo(() => {
    if (!alert) return [];
    return getRelatedIndicators(alert.indicator.id);
  }, [alert]);

  if (!isOpen || !alert) return null;

  const severityConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    Critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <AlertTriangle size={24} /> },
    Warning: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: <AlertCircle size={24} /> },
    Info: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Info size={24} /> },
  };

  const sev = severityConfig[alert.severity];
  const ind = alert.indicator;

  const trendIcon = ind.trend === 'Rising'
    ? <TrendingUp size={16} className="text-green-400" />
    : ind.trend === 'Falling'
      ? <TrendingDown size={16} className="text-red-400" />
      : <Minus size={16} className="text-slate-400" />;

  // Sparkline rendering
  const sparkMin = Math.min(...history);
  const sparkMax = Math.max(...history);
  const sparkRange = sparkMax - sparkMin || 1;
  const sparkPoints = history
    .map((v, i) => {
      const x = (i / (history.length - 1)) * 100;
      const y = 100 - ((v - sparkMin) / sparkRange) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-brand-slate border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500">
        {/* Severity glow */}
        <div className={`absolute -top-20 -right-20 w-56 h-56 ${alert.severity === 'Critical' ? 'bg-red-500/15' : alert.severity === 'Warning' ? 'bg-orange-500/15' : 'bg-blue-500/15'} blur-[80px] rounded-full`} />

        <div className="p-8 space-y-6 relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${sev.bg} ${sev.color}`}>
                {sev.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${sev.color}`}>{alert.severity} Alert</span>
                </div>
                <h2 className="text-xl font-bebas tracking-wide text-white">{alert.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-brand-charcoal border border-slate-800 text-brand-muted hover:text-white hover:border-slate-700 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-brand-muted font-medium leading-relaxed">
            {alert.description}
          </p>

          {/* Indicator Details */}
          <div className={`p-5 rounded-2xl bg-brand-charcoal/50 border ${sev.border} space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">{ind.category} Indicator</p>
                <p className="text-sm font-bold text-white">{ind.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {trendIcon}
                <span className={`text-lg font-mono font-bold ${ind.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {ind.change >= 0 ? '+' : ''}{ind.change.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Current Value</p>
                <p className="text-lg font-mono font-bold text-white">{ind.currentValue.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Previous Value</p>
                <p className="text-lg font-mono font-bold text-slate-400">{ind.previousValue.toFixed(1)}</p>
              </div>
            </div>
          </div>

          {/* Historical Sparkline */}
          <div className="p-5 rounded-2xl bg-brand-charcoal/30 border border-slate-800 space-y-3">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">6-Period Trend</p>
            <div className="h-16 w-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke={alert.severity === 'Critical' ? '#F87171' : alert.severity === 'Warning' ? '#FB923C' : '#60A5FA'}
                  strokeWidth="2"
                  points={sparkPoints}
                />
                {history.map((v, i) => {
                  const x = (i / (history.length - 1)) * 100;
                  const y = 100 - ((v - sparkMin) / sparkRange) * 100;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="2.5"
                      fill={alert.severity === 'Critical' ? '#F87171' : alert.severity === 'Warning' ? '#FB923C' : '#60A5FA'}
                    />
                  );
                })}
              </svg>
            </div>
            <div className="flex justify-between text-[9px] text-brand-muted font-mono">
              <span>{history[0]?.toFixed(1)}</span>
              <span>{history[history.length - 1]?.toFixed(1)}</span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-5 rounded-2xl bg-brand-lime/5 border border-brand-lime/20 space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRight size={14} className="text-brand-lime" />
              <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Recommended Action</p>
            </div>
            <p className="text-sm text-white font-medium leading-relaxed">{alert.recommendation}</p>
          </div>

          {/* Related Indicators */}
          {relatedIndicators.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Related Indicators</p>
              <div className="grid grid-cols-2 gap-3">
                {relatedIndicators.slice(0, 4).map((ri: MacroIndicator) => (
                  <div key={ri.id} className="p-3 rounded-xl bg-brand-charcoal/30 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{ri.category}</p>
                      <p className="text-xs font-bold text-white truncate">{ri.name}</p>
                    </div>
                    <span className={`text-xs font-mono font-bold ${ri.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {ri.change >= 0 ? '+' : ''}{ri.change.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MacroAlertModal;
