import React, { useState, useEffect, useMemo } from 'react';
import {
  Bug,
  Zap,
  GitBranch,
  Activity,
  BarChart3,
  Gauge,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Download,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  getButterflyEvents,
  getEventCascade,
  getStrangeAttractors,
  getSensitivityMap,
  getAllSensitivityMaps,
  runChaosSimulation,
  getMarketEntropy,
  getAttractorDetail,
  getDivergentTimelines,
  calculateLyapunovExponent,
  type ButterflyEvent,
  type StrangeAttractor,
  type SensitivityMap,
  type ChaosSimulation,
  type MarketEntropy,
  type SimTimeline,
  type CascadeCard,
  type ChaosPoint,
  type NonLinearityType,
} from '../lib/chaosTheoryService.ts';

// ---- Constants ----

const TABS = [
  { id: 'butterfly', label: 'Butterfly Events', icon: Bug },
  { id: 'cascade', label: 'Cascade Viewer', icon: GitBranch },
  { id: 'attractors', label: 'Strange Attractors', icon: Sparkles },
  { id: 'sensitivity', label: 'Sensitivity Dashboard', icon: BarChart3 },
  { id: 'timelines', label: 'Divergent Timelines', icon: Activity },
  { id: 'entropy', label: 'Entropy Monitor', icon: Gauge },
] as const;

type TabId = (typeof TABS)[number]['id'];

const CATEGORY_COLORS: Record<string, string> = {
  'social-media': '#3b82f6',
  injury: '#ef4444',
  grading: '#f59e0b',
  scandal: '#dc2626',
  trade: '#8b5cf6',
  'media-appearance': '#06b6d4',
  'viral-moment': '#ec4899',
  regulation: '#10b981',
};

const CATEGORY_LABELS: Record<string, string> = {
  'social-media': 'Social Media',
  injury: 'Injury',
  grading: 'Grading',
  scandal: 'Scandal',
  trade: 'Trade',
  'media-appearance': 'Media Appearance',
  'viral-moment': 'Viral Moment',
  regulation: 'Regulation',
};

const MAGNITUDE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  tiny: { bg: 'bg-emerald-900/40', text: 'text-emerald-400', label: 'Tiny' },
  small: { bg: 'bg-yellow-900/40', text: 'text-yellow-400', label: 'Small' },
  medium: { bg: 'bg-orange-900/40', text: 'text-orange-400', label: 'Medium' },
};

const NONLINEARITY_COLORS: Record<NonLinearityType, string> = {
  linear: '#6b7280',
  exponential: '#f59e0b',
  logarithmic: '#3b82f6',
  chaotic: '#ef4444',
};

const TIMELINE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${value < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${value < 0 ? '-' : ''}$${(abs / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ---- Main Component ----

const ChaosTheorySimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('butterfly');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<ButterflyEvent[]>([]);
  const [attractors, setAttractors] = useState<StrangeAttractor[]>([]);
  const [sensitivityMaps, setSensitivityMaps] = useState<SensitivityMap[]>([]);
  const [entropy, setEntropy] = useState<MarketEntropy | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedAttractorId, setSelectedAttractorId] = useState<string | null>(null);
  const [selectedSensitivityCardId, setSelectedSensitivityCardId] = useState<string | null>(null);
  const [selectedSimEventId, setSelectedSimEventId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const evts = getButterflyEvents();
      setEvents(evts);
      setAttractors(getStrangeAttractors());
      setSensitivityMaps(getAllSensitivityMaps());
      setEntropy(getMarketEntropy());
      if (evts.length > 0) {
        setSelectedEventId(evts[0].id);
        setSelectedSimEventId(evts[0].id);
      }
    } catch {
      // graceful degradation
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return getEventCascade(selectedEventId);
  }, [selectedEventId]);

  const selectedAttractor = useMemo(() => {
    if (!selectedAttractorId) return null;
    return getAttractorDetail(selectedAttractorId);
  }, [selectedAttractorId]);

  const selectedSensitivity = useMemo(() => {
    if (!selectedSensitivityCardId) return null;
    return getSensitivityMap(selectedSensitivityCardId);
  }, [selectedSensitivityCardId]);

  const simulation = useMemo((): ChaosSimulation | null => {
    if (!selectedSimEventId) return null;
    return runChaosSimulation(selectedSimEventId);
  }, [selectedSimEventId]);

  const divergentTimelines = useMemo((): SimTimeline[] => {
    if (!selectedSimEventId) return [];
    return getDivergentTimelines(selectedSimEventId);
  }, [selectedSimEventId]);

  // Set defaults once data loads
  useEffect(() => {
    if (attractors.length > 0 && !selectedAttractorId) {
      setSelectedAttractorId(attractors[0].id);
    }
  }, [attractors, selectedAttractorId]);

  useEffect(() => {
    if (sensitivityMaps.length > 0 && !selectedSensitivityCardId) {
      setSelectedSensitivityCardId(sensitivityMaps[0].cardId);
    }
  }, [sensitivityMaps, selectedSensitivityCardId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Bug className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Initializing Chaos Theory Simulator...</p>
          <p className="text-gray-600 text-sm mt-2">Calculating Lyapunov exponents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/50 rounded-lg">
                <Bug className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Chaos Theory Simulator</h1>
                <p className="text-sm text-gray-400">Butterfly effects, strange attractors, and non-linear market dynamics</p>
              </div>
            </div>
            {entropy && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    entropy.current > 0.75 ? 'bg-red-500 animate-pulse' : entropy.current > 0.5 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                />
                <span className="text-xs text-gray-400">Market Entropy:</span>
                <span className={`text-sm font-bold ${entropy.current > 0.75 ? 'text-red-400' : entropy.current > 0.5 ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {entropy.current.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'butterfly' && <ButterflyEventsTab events={events} onSelectEvent={(id) => { setSelectedEventId(id); setActiveTab('cascade'); }} />}
        {activeTab === 'cascade' && <CascadeViewerTab event={selectedEvent} events={events} onSelectEvent={setSelectedEventId} />}
        {activeTab === 'attractors' && (
          <StrangeAttractorsTab
            attractors={attractors}
            selected={selectedAttractor}
            onSelect={setSelectedAttractorId}
          />
        )}
        {activeTab === 'sensitivity' && (
          <SensitivityDashboardTab
            maps={sensitivityMaps}
            selected={selectedSensitivity}
            onSelect={setSelectedSensitivityCardId}
          />
        )}
        {activeTab === 'timelines' && (
          <DivergentTimelinesTab
            events={events}
            simulation={simulation}
            timelines={divergentTimelines}
            selectedEventId={selectedSimEventId}
            onSelectEvent={setSelectedSimEventId}
          />
        )}
        {activeTab === 'entropy' && entropy && <EntropyMonitorTab entropy={entropy} events={events} />}
      </div>
    </div>
  );
};

// ---- Tab: Butterfly Events ----

const ButterflyEventsTab: React.FC<{
  events: ButterflyEvent[];
  onSelectEvent: (id: string) => void;
}> = ({ events, onSelectEvent }) => {
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => b.amplificationFactor - a.amplificationFactor),
    [events]
  );

  const totalImpact = useMemo(() => events.reduce((sum, e) => sum + Math.abs(e.totalMarketImpact), 0), [events]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold text-white mt-1">{events.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Market Impact</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{formatCurrency(totalImpact)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Max Amplification</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatNumber(Math.max(...events.map(e => e.amplificationFactor)))}x</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Cards Affected</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{events.reduce((s, e) => s + e.affectedCards.length, 0)}</p>
        </div>
      </div>

      {/* Amplification Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Amplification Factor by Event</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sortedEvents.map(e => ({ name: e.name.replace('The ', ''), amp: e.amplificationFactor, fill: CATEGORY_COLORS[e.category] }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: number) => `${formatNumber(v)}x`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#f3f4f6' }}
              formatter={(value: number) => [`${formatNumber(value)}x`, 'Amplification']}
            />
            <Bar dataKey="amp" radius={[4, 4, 0, 0]}>
              {sortedEvents.map((e, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[e.category]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(event => {
          const magStyle = MAGNITUDE_STYLES[event.initialMagnitude];
          return (
            <div
              key={event.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-700 transition-colors cursor-pointer group"
              onClick={() => onSelectEvent(event.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <h3 className="font-semibold text-white">{event.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${magStyle.bg} ${magStyle.text}`}>
                    {magStyle.label}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: `${CATEGORY_COLORS[event.category]}20`, color: CATEGORY_COLORS[event.category] }}
                  >
                    {CATEGORY_LABELS[event.category]}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>

              {/* Cascade Preview */}
              <div className="flex items-center gap-1 mb-3 overflow-hidden">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-400" />
                {event.affectedCards.slice(0, 4).map((card, i) => (
                  <React.Fragment key={card.cardId}>
                    <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${card.impactPercent > 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                      {card.impactPercent > 0 ? '+' : ''}{card.impactPercent}%
                    </span>
                  </React.Fragment>
                ))}
                {event.affectedCards.length > 4 && (
                  <span className="text-xs text-gray-500 ml-1">+{event.affectedCards.length - 4} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {formatNumber(event.amplificationFactor)}x amplification
                  </span>
                  <span>{formatCurrency(event.totalMarketImpact)} impact</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Tab: Cascade Viewer ----

const CascadeViewerTab: React.FC<{
  event: ButterflyEvent | null;
  events: ButterflyEvent[];
  onSelectEvent: (id: string) => void;
}> = ({ event, events, onSelectEvent }) => {
  if (!event) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Select a butterfly event to view its cascade.</p>
      </div>
    );
  }

  const sortedCards = useMemo(
    () => [...event.affectedCards].sort((a, b) => a.delay_hours - b.delay_hours),
    [event]
  );

  const waterfallData = useMemo(
    () =>
      event.chaosPath.map((p, i) => ({
        time: formatTimestamp(p.timestamp),
        delta: p.marketDelta,
        entropy: p.entropy,
        lyapunov: p.lyapunovExponent,
        desc: p.description,
      })),
    [event]
  );

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">Event:</span>
        {events.map(e => (
          <button
            key={e.id}
            onClick={() => onSelectEvent(e.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              e.id === event.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>

      {/* Event Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <Bug className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">{event.name}</h2>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: `${CATEGORY_COLORS[event.category]}20`, color: CATEGORY_COLORS[event.category] }}
          >
            {CATEGORY_LABELS[event.category]}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-4">{event.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Initial Magnitude</p>
            <p className={`text-sm font-semibold ${MAGNITUDE_STYLES[event.initialMagnitude].text}`}>
              {MAGNITUDE_STYLES[event.initialMagnitude].label}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Amplification</p>
            <p className="text-sm font-semibold text-orange-400">{formatNumber(event.amplificationFactor)}x</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Impact</p>
            <p className={`text-sm font-semibold ${event.totalMarketImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(event.totalMarketImpact)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Cards Affected</p>
            <p className="text-sm font-semibold text-cyan-400">{event.affectedCards.length}</p>
          </div>
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Cascade Waterfall — Market Delta Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={waterfallData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
            <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v)} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 1]} tickFormatter={(v: number) => v.toFixed(1)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#f3f4f6' }}
              formatter={(value: number, name: string) => {
                if (name === 'delta') return [formatCurrency(value), 'Market Delta'];
                if (name === 'entropy') return [value.toFixed(2), 'Entropy'];
                if (name === 'lyapunov') return [value.toFixed(2), 'Lyapunov Exp.'];
                return [value, name];
              }}
            />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="delta" fill="#8b5cf620" stroke="#8b5cf6" strokeWidth={2} name="Market Delta" />
            <Line yAxisId="right" type="monotone" dataKey="entropy" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Entropy" />
            <Line yAxisId="right" type="monotone" dataKey="lyapunov" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Lyapunov Exp." />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Cascade Steps */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Step-by-Step Chaos Path</h3>
        <div className="space-y-0">
          {event.chaosPath.map((point, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === event.chaosPath.length - 1;
            const intensity = Math.min(point.entropy * 100, 100);
            return (
              <div key={idx} className="flex items-start gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      isFirst ? 'border-purple-400 bg-purple-900' : isLast ? 'border-orange-400 bg-orange-900' : 'border-gray-500 bg-gray-800'
                    }`}
                  />
                  {!isLast && <div className="w-0.5 h-16 bg-gray-700" />}
                </div>
                {/* Content */}
                <div className="pb-6 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{formatTimestamp(point.timestamp)}</span>
                    <span className={`text-xs font-medium ${point.marketDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(point.marketDelta)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{point.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Entropy:</span>
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${intensity}%`,
                            backgroundColor: intensity > 75 ? '#ef4444' : intensity > 50 ? '#f59e0b' : '#3b82f6',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{point.entropy.toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Lambda: <span className={point.lyapunovExponent > 0 ? 'text-red-400' : 'text-blue-400'}>{point.lyapunovExponent.toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Affected Cards Cascade Tree */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Cascade Impact Tree</h3>
        <div className="space-y-3">
          {sortedCards.map((card, idx) => {
            const width = Math.min(Math.abs(card.impactPercent) / 3.5, 100);
            return (
              <div key={card.cardId} className="flex items-center gap-3">
                <div className="w-8 text-center">
                  <span className="text-xs text-gray-500 font-mono">{card.delay_hours < 1 ? `${Math.round(card.delay_hours * 60)}m` : `${card.delay_hours}h`}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-gray-200 truncate">{card.player}</span>
                      <span className="text-xs text-gray-500 truncate hidden md:inline">{card.cardName}</span>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${card.impactPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {card.impactPercent > 0 ? '+' : ''}{card.impactPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${width}%`,
                        backgroundColor: card.impactPercent >= 0 ? '#10b981' : '#ef4444',
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {card.pathway.map((step, si) => (
                      <React.Fragment key={si}>
                        {si > 0 && <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                        <span className="text-xs text-gray-500 truncate">{step}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Strange Attractors ----

const StrangeAttractorsTab: React.FC<{
  attractors: StrangeAttractor[];
  selected: StrangeAttractor | null;
  onSelect: (id: string) => void;
}> = ({ attractors, selected, onSelect }) => {
  // Project 3D to 2D using simple isometric
  const projectedData = useMemo(() => {
    if (!selected) return [];
    return selected.pattern.map((p, i) => ({
      px: p.x * 0.866 + p.z * -0.866,
      py: p.x * 0.5 + p.y * -1 + p.z * 0.5,
      z: p.z,
      idx: i,
    }));
  }, [selected]);

  // Secondary projection: x vs z
  const xzData = useMemo(() => {
    if (!selected) return [];
    return selected.pattern.map((p, i) => ({
      px: p.x,
      py: p.z,
      idx: i,
    }));
  }, [selected]);

  return (
    <div className="space-y-6">
      {/* Attractor Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {attractors.map(a => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selected?.id === a.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {selected && (
        <>
          {/* Attractor Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">{selected.name}</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">{selected.description}</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Basin of Attraction</p>
                <p className="text-lg font-bold text-cyan-400">{selected.basinOfAttraction.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Periodicity</p>
                <p className="text-lg font-bold text-yellow-400">{selected.periodicity.toFixed(1)} cycles</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tracked Cards</p>
                <p className="text-lg font-bold text-purple-400">{selected.cards.length}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {selected.cards.map((card, i) => (
                <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">{card}</span>
              ))}
            </div>
          </div>

          {/* Phase Space Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Phase Space — Isometric Projection (XYZ)</h3>
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" dataKey="px" tick={{ fill: '#9ca3af', fontSize: 10 }} name="Projected X" />
                  <YAxis type="number" dataKey="py" tick={{ fill: '#9ca3af', fontSize: 10 }} name="Projected Y" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [value.toFixed(2)]}
                  />
                  <Scatter data={projectedData} fill="#8b5cf6" fillOpacity={0.6} r={1.5}>
                    {projectedData.map((d, i) => (
                      <Cell key={i} fill={`hsl(${(d.z * 4 + 260) % 360}, 70%, 60%)`} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Phase Space — X vs Z Plane</h3>
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" dataKey="px" tick={{ fill: '#9ca3af', fontSize: 10 }} name="X" />
                  <YAxis type="number" dataKey="py" tick={{ fill: '#9ca3af', fontSize: 10 }} name="Z" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [value.toFixed(2)]}
                  />
                  <Scatter data={xzData} fill="#06b6d4" fillOpacity={0.6} r={1.5}>
                    {xzData.map((d, i) => (
                      <Cell key={i} fill={`hsl(${(i / xzData.length) * 180 + 180}, 65%, 55%)`} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---- Tab: Sensitivity Dashboard ----

const SensitivityDashboardTab: React.FC<{
  maps: SensitivityMap[];
  selected: SensitivityMap | null;
  onSelect: (cardId: string) => void;
}> = ({ maps, selected, onSelect }) => {
  const tornadoData = useMemo(() => {
    if (!selected) return [];
    return [...selected.factors]
      .sort((a, b) => b.sensitivity - a.sensitivity)
      .map(f => ({
        factor: f.factor,
        sensitivity: f.sensitivity,
        negative: -f.sensitivity,
        nonLinearity: f.nonLinearity,
      }));
  }, [selected]);

  const lyapunovValue = useMemo(() => {
    if (!selected) return 0;
    return calculateLyapunovExponent(selected.cardId);
  }, [selected]);

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <label className="text-sm text-gray-400 block mb-2">Select Card for Sensitivity Analysis</label>
        <select
          value={selected?.cardId ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          {maps.map(m => (
            <option key={m.cardId} value={m.cardId}>{m.cardName}</option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          {/* Lyapunov Display */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-300">Lyapunov Exponent</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {lyapunovValue > 0 ? 'Positive = Chaotic regime (sensitive to initial conditions)' :
                   lyapunovValue === 0 ? 'Zero = Edge of chaos (critical transition point)' :
                   'Negative = Stable regime (perturbations decay)'}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${lyapunovValue > 1 ? 'text-red-400' : lyapunovValue > 0 ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {lyapunovValue > 0 ? '+' : ''}{lyapunovValue.toFixed(2)}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  lyapunovValue > 1 ? 'bg-red-900/40 text-red-400' :
                  lyapunovValue > 0 ? 'bg-yellow-900/40 text-yellow-400' :
                  'bg-blue-900/40 text-blue-400'
                }`}>
                  {lyapunovValue > 1 ? 'Highly Chaotic' : lyapunovValue > 0 ? 'Chaotic' : 'Stable'}
                </span>
              </div>
            </div>
          </div>

          {/* Tornado Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Sensitivity Tornado Chart</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={tornadoData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[-100, 100]} />
                <YAxis type="category" dataKey="factor" tick={{ fill: '#9ca3af', fontSize: 11 }} width={180} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => [Math.abs(value), name === 'negative' ? 'Negative Impact' : 'Positive Impact']}
                />
                <ReferenceLine x={0} stroke="#6b7280" />
                <Bar dataKey="negative" fill="#ef4444" radius={[4, 0, 0, 4]}>
                  {tornadoData.map((d, i) => (
                    <Cell key={i} fill={NONLINEARITY_COLORS[d.nonLinearity as NonLinearityType]} fillOpacity={0.5} />
                  ))}
                </Bar>
                <Bar dataKey="sensitivity" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {tornadoData.map((d, i) => (
                    <Cell key={i} fill={NONLINEARITY_COLORS[d.nonLinearity as NonLinearityType]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Factor Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Factor Details</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs text-gray-500">Non-linearity types:</span>
              {(['linear', 'logarithmic', 'exponential', 'chaotic'] as NonLinearityType[]).map(t => (
                <span key={t} className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: NONLINEARITY_COLORS[t] }} />
                  <span className="text-gray-400 capitalize">{t}</span>
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selected.factors.sort((a, b) => b.sensitivity - a.sensitivity).map(f => (
                <div key={f.factor} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: NONLINEARITY_COLORS[f.nonLinearity] }} />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{f.factor}</p>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded capitalize"
                        style={{ backgroundColor: `${NONLINEARITY_COLORS[f.nonLinearity]}20`, color: NONLINEARITY_COLORS[f.nonLinearity] }}
                      >
                        {f.nonLinearity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${f.sensitivity}%`, backgroundColor: NONLINEARITY_COLORS[f.nonLinearity] }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-200 w-8 text-right">{f.sensitivity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---- Tab: Divergent Timelines ----

const DivergentTimelinesTab: React.FC<{
  events: ButterflyEvent[];
  simulation: ChaosSimulation | null;
  timelines: SimTimeline[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}> = ({ events, simulation, timelines, selectedEventId, onSelectEvent }) => {
  // Only events that have simulations
  const simulatedEventIds = useMemo(() => new Set(['evt-001', 'evt-007', 'evt-010']), []);

  const chartData = useMemo(() => {
    if (timelines.length === 0) return [];
    const maxDays = Math.max(...timelines.flatMap(tl => tl.path.map(p => p.day)));
    const data: Record<string, number | string>[] = [];
    for (let d = 0; d <= maxDays; d++) {
      const point: Record<string, number | string> = { day: d };
      timelines.forEach(tl => {
        const p = tl.path.find(pp => pp.day === d);
        if (p) point[tl.id] = p.portfolioValue;
      });
      data.push(point);
    }
    return data;
  }, [timelines]);

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">Simulation:</span>
        {events.filter(e => simulatedEventIds.has(e.id)).map(e => (
          <button
            key={e.id}
            onClick={() => onSelectEvent(e.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              e.id === selectedEventId ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>

      {simulation && timelines.length > 0 && (
        <>
          {/* Simulation Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Divergent Timelines — {events.find(e => e.id === simulation.eventId)?.name}</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Monte Carlo Iterations</p>
                <p className="text-lg font-bold text-cyan-400">{simulation.iterations.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Divergence Point</p>
                <p className="text-lg font-bold text-yellow-400">Day {simulation.divergencePoint}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Max Divergence</p>
                <p className="text-lg font-bold text-red-400">{formatCurrency(simulation.maxDivergence)}</p>
              </div>
            </div>
          </div>

          {/* Fan Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Timeline Fan — Same Starting Point, Vastly Different Outcomes</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                  formatter={(value: number, name: string) => {
                    const tl = timelines.find(t => t.id === name);
                    return [formatCurrency(value), tl?.variation ?? name];
                  }}
                  labelFormatter={(label: number) => `Day ${label}`}
                />
                <ReferenceLine x={simulation.divergencePoint} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Divergence', fill: '#f59e0b', fontSize: 11 }} />
                {timelines.map((tl, i) => (
                  <Line
                    key={tl.id}
                    type="monotone"
                    dataKey={tl.id}
                    stroke={TIMELINE_COLORS[i % TIMELINE_COLORS.length]}
                    strokeWidth={i === 0 ? 3 : 1.5}
                    strokeDasharray={i === 0 ? undefined : '6 3'}
                    dot={false}
                    name={tl.id}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Timeline Outcomes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timelines.map((tl, i) => {
              const startVal = tl.path[0]?.portfolioValue ?? 0;
              const endVal = tl.path[tl.path.length - 1]?.portfolioValue ?? 0;
              const changePercent = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0;
              return (
                <div key={tl.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TIMELINE_COLORS[i % TIMELINE_COLORS.length] }} />
                    <h4 className="text-sm font-semibold text-gray-200">{tl.variation}</h4>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{tl.outcome}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Final Value</p>
                      <p className="text-sm font-bold text-white">{formatCurrency(endVal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Change</p>
                      <p className={`text-sm font-bold ${changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!simulation && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No simulation available for the selected event. Try "The Instagram Post", "The AI Valuation Glitch", or "The Scandal Leak".</p>
        </div>
      )}
    </div>
  );
};

// ---- Tab: Entropy Monitor ----

const EntropyMonitorTab: React.FC<{
  entropy: MarketEntropy;
  events: ButterflyEvent[];
}> = ({ entropy, events }) => {
  const gaugeAngle = useMemo(() => entropy.current * 180, [entropy.current]);

  const historicalWithRegimes = useMemo(() => {
    return entropy.historical.map(h => ({
      ...h,
      regime: h.entropy > 0.75 ? 'Chaotic' : h.entropy > 0.5 ? 'Transitional' : 'Orderly',
      fill: h.entropy > 0.75 ? '#ef4444' : h.entropy > 0.5 ? '#f59e0b' : '#3b82f6',
    }));
  }, [entropy]);

  // Map events onto the entropy timeline
  const eventMarkers = useMemo(() => {
    return events.map(e => {
      const date = e.timestamp.split('T')[0];
      const match = entropy.historical.find(h => h.date === date);
      return match ? { ...match, name: e.name } : null;
    }).filter(Boolean);
  }, [events, entropy]);

  const trendIcon = entropy.trend === 'increasing' ? TrendingUp : entropy.trend === 'decreasing' ? TrendingDown : Activity;
  const TrendIcon = trendIcon;

  return (
    <div className="space-y-6">
      {/* Entropy Gauge */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-6 text-center">Current Market Entropy</h3>
        <div className="flex justify-center mb-6">
          <div className="relative w-64 h-36">
            {/* Gauge background */}
            <svg viewBox="0 0 200 110" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 15 100 A 85 85 0 0 1 185 100"
                fill="none"
                stroke="#374151"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Blue zone (orderly) */}
              <path
                d="M 15 100 A 85 85 0 0 1 55 28"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="16"
                strokeLinecap="round"
                opacity={0.6}
              />
              {/* Yellow zone (transitional) */}
              <path
                d="M 55 28 A 85 85 0 0 1 145 28"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="16"
                opacity={0.6}
              />
              {/* Red zone (chaotic) */}
              <path
                d="M 145 28 A 85 85 0 0 1 185 100"
                fill="none"
                stroke="#ef4444"
                strokeWidth="16"
                strokeLinecap="round"
                opacity={0.6}
              />
              {/* Needle */}
              <line
                x1="100"
                y1="100"
                x2={100 + 70 * Math.cos(Math.PI - (gaugeAngle * Math.PI) / 180)}
                y2={100 - 70 * Math.sin(Math.PI - (gaugeAngle * Math.PI) / 180)}
                stroke="#f3f4f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="5" fill="#f3f4f6" />
              {/* Labels */}
              <text x="12" y="108" fill="#6b7280" fontSize="8">0.0</text>
              <text x="94" y="12" fill="#6b7280" fontSize="8">0.5</text>
              <text x="178" y="108" fill="#6b7280" fontSize="8">1.0</text>
            </svg>
            {/* Value */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <p className={`text-3xl font-bold ${entropy.current > 0.75 ? 'text-red-400' : entropy.current > 0.5 ? 'text-yellow-400' : 'text-blue-400'}`}>
                {entropy.current.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-950/30 rounded-lg border border-blue-900/30">
            <p className="text-xs text-blue-400 font-semibold">Orderly</p>
            <p className="text-xs text-gray-500 mt-1">0.00 - 0.50</p>
            <p className="text-xs text-gray-600">Predictable, mean-reverting</p>
          </div>
          <div className="p-3 bg-yellow-950/30 rounded-lg border border-yellow-900/30">
            <p className="text-xs text-yellow-400 font-semibold">Transitional</p>
            <p className="text-xs text-gray-500 mt-1">0.50 - 0.75</p>
            <p className="text-xs text-gray-600">Increasing sensitivity</p>
          </div>
          <div className="p-3 bg-red-950/30 rounded-lg border border-red-900/30">
            <p className="text-xs text-red-400 font-semibold">Chaotic</p>
            <p className="text-xs text-gray-500 mt-1">0.75 - 1.00</p>
            <p className="text-xs text-gray-600">Butterfly effects amplify</p>
          </div>
        </div>
      </div>

      {/* Trend + Interpretation */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendIcon className={`w-5 h-5 ${entropy.trend === 'increasing' ? 'text-red-400' : entropy.trend === 'decreasing' ? 'text-emerald-400' : 'text-yellow-400'}`} />
          <h3 className="text-sm font-semibold text-gray-300">
            Trend: <span className={`capitalize ${entropy.trend === 'increasing' ? 'text-red-400' : entropy.trend === 'decreasing' ? 'text-emerald-400' : 'text-yellow-400'}`}>{entropy.trend}</span>
          </h3>
        </div>
        <p className="text-sm text-gray-400">{entropy.interpretation}</p>
      </div>

      {/* Historical Entropy Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Historical Entropy with Regime Labels</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={historicalWithRegimes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 1]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#f3f4f6' }}
              formatter={(value: number, name: string) => {
                if (name === 'entropy') return [value.toFixed(2), 'Entropy'];
                return [value, name];
              }}
            />
            {/* Regime bands */}
            <ReferenceLine y={0.5} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Transitional', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={0.75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Chaotic', fill: '#ef4444', fontSize: 10, position: 'right' }} />
            <Area type="monotone" dataKey="entropy" fill="#8b5cf620" stroke="none" />
            <Line type="monotone" dataKey="entropy" strokeWidth={2.5} dot={{ r: 3 }}>
              {historicalWithRegimes.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Event Annotations */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Entropy-Triggering Events</h3>
        <div className="space-y-3">
          {events
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(event => {
              const peakEntropy = Math.max(...event.chaosPath.map(p => p.entropy));
              const peakLyapunov = Math.max(...event.chaosPath.map(p => p.lyapunovExponent));
              return (
                <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      peakEntropy > 0.8 ? 'bg-red-500' : peakEntropy > 0.6 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200">{event.name}</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                    <div className="text-right">
                      <p className="text-gray-500">Peak Entropy</p>
                      <p className={`font-bold ${peakEntropy > 0.8 ? 'text-red-400' : 'text-yellow-400'}`}>{peakEntropy.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Peak Lambda</p>
                      <p className={`font-bold ${peakLyapunov > 1 ? 'text-red-400' : 'text-yellow-400'}`}>{peakLyapunov.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Impact</p>
                      <p className={`font-bold ${event.totalMarketImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(event.totalMarketImpact)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ChaosTheorySimulator;
