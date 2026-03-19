import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, BarChart3, Shield, Layers, Target, ChevronDown } from 'lucide-react';
import {
  getOptionsChain,
  getPositions,
  getExpirationDates,
  getCardUnderlyings,
  getPortfolioGreeks,
  getStrategyTemplates,
  calculateStrategyPnl,
  formatCurrency,
  formatPercent,
  type OptionsChain,
  type Option,
  type OptionPosition,
  type PortfolioGreeks,
  type StrategyTemplate,
  type PnlDataPoint,
} from '../lib/trading/optionsDeskService.ts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';

type TabId = 'chain' | 'positions' | 'pnl' | 'greeks' | 'strategy';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  { id: 'chain', label: 'Options Chain', icon: <Layers size={14} /> },
  { id: 'positions', label: 'Positions', icon: <BarChart3 size={14} /> },
  { id: 'pnl', label: 'P&L Analysis', icon: <Activity size={14} /> },
  { id: 'greeks', label: 'Greeks Dashboard', icon: <Target size={14} /> },
  { id: 'strategy', label: 'Strategy Builder', icon: <Shield size={14} /> },
];

const OptionsDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('chain');
  const [selectedCardId, setSelectedCardId] = useState('card-001');
  const [selectedExpiration, setSelectedExpiration] = useState('');
  const [chain, setChain] = useState<OptionsChain | null>(null);
  const [positions, setPositions] = useState<OptionPosition[]>([]);
  const [portfolioGreeks, setPortfolioGreeks] = useState<PortfolioGreeks | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyTemplate | null>(null);
  const [strategyPnl, setStrategyPnl] = useState<PnlDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cards = useMemo(() => getCardUnderlyings(), []);
  const expirations = useMemo(() => getExpirationDates(), []);
  const strategies = useMemo(() => getStrategyTemplates(), []);

  useEffect(() => {
    if (!selectedExpiration && expirations.length > 0) {
      setSelectedExpiration(expirations[0]);
    }
  }, [expirations, selectedExpiration]);

  useEffect(() => {
    try {
      const chainData = getOptionsChain(selectedCardId, selectedExpiration || undefined);
      setChain(chainData);
      setPositions(getPositions());
      setPortfolioGreeks(getPortfolioGreeks());
      setLoading(false);
    } catch {
      setError('Failed to load Options Desk data');
      setLoading(false);
    }
  }, [selectedCardId, selectedExpiration]);

  useEffect(() => {
    if (selectedStrategy && chain) {
      const pnl = calculateStrategyPnl(chain.currentPrice, selectedStrategy, selectedExpiration);
      setStrategyPnl(pnl);
    }
  }, [selectedStrategy, chain, selectedExpiration]);

  const totalPnl = useMemo(() => positions.filter(p => p.status === 'open').reduce((s, p) => s + p.pnl, 0), [positions]);
  const openCount = useMemo(() => positions.filter(p => p.status === 'open').length, [positions]);
  const totalExposure = useMemo(() => positions.filter(p => p.status === 'open').reduce((s, p) => s + p.currentPremium * p.quantity, 0), [positions]);

  const positionPnlData = useMemo((): PnlDataPoint[] => {
    if (!chain) return [];
    const openPos = positions.filter(p => p.status === 'open');
    const minPrice = Math.round(chain.currentPrice * 0.7);
    const maxPrice = Math.round(chain.currentPrice * 1.3);
    const step = Math.max(1, Math.round((maxPrice - minPrice) / 60));
    const points: PnlDataPoint[] = [];

    for (let price = minPrice; price <= maxPrice; price += step) {
      let totalPnlAtPrice = 0;
      openPos.forEach(pos => {
        const intrinsic = pos.type === 'call'
          ? Math.max(0, price - pos.strike)
          : Math.max(0, pos.strike - price);
        const positionPnl = pos.side === 'long'
          ? (intrinsic - pos.entryPremium) * pos.quantity
          : (pos.entryPremium - intrinsic) * pos.quantity;
        totalPnlAtPrice += positionPnl;
      });
      points.push({ price, pnl: Math.round(totalPnlAtPrice * 100) / 100 });
    }
    return points;
  }, [chain, positions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Card Liquidity Options Desk...</p>
        </div>
      </div>
    );
  }

  if (error || !chain) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-lime/20">
            <TrendingUp size={24} className="text-brand-lime" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Card Liquidity Options Desk</h1>
            <p className="text-sm text-slate-400">Paper options trading on collectible cards &mdash; calls, puts, premium pricing &amp; Greeks &mdash; Phase 134</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 text-sm font-bold rounded-full ${totalPnl >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
            P&L: {formatCurrency(totalPnl)}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Underlying</p>
          <p className="text-lg font-bold text-white">{formatCurrency(chain.currentPrice)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">24h Change</p>
          <p className={`text-lg font-bold ${chain.priceChangePercent24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPercent(chain.priceChangePercent24h)}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Open Positions</p>
          <p className="text-3xl font-bold text-blue-400">{openCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total P&L</p>
          <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-brand-lime' : 'text-red-400'}`}>{formatCurrency(totalPnl)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Exposure</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalExposure)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Delta</p>
          <p className="text-2xl font-bold text-purple-400">{portfolioGreeks?.totalDelta.toFixed(4) ?? '—'}</p>
        </div>
      </div>

      {/* Card Selector & Expiration */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Underlying Card</label>
          <div className="relative">
            <select
              value={selectedCardId}
              onChange={e => setSelectedCardId(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-brand-lime/50"
            >
              {cards.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {formatCurrency(c.currentPrice)}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
        <div className="w-full md:w-48">
          <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Expiration</label>
          <div className="relative">
            <select
              value={selectedExpiration}
              onChange={e => setSelectedExpiration(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-brand-lime/50"
            >
              {expirations.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/30 border border-slate-700/50 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-brand-lime/20 text-brand-lime'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
            }`}
          >
            {tab.icon}
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'chain' && <OptionsChainTab chain={chain} />}
      {activeTab === 'positions' && <PositionsTab positions={positions} />}
      {activeTab === 'pnl' && <PnlTab data={positionPnlData} currentPrice={chain.currentPrice} />}
      {activeTab === 'greeks' && <GreeksTab portfolioGreeks={portfolioGreeks} positions={positions} />}
      {activeTab === 'strategy' && (
        <StrategyTab
          strategies={strategies}
          selectedStrategy={selectedStrategy}
          onSelectStrategy={setSelectedStrategy}
          pnlData={strategyPnl}
          currentPrice={chain.currentPrice}
        />
      )}
    </div>
  );
};

// ---- Options Chain Tab ----

function OptionsChainTab({ chain }: { chain: OptionsChain }) {
  const strikes = useMemo(() => {
    const allStrikes = new Set<number>();
    chain.calls.forEach(c => allStrikes.add(c.strike));
    chain.puts.forEach(p => allStrikes.add(p.strike));
    return Array.from(allStrikes).sort((a, b) => a - b);
  }, [chain]);

  const callMap = useMemo(() => {
    const m = new Map<number, Option>();
    chain.calls.forEach(c => m.set(c.strike, c));
    return m;
  }, [chain.calls]);

  const putMap = useMemo(() => {
    const m = new Map<number, Option>();
    chain.puts.forEach(p => m.set(p.strike, p));
    return m;
  }, [chain.puts]);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Layers size={18} className="text-brand-lime" />
          Options Chain &mdash; {chain.cardName.length > 50 ? chain.cardName.slice(0, 50) + '...' : chain.cardName}
        </h2>
        <span className="text-xs text-slate-500">
          Spot: {formatCurrency(chain.currentPrice)} | IV shown as %
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th colSpan={7} className="text-center text-brand-lime font-bold py-2 bg-brand-lime/5 rounded-tl-lg">CALLS</th>
              <th className="text-center text-slate-300 font-bold py-2 bg-slate-700/30 px-4">STRIKE</th>
              <th colSpan={7} className="text-center text-purple-400 font-bold py-2 bg-purple-500/5 rounded-tr-lg">PUTS</th>
            </tr>
            <tr className="border-b border-slate-700/30 text-slate-500">
              <th className="py-1.5 px-2 text-right">Bid</th>
              <th className="py-1.5 px-2 text-right">Ask</th>
              <th className="py-1.5 px-2 text-right">Last</th>
              <th className="py-1.5 px-2 text-right">Vol</th>
              <th className="py-1.5 px-2 text-right">OI</th>
              <th className="py-1.5 px-2 text-right">IV</th>
              <th className="py-1.5 px-2 text-right">Delta</th>
              <th className="py-1.5 px-4 text-center font-bold text-slate-300">$</th>
              <th className="py-1.5 px-2 text-left">Delta</th>
              <th className="py-1.5 px-2 text-left">IV</th>
              <th className="py-1.5 px-2 text-left">OI</th>
              <th className="py-1.5 px-2 text-left">Vol</th>
              <th className="py-1.5 px-2 text-left">Last</th>
              <th className="py-1.5 px-2 text-left">Bid</th>
              <th className="py-1.5 px-2 text-left">Ask</th>
            </tr>
          </thead>
          <tbody>
            {strikes.map(strike => {
              const call = callMap.get(strike);
              const put = putMap.get(strike);
              const isATM = Math.abs(strike - chain.currentPrice) < (strikes.length > 1 ? (strikes[1] - strikes[0]) * 0.6 : 100);
              const callITM = call?.inTheMoney ?? false;
              const putITM = put?.inTheMoney ?? false;

              return (
                <tr
                  key={strike}
                  className={`border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors ${isATM ? 'bg-brand-lime/5' : ''}`}
                >
                  {/* Call side */}
                  <td className={`py-1.5 px-2 text-right ${callITM ? 'bg-brand-lime/5' : ''}`}>
                    <span className="text-slate-300">{call ? formatCurrency(call.bid) : '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-right ${callITM ? 'bg-brand-lime/5' : ''}`}>
                    <span className="text-slate-300">{call ? formatCurrency(call.ask) : '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-right ${callITM ? 'bg-brand-lime/5' : ''}`}>
                    <span className="text-white font-medium">{call ? formatCurrency(call.last) : '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-right ${callITM ? 'bg-brand-lime/5' : ''}`}>
                    <span className="text-slate-400">{call?.volume ?? '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-right ${callITM ? 'bg-brand-lime/5' : ''}`}>
                    <span className="text-slate-400">{call?.openInterest ?? '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-right ${callITM ? 'bg-brand-lime/5' : ''}`}>
                    <span className="text-amber-400">{call ? call.impliedVolatility.toFixed(1) + '%' : '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-right ${callITM ? 'bg-brand-lime/5' : ''}`}>
                    <span className="text-cyan-400">{call ? call.greeks.delta.toFixed(4) : '—'}</span>
                  </td>

                  {/* Strike */}
                  <td className={`py-1.5 px-4 text-center font-bold ${isATM ? 'text-brand-lime bg-brand-lime/10' : 'text-slate-200 bg-slate-700/20'}`}>
                    {formatCurrency(strike)}
                  </td>

                  {/* Put side */}
                  <td className={`py-1.5 px-2 text-left ${putITM ? 'bg-purple-500/5' : ''}`}>
                    <span className="text-cyan-400">{put ? put.greeks.delta.toFixed(4) : '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-left ${putITM ? 'bg-purple-500/5' : ''}`}>
                    <span className="text-amber-400">{put ? put.impliedVolatility.toFixed(1) + '%' : '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-left ${putITM ? 'bg-purple-500/5' : ''}`}>
                    <span className="text-slate-400">{put?.openInterest ?? '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-left ${putITM ? 'bg-purple-500/5' : ''}`}>
                    <span className="text-slate-400">{put?.volume ?? '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-left ${putITM ? 'bg-purple-500/5' : ''}`}>
                    <span className="text-white font-medium">{put ? formatCurrency(put.last) : '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-left ${putITM ? 'bg-purple-500/5' : ''}`}>
                    <span className="text-slate-300">{put ? formatCurrency(put.bid) : '—'}</span>
                  </td>
                  <td className={`py-1.5 px-2 text-left ${putITM ? 'bg-purple-500/5' : ''}`}>
                    <span className="text-slate-300">{put ? formatCurrency(put.ask) : '—'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Positions Tab ----

function PositionsTab({ positions }: { positions: OptionPosition[] }) {
  const openPositions = positions.filter(p => p.status === 'open');

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400" />
          Open Paper Positions ({openPositions.length})
        </h2>

        <div className="space-y-3">
          {openPositions.map(pos => (
            <div
              key={pos.id}
              className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      pos.type === 'call' ? 'bg-brand-lime/20 text-brand-lime' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {pos.type.toUpperCase()}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      pos.side === 'long' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {pos.side.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-600">x{pos.quantity}</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate">{pos.cardName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Strike: {formatCurrency(pos.strike)} | Exp: {pos.expiration} ({pos.daysToExpiration}d) | Spot: {formatCurrency(pos.currentCardPrice)}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-lg font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pos.pnl >= 0 ? '+' : ''}{formatCurrency(pos.pnl)}
                  </p>
                  <p className={`text-xs ${pos.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercent(pos.pnlPercent)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Entry</p>
                  <p className="text-xs font-bold text-slate-300">{formatCurrency(pos.entryPremium)}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Current</p>
                  <p className="text-xs font-bold text-white">{formatCurrency(pos.currentPremium)}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Delta</p>
                  <p className="text-xs font-bold text-cyan-400">{pos.greeks.delta.toFixed(4)}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Gamma</p>
                  <p className="text-xs font-bold text-cyan-400">{pos.greeks.gamma.toFixed(4)}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Theta</p>
                  <p className="text-xs font-bold text-amber-400">{pos.greeks.theta.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Vega</p>
                  <p className="text-xs font-bold text-purple-400">{pos.greeks.vega.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Rho</p>
                  <p className="text-xs font-bold text-slate-400">{pos.greeks.rho.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- P&L Analysis Tab ----

function PnlTab({ data, currentPrice }: { data: PnlDataPoint[]; currentPrice: number }) {
  const maxPnl = useMemo(() => Math.max(...data.map(d => d.pnl)), [data]);
  const minPnl = useMemo(() => Math.min(...data.map(d => d.pnl)), [data]);
  const breakevenPoints = useMemo(() => {
    const points: number[] = [];
    for (let i = 1; i < data.length; i++) {
      if ((data[i - 1].pnl <= 0 && data[i].pnl >= 0) || (data[i - 1].pnl >= 0 && data[i].pnl <= 0)) {
        points.push(data[i].price);
      }
    }
    return points;
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" />
          Portfolio P&L at Expiration
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Combined P&L of all open positions across the underlying price range at expiration.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase">Max Profit</p>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(maxPnl)}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase">Max Loss</p>
            <p className="text-lg font-bold text-red-400">{formatCurrency(minPnl)}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase">Current Spot</p>
            <p className="text-lg font-bold text-white">{formatCurrency(currentPrice)}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase">Breakeven(s)</p>
            <p className="text-sm font-bold text-amber-400">
              {breakevenPoints.length > 0 ? breakevenPoints.map(p => formatCurrency(p)).join(', ') : 'N/A'}
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <defs>
                <linearGradient id="pnlGradientPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84cc16" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="price"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={v => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v)}
                stroke="#475569"
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={v => '$' + v}
                stroke="#475569"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [formatCurrency(value), 'P&L']}
                labelFormatter={v => 'Card Price: ' + formatCurrency(v as number)}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
              <ReferenceLine x={currentPrice} stroke="#84cc16" strokeDasharray="5 5" label={{ value: 'Spot', fill: '#84cc16', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="#84cc16"
                strokeWidth={2}
                fill="url(#pnlGradientPos)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---- Greeks Dashboard Tab ----

function GreeksTab({ portfolioGreeks, positions }: { portfolioGreeks: PortfolioGreeks | null; positions: OptionPosition[] }) {
  const openPositions = positions.filter(p => p.status === 'open');

  const radarData = useMemo(() => {
    if (!portfolioGreeks) return [];
    // Normalize greeks to 0-100 range for radar display
    const maxDelta = 3;
    const maxGamma = 0.01;
    const maxTheta = 50;
    const maxVega = 150;
    const maxRho = 15;
    return [
      { greek: 'Delta', value: Math.min(100, Math.abs(portfolioGreeks.totalDelta) / maxDelta * 100), raw: portfolioGreeks.totalDelta },
      { greek: 'Gamma', value: Math.min(100, Math.abs(portfolioGreeks.totalGamma) / maxGamma * 100), raw: portfolioGreeks.totalGamma },
      { greek: 'Theta', value: Math.min(100, Math.abs(portfolioGreeks.totalTheta) / maxTheta * 100), raw: portfolioGreeks.totalTheta },
      { greek: 'Vega', value: Math.min(100, Math.abs(portfolioGreeks.totalVega) / maxVega * 100), raw: portfolioGreeks.totalVega },
      { greek: 'Rho', value: Math.min(100, Math.abs(portfolioGreeks.totalRho) / maxRho * 100), raw: portfolioGreeks.totalRho },
    ];
  }, [portfolioGreeks]);

  if (!portfolioGreeks) return null;

  return (
    <div className="space-y-4">
      {/* Portfolio Greeks Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-cyan-400" />
            Portfolio Greeks Radar
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="greek"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 9 }}
                />
                <Radar
                  name="Greeks"
                  dataKey="value"
                  stroke="#84cc16"
                  fill="#84cc16"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(_val: number, _name: string, entry: { payload?: { raw?: number } }) => {
                    const raw = entry?.payload?.raw;
                    return [raw !== undefined ? raw.toFixed(4) : '—', 'Value'];
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Aggregate Greek Values</h2>
          <div className="space-y-4">
            {[
              { label: 'Delta', value: portfolioGreeks.totalDelta, desc: 'Directional exposure', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
              { label: 'Gamma', value: portfolioGreeks.totalGamma, desc: 'Rate of delta change', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
              { label: 'Theta', value: portfolioGreeks.totalTheta, desc: 'Daily time decay', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
              { label: 'Vega', value: portfolioGreeks.totalVega, desc: 'Volatility sensitivity', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
              { label: 'Rho', value: portfolioGreeks.totalRho, desc: 'Interest rate sensitivity', color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
            ].map(g => (
              <div key={g.label} className={`${g.bgColor} rounded-lg p-3 flex items-center justify-between`}>
                <div>
                  <p className={`text-sm font-bold ${g.color}`}>{g.label}</p>
                  <p className="text-[10px] text-slate-500">{g.desc}</p>
                </div>
                <p className={`text-xl font-mono font-bold ${g.color}`}>{g.value.toFixed(4)}</p>
              </div>
            ))}
            <div className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between mt-2">
              <div>
                <p className="text-sm font-bold text-white">Net Exposure</p>
                <p className="text-[10px] text-slate-500">{portfolioGreeks.positionCount} open positions</p>
              </div>
              <p className="text-xl font-bold text-white">{formatCurrency(portfolioGreeks.netExposure)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Position Greeks */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4">Position-Level Greeks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-500">
                <th className="py-2 px-3 text-left">Position</th>
                <th className="py-2 px-2 text-center">Type</th>
                <th className="py-2 px-2 text-center">Side</th>
                <th className="py-2 px-2 text-right">Qty</th>
                <th className="py-2 px-2 text-right">Delta</th>
                <th className="py-2 px-2 text-right">Gamma</th>
                <th className="py-2 px-2 text-right">Theta</th>
                <th className="py-2 px-2 text-right">Vega</th>
                <th className="py-2 px-2 text-right">Rho</th>
                <th className="py-2 px-2 text-right">P&L</th>
              </tr>
            </thead>
            <tbody>
              {openPositions.map(pos => (
                <tr key={pos.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                  <td className="py-2 px-3 text-slate-200 font-medium max-w-[200px] truncate">{pos.cardName}</td>
                  <td className="py-2 px-2 text-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      pos.type === 'call' ? 'bg-brand-lime/20 text-brand-lime' : 'bg-purple-500/20 text-purple-400'
                    }`}>{pos.type.toUpperCase()}</span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      pos.side === 'long' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>{pos.side.toUpperCase()}</span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">{pos.quantity}</td>
                  <td className="py-2 px-2 text-right text-cyan-400 font-mono">{pos.greeks.delta.toFixed(4)}</td>
                  <td className="py-2 px-2 text-right text-cyan-400 font-mono">{pos.greeks.gamma.toFixed(4)}</td>
                  <td className="py-2 px-2 text-right text-amber-400 font-mono">{pos.greeks.theta.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right text-purple-400 font-mono">{pos.greeks.vega.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right text-slate-400 font-mono">{pos.greeks.rho.toFixed(2)}</td>
                  <td className={`py-2 px-2 text-right font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pos.pnl >= 0 ? '+' : ''}{formatCurrency(pos.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Strategy Builder Tab ----

function StrategyTab({
  strategies,
  selectedStrategy,
  onSelectStrategy,
  pnlData,
  currentPrice,
}: {
  strategies: StrategyTemplate[];
  selectedStrategy: StrategyTemplate | null;
  onSelectStrategy: (s: StrategyTemplate) => void;
  pnlData: PnlDataPoint[];
  currentPrice: number;
}) {
  return (
    <div className="space-y-4">
      {/* Strategy Selector */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-amber-400" />
          Strategy Builder
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Select a preset options strategy to visualize its P&L profile on the selected underlying card.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {strategies.map(strat => (
            <button
              key={strat.id}
              onClick={() => onSelectStrategy(strat)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedStrategy?.id === strat.id
                  ? 'bg-brand-lime/10 border-brand-lime/40 ring-1 ring-brand-lime/20'
                  : 'bg-slate-900/50 border-slate-700/30 hover:border-slate-600'
              }`}
            >
              <p className={`text-sm font-bold mb-1 ${
                selectedStrategy?.id === strat.id ? 'text-brand-lime' : 'text-white'
              }`}>{strat.name}</p>
              <p className="text-[10px] text-slate-400 line-clamp-2">{strat.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                  {strat.legs.length} leg{strat.legs.length > 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Details & P&L Chart */}
      {selectedStrategy && (
        <>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-brand-lime mb-3">{selectedStrategy.name}</h3>
            <p className="text-sm text-slate-300 mb-4">{selectedStrategy.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Max Profit</p>
                  <p className="text-sm font-bold text-emerald-400">{selectedStrategy.maxProfit}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Max Loss</p>
                  <p className="text-sm font-bold text-red-400">{selectedStrategy.maxLoss}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Breakeven</p>
                  <p className="text-sm font-bold text-amber-400">{selectedStrategy.breakeven}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Ideal Condition</p>
                  <p className="text-sm font-bold text-blue-400">{selectedStrategy.idealCondition}</p>
                </div>
              </div>
            </div>

            {/* Legs display */}
            <div className="mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Strategy Legs</p>
              <div className="flex flex-wrap gap-2">
                {selectedStrategy.legs.map((leg, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-slate-700/30 rounded-lg px-3 py-1.5">
                    <span className={`text-[10px] font-bold ${
                      leg.side === 'long' ? 'text-blue-400' : 'text-amber-400'
                    }`}>{leg.side.toUpperCase()}</span>
                    <span className={`text-[10px] font-bold ${
                      leg.type === 'call' ? 'text-brand-lime' : 'text-purple-400'
                    }`}>{leg.type.toUpperCase()}</span>
                    <span className="text-[10px] text-slate-400">
                      {leg.strikeOffset === 0 ? 'ATM' : leg.strikeOffset > 0 ? `OTM+${leg.strikeOffset}` : `OTM${leg.strikeOffset}`}
                    </span>
                    <span className="text-[10px] text-slate-500">x{leg.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategy P&L Chart */}
          {pnlData.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-md font-bold text-slate-200 mb-4">
                {selectedStrategy.name} P&L at Expiration
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pnlData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="price"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickFormatter={v => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v)}
                      stroke="#475569"
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickFormatter={v => '$' + v}
                      stroke="#475569"
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number) => [formatCurrency(value), 'P&L']}
                      labelFormatter={v => 'Card Price: ' + formatCurrency(v as number)}
                    />
                    <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                    <ReferenceLine x={currentPrice} stroke="#84cc16" strokeDasharray="5 5" label={{ value: 'Spot', fill: '#84cc16', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="#84cc16"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#84cc16' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OptionsDesk;
