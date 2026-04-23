// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Factory,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart3,
  Target,
  Package,
} from 'lucide-react';
import {
  getProductSets,
  getScarcityIndices,
  getSaturationAlerts,
  getParallelBreakdown,
  getProductionTrends,
  getSetComparison,
  getMarketAbsorption,
  getSupplyDemandMetrics,
  getInsertOdds,
  getManufacturerProfile,
  getManufacturerConfig,
  getSeverityConfig,
  formatCurrency,
  formatNumber,
  type ProductSet,
  type ScarcityIndex,
  type SaturationAlert,
  type ParallelBreakdown,
  type ProductionTrend,
  type MarketAbsorption,
  type SupplyDemandMetric,
  type InsertOdds,
  type Manufacturer,
} from '../lib/analytics/printRunIntelligenceService.ts';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';

const CHART_TOOLTIP_STYLE = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' };
const MANUFACTURERS: Manufacturer[] = ['panini', 'topps', 'upper_deck', 'fanatics', 'leaf', 'sage', 'onyx', 'wild_card'];
const PIE_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#8b5cf6', '#f59e0b', '#06b6d4', '#64748b', '#ec4899'];

const PrintRunIntelligence: React.FC = () => {
  const [sets, setSets] = useState<ProductSet[]>([]);
  const [scarcityIndices, setScarcityIndices] = useState<ScarcityIndex[]>([]);
  const [alerts, setAlerts] = useState<SaturationAlert[]>([]);
  const [parallels, setParallels] = useState<ParallelBreakdown[]>([]);
  const [trends, setTrends] = useState<ProductionTrend[]>([]);
  const [absorption, setAbsorption] = useState<MarketAbsorption[]>([]);
  const [supplyDemand, setSupplyDemand] = useState<SupplyDemandMetric[]>([]);
  const [insertOdds, setInsertOdds] = useState<InsertOdds[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSets(getProductSets());
      setScarcityIndices(getScarcityIndices());
      setAlerts(getSaturationAlerts());
      setParallels(getParallelBreakdown());
      setTrends(getProductionTrends());
      setAbsorption(getMarketAbsorption());
      setSupplyDemand(getSupplyDemandMetrics());
      setInsertOdds(getInsertOdds());
      setLoading(false);
    } catch {
      setError('Failed to load Print Run Intelligence data');
      setLoading(false);
    }
  }, []);

  const manufacturerProfiles = useMemo(() =>
    MANUFACTURERS.map(m => getManufacturerProfile(m)).filter(p => p.totalCardsProduced > 0),
    []
  );

  const setComparisons = useMemo(() => getSetComparison(), []);

  const productionChartData = useMemo(() => {
    const years = [...new Set(trends.map(t => t.year))].sort();
    return years.map(year => {
      const row: Record<string, unknown> = { year: year.toString() };
      trends.filter(t => t.year === year).forEach(t => {
        const config = getManufacturerConfig(t.manufacturer);
        row[config.label] = Math.round(t.totalCardsProduced / 1_000_000);
      });
      return row;
    });
  }, [trends]);

  const pieData = useMemo(() =>
    manufacturerProfiles.map(p => ({
      name: p.label,
      value: p.marketShare,
      color: p.color,
    })),
    [manufacturerProfiles]
  );

  const scatterData = useMemo(() =>
    supplyDemand.map(sd => ({
      name: sd.setName.replace('2024 ', ''),
      supply: sd.supplyIndex,
      demand: sd.demandIndex,
      imbalance: sd.imbalanceScore,
    })),
    [supplyDemand]
  );

  const volumeChartData = useMemo(() =>
    [...sets]
      .sort((a, b) => b.baseRunEstimate - a.baseRunEstimate)
      .slice(0, 12)
      .map(s => ({
        name: s.name.replace('2024 ', '').substring(0, 20),
        volume: Math.round(s.baseRunEstimate / 1_000_000),
        score: s.overproductionScore,
        manufacturer: s.manufacturer,
      })),
    [sets]
  );

  const selectedParallels = useMemo(() => {
    if (!selectedSetId) return parallels.filter(p => p.setId === 'set-001');
    return parallels.filter(p => p.setId === selectedSetId);
  }, [selectedSetId, parallels]);

  const totalCards = useMemo(() => sets.reduce((s, set) => s + set.baseRunEstimate, 0), [sets]);
  const avgOverprod = useMemo(() => sets.length > 0 ? Math.round(sets.reduce((s, set) => s + set.overproductionScore, 0) / sets.length) : 0, [sets]);
  const criticalAlerts = useMemo(() => alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length, [alerts]);
  const soldOutSets = useMemo(() => sets.filter(s => s.status === 'sold_out').length, [sets]);
  const overstockSets = useMemo(() => sets.filter(s => s.status === 'overstock').length, [sets]);
  const avgScarcity = useMemo(() => scarcityIndices.length > 0 ? Math.round(scarcityIndices.reduce((s, i) => s + i.scarcityScore, 0) / scarcityIndices.length) : 0, [scarcityIndices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Print Run Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/20">
          <Factory size={24} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Overproduction &amp; Print Run Intelligence</h1>
          <p className="text-sm text-slate-400">
            Production volume tracking, scarcity analysis &amp; saturation alerts &mdash; Phase 143
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sets Tracked</p>
          <p className="text-3xl font-bold text-brand-lime">{sets.length}</p>
          <p className="text-xs text-slate-600 mt-1">across {manufacturerProfiles.length} mfrs</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Cards</p>
          <p className="text-3xl font-bold text-blue-400">{formatNumber(totalCards)}</p>
          <p className="text-xs text-slate-600 mt-1">base print runs</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Overproduction</p>
          <p className={`text-3xl font-bold ${avgOverprod >= 70 ? 'text-red-400' : avgOverprod >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{avgOverprod}</p>
          <p className="text-xs text-slate-600 mt-1">score /100</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Critical Alerts</p>
          <p className="text-3xl font-bold text-red-400">{criticalAlerts}</p>
          <p className="text-xs text-slate-600 mt-1">high + critical</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sold Out</p>
          <p className="text-3xl font-bold text-emerald-400">{soldOutSets}</p>
          <p className="text-xs text-slate-600 mt-1">{overstockSets} overstock</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Scarcity</p>
          <p className="text-3xl font-bold text-purple-400">{avgScarcity}</p>
          <p className="text-xs text-slate-600 mt-1">index score</p>
        </div>
      </div>

      {/* Manufacturer Overview Cards */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Package size={18} className="text-orange-400" />
          Manufacturer Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {manufacturerProfiles.map(profile => {
            const config = getManufacturerConfig(profile.manufacturer);
            return (
              <div key={profile.manufacturer} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: profile.color }} />
                  <span className="text-sm font-bold text-white">{profile.label}</span>
                  <span className={`ml-auto text-xs font-bold ${config.text}`}>{profile.marketShare}%</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Sets</span><span className="text-slate-200">{profile.totalSets}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Cards Produced</span><span className="text-slate-200">{formatNumber(profile.totalCardsProduced)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Avg Overprod.</span>
                    <span className={profile.avgOverproduction >= 70 ? 'text-red-400' : profile.avgOverproduction >= 50 ? 'text-amber-400' : 'text-emerald-400'}>
                      {profile.avgOverproduction}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Volume Chart + Market Share Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" />
            Production Volume by Set (Millions)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'M cards', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: '#94a3b8' }} />
                <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                  {volumeChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.score >= 80 ? '#ef4444' : entry.score >= 60 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-purple-400" />
            Market Share
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={{ stroke: '#475569' }}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scarcity Index Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-emerald-400" />
          Scarcity Index Rankings
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-3 text-xs text-slate-400 font-medium">Set</th>
                <th className="text-center py-2 px-3 text-xs text-slate-400 font-medium">Manufacturer</th>
                <th className="text-center py-2 px-3 text-xs text-slate-400 font-medium">Scarcity</th>
                <th className="text-center py-2 px-3 text-xs text-slate-400 font-medium">Population</th>
                <th className="text-center py-2 px-3 text-xs text-slate-400 font-medium">Demand</th>
                <th className="text-center py-2 px-3 text-xs text-slate-400 font-medium">Stability</th>
                <th className="text-center py-2 px-3 text-xs text-slate-400 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {scarcityIndices.map(si => {
                const mfrConfig = getManufacturerConfig(si.manufacturer);
                const scoreColor = si.scarcityScore >= 80 ? 'text-emerald-400' : si.scarcityScore >= 50 ? 'text-amber-400' : 'text-red-400';
                return (
                  <tr key={si.id} className="border-b border-slate-700/30 hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-slate-200 font-medium truncate max-w-[200px]">{si.setName.replace('2024 ', '')}</td>
                    <td className="py-2 px-3 text-center"><span className={`text-xs ${mfrConfig.text}`}>{mfrConfig.label}</span></td>
                    <td className="py-2 px-3 text-center"><span className={`font-bold ${scoreColor}`}>{si.scarcityScore}</span></td>
                    <td className="py-2 px-3 text-center text-slate-300">{formatNumber(si.populationCount)}</td>
                    <td className="py-2 px-3 text-center text-slate-300">{si.demandScore}</td>
                    <td className="py-2 px-3 text-center text-slate-300">{si.priceStability}</td>
                    <td className="py-2 px-3 text-center">
                      {si.trend === 'increasing' ? <TrendingUp className="w-4 h-4 text-emerald-400 inline" /> :
                       si.trend === 'decreasing' ? <TrendingDown className="w-4 h-4 text-red-400 inline" /> :
                       <span className="text-xs text-slate-400">Stable</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parallel Breakdown Pyramid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          Parallel Breakdown Pyramid
        </h2>
        <div className="flex gap-2 flex-wrap mb-4">
          {['set-001', 'set-002', 'set-013'].map(sid => {
            const setObj = sets.find(s => s.id === sid);
            return (
              <button
                key={sid}
                onClick={() => setSelectedSetId(sid)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  (selectedSetId ?? 'set-001') === sid
                    ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {setObj?.name.replace('2024 ', '') ?? sid}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {selectedParallels.sort((a, b) => b.productionCount - a.productionCount).map(pb => {
            const maxCount = selectedParallels[0]?.productionCount ?? 1;
            const widthPct = Math.max(5, (pb.productionCount / maxCount) * 100);
            return (
              <div key={pb.id} className="flex items-center gap-3">
                <div className="w-28 text-xs text-slate-300 text-right truncate">{pb.parallelName}</div>
                <div className="flex-1 bg-slate-800 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center pl-2"
                    style={{ width: `${widthPct}%`, backgroundColor: pb.color, opacity: 0.7 }}
                  >
                    <span className="text-[10px] font-bold text-white whitespace-nowrap">
                      {formatNumber(pb.productionCount)}{pb.numberedTo ? ` (/${pb.numberedTo})` : ''}
                    </span>
                  </div>
                </div>
                <div className="w-16 text-right text-xs text-slate-400">{pb.valueMultiplier}x</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Trends Line Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-brand-lime" />
          Production Trends (2020-2024, Millions of Cards)
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'M cards', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: '#94a3b8' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {manufacturerProfiles.map(p => (
                <Line key={p.manufacturer} type="monotone" dataKey={p.label} stroke={p.color} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Saturation Alerts */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          Saturation Alerts ({alerts.length})
        </h2>
        <div className="space-y-3">
          {alerts.map(alert => {
            const sevConfig = getSeverityConfig(alert.severity);
            return (
              <div key={alert.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${sevConfig.text}`} />
                    <span className="text-sm font-bold text-white">{alert.setName.replace('2024 ', '')}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sevConfig.bg} ${sevConfig.text} border ${sevConfig.border}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{alert.alertType}: {alert.description.substring(0, 150)}...</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {alert.affectedParallels.map(p => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">{p}</span>
                    ))}
                  </div>
                  <span className={`text-xs font-bold ${alert.estimatedImpact < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {alert.estimatedImpact > 0 ? '+' : ''}{alert.estimatedImpact}%
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400/70 mt-2">{alert.recommendedAction}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supply vs Demand Scatter */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-amber-400" />
          Supply vs. Demand Analysis
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="supply" name="Supply Index" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Supply Index', position: 'bottom', style: { fontSize: 10, fill: '#64748b' } }} />
              <YAxis dataKey="demand" name="Demand Index" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Demand Index', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} formatter={(value: number, name: string) => [value, name]} />
              <Scatter data={scatterData} fill="#a3e635">
                {scatterData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.demand > entry.supply ? '#22c55e' : '#ef4444'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {supplyDemand.map(sd => (
            <div key={sd.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">{sd.setName.replace('2024 ', '')}</p>
                <p className="text-[10px] text-slate-500">Supply: {sd.supplyIndex} | Demand: {sd.demandIndex}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${sd.pricePressure === 'upward' ? 'text-emerald-400' : sd.pricePressure === 'downward' ? 'text-red-400' : 'text-slate-400'}`}>
                  {sd.pricePressure === 'upward' ? 'Upward' : sd.pricePressure === 'downward' ? 'Downward' : 'Neutral'}
                </p>
                <p className="text-[10px] text-slate-500">Imbalance: {sd.imbalanceScore}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Absorption Tracker */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingDown size={18} className="text-cyan-400" />
          Market Absorption Rate
        </h2>
        <div className="space-y-3">
          {absorption.map(ma => (
            <div key={ma.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{ma.setName.replace('2024 ', '')}</span>
                <span className={`text-xs font-bold ${ma.absorptionRate >= 90 ? 'text-emerald-400' : ma.absorptionRate >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {ma.absorptionRate.toFixed(1)}% absorbed
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                <div
                  className={`h-full rounded-full ${ma.absorptionRate >= 90 ? 'bg-emerald-500' : ma.absorptionRate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${ma.absorptionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Sold: {formatNumber(ma.totalSold)} / {formatNumber(ma.totalProduced)}</span>
                <span>Est. {ma.daysToAbsorb}d to full absorption</span>
                <span className={ma.priceDecline < 0 ? 'text-red-400' : 'text-emerald-400'}>{ma.priceDecline > 0 ? '+' : ''}{ma.priceDecline}% price</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insert Odds & Set Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insert Odds */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-amber-400" />
            Insert Odds & EV Calculator
          </h2>
          <div className="space-y-2">
            {insertOdds.map(io => {
              const setObj = sets.find(s => s.id === io.setId);
              return (
                <div key={io.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{io.insertName}</span>
                    <span className="text-[10px] text-slate-400">{setObj?.name.replace('2024 ', '') ?? ''}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Odds: {io.odds}</span>
                    <span>Avg: {formatCurrency(io.avgValue)}</span>
                    <span className="text-emerald-400 font-bold">EV/Box: {formatCurrency(io.evPerBox)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Set Comparison */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" />
            Set Comparison (Top 8)
          </h2>
          <div className="space-y-2">
            {setComparisons.slice(0, 8).map(sc => {
              const mfrConfig = getManufacturerConfig(sc.manufacturer);
              return (
                <div key={sc.setId} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate mr-2">{sc.setName.replace('2024 ', '')}</span>
                    <span className={`text-[10px] ${mfrConfig.text}`}>{mfrConfig.label}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Run: {formatNumber(sc.printRun)}</span>
                    <span>Scarcity: {sc.scarcityScore}</span>
                    <span className={sc.roi12m >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      ROI: {sc.roi12m >= 0 ? '+' : ''}{sc.roi12m.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintRunIntelligence;
