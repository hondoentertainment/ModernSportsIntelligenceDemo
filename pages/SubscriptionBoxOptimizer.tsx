import React, { useState, useEffect, useMemo } from 'react';
import { Package, TrendingUp, DollarSign, Star, AlertTriangle, CheckCircle, BarChart3, Layers, Target } from 'lucide-react';
import {
  getUpcomingBoxes,
  getPullOddsProfile,
  getCollectionGapMatches,
  getBudgetAllocation,
  getHistoricalPerformance,
  type UpcomingBox,
  type PullOddsProfile,
  type CollectionGapMatch,
  type BudgetAllocation,
  type BoxHistoricalPerformance,
} from '../lib/subscriptionBoxOptimizerService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399', '#22d3ee', '#fb923c'];

const recoBadge = (r: string) => {
  const map: Record<string, string> = {
    'strong buy': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    buy: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    neutral: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    avoid: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };
  return map[r] ?? 'bg-slate-500/20 text-slate-400';
};

const sportBadge = (sport: string) => {
  const map: Record<string, string> = {
    Baseball: 'bg-blue-500/10 text-blue-400',
    Basketball: 'bg-orange-500/10 text-orange-400',
    Football: 'bg-green-500/10 text-green-400',
    Hockey: 'bg-cyan-500/10 text-cyan-400',
  };
  return map[sport] ?? 'bg-slate-500/10 text-slate-400';
};

const SubscriptionBoxOptimizer: React.FC = () => {
  const [boxes, setBoxes] = useState<UpcomingBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string>('box-001');
  const [pullProfile, setPullProfile] = useState<PullOddsProfile | null>(null);
  const [gapMatches, setGapMatches] = useState<CollectionGapMatch[]>([]);
  const [budget, setBudget] = useState<BudgetAllocation | null>(null);
  const [history, setHistory] = useState<BoxHistoricalPerformance[]>([]);
  const [budgetInput, setBudgetInput] = useState<number>(1000);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allBoxes = getUpcomingBoxes();
      setBoxes(allBoxes);
      setSelectedBoxId(allBoxes[0]?.id ?? 'box-001');
      setGapMatches(getCollectionGapMatches());
      setBudget(getBudgetAllocation());
      setHistory(getHistoricalPerformance());
      setLoading(false);
    } catch {
      setError('Failed to load Subscription Box Optimizer data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedBoxId) {
      const profile = getPullOddsProfile(selectedBoxId);
      setPullProfile(profile ?? null);
    }
  }, [selectedBoxId]);

  const showToast = (boxName: string) => {
    setToast(`Added "${boxName}" to your box queue!`);
    setTimeout(() => setToast(null), 3000);
  };

  const radarData = useMemo(() => {
    if (!pullProfile) return [];
    return [
      { metric: 'Auto ROI', value: Math.max(0, pullProfile.autoROI) },
      { metric: 'Rookie ROI', value: Math.max(0, pullProfile.rookieROI) },
      { metric: 'Holo ROI', value: Math.max(0, pullProfile.holoROI) },
      { metric: 'Base ROI', value: Math.max(0, pullProfile.baseROI) },
    ];
  }, [pullProfile]);

  const historyChartData = useMemo(
    () =>
      history.map(h => ({
        month: h.month.slice(0, 7),
        roi: h.buyersROI,
        name: h.boxName,
      })),
    [history],
  );

  const totalExpectedReturn = useMemo(
    () => (budget ? budget.allocations.reduce((sum, a) => sum + a.expectedReturn, 0) : 0),
    [budget],
  );

  const totalAllocated = useMemo(
    () => (budget ? budget.allocations.reduce((sum, a) => sum + a.totalCost, 0) : 0),
    [budget],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Subscription Box Optimizer...</p>
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
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg font-medium text-sm animate-pulse">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <Package size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Subscription Box Forward Optimizer</h1>
            <p className="text-sm text-slate-400">
              Forward-looking box ROI optimizer — pull rate projections, collection gap analysis &amp; budget allocation
            </p>
          </div>
        </div>
      </div>

      {/* Budget Input + Expected Return */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-brand-lime" />
          Budget Optimizer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
              Monthly Box Budget: <span className="text-brand-lime font-bold">${budgetInput.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={200}
              max={5000}
              step={50}
              value={budgetInput}
              onChange={e => setBudgetInput(Number(e.target.value))}
              className="w-full accent-emerald-400 h-2 rounded-full"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>$200</span>
              <span>$5,000</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Expected Return</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${Math.round(totalExpectedReturn * (budgetInput / totalAllocated)).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Projected ROI</p>
              <p className="text-2xl font-bold text-blue-400">
                {Math.round(((totalExpectedReturn - totalAllocated) / totalAllocated) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Boxes */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Star size={18} className="text-amber-400" />
          Recommended Upcoming Boxes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {boxes.map((box, idx) => (
            <div
              key={box.id}
              onClick={() => setSelectedBoxId(box.id)}
              className={`bg-slate-900/50 border rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors ${
                selectedBoxId === box.id ? 'border-emerald-500/50' : 'border-slate-700/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${sportBadge(box.sport)}`}>{box.sport}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${recoBadge(box.recommendation)}`}>
                  {box.recommendation.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-bold text-white mb-1 leading-tight">{box.name}</p>
              <p className="text-[10px] text-slate-500 mb-3">{box.manufacturer} &middot; Releases {box.releaseDate}</p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500">Price</p>
                  <p className="text-xs font-bold text-white">${box.price}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500">Expected ROI</p>
                  <p className={`text-xs font-bold ${box.expectedROI >= 30 ? 'text-emerald-400' : box.expectedROI >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                    {box.expectedROI > 0 ? '+' : ''}{box.expectedROI}%
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500">Fit Score</p>
                  <p className={`text-xs font-bold ${box.collectionFitScore >= 75 ? 'text-emerald-400' : box.collectionFitScore >= 50 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {box.collectionFitScore}/100
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-[9px] text-slate-500 mb-1">Key Rookies</p>
                <div className="flex flex-wrap gap-1">
                  {box.keyRookies.slice(0, 2).map((r, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-slate-700/50 text-slate-300 rounded">
                      {r}
                    </span>
                  ))}
                  {box.keyRookies.length > 2 && (
                    <span className="text-[9px] text-slate-500">+{box.keyRookies.length - 2} more</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[9px] text-slate-500">Spots Left</p>
                  <p className="text-xs text-slate-300">
                    {box.spotsAvailable}/{box.spotsTotal}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500">Confidence</p>
                  <p className={`text-xs font-bold ${box.confidence >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {box.confidence}%
                  </p>
                </div>
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-1 mb-3">
                <div
                  className="bg-emerald-400 h-1 rounded-full"
                  style={{ width: `${Math.round((1 - box.spotsAvailable / box.spotsTotal) * 100)}%` }}
                />
              </div>

              <button
                onClick={e => {
                  e.stopPropagation();
                  showToast(box.name);
                }}
                className="w-full py-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors"
              >
                Join Box
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pull Odds Visualization */}
      {pullProfile && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
            <Target size={18} className="text-purple-400" />
            Pull Odds Profile
          </h2>
          <p className="text-xs text-slate-500 mb-4">{pullProfile.boxName}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Radar
                    name="ROI"
                    dataKey="value"
                    stroke="#a78bfa"
                    fill="#a78bfa"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'Est. ROI']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 content-start">
              {[
                { label: 'Avg Box Value', value: `$${pullProfile.avgBoxValue.toLocaleString()}`, color: 'text-emerald-400' },
                { label: 'Median Box Value', value: `$${pullProfile.medianBoxValue.toLocaleString()}`, color: 'text-blue-400' },
                { label: 'Best Case Value', value: `$${pullProfile.bestCaseValue.toLocaleString()}`, color: 'text-amber-400' },
                { label: 'Worst Case Value', value: `$${pullProfile.worstCaseValue.toLocaleString()}`, color: 'text-red-400' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
              <div className="col-span-2 grid grid-cols-2 gap-2 mt-1">
                {[
                  { label: 'Auto ROI', val: pullProfile.autoROI, color: 'text-purple-400' },
                  { label: 'Rookie ROI', val: pullProfile.rookieROI, color: 'text-blue-400' },
                  { label: 'Holo ROI', val: pullProfile.holoROI, color: 'text-amber-400' },
                  { label: 'Base ROI', val: pullProfile.baseROI, color: 'text-slate-400' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 border border-slate-700/20 rounded-lg">
                    <span className="text-[10px] text-slate-500">{item.label}</span>
                    <span className={`text-xs font-bold ${item.color}`}>
                      {item.val > 0 ? '+' : ''}{item.val.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collection Gap Matcher */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          Collection Gap Matcher
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gapMatches.map((gap, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4">
              <p className="text-sm font-bold text-white mb-2">{gap.boxName}</p>
              <div className="mb-3">
                <p className="text-[10px] text-slate-500 mb-1">Gap Cards Filled</p>
                <div className="flex flex-wrap gap-1">
                  {gap.gapCards.map((card, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                      {card}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[9px] text-slate-500">Fill Probability</p>
                  <p className={`text-xs font-bold ${gap.gapFillProbability >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {gap.gapFillProbability}%
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500">Current Gap Value</p>
                  <p className="text-xs font-bold text-slate-300">${gap.currentGapValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500">After Box Expected</p>
                  <p className="text-xs font-bold text-emerald-400">${gap.afterBoxExpectedValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Allocation Table */}
      {budget && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-amber-400" />
            Optimal Budget Allocation
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Priority</th>
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Box</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Spots</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Total Cost</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Expected Return</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3">ROI</th>
                </tr>
              </thead>
              <tbody>
                {budget.allocations.map((alloc, idx) => (
                  <tr key={idx} className="border-b border-slate-700/20">
                    <td className="py-3 pr-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                        {alloc.priority}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="text-sm font-bold text-white">{alloc.boxName}</p>
                    </td>
                    <td className="py-3 pr-3 text-right text-sm text-slate-300">{alloc.spots}</td>
                    <td className="py-3 pr-3 text-right text-sm font-bold text-white">${alloc.totalCost.toLocaleString()}</td>
                    <td className="py-3 pr-3 text-right text-sm font-bold text-emerald-400">${alloc.expectedReturn.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-bold text-amber-400">
                        +{Math.round(((alloc.expectedReturn - alloc.totalCost) / alloc.totalCost) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="pt-3 pr-3 text-right text-xs text-slate-500 font-bold uppercase">Totals</td>
                  <td className="pt-3 pr-3 text-right text-sm font-bold text-white">${totalAllocated.toLocaleString()}</td>
                  <td className="pt-3 pr-3 text-right text-sm font-bold text-emerald-400">${totalExpectedReturn.toLocaleString()}</td>
                  <td className="pt-3 text-right">
                    <span className="text-sm font-bold text-amber-400">
                      +{Math.round(((totalExpectedReturn - totalAllocated) / totalAllocated) * 100)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Performance BarChart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400" />
          Historical Box Performance (Past 6 Months)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyChartData}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: number) => [`${val}%`, 'Buyers ROI']}
                labelFormatter={(_: string, payload: Array<{ payload: { name: string } }>) => payload?.[0]?.payload?.name ?? ''}
              />
              <Bar dataKey="roi" name="Buyers ROI" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-3">Box</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-3">Month</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-3">Buyers ROI</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-3">Best Pull</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => (
                <tr key={idx} className="border-b border-slate-700/20">
                  <td className="py-2 pr-3 text-sm text-white font-medium">{h.boxName}</td>
                  <td className="py-2 pr-3 text-xs text-slate-400">{h.month}</td>
                  <td className="py-2 pr-3 text-right">
                    <span className={`text-sm font-bold ${h.buyersROI >= 30 ? 'text-emerald-400' : h.buyersROI >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                      +{h.buyersROI}%
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-xs text-slate-300">{h.bestPull}</td>
                  <td className="py-2 text-right text-sm font-bold text-amber-400">${h.bestPullValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBoxOptimizer;
