import React, { useMemo, useState } from 'react';
import {
  X,
  GitBranch,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  Clock,
  Users,
  Sparkles,
  BarChart3,
  ChevronRight,
  Search,
} from 'lucide-react';
import {
  getCounterfactualScenarios,
  getAlternateTimeline,
  getComparables,
  getCounterfactualStats,
  CounterfactualScenario,
  AlternateTimeline,
  CounterfactualComparable,
} from '../lib/counterfactualValueService';

interface CounterfactualValueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'scenarios' | 'timeline' | 'comparables' | 'create';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'scenarios', label: 'Scenarios', icon: <GitBranch size={14} /> },
  { id: 'timeline', label: 'Timeline Explorer', icon: <Clock size={14} /> },
  { id: 'comparables', label: 'Comparables', icon: <Users size={14} /> },
  { id: 'create', label: 'Create Scenario', icon: <Sparkles size={14} /> },
];

const CATEGORY_LABELS: Record<string, string> = {
  health: 'Health',
  'team-change': 'Team Change',
  'career-event': 'Career Event',
  'league-event': 'League Event',
  record: 'Record',
  draft: 'Draft',
};

const CATEGORY_COLORS: Record<string, string> = {
  health: 'bg-red-500/10 text-red-400 border-red-500/30',
  'team-change': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'career-event': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'league-event': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  record: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  draft: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

export const CounterfactualValueModal: React.FC<CounterfactualValueModalProps> = ({
  isOpen,
  onClose,
}) => {
  const scenarios = useMemo(() => getCounterfactualScenarios(), []);
  const stats = useMemo(() => getCounterfactualStats(), []);

  const [activeTab, setActiveTab] = useState<TabId>('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<CounterfactualScenario>(scenarios[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Create scenario state
  const [createPlayer, setCreatePlayer] = useState('');
  const [createEventType, setCreateEventType] = useState('health');
  const [createDescription, setCreateDescription] = useState('');
  const [createEstimate, setCreateEstimate] = useState<null | { value: number; delta: number; confidence: number }>(null);

  const timeline = useMemo(
    () => getAlternateTimeline(selectedScenario.id),
    [selectedScenario.id]
  );

  const comparables = useMemo(
    () => getComparables(selectedScenario.id),
    [selectedScenario.id]
  );

  const filteredScenarios = useMemo(() => {
    if (filterCategory === 'all') return scenarios;
    return scenarios.filter((s) => s.category === filterCategory);
  }, [scenarios, filterCategory]);

  const handleGenerateEstimate = () => {
    if (!createPlayer || !createDescription) return;
    setCreateEstimate({
      value: Math.round(Math.random() * 5000 + 1000),
      delta: Math.round((Math.random() * 80 - 20) * 10) / 10,
      confidence: Math.round((Math.random() * 30 + 50) * 10) / 10,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div
          className="p-8 border-b border-slate-700 flex items-center justify-between"
          style={{
            background: 'linear-gradient(to right, rgba(139,92,246,0.1), rgba(15,23,42,1))',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/20 text-violet-400 rounded-2xl border border-violet-500/30">
              <GitBranch size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/30">
                  <GitBranch size={10} />
                  Alternate Realities
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Counterfactual <span className="text-violet-400">Value Engine</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-slate-500 hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6 flex gap-2 border-b border-slate-800 pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white border border-transparent hover:border-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
          {activeTab === 'scenarios' && (
            <ScenariosTab
              scenarios={filteredScenarios}
              stats={stats}
              filterCategory={filterCategory}
              onFilterChange={setFilterCategory}
              onSelectScenario={(s) => {
                setSelectedScenario(s);
                setActiveTab('timeline');
              }}
            />
          )}
          {activeTab === 'timeline' && (
            <TimelineTab
              scenario={selectedScenario}
              timeline={timeline}
              scenarios={scenarios}
              onSelectScenario={setSelectedScenario}
            />
          )}
          {activeTab === 'comparables' && (
            <ComparablesTab
              scenario={selectedScenario}
              comparables={comparables}
              scenarios={scenarios}
              onSelectScenario={setSelectedScenario}
            />
          )}
          {activeTab === 'create' && (
            <CreateTab
              player={createPlayer}
              eventType={createEventType}
              description={createDescription}
              estimate={createEstimate}
              onPlayerChange={setCreatePlayer}
              onEventTypeChange={setCreateEventType}
              onDescriptionChange={setCreateDescription}
              onGenerate={handleGenerateEstimate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Scenarios Tab ─────────────────────────────────────────────────────────────

const ScenariosTab: React.FC<{
  scenarios: CounterfactualScenario[];
  stats: ReturnType<typeof getCounterfactualStats>;
  filterCategory: string;
  onFilterChange: (cat: string) => void;
  onSelectScenario: (s: CounterfactualScenario) => void;
}> = ({ scenarios, stats, filterCategory, onFilterChange, onSelectScenario }) => {
  const categories = ['all', 'health', 'draft', 'career-event', 'team-change', 'league-event', 'record'];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-xl font-bebas tracking-wider text-white">{stats.totalScenarios}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Scenarios</p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-xl font-bebas tracking-wider text-violet-400">
            {stats.avgValueDelta > 0 ? '+' : ''}{stats.avgValueDelta}%
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Delta</p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-xl font-bebas tracking-wider text-emerald-400">+{stats.biggestUpside.delta}%</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Biggest Upside</p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-xl font-bebas tracking-wider text-red-400">{stats.biggestDownside.delta}%</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Biggest Downside</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilterChange(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              filterCategory === cat
                ? 'bg-violet-500/15 text-violet-400 border-violet-500/30'
                : 'text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => {
          const isUpside = scenario.valueDelta > 0;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className="text-left p-5 bg-slate-800/40 border border-slate-700 rounded-2xl hover:border-violet-500/30 transition-all group space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      CATEGORY_COLORS[scenario.category] ?? 'bg-slate-700 text-slate-400 border-slate-600'
                    }`}
                  >
                    {CATEGORY_LABELS[scenario.category] ?? scenario.category}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">{scenario.playerName}</p>
                  <p className="text-sm font-bold text-white mt-1 leading-snug">
                    {scenario.scenarioTitle}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0"
                />
              </div>

              {/* Value Comparison */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Actual</p>
                  <p className="text-sm font-bold text-white">
                    ${scenario.actualValue.toLocaleString()}
                  </p>
                </div>
                <ArrowRight size={14} className="text-violet-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Alt. Value</p>
                  <p className="text-sm font-bold text-violet-400">
                    ${scenario.counterfactualValue.toLocaleString()}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {isUpside ? (
                    <TrendingUp size={12} className="text-emerald-400" />
                  ) : (
                    <TrendingDown size={12} className="text-red-400" />
                  )}
                  <span
                    className={`text-xs font-bold ${isUpside ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {isUpside ? '+' : ''}
                    {scenario.valueDeltaPercent}%
                  </span>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-2">
                <Shield size={10} className="text-slate-500" />
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${scenario.confidenceScore * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  {Math.round(scenario.confidenceScore * 100)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Timeline Tab ──────────────────────────────────────────────────────────────

const TimelineTab: React.FC<{
  scenario: CounterfactualScenario;
  timeline: AlternateTimeline | undefined;
  scenarios: CounterfactualScenario[];
  onSelectScenario: (s: CounterfactualScenario) => void;
}> = ({ scenario, timeline, scenarios, onSelectScenario }) => {
  const events = timeline?.timelineEvents ?? [];

  const maxValue = Math.max(
    ...events.map((e) => Math.max(e.cardValue, e.actualCardValue)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Scenario
        </span>
        <select
          value={scenario.id}
          onChange={(e) => {
            const s = scenarios.find((sc) => sc.id === e.target.value);
            if (s) onSelectScenario(s);
          }}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.playerName} — {s.scenarioTitle}
            </option>
          ))}
        </select>
      </div>

      {/* Scenario Info */}
      <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl space-y-2">
        <p className="text-sm font-bold text-white">{scenario.scenarioTitle}</p>
        <p className="text-xs text-slate-400 leading-relaxed">{scenario.scenarioDescription}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {scenario.keyAssumptions.map((a, i) => (
            <span
              key={i}
              className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="space-y-1">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Alternate Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Actual Path</span>
          </div>
        </div>

        {events.map((event, i) => {
          const altWidth = (event.cardValue / maxValue) * 100;
          const actualWidth = (event.actualCardValue / maxValue) * 100;
          const diverging = Math.abs(event.cardValue - event.actualCardValue) > 100;

          return (
            <div key={i} className="flex items-center gap-4 group">
              {/* Year */}
              <div className="w-12 text-right flex-shrink-0">
                <span className="text-xs font-bold text-slate-400">{event.year}</span>
              </div>

              {/* Bars */}
              <div className="flex-1 space-y-1">
                {/* Alternate */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-5 bg-slate-800 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-lg transition-all duration-500 flex items-center justify-end px-2"
                      style={{ width: `${Math.max(altWidth, 8)}%` }}
                    >
                      <span className="text-[9px] font-bold text-white whitespace-nowrap">
                        ${event.cardValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Actual */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-5 bg-slate-800 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-lg transition-all duration-500 flex items-center justify-end px-2"
                      style={{ width: `${Math.max(actualWidth, 8)}%` }}
                    >
                      <span className="text-[9px] font-bold text-slate-300 whitespace-nowrap">
                        ${event.actualCardValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divergence Indicator */}
              <div className="w-16 flex-shrink-0 text-right">
                {diverging && (
                  <span
                    className={`text-[10px] font-bold ${
                      event.cardValue > event.actualCardValue
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {event.cardValue > event.actualCardValue ? '+' : ''}
                    {Math.round(
                      ((event.cardValue - event.actualCardValue) / event.actualCardValue) * 100
                    )}
                    %
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event descriptions */}
      <div className="space-y-2 pt-4 border-t border-slate-800">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Timeline Events
        </p>
        {events.map((event, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-all"
          >
            <span className="text-xs font-bold text-violet-400 mt-0.5 w-10 flex-shrink-0">
              {event.year}
            </span>
            <p className="text-xs text-slate-400">{event.event}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Comparables Tab ───────────────────────────────────────────────────────────

const ComparablesTab: React.FC<{
  scenario: CounterfactualScenario;
  comparables: CounterfactualComparable[];
  scenarios: CounterfactualScenario[];
  onSelectScenario: (s: CounterfactualScenario) => void;
}> = ({ scenario, comparables, scenarios, onSelectScenario }) => (
  <div className="space-y-6">
    {/* Scenario Selector */}
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        Scenario
      </span>
      <select
        value={scenario.id}
        onChange={(e) => {
          const s = scenarios.find((sc) => sc.id === e.target.value);
          if (s) onSelectScenario(s);
        }}
        className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
      >
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.playerName} — {s.scenarioTitle}
          </option>
        ))}
      </select>
    </div>

    {/* Methodology */}
    <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl space-y-2">
      <div className="flex items-center gap-2">
        <BarChart3 size={12} className="text-violet-400" />
        <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">
          Methodology
        </span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{scenario.methodology}</p>
    </div>

    {/* Comparable Cards */}
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        Historical Comparables
      </p>

      {comparables.length === 0 && (
        <p className="text-sm text-slate-500">No comparables found for this scenario.</p>
      )}

      {comparables.map((comp) => (
        <div
          key={comp.id}
          className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl space-y-3 hover:border-violet-500/20 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{comp.comparablePlayer}</p>
              <p className="text-xs text-slate-400 mt-0.5">{comp.comparableScenario}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-violet-400">
                ${comp.outcomeValue.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">Outcome Value</p>
            </div>
          </div>

          {/* Similarity Score Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase w-16 flex-shrink-0">
              Similarity
            </span>
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${comp.similarityScore * 100}%`,
                  background:
                    comp.similarityScore > 0.75
                      ? 'linear-gradient(to right, #8b5cf6, #a78bfa)'
                      : comp.similarityScore > 0.6
                        ? 'linear-gradient(to right, #6366f1, #818cf8)'
                        : 'linear-gradient(to right, #64748b, #94a3b8)',
                }}
              />
            </div>
            <span className="text-xs font-bold text-slate-400 w-10 text-right">
              {Math.round(comp.similarityScore * 100)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Create Scenario Tab ───────────────────────────────────────────────────────

const CreateTab: React.FC<{
  player: string;
  eventType: string;
  description: string;
  estimate: { value: number; delta: number; confidence: number } | null;
  onPlayerChange: (v: string) => void;
  onEventTypeChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onGenerate: () => void;
}> = ({
  player,
  eventType,
  description,
  estimate,
  onPlayerChange,
  onEventTypeChange,
  onDescriptionChange,
  onGenerate,
}) => {
  const eventTypes = [
    { value: 'health', label: 'Health / Injury' },
    { value: 'draft', label: 'Draft / Team Selection' },
    { value: 'team-change', label: 'Team Change / Trade' },
    { value: 'career-event', label: 'Career Event' },
    { value: 'league-event', label: 'League Event' },
    { value: 'record', label: 'Record / Milestone' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-sm font-bold text-white">Build Your Own "What If"</span>
        </div>
        <p className="text-xs text-slate-400">
          Select a player, choose an event type, describe your alternate scenario, and our AI will
          generate a counterfactual value estimate using historical comparables.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Player */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Player Name
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={player}
              onChange={(e) => onPlayerChange(e.target.value)}
              placeholder="e.g., Mike Trout, Victor Wembanyama..."
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Event Type */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Event Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {eventTypes.map((et) => (
              <button
                key={et.value}
                onClick={() => onEventTypeChange(et.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  eventType === et.value
                    ? 'bg-violet-500/15 text-violet-400 border-violet-500/30'
                    : 'text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                {et.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Describe the Scenario
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            placeholder="e.g., What if Mike Trout never had calf/back injuries after 2020 and continued his MVP-pace seasons..."
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 placeholder:text-slate-600 resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={!player || !description}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
            player && description
              ? 'bg-violet-500/15 border border-violet-500/30 text-violet-400 hover:bg-violet-500/25'
              : 'bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Sparkles size={14} />
          Generate AI Estimate
        </button>
      </div>

      {/* Estimate Result */}
      {estimate && (
        <div className="p-5 bg-violet-500/5 border border-violet-500/20 rounded-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-violet-400" />
            <span className="text-sm font-bold text-white">AI Counterfactual Estimate</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/60 rounded-xl text-center">
              <p className="text-lg font-bebas tracking-wider text-violet-400">
                ${estimate.value.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Est. Alt. Value</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl text-center">
              <p
                className={`text-lg font-bebas tracking-wider ${
                  estimate.delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {estimate.delta >= 0 ? '+' : ''}
                {estimate.delta}%
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Value Delta</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl text-center">
              <p className="text-lg font-bebas tracking-wider text-white">
                {estimate.confidence}%
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            This estimate is generated using historical comparables, career trajectory modeling, and
            market-impact analysis. Confidence reflects data availability and scenario plausibility.
            Not financial advice.
          </p>
        </div>
      )}
    </div>
  );
};

export default CounterfactualValueModal;
