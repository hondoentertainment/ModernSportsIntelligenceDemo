// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Leaf, Award, ShoppingCart, TrendingDown, AlertTriangle, Lightbulb, BarChart3, Globe } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getMonthlyFootprint,
  getCarbonCategories,
  getRecentTransactions,
  getEcoScore,
  getCarbonOffsets,
  getEcoBadges,
  getEcoTips,
  getTotalFootprint,
  getOffsetNeededKg,
  formatCo2,
  type MonthlyFootprint,
  type CarbonCategory,
  type CarbonTransaction,
  type EcoScore,
  type CarbonOffset,
  type EcoBadge,
} from '../lib/analytics/carbonFootprintService.ts';

const PIE_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#22d3ee'];

function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-emerald-400';
    case 'B': return 'text-lime-400';
    case 'C': return 'text-amber-400';
    case 'D': return 'text-orange-400';
    default: return 'text-red-400';
  }
}

function gradeBg(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-emerald-500/20 border-emerald-500/30';
    case 'B': return 'bg-lime-500/20 border-lime-500/30';
    case 'C': return 'bg-amber-500/20 border-amber-500/30';
    case 'D': return 'bg-orange-500/20 border-orange-500/30';
    default: return 'bg-red-500/20 border-red-500/30';
  }
}

function typeLabel(type: CarbonTransaction['type']): string {
  switch (type) {
    case 'purchase': return 'Purchase';
    case 'sale': return 'Sale';
    case 'grading_submission': return 'Grading';
    case 'show_attendance': return 'Show';
  }
}

function typeBadge(type: CarbonTransaction['type']): string {
  switch (type) {
    case 'purchase': return 'bg-blue-500/10 text-blue-400';
    case 'sale': return 'bg-emerald-500/10 text-emerald-400';
    case 'grading_submission': return 'bg-purple-500/10 text-purple-400';
    case 'show_attendance': return 'bg-amber-500/10 text-amber-400';
  }
}

const CarbonFootprintTracker: React.FC = () => {
  const [monthly, setMonthly] = useState<MonthlyFootprint[]>([]);
  const [categories, setCategories] = useState<CarbonCategory[]>([]);
  const [transactions, setTransactions] = useState<CarbonTransaction[]>([]);
  const [ecoScore, setEcoScore] = useState<EcoScore | null>(null);
  const [offsets, setOffsets] = useState<CarbonOffset[]>([]);
  const [badges, setBadges] = useState<EcoBadge[]>([]);
  const [tips, setTips] = useState<{ icon: string; tip: string }[]>([]);
  const [totals, setTotals] = useState<{ totalCo2Kg: number; totalOffsetKg: number; netKg: number } | null>(null);
  const [offsetNeeded, setOffsetNeeded] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    try {
      setMonthly(getMonthlyFootprint());
      setCategories(getCarbonCategories());
      setTransactions(getRecentTransactions());
      setEcoScore(getEcoScore());
      setOffsets(getCarbonOffsets());
      setBadges(getEcoBadges());
      setTips(getEcoTips());
      setTotals(getTotalFootprint());
      setOffsetNeeded(getOffsetNeededKg());
      setLoading(false);
    } catch {
      setError('Failed to load Carbon Footprint data');
      setLoading(false);
    }
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const categoryPieData = useMemo(() =>
    categories.map(c => ({ name: c.category, value: c.co2Kg })),
    [categories]
  );

  const earnedBadges = useMemo(() => badges.filter(b => b.earned), [badges]);

  const cheapestOffset = useMemo(() => {
    const avail = offsets.filter(o => o.available);
    return avail.sort((a, b) => a.costPerTon - b.costPerTon)[0];
  }, [offsets]);

  const neutralizeCost = useMemo(() => {
    if (!cheapestOffset || offsetNeeded === 0) return 0;
    const tons = offsetNeeded / 1000;
    return Math.ceil(tons * cheapestOffset.costPerTon * 100) / 100;
  }, [cheapestOffset, offsetNeeded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Carbon Footprint data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <Leaf size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Carbon Footprint Tracker</h1>
          <p className="text-sm text-slate-400">Track, reduce &amp; offset the environmental impact of your card collecting</p>
        </div>
      </div>

      {/* Top row: Eco Score + Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Eco Score Card */}
        {ecoScore && (
          <div className={`bg-slate-800/50 border rounded-xl p-6 flex flex-col items-center justify-center text-center ${gradeBg(ecoScore.grade)}`}>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Eco Score</p>
            <p className={`text-7xl font-black mb-1 ${gradeColor(ecoScore.grade)}`}>{ecoScore.grade}</p>
            <p className="text-2xl font-bold text-white mb-2">{ecoScore.overall}/100</p>
            <p className={`text-sm font-medium ${ecoScore.comparedToAvgCollector < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {ecoScore.comparedToAvgCollector < 0 ? `${Math.abs(ecoScore.comparedToAvgCollector)}% better` : `${ecoScore.comparedToAvgCollector}% worse`} than avg collector
            </p>
          </div>
        )}

        {/* Score Breakdown */}
        {ecoScore && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Score Breakdown</p>
            {Object.entries(ecoScore.breakdown).map(([key, val]) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 capitalize">{key}</span>
                  <span className="text-slate-300 font-medium">{val}/100</span>
                </div>
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${val >= 75 ? 'bg-emerald-500' : val >= 55 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        {totals && (
          <>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Emissions (12mo)</p>
                <p className="text-3xl font-bold text-red-400">{formatCo2(totals.totalCo2Kg)}</p>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Offsets Purchased</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCo2(totals.totalOffsetKg)}</p>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Net Footprint</p>
                <p className={`text-3xl font-bold ${totals.netKg > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{formatCo2(totals.netKg)}</p>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Badges Earned</p>
                <p className="text-2xl font-bold text-purple-400">{earnedBadges.length}/{badges.length}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Monthly Footprint Area Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingDown size={18} className="text-emerald-400" />
          Monthly CO&#8322; Footprint vs Offsets
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="offsetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(v: number) => `${v}kg`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: number, name: string) => [`${val.toFixed(1)} kg CO2`, name]}
              />
              <Area type="monotone" dataKey="co2Kg" name="Emissions" stroke="#f87171" fill="url(#co2Grad)" strokeWidth={2} />
              <Area type="monotone" dataKey="offsetKg" name="Offsets" stroke="#10b981" fill="url(#offsetGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 justify-center mt-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-400 inline-block rounded" />Emissions</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" />Offsets</span>
        </div>
      </div>

      {/* Carbon by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-400" />
              Emissions by Category
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveChart('bar')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeChart === 'bar' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Bar
              </button>
              <button
                onClick={() => setActiveChart('pie')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeChart === 'pie' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Pie
              </button>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'bar' ? (
                <BarChart data={categories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(v: number) => `${v}kg`} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 9, fill: '#64748b' }} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number) => [`${val.toFixed(1)} kg CO2`, 'Emissions']}
                  />
                  <Bar dataKey="co2Kg" name="CO2 (kg)" radius={[0, 4, 4, 0]}>
                    {categories.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number) => [`${val.toFixed(1)} kg CO2`]}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
          {activeChart === 'pie' && (
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {categoryPieData.map((entry, idx) => (
                <span key={entry.name} className="text-[9px] text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  {entry.name.split(' ')[0]}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Category detail table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Category Details</h2>
          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">{cat.category}</p>
                    <p className="text-[9px] text-slate-500">{cat.transactions} transactions</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-bold text-slate-200">{formatCo2(cat.co2Kg)}</p>
                  <p className="text-[9px] text-slate-500">{cat.percentage}%</p>
                </div>
                <span className={`ml-3 text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${cat.trend === 'down' ? 'bg-emerald-500/10 text-emerald-400' : cat.trend === 'up' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700/30 text-slate-400'}`}>
                  {cat.trend === 'down' ? 'down' : cat.trend === 'up' ? 'up' : 'stable'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Eco Badges */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Award size={18} className="text-amber-400" />
          Eco Badges ({earnedBadges.length}/{badges.length} earned)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`rounded-xl p-4 border text-center transition-all ${badge.earned ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-900/50 border-slate-700/20 opacity-50'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${badge.earned ? 'bg-emerald-500/20' : 'bg-slate-700/30'}`}>
                <Award size={20} className={badge.earned ? 'text-amber-400' : 'text-slate-600'} />
              </div>
              <p className={`text-xs font-bold mb-1 ${badge.earned ? 'text-white' : 'text-slate-500'}`}>{badge.name}</p>
              <p className={`text-[9px] leading-tight ${badge.earned ? 'text-slate-400' : 'text-slate-600'}`}>{badge.description}</p>
              {badge.earned && badge.earnedDate && (
                <p className="text-[9px] text-emerald-400 mt-1">Earned {badge.earnedDate}</p>
              )}
              {!badge.earned && badge.co2Required && (
                <p className="text-[9px] text-slate-600 mt-1">Save {badge.co2Required}+ kg CO2</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Carbon Offset Marketplace + Go Carbon Neutral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Globe size={18} className="text-emerald-400" />
            Carbon Offset Marketplace
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offsets.map(offset => (
              <div
                key={offset.id}
                className={`bg-slate-900/50 border rounded-xl p-4 ${offset.available ? 'border-emerald-500/20 hover:border-emerald-500/30 transition-colors' : 'border-slate-700/20 opacity-60'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400">{offset.provider}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${offset.available ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/30 text-slate-500'}`}>
                    {offset.available ? 'Available' : 'Sold Out'}
                  </span>
                </div>
                <p className="text-sm font-bold text-white mb-1">{offset.project}</p>
                <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">{offset.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500">Cost per tonne</p>
                    <p className="text-lg font-bold text-amber-400">${offset.costPerTon}</p>
                  </div>
                  <button
                    onClick={() => { if (offset.available) showToast(`Purchasing offsets from ${offset.provider}...`); }}
                    disabled={!offset.available}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${offset.available ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300' : 'bg-slate-700/30 text-slate-600 cursor-not-allowed'}`}
                  >
                    Purchase Offsets
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Go Carbon Neutral CTA */}
        <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Leaf size={18} className="text-emerald-400" />
            Go Carbon Neutral
          </h2>
          {totals && (
            <>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                <p className="text-xs text-slate-400 mb-1">Net footprint to neutralize</p>
                <p className="text-3xl font-bold text-emerald-400">{formatCo2(offsetNeeded)}</p>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Emitted</span>
                  <span className="text-red-400 font-medium">{formatCo2(totals.totalCo2Kg)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Already Offset</span>
                  <span className="text-emerald-400 font-medium">{formatCo2(totals.totalOffsetKg)}</span>
                </div>
                <div className="border-t border-slate-700/50 pt-3 flex justify-between text-sm font-bold">
                  <span className="text-slate-200">Remaining</span>
                  <span className="text-amber-400">{formatCo2(offsetNeeded)}</span>
                </div>
              </div>
              {cheapestOffset && (
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 mb-4 text-xs text-slate-400">
                  Best deal: <span className="text-emerald-400 font-medium">{cheapestOffset.provider}</span> at ${cheapestOffset.costPerTon}/ton
                  <br />
                  Estimated neutralization cost: <span className="text-amber-400 font-bold">${neutralizeCost.toFixed(2)}</span>
                </div>
              )}
              <button
                onClick={() => showToast('Redirecting to offset checkout...')}
                className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-xl font-bold text-sm transition-colors mt-auto"
              >
                Neutralize My Footprint
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <ShoppingCart size={18} className="text-blue-400" />
          Recent Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Type</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Card / Event</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Vendor</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Distance</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">CO2</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Offset</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-700/20 hover:bg-slate-700/10 transition-colors">
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${typeBadge(tx.type)}`}>
                      {typeLabel(tx.type)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-sm text-white max-w-[200px] truncate">{tx.cardName ?? tx.vendor ?? '—'}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{tx.vendor ?? '—'}</td>
                  <td className="py-3 pr-4 text-sm text-right text-slate-300">{tx.distance.toLocaleString()} mi</td>
                  <td className="py-3 pr-4 text-sm text-right font-bold text-red-400">{tx.co2Kg.toFixed(1)} kg</td>
                  <td className="py-3 pr-4 text-center">
                    {tx.offsetPurchased
                      ? <span className="text-emerald-400 text-sm font-bold">Yes</span>
                      : <span className="text-slate-600 text-sm">—</span>}
                  </td>
                  <td className="py-3 text-right text-xs text-slate-500">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips Panel */}
      <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-400" />
          Reduce Your Footprint
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tips.map((tip, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{tip.icon}</span>
              <p className="text-xs text-slate-400 leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintTracker;
