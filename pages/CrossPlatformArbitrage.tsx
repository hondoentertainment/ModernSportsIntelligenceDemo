// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftRight, DollarSign, TrendingUp, AlertTriangle, Clock, Target, Filter, Bell, BarChart3, Shield, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import {
  getActiveOpportunities,
  getArbitrageOpportunities,
  getPlatformPricing,
  getArbitrageStats,
  getFeeComparison,
  getSpreadHistory,
  getArbitrageAlerts,
  formatCurrency,
  formatPercent,
  getPlatformColor,
  getPlatformLabel,
  getRiskColor,
  getTypeLabel,
  type ArbitrageOpportunity,
  type PlatformPricing,
  type ArbitrageStats,
  type FeeComparison,
  type SpreadHistory,
  type ArbitrageAlert,
  type Platform,
  type RiskLevel,
  type ArbitrageType,
} from '../lib/trading/crossPlatformArbitrageService';

// ── Constants ─────────────────────────────────────────────────────────────────

const RISK_BADGE: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  expired: 'bg-slate-500/20 text-slate-500',
  executed: 'bg-blue-500/20 text-blue-400',
  missed: 'bg-red-500/20 text-red-400',
};

const ALERT_PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-slate-500/20 text-slate-400',
};

const ALL_PLATFORMS: Platform[] = ['ebay', 'goldin', 'pwcc', 'heritage', 'comc', 'alt', 'whatnot', 'myslabs'];
const ALL_RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high'];
const ALL_TYPES: ArbitrageType[] = ['cross_platform', 'grade_spread', 'condition_arbitrage', 'regional', 'timing'];

type SortKey = 'profitMargin' | 'netProfit' | 'confidence' | 'buyPrice';
type SortDir = 'asc' | 'desc';

// ── Component ─────────────────────────────────────────────────────────────────

const CrossPlatformArbitrage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [pricing, setPricing] = useState<PlatformPricing[]>([]);
  const [stats, setStats] = useState<ArbitrageStats | null>(null);
  const [fees, setFees] = useState<FeeComparison[]>([]);
  const [spreadHistory, setSpreadHistory] = useState<SpreadHistory[]>([]);
  const [alerts, setAlerts] = useState<ArbitrageAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ArbitrageType | 'all'>('all');
  const [minProfit, setMinProfit] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>('profitMargin');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Selected card for spread history
  const [selectedOpId, setSelectedOpId] = useState<string>('');

  useEffect(() => {
    try {
      const active = getActiveOpportunities();
      const all = getArbitrageOpportunities();
      setOpportunities(active);
      setAllOpportunities(all);
      setPricing(getPlatformPricing());
      setStats(getArbitrageStats());
      setFees(getFeeComparison());
      setAlerts(getArbitrageAlerts());
      if (active.length > 0) {
        setSelectedOpId(active[0].id);
        setSpreadHistory(getSpreadHistory(active[0].id));
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  // Load spread history when selected opportunity changes
  useEffect(() => {
    if (selectedOpId) {
      setSpreadHistory(getSpreadHistory(selectedOpId));
    }
  }, [selectedOpId]);

  // Filtered and sorted opportunities
  const filteredOpportunities = useMemo(() => {
    let result = [...opportunities];

    if (platformFilter !== 'all') {
      result = result.filter(o => o.buyPlatform === platformFilter || o.sellPlatform === platformFilter);
    }
    if (riskFilter !== 'all') {
      result = result.filter(o => o.riskLevel === riskFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter(o => o.type === typeFilter);
    }
    if (minProfit > 0) {
      result = result.filter(o => o.netProfit >= minProfit);
    }

    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDir === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });

    return result;
  }, [opportunities, platformFilter, riskFilter, typeFilter, minProfit, sortKey, sortDir]);

  const unreadAlerts = useMemo(() => alerts.filter(a => !a.isRead).length, [alerts]);

  // Fee chart data
  const feeChartData = useMemo(() => {
    return fees.map(f => ({
      name: getPlatformLabel(f.platform),
      sellerFee: f.sellerFee,
      processing: f.paymentProcessing,
      shipping: f.shipping,
      net: f.netOnSale,
    }));
  }, [fees]);

  // Profit by type pie chart
  const profitByType = useMemo(() => {
    const map = new Map<ArbitrageType, number>();
    for (const o of opportunities) {
      if (o.netProfit > 0) {
        map.set(o.type, (map.get(o.type) || 0) + o.netProfit);
      }
    }
    return Array.from(map.entries()).map(([type, value]) => ({
      name: getTypeLabel(type),
      value: Math.round(value * 100) / 100,
    }));
  }, [opportunities]);

  const PIE_COLORS = ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899'];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'desc' ? ' \u2193' : ' \u2191';
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Cross-Platform Arbitrage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <ArrowLeftRight size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Cross-Platform Arbitrage</h1>
            <p className="text-sm text-slate-400">
              Real-time price spread detection &amp; fee-adjusted profit analysis across 8 platforms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Filter size={14} />
            Filters
          </button>
          <span className="relative px-3 py-1.5 text-sm font-bold rounded-full bg-cyan-500/20 text-cyan-300">
            <Bell size={14} className="inline mr-1" />
            {unreadAlerts} New
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Opportunities</p>
          <p className="text-3xl font-bold text-white">{stats.activeOpportunities}</p>
          <p className="text-xs text-slate-600 mt-1">of {stats.totalOpportunities} total</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Profit Margin</p>
          <p className="text-3xl font-bold text-emerald-400">{formatPercent(stats.avgProfitMargin)}</p>
          <p className="text-xs text-slate-600 mt-1">best: {formatPercent(stats.bestSpread)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Potential Profit</p>
          <p className="text-3xl font-bold text-cyan-400">{formatCurrency(stats.totalPotentialProfit)}</p>
          <p className="text-xs text-slate-600 mt-1">across active opps</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Win Rate</p>
          <p className="text-3xl font-bold text-amber-400">{formatPercent(stats.winRate)}</p>
          <p className="text-xs text-slate-600 mt-1">{stats.executedTrades} executed trades</p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-500 uppercase mb-1">Platform</label>
              <select
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value as Platform | 'all')}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">All Platforms</option>
                {ALL_PLATFORMS.map(p => (
                  <option key={p} value={p}>{getPlatformLabel(p)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase mb-1">Risk Level</label>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value as RiskLevel | 'all')}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">All Risk Levels</option>
                {ALL_RISK_LEVELS.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as ArbitrageType | 'all')}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">All Types</option>
                {ALL_TYPES.map(t => (
                  <option key={t} value={t}>{getTypeLabel(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase mb-1">Min Profit ($)</label>
              <input
                type="number"
                value={minProfit}
                onChange={e => setMinProfit(Number(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200"
                min={0}
                step={5}
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Opportunities Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-cyan-400" />
          Active Opportunities
          <span className="text-sm font-normal text-slate-500">({filteredOpportunities.length})</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs text-slate-500 uppercase pb-3 pr-4">Card</th>
                <th className="text-left text-xs text-slate-500 uppercase pb-3 px-3">Buy</th>
                <th className="text-left text-xs text-slate-500 uppercase pb-3 px-3">Sell</th>
                <th
                  className="text-right text-xs text-slate-500 uppercase pb-3 px-3 cursor-pointer hover:text-slate-300"
                  onClick={() => handleSort('buyPrice')}
                >
                  Buy Price{sortIndicator('buyPrice')}
                </th>
                <th
                  className="text-right text-xs text-slate-500 uppercase pb-3 px-3 cursor-pointer hover:text-slate-300"
                  onClick={() => handleSort('netProfit')}
                >
                  Net Profit{sortIndicator('netProfit')}
                </th>
                <th
                  className="text-right text-xs text-slate-500 uppercase pb-3 px-3 cursor-pointer hover:text-slate-300"
                  onClick={() => handleSort('profitMargin')}
                >
                  Margin{sortIndicator('profitMargin')}
                </th>
                <th className="text-center text-xs text-slate-500 uppercase pb-3 px-3">Risk</th>
                <th
                  className="text-right text-xs text-slate-500 uppercase pb-3 px-3 cursor-pointer hover:text-slate-300"
                  onClick={() => handleSort('confidence')}
                >
                  Confidence{sortIndicator('confidence')}
                </th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 pl-3">Time Left</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpportunities.map(opp => (
                <tr
                  key={opp.id}
                  className={`border-b border-slate-700/20 hover:bg-slate-700/10 cursor-pointer ${selectedOpId === opp.id ? 'bg-slate-700/20' : ''}`}
                  onClick={() => setSelectedOpId(opp.id)}
                >
                  <td className="py-3 pr-4">
                    <div className="font-medium text-slate-200 max-w-[220px] truncate">{opp.cardName}</div>
                    <div className="text-xs text-slate-500">{opp.grade} &middot; {getTypeLabel(opp.type)}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: getPlatformColor(opp.buyPlatform) + '20', color: getPlatformColor(opp.buyPlatform) }}>
                      {getPlatformLabel(opp.buyPlatform)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: getPlatformColor(opp.sellPlatform) + '20', color: getPlatformColor(opp.sellPlatform) }}>
                      {getPlatformLabel(opp.sellPlatform)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 font-mono">
                    {formatCurrency(opp.buyPrice)}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-bold ${opp.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(opp.netProfit)}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-bold ${opp.profitMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercent(opp.profitMargin)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${RISK_BADGE[opp.riskLevel]}`}>
                      {opp.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${opp.confidence}%`,
                            backgroundColor: opp.confidence >= 80 ? '#10b981' : opp.confidence >= 60 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 font-mono w-8 text-right">{opp.confidence}%</span>
                    </div>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <span className="flex items-center justify-end gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {opp.timeRemaining}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOpportunities.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No opportunities match your filters. Try adjusting criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Spread History Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Price Spread History
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            {selectedOpId ? allOpportunities.find(o => o.id === selectedOpId)?.cardName || 'Selected Card' : 'Select a card above'}
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={spreadHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="spread" stroke="#06b6d4" strokeWidth={2} dot={false} name="Spread %" />
              <Line type="monotone" dataKey="buyPrice" stroke="#10b981" strokeWidth={1.5} dot={false} name="Buy Price" />
              <Line type="monotone" dataKey="sellPrice" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Sell Price" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Profit by Type Pie Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-amber-400" />
            Profit by Arbitrage Type
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={profitByType}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {profitByType.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Fee Comparison */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" />
          Platform Fee Comparison (on $500 sale)
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-xs text-slate-500 uppercase pb-3 pr-4">Platform</th>
                  <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Seller Fee</th>
                  <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Buyer Prem.</th>
                  <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Processing</th>
                  <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Shipping</th>
                  <th className="text-right text-xs text-slate-500 uppercase pb-3 pl-3 font-bold">Net to Seller</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(f => (
                  <tr key={f.platform} className="border-b border-slate-700/20 hover:bg-slate-700/10">
                    <td className="py-3 pr-4 font-bold" style={{ color: getPlatformColor(f.platform) }}>
                      {getPlatformLabel(f.platform)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(f.sellerFee)}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(f.buyerPremium)}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(f.paymentProcessing)}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(f.shipping)}</td>
                    <td className="py-3 pl-3 text-right font-bold text-emerald-400">{formatCurrency(f.netOnSale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fee Bar Chart */}
          <div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={feeChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="sellerFee" stackId="fees" fill="#ef4444" name="Seller Fee" />
                <Bar dataKey="processing" stackId="fees" fill="#f59e0b" name="Processing" />
                <Bar dataKey="shipping" stackId="fees" fill="#8b5cf6" name="Shipping" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform Pricing Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400" />
          Platform Pricing Overview
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {pricing.map(p => (
            <div
              key={p.platform}
              className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm" style={{ color: getPlatformColor(p.platform) }}>
                  {getPlatformLabel(p.platform)}
                </span>
                <span className="text-xs text-slate-500">{p.activeListings} listings</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Lowest</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(p.lowestPrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Average</span>
                  <span className="text-slate-200 font-mono font-bold">{formatCurrency(p.avgPrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Highest</span>
                  <span className="text-red-400 font-mono">{formatCurrency(p.highestPrice)}</span>
                </div>
                <div className="border-t border-slate-600/30 pt-2 flex justify-between text-xs">
                  <span className="text-slate-500">Avg Days to Sell</span>
                  <span className="text-slate-300">{p.avgDaysToSell}d</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Seller Fee</span>
                  <span className="text-slate-300">{formatPercent(p.sellerFeePercent)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-amber-400" />
          Arbitrage Alerts
          {unreadAlerts > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
              {unreadAlerts} unread
            </span>
          )}
        </h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                alert.isRead
                  ? 'bg-slate-700/10 border-slate-700/20'
                  : 'bg-slate-700/30 border-slate-600/40'
              }`}
            >
              <div className="mt-0.5">
                {alert.type === 'new_opportunity' && <Zap size={16} className="text-cyan-400" />}
                {alert.type === 'spread_widening' && <TrendingUp size={16} className="text-emerald-400" />}
                {alert.type === 'expiring_soon' && <Clock size={16} className="text-amber-400" />}
                {alert.type === 'price_change' && <AlertTriangle size={16} className="text-purple-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${ALERT_PRIORITY_BADGE[alert.priority]}`}>
                    {alert.priority}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                  {!alert.isRead && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                <p className="text-sm text-slate-300">{alert.message}</p>
                <p className="text-xs text-emerald-400 mt-1 font-mono">
                  Potential: {formatCurrency(alert.profit)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Platform Pair Badge */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-center gap-4">
        <Shield size={18} className="text-cyan-400" />
        <span className="text-sm text-slate-400">
          Top performing pair:
        </span>
        <span className="font-bold text-sm" style={{ color: getPlatformColor(stats.topPlatformPair.buy) }}>
          {getPlatformLabel(stats.topPlatformPair.buy)}
        </span>
        <ArrowLeftRight size={14} className="text-slate-500" />
        <span className="font-bold text-sm" style={{ color: getPlatformColor(stats.topPlatformPair.sell) }}>
          {getPlatformLabel(stats.topPlatformPair.sell)}
        </span>
        <span className="text-sm text-emerald-400 font-mono">
          avg {formatPercent(stats.topPlatformPair.avgSpread)} spread
        </span>
      </div>
    </div>
  );
};

export default CrossPlatformArbitrage;
