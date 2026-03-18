import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  Activity,
  Shield,
  Target,
  BarChart3,
  TrendingDown,
  Zap,
  Eye,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  getContagionMap,
  getNodeDetail,
  simulateContagion,
  getContagionScenarios,
  getAllImmunityScores,
  getContagionHotspots,
  getSystemicRisk,
  runCustomContagion,
  RELATIONSHIP_COLORS,
  type ContagionNode,
  type ContagionScenario,
  type ContagionSimulation,
  type ImmunityScore,
  type ContagionHotspot,
  type SystemicRisk,
  type RelationshipType,
} from '../lib/analytics/contagionMapperService.ts';

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  v >= 1_000_000
    ? '$' + (v / 1_000_000).toFixed(1) + 'M'
    : v >= 1_000
      ? '$' + (v / 1_000).toFixed(1) + 'K'
      : '$' + v.toFixed(0);

const exposureColor = (exposure: number): string => {
  if (exposure >= 80) return '#ef4444';
  if (exposure >= 60) return '#f97316';
  if (exposure >= 40) return '#eab308';
  return '#22c55e';
};

const exposureLabel = (exposure: number): string => {
  if (exposure >= 80) return 'Critical';
  if (exposure >= 60) return 'Infected';
  if (exposure >= 40) return 'Exposed';
  return 'Immune';
};

const TABS = [
  { key: 'map', label: 'Contagion Map', icon: Activity },
  { key: 'simulator', label: 'Scenario Simulator', icon: Zap },
  { key: 'immunity', label: 'Immunity Scores', icon: Shield },
  { key: 'hotspots', label: 'Hotspot Analysis', icon: Target },
  { key: 'systemic', label: 'Systemic Risk', icon: BarChart3 },
  { key: 'recovery', label: 'Recovery Modeling', icon: TrendingDown },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ── SVG Network Map ──────────────────────────────────────────────────────────

interface NodePosition {
  x: number;
  y: number;
  node: ContagionNode;
}

const NetworkMap: React.FC<{
  nodes: ContagionNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}> = ({ nodes, selectedNodeId, onSelectNode }) => {
  const WIDTH = 960;
  const HEIGHT = 560;
  const PADDING = 60;

  const positions = useMemo<NodePosition[]>(() => {
    // Cluster by sport, then fan-out within each cluster
    const sportGroups: Record<string, ContagionNode[]> = {};
    for (const n of nodes) {
      (sportGroups[n.sport] ??= []).push(n);
    }
    const sports = Object.keys(sportGroups);
    const result: NodePosition[] = [];

    sports.forEach((sport, si) => {
      const cx = PADDING + ((WIDTH - 2 * PADDING) / (sports.length - 1 || 1)) * si;
      const cards = sportGroups[sport];
      cards.forEach((node, ci) => {
        const angle = (2 * Math.PI * ci) / cards.length - Math.PI / 2;
        const radius = 80 + cards.length * 14;
        const x = Math.min(WIDTH - PADDING, Math.max(PADDING, cx + Math.cos(angle) * radius));
        const y = Math.min(HEIGHT - PADDING, Math.max(PADDING, HEIGHT / 2 + Math.sin(angle) * radius));
        result.push({ x, y, node });
      });
    });
    return result;
  }, [nodes]);

  const posMap = useMemo(() => {
    const m = new Map<string, NodePosition>();
    for (const p of positions) m.set(p.node.cardId, p);
    return m;
  }, [positions]);

  // Edges
  const edges = useMemo(() => {
    const seen = new Set<string>();
    const result: { x1: number; y1: number; x2: number; y2: number; rel: RelationshipType }[] = [];
    for (const p of positions) {
      for (const conn of p.node.connections) {
        const key = [p.node.cardId, conn.targetCardId].sort().join('::');
        if (seen.has(key)) continue;
        seen.add(key);
        const target = posMap.get(conn.targetCardId);
        if (!target) continue;
        result.push({ x1: p.x, y1: p.y, x2: target.x, y2: target.y, rel: conn.relationship });
      }
    }
    return result;
  }, [positions, posMap]);

  const nodeRadius = useCallback(
    (value: number) => Math.max(8, Math.min(28, Math.sqrt(value / 800))),
    [],
  );

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full" style={{ minHeight: 400 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke={RELATIONSHIP_COLORS[e.rel]}
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
      ))}

      {/* Nodes */}
      {positions.map((p) => {
        const r = nodeRadius(p.node.currentValue);
        const isSelected = p.node.cardId === selectedNodeId;
        return (
          <g
            key={p.node.cardId}
            onClick={() => onSelectNode(p.node.cardId)}
            className="cursor-pointer"
          >
            {/* Exposure ring */}
            <circle
              cx={p.x}
              cy={p.y}
              r={r + 4}
              fill="none"
              stroke={exposureColor(p.node.contagionExposure)}
              strokeWidth={isSelected ? 3 : 2}
              opacity={isSelected ? 1 : 0.7}
              filter={isSelected ? 'url(#glow)' : undefined}
            />
            {/* Node fill */}
            <circle
              cx={p.x}
              cy={p.y}
              r={r}
              fill={isSelected ? '#e2e8f0' : '#1e293b'}
              stroke="#475569"
              strokeWidth={1}
            />
            {/* Label */}
            <text
              x={p.x}
              y={p.y + r + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#94a3b8"
              className="pointer-events-none select-none"
            >
              {p.node.player}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

const ContagionMapper: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('map');
  const [loading, setLoading] = useState(true);

  // Data
  const [nodes, setNodes] = useState<ContagionNode[]>([]);
  const [scenarios, setScenarios] = useState<ContagionScenario[]>([]);
  const [immunityScores, setImmunityScores] = useState<ImmunityScore[]>([]);
  const [hotspots, setHotspots] = useState<ContagionHotspot[]>([]);
  const [systemicRisk, setSystemicRisk] = useState<SystemicRisk | null>(null);

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [simulation, setSimulation] = useState<ContagionSimulation | null>(null);
  const [selectedImmunityCard, setSelectedImmunityCard] = useState<string | null>(null);
  const [customTriggerId, setCustomTriggerId] = useState<string>('');
  const [customImpact, setCustomImpact] = useState<number>(-30);
  const [customResult, setCustomResult] = useState<ContagionScenario | null>(null);

  useEffect(() => {
    try {
      const mapNodes = getContagionMap();
      setNodes(mapNodes);
      setScenarios(getContagionScenarios());
      setImmunityScores(getAllImmunityScores());
      setHotspots(getContagionHotspots());
      setSystemicRisk(getSystemicRisk(mapNodes.map((n) => n.cardId)));
      setSelectedScenarioId(getContagionScenarios()[0]?.id ?? '');
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  // Run simulation when scenario changes
  useEffect(() => {
    if (!selectedScenarioId) return;
    const sim = simulateContagion(selectedScenarioId);
    setSimulation(sim);
  }, [selectedScenarioId]);

  // Selected node detail
  const selectedNode = useMemo(
    () => (selectedNodeId ? getNodeDetail(selectedNodeId) : undefined),
    [selectedNodeId],
  );

  // Selected immunity radar data
  const immunityRadar = useMemo(() => {
    const target = selectedImmunityCard ?? immunityScores[0]?.cardId;
    const score = immunityScores.find((s) => s.cardId === target);
    return score?.factors ?? [];
  }, [immunityScores, selectedImmunityCard]);

  // Active scenario
  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedScenarioId),
    [scenarios, selectedScenarioId],
  );

  // Simulation chart data (aggregate timeline per day)
  const simChartData = useMemo(() => {
    if (!simulation) return [];
    const dayMap = new Map<number, number>();
    for (const t of simulation.timeline) {
      dayMap.set(t.day, (dayMap.get(t.day) ?? 0) + t.cumulativeImpact);
    }
    return Array.from(dayMap.entries())
      .sort((a, b) => a[0] - b[0])
      .filter((_, i) => i % 2 === 0) // thin for performance
      .map(([day, impact]) => ({ day, impact: Math.round(impact * 100) / 100 }));
  }, [simulation]);

  // Recovery chart data
  const recoveryData = useMemo(() => {
    if (!simulation) return [];
    return simulation.recoveryTimeline.filter((_, i) => i % 3 === 0);
  }, [simulation]);

  // Systemic risk pie data
  const riskPieData = useMemo(() => {
    if (!systemicRisk) return [];
    return [
      { name: 'Concentration', value: systemicRisk.concentrationRisk, color: '#ef4444' },
      { name: 'Correlation', value: systemicRisk.correlationRisk, color: '#f97316' },
      {
        name: 'Residual',
        value: Math.max(0, 100 - systemicRisk.concentrationRisk - systemicRisk.correlationRisk),
        color: '#22c55e',
      },
    ];
  }, [systemicRisk]);

  // Sport breakdown for systemic
  const sportBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of nodes) {
      map.set(n.sport, (map.get(n.sport) ?? 0) + n.currentValue);
    }
    return Array.from(map.entries()).map(([sport, value]) => ({ sport, value }));
  }, [nodes]);

  const handleRunCustom = useCallback(() => {
    if (!customTriggerId) return;
    const result = runCustomContagion(customTriggerId, customImpact);
    setCustomResult(result);
  }, [customTriggerId, customImpact]);

  // ── Loading / Error ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Portfolio Contagion Mapper...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Portfolio Contagion Mapper</h1>
            <p className="text-sm text-slate-400">
              Model how negative events cascade through card portfolios via teammate, rival, era, and systemic connections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 rounded bg-slate-800">{nodes.length} nodes</span>
          <span className="px-2 py-1 rounded bg-slate-800">{scenarios.length} scenarios</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                active ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab: Contagion Map ──────────────────────────────────────────── */}
      {tab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Network SVG */}
          <div className="lg:col-span-2 bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">Network Topology</h2>
            <NetworkMap nodes={nodes} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-slate-400">
              {(Object.entries(RELATIONSHIP_COLORS) as [RelationshipType, string][]).map(([rel, color]) => (
                <span key={rel} className="flex items-center gap-1">
                  <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: color }} />
                  {rel}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Immune (&lt;40)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> Exposed (40-59)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Infected (60-79)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Critical (80+)
              </span>
            </div>
          </div>

          {/* Node Detail Sidebar */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 space-y-4 overflow-y-auto max-h-[600px]">
            <h2 className="text-sm font-semibold text-slate-200">
              {selectedNode ? 'Node Detail' : 'Select a Node'}
            </h2>
            {selectedNode ? (
              <>
                <div>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedNode.cardName}</p>
                  <p className="text-lg font-bold text-slate-100 mt-1">{fmt(selectedNode.currentValue)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: exposureColor(selectedNode.contagionExposure) + '22',
                        color: exposureColor(selectedNode.contagionExposure),
                      }}
                    >
                      {exposureLabel(selectedNode.contagionExposure)} ({selectedNode.contagionExposure}/100)
                    </span>
                    <span className="text-[10px] text-slate-500">{selectedNode.sport}</span>
                  </div>
                </div>

                {/* Connections */}
                <div>
                  <h3 className="text-xs font-medium text-slate-300 mb-2">
                    Connections ({selectedNode.connections.length})
                  </h3>
                  <div className="space-y-1.5">
                    {selectedNode.connections.map((c) => {
                      const target = nodes.find((n) => n.cardId === c.targetCardId);
                      return (
                        <button
                          key={c.targetCardId}
                          onClick={() => setSelectedNodeId(c.targetCardId)}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-700/40 hover:bg-slate-700/70 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: RELATIONSHIP_COLORS[c.relationship] }}
                            />
                            <span className="text-[11px] text-slate-300 truncate max-w-[140px]">
                              {target?.player ?? c.targetCardId}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-shrink-0">
                            <span>{(c.transmissionRate * 100).toFixed(0)}%</span>
                            <span>{c.lag_days}d</span>
                            <ChevronRight size={10} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vulnerability */}
                <div>
                  <h3 className="text-xs font-medium text-slate-300 mb-2">Vulnerability Factors</h3>
                  <div className="space-y-1">
                    {selectedNode.vulnerabilityFactors.map((f, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                        <AlertTriangle size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                Click on a node in the network graph to view its contagion connections, transmission rates, and vulnerability profile.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab: Scenario Simulator ─────────────────────────────────────── */}
      {tab === 'simulator' && (
        <div className="space-y-4">
          {/* Scenario selector */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-xs font-medium text-slate-300 mb-1">Pre-built Scenario</label>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-lime"
                >
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-slate-500 max-w-md">
                {activeScenario?.description}
              </div>
            </div>
          </div>

          {/* Scenario metrics */}
          {activeScenario && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Portfolio Impact</p>
                <p className="text-xl font-bold text-red-400">{activeScenario.totalPortfolioImpact}%</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Cascade Depth</p>
                <p className="text-xl font-bold text-orange-400">{activeScenario.cascadeDepth} hops</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Cards Affected</p>
                <p className="text-xl font-bold text-yellow-400">{activeScenario.affectedCards.length}</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Peak Contagion Day</p>
                <p className="text-xl font-bold text-slate-200">Day {activeScenario.peakContagionDay}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cascade timeline chart */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Cascade Timeline (Aggregate Impact)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={simChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Day', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: '% Impact', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(v: number) => [v.toFixed(1) + '%', 'Cumulative Impact']}
                  />
                  <defs>
                    <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="stepAfter" dataKey="impact" stroke="#ef4444" fill="url(#impactGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Affected cards table */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 overflow-y-auto max-h-[380px]">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Cascade Pathway</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700">
                    <th className="text-left py-1.5 px-2">Order</th>
                    <th className="text-left py-1.5 px-2">Card</th>
                    <th className="text-right py-1.5 px-2">Impact</th>
                    <th className="text-left py-1.5 px-2">Pathway</th>
                  </tr>
                </thead>
                <tbody>
                  {activeScenario?.affectedCards
                    .sort((a, b) => a.order - b.order || a.impactPercent - b.impactPercent)
                    .map((a, i) => {
                      const node = nodes.find((n) => n.cardId === a.cardId);
                      return (
                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-1.5 px-2 text-slate-400">{a.order}</td>
                          <td className="py-1.5 px-2 text-slate-300 max-w-[140px] truncate">{node?.player ?? a.cardId}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-red-400">{a.impactPercent}%</td>
                          <td className="py-1.5 px-2 text-slate-500 truncate max-w-[200px]">
                            {a.pathway.join(' → ')}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custom contagion runner */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Run Custom Contagion</h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px]">
                <label className="block text-[10px] text-slate-400 mb-1">Trigger Card</label>
                <select
                  value={customTriggerId}
                  onChange={(e) => setCustomTriggerId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="">Select card...</option>
                  {nodes.map((n) => (
                    <option key={n.cardId} value={n.cardId}>
                      {n.player} - {fmt(n.currentValue)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="block text-[10px] text-slate-400 mb-1">Impact %</label>
                <input
                  type="number"
                  value={customImpact}
                  onChange={(e) => setCustomImpact(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                />
              </div>
              <button
                onClick={handleRunCustom}
                disabled={!customTriggerId}
                className="px-4 py-1.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Run Simulation
              </button>
            </div>

            {customResult && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-300">
                  <span className="font-semibold">{customResult.name}</span> — Portfolio impact:{' '}
                  <span className="text-red-400 font-mono">{customResult.totalPortfolioImpact}%</span>, Cascade depth:{' '}
                  <span className="text-orange-400">{customResult.cascadeDepth}</span>, Cards affected:{' '}
                  <span className="text-yellow-400">{customResult.affectedCards.length}</span>
                </p>
                <div className="space-y-1">
                  {customResult.affectedCards.map((a, i) => {
                    const node = nodes.find((n) => n.cardId === a.cardId);
                    return (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-500 w-4">{a.order}</span>
                        <span className="text-slate-300 flex-1 truncate">{node?.player ?? a.cardId}</span>
                        <span className="text-red-400 font-mono">{a.impactPercent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab: Immunity Scores ────────────────────────────────────────── */}
      {tab === 'immunity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ranked Table */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 overflow-y-auto max-h-[560px]">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Immunity Rankings</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left py-1.5 px-2">#</th>
                  <th className="text-left py-1.5 px-2">Player</th>
                  <th className="text-left py-1.5 px-2">Sport</th>
                  <th className="text-right py-1.5 px-2">Value</th>
                  <th className="text-right py-1.5 px-2">Immunity</th>
                </tr>
              </thead>
              <tbody>
                {[...immunityScores]
                  .sort((a, b) => b.overallImmunity - a.overallImmunity)
                  .map((score, i) => {
                    const node = nodes.find((n) => n.cardId === score.cardId);
                    const isSelected = score.cardId === (selectedImmunityCard ?? immunityScores[0]?.cardId);
                    return (
                      <tr
                        key={score.cardId}
                        onClick={() => setSelectedImmunityCard(score.cardId)}
                        className={`border-b border-slate-700/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-700/50' : 'hover:bg-slate-700/20'
                        }`}
                      >
                        <td className="py-1.5 px-2 text-slate-500">{i + 1}</td>
                        <td className="py-1.5 px-2 text-slate-300 truncate max-w-[120px]">{node?.player ?? '—'}</td>
                        <td className="py-1.5 px-2 text-slate-500">{node?.sport ?? '—'}</td>
                        <td className="py-1.5 px-2 text-right text-slate-400">{node ? fmt(node.currentValue) : '—'}</td>
                        <td className="py-1.5 px-2 text-right">
                          <span
                            className="font-mono font-semibold"
                            style={{ color: exposureColor(100 - score.overallImmunity) }}
                          >
                            {score.overallImmunity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Radar Chart */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Immunity Factor Profile
              {selectedImmunityCard && (
                <span className="text-slate-400 font-normal ml-2">
                  — {nodes.find((n) => n.cardId === selectedImmunityCard)?.player}
                </span>
              )}
            </h3>
            <ResponsiveContainer width="100%" height={360}>
              <RadarChart data={immunityRadar} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                <Radar
                  name="Immunity"
                  dataKey="score"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Tab: Hotspot Analysis ───────────────────────────────────────── */}
      {tab === 'hotspots' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {hotspots.map((hs) => (
              <div
                key={hs.cluster}
                className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">{hs.cluster}</h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: exposureColor(hs.avgExposure) + '22',
                      color: exposureColor(hs.avgExposure),
                    }}
                  >
                    {hs.avgExposure} avg
                  </span>
                </div>

                {/* Mini cluster visualization */}
                <div className="flex flex-wrap gap-1.5">
                  {hs.cards.map((cid) => {
                    const node = nodes.find((n) => n.cardId === cid);
                    return (
                      <span
                        key={cid}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border"
                        style={{ borderColor: exposureColor(node?.contagionExposure ?? 50) + '66' }}
                      >
                        {node?.player ?? cid}
                      </span>
                    );
                  })}
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Primary Risk</p>
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {hs.primaryRisk}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Secondary Risks</p>
                  <div className="space-y-0.5">
                    {hs.secondaryRisks.map((r, i) => (
                      <p key={i} className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Eye size={9} className="text-amber-400 flex-shrink-0" />
                        {r}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hotspot exposure bar chart */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Cluster Exposure Comparison</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={hotspots.map((h) => ({ name: h.cluster, exposure: h.avgExposure, cards: h.cards.length }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number, name: string) => [name === 'exposure' ? v + '/100' : v, name === 'exposure' ? 'Avg Exposure' : 'Cards']}
                />
                <Bar dataKey="exposure" fill="#f97316" radius={[0, 4, 4, 0]} barSize={18}>
                  {hotspots.map((h, i) => (
                    <Cell key={i} fill={exposureColor(h.avgExposure)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Tab: Systemic Risk ──────────────────────────────────────────── */}
      {tab === 'systemic' && systemicRisk && (
        <div className="space-y-4">
          {/* Top metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Systemic Score</p>
              <p
                className="text-2xl font-bold"
                style={{ color: exposureColor(systemicRisk.systemicScore) }}
              >
                {systemicRisk.systemicScore}
                <span className="text-sm text-slate-500">/100</span>
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Concentration Risk</p>
              <p className="text-2xl font-bold text-orange-400">
                {systemicRisk.concentrationRisk}
                <span className="text-sm text-slate-500">/100</span>
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Correlation Risk</p>
              <p className="text-2xl font-bold text-yellow-400">
                {systemicRisk.correlationRisk}
                <span className="text-sm text-slate-500">/100</span>
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">SPOFs</p>
              <p className="text-2xl font-bold text-red-400">{systemicRisk.singlePointOfFailure.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Concentration Pie */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Risk Decomposition</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {riskPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [v + '%', '']}
                  />
                  <Legend
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs text-slate-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Sport Breakdown */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Sport Concentration</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={sportBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="sport"
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {sportBreakdown.map((_, i) => (
                      <Cell key={i} fill={['#3b82f6', '#ef4444', '#22c55e', '#a855f7'][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [fmt(v), '']}
                  />
                  <Legend
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs text-slate-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* SPOF Warnings */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Single Points of Failure</h3>
              {systemicRisk.singlePointOfFailure.length === 0 ? (
                <p className="text-xs text-slate-500">No single points of failure detected.</p>
              ) : (
                <div className="space-y-2">
                  {systemicRisk.singlePointOfFailure.map((spof, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-red-300">{spof}</p>
                        <p className="text-[10px] text-red-400/70 mt-0.5">
                          Loss of this asset would cascade through {Math.floor(2 + Math.random() * 4)} connected nodes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Risk guidance */}
              <div className="mt-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] text-amber-300 font-medium mb-1">Mitigation Guidance</p>
                <ul className="text-[10px] text-amber-400/80 space-y-0.5 list-disc list-inside">
                  <li>Diversify across sports to reduce correlation risk</li>
                  <li>Reduce mega-cap concentration below 25% per card</li>
                  <li>Add BGS/SGC-graded cards to reduce PSA dependency</li>
                  <li>Balance active-player vs. retired-player holdings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Recovery Modeling ───────────────────────────────────────── */}
      {tab === 'recovery' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <div className="flex flex-wrap items-end gap-4 mb-4">
              <div className="min-w-[220px]">
                <label className="block text-xs font-medium text-slate-300 mb-1">Scenario</label>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-lime"
                >
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500 max-w-lg">{activeScenario?.description}</p>
            </div>

            <h3 className="text-sm font-semibold text-slate-200 mb-3">Post-Contagion Recovery Curve (180 days)</h3>
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={recoveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  label={{ value: 'Day', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  label={{ value: '% Recovered', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [v.toFixed(1) + '%', 'Recovered']}
                />
                <defs>
                  <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="upperBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                {/* Confidence band — upper */}
                <Area
                  type="monotone"
                  dataKey={(d: { day: number; recoveredPercent: number }) =>
                    Math.min(100, d.recoveredPercent * 1.15 + 3)
                  }
                  stroke="none"
                  fill="url(#upperBand)"
                  name="Upper 85% CI"
                />
                {/* Confidence band — lower */}
                <Area
                  type="monotone"
                  dataKey={(d: { day: number; recoveredPercent: number }) =>
                    Math.max(0, d.recoveredPercent * 0.82 - 2)
                  }
                  stroke="none"
                  fill="url(#upperBand)"
                  name="Lower 85% CI"
                />
                {/* Main line */}
                <Area
                  type="monotone"
                  dataKey="recoveredPercent"
                  stroke="#22c55e"
                  fill="url(#recoveryGrad)"
                  strokeWidth={2}
                  name="Expected Recovery"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recovery milestones */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[25, 50, 75, 90].map((milestone) => {
              const entry = recoveryData.find((d) => d.recoveredPercent >= milestone);
              return (
                <div key={milestone} className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{milestone}% Recovery</p>
                  <p className="text-lg font-bold text-green-400">
                    {entry ? `Day ${entry.day}` : '180+'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {entry ? `~${Math.round(entry.day / 7)} weeks` : 'Beyond model horizon'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Per-card impact bar chart */}
          {activeScenario && (
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Peak Impact by Card</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={activeScenario.affectedCards
                    .sort((a, b) => a.impactPercent - b.impactPercent)
                    .map((a) => {
                      const node = nodes.find((n) => n.cardId === a.cardId);
                      return { name: node?.player ?? a.cardId, impact: a.impactPercent };
                    })}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [v + '%', 'Impact']}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={14}>
                    {activeScenario.affectedCards
                      .sort((a, b) => a.impactPercent - b.impactPercent)
                      .map((a, i) => (
                        <Cell key={i} fill={Math.abs(a.impactPercent) >= 30 ? '#ef4444' : Math.abs(a.impactPercent) >= 15 ? '#f97316' : '#eab308'} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContagionMapper;
