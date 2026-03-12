import React, { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Diamond,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getSupplyRiskAlerts,
  getCollectionPopImpact,
  getGemRateData,
  SupplyRiskAlert,
} from '../lib/popGrowthService';

interface PopGrowthWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

const severityColors: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  warning: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  watch: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
};

export const PopGrowthWidget: React.FC<PopGrowthWidgetProps> = ({ cards, onClick }) => {
  const impacts = useMemo(() => getCollectionPopImpact(cards), [cards]);
  const alerts = useMemo(() => getSupplyRiskAlerts(cards), [cards]);

  const supplyPressureCount = useMemo(
    () => impacts.filter(i => i.riskLevel === 'high' || i.riskLevel === 'medium').length,
    [impacts]
  );

  // Average gem rate trend across all cards
  const gemRateTrend = useMemo(() => {
    if (cards.length === 0) return 'stable' as const;
    let rising = 0;
    let falling = 0;
    for (const card of cards.slice(0, 10)) {
      const data = getGemRateData(card);
      if (data.gemRateTrend === 'rising') rising++;
      else if (data.gemRateTrend === 'falling') falling++;
    }
    if (rising > falling) return 'rising' as const;
    if (falling > rising) return 'falling' as const;
    return 'stable' as const;
  }, [cards]);

  const trendIcon = gemRateTrend === 'rising'
    ? <TrendingUp size={14} />
    : gemRateTrend === 'falling'
      ? <TrendingDown size={14} />
      : <Minus size={14} />;

  const trendColor = gemRateTrend === 'rising'
    ? 'text-green-400'
    : gemRateTrend === 'falling'
      ? 'text-red-400'
      : 'text-slate-400';

  const trendLabel = gemRateTrend === 'rising'
    ? 'Rising'
    : gemRateTrend === 'falling'
      ? 'Falling'
      : 'Stable';

  // Top 3 alerts
  const topAlerts: SupplyRiskAlert[] = alerts.slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Activity size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Pop Report <span className="text-blue-400">Growth</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Supply tracking & alerts
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Supply Pressure + Gem Rate Summary */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
          supplyPressureCount > 0 ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30' : 'text-green-400 bg-green-500/15 border border-green-500/30'
        }`}>
          <AlertTriangle size={14} />
          {supplyPressureCount} {supplyPressureCount === 1 ? 'card' : 'cards'} at risk
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className={`flex items-center gap-1.5 text-xs font-bold ${trendColor}`}>
          <Diamond size={12} />
          Gem Rate {trendIcon} {trendLabel}
        </div>
      </div>

      {/* Top 3 Pop Growth Alerts */}
      {topAlerts.length > 0 && (
        <div className="space-y-2">
          {topAlerts.map((alert, i) => {
            const colors = severityColors[alert.severity];
            return (
              <div
                key={`${alert.cardId}-${alert.grade}-${i}`}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${colors.bg} ${colors.border}`}
              >
                <AlertTriangle size={12} className={colors.text} />
                <span className="text-xs text-slate-300 truncate flex-1">
                  {alert.player}
                </span>
                <span className={`text-xs font-mono font-bold ${colors.text}`}>
                  {alert.grade} +{alert.growthRate.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {topAlerts.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/5 border border-green-500/15 rounded-xl">
          <span className="text-xs text-green-400 font-medium">
            No significant supply alerts for your collection
          </span>
        </div>
      )}
    </button>
  );
};

export default PopGrowthWidget;
