// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Briefcase,
  PieChart,
  Grid3X3,
  Shield,
  Upload,
  Sliders,
  AlertTriangle,
  Check,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  AssetCategory,
  RiskTolerance,
  AssetImportData,
  getUnifiedPortfolio,
  getCategoryAllocation,
  getCrossCategoryCorrelation,
  getDiversificationReport,
  getOptimalCrossHobbyAllocation,
  getCategoryPerformance,
  getRebalancingRecommendations,
  importAlternativeAsset,
  getMockAlternativeAssets,
  getAllCategoryLabels,
  getAllCategoryColors,
} from '../lib/utils/crossHobbyPortfolioService';

interface CrossHobbyPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'correlation' | 'diversification' | 'import' | 'optimizer';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Portfolio Overview', icon: <PieChart size={16} /> },
  { id: 'correlation', label: 'Correlation Matrix', icon: <Grid3X3 size={16} /> },
  { id: 'diversification', label: 'Diversification', icon: <Shield size={16} /> },
  { id: 'import', label: 'Import Assets', icon: <Upload size={16} /> },
  { id: 'optimizer', label: 'Optimizer', icon: <Sliders size={16} /> },
];

const CATEGORY_OPTIONS: { value: AssetCategory; label: string }[] = [
  { value: 'memorabilia', label: 'Memorabilia' },
  { value: 'autographs', label: 'Autographs' },
  { value: 'sealed_wax', label: 'Sealed Wax' },
  { value: 'sneakers', label: 'Sneakers' },
  { value: 'watches', label: 'Watches' },
  { value: 'sports_art', label: 'Sports Art' },
  { value: 'wine', label: 'Fine Wine' },
];

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
};

export const CrossHobbyPortfolioModal: React.FC<CrossHobbyPortfolioModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const [budget, setBudget] = useState(50000);
  const [importStep, setImportStep] = useState(0);
  const [importData, setImportData] = useState<Partial<AssetImportData>>({ category: 'memorabilia' });
  const [importSuccess, setImportSuccess] = useState(false);

  const portfolio = useMemo(() => getUnifiedPortfolio([], getMockAlternativeAssets()), []);
  const allocations = useMemo(() => getCategoryAllocation(portfolio), [portfolio]);
  const correlations = useMemo(() => getCrossCategoryCorrelation(), []);
  const diversification = useMemo(() => getDiversificationReport(portfolio), [portfolio]);
  const performance = useMemo(() => getCategoryPerformance(), []);
  const rebalancing = useMemo(() => getRebalancingRecommendations(portfolio), [portfolio]);
  const optimalAllocation = useMemo(
    () => getOptimalCrossHobbyAllocation(budget, riskTolerance),
    [budget, riskTolerance]
  );

  const categoryLabels = useMemo(() => getAllCategoryLabels(), []);
  const categoryColors = useMemo(() => getAllCategoryColors(), []);

  const categories: AssetCategory[] = ['cards', 'memorabilia', 'autographs', 'sealed_wax', 'sneakers', 'watches', 'sports_art', 'wine'];

  const handleImport = useCallback(() => {
    if (importData.name && importData.category && importData.purchasePrice && importData.currentValue) {
      importAlternativeAsset(importData as AssetImportData);
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        setImportStep(0);
        setImportData({ category: 'memorabilia' });
      }, 2000);
    }
  }, [importData]);

  if (!isOpen) return null;

  const summaryItems = [
    { label: 'Total AUM', value: formatCurrency(portfolio.totalValue), color: 'text-white' },
    { label: 'Total P&L', value: `${portfolio.totalGainLossPercent >= 0 ? '+' : ''}${portfolio.totalGainLossPercent.toFixed(1)}%`, color: portfolio.totalGainLossPercent >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Diversification', value: `${diversification.score}/100 (${diversification.grade})`, color: diversification.score >= 70 ? 'text-lime-400' : 'text-amber-400' },
    { label: 'Categories', value: `${allocations.length} Active`, color: 'text-cyan-400' },
  ];

  // Build correlation heatmap data
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-500/10 rounded-xl">
              <Briefcase size={20} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cross-Hobby Portfolio Intelligence</h2>
              <p className="text-xs text-slate-400">Unified Portfolio Across Cards, Memorabilia, Watches, Sneakers & More</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-slate-800/50 border-b border-slate-700/30">
          {summaryItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</div>
              <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/30 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-lime-400 border border-slate-700/50 border-b-transparent'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ===== TAB: Portfolio Overview ===== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Allocation Pie */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                  <h3 className="text-sm font-bold text-white mb-4">Allocation Breakdown</h3>
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
                </div>

                {/* Category Breakdown Table */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                  <h3 className="text-sm font-bold text-white mb-4">Category Details</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allocations.map((alloc) => (
                      <div key={alloc.category} className="flex items-center justify-between py-2 border-b border-slate-700/20 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alloc.color }} />
                          <div>
                            <div className="text-xs font-medium text-white">{alloc.label}</div>
                            <div className="text-[10px] text-slate-500">{alloc.count} assets</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-white">{formatCurrency(alloc.value)}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">{alloc.percentage.toFixed(1)}%</span>
                            <span className={`text-[10px] font-bold ${alloc.gainLossPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {alloc.gainLossPercent >= 0 ? '+' : ''}{alloc.gainLossPercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Performance Comparison */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                <h3 className="text-sm font-bold text-white mb-4">Category Performance Comparison (1Y)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v: number) => `${v}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                      <Bar dataKey="return1y" name="1Y Return">
                        {performance.map((entry) => (
                          <Cell key={entry.category} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: Correlation Matrix ===== */}
          {activeTab === 'correlation' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                <h3 className="text-sm font-bold text-white mb-2">Cross-Category Correlation Heatmap</h3>
                <p className="text-xs text-slate-400 mb-4">Lower correlation = better diversification. Values near 0 indicate uncorrelated returns.</p>
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
                                title={`${categoryLabels[catA]} vs ${categoryLabels[categories[j]]}: ${val.toFixed(2)}`}
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
                {/* Legend */}
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

              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                  <h4 className="text-xs font-bold text-white mb-3">Lowest Correlations (Best Diversifiers)</h4>
                  {correlations
                    .filter((c) => c.categoryA !== c.categoryB)
                    .sort((a, b) => a.correlation - b.correlation)
                    .slice(0, 5)
                    .map((c) => (
                      <div key={`${c.categoryA}-${c.categoryB}`} className="flex items-center justify-between py-1.5 border-b border-slate-700/20 last:border-0">
                        <span className="text-xs text-slate-300">
                          {categoryLabels[c.categoryA]} / {categoryLabels[c.categoryB]}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">{c.correlation.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                  <h4 className="text-xs font-bold text-white mb-3">Highest Correlations (Similar Movement)</h4>
                  {correlations
                    .filter((c) => c.categoryA !== c.categoryB && c.categoryA < c.categoryB)
                    .sort((a, b) => b.correlation - a.correlation)
                    .slice(0, 5)
                    .map((c) => (
                      <div key={`${c.categoryA}-${c.categoryB}`} className="flex items-center justify-between py-1.5 border-b border-slate-700/20 last:border-0">
                        <span className="text-xs text-slate-300">
                          {categoryLabels[c.categoryA]} / {categoryLabels[c.categoryB]}
                        </span>
                        <span className="text-xs font-bold text-amber-400">{c.correlation.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: Diversification Analysis ===== */}
          {activeTab === 'diversification' && (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Diversification Score</div>
                  <div className={`text-5xl font-bold ${
                    diversification.score >= 70 ? 'text-lime-400' :
                    diversification.score >= 40 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {diversification.score}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">out of 100</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                    diversification.score >= 70
                      ? 'bg-lime-500/10 text-lime-400'
                      : diversification.score >= 40
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                  }`}>
                    Grade {diversification.grade}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Herfindahl Index</div>
                  <div className="text-3xl font-bold text-white">{diversification.herfindahlIndex.toFixed(3)}</div>
                  <div className="text-xs text-slate-400 mt-1">Lower = more diversified</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30 text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Effective Categories</div>
                  <div className="text-3xl font-bold text-cyan-400">{diversification.effectiveCategories.toFixed(1)}</div>
                  <div className="text-xs text-slate-400 mt-1">of 8 possible</div>
                </div>
              </div>

              {/* Concentration Risk */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Concentration Risk Assessment</h3>
                </div>
                <p className="text-sm text-slate-300">{diversification.concentrationRisk}</p>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                <h3 className="text-sm font-bold text-white mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {diversification.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/20">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rec.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                        rec.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {rec.priority}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold uppercase ${
                            rec.action === 'increase' ? 'text-emerald-400' :
                            rec.action === 'decrease' ? 'text-red-400' :
                            rec.action === 'add' ? 'text-cyan-400' : 'text-amber-400'
                          }`}>
                            {rec.action}
                          </span>
                          <span className="text-xs font-bold text-white">{rec.label}</span>
                        </div>
                        <p className="text-xs text-slate-400">{rec.reason}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-500">Current: {rec.currentAllocation.toFixed(1)}%</span>
                          <ChevronRight size={10} className="text-slate-600" />
                          <span className="text-[10px] text-lime-400">Target: {rec.targetAllocation.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rebalancing Suggestions */}
              {rebalancing.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                  <h3 className="text-sm font-bold text-white mb-4">Cross-Category Rebalancing</h3>
                  <div className="space-y-3">
                    {rebalancing.map((rec, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/20">
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rec.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {rec.priority}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-red-400 font-medium">{rec.fromLabel}</span>
                            <ChevronRight size={12} className="text-slate-600" />
                            <span className="text-emerald-400 font-medium">{rec.toLabel}</span>
                            <span className="text-white font-bold">{formatCurrency(rec.amount)}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: Import Assets ===== */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                <h3 className="text-sm font-bold text-white mb-2">Import Alternative Asset</h3>
                <p className="text-xs text-slate-400 mb-6">Add non-card assets to your unified portfolio for complete cross-hobby analysis.</p>

                {importSuccess ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                      <Check size={32} className="text-emerald-400" />
                    </div>
                    <p className="text-lg font-bold text-white">Asset Imported Successfully</p>
                    <p className="text-sm text-slate-400">Your portfolio has been updated.</p>
                  </div>
                ) : (
                  <>
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mb-6">
                      {['Category', 'Details', 'Valuation', 'Review'].map((step, i) => (
                        <React.Fragment key={step}>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            importStep === i ? 'bg-lime-500/10 text-lime-400 border border-lime-500/30' :
                            importStep > i ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-slate-700/30 text-slate-500'
                          }`}>
                            {importStep > i ? <Check size={12} /> : null}
                            {step}
                          </div>
                          {i < 3 && <div className="flex-1 h-px bg-slate-700/50" />}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Step 0: Category */}
                    {importStep === 0 && (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Select Category</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {CATEGORY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setImportData((prev) => ({ ...prev, category: opt.value }))}
                              className={`p-4 rounded-xl text-sm font-bold text-center transition-all border ${
                                importData.category === opt.value
                                  ? 'bg-lime-500/10 border-lime-500/30 text-lime-400'
                                  : 'bg-slate-900/50 border-slate-700/30 text-slate-400 hover:text-white hover:border-slate-600'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setImportStep(1)}
                            className="px-6 py-2 bg-lime-500/10 border border-lime-500/30 rounded-lg text-lime-400 font-bold text-sm hover:bg-lime-500/20 transition-all"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 1: Details */}
                    {importStep === 1 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Asset Name</label>
                            <input
                              type="text"
                              value={importData.name ?? ''}
                              onChange={(e) => setImportData((prev) => ({ ...prev, name: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
                              placeholder="e.g., Rolex Submariner 116610LN"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Condition</label>
                            <input
                              type="text"
                              value={importData.condition ?? ''}
                              onChange={(e) => setImportData((prev) => ({ ...prev, condition: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
                              placeholder="e.g., Excellent, Mint, DS"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                          <textarea
                            value={importData.description ?? ''}
                            onChange={(e) => setImportData((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50 h-20 resize-none"
                            placeholder="Describe the asset..."
                          />
                        </div>
                        {/* Category-specific fields */}
                        {(importData.category === 'watches' || importData.category === 'sneakers') && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Brand</label>
                              <input
                                type="text"
                                value={importData.brand ?? ''}
                                onChange={(e) => setImportData((prev) => ({ ...prev, brand: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Model</label>
                              <input
                                type="text"
                                value={importData.model ?? ''}
                                onChange={(e) => setImportData((prev) => ({ ...prev, model: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
                              />
                            </div>
                          </div>
                        )}
                        {importData.category === 'sports_art' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Artist</label>
                              <input
                                type="text"
                                value={importData.artist ?? ''}
                                onChange={(e) => setImportData((prev) => ({ ...prev, artist: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medium</label>
                              <input
                                type="text"
                                value={importData.medium ?? ''}
                                onChange={(e) => setImportData((prev) => ({ ...prev, medium: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <button
                            onClick={() => setImportStep(0)}
                            className="px-6 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 font-bold text-sm hover:text-white transition-all"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => setImportStep(2)}
                            className="px-6 py-2 bg-lime-500/10 border border-lime-500/30 rounded-lg text-lime-400 font-bold text-sm hover:bg-lime-500/20 transition-all"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Valuation */}
                    {importStep === 2 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Purchase Price ($)</label>
                            <input
                              type="number"
                              value={importData.purchasePrice ?? ''}
                              onChange={(e) => setImportData((prev) => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Value ($)</label>
                            <input
                              type="number"
                              value={importData.currentValue ?? ''}
                              onChange={(e) => setImportData((prev) => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Purchase Date</label>
                          <input
                            type="date"
                            value={importData.purchaseDate ?? ''}
                            onChange={(e) => setImportData((prev) => ({ ...prev, purchaseDate: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
                          />
                        </div>
                        <div className="flex justify-between">
                          <button
                            onClick={() => setImportStep(1)}
                            className="px-6 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 font-bold text-sm hover:text-white transition-all"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => setImportStep(3)}
                            className="px-6 py-2 bg-lime-500/10 border border-lime-500/30 rounded-lg text-lime-400 font-bold text-sm hover:bg-lime-500/20 transition-all"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Review */}
                    {importStep === 3 && (
                      <div className="space-y-4">
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/20">
                          <h4 className="text-xs font-bold text-white mb-3">Review Asset Details</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div><span className="text-[10px] text-slate-500">Category:</span> <span className="text-xs text-white">{importData.category}</span></div>
                            <div><span className="text-[10px] text-slate-500">Name:</span> <span className="text-xs text-white">{importData.name || '—'}</span></div>
                            <div><span className="text-[10px] text-slate-500">Condition:</span> <span className="text-xs text-white">{importData.condition || '—'}</span></div>
                            <div><span className="text-[10px] text-slate-500">Purchase Price:</span> <span className="text-xs text-white">{importData.purchasePrice ? formatCurrency(importData.purchasePrice) : '—'}</span></div>
                            <div><span className="text-[10px] text-slate-500">Current Value:</span> <span className="text-xs text-white">{importData.currentValue ? formatCurrency(importData.currentValue) : '—'}</span></div>
                            <div><span className="text-[10px] text-slate-500">Purchase Date:</span> <span className="text-xs text-white">{importData.purchaseDate || '—'}</span></div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <button
                            onClick={() => setImportStep(2)}
                            className="px-6 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 font-bold text-sm hover:text-white transition-all"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleImport}
                            className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-all"
                          >
                            Import Asset
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ===== TAB: Optimizer ===== */}
          {activeTab === 'optimizer' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                <h3 className="text-sm font-bold text-white mb-4">Markowitz-Style Cross-Hobby Optimizer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Risk Tolerance</label>
                    <div className="flex gap-2">
                      {(['conservative', 'moderate', 'aggressive'] as RiskTolerance[]).map((rt) => (
                        <button
                          key={rt}
                          onClick={() => setRiskTolerance(rt)}
                          className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                            riskTolerance === rt
                              ? 'bg-lime-500/10 border border-lime-500/30 text-lime-400'
                              : 'bg-slate-900/50 border border-slate-700/30 text-slate-400 hover:text-white'
                          }`}
                        >
                          {rt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Budget: {formatCurrency(budget)}
                    </label>
                    <input
                      type="range"
                      min={5000}
                      max={500000}
                      step={5000}
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value))}
                      className="w-full accent-lime-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>$5K</span>
                      <span>$500K</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimal Allocation Table */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                <h3 className="text-sm font-bold text-white mb-4">Optimal Allocation</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/30">
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Category</th>
                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Optimal %</th>
                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Amount</th>
                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Exp. Return</th>
                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Risk Contrib</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optimalAllocation
                        .sort((a, b) => b.optimalWeight - a.optimalWeight)
                        .map((alloc) => (
                          <tr key={alloc.category} className="border-b border-slate-700/10 hover:bg-slate-800/30">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[alloc.category] }} />
                                <span className="text-xs font-medium text-white">{alloc.label}</span>
                              </div>
                            </td>
                            <td className="text-right py-2.5 px-3">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${alloc.optimalWeight}%`,
                                      backgroundColor: categoryColors[alloc.category],
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-white">{alloc.optimalWeight.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="text-right py-2.5 px-3 text-xs text-slate-300">
                              {formatCurrency(budget * alloc.optimalWeight / 100)}
                            </td>
                            <td className="text-right py-2.5 px-3 text-xs text-emerald-400">
                              +{alloc.expectedReturn.toFixed(1)}%
                            </td>
                            <td className="text-right py-2.5 px-3 text-xs text-amber-400">
                              {alloc.riskContribution.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                <h3 className="text-sm font-bold text-white mb-4">Risk / Return Profile</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={optimalAllocation.map((a) => ({
                      category: categoryShortLabels[a.category],
                      return: a.expectedReturn,
                      risk: a.riskContribution,
                      weight: a.optimalWeight,
                    }))}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <PolarRadiusAxis tick={{ fontSize: 8, fill: '#64748b' }} />
                      <Radar name="Weight %" dataKey="weight" stroke="#84cc16" fill="#84cc16" fillOpacity={0.2} />
                      <Radar name="Exp. Return" dataKey="return" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossHobbyPortfolioModal;
