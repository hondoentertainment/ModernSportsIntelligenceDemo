// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  Zap,
  Activity,
  Layers,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Settings,
  Radio,
  BarChart3,
  AlertTriangle,
  Bell,
  Sliders,
  Search,
} from 'lucide-react';
import {
  getInjuryEvents,
  getShockwaveGraph,
  getShockwaveStats,
  getActiveShockwaves,
  severityConfig,
  relationConfig,
  timeAgo,
  type InjuryEvent,
  type ShockwaveGraph,
  type ShockwaveNode,
  type InjurySeverity,
  type PlayerRelation,
} from '../lib/analytics/injuryShockwaveService';

interface InjuryShockwaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'shockwave-map' | 'active-events' | 'impact-analysis' | 'settings';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'shockwave-map', label: 'Shockwave Map', icon: <Radio size={16} /> },
  { id: 'active-events', label: 'Active Events', icon: <Activity size={16} /> },
  { id: 'impact-analysis', label: 'Impact Analysis', icon: <BarChart3 size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

// ---- Sub-components ----

const SeverityBadge: React.FC<{ severity: InjurySeverity }> = ({ severity }) => {
  const cfg = severityConfig[severity];
  const dotColor =
    severity === 'season-ending' || severity === 'severe'
      ? 'bg-red-500'
      : severity === 'moderate'
        ? 'bg-amber-500'
        : 'bg-green-500';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {cfg.label}
    </span>
  );
};

const ImpactBadge: React.FC<{ impact: number }> = ({ impact }) => (
  <span className={`font-mono text-xs font-bold ${impact < 0 ? 'text-red-400' : impact > 0 ? 'text-green-400' : 'text-slate-400'}`}>
    {impact > 0 ? '+' : ''}{impact.toFixed(1)}%
  </span>
);

// ---- Tab: Shockwave Map ----

const ShockwaveMapTab: React.FC = () => {
  const activeShockwaves = useMemo(() => getActiveShockwaves(), []);
  const allEvents = useMemo(() => getInjuryEvents(), []);
  const [selectedEventId, setSelectedEventId] = useState<string>(
    allEvents[0]?.id ?? ''
  );

  const graph = useMemo(
    () => (selectedEventId ? getShockwaveGraph(selectedEventId) : null),
    [selectedEventId]
  );

  if (allEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
          <Radio size={32} className="text-slate-600" />
        </div>
        <p className="text-sm text-slate-400">No active shockwaves to visualize</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Event selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {allEvents.map(ev => (
          <button
            key={ev.id}
            onClick={() => setSelectedEventId(ev.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedEventId === ev.id
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-white'
            }`}
          >
            {ev.playerName}
          </button>
        ))}
      </div>

      {graph && (
        <>
          {/* Epicenter card */}
          <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <Zap size={18} className="text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{graph.injuryEvent.playerName}</p>
                <p className="text-xs text-slate-400">
                  {graph.injuryEvent.injuryType} &mdash; {graph.injuryEvent.team}
                </p>
              </div>
              <SeverityBadge severity={graph.injuryEvent.severity} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Cascade Depth</p>
                <p className="text-lg font-bebas tracking-wider text-white">{graph.cascadeDepth}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Affected</p>
                <p className="text-lg font-bebas tracking-wider text-white">{graph.nodes.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Net Impact</p>
                <p className={`text-lg font-bebas tracking-wider ${graph.totalPortfolioImpact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {graph.totalPortfolioImpact < 0 ? '-' : '+'}${Math.abs(graph.totalPortfolioImpact).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Return</p>
                <p className="text-lg font-bebas tracking-wider text-amber-400">{graph.injuryEvent.expectedReturn}</p>
              </div>
            </div>
          </div>

          {/* Connected nodes */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Propagation Network</p>
            <div className="space-y-1.5">
              {graph.nodes.map((node, idx) => {
                const relCfg = relationConfig[node.relation];
                const dollarChange = node.priceAfterEstimate - node.priceBeforeEvent;
                return (
                  <div
                    key={node.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs group hover:bg-slate-800/60 hover:border-slate-600 transition-all"
                  >
                    {/* Distance indicator */}
                    <div className="flex items-center gap-1 w-8 flex-shrink-0">
                      {Array.from({ length: Math.min(idx + 1, 4) }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            node.relation === 'injured'
                              ? 'bg-red-500'
                              : i < 2
                                ? 'bg-amber-500'
                                : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate group-hover:text-brand-lime transition-colors">
                        {node.playerName}
                      </p>
                      <p className="text-[10px] text-slate-500">{node.team}</p>
                    </div>

                    {/* Relation badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${relCfg.color} bg-slate-800 border border-slate-700`}>
                      {relCfg.label}
                    </span>

                    {/* Impact */}
                    <div className="w-16 text-right">
                      <ImpactBadge impact={node.cardValueImpact} />
                    </div>

                    {/* Dollar change */}
                    <span className={`font-mono text-xs w-20 text-right ${dollarChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {dollarChange < 0 ? '-' : '+'}${Math.abs(dollarChange).toFixed(2)}
                    </span>

                    {/* Confidence */}
                    <div className="w-12 flex-shrink-0">
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            node.confidenceScore >= 80
                              ? 'bg-green-500'
                              : node.confidenceScore >= 60
                                ? 'bg-amber-500'
                                : 'bg-slate-500'
                          }`}
                          style={{ width: `${node.confidenceScore}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 text-center mt-0.5">{node.confidenceScore}%</p>
                    </div>

                    {/* Delay */}
                    <span className="text-[10px] text-slate-500 w-16 text-right flex-shrink-0">
                      {node.propagationDelay}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---- Tab: Active Events ----

const ActiveEventsTab: React.FC = () => {
  const events = useMemo(() => getInjuryEvents(), []);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      e =>
        e.playerName.toLowerCase().includes(q) ||
        e.team.toLowerCase().includes(q) ||
        e.injuryType.toLowerCase().includes(q) ||
        e.sport.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search events by player, team, or injury..."
          className="w-full pl-9 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-lime/40 transition-colors"
        />
      </div>

      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
        {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Tracked
      </p>

      <div className="space-y-2">
        {filteredEvents.map(event => {
          const graph = getShockwaveGraph(event.id);
          return (
            <div
              key={event.id}
              className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={event.severity} />
                  <span className="text-[10px] text-slate-500 font-mono">{event.sport}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>{timeAgo(event.timestamp)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{event.playerName}</p>
                  <p className="text-xs text-slate-400">{event.injuryType} &mdash; {event.team}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    <span className="font-mono text-white">{graph?.nodes.length ?? 0}</span> affected
                  </p>
                  <p className="text-xs text-slate-500">
                    Depth: <span className="font-mono text-white">{graph?.cascadeDepth ?? 0}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
                <span className="text-[10px] text-slate-500">
                  Return: <span className="text-slate-300">{event.expectedReturn}</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Source: <span className="text-slate-300">{event.source}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Tab: Impact Analysis ----

const ImpactAnalysisTab: React.FC = () => {
  const stats = useMemo(() => getShockwaveStats(), []);
  const activeShockwaves = useMemo(() => getActiveShockwaves(), []);
  const allEvents = useMemo(() => getInjuryEvents(), []);

  // Aggregate position exposure
  const positionExposure = useMemo(() => {
    const exposure: Record<PlayerRelation, { count: number; totalImpact: number }> = {
      injured: { count: 0, totalImpact: 0 },
      teammate: { count: 0, totalImpact: 0 },
      opponent: { count: 0, totalImpact: 0 },
      'division-rival': { count: 0, totalImpact: 0 },
      'same-position': { count: 0, totalImpact: 0 },
    };

    for (const event of allEvents) {
      const graph = getShockwaveGraph(event.id);
      if (!graph) continue;
      for (const node of graph.nodes) {
        exposure[node.relation].count++;
        exposure[node.relation].totalImpact += node.priceAfterEstimate - node.priceBeforeEvent;
      }
    }

    return Object.entries(exposure)
      .map(([relation, data]) => ({
        relation: relation as PlayerRelation,
        ...data,
      }))
      .sort((a, b) => Math.abs(b.totalImpact) - Math.abs(a.totalImpact));
  }, [allEvents]);

  // Hedging suggestions
  const hedgingSuggestions = [
    {
      id: 'hedge-1',
      title: 'Diversify MLB Pitcher Holdings',
      description: 'Ohtani UCL tear exposes heavy concentration in Dodgers pitching staff. Consider acquiring NL East arm cards as hedges.',
      urgency: 'High' as const,
    },
    {
      id: 'hedge-2',
      title: 'Reduce Grizzlies Exposure',
      description: 'With Morant out 6-8 weeks, Memphis team cards face sustained downward pressure. Rotate into OKC or MIN guards.',
      urgency: 'Medium' as const,
    },
    {
      id: 'hedge-3',
      title: 'Buy the Dip on Acuna Jr.',
      description: 'Season-ending ACL injuries historically over-correct by 15-20%. Position for recovery narrative in 3-6 months.',
      urgency: 'Low' as const,
    },
    {
      id: 'hedge-4',
      title: 'Accumulate Backup QB Cards',
      description: 'NFL injury wave to starting QBs creates asymmetric upside in backup QB rookie cards. Low cost, high ceiling.',
      urgency: 'Medium' as const,
    },
  ];

  const urgencyColors = {
    High: 'text-red-400 bg-red-500/10 border-red-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Low: 'text-green-400 bg-green-500/10 border-green-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Total Exposure</p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            ${stats.portfolioExposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across {stats.totalEventsTracked} events</p>
        </div>
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Biggest Shockwave</p>
          <p className="text-2xl font-bebas tracking-wider text-red-400">{stats.biggestShockwave}</p>
          <p className="text-xs text-slate-500 mt-1">Highest absolute dollar impact</p>
        </div>
      </div>

      {/* Portfolio Impact Per Event */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Impact Per Event</p>
        <div className="space-y-2">
          {allEvents.map(event => {
            const graph = getShockwaveGraph(event.id);
            if (!graph) return null;
            return (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <SeverityBadge severity={event.severity} />
                <span className="text-sm text-white font-medium flex-1 truncate">{event.playerName}</span>
                <span className="text-xs text-slate-500 font-mono">{graph.nodes.length} nodes</span>
                <span className={`font-mono text-sm font-bold w-24 text-right ${graph.totalPortfolioImpact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {graph.totalPortfolioImpact < 0 ? '-' : '+'}${Math.abs(graph.totalPortfolioImpact).toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Position Exposure Breakdown */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Exposure by Relation Type</p>
        <div className="space-y-2">
          {positionExposure.map(({ relation, count, totalImpact }) => {
            const relCfg = relationConfig[relation];
            const maxAbsImpact = Math.max(...positionExposure.map(p => Math.abs(p.totalImpact)), 1);
            const barWidth = (Math.abs(totalImpact) / maxAbsImpact) * 100;

            return (
              <div key={relation} className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${relCfg.color}`}>{relCfg.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{count} players</span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${totalImpact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {totalImpact < 0 ? '-' : '+'}${Math.abs(totalImpact).toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${totalImpact < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hedging Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-brand-lime" />
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Hedging Suggestions</p>
        </div>
        <div className="space-y-2">
          {hedgingSuggestions.map(suggestion => (
            <div
              key={suggestion.id}
              className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-white font-medium group-hover:text-brand-lime transition-colors">
                  {suggestion.title}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${urgencyColors[suggestion.urgency]}`}>
                  {suggestion.urgency}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{suggestion.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Settings ----

const SettingsTab: React.FC = () => {
  const [sensitivityLevel, setSensitivityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [notifyMinor, setNotifyMinor] = useState(false);
  const [notifyModerate, setNotifyModerate] = useState(true);
  const [notifySevere, setNotifySevere] = useState(true);
  const [notifySeasonEnding, setNotifySeasonEnding] = useState(true);
  const [cascadeThreshold, setCascadeThreshold] = useState(5);
  const [impactThreshold, setImpactThreshold] = useState(10);

  const sensitivityOptions: { value: 'low' | 'medium' | 'high'; label: string; description: string }[] = [
    { value: 'low', label: 'Low', description: 'Only direct player impact, no cascade propagation' },
    { value: 'medium', label: 'Medium', description: 'Teammates and direct rivals included' },
    { value: 'high', label: 'High', description: 'Full network propagation across all relation types' },
  ];

  return (
    <div className="space-y-6">
      {/* Sensitivity */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-brand-lime" />
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Propagation Sensitivity</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {sensitivityOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSensitivityLevel(opt.value)}
              className={`p-3 rounded-xl text-left transition-all ${
                sensitivityLevel === opt.value
                  ? 'bg-brand-lime/10 border border-brand-lime/40 text-brand-lime'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
              }`}
            >
              <p className="text-xs font-bold mb-0.5">{opt.label}</p>
              <p className="text-[10px] leading-relaxed opacity-70">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Thresholds */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-brand-lime" />
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Notification Severity Filter</p>
        </div>
        <div className="space-y-2">
          {([
            { key: 'minor', label: 'Minor Injuries', checked: notifyMinor, toggle: () => setNotifyMinor(!notifyMinor) },
            { key: 'moderate', label: 'Moderate Injuries', checked: notifyModerate, toggle: () => setNotifyModerate(!notifyModerate) },
            { key: 'severe', label: 'Severe Injuries', checked: notifySevere, toggle: () => setNotifySevere(!notifySevere) },
            { key: 'season-ending', label: 'Season-Ending Injuries', checked: notifySeasonEnding, toggle: () => setNotifySeasonEnding(!notifySeasonEnding) },
          ] as const).map(item => {
            const cfg = severityConfig[item.key];
            return (
              <button
                key={item.key}
                onClick={item.toggle}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  item.checked
                    ? `${cfg.bg} border ${cfg.border}`
                    : 'bg-slate-800/30 border border-slate-700/50 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    item.key === 'season-ending' || item.key === 'severe'
                      ? 'bg-red-500'
                      : item.key === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                  }`} />
                  <span className={`text-xs font-medium ${item.checked ? cfg.color : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                </div>
                <div className={`w-8 h-4 rounded-full transition-all ${item.checked ? 'bg-brand-lime' : 'bg-slate-700'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-all ${item.checked ? 'ml-4.5' : 'ml-0.5'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cascade Threshold */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-brand-lime" />
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Minimum Cascade Size</p>
        </div>
        <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Only alert when cascade reaches</span>
            <span className="text-sm font-mono text-white font-bold">{cascadeThreshold}+ players</span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            value={cascadeThreshold}
            onChange={e => setCascadeThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-brand-lime"
          />
          <div className="flex justify-between text-[9px] text-slate-600 mt-1">
            <span>1</span>
            <span>15</span>
          </div>
        </div>
      </div>

      {/* Impact Threshold */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-brand-lime" />
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Minimum Impact Threshold</p>
        </div>
        <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Only alert when card impact exceeds</span>
            <span className="text-sm font-mono text-white font-bold">{impactThreshold}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={impactThreshold}
            onChange={e => setImpactThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-brand-lime"
          />
          <div className="flex justify-between text-[9px] text-slate-600 mt-1">
            <span>1%</span>
            <span>50%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

const InjuryShockwaveModal: React.FC<InjuryShockwaveModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('shockwave-map');
  const stats = useMemo(() => getShockwaveStats(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* Gradient Header */}
        <div className="p-8 border-b border-slate-700 bg-gradient-to-r from-red-500/10 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30 text-red-400">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">
                  Injury <span className="text-red-400">Shockwave</span> Engine
                </h2>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                  Real-time cascade propagation &bull; {stats.totalEventsTracked} events tracked
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Summary bar */}
          <div className="flex items-center gap-4 mt-5 p-3 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs">
              <ShieldAlert size={14} className="text-red-400" />
              <span className="text-slate-400">Active:</span>
              <span className="font-bebas text-lg text-white tracking-wider">{stats.activeAlerts}</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <Layers size={14} className="text-amber-400" />
              <span className="text-slate-400">Avg Depth:</span>
              <span className="font-bebas text-lg text-white tracking-wider">{stats.averageCascadeDepth}</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <Activity size={14} className="text-brand-lime" />
              <span className="text-slate-400">Exposure:</span>
              <span className="font-bebas text-lg text-white tracking-wider">
                ${stats.portfolioExposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="ml-auto text-xs text-slate-400">
              Biggest: <span className="text-white font-medium">{stats.biggestShockwave}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-8 pt-4 border-b border-slate-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-brand-lime border-brand-lime'
                  : 'text-slate-500 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {activeTab === 'shockwave-map' && <ShockwaveMapTab />}
          {activeTab === 'active-events' && <ActiveEventsTab />}
          {activeTab === 'impact-analysis' && <ImpactAnalysisTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default InjuryShockwaveModal;
