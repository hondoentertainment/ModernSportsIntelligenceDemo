import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Users,
  Filter,
  ArrowUpRight,
  Bell,
  Star,
  Layers,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
  GitCompare,
  Target,
  Search,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from 'recharts';
import { CardInventory, Sport } from '../types';
import {
  Prospect,
  ProspectStage,
  StashEntry,
  getAllProspects,
  getProspectById,
  getPipelineFunnel,
  getDraftBoard,
  getCallUpAlerts,
  getStageLabel,
  getValueAtStage,
  compareProspects,
  getStashEntries,
  addStashEntry,
  removeStashEntry,
  getStashSummary,
  followProspect,
  unfollowProspect,
  isProspectFollowed,
  acknowledgeAlert,
  CallUpAlert,
  PipelineFunnelStage,
} from '../lib/analytics/prospectPipelineService';

interface ProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'pipeline' | 'draft' | 'alerts' | 'stash' | 'compare';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'pipeline', label: 'Pipeline',  icon: <Users size={14} /> },
  { id: 'draft',    label: 'Draft',     icon: <Target size={14} /> },
  { id: 'alerts',   label: 'Alerts',    icon: <Bell size={14} /> },
  { id: 'stash',    label: 'Stash',     icon: <Layers size={14} /> },
  { id: 'compare',  label: 'Compare',   icon: <GitCompare size={14} /> },
];

const SPORTS: (Sport | 'All')[] = ['All', 'Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
const STAGES: (ProspectStage | 'all')[] = ['all', 'amateur', 'drafted', 'minor_league', 'call_up', 'rookie'];

function _sportColor(sport: string): string {
  switch (sport) {
    case 'Baseball':   return '#ef4444';
    case 'Basketball': return '#f97316';
    case 'Football':   return '#10b981';
    case 'Hockey':     return '#06b6d4';
    case 'Soccer':     return '#eab308';
    default:           return '#64748b';
  }
}

function sportTextClass(sport: string): string {
  switch (sport) {
    case 'Baseball':   return 'text-red-400';
    case 'Basketball': return 'text-orange-400';
    case 'Football':   return 'text-green-400';
    case 'Hockey':     return 'text-cyan-400';
    case 'Soccer':     return 'text-yellow-400';
    default:           return 'text-slate-400';
  }
}

function stageBadge(stage: ProspectStage): { label: string; cls: string } {
  switch (stage) {
    case 'call_up':      return { label: 'CALL-UP', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    case 'minor_league': return { label: 'MINORS',  cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
    case 'drafted':      return { label: 'DRAFTED', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
    case 'rookie':       return { label: 'ROOKIE',  cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    default:             return { label: 'AMATEUR', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/40' };
  }
}

const ProspectModal: React.FC<ProspectModalProps> = ({ isOpen, onClose, _cards }) => {
  const [activeTab, setActiveTab] = useState<TabId>('pipeline');
  const [sportFilter, setSportFilter] = useState<Sport | 'All'>('All');
  const [stageFilter, setStageFilter] = useState<ProspectStage | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [compareA, setCompareA] = useState<string>('');
  const [compareB, setCompareB] = useState<string>('');
  const [stashForm, setStashForm] = useState({ prospectId: '', purchasePrice: '', targetExit: '', notes: '' });
  const [, setTick] = useState(0); // force re-render for localStorage changes

  const forceRefresh = useCallback(() => setTick(t => t + 1), []);

  const allProspects = useMemo(() => getAllProspects(), []);

  const filteredProspects = useMemo(() => {
    let list = allProspects;
    if (sportFilter !== 'All') list = list.filter(p => p.sport === sportFilter);
    if (stageFilter !== 'all') list = list.filter(p => p.stage === stageFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.ranking - b.ranking);
  }, [allProspects, sportFilter, stageFilter, searchQuery]);

  const funnel = useMemo(
    () => getPipelineFunnel(sportFilter === 'All' ? undefined : sportFilter),
    [sportFilter]
  );

  const draftBoard = useMemo(
    () => getDraftBoard(sportFilter === 'All' ? undefined : sportFilter),
    [sportFilter]
  );

  const alerts = useMemo(() => getCallUpAlerts(), []);
  const stashEntries = useMemo(() => getStashEntries(), []);
  const stashSummary = useMemo(() => getStashSummary(), []);

  const comparison = useMemo(() => {
    if (!compareA || !compareB) return null;
    return compareProspects(compareA, compareB);
  }, [compareA, compareB]);

  const handleFollow = useCallback((id: string) => {
    if (isProspectFollowed(id)) unfollowProspect(id);
    else followProspect(id);
    forceRefresh();
  }, [forceRefresh]);

  const handleAckAlert = useCallback((alertId: string) => {
    acknowledgeAlert(alertId);
    forceRefresh();
  }, [forceRefresh]);

  const handleAddStash = useCallback(() => {
    const prospect = getProspectById(stashForm.prospectId);
    if (!prospect) return;
    addStashEntry({
      prospectId: prospect.id,
      prospectName: prospect.name,
      sport: prospect.sport,
      purchasePrice: parseFloat(stashForm.purchasePrice) || 0,
      currentValue: getValueAtStage(prospect, prospect.stage),
      targetExitPrice: parseFloat(stashForm.targetExit) || 0,
      acquiredDate: new Date().toISOString().split('T')[0],
      notes: stashForm.notes,
    });
    setStashForm({ prospectId: '', purchasePrice: '', targetExit: '', notes: '' });
    forceRefresh();
  }, [stashForm, forceRefresh]);

  const handleRemoveStash = useCallback((id: string) => {
    removeStashEntry(id);
    forceRefresh();
  }, [forceRefresh]);

  if (!isOpen) return null;

  // ── Prospect detail overlay ───────────────────────────────────────────────────
  const renderProspectDetail = () => {
    if (!selectedProspect) return null;
    const p = selectedProspect;
    const followed = isProspectFollowed(p.id);
    const curveData = p.valueCurve.map((v, i) => ({ month: `M${i + 1}`, value: v }));
    const stageData = [
      { stage: 'Pre-Draft', value: p.cardValuePreDraft },
      { stage: 'Post-Draft', value: p.cardValuePostDraft },
      { stage: 'Minors', value: p.cardValueMinors },
      { stage: 'Call-Up', value: p.cardValueCallUp },
      { stage: 'Rookie', value: p.cardValueRookie },
    ];

    return (
      <div className="absolute inset-0 bg-slate-900 z-10 overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex items-start justify-between">
          <div>
            <button onClick={() => setSelectedProspect(null)} className="text-xs text-slate-400 hover:text-white mb-2 flex items-center gap-1">
              <ChevronRight size={12} className="rotate-180" /> Back to list
            </button>
            <h2 className="text-2xl font-bold text-white">{p.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className={sportTextClass(p.sport)}>{p.sport}</span>
              <span className="text-slate-500">{p.position} &middot; Age {p.age}</span>
              <span className="text-slate-500">{p.team}</span>
            </div>
          </div>
          <button
            onClick={() => handleFollow(p.id)}
            className={`p-2 rounded-lg transition-colors ${followed ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Star size={18} fill={followed ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Ranking</p>
              <p className="text-lg font-bold text-white">#{p.ranking}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Call-Up %</p>
              <p className="text-lg font-bold text-emerald-400">{p.callUpProbability}%</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Avg Jump</p>
              <p className="text-lg font-bold text-blue-400">+{p.avgPriceJump}%</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Draft Pos</p>
              <p className="text-lg font-bold text-white">{p.projectedDraftPos > 0 ? `#${p.projectedDraftPos}` : 'N/A'}</p>
            </div>
          </div>

          {/* Scouting */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Scouting Report</p>
            <p className="text-sm text-slate-200 leading-relaxed">{p.scouting}</p>
          </div>

          {/* Key stats */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Key Statistics</p>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(p.keyStats).map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="text-xs text-slate-500">{k}</p>
                  <p className="text-sm font-bold text-white">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Value by stage chart */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Card Value by Stage</p>
            <div className="h-56 bg-slate-800 rounded-xl p-3 border border-slate-700">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(v: number) => [`$${v}`, 'Value']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {stageData.map((_, i) => (
                      <Cell key={i} fill={i === stageData.length - 1 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 12-month value curve */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">12-Month Value Curve</p>
            <div className="h-48 bg-slate-800 rounded-xl p-3 border border-slate-700">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, 'Value']}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Pipeline tab ──────────────────────────────────────────────────────────────
  const renderPipeline = () => (
    <div className="space-y-6">
      {/* Funnel visualization */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-400" />
          Pipeline Funnel
        </h3>
        <div className="space-y-1.5">
          {funnel.map((s: PipelineFunnelStage, i: number) => {
            const maxCount = Math.max(...funnel.map(f => f.count), 1);
            const widthPct = Math.max(20, (s.count / maxCount) * 100);
            return (
              <div key={s.stage} className="group/funnel">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28 text-right flex-shrink-0">{s.label}</span>
                  <div className="flex-1 relative">
                    <div
                      className="h-8 rounded-lg flex items-center px-3 transition-all"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: `rgba(59, 130, 246, ${0.15 + i * 0.08})`,
                        borderLeft: '3px solid #3b82f6',
                      }}
                    >
                      <span className="text-xs font-bold text-white">{s.count}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500 w-16 text-right">${s.avgCardValue.toFixed(0)} avg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1.5 border border-slate-700">
          <Filter size={12} className="text-slate-400" />
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value as Sport | 'All')}
            className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer"
          >
            {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1.5 border border-slate-700">
          <ChevronDown size={12} className="text-slate-400" />
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value as ProspectStage | 'all')}
            className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Stages</option>
            {STAGES.filter(s => s !== 'all').map(s => (
              <option key={s} value={s}>{getStageLabel(s as ProspectStage)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1.5 border border-slate-700 flex-1 min-w-[140px]">
          <Search size={12} className="text-slate-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search prospects..."
            className="bg-transparent text-xs text-slate-300 outline-none w-full placeholder-slate-500"
          />
        </div>
      </div>

      {/* Prospect list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredProspects.map(p => {
          const badge = stageBadge(p.stage);
          const followed = isProspectFollowed(p.id);
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProspect(p)}
              className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors text-left"
            >
              <span className="text-xs font-mono text-slate-500 w-6">#{p.ranking}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                  {followed && <Star size={10} className="text-amber-400" fill="currentColor" />}
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${badge.cls}`}>{badge.label}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className={sportTextClass(p.sport)}>{p.sport}</span>
                  <span className="text-slate-600">&middot;</span>
                  <span className="text-slate-500">{p.position} &middot; {p.team}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-mono font-semibold text-emerald-400">{p.callUpProbability}%</p>
                <p className="text-[10px] text-slate-500">${getValueAtStage(p, p.stage)}</p>
              </div>
              <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
            </button>
          );
        })}
        {filteredProspects.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No prospects match your filters</p>
        )}
      </div>
    </div>
  );

  // ── Draft tab ─────────────────────────────────────────────────────────────────
  const renderDraft = () => {
    const boardData = draftBoard.map(d => {
      const prospect = getProspectById(d.prospectId);
      return { ...d, prospect };
    });

    return (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Target size={16} className="text-purple-400" />
          Draft Board &mdash; Pre vs Post Draft Value Impact
        </h3>

        {/* Draft impact chart */}
        <div className="h-64 bg-slate-800 rounded-xl p-3 border border-slate-700">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={boardData.slice(0, 12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="prospectId"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={(id: string) => {
                  const p = getProspectById(id);
                  return p ? p.name.split(' ').pop() || '' : '';
                }}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelFormatter={(id: string) => { const p = getProspectById(id); return p?.name || ''; }}
                formatter={(v: number, name: string) => [name === 'preDraftValue' ? `$${v}` : `+${v}%`, name === 'preDraftValue' ? 'Pre-Draft' : 'Post-Draft Impact']}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="preDraftValue" name="Pre-Draft Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="postDraftImpact" name="Post-Draft Impact %" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Draft list */}
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {boardData.map(d => (
            <div
              key={d.prospectId}
              className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-750 transition-colors"
              onClick={() => d.prospect && setSelectedProspect(d.prospect)}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-400">#{d.projectedPick}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{d.prospect?.name || 'Unknown'}</p>
                <p className="text-[11px] text-slate-500">{d.team}</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-0.5">
                <p className="text-xs text-slate-400">Pre: <span className="text-white font-mono">${d.preDraftValue}</span></p>
                <p className="text-xs text-emerald-400 font-mono font-semibold">+{d.postDraftImpact}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Alerts tab ────────────────────────────────────────────────────────────────
  const renderAlerts = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <Bell size={16} className="text-emerald-400" />
        Call-Up &amp; Promotion Alerts
      </h3>

      {alerts.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No active alerts</p>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {alerts.map((a: CallUpAlert) => (
            <div
              key={a.id}
              className={`p-4 rounded-xl border transition-all ${
                a.acknowledged
                  ? 'bg-slate-800/50 border-slate-700/50 opacity-60'
                  : 'bg-emerald-500/5 border-emerald-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <ArrowUpRight size={14} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-white">{a.prospectName}</span>
                  <span className={`text-[10px] ${sportTextClass(a.sport)}`}>{a.sport}</span>
                </div>
                {!a.acknowledged && (
                  <button
                    onClick={() => handleAckAlert(a.id)}
                    className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors"
                  >
                    Dismiss
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400">
                  {getStageLabel(a.fromStage)} <span className="text-slate-600 mx-1">&rarr;</span> {getStageLabel(a.toStage)}
                </span>
                <span className="text-emerald-400 font-mono font-bold">+{a.priceJump}% avg price jump</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{a.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Stash tab ─────────────────────────────────────────────────────────────────
  const renderStash = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Invested</p>
          <p className="text-lg font-bold text-white">${stashSummary.totalInvested.toFixed(0)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Current</p>
          <p className="text-lg font-bold text-blue-400">${stashSummary.currentValue.toFixed(0)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Target</p>
          <p className="text-lg font-bold text-emerald-400">${stashSummary.targetValue.toFixed(0)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">ROI</p>
          <p className={`text-lg font-bold ${stashSummary.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stashSummary.roi >= 0 ? '+' : ''}{stashSummary.roi}%
          </p>
        </div>
      </div>

      {/* Add stash form */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
        <p className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Plus size={14} className="text-blue-400" />
          Add Stash Position
        </p>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={stashForm.prospectId}
            onChange={e => setStashForm(f => ({ ...f, prospectId: e.target.value }))}
            className="bg-slate-900 text-xs text-slate-300 rounded-lg px-3 py-2 border border-slate-700 outline-none"
          >
            <option value="">Select prospect...</option>
            {allProspects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.sport})</option>
            ))}
          </select>
          <input
            value={stashForm.purchasePrice}
            onChange={e => setStashForm(f => ({ ...f, purchasePrice: e.target.value }))}
            placeholder="Purchase price"
            type="number"
            className="bg-slate-900 text-xs text-slate-300 rounded-lg px-3 py-2 border border-slate-700 outline-none placeholder-slate-500"
          />
          <input
            value={stashForm.targetExit}
            onChange={e => setStashForm(f => ({ ...f, targetExit: e.target.value }))}
            placeholder="Target exit price"
            type="number"
            className="bg-slate-900 text-xs text-slate-300 rounded-lg px-3 py-2 border border-slate-700 outline-none placeholder-slate-500"
          />
          <input
            value={stashForm.notes}
            onChange={e => setStashForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notes (optional)"
            className="bg-slate-900 text-xs text-slate-300 rounded-lg px-3 py-2 border border-slate-700 outline-none placeholder-slate-500"
          />
        </div>
        <button
          onClick={handleAddStash}
          disabled={!stashForm.prospectId || !stashForm.purchasePrice}
          className="w-full py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
        >
          Add to Stash
        </button>
      </div>

      {/* Stash entries */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {stashEntries.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No stash positions yet. Add your first above.</p>
        ) : (
          stashEntries.map((e: StashEntry) => {
            const roi = e.purchasePrice > 0 ? Math.round(((e.currentValue - e.purchasePrice) / e.purchasePrice) * 100) : 0;
            const pctToTarget = e.targetExitPrice > 0 ? Math.round((e.currentValue / e.targetExitPrice) * 100) : 0;
            return (
              <div key={e.id} className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white truncate">{e.prospectName}</span>
                    <span className={`text-[10px] ${sportTextClass(e.sport)}`}>{e.sport}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-500">Buy: <span className="text-white">${e.purchasePrice}</span></span>
                    <span className="text-slate-500">Now: <span className="text-blue-400">${e.currentValue}</span></span>
                    <span className="text-slate-500">Exit: <span className="text-emerald-400">${e.targetExitPrice}</span></span>
                  </div>
                  {e.targetExitPrice > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${Math.min(100, pctToTarget)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{pctToTarget}% to target</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs font-mono font-bold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {roi >= 0 ? '+' : ''}{roi}%
                  </span>
                  <button onClick={() => handleRemoveStash(e.id)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ── Compare tab ───────────────────────────────────────────────────────────────
  const renderCompare = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <GitCompare size={16} className="text-cyan-400" />
        Prospect Comparison
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <select
          value={compareA}
          onChange={e => setCompareA(e.target.value)}
          className="bg-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2.5 border border-slate-700 outline-none"
        >
          <option value="">Select Prospect A...</option>
          {allProspects.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.sport})</option>
          ))}
        </select>
        <select
          value={compareB}
          onChange={e => setCompareB(e.target.value)}
          className="bg-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2.5 border border-slate-700 outline-none"
        >
          <option value="">Select Prospect B...</option>
          {allProspects.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.sport})</option>
          ))}
        </select>
      </div>

      {comparison ? (
        <>
          {/* Side-by-side stats */}
          <div className="grid grid-cols-2 gap-4">
            {[comparison.prospect1, comparison.prospect2].map((p, idx) => (
              <div key={p.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <span className="text-sm font-bold text-white">{p.name}</span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-slate-400">Sport</span><span className={sportTextClass(p.sport)}>{p.sport}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Position</span><span className="text-white">{p.position}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Ranking</span><span className="text-white">#{p.ranking}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Call-Up %</span><span className="text-emerald-400">{p.callUpProbability}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Avg Jump</span><span className="text-blue-400">+{p.avgPriceJump}%</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Value comparison chart */}
          <div className="h-64 bg-slate-800 rounded-xl p-3 border border-slate-700">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparison.stages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(v: number, name: string) => [`$${v}`, name === 'value1' ? comparison.prospect1.name : comparison.prospect2.name]}
                />
                <Legend formatter={(name: string) => name === 'value1' ? comparison.prospect1.name : comparison.prospect2.name} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="value1" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="value2" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 12-month curve overlay */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">12-Month Curve Overlay</p>
            <div className="h-48 bg-slate-800 rounded-xl p-3 border border-slate-700">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparison.prospect1.valueCurve.map((v, i) => ({
                  month: `M${i + 1}`,
                  a: v,
                  b: comparison.prospect2.valueCurve[i] ?? 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name === 'a' ? comparison.prospect1.name : comparison.prospect2.name]}
                  />
                  <Line type="monotone" dataKey="a" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="b" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500 text-center py-12">Select two prospects above to compare their trajectories and card values.</p>
      )}
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Prospect Pipeline &amp; Draft Tracker</h2>
                <p className="text-xs text-slate-400 mt-0.5">{allProspects.length} prospects across 5 sports</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-slate-800/50 rounded-lg p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'alerts' && alerts.filter(a => !a.acknowledged).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/30 text-emerald-400 rounded-full">
                    {alerts.filter(a => !a.acknowledged).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'pipeline' && renderPipeline()}
          {activeTab === 'draft' && renderDraft()}
          {activeTab === 'alerts' && renderAlerts()}
          {activeTab === 'stash' && renderStash()}
          {activeTab === 'compare' && renderCompare()}
        </div>

        {/* Prospect detail overlay */}
        {renderProspectDetail()}
      </div>
    </div>
  );
};

export default ProspectModal;
