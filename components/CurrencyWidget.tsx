import React, { useMemo } from 'react';
import {
  Globe,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  AlertCircle,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  CurrencyCode,
  CURRENCIES,
  getSelectedCurrency,
  getAllExchangeRates,
  getPortfolioInCurrency,
  getCurrencyImpact,
  formatCurrency,
  getInternationalAlerts,
} from '../lib/currencyService';

interface CurrencyWidgetProps {
  inventory: CardInventory[];
  onClick?: () => void;
}

export const CurrencyWidget: React.FC<CurrencyWidgetProps> = ({ inventory, onClick }) => {
  const selectedCurrency = useMemo(() => getSelectedCurrency(), []);
  const currencyInfo = CURRENCIES[selectedCurrency];
  const rates = useMemo(() => getAllExchangeRates(), []);
  const portfolio = useMemo(
    () => getPortfolioInCurrency(inventory, selectedCurrency),
    [inventory, selectedCurrency]
  );
  const impact = useMemo(
    () => getCurrencyImpact(inventory, selectedCurrency),
    [inventory, selectedCurrency]
  );
  const alerts = useMemo(() => getInternationalAlerts(inventory), [inventory]);

  // Top 3 rate movers
  const topMovers = useMemo(() => {
    return [...rates]
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, 3);
  }, [rates]);

  const highPriorityAlerts = alerts.filter(a => a.urgency === 'high').length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Globe size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Multi-Currency <span className="text-emerald-400">Markets</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              International pricing & FX impact
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Portfolio Value in Selected Currency */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex-1">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Portfolio ({currencyInfo.code})
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {formatCurrency(portfolio.totalValue, selectedCurrency)}
          </p>
        </div>
        <div className="h-10 w-px bg-slate-700" />
        <div className="flex-1 text-right">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            FX Impact
          </p>
          <p className={`text-2xl font-bebas tracking-wider ${
            impact.impactAmount >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {impact.impactAmount >= 0 ? '+' : ''}{formatCurrency(Math.abs(impact.impactAmount), selectedCurrency)}
          </p>
        </div>
      </div>

      {/* Currency Impact Trend */}
      {selectedCurrency !== 'USD' && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
          impact.trend === 'favorable'
            ? 'bg-green-500/5 border-green-500/15'
            : impact.trend === 'unfavorable'
              ? 'bg-red-500/5 border-red-500/15'
              : 'bg-slate-800/30 border-slate-700'
        }`}>
          {impact.trend === 'favorable' ? (
            <TrendingUp size={14} className="text-green-400 flex-shrink-0" />
          ) : impact.trend === 'unfavorable' ? (
            <TrendingDown size={14} className="text-red-400 flex-shrink-0" />
          ) : (
            <ArrowRightLeft size={14} className="text-slate-400 flex-shrink-0" />
          )}
          <span className="text-xs text-slate-400 flex-shrink-0">7d FX:</span>
          <span className={`text-xs font-bold ${
            impact.change7dPercent < 0 ? 'text-green-400' : impact.change7dPercent > 0 ? 'text-red-400' : 'text-slate-300'
          }`}>
            {impact.change7dPercent > 0 ? '+' : ''}{impact.change7dPercent.toFixed(2)}%
          </span>
          <span className="ml-auto text-[10px] text-slate-500 flex-shrink-0">
            {impact.trend === 'favorable' ? 'USD weakening' : impact.trend === 'unfavorable' ? 'USD strengthening' : 'Stable'}
          </span>
        </div>
      )}

      {/* Top Rate Movers */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Top Movers (24h)
        </p>
        {topMovers.map(rate => {
          const info = CURRENCIES[rate.to];
          return (
            <div
              key={rate.to}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 rounded-xl"
            >
              <span className="text-xs font-bold text-white w-8">{rate.to}</span>
              <span className="text-xs text-slate-400 flex-1 truncate">{info.name}</span>
              <span className="text-xs text-slate-300 font-mono">
                {rate.rate < 10 ? rate.rate.toFixed(4) : rate.rate.toFixed(2)}
              </span>
              <span className={`text-xs font-bold ${
                rate.change24h > 0 ? 'text-red-400' : rate.change24h < 0 ? 'text-green-400' : 'text-slate-400'
              }`}>
                {rate.change24h > 0 ? '+' : ''}{rate.change24h.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Alert Badge */}
      {highPriorityAlerts > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
          <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-400 font-medium">
            {highPriorityAlerts} cross-border deal{highPriorityAlerts !== 1 ? 's' : ''} detected
          </span>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 group-hover:text-brand-lime transition-colors pt-1">
        <ArrowRightLeft size={14} />
        <span>Open Currency Manager</span>
      </div>
    </button>
  );
};

export default CurrencyWidget;
