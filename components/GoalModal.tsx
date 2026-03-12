import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Target,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Clock,
  Flag,
  DollarSign,
  BarChart3,
  Trophy,
  Zap,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CardInventory } from '../types';
import {
  CollectionGoal,
  GoalType,
  GoalMilestone,
  GapAnalysis,
  GoalTemplate,
  ArchetypeId,
  TrackingStatus,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  refreshGoals,
  analyzeGap,
  getMilestonesForGoal,
  getSnapshotsForGoal,
  generateDemoSnapshots,
  getGoalTemplates,
  applyTemplate,
  formatGoalValue,
  formatCurrency,
  getTrackingColor,
  getTrackingLabel,
  GOAL_TYPE_LABELS,
  GOAL_TYPE_UNITS,
} from '../lib/goalPlannerService';

// ---- Props ----

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

// ---- Tab config ----

type TabId = 'goals' | 'progress' | 'gap_analysis' | 'templates';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'goals', label: 'My Goals', icon: <Flag size={16} /> },
  { id: 'progress', label: 'Progress', icon: <BarChart3 size={16} /> },
  { id: 'gap_analysis', label: 'Gap Analysis', icon: <TrendingUp size={16} /> },
  { id: 'templates', label: 'Templates', icon: <Layers size={16} /> },
];

const GOAL_TYPES: { id: GoalType; label: string; icon: React.ReactNode }[] = [
  { id: 'portfolio_value', label: 'Portfolio Value', icon: <DollarSign size={16} /> },
  { id: 'card_count', label: 'Card Count', icon: <Layers size={16} /> },
  { id: 'sport_diversification', label: 'Sport Diversification', icon: <Users size={16} /> },
  { id: 'roi_target', label: 'ROI Target', icon: <TrendingUp size={16} /> },
  { id: 'set_completion', label: 'Set Completion', icon: <Trophy size={16} /> },
];

const STATUS_ICONS: Record<TrackingStatus, React.ReactNode> = {
  ahead: <TrendingUp size={14} />,
  on_track: <CheckCircle2 size={14} />,
  behind: <AlertTriangle size={14} />,
};

// ---- Helpers ----

function daysRemaining(targetDate: string): number {
  return Math.max(0, Math.round((new Date(targetDate).getTime() - Date.now()) / 86400000));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---- Create Goal Form ----

const CreateGoalForm: React.FC<{
  cards: CardInventory[];
  onCreated: () => void;
}> = ({ cards, onCreated }) => {
  const [type, setType] = useState<GoalType>('portfolio_value');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleCreate = useCallback(() => {
    if (!title.trim() || !targetValue || !targetDate) return;
    createGoal(type, title.trim(), description.trim(), Number(targetValue), targetDate, cards);
    setTitle('');
    setDescription('');
    setTargetValue('');
    setTargetDate('');
    onCreated();
  }, [type, title, description, targetValue, targetDate, cards, onCreated]);

  return (
    <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4">
      <h4 className="text-sm font-bold text-white flex items-center gap-2">
        <Plus size={16} className="text-emerald-400" />
        Create New Goal
      </h4>

      {/* Goal type selector */}
      <div className="flex flex-wrap gap-2">
        {GOAL_TYPES.map(gt => (
          <button
            key={gt.id}
            onClick={() => setType(gt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              type === gt.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-white'
            }`}
          >
            {gt.icon}
            {gt.label}
          </button>
        ))}
      </div>

      {/* Title & description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Goal title"
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Target value & date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="number"
            value={targetValue}
            onChange={e => setTargetValue(e.target.value)}
            placeholder={`Target (${GOAL_TYPE_UNITS[type]})`}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <input
          type="date"
          value={targetDate}
          onChange={e => setTargetDate(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={!title.trim() || !targetValue || !targetDate}
        className="w-full py-2.5 bg-emerald-500/20 text-emerald-400 font-bold text-sm rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Create Goal
      </button>
    </div>
  );
};

// ---- Goal Card ----

const GoalCard: React.FC<{
  goal: CollectionGoal;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ goal, onSelect, onDelete }) => {
  const colors = getTrackingColor(goal.trackingStatus);
  const days = daysRemaining(goal.targetDate);

  return (
    <div
      className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3 hover:border-slate-600 transition-colors cursor-pointer"
      onClick={() => onSelect(goal.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
            {STATUS_ICONS[goal.trackingStatus]}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{goal.title}</h4>
            <p className="text-[10px] text-slate-500 uppercase font-bold">
              {GOAL_TYPE_LABELS[goal.type]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${colors.text} ${colors.bg} ${colors.border}`}>
            {getTrackingLabel(goal.trackingStatus)}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(goal.id); }}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">
            {formatGoalValue(goal.type, goal.currentValue)}
          </span>
          <span className="text-xs font-mono text-white">
            {formatGoalValue(goal.type, goal.targetValue)}
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${goal.progress}%`,
              background: goal.trackingStatus === 'ahead'
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : goal.trackingStatus === 'on_track'
                ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                : 'linear-gradient(90deg, #ef4444, #f87171)',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-slate-500 font-bold">{goal.progress}%</span>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Clock size={10} />
            {days} days left
          </div>
        </div>
      </div>

      {goal.status === 'completed' && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Goal Completed</span>
        </div>
      )}
    </div>
  );
};

// ---- Goals Tab ----

const GoalsTab: React.FC<{
  goals: CollectionGoal[];
  cards: CardInventory[];
  onSelect: (id: string) => void;
  onRefresh: () => void;
}> = ({ goals, cards, onSelect, onRefresh }) => {
  const handleDelete = useCallback((id: string) => {
    deleteGoal(id);
    onRefresh();
  }, [onRefresh]);

  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      <CreateGoalForm cards={cards} onCreated={onRefresh} />

      {active.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Goals ({active.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {active.map(g => (
              <GoalCard key={g.id} goal={g} onSelect={onSelect} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Completed ({completed.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completed.map(g => (
              <GoalCard key={g.id} goal={g} onSelect={onSelect} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Target size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm">No goals yet. Create one above or use a template.</p>
        </div>
      )}

      {/* Achievement integration callout */}
      {goals.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl">
          <Trophy size={18} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-400">Achievement Integration</p>
            <p className="text-[10px] text-slate-400">
              Completing goals unlocks achievements in your Phase 37 Achievement Tracker.
              {completed.length >= 1 ? ' You\'ve earned "Goal Completer"!' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Progress Tab ----

const ProgressTab: React.FC<{
  goals: CollectionGoal[];
  selectedGoalId: string | null;
  onSelectGoal: (id: string) => void;
}> = ({ goals, selectedGoalId, onSelectGoal }) => {
  const activeGoals = goals.filter(g => g.status === 'active');
  const selected = selectedGoalId
    ? goals.find(g => g.id === selectedGoalId) ?? activeGoals[0]
    : activeGoals[0];

  const snapshots = useMemo(() => {
    if (!selected) return [];
    const stored = getSnapshotsForGoal(selected.id);
    return stored.length >= 3 ? stored : generateDemoSnapshots(selected);
  }, [selected]);

  const milestones = useMemo(() => {
    if (!selected) return [];
    return getMilestonesForGoal(selected.id);
  }, [selected]);

  const chartData = useMemo(() => {
    return snapshots.map(s => ({
      date: s.date.slice(5),
      actual: Math.round(s.value),
      projected: Math.round(s.projectedValue),
    }));
  }, [snapshots]);

  if (!selected) {
    return (
      <div className="text-center py-12 text-slate-500">
        <BarChart3 size={40} className="mx-auto mb-3 text-slate-600" />
        <p className="text-sm">Create a goal to see progress charts.</p>
      </div>
    );
  }

  const colors = getTrackingColor(selected.trackingStatus);

  return (
    <div className="space-y-6">
      {/* Goal selector */}
      {activeGoals.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {activeGoals.map(g => (
            <button
              key={g.id}
              onClick={() => onSelectGoal(g.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                g.id === selected.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-white'
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>
      )}

      {/* Progress chart */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white">{selected.title}</h4>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${colors.text} ${colors.bg} ${colors.border}`}>
            {getTrackingLabel(selected.trackingStatus)}
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="goalActualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 10 }}
                width={60}
                tickFormatter={v =>
                  selected.type === 'portfolio_value'
                    ? `$${(v / 1000).toFixed(0)}K`
                    : String(v)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <ReferenceLine
                y={selected.targetValue}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: 'Target', fill: '#f59e0b', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#goalActualGrad)"
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Ideal Pace"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar size={16} className="text-blue-400" />
            Milestone Checkpoints
          </h4>
          <div className="space-y-2">
            {milestones.map(ms => (
              <div key={ms.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  ms.achieved
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-600/50 text-slate-500'
                }`}>
                  {ms.achieved ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{ms.label}</p>
                  <p className="text-[10px] text-slate-500">
                    Target: {formatGoalValue(selected.type, ms.targetValue)} by {formatDate(ms.targetDate)}
                  </p>
                </div>
                <div className="w-16">
                  <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${ms.progress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 text-right mt-0.5">{ms.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Gap Analysis Tab ----

const GapAnalysisTab: React.FC<{
  goals: CollectionGoal[];
  cards: CardInventory[];
}> = ({ goals, cards }) => {
  const activeGoals = goals.filter(g => g.status === 'active');

  const analyses = useMemo(() => {
    return activeGoals.map(g => ({
      goal: g,
      analysis: analyzeGap(g, cards),
    }));
  }, [activeGoals, cards]);

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <TrendingUp size={40} className="mx-auto mb-3 text-slate-600" />
        <p className="text-sm">Create active goals to see gap analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analyses.map(({ goal, analysis }) => {
        const colors = getTrackingColor(goal.trackingStatus);
        return (
          <div key={goal.id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                <p className="text-[10px] text-slate-500 uppercase font-bold">
                  {GOAL_TYPE_LABELS[goal.type]}
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${colors.text} ${colors.bg} ${colors.border}`}>
                {analysis.willReachTarget ? 'On Pace' : 'Off Pace'}
              </span>
            </div>

            {/* Gap metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                <p className="text-lg font-bold text-white">
                  {formatGoalValue(goal.type, analysis.gap)}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Gap</p>
              </div>
              <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                <p className="text-lg font-bold text-white">{analysis.daysRemaining}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Days Left</p>
              </div>
              <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                <p className="text-lg font-bold text-white">
                  {formatGoalValue(goal.type, analysis.monthlyRateNeeded)}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Needed/Mo</p>
              </div>
              <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                <p className={`text-lg font-bold ${analysis.willReachTarget ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatDate(analysis.projectedCompletionDate)}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Projected</p>
              </div>
            </div>

            {/* Monthly contribution calculator (portfolio value goals) */}
            {goal.type === 'portfolio_value' && analysis.estimatedMonthlyContribution > 0 && (
              <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={14} className="text-blue-400" />
                  <span className="text-xs font-bold text-blue-400">Monthly Contribution Calculator</span>
                </div>
                <p className="text-sm text-slate-300">
                  To reach{' '}
                  <span className="font-bold text-white">{formatCurrency(goal.targetValue)}</span>{' '}
                  by{' '}
                  <span className="font-bold text-white">{formatDate(goal.targetDate)}</span>,
                  invest approximately{' '}
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(analysis.estimatedMonthlyContribution)}/month
                  </span>{' '}
                  at historical average appreciation (~6% annually).
                </p>
                {analysis.historicalMonthlyGrowth > 0 && (
                  <p className="text-[10px] text-slate-500 mt-2">
                    Your current growth rate: {formatCurrency(analysis.historicalMonthlyGrowth)}/month
                  </p>
                )}
              </div>
            )}

            {/* Progress indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400">
                  {formatGoalValue(goal.type, analysis.currentValue)}
                </span>
                <span className="text-xs font-mono text-white">
                  {formatGoalValue(goal.type, analysis.targetValue)}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${goal.progress}%`,
                    background: analysis.willReachTarget
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, #ef4444, #f87171)',
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Templates Tab ----

const ARCHETYPE_ICONS: Record<ArchetypeId, React.ReactNode> = {
  casual: <Users size={20} />,
  investor: <DollarSign size={20} />,
  set_builder: <Layers size={20} />,
  flipper: <Zap size={20} />,
};

const ARCHETYPE_COLORS: Record<ArchetypeId, { text: string; bg: string; border: string }> = {
  casual: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  investor: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  set_builder: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  flipper: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

const TemplatesTab: React.FC<{
  cards: CardInventory[];
  onApplied: () => void;
}> = ({ cards, onApplied }) => {
  const templates = useMemo(() => getGoalTemplates(), []);
  const [applied, setApplied] = useState<Set<ArchetypeId>>(new Set());

  const handleApply = useCallback((archetype: ArchetypeId) => {
    applyTemplate(archetype, cards);
    setApplied(prev => new Set(prev).add(archetype));
    onApplied();
  }, [cards, onApplied]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Choose a collector archetype to quickly set up pre-built goals tailored to your style.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map(tmpl => {
          const colors = ARCHETYPE_COLORS[tmpl.archetype];
          const isApplied = applied.has(tmpl.archetype);

          return (
            <div
              key={tmpl.id}
              className={`p-5 bg-slate-800/50 border rounded-2xl space-y-4 ${
                isApplied ? 'border-emerald-500/30' : 'border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text}`}>
                  {ARCHETYPE_ICONS[tmpl.archetype]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{tmpl.archetypeLabel}</h4>
                  <p className="text-[10px] text-slate-500">{tmpl.archetypeDescription}</p>
                </div>
              </div>

              <div className="space-y-2">
                {tmpl.goals.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg">
                    <Flag size={12} className={colors.text} />
                    <span className="text-xs text-white font-medium flex-1">{g.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {GOAL_TYPE_LABELS[g.type]}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleApply(tmpl.archetype)}
                disabled={isApplied}
                className={`w-full py-2 text-xs font-bold rounded-xl border transition-colors ${
                  isApplied
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-not-allowed'
                    : `${colors.bg} ${colors.text} ${colors.border} hover:opacity-80`
                }`}
              >
                {isApplied ? 'Applied' : 'Apply Template'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Main Modal ----

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, cards }) => {
  const [activeTab, setActiveTab] = useState<TabId>('goals');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const goals = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey; // dependency trigger
    return refreshGoals(cards);
  }, [cards, refreshKey]);

  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const handleSelectGoal = useCallback((id: string) => {
    setSelectedGoalId(id);
    setActiveTab('progress');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Target size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Collection Goal Planner</h2>
              <p className="text-xs text-slate-500">
                Set targets, track progress, plan your path
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-800 shrink-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'goals' && (
            <GoalsTab
              goals={goals}
              cards={cards}
              onSelect={handleSelectGoal}
              onRefresh={triggerRefresh}
            />
          )}
          {activeTab === 'progress' && (
            <ProgressTab
              goals={goals}
              selectedGoalId={selectedGoalId}
              onSelectGoal={setSelectedGoalId}
            />
          )}
          {activeTab === 'gap_analysis' && (
            <GapAnalysisTab goals={goals} cards={cards} />
          )}
          {activeTab === 'templates' && (
            <TemplatesTab cards={cards} onApplied={triggerRefresh} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 shrink-0">
          <p className="text-[10px] text-slate-600">
            Goals persist in localStorage &bull; Progress updates on each visit
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <Trophy size={10} />
            Achievements sync with Phase 37
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
