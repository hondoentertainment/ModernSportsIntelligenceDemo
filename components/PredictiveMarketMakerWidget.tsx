// Phase 109: Predictive Market Maker Widget
// Portfolio liquidity gauge, top spread alerts, mini order book preview

import React, { useMemo } from 'react';
import {
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getPortfolioLiquidity,
  getSpreadAlerts,
  getSyntheticOrderBook,
  getAllCards,
  SpreadAlert,
  SyntheticOrderBook,
  PortfolioLiquidityAnalysis,
} from '../lib/predictiveMarketMakerService';

interface PredictiveMarketMakerWidgetProps {
  inventory: CardInventory[];
  onOpenModal?: () => void;
}

function liquidityColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function _liquidityBg(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

const LiquidityGauge: React.FC<{ score: number }> = ({ score }) => {
  const rotation = (score / 100) * 180 - 90;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-20 mx-auto">
      {/* Arc background */}
      <svg viewBox="0 0 120 70" className="w-full h-full">
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke="#334155"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 157} 157`}
          className="transition-all duration-1000"
        />
      </svg>
      {/* Needle */}
      <div className="absolute inset-0 flex items-end justify-center pb-0">
        <div
          className="w-0.5 h-10 origin-bottom transition-transform duration-1000"
          style={{
            background: color,
            transform: `rotate(${rotation}deg)`,
          }}
        />
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span className={`font-bebas text-2xl tracking-wider ${liquidityColor(score)}`}>
          {score}
        </span>
      </div>
    </div>
  );
};

const MiniOrderBook: React.FC<{ book: SyntheticOrderBook }> = ({ book }) => {
  const topBids = book.bids.slice(0, 4);
  const topAsks = book.asks.slice(0, 4);
  const maxQty = Math.max(
    ...topBids.map(b => b.quantity),
    ...topAsks.map(a => a.quantity),
    1,
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-bold px-1">
        <span>Price</span>
        <span>Qty</span>
      </div>
      {/* Asks (reversed so lowest ask is closest to midpoint) */}
      {[...topAsks].reverse().map((entry, i) => (
        <div key={`ask-${i}`} className="relative flex items-center justify-between px-1.5 py-0.5 rounded text-xs">
          <div
            className="absolute inset-0 bg-red-500/10 rounded"
            style={{ width: `${(entry.quantity / maxQty) * 100}%`, marginLeft: 'auto' }}
          />
          <span className="relative text-red-400 font-mono text-[11px]">${entry.price.toLocaleString()}</span>
          <span className="relative text-slate-400 font-mono text-[11px]">{entry.quantity}</span>
        </div>
      ))}
      {/* Midpoint */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex-1 h-px bg-slate-600" />
        <span className="text-[10px] font-bold text-white">${book.midpoint.toLocaleString()}</span>
        <div className="flex-1 h-px bg-slate-600" />
      </div>
      {/* Bids */}
      {topBids.map((entry, i) => (
        <div key={`bid-${i}`} className="relative flex items-center justify-between px-1.5 py-0.5 rounded text-xs">
          <div
            className="absolute inset-0 bg-emerald-500/10 rounded"
            style={{ width: `${(entry.quantity / maxQty) * 100}%` }}
          />
          <span className="relative text-emerald-400 font-mono text-[11px]">${entry.price.toLocaleString()}</span>
          <span className="relative text-slate-400 font-mono text-[11px]">{entry.quantity}</span>
        </div>
      ))}
    </div>
  );
};

const PredictiveMarketMakerWidget: React.FC<PredictiveMarketMakerWidgetProps> = ({ inventory, onOpenModal }) => {
  const portfolio = useMemo<PortfolioLiquidityAnalysis>(
    () => getPortfolioLiquidity(inventory),
    [inventory],
  );

  const alerts = useMemo<SpreadAlert[]>(
    () => getSpreadAlerts(inventory).slice(0, 4),
    [inventory],
  );

  const topOrderBook = useMemo<SyntheticOrderBook | null>(() => {
    const cards = getAllCards();
    if (cards.length === 0) return null;
    return getSyntheticOrderBook(cards[0].id);
  }, []);

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400">
            <Activity size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Predictive <span className="text-violet-400">Market Maker</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Synthetic liquidity engine
            </p>
          </div>
        </div>
        {onOpenModal && (
          <button
            onClick={onOpenModal}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 transition-colors"
          >
            Full Dashboard
          </button>
        )}
      </div>

      {/* Liquidity Gauge + Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
            Portfolio Liquidity
          </p>
          <LiquidityGauge score={portfolio.overallScore} />
          <p className="text-[10px] text-slate-500 mt-1">
            {portfolio.liquidCards} liquid &middot; {portfolio.illiquidCards} illiquid &middot; {portfolio.frozenCards} frozen
          </p>
        </div>
        <div className="space-y-2">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase">Avg Spread</p>
            <p className={`font-bebas text-xl tracking-wider ${portfolio.avgSpread > 12 ? 'text-red-400' : portfolio.avgSpread > 6 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {portfolio.avgSpread.toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase">Avg Days to Sell</p>
            <p className={`font-bebas text-xl tracking-wider ${portfolio.avgDaysToSell > 30 ? 'text-red-400' : portfolio.avgDaysToSell > 14 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {portfolio.avgDaysToSell}d
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase">Liquid Value</p>
            <p className="font-mono text-sm text-white">
              ${portfolio.estimatedLiquidValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Spread Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 size={10} className="text-violet-400" />
            Spread Alerts
          </p>
          <div className="space-y-1.5">
            {alerts.map(alert => {
              const isNarrow = alert.type === 'narrowing';
              return (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                    isNarrow
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-amber-500/5 border-amber-500/20'
                  }`}
                >
                  {isNarrow ? (
                    <ArrowDownRight size={14} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <ArrowUpRight size={14} className="text-amber-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-semibold truncate block">{alert.player}</span>
                    <span className="text-slate-400 truncate block">{alert.reason}</span>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className={`font-bold ${isNarrow ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isNarrow ? 'SELL' : 'BUY'}
                    </span>
                    <span className="text-slate-500">
                      {alert.previousSpread.toFixed(1)}% → {alert.currentSpread.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mini Order Book */}
      {topOrderBook && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
            <Gauge size={10} className="text-violet-400" />
            Top Card Order Book &mdash; {topOrderBook.player}
          </p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
            <MiniOrderBook book={topOrderBook} />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
              <span className="text-[10px] text-slate-500">
                Depth: {topOrderBook.depthScore}/100
              </span>
              <span className={`text-[10px] font-bold ${topOrderBook.imbalance > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {topOrderBook.imbalance > 0 ? 'Buy pressure' : 'Sell pressure'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveMarketMakerWidget;
