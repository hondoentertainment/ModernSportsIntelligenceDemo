import React, { useMemo } from 'react';
import { Shield, TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { CardInventory } from '../types';
import {
  generateMacroSummary,
  MacroAlert,
  MacroIndicator,
  MarketRegime,
  ExposureLevel,
} from '../lib/macroSentinelService';

interface MacroSentinelWidgetProps {
  inventory: CardInventory[];
  onAlertClick: (alert: MacroAlert) => void;
}

const regimeStyles: Record<MarketRegime, { color: string; bg: string; border: string }> = {
  'Risk-On': { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  'Risk-Off': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  'Transition': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'Neutral': { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const exposureStyles: Record<ExposureLevel, { color: string; bg: string }> = {
  'Well-Positioned': { color: 'text-green-400', bg: 'bg-green-500/10' },
  'Moderately Exposed': { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'At Risk': { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'Critical Exposure': { color: 'text-red-400', bg: 'bg-red-500/10' },
};

const severityConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <AlertTriangle size={16} /> },
  Warning: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: <AlertCircle size={16} /> },
  Info: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Info size={16} /> },
};

const MacroSentinelWidget: React.FC<MacroSentinelWidgetProps> = ({ inventory, onAlertClick }) => {
  const summary = useMemo(() => generateMacroSummary(inventory), [inventory]);

  const rStyle = regimeStyles[summary.regime];
  const eStyle = exposureStyles[summary.exposure.level];

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Shield size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Macro <span className="text-brand-lime">Sentinel</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Global market early warning system
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Market Regime Badge */}
          <div className={`px-4 py-2 rounded-xl ${rStyle.bg} border ${rStyle.border} flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${rStyle.color.replace('text-', 'bg-')} animate-pulse`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${rStyle.color}`}>
              {summary.regime}
            </span>
          </div>

          {/* Portfolio Exposure Badge */}
          <div className={`px-4 py-2 rounded-xl ${eStyle.bg} flex items-center gap-2`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${eStyle.color}`}>
              {summary.exposure.level}
            </span>
          </div>
        </div>
      </div>

      {/* Exposure Summary */}
      <p className="text-sm text-brand-muted font-medium leading-relaxed">
        {summary.exposure.summary}
      </p>

      {/* Indicator Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.indicators.map((ind: MacroIndicator) => {
          const trendIcon = ind.trend === 'Rising'
            ? <TrendingUp size={14} className="text-green-400" />
            : ind.trend === 'Falling'
              ? <TrendingDown size={14} className="text-red-400" />
              : <Minus size={14} className="text-slate-500" />;

          const impactColor = ind.impact === 'Bullish'
            ? 'text-green-400 bg-green-500/10'
            : ind.impact === 'Bearish'
              ? 'text-red-400 bg-red-500/10'
              : 'text-slate-400 bg-slate-500/10';

          return (
            <div
              key={ind.id}
              className="p-4 rounded-2xl bg-brand-charcoal/30 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{ind.category}</span>
                {trendIcon}
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate mb-1">{ind.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold text-white">{ind.currentValue.toFixed(1)}</span>
                  <span className={`text-xs font-mono font-bold ${ind.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ind.change >= 0 ? '+' : ''}{ind.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${impactColor}`}>
                {ind.impact}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active Alerts */}
      {summary.alerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Active Alerts ({summary.alerts.length})
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.alerts.slice(0, 4).map((alert: MacroAlert) => {
              const sev = severityConfig[alert.severity];
              return (
                <button
                  key={alert.id}
                  onClick={() => onAlertClick(alert)}
                  className={`p-4 rounded-2xl bg-brand-charcoal/30 border ${sev.border} text-left hover:bg-brand-charcoal/50 transition-all group space-y-2`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${sev.bg} ${sev.color}`}>
                        {sev.icon}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${sev.color}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-brand-muted group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-white group-hover:text-brand-lime transition-colors">
                    {alert.title}
                  </p>
                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-2">
                    {alert.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {summary.recommendedActions.length > 0 && (
        <div className="p-5 rounded-2xl bg-brand-lime/5 border border-brand-lime/20 space-y-3">
          <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Recommended Actions</p>
          <ul className="space-y-2">
            {summary.recommendedActions.map((action: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white font-medium">
                <ArrowRight size={14} className="text-brand-lime mt-0.5 shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(MacroSentinelWidget);
