import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  AlertTriangle,
  Target,
  Trophy,
  Search,
  CheckCircle2,
  Clock,
  Star,
  Package,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  getSetRegistry,
  getMissingCards,
  getCompletionStats,
  getSetChallenges,
  getMilestones,
  getCategoryBreakdown,
  getSummaryStats,
  formatCurrency,
  formatDate,
  type SetEntry,
  type MissingCard,
  type CompletionStat,
  type SetChallenge,
  type Milestone,
  type CategoryBreakdown,
  type SetRegistrySummary,
} from '../lib/setRegistryService';
import {
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

const CATEGORY_COLORS: Record<string, string> = {
  base: '#3b82f6',
  inserts: '#a855f7',
  parallels: '#22c55e',
  autographs: '#ef4444',
  memorabilia: '#f59e0b',
  rookies: '#06b6d4',
  short_prints: '#ec4899',
};

const SetRegistry: React.FC = () => {
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [missingCards, setMissingCards] = useState<MissingCard[]>([]);
  const [completionStats, setCompletionStats] = useState<CompletionStat[]>([]);
  const [challenges, setChallenges] = useState<SetChallenge[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [summary, setSummary] = useState<SetRegistrySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSets(getSetRegistry());
      setMissingCards(getMissingCards());
      setCompletionStats(getCompletionStats());
      setChallenges(getSetChallenges());
      setMilestones(getMilestones());
      setCategories(getCategoryBreakdown());
      setSummary(getSummaryStats());
      setLoading(false);
    } catch  {
      setError('Failed to load Set Registry data');
      setLoading(false);
    }
  }, []);

  const totalSetsValue = useMemo(() => sets.reduce((s, set) => s + set.totalValue, 0), [sets]);
  const avgCompletion = useMemo(() => sets.length > 0 ? sets.reduce((s, set) => s + set.completionPct, 0) / sets.length : 0, [sets]);
  const totalMissing = useMemo(() => sets.reduce((s, set) => s + set.missingCount, 0), [sets]);

  const completionChartData = useMemo(() => {
    return completionStats.map(cs => ({
      set: cs.setName.length > 18 ? cs.setName.slice(0, 18) + '...' : cs.setName,
      completion: cs.completionPct,
      value: cs.setValue,
    }));
  }, [completionStats]);

  const categoryPieData = useMemo(() => {
    return categories.map(c => ({
      name: c.category,
      value: c.cardCount,
      color: CATEGORY_COLORS[c.category.toLowerCase()] || '#64748b',
    }));
  }, [categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Set Registry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <LayoutGrid size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Set Registry &amp; Completion Tracker</h1>
            <p className="text-sm text-slate-400">Track set completion progress, missing cards, and milestones &mdash; Phase 151</p>
          </div>
        </div>
        {summary && (
          <span className="px-3 py-1.5 text-sm font-bold bg-blue-500/20 text-blue-300 rounded-full">
            {summary.totalSets} Sets Tracked
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Sets</p>
          <p className="text-2xl font-bold text-white">{summary?.totalSets ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">In registry</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Completion</p>
          <p className="text-2xl font-bold text-blue-400">{avgCompletion.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Cards</p>
          <p className="text-2xl font-bold text-emerald-400">{summary?.totalCards ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">Collected</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Missing Cards</p>
          <p className="text-2xl font-bold text-amber-400">{totalMissing}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Collection Value</p>
          <p className="text-2xl font-bold text-violet-400">{formatCurrency(totalSetsValue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Completed Sets</p>
          <p className="text-2xl font-bold text-emerald-400">{summary?.completedSets ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">100% done</p>
        </div>
      </div>

      {/* Set Completion Progress Bars */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Target size={18} className="text-blue-400" />
          Set Completion Progress
        </h2>
        <div className="space-y-3">
          {sets.map(set => (
            <div key={set.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-white">{set.name}</p>
                  <p className="text-[10px] text-slate-500">{set.year} &middot; {set.sport} &middot; {set.manufacturer}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${set.completionPct === 100 ? 'text-emerald-400' : set.completionPct >= 75 ? 'text-blue-400' : set.completionPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {set.completionPct.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-500">{set.ownedCount}/{set.totalCards} cards</p>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full mb-2">
                <div
                  className={`h-full rounded-full transition-all ${set.completionPct === 100 ? 'bg-emerald-500' : set.completionPct >= 75 ? 'bg-blue-500' : set.completionPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${set.completionPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Missing: <span className="text-amber-400 font-bold">{set.missingCount}</span> cards</span>
                <span>Value: <span className="text-emerald-400 font-bold">{formatCurrency(set.totalValue)}</span></span>
                <span>Est. to complete: <span className="text-blue-400 font-bold">{formatCurrency(set.estimatedCostToComplete)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Set Registry Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <LayoutGrid size={18} className="text-brand-lime" />
          Set Registry Grid
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map(set => (
            <div key={set.id} className={`bg-slate-900/50 border rounded-xl p-4 ${set.completionPct === 100 ? 'border-emerald-500/30' : 'border-slate-700/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${set.completionPct === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {set.completionPct === 100 ? 'Complete' : `${set.completionPct.toFixed(0)}%`}
                </span>
                {set.completionPct === 100 && <CheckCircle2 size={14} className="text-emerald-400" />}
              </div>
              <p className="text-sm font-bold text-white mb-1">{set.name}</p>
              <p className="text-[10px] text-slate-500 mb-3">{set.year} &middot; {set.totalCards} total cards</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-[10px] text-slate-500">Owned</p>
                  <p className="text-xs font-bold text-emerald-400">{set.ownedCount}</p>
                </div>
                <div className="p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-[10px] text-slate-500">Missing</p>
                  <p className="text-xs font-bold text-amber-400">{set.missingCount}</p>
                </div>
                <div className="p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-[10px] text-slate-500">Value</p>
                  <p className="text-xs font-bold text-blue-400">{formatCurrency(set.totalValue)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BarChart Completion by Set + PieChart Cards by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-lime" />
            Completion by Set
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="set" tick={{ fontSize: 9, fill: '#64748b' }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number, name: string) => [name === 'completion' ? `${value}%` : formatCurrency(value)]} />
                <Bar dataKey="completion" fill="#3b82f6" name="Completion %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Package size={18} className="text-violet-400" />
            Cards by Category
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryPieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Missing Cards Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Search size={18} className="text-amber-400" />
          Missing Cards &mdash; Prices &amp; Availability
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Card</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Set</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Number</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Lowest Price</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Avg Price</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Listings</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Availability</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {missingCards.map(card => (
                <tr key={card.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 px-3 text-white font-medium">{card.name}</td>
                  <td className="py-2 px-3 text-slate-400">{card.setName}</td>
                  <td className="py-2 px-3 text-slate-300">#{card.cardNumber}</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold">{formatCurrency(card.lowestPrice)}</td>
                  <td className="py-2 px-3 text-right text-blue-400">{formatCurrency(card.avgPrice)}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{card.activeListings}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${card.availability === 'high' ? 'bg-emerald-500/20 text-emerald-400' : card.availability === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {card.availability}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${card.priority === 'high' ? 'bg-red-500/20 text-red-400' : card.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {card.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Challenges + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Set Challenges */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-amber-400" />
            Set Challenges
          </h2>
          <div className="space-y-3">
            {challenges.map(challenge => (
              <div key={challenge.id} className={`bg-slate-900/50 border rounded-xl p-4 ${challenge.status === 'completed' ? 'border-emerald-500/30' : challenge.status === 'in_progress' ? 'border-blue-500/30' : 'border-slate-700/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{challenge.name}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${challenge.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : challenge.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {challenge.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{challenge.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full">
                    <div
                      className={`h-full rounded-full ${challenge.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${challenge.progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">{challenge.progressPct}%</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Reward: <span className="text-amber-400 font-bold">{challenge.reward}</span></span>
                  {challenge.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} className="text-slate-500" />
                      {formatDate(challenge.deadline)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Award size={18} className="text-violet-400" />
            Milestones Timeline
          </h2>
          <div className="space-y-4">
            {milestones.map((milestone, idx) => (
              <div key={milestone.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${milestone.achieved ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
                    {milestone.achieved ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <Star size={16} className="text-slate-500" />
                    )}
                  </div>
                  {idx < milestones.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-1 ${milestone.achieved ? 'bg-emerald-500/30' : 'bg-slate-700/30'}`} />
                  )}
                </div>
                <div className={`flex-1 pb-4 ${!milestone.achieved ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-white">{milestone.title}</p>
                    {milestone.achievedDate && (
                      <span className="text-[10px] text-slate-500">{formatDate(milestone.achievedDate)}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{milestone.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">Reward: <span className="text-amber-400 font-bold">{milestone.reward}</span></span>
                    <span className={`text-[10px] font-bold ${milestone.achieved ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {milestone.achieved ? 'Achieved' : 'Locked'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetRegistry;
