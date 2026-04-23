// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Timer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Shield,
  Package,
  BarChart3,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Layers,
  SlidersHorizontal,
  GitCompare,
  Lightbulb,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  calculateBreakEven,
  getVelocityScenarios,
  getCostBreakdown,
  getPortfolioBreakEvenSummary,
  getPortfolioCards,
  BreakEvenAnalysis,
  VelocityScenario,
  CostBreakdown,
} from '../lib/analytics/breakEvenVelocityService';

type TabId = 'overview' | 'analysis' | 'simulator' | 'compare' | 'optimization';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Portfolio Overview', icon: <Layers size={16} /> },
  { id: 'analysis', label: 'Card Analysis', icon: <BarChart3 size={16} /> },
  { id: 'simulator', label: 'Cost Simulator', icon: <SlidersHorizontal size={16} /> },
  { id: 'compare', label: 'Scenario Compare', icon: <GitCompare size={16} /> },
  { id: 'optimization', label: 'Optimization', icon: <Lightbulb size={16} /> },
];

const STATUS_CONFIG = {
  profitable: { color: 'text-lime-400', bg: 'bg-lime-400/10', border: 'border-lime-400/30', icon: CheckCircle, label: 'Profitable' },
  approaching: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', icon: Clock, label: 'Approaching' },
  far: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', icon: AlertTriangle, label: 'Far Away' },
  losing: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', icon: XCircle, label: 'Losing Value' },
};

const PIE_COLORS = ['#a3e635', '#facc15', '#fb923c', '#f87171', '#60a5fa', '#c084fc'];

function formatCurrency(val: number): string {
  if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(1)}k`;
  return `$${val.toFixed(2)}`;
}

function formatDays(days: number): string {
  if (days >= 9999) return 'N/A';
  if (days === 0) return 'Now';
  if (days < 30) return `${days}d`;
  const months = days / 30;
  return `${months.toFixed(1)}mo`;
}

// ------- Portfolio Overview Tab -------
function PortfolioOverviewTab({
  analyses,
  onSelectCard,
}: {
  analyses: BreakEvenAnalysis[];
  onSelectCard: (id: string) => void;
}) {
  const summary = useMemo(() => getPortfolioBreakEvenSummary(), []);

  const statusDistribution = [
    { name: 'Profitable', value: summary.profitableCards, color: '#a3e635' },
    { name: 'Approaching', value: summary.approachingCards, color: '#facc15' },
    { name: 'Far Away', value: summary.farCards, color: '#fb923c' },
    { name: 'Losing', value: summary.losingCards, color: '#f87171' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invested', value: formatCurrency(summary.totalInvested), icon: <DollarSign size={18} className="text-brand-lime" /> },
          { label: 'Current Value', value: formatCurrency(summary.totalCurrentValue), icon: <TrendingUp size={18} className="text-lime-400" /> },
          { label: 'Daily Holding Cost', value: formatCurrency(summary.dailyPortfolioCost), icon: <Clock size={18} className="text-yellow-400" /> },
          { label: 'Monthly Cost', value: formatCurrency(summary.monthlyPortfolioCost), icon: <Calendar size={18} className="text-orange-400" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Distribution Chart + Net Profit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                {statusDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                formatter={(value: number, name: string) => [`${value} cards`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {statusDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Net Profit After Costs</h3>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-3xl font-black ${summary.totalNetProfit >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
              {summary.totalNetProfit >= 0 ? '+' : ''}{formatCurrency(summary.totalNetProfit)}
            </span>
            {summary.totalNetProfit >= 0 ? (
              <TrendingUp size={24} className="text-lime-400" />
            ) : (
              <TrendingDown size={24} className="text-red-400" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <span className="text-slate-500 text-xs">Avg Break-Even</span>
              <p className="text-white font-bold">{formatDays(summary.averageBreakEvenDays)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <span className="text-slate-500 text-xs">Total Holding Costs</span>
              <p className="text-yellow-400 font-bold">{formatCurrency(summary.totalHoldingCosts)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <span className="text-slate-500 text-xs">Profitable Cards</span>
              <p className="text-lime-400 font-bold">{summary.profitableCards} / {summary.totalCards}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <span className="text-slate-500 text-xs">Potential Monthly Savings</span>
              <p className="text-brand-lime font-bold">{formatCurrency(summary.optimizationPotentialSavings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Break-Even Countdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.map((card) => {
            const cfg = STATUS_CONFIG[card.status];
            const StatusIcon = cfg.icon;
            return (
              <button
                key={card.cardId}
                onClick={() => onSelectCard(card.cardId)}
                className={`bg-slate-800/60 border ${cfg.border} rounded-xl p-4 text-left hover:bg-slate-800 transition-all group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{card.playerName}</p>
                    <p className="text-xs text-slate-500 truncate">{card.cardName}</p>
                  </div>
                  <StatusIcon size={18} className={cfg.color} />
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Break-Even</span>
                    <p className={`text-lg font-black ${cfg.color}`}>
                      {card.isProfitable ? 'Profitable' : formatDays(card.breakEvenDays)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Net/Day</span>
                    <p className={`text-sm font-bold ${card.netDailyGain >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                      {card.netDailyGain >= 0 ? '+' : ''}{formatCurrency(card.netDailyGain)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 w-full bg-slate-900 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${card.isProfitable ? 'bg-lime-400' : card.status === 'approaching' ? 'bg-yellow-400' : card.status === 'far' ? 'bg-orange-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, card.isProfitable ? 100 : Math.max(5, (1 - card.breakEvenDays / 365) * 100))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-600">
                  <span>Cost: {formatCurrency(card.dailyHoldingCost)}/day</span>
                  <span className="flex items-center gap-1 text-slate-500 group-hover:text-brand-lime transition-colors">
                    Details <ArrowRight size={10} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ------- Card Analysis Tab -------
function CardAnalysisTab({
  selectedCardId,
  onSelectCard,
}: {
  selectedCardId: string;
  onSelectCard: (id: string) => void;
}) {
  const cards = useMemo(() => getPortfolioCards(), []);
  const analysis = useMemo(() => calculateBreakEven(selectedCardId)[0], [selectedCardId]);
  const costBreakdown = useMemo(() => getCostBreakdown(selectedCardId), [selectedCardId]);

  if (!analysis || !costBreakdown) return null;

  const stackedData = costBreakdown.costByCategory.map((c) => ({
    name: c.label.split(' (')[0],
    daily: parseFloat(c.dailyRate.toFixed(4)),
    monthly: parseFloat(c.monthlyRate.toFixed(2)),
  }));

  const cfg = STATUS_CONFIG[analysis.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Select Card</label>
        <select
          value={selectedCardId}
          onChange={(e) => onSelectCard(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-lime"
        >
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.playerName} - {c.cardName} ({c.grade})
            </option>
          ))}
        </select>
      </div>

      {/* Analysis Header */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-white">{analysis.playerName}</h3>
            <p className="text-sm text-slate-400">{analysis.cardName}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${cfg.bg} ${cfg.border} border`}>
            <StatusIcon size={14} className={cfg.color} />
            <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Purchase Price', value: formatCurrency(analysis.purchasePrice), sub: analysis.purchaseDate },
            { label: 'Current Value', value: formatCurrency(analysis.currentValue), sub: `${analysis.appreciationRate >= 0 ? '+' : ''}${(analysis.appreciationRate * 100).toFixed(1)}%` },
            { label: 'Break-Even In', value: analysis.isProfitable ? 'Now' : formatDays(analysis.breakEvenDays), sub: analysis.isProfitable ? 'Already profitable' : analysis.breakEvenDate },
            { label: 'ROI After Costs', value: `${analysis.roi >= 0 ? '+' : ''}${analysis.roi.toFixed(1)}%`, sub: formatCurrency(analysis.profitAfterCosts) },
          ].map((item) => (
            <div key={item.label} className="bg-slate-900/50 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</span>
              <p className="text-lg font-black text-white mt-0.5">{item.value}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Daily Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stackedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                formatter={(value: number) => [`$${value.toFixed(4)}`, 'Daily']}
              />
              <Bar dataKey="daily" fill="#a3e635" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Monthly Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={costBreakdown.costByCategory.filter((c) => c.dailyRate > 0).map((c, i) => ({
                  name: c.label.split(' (')[0],
                  value: parseFloat(c.monthlyRate.toFixed(2)),
                }))}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                paddingAngle={3}
              >
                {costBreakdown.costByCategory.filter((c) => c.dailyRate > 0).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                formatter={(value: number) => [`$${value.toFixed(2)}/mo`, '']}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Cost Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost Detail</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900/50">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Daily</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Monthly</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Type</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody>
            {costBreakdown.costByCategory.map((cost, i) => (
              <tr key={i} className="border-t border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-sm text-white font-medium">{cost.label}</td>
                <td className="px-4 py-3 text-sm text-slate-300 text-right font-mono">${cost.dailyRate.toFixed(4)}</td>
                <td className="px-4 py-3 text-sm text-slate-300 text-right font-mono">${cost.monthlyRate.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cost.isRecurring ? 'bg-blue-400/10 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                    {cost.isRecurring ? 'Recurring' : 'One-time'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{cost.description}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-brand-lime/30 bg-brand-lime/5">
              <td className="px-4 py-3 text-sm text-brand-lime font-black">TOTAL</td>
              <td className="px-4 py-3 text-sm text-brand-lime text-right font-mono font-bold">${costBreakdown.totalDailyCost.toFixed(4)}</td>
              <td className="px-4 py-3 text-sm text-brand-lime text-right font-mono font-bold">${(costBreakdown.totalDailyCost * 30).toFixed(2)}</td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Daily Gain vs Cost */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Daily Appreciation vs. Daily Cost</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Daily Appreciation</span>
              <span className={`text-sm font-bold ${analysis.dailyAppreciation >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                {analysis.dailyAppreciation >= 0 ? '+' : ''}{formatCurrency(analysis.dailyAppreciation)}
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-lime-400"
                style={{ width: `${Math.min(100, Math.max(0, (analysis.dailyAppreciation / (analysis.dailyAppreciation + analysis.dailyHoldingCost)) * 100))}%` }}
              />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-600">vs</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Daily Cost</span>
              <span className="text-sm font-bold text-red-400">-{formatCurrency(analysis.dailyHoldingCost)}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-red-400"
                style={{ width: `${Math.min(100, Math.max(0, (analysis.dailyHoldingCost / (analysis.dailyAppreciation + analysis.dailyHoldingCost)) * 100))}%` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Net Daily Gain</span>
          <p className={`text-2xl font-black ${analysis.netDailyGain >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
            {analysis.netDailyGain >= 0 ? '+' : ''}{formatCurrency(analysis.netDailyGain)}/day
          </p>
        </div>
      </div>
    </div>
  );
}

// ------- Cost Simulator Tab -------
function CostSimulatorTab({ selectedCardId }: { selectedCardId: string }) {
  const [storageTier, setStorageTier] = useState<string>('standard');
  const [insuranceLevel, setInsuranceLevel] = useState<string>('basic');
  const [opportunityRate, setOpportunityRate] = useState(7);

  const baseAnalysis = useMemo(() => calculateBreakEven(selectedCardId)[0], [selectedCardId]);
  const simAnalysis = useMemo(() => calculateBreakEven(selectedCardId, opportunityRate / 100)[0], [selectedCardId, opportunityRate]);

  const storageRates: Record<string, number> = { basic: 0.05, standard: 0.25, premium: 0.75, vault: 2.0 };
  const insuranceRates: Record<string, number> = { none: 0, basic: 0.01, full: 0.15, premium: 0.50 };

  const simDailyCost = (storageRates[storageTier] || 0.05) +
    ((simAnalysis?.currentValue || 0) / 100) * (insuranceRates[insuranceLevel] || 0) / 30 +
    ((simAnalysis?.purchasePrice || 0) * (opportunityRate / 100)) / 365 +
    (simAnalysis?.costBreakdown.gradingAmortizedPerDay || 0) +
    (simAnalysis?.costBreakdown.shippingAmortizedPerDay || 0) +
    (simAnalysis?.costBreakdown.platformFeesPerDay || 0);

  const simNetDaily = (simAnalysis?.dailyAppreciation || 0) - simDailyCost;
  const simBreakEvenDays = simNetDaily > 0 && simAnalysis
    ? Math.ceil(Math.max(0, simAnalysis.totalHoldingCosts - simAnalysis.appreciationTotal) / simNetDaily)
    : 9999;

  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const days = month * 30;
    const baseCumCost = (baseAnalysis?.dailyHoldingCost || 0) * days;
    const simCumCost = simDailyCost * days;
    const appreciation = (baseAnalysis?.dailyAppreciation || 0) * days;
    return {
      month: `Mo ${month}`,
      baseCost: parseFloat(baseCumCost.toFixed(2)),
      simCost: parseFloat(simCumCost.toFixed(2)),
      appreciation: parseFloat(appreciation.toFixed(2)),
    };
  });

  if (!baseAnalysis) return null;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-1">Simulating: {baseAnalysis.playerName}</h3>
        <p className="text-xs text-slate-500">{baseAnalysis.cardName}</p>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-brand-lime" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Tier</span>
          </div>
          <select
            value={storageTier}
            onChange={(e) => setStorageTier(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-lime mb-2"
          >
            <option value="basic">Basic ($0.05/day)</option>
            <option value="standard">Standard ($0.25/day)</option>
            <option value="premium">Premium ($0.75/day)</option>
            <option value="vault">Vault ($2.00/day)</option>
          </select>
          <p className="text-xs text-slate-500">Monthly: ${(storageRates[storageTier] * 30).toFixed(2)}</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-brand-lime" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Insurance Level</span>
          </div>
          <select
            value={insuranceLevel}
            onChange={(e) => setInsuranceLevel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-lime mb-2"
          >
            <option value="none">None ($0/day)</option>
            <option value="basic">Basic ($0.01/day per $100)</option>
            <option value="full">Full ($0.15/day per $100)</option>
            <option value="premium">Premium ($0.50/day per $100)</option>
          </select>
          <p className="text-xs text-slate-500">
            Monthly: ${(((baseAnalysis.currentValue / 100) * (insuranceRates[insuranceLevel] || 0) / 30) * 30).toFixed(2)}
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-brand-lime" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opportunity Cost Rate</span>
          </div>
          <input
            type="range"
            min={0}
            max={15}
            step={0.5}
            value={opportunityRate}
            onChange={(e) => setOpportunityRate(parseFloat(e.target.value))}
            className="w-full accent-brand-lime mb-2"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>0%</span>
            <span className="text-brand-lime font-bold">{opportunityRate}%</span>
            <span>15%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daily: ${((baseAnalysis.purchasePrice * (opportunityRate / 100)) / 365).toFixed(4)}
          </p>
        </div>
      </div>

      {/* Simulated Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Simulated Daily Cost',
            value: `$${simDailyCost.toFixed(4)}`,
            diff: simDailyCost - baseAnalysis.dailyHoldingCost,
          },
          {
            label: 'Net Daily Gain',
            value: `${simNetDaily >= 0 ? '+' : ''}$${simNetDaily.toFixed(4)}`,
            diff: simNetDaily - baseAnalysis.netDailyGain,
          },
          {
            label: 'Break-Even Time',
            value: formatDays(simBreakEvenDays),
            diff: baseAnalysis.breakEvenDays - simBreakEvenDays,
          },
          {
            label: 'Monthly Savings',
            value: `$${((baseAnalysis.dailyHoldingCost - simDailyCost) * 30).toFixed(2)}`,
            diff: (baseAnalysis.dailyHoldingCost - simDailyCost) * 30,
          },
        ].map((item) => (
          <div key={item.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
            <p className="text-lg font-black text-white mt-1">{item.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {item.diff > 0 ? (
                <ArrowUp size={12} className="text-lime-400" />
              ) : item.diff < 0 ? (
                <ArrowDown size={12} className="text-red-400" />
              ) : null}
              <span className={`text-xs font-bold ${item.diff > 0 ? 'text-lime-400' : item.diff < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {item.diff !== 0 ? `${item.diff > 0 ? '+' : ''}${typeof item.diff === 'number' && item.label.includes('Time') ? `${Math.abs(item.diff)}d faster` : `$${Math.abs(item.diff).toFixed(2)}`}` : 'No change'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Projection Chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">12-Month Cost Projection</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
            />
            <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
            <Area type="monotone" dataKey="appreciation" name="Appreciation" stroke="#a3e635" fill="#a3e635" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="baseCost" name="Current Cost" stroke="#f87171" fill="#f87171" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="simCost" name="Simulated Cost" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ------- Scenario Compare Tab -------
function ScenarioCompareTab({ selectedCardId }: { selectedCardId: string }) {
  const scenarios = useMemo(() => getVelocityScenarios(selectedCardId), [selectedCardId]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['current', 'minimal', 'downgrade-storage']);

  const toggleScenario = (id: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filtered = scenarios.filter((s) => selectedScenarios.includes(s.id));

  const comparisonData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const point: Record<string, string | number> = { month: `Mo ${month}` };
    filtered.forEach((s) => {
      point[s.name] = parseFloat((s.monthlyCost * month).toFixed(2));
    });
    return point;
  });

  const areaColors = ['#a3e635', '#60a5fa', '#facc15', '#f87171', '#c084fc', '#fb923c'];

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Scenarios to Compare</h3>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleScenario(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedScenarios.includes(s.id)
                  ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => {
          const isCurrent = s.id === 'current';
          return (
            <div
              key={s.id}
              className={`bg-slate-800/60 border rounded-xl p-5 ${
                isCurrent ? 'border-brand-lime/40' : 'border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-bold ${isCurrent ? 'text-brand-lime' : 'text-white'}`}>
                  {s.name}
                </h4>
                {isCurrent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-4">{s.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Break-Even</span>
                  <span className="text-white font-bold">{formatDays(s.breakEvenDays)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Monthly Cost</span>
                  <span className="text-white font-bold">${s.monthlyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Storage</span>
                  <span className="text-slate-300">{s.storageTier} (${s.storageDailyRate}/d)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Insurance</span>
                  <span className="text-slate-300">{s.insuranceLevel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Opp. Rate</span>
                  <span className="text-slate-300">{(s.opportunityCostRate * 100).toFixed(0)}%</span>
                </div>

                {!isCurrent && (
                  <div className={`mt-3 pt-3 border-t border-slate-700/50 flex justify-between text-sm`}>
                    <span className="text-slate-400">Monthly Savings</span>
                    <span className={`font-bold ${s.savingsVsBaseline > 0 ? 'text-lime-400' : s.savingsVsBaseline < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {s.savingsVsBaseline > 0 ? '+' : ''}{formatCurrency(s.savingsVsBaseline)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlay Chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Cumulative Cost Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
            />
            <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
            {filtered.map((s, i) => (
              <Area
                key={s.id}
                type="monotone"
                dataKey={s.name}
                stroke={areaColors[i % areaColors.length]}
                fill={areaColors[i % areaColors.length]}
                fillOpacity={0.08}
                strokeWidth={2}
                strokeDasharray={s.id === 'current' ? undefined : '5 5'}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ------- Optimization Tab -------
function OptimizationTab() {
  const analyses = useMemo(() => calculateBreakEven(), []);
  const summary = useMemo(() => getPortfolioBreakEvenSummary(), []);

  const recommendations = useMemo(() => {
    const recs: Array<{
      id: string;
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      impact: string;
      savings: number;
      affectedCards: string[];
    }> = [];

    // Find cards with expensive storage that could be downgraded
    const expensiveStorage = analyses.filter(
      (a) => a.costBreakdown.storageCostPerDay >= 0.75
    );
    if (expensiveStorage.length > 0) {
      const potentialSavings = expensiveStorage.reduce(
        (sum, a) => sum + (a.costBreakdown.storageCostPerDay - 0.25) * 30,
        0
      );
      recs.push({
        id: 'downgrade-storage',
        priority: 'high',
        title: 'Downgrade Storage on Non-Premium Cards',
        description: `${expensiveStorage.length} cards are in premium/vault storage. Consider standard storage for cards under $1,000 in value to reduce monthly overhead.`,
        impact: `Save ${formatCurrency(potentialSavings)}/month`,
        savings: potentialSavings,
        affectedCards: expensiveStorage.map((a) => a.playerName),
      });
    }

    // Cards losing value -- consider selling
    const losingCards = analyses.filter((a) => a.status === 'losing');
    if (losingCards.length > 0) {
      const bleedPerMonth = losingCards.reduce((sum, a) => sum + Math.abs(a.netDailyGain) * 30, 0);
      recs.push({
        id: 'sell-losers',
        priority: 'high',
        title: 'Consider Selling Depreciating Cards',
        description: `${losingCards.length} cards are losing value after costs. Holding these cards costs you ${formatCurrency(bleedPerMonth)}/month. Consider selling to redeploy capital.`,
        impact: `Stop bleeding ${formatCurrency(bleedPerMonth)}/month`,
        savings: bleedPerMonth,
        affectedCards: losingCards.map((a) => a.playerName),
      });
    }

    // Over-insured low-value cards
    const overInsured = analyses.filter(
      (a) => a.costBreakdown.insuranceCostPerDay > 0.05 && a.currentValue < 500
    );
    if (overInsured.length > 0) {
      const insSavings = overInsured.reduce(
        (sum, a) => sum + a.costBreakdown.insuranceCostPerDay * 30,
        0
      );
      recs.push({
        id: 'reduce-insurance',
        priority: 'medium',
        title: 'Reduce Insurance on Low-Value Cards',
        description: `${overInsured.length} cards under $500 have full or premium insurance. Basic coverage or self-insuring these cards would reduce costs.`,
        impact: `Save up to ${formatCurrency(insSavings)}/month`,
        savings: insSavings,
        affectedCards: overInsured.map((a) => a.playerName),
      });
    }

    // Batch grading suggestion
    const ungradedWithValue = analyses.filter(
      (a) => a.costBreakdown.gradingAmortizedPerDay === 0 && a.currentValue > 50
    );
    if (ungradedWithValue.length > 0) {
      recs.push({
        id: 'batch-grade',
        priority: 'medium',
        title: 'Batch Grade Raw Cards for Value Uplift',
        description: `${ungradedWithValue.length} raw cards could benefit from grading. Batch submission reduces per-card grading costs and can increase value 30-200%.`,
        impact: 'Potential 30-200% value increase',
        savings: 0,
        affectedCards: ungradedWithValue.map((a) => a.playerName),
      });
    }

    // Opportunity cost awareness
    const highCapital = analyses.filter((a) => a.purchasePrice > 1000 && a.costBreakdown.opportunityCostPerDay > 0.5);
    if (highCapital.length > 0) {
      const oppCost = highCapital.reduce((sum, a) => sum + a.costBreakdown.opportunityCostPerDay * 30, 0);
      recs.push({
        id: 'opportunity-cost',
        priority: 'low',
        title: 'High Opportunity Cost on Slow Movers',
        description: `${highCapital.length} high-value cards have significant opportunity cost (${formatCurrency(oppCost)}/month). Ensure these cards are appreciating faster than your alternative investments.`,
        impact: `${formatCurrency(oppCost)}/month in opportunity cost`,
        savings: 0,
        affectedCards: highCapital.map((a) => a.playerName),
      });
    }

    // Consolidate shipping
    recs.push({
      id: 'consolidate-shipping',
      priority: 'low',
      title: 'Consolidate Future Shipments',
      description: 'When buying or moving cards, batch shipments together. Current amortized shipping costs across the portfolio could be reduced 40-60% with consolidation.',
      impact: 'Save 40-60% on shipping',
      savings: analyses.reduce((sum, a) => sum + a.costBreakdown.shippingAmortizedPerDay * 30 * 0.5, 0),
      affectedCards: [],
    });

    return recs.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [analyses]);

  const totalPotentialSavings = recommendations.reduce((sum, r) => sum + r.savings, 0);

  const priorityColors = {
    high: { bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-400/30' },
    medium: { bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/30' },
    low: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/30' },
  };

  return (
    <div className="space-y-6">
      {/* Savings Summary */}
      <div className="bg-slate-800/60 border border-brand-lime/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-lime/10 rounded-lg">
            <Zap size={20} className="text-brand-lime" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Optimization Potential</h3>
            <p className="text-xs text-slate-500">{recommendations.length} actionable recommendations found</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Monthly Savings</span>
            <p className="text-xl font-black text-brand-lime">{formatCurrency(totalPotentialSavings)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Annual Savings</span>
            <p className="text-xl font-black text-brand-lime">{formatCurrency(totalPotentialSavings * 12)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Current Monthly Cost</span>
            <p className="text-xl font-black text-yellow-400">{formatCurrency(summary.monthlyPortfolioCost)}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const pColor = priorityColors[rec.priority];
          return (
            <div
              key={rec.id}
              className={`bg-slate-800/60 border ${pColor.border} rounded-xl p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${pColor.bg} mt-0.5`}>
                    <Lightbulb size={16} className={pColor.text} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${pColor.bg} ${pColor.text} border ${pColor.border} whitespace-nowrap`}>
                  {rec.priority.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-brand-lime" />
                  <span className="text-sm font-bold text-brand-lime">{rec.impact}</span>
                </div>
                {rec.affectedCards.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>Affects:</span>
                    <span className="text-slate-400">
                      {rec.affectedCards.slice(0, 3).join(', ')}
                      {rec.affectedCards.length > 3 && ` +${rec.affectedCards.length - 3} more`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Move All to Basic Storage', desc: 'Reduce storage costs across entire portfolio', icon: <Package size={16} /> },
            { label: 'Remove Insurance on Sub-$300 Cards', desc: 'Self-insure low-value holdings', icon: <Shield size={16} /> },
            { label: 'Submit Batch Grading Order', desc: 'Grade all raw cards at bulk rate', icon: <BarChart3 size={16} /> },
            { label: 'Generate Sell Report for Losers', desc: 'Create report of cards to consider selling', icon: <TrendingDown size={16} /> },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg hover:border-brand-lime/40 hover:bg-slate-900 transition-all text-left group"
            >
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-brand-lime transition-colors">
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-brand-lime transition-colors">{action.label}</p>
                <p className="text-xs text-slate-500">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ------- Main Component -------
const BreakEvenVelocity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedCardId, setSelectedCardId] = useState('bev-001');

  const analyses = useMemo(() => calculateBreakEven(), []);

  const handleSelectCard = (id: string) => {
    setSelectedCardId(id);
    setActiveTab('analysis');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
            <Timer className="text-brand-lime" size={32} />
            Break-Even Velocity Calculator
          </h1>
          <p className="text-slate-400">
            Break-even <span className="text-brand-lime font-bold">time</span>, not just price. Factor holding costs, opportunity cost, insurance, and storage per day.
          </p>
        </div>
        <div className="px-4 py-2 bg-brand-lime/10 text-brand-lime text-xs font-black uppercase tracking-widest rounded-xl border border-brand-lime/20">
          Live Analysis
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/50 border border-slate-800 rounded-xl p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <PortfolioOverviewTab analyses={analyses} onSelectCard={handleSelectCard} />
      )}
      {activeTab === 'analysis' && (
        <CardAnalysisTab selectedCardId={selectedCardId} onSelectCard={setSelectedCardId} />
      )}
      {activeTab === 'simulator' && (
        <CostSimulatorTab selectedCardId={selectedCardId} />
      )}
      {activeTab === 'compare' && (
        <ScenarioCompareTab selectedCardId={selectedCardId} />
      )}
      {activeTab === 'optimization' && <OptimizationTab />}
    </div>
  );
};

export default BreakEvenVelocity;
