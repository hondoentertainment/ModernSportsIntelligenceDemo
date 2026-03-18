import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Grid3X3,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  getUnifiedPortfolio,
  getCategoryAllocation,
  getCrossCategoryCorrelation,
  getDiversificationReport,
  getCategoryPerformance,
  getRebalancingRecommendations,
  getMockAlternativeAssets,
  getAllCategoryLabels,
  getAllCategoryColors,
  AssetCategory,
} from '../lib/utils/crossHobbyPortfolioService';
import { CrossHobbyPortfolioModal } from '../components/CrossHobbyPortfolioModal';

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
};

const categoryShortLabels: Record<AssetCategory, string> = {
  cards: 'Cards',
  memorabilia: 'Memo',
  autographs: 'Auto',
  sealed_wax: 'Wax',
  sneakers: 'Snkrs',
  watches: 'Watch',
  sports_art: 'Art',
  wine: 'Wine',
};

const CrossHobbyPortfolio: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const portfolio = useMemo(() => getUnifiedPortfolio([], getMockAlternativeAssets()), []);
  const allocations = useMemo(() => getCategoryAllocation(portfolio), [portfolio]);
  const correlations = useMemo(() => getCrossCategoryCorrelation(), []);
  const diversification = useMemo(() => getDiversificationReport(portfolio), [portfolio]);
  const performance = useMemo(() => getCategoryPerformance(), []);
  const rebalancing = useMemo(() => getRebalancingRecommendations(portfolio), [portfolio]);
  const _categoryLabels = useMemo(() => getAllCategoryLabels(), []);
  const _categoryColors = useMemo(() => getAllCategoryColors(), []);

  const categories: AssetCategory[] = ['cards', 'memorabilia', 'autographs', 'sealed_wax', 'sneakers', 'watches', 'sports_art', 'wine'];

  const correlationMatrix: number[][] = categories.map((catA) =>
    categories.map((catB) => {
      const match = correlations.find((c) => c.categoryA === catA && c.categoryB === catB);
      return match ? match.correlation : 0;
    })
  );

  const getCorrelationColor = (val: number): string => {
    if (val >= 0.8) return 'bg-red-500';
    if (val >= 0.6) return 'bg-orange-500';
    if (val >= 0.4) return 'bg-amber-500';
    if (val >= 0.2) return 'bg-yellow-500';
    if (val >= 0) return 'bg-emerald-500';
    return 'bg-blue-500';
  };

  const getCorrelationOpacity = (val: number): number => {
    return 0.3 + Math.abs(val) * 0.7;
  };

  const topPerformer = [...performance].sort((a, b) => b.return1y - a.return1y)[0];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-500/10 border border-lime-500/20 rounded-full mb-2">
            <Briefcase size={12} className="text-lime-400" />
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">Phase 111 — Cross-Hobby Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Cross-Hobby <span className="text-lime-400">Portfolio</span>
          </h1>
          <p className="text-slate-400 max-w-2xl font-medium">
            Unified Portfolio Across Cards, Memorabilia, Watches, Sneakers & Art — Cross-Category Correlation Intelligence
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-lime-500/10 border border-lime-500/30 rounded-xl text-lime-400 font-bold text-sm hover:bg-lime-500/20 transition-all"
        >
          Open Portfolio Terminal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total AUM</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</div>
          <div className={`text-xs font-bold mt-1 ${portfolio.totalGainLossPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {portfolio.totalGainLossPercent >= 0 ? '+' : ''}{portfolio.totalGainLossPercent.toFixed(1)}% P&L
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Diversification</div>
          <div className={`text-2xl font-bold ${
            diversification.score >= 70 ? 'text-lime-400' :
            diversification.score >= 40 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {diversification.score}/100
          </div>
          <div className="text-xs text-slate-400 mt-1">Grade {diversification.grade}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Categories</div>
          <div className="text-2xl font-bold text-cyan-400">{allocations.length}</div>
          <div className="text-xs text-slate-400 mt-1">{diversification.effectiveCategories.toFixed(1)} effective</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Top Category (1Y)</div>
          <div className="text-2xl font-bold text-emerald-400">+{topPerformer.return1y}%</div>
          <div className="text-xs text-slate-400 mt-1">{topPerformer.label}</div>
        </div>
      </div>

      {/* Allocation & Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Pie */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Portfolio Allocation</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={allocations}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {allocations.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
            {allocations.map((alloc) => (
              <div key={alloc.category} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: alloc.color }} />
                <span className="text-xs text-slate-400">{alloc.label}</span>
                <span className="text-xs font-bold text-slate-300">{alloc.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Category Performance (1Y Return)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v: number) => `${v}%`} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="return1y" name="1Y Return" radius={[0, 4, 4, 0]}>
                  {performance.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Correlation Heatmap */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Grid3X3 size={18} className="text-lime-400" />
          <h2 className="text-lg font-bold text-white">Cross-Category Correlation Heatmap</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Correlation coefficients between hobby asset categories over a 3-year period. Lower values indicate better diversification potential.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-[10px] text-slate-500" />
                {categories.map((cat) => (
                  <th key={cat} className="p-2 text-[10px] text-slate-400 font-bold text-center">
                    {categoryShortLabels[cat]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((catA, i) => (
                <tr key={catA}>
                  <td className="p-2 text-[10px] text-slate-400 font-bold whitespace-nowrap">
                    {categoryShortLabels[catA]}
                  </td>
                  {correlationMatrix[i].map((val, j) => (
                    <td key={`${catA}-${categories[j]}`} className="p-1 text-center">
                      <div
                        className={`${getCorrelationColor(val)} rounded-md p-2 text-[10px] font-bold text-white`}
                        style={{ opacity: getCorrelationOpacity(val) }}
                      >
                        {val.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-4 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500 opacity-50" />
            <span className="text-[10px] text-slate-400">Low (0-0.2)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500 opacity-60" />
            <span className="text-[10px] text-slate-400">Moderate (0.2-0.4)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500 opacity-70" />
            <span className="text-[10px] text-slate-400">High (0.4-0.6)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500 opacity-90" />
            <span className="text-[10px] text-slate-400">Very High (0.8+)</span>
          </div>
        </div>
      </div>

      {/* Category Detail Table */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Category Performance Detail</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/30">
                <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Category</th>
                <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">1M</th>
                <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">3M</th>
                <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">6M</th>
                <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">1Y</th>
                <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">3Y</th>
                <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Volatility</th>
                <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Sharpe</th>
                <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Max DD</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((perf) => (
                <tr key={perf.category} className="border-b border-slate-700/10 hover:bg-slate-800/30">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: perf.color }} />
                      <span className="text-xs font-medium text-white">{perf.label}</span>
                    </div>
                  </td>
                  {[perf.return1m, perf.return3m, perf.return6m, perf.return1y, perf.return3y].map((ret, idx) => (
                    <td key={idx} className={`text-right py-2.5 px-3 text-xs font-bold ${ret >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ret >= 0 ? '+' : ''}{ret.toFixed(1)}%
                    </td>
                  ))}
                  <td className="text-right py-2.5 px-3 text-xs text-amber-400">{perf.volatility.toFixed(1)}%</td>
                  <td className="text-right py-2.5 px-3 text-xs text-cyan-400">{perf.sharpeRatio.toFixed(2)}</td>
                  <td className="text-right py-2.5 px-3 text-xs text-red-400">{perf.maxDrawdown.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rebalancing Recommendations */}
      {rebalancing.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sliders size={18} className="text-lime-400" />
            <h2 className="text-lg font-bold text-white">Cross-Category Rebalancing Recommendations</h2>
          </div>
          <div className="space-y-3">
            {rebalancing.map((rec, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/20">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  rec.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {rec.priority}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-red-400 font-medium">{rec.fromLabel}</span>
                    <ChevronRight size={14} className="text-slate-600" />
                    <span className="text-emerald-400 font-medium">{rec.toLabel}</span>
                    <span className="text-white font-bold ml-2">{formatCurrency(rec.amount)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <CrossHobbyPortfolioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default CrossHobbyPortfolio;
