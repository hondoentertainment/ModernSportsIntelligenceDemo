// Phase 109: Predictive Market Maker Modal — 5-tab layout
// Tabs: Order Book, Liquidity Dashboard, Pricing Oracle, Spread Alerts, Market Depth
import React, { useState, useMemo } from 'react';
import {
  X, Activity, BarChart3, DollarSign, Bell, Map,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ChevronDown, ChevronUp, Target, Gauge, Layers, Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from 'recharts';
import {
  getAllCards,
  getSyntheticSpread,
  getSyntheticOrderBook,
  getLiquidityScore,
  getTargetPricing,
  getPortfolioLiquidity,
  getSpreadAlerts,
  getMarketDepthBySegment,
  SyntheticOrderBook,
  SyntheticSpread,
  LiquidityScore,
  PricingOracle,
  SpreadAlert,
  MarketDepthAnalysis,
  PortfolioLiquidityAnalysis,
  OrderBookEntry,
} from '../lib/predictiveMarketMakerService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PredictiveMarketMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'orderbook' | 'liquidity' | 'oracle' | 'alerts' | 'depth';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'orderbook', label: 'Order Book', icon: <Layers size={14} /> },
  { id: 'liquidity', label: 'Liquidity', icon: <Gauge size={14} /> },
  { id: 'oracle', label: 'Pricing Oracle', icon: <Target size={14} /> },
  { id: 'alerts', label: 'Spread Alerts', icon: <Bell size={14} /> },
  { id: 'depth', label: 'Market Depth', icon: <Map size={14} /> },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function liquidityTierBadge(tier: string): { label: string; cls: string } {
  switch (tier) {
    case 'liquid': return { label: 'LIQUID', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    case 'moderate': return { label: 'MODERATE', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    case 'illiquid': return { label: 'ILLIQUID', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/40' };
    case 'frozen': return { label: 'FROZEN', cls: 'bg-red-500/20 text-red-400 border-red-500/40' };
    default: return { label: tier.toUpperCase(), cls: 'bg-slate-500/20 text-slate-400 border-slate-500/40' };
  }
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function trendIcon(trend: string): React.ReactNode {
  if (trend === 'improving') return <TrendingUp size={12} className="text-emerald-400" />;
  if (trend === 'deteriorating') return <TrendingDown size={12} className="text-red-400" />;
  return <Activity size={12} className="text-slate-400" />;
}

// ── Tab: Order Book ───────────────────────────────────────────────────────────

const OrderBookTab: React.FC = () => {
  const cards = useMemo(() => getAllCards(), []);
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || '');

  const spread = useMemo(() => selectedCardId ? getSyntheticSpread(selectedCardId) : null, [selectedCardId]);
  const book = useMemo(() => selectedCardId ? getSyntheticOrderBook(selectedCardId) : null, [selectedCardId]);

  const chartData = useMemo(() => {
    if (!book) return [];
    const bidData = book.bids.map(b => ({
      price: b.price,
      bidQty: b.cumulative,
      askQty: 0,
    }));
    const askData = book.asks.map(a => ({
      price: a.price,
      bidQty: 0,
      askQty: a.cumulative,
    }));
    return [...bidData.reverse(), ...askData];
  }, [book]);

  return (
    <div className="space-y-4">
      {/* Card Selector */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Select card to view synthetic order book</label>
        <select
          value={selectedCardId}
          onChange={e => setSelectedCardId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
        >
          {cards.map(c => (
            <option key={c.id} value={c.id}>
              {c.player} — {c.cardDescription} ({c.grade})
            </option>
          ))}
        </select>
      </div>

      {/* Spread Summary */}
      {spread && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase">Bid</p>
            <p className="text-sm font-bold text-emerald-400">${spread.bid.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase">Ask</p>
            <p className="text-sm font-bold text-red-400">${spread.ask.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase">Midpoint</p>
            <p className="text-sm font-bold text-white">${spread.midpoint.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase">Spread</p>
            <p className={`text-sm font-bold ${spread.spreadWidth > 12 ? 'text-red-400' : spread.spreadWidth > 6 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {spread.spreadWidth.toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
            <p className={`text-sm font-bold ${scoreColor(spread.confidence)}`}>{spread.confidence}%</p>
          </div>
        </div>
      )}

      {/* Depth Chart */}
      {chartData.length > 0 && book && (
        <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <Layers size={12} className="text-violet-400" /> Synthetic Depth Chart
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="price"
                tick={{ fill: '#94a3b8', fontSize: 9 }}
                tickFormatter={v => `$${Number(v).toLocaleString()}`}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                labelFormatter={v => `$${Number(v).toLocaleString()}`}
              />
              <Bar dataKey="bidQty" fill="#10b981" name="Bid Depth" radius={[2, 2, 0, 0]} />
              <Bar dataKey="askQty" fill="#ef4444" name="Ask Depth" radius={[2, 2, 0, 0]} />
              <ReferenceLine
                x={book.midpoint}
                stroke="#8b5cf6"
                strokeDasharray="5 5"
                label={{ value: 'Mid', position: 'top', fill: '#8b5cf6', fontSize: 10 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Raw Order Book */}
      {book && (
        <div className="grid grid-cols-2 gap-3">
          {/* Bids */}
          <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase mb-2 flex items-center gap-1">
              <TrendingUp size={11} /> Bids
            </h4>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-500 uppercase px-1 mb-1">
                <span>Price</span><span>Qty</span><span>Cum</span><span>Source</span>
              </div>
              {book.bids.map((entry, i) => (
                <div key={i} className="relative flex justify-between px-1.5 py-1 rounded text-[11px]">
                  <div
                    className="absolute inset-0 bg-emerald-500/8 rounded"
                    style={{ width: `${Math.min(100, entry.cumulative * 10)}%` }}
                  />
                  <span className="relative text-emerald-400 font-mono">${entry.price.toLocaleString()}</span>
                  <span className="relative text-slate-300 font-mono">{entry.quantity}</span>
                  <span className="relative text-slate-500 font-mono">{entry.cumulative}</span>
                  <span className="relative text-slate-600 text-[9px] truncate max-w-[60px]">{entry.source.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Asks */}
          <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50">
            <h4 className="text-xs font-semibold text-red-400 uppercase mb-2 flex items-center gap-1">
              <TrendingDown size={11} /> Asks
            </h4>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-500 uppercase px-1 mb-1">
                <span>Price</span><span>Qty</span><span>Cum</span><span>Source</span>
              </div>
              {book.asks.map((entry, i) => (
                <div key={i} className="relative flex justify-between px-1.5 py-1 rounded text-[11px]">
                  <div
                    className="absolute inset-0 bg-red-500/8 rounded"
                    style={{ width: `${Math.min(100, entry.cumulative * 10)}%`, marginLeft: 'auto' }}
                  />
                  <span className="relative text-red-400 font-mono">${entry.price.toLocaleString()}</span>
                  <span className="relative text-slate-300 font-mono">{entry.quantity}</span>
                  <span className="relative text-slate-500 font-mono">{entry.cumulative}</span>
                  <span className="relative text-slate-600 text-[9px] truncate max-w-[60px]">{entry.source.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book metrics */}
      {book && (
        <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-xs">
          <span className="text-slate-400">
            Depth Score: <span className={`font-bold ${scoreColor(book.depthScore)}`}>{book.depthScore}/100</span>
          </span>
          <span className="text-slate-400">
            Imbalance: <span className={`font-bold ${book.imbalance > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {book.imbalance > 0 ? '+' : ''}{book.imbalance.toFixed(2)} ({book.imbalance > 0 ? 'Buy' : 'Sell'} pressure)
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

// ── Tab: Liquidity Dashboard ──────────────────────────────────────────────────

const LiquidityTab: React.FC = () => {
  const portfolio = useMemo(() => getPortfolioLiquidity(), []);
  const cards = useMemo(() => getAllCards(), []);
  const [showAll, setShowAll] = useState(false);

  const cardScores = useMemo(() => {
    return cards
      .map(c => getLiquidityScore(c.id))
      .filter((s): s is LiquidityScore => s !== null)
      .sort((a, b) => b.score - a.score);
  }, [cards]);

  const displayCards = showAll ? cardScores : cardScores.slice(0, 15);

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Overall Score</p>
          <p className={`text-2xl font-bold ${scoreColor(portfolio.overallScore)}`}>{portfolio.overallScore}</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Avg Spread</p>
          <p className="text-sm font-bold text-slate-200">{portfolio.avgSpread.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Liquid Value</p>
          <p className="text-sm font-bold text-emerald-400">${portfolio.estimatedLiquidValue.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Total Value</p>
          <p className="text-sm font-bold text-white">${portfolio.estimatedTotalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Segment breakdown */}
      <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
          <BarChart3 size={12} className="text-violet-400" /> Liquidity by Segment
        </h4>
        <div className="space-y-2">
          {portfolio.liquidityBySegment.map(seg => (
            <div key={seg.segment} className="flex items-center gap-3">
              <span className="text-xs text-slate-300 w-36 truncate">{seg.label}</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    seg.score >= 70 ? 'bg-emerald-500' : seg.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${seg.score}%` }}
                />
              </div>
              <span className={`text-xs font-bold w-8 text-right ${scoreColor(seg.score)}`}>{seg.score}</span>
              <span className="text-[10px] text-slate-500 w-12 text-right">{seg.count} cards</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      {portfolio.riskFactors.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-red-400 uppercase mb-2">Liquidity Risk Factors</h4>
          <ul className="space-y-1">
            {portfolio.riskFactors.map((rf, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">&#8226;</span> {rf}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Card-level liquidity */}
      <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Card Liquidity Scores</h4>
        <div className="space-y-1">
          {displayCards.map(card => {
            const badge = liquidityTierBadge(card.tier);
            return (
              <div key={card.cardId} className="flex items-center gap-2 py-1.5 border-b border-slate-700/30 last:border-0">
                <span className="text-xs text-white font-semibold flex-1 min-w-0 truncate">{card.player}</span>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${badge.cls}`}>{badge.label}</span>
                <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${card.score >= 70 ? 'bg-emerald-500' : card.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${card.score}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-6 text-right ${scoreColor(card.score)}`}>{card.score}</span>
                <span className="text-[10px] text-slate-500 w-10 text-right">{card.avgDaysToSell}d</span>
                <span className="text-[10px] text-slate-500 w-12 text-right">{card.spreadWidth.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
        {cardScores.length > 15 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            {showAll ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show all {cardScores.length} cards</>}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Tab: Pricing Oracle ───────────────────────────────────────────────────────

const PricingOracleTab: React.FC = () => {
  const cards = useMemo(() => getAllCards(), []);
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || '');

  const pricing = useMemo(() => selectedCardId ? getTargetPricing(selectedCardId) : null, [selectedCardId]);

  const chartData = useMemo(() => {
    if (!pricing) return [];
    return pricing.targets.map(t => ({
      days: `${t.daysToSell}d`,
      price: t.suggestedPrice,
      probability: t.probability,
      isOptimal: t.daysToSell === pricing.optimalDaysToSell,
    }));
  }, [pricing]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Select card for pricing analysis</label>
        <select
          value={selectedCardId}
          onChange={e => setSelectedCardId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
        >
          {cards.map(c => (
            <option key={c.id} value={c.id}>
              {c.player} — {c.cardDescription} ({c.grade})
            </option>
          ))}
        </select>
      </div>

      {pricing && (
        <>
          {/* Current midpoint & optimal */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase">Current Midpoint</p>
              <p className="text-lg font-bold text-white">${pricing.currentMidpoint.toLocaleString()}</p>
            </div>
            <div className="bg-violet-500/10 rounded-lg p-3 text-center border border-violet-500/30">
              <p className="text-[10px] text-violet-400 uppercase">Optimal Price</p>
              <p className="text-lg font-bold text-violet-400">${pricing.optimalPrice.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase">Optimal Timeframe</p>
              <p className="text-lg font-bold text-amber-400">{pricing.optimalDaysToSell}d</p>
            </div>
          </div>

          {/* Price/time chart */}
          <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <Target size={12} className="text-violet-400" /> Price vs. Time-to-Sell
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="days" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${Number(v).toLocaleString()}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Target Price']}
                />
                <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.isOptimal ? '#8b5cf6' : '#475569'} />
                  ))}
                </Bar>
                <ReferenceLine
                  y={pricing.currentMidpoint}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{ value: 'Midpoint', position: 'right', fill: '#f59e0b', fontSize: 10 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Target table */}
          <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Sell Velocity Targets</h4>
            <div className="space-y-1">
              <div className="flex items-center text-[9px] text-slate-500 uppercase px-2 pb-1">
                <span className="w-16">Timeframe</span>
                <span className="flex-1">Target Price</span>
                <span className="w-20 text-right">vs Midpoint</span>
                <span className="w-20 text-right">Probability</span>
              </div>
              {pricing.targets.map(t => (
                <div
                  key={t.daysToSell}
                  className={`flex items-center px-2 py-2 rounded-lg text-xs ${
                    t.daysToSell === pricing.optimalDaysToSell
                      ? 'bg-violet-500/10 border border-violet-500/30'
                      : 'border border-transparent'
                  }`}
                >
                  <span className="w-16 font-bold text-white">
                    {t.daysToSell}d
                    {t.daysToSell === pricing.optimalDaysToSell && (
                      <span className="ml-1 text-[8px] text-violet-400">BEST</span>
                    )}
                  </span>
                  <span className="flex-1 font-mono text-slate-200">${t.suggestedPrice.toLocaleString()}</span>
                  <span className={`w-20 text-right font-mono ${t.priceVsMidpoint >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.priceVsMidpoint >= 0 ? '+' : ''}{t.priceVsMidpoint.toFixed(1)}%
                  </span>
                  <span className="w-20 text-right">
                    <span className={`font-bold ${t.probability >= 80 ? 'text-emerald-400' : t.probability >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {t.probability}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Tab: Spread Alerts ────────────────────────────────────────────────────────

const SpreadAlertsTab: React.FC = () => {
  const alerts = useMemo(() => getSpreadAlerts(), []);
  const [filterType, setFilterType] = useState<'all' | 'narrowing' | 'widening'>('all');

  const filtered = useMemo(() => {
    if (filterType === 'all') return alerts;
    return alerts.filter(a => a.type === filterType);
  }, [alerts, filterType]);

  const urgencyStyles: Record<string, string> = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-slate-500',
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {(['all', 'narrowing', 'widening'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === f
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            {f === 'all' ? 'All' : f === 'narrowing' ? 'Sell Signals' : 'Buy Signals'}
            {f !== 'all' && (
              <span className="ml-1.5 text-[10px]">
                ({alerts.filter(a => a.type === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Total Alerts</p>
          <p className="text-xl font-bold text-white">{alerts.length}</p>
        </div>
        <div className="bg-emerald-500/5 rounded-lg p-3 text-center border border-emerald-500/20">
          <p className="text-[10px] text-emerald-400 uppercase">Sell Signals</p>
          <p className="text-xl font-bold text-emerald-400">{alerts.filter(a => a.signal === 'sell_opportunity').length}</p>
        </div>
        <div className="bg-amber-500/5 rounded-lg p-3 text-center border border-amber-500/20">
          <p className="text-[10px] text-amber-400 uppercase">Buy Signals</p>
          <p className="text-xl font-bold text-amber-400">{alerts.filter(a => a.signal === 'buy_opportunity').length}</p>
        </div>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No alerts matching filter</p>
        ) : (
          filtered.map(alert => {
            const isNarrow = alert.type === 'narrowing';
            return (
              <div
                key={alert.id}
                className={`bg-slate-800/70 border border-slate-700/50 border-l-2 ${urgencyStyles[alert.urgency]} rounded-xl p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {isNarrow ? (
                        <ArrowDownRight size={14} className="text-emerald-400" />
                      ) : (
                        <ArrowUpRight size={14} className="text-amber-400" />
                      )}
                      <span className="text-sm font-semibold text-white">{alert.player}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                        isNarrow
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {isNarrow ? 'SELL' : 'BUY'}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                        alert.urgency === 'high'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : alert.urgency === 'medium'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                      }`}>
                        {alert.urgency.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{alert.cardDescription}</p>
                    <p className="text-xs text-slate-500 mt-1">{alert.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">
                      {alert.previousSpread.toFixed(1)}% → {alert.currentSpread.toFixed(1)}%
                    </p>
                    <p className={`text-xs font-bold ${isNarrow ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isNarrow ? '-' : '+'}{alert.changePercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Tab: Market Depth ─────────────────────────────────────────────────────────

const MarketDepthTab: React.FC = () => {
  const segments = useMemo(() => getMarketDepthBySegment(), []);

  const chartData = useMemo(() => {
    return segments.map(s => ({
      segment: s.segmentLabel.replace(' ', '\n'),
      liquidity: s.avgLiquidity,
      spread: s.avgSpread,
      volume: s.totalVolume,
    }));
  }, [segments]);

  const heatColors = (level: number): string => {
    if (level >= 7) return 'bg-emerald-500/30 border-emerald-500/40';
    if (level >= 5) return 'bg-emerald-500/15 border-emerald-500/20';
    if (level >= 3) return 'bg-amber-500/15 border-amber-500/20';
    return 'bg-red-500/15 border-red-500/20';
  };

  return (
    <div className="space-y-4">
      {/* Heatmap grid */}
      <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
          <Map size={12} className="text-violet-400" /> Liquidity Heat Map
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {segments.map(seg => (
            <div
              key={seg.segment}
              className={`rounded-xl p-4 border ${heatColors(seg.heatLevel)} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{seg.segmentLabel}</span>
                {trendIcon(seg.trend)}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${scoreColor(seg.avgLiquidity)}`}>{seg.avgLiquidity}</span>
                <span className="text-[10px] text-slate-500">/100</span>
              </div>
              <div className="mt-2 space-y-0.5 text-[10px] text-slate-400">
                <div className="flex justify-between">
                  <span>Spread</span>
                  <span className="font-mono">{seg.avgSpread.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>30d Volume</span>
                  <span className="font-mono">{seg.totalVolume}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cards</span>
                  <span className="font-mono">{seg.cardCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trend</span>
                  <span className={`font-bold ${
                    seg.trend === 'improving' ? 'text-emerald-400' : seg.trend === 'deteriorating' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {seg.trend}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart comparison */}
      <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
          <BarChart3 size={12} className="text-violet-400" /> Segment Comparison
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="segment"
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              interval={0}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="liquidity" fill="#8b5cf6" name="Liquidity Score" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Segment table */}
      <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Detailed Segment Metrics</h4>
        <div className="space-y-1">
          <div className="flex items-center text-[9px] text-slate-500 uppercase px-2 pb-1">
            <span className="flex-1">Segment</span>
            <span className="w-16 text-right">Liquidity</span>
            <span className="w-16 text-right">Spread</span>
            <span className="w-16 text-right">Volume</span>
            <span className="w-16 text-right">Trend</span>
          </div>
          {segments.map(seg => (
            <div key={seg.segment} className="flex items-center px-2 py-2 border-b border-slate-700/30 last:border-0 text-xs">
              <span className="flex-1 text-white font-semibold">{seg.segmentLabel}</span>
              <span className={`w-16 text-right font-bold ${scoreColor(seg.avgLiquidity)}`}>{seg.avgLiquidity}</span>
              <span className="w-16 text-right text-slate-300 font-mono">{seg.avgSpread.toFixed(1)}%</span>
              <span className="w-16 text-right text-slate-300 font-mono">{seg.totalVolume}</span>
              <span className={`w-16 text-right font-bold ${
                seg.trend === 'improving' ? 'text-emerald-400' : seg.trend === 'deteriorating' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {seg.trend}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────

const PredictiveMarketMakerModal: React.FC<PredictiveMarketMakerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('orderbook');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-8 lg:inset-12 bg-slate-900 border border-slate-700 rounded-2xl z-[100] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-xl">
              <Activity size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Predictive Market Maker &mdash; Synthetic Liquidity Engine
              </h2>
              <p className="text-xs text-slate-400">
                Forward-looking spreads, synthetic order books, and liquidity analytics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'orderbook' && <OrderBookTab />}
          {activeTab === 'liquidity' && <LiquidityTab />}
          {activeTab === 'oracle' && <PricingOracleTab />}
          {activeTab === 'alerts' && <SpreadAlertsTab />}
          {activeTab === 'depth' && <MarketDepthTab />}
        </div>
      </div>
    </>
  );
};

export default PredictiveMarketMakerModal;
