// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Crown,
  AlertTriangle,
  TrendingUp,
  Layers,
  Bell,
  Search,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Eye,
  ShoppingCart,
  Tag,
  Award,
  Activity,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
  getCollectorGraph,
  getInfluencerLeaderboard,
  getHerdSignals,
  getAllTrendAdoptionCurves,
  getAllCommunityClusters,
  getInfluencerAlerts,
  getMarketMomentum,
  getCollectorProfile,
  getCollectorPath,
  getNodeEdges,
  formatCurrency,
  type CollectorNode,
  type SocialEdge,
  type HerdSignal,
  type InfluencerAlert,
  type TrendAdoptionCurve,
  type CommunityCluster,
  type CollectorTier,
  type MarketMomentum,
  type CollectorPath,
} from '../lib/social/socialGraphService.ts';

// ---- Constants ----

type TabId = 'network' | 'influencers' | 'herd' | 'trends' | 'clusters' | 'alerts';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: 'network', label: 'Network Map', icon: <Users size={16} /> },
  { id: 'influencers', label: 'Influencer Board', icon: <Crown size={16} /> },
  { id: 'herd', label: 'Herd Detection', icon: <AlertTriangle size={16} /> },
  { id: 'trends', label: 'Trend Adoption', icon: <TrendingUp size={16} /> },
  { id: 'clusters', label: 'Community Clusters', icon: <Layers size={16} /> },
  { id: 'alerts', label: 'Smart Alerts', icon: <Bell size={16} /> },
];

const TIER_CONFIG: Record<CollectorTier, { color: string; bg: string; border: string; label: string }> = {
  whale: { color: 'text-purple-300', bg: 'bg-purple-500/20', border: 'border-purple-500/40', label: 'Whale' },
  shark: { color: 'text-blue-300', bg: 'bg-blue-500/20', border: 'border-blue-500/40', label: 'Shark' },
  dolphin: { color: 'text-teal-300', bg: 'bg-teal-500/20', border: 'border-teal-500/40', label: 'Dolphin' },
  fish: { color: 'text-green-300', bg: 'bg-green-500/20', border: 'border-green-500/40', label: 'Fish' },
  minnow: { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/40', label: 'Minnow' },
};

const TIER_NODE_COLORS: Record<CollectorTier, string> = {
  whale: '#a855f7',
  shark: '#3b82f6',
  dolphin: '#14b8a6',
  fish: '#22c55e',
  minnow: '#6b7280',
};

const EDGE_TYPE_COLORS: Record<string, string> = {
  follows: '#6366f1',
  traded: '#f59e0b',
  'co-collects': '#10b981',
  rival: '#ef4444',
};

const HERD_TYPE_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  accumulation: { color: 'text-green-400', bg: 'bg-green-500/20', icon: <ShoppingCart size={14} /> },
  distribution: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: <Tag size={14} /> },
  FOMO: { color: 'text-red-400', bg: 'bg-red-500/20', icon: <Zap size={14} /> },
  'panic-sell': { color: 'text-rose-400', bg: 'bg-rose-500/20', icon: <AlertTriangle size={14} /> },
};

const PHASE_COLORS: Record<string, string> = {
  innovator: '#8b5cf6',
  'early-adopter': '#3b82f6',
  'early-majority': '#14b8a6',
  'late-majority': '#f59e0b',
  laggard: '#6b7280',
};

// ---- Helper Components ----

function TierBadge({ tier }: { tier: CollectorTier }) {
  const cfg = TIER_CONFIG[tier];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function MiniSparkline({ data, color, height = 28 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`)
    .join(' ');
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
}

function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// ---- Force-Directed Graph Layout ----

interface GraphNodePos {
  id: string;
  x: number;
  y: number;
  radius: number;
  node: CollectorNode;
}

function computeForceLayout(
  nodes: CollectorNode[],
  edges: SocialEdge[],
  width: number,
  height: number
): GraphNodePos[] {
  // Initial circular layout
  const cx = width / 2;
  const cy = height / 2;
  const layoutRadius = Math.min(width, height) * 0.38;
  const positions: { id: string; x: number; y: number; vx: number; vy: number }[] = nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    return {
      id: n.id,
      x: cx + layoutRadius * Math.cos(angle),
      y: cy + layoutRadius * Math.sin(angle),
      vx: 0,
      vy: 0,
    };
  });

  const posMap = new Map(positions.map(p => [p.id, p]));
  const edgeSet = new Set(edges.map(e => `${e.from}-${e.to}`));

  // Simple force simulation (20 iterations)
  for (let iter = 0; iter < 20; iter++) {
    const repulsion = 8000;
    const attraction = 0.005;
    const damping = 0.85;

    // Repulsion between all pairs
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const a = posMap.get(edge.from);
      const b = posMap.get(edge.to);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * attraction * edge.strength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Center gravity
    for (const p of positions) {
      p.vx += (cx - p.x) * 0.002;
      p.vy += (cy - p.y) * 0.002;
      p.x += p.vx * damping;
      p.y += p.vy * damping;
      p.vx *= damping;
      p.vy *= damping;
      // Clamp to bounds
      p.x = Math.max(30, Math.min(width - 30, p.x));
      p.y = Math.max(30, Math.min(height - 30, p.y));
    }
  }

  const influenceMax = Math.max(...nodes.map(n => n.influenceScore));

  return positions.map(p => {
    const node = nodes.find(n => n.id === p.id)!;
    const normalizedInfluence = node.influenceScore / influenceMax;
    const radius = 6 + normalizedInfluence * 18;
    return { id: p.id, x: p.x, y: p.y, radius, node };
  });
}

// ---- Tab: Network Map ----

function NetworkMapTab({
  nodes,
  edges,
}: {
  nodes: CollectorNode[];
  edges: SocialEdge[];
}) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [edgeFilter, setEdgeFilter] = useState<string>('all');

  const graphWidth = 800;
  const graphHeight = 520;

  // Use top 30 by influence for readability
  const topNodes = useMemo(
    () => [...nodes].sort((a, b) => b.influenceScore - a.influenceScore).slice(0, 30),
    [nodes]
  );

  const topNodeIds = useMemo(() => new Set(topNodes.map(n => n.id)), [topNodes]);

  const filteredEdges = useMemo(() => {
    let e = edges.filter(ed => topNodeIds.has(ed.from) && topNodeIds.has(ed.to));
    if (edgeFilter !== 'all') e = e.filter(ed => ed.type === edgeFilter);
    return e;
  }, [edges, topNodeIds, edgeFilter]);

  const layout = useMemo(
    () => computeForceLayout(topNodes, filteredEdges, graphWidth, graphHeight),
    [topNodes, filteredEdges]
  );

  const layoutMap = useMemo(() => new Map(layout.map(l => [l.id, l])), [layout]);

  const selectedProfile = useMemo(
    () => (selectedNode ? getCollectorProfile(selectedNode) : null),
    [selectedNode]
  );

  const selectedEdges = useMemo(
    () => (selectedNode ? getNodeEdges(selectedNode).filter(e => topNodeIds.has(e.from) && topNodeIds.has(e.to)) : []),
    [selectedNode, topNodeIds]
  );

  return (
    <div className="space-y-4">
      {/* Edge type filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 mr-1">Filter edges:</span>
        {['all', 'follows', 'traded', 'co-collects', 'rival'].map(t => (
          <button
            key={t}
            onClick={() => setEdgeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              edgeFilter === t
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
          {Object.entries(EDGE_TYPE_COLORS).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1">
              <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: color }} />
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* SVG Graph */}
        <div className="flex-1 bg-gray-900/80 border border-gray-700/50 rounded-xl overflow-hidden relative">
          <svg
            width="100%"
            height={graphHeight}
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            className="w-full"
          >
            {/* Edges */}
            {filteredEdges.map((edge, i) => {
              const from = layoutMap.get(edge.from);
              const to = layoutMap.get(edge.to);
              if (!from || !to) return null;
              const isHighlighted =
                hoveredNode === edge.from ||
                hoveredNode === edge.to ||
                selectedNode === edge.from ||
                selectedNode === edge.to;
              return (
                <line
                  key={`edge-${i}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={EDGE_TYPE_COLORS[edge.type] || '#4b5563'}
                  strokeWidth={isHighlighted ? 2 : 0.8}
                  strokeOpacity={
                    hoveredNode || selectedNode
                      ? isHighlighted
                        ? 0.8
                        : 0.08
                      : edge.strength * 0.5
                  }
                />
              );
            })}

            {/* Nodes */}
            {layout.map(pos => {
              const isHovered = hoveredNode === pos.id;
              const isSelected = selectedNode === pos.id;
              const dimmed =
                (hoveredNode && !isHovered) || (selectedNode && !isSelected && !selectedEdges.some(e => e.from === pos.id || e.to === pos.id));
              return (
                <g
                  key={pos.id}
                  onMouseEnter={() => setHoveredNode(pos.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === pos.id ? null : pos.id)}
                  className="cursor-pointer"
                >
                  {/* Glow for hovered/selected */}
                  {(isHovered || isSelected) && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={pos.radius + 4}
                      fill="none"
                      stroke={TIER_NODE_COLORS[pos.node.tier]}
                      strokeWidth="2"
                      strokeOpacity="0.5"
                    />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={pos.radius}
                    fill={TIER_NODE_COLORS[pos.node.tier]}
                    fillOpacity={dimmed ? 0.15 : 0.8}
                    stroke={TIER_NODE_COLORS[pos.node.tier]}
                    strokeWidth={1}
                    strokeOpacity={dimmed ? 0.2 : 1}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={pos.radius > 12 ? 10 : 7}
                    fontWeight="bold"
                    opacity={dimmed ? 0.2 : 1}
                  >
                    {pos.node.avatarInitial}
                  </text>
                  {/* Username label for larger nodes */}
                  {pos.radius >= 14 && !dimmed && (
                    <text
                      x={pos.x}
                      y={pos.y + pos.radius + 12}
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="8"
                    >
                      {pos.node.username}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredNode && !selectedNode && (() => {
            const pos = layoutMap.get(hoveredNode);
            if (!pos) return null;
            return (
              <div
                className="absolute bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs shadow-xl pointer-events-none z-10"
                style={{ left: pos.x + 20, top: pos.y - 10 }}
              >
                <div className="font-semibold text-white">{pos.node.username}</div>
                <div className="text-gray-400">
                  Influence: {pos.node.influenceScore} | {formatCurrency(pos.node.totalValue)}
                </div>
                <TierBadge tier={pos.node.tier} />
              </div>
            );
          })()}
        </div>

        {/* Profile Panel */}
        <div className="w-72 bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 space-y-3 shrink-0">
          {selectedProfile ? (
            <>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: TIER_NODE_COLORS[selectedProfile.tier] }}
                >
                  {selectedProfile.avatarInitial}
                </div>
                <div>
                  <div className="font-semibold text-white">{selectedProfile.username}</div>
                  <TierBadge tier={selectedProfile.tier} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-gray-500">Reputation</div>
                  <div className="text-white font-semibold">{selectedProfile.reputation}/100</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-gray-500">Influence</div>
                  <div className="text-white font-semibold">{selectedProfile.influenceScore}/100</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-gray-500">Portfolio</div>
                  <div className="text-white font-semibold">{formatCurrency(selectedProfile.totalValue)}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-gray-500">Cards</div>
                  <div className="text-white font-semibold">{selectedProfile.cardCount.toLocaleString()}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-gray-500">Followers</div>
                  <div className="text-white font-semibold">{selectedProfile.followerCount.toLocaleString()}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-gray-500">Trades</div>
                  <div className="text-white font-semibold">{selectedProfile.tradeCount.toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Specialty</div>
                <div className="flex flex-wrap gap-1">
                  {selectedProfile.specialty.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-300">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Connections ({selectedEdges.length})</div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {selectedEdges.slice(0, 8).map((e, i) => {
                    const otherId = e.from === selectedNode ? e.to : e.from;
                    const other = getCollectorProfile(otherId);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: EDGE_TYPE_COLORS[e.type] }}
                        />
                        <span className="text-gray-300">{other?.username || otherId}</span>
                        <span className="text-gray-600 ml-auto">{e.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm py-12">
              <Eye size={32} className="mb-2 opacity-40" />
              <span>Click a node to view collector profile</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Tab: Influencer Board ----

function InfluencerBoardTab({ leaderboard }: { leaderboard: CollectorNode[] }) {
  const sparkData = useMemo(() => {
    // Generate synthetic weekly influence data per collector
    const map: Record<string, number[]> = {};
    for (const c of leaderboard) {
      const base = c.influenceScore;
      map[c.id] = Array.from({ length: 12 }, (_, i) =>
        Math.max(0, Math.min(100, base - 8 + Math.sin(i * 0.9 + base) * 6 + i * 0.5))
      );
    }
    return map;
  }, [leaderboard]);

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700/50 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-4 py-3 w-10">#</th>
              <th className="text-left px-4 py-3">Collector</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-right px-4 py-3">Influence</th>
              <th className="text-right px-4 py-3">Followers</th>
              <th className="text-right px-4 py-3">Portfolio</th>
              <th className="text-right px-4 py-3">Reputation</th>
              <th className="text-right px-4 py-3">Trades</th>
              <th className="text-center px-4 py-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((c, i) => (
              <tr
                key={c.id}
                className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors"
              >
                <td className="px-4 py-3 text-gray-500 font-mono">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: TIER_NODE_COLORS[c.tier] }}
                    >
                      {c.avatarInitial}
                    </div>
                    <span className="text-white font-medium">{c.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><TierBadge tier={c.tier} /></td>
                <td className="px-4 py-3 text-right">
                  <span className="text-white font-semibold">{c.influenceScore}</span>
                  <span className="text-gray-500">/100</span>
                </td>
                <td className="px-4 py-3 text-right text-gray-300">{c.followerCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(c.totalValue)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.reputation}%`,
                          backgroundColor: c.reputation >= 85 ? '#22c55e' : c.reputation >= 70 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs w-6 text-right">{c.reputation}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-300">{c.tradeCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <MiniSparkline
                    data={sparkData[c.id] || []}
                    color={TIER_NODE_COLORS[c.tier]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Tab: Herd Detection ----

function HerdDetectionTab({ signals }: { signals: HerdSignal[] }) {
  const [selectedSignal, setSelectedSignal] = useState<HerdSignal | null>(null);

  const magnitudeData = useMemo(
    () => signals.map(s => ({
      name: s.targetCard.length > 30 ? s.targetCard.slice(0, 30) + '...' : s.targetCard,
      magnitude: s.magnitude,
      type: s.type,
      fullName: s.targetCard,
    })),
    [signals]
  );

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of signals) {
      counts[s.type] = (counts[s.type] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [signals]);

  const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#f43f5e'];

  return (
    <div className="space-y-4">
      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Signal Magnitude by Card</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={magnitudeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#f3f4f6' }}
                formatter={(value: number) => [`${value}%`, 'Magnitude']}
                labelFormatter={(_: string, payload: Array<{ payload?: { fullName?: string } }>) =>
                  payload?.[0]?.payload?.fullName || ''
                }
              />
              <Bar dataKey="magnitude" radius={[0, 4, 4, 0]}>
                {magnitudeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.type === 'accumulation' ? '#22c55e'
                      : entry.type === 'FOMO' ? '#ef4444'
                      : entry.type === 'distribution' ? '#f59e0b'
                      : '#f43f5e'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Signal Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                stroke="none"
              >
                {typeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(value: number) => [value, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {typeDistribution.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Herd Signal Timeline</h3>
        <div className="space-y-2">
          {signals.map(signal => {
            const cfg = HERD_TYPE_CONFIG[signal.type];
            const isSelected = selectedSignal?.id === signal.id;
            return (
              <div key={signal.id}>
                <button
                  onClick={() => setSelectedSignal(isSelected ? null : signal)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isSelected ? 'bg-gray-700/50 border border-gray-600/50' : 'hover:bg-gray-700/30 border border-transparent'
                  }`}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${cfg.bg}`}>
                    {cfg.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase ${cfg.color}`}>{signal.type}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        signal.phase === 'early' ? 'bg-green-500/20 text-green-400'
                        : signal.phase === 'peak' ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {signal.phase}
                      </span>
                    </div>
                    <div className="text-sm text-gray-200 truncate">{signal.targetCard}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(signal.detectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${signal.magnitude}%`,
                            backgroundColor: signal.magnitude >= 80 ? '#ef4444' : signal.magnitude >= 60 ? '#f59e0b' : '#22c55e',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{signal.magnitude}%</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-gray-500 shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                </button>
                {isSelected && (
                  <div className="ml-10 mt-1 mb-2 px-3 py-2 bg-gray-900/50 rounded-lg text-xs space-y-1">
                    <div className="text-gray-400">
                      <span className="text-gray-500">Participants ({signal.participants.length}):</span>{' '}
                      {signal.participants.map(id => getCollectorProfile(id)?.username || id).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Tab: Trend Adoption ----

function TrendAdoptionTab({ trends }: { trends: TrendAdoptionCurve[] }) {
  const [selectedTrend, setSelectedTrend] = useState<string>(trends[0]?.trendId || '');

  const currentTrend = useMemo(
    () => trends.find(t => t.trendId === selectedTrend),
    [trends, selectedTrend]
  );

  const phaseOrder: TrendAdoptionCurve['phase'][] = ['innovator', 'early-adopter', 'early-majority', 'late-majority', 'laggard'];

  return (
    <div className="space-y-4">
      {/* Trend selector */}
      <div className="flex gap-2 flex-wrap">
        {trends.map(t => (
          <button
            key={t.trendId}
            onClick={() => setSelectedTrend(t.trendId)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              selectedTrend === t.trendId
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                : 'bg-gray-800 border-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {currentTrend && (
        <div className="grid grid-cols-3 gap-4">
          {/* S-Curve Chart */}
          <div className="col-span-2 bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-1">{currentTrend.name} - Adoption S-Curve</h3>
            <p className="text-xs text-gray-500 mb-3">
              Phase: <span style={{ color: PHASE_COLORS[currentTrend.phase] }} className="font-medium">{currentTrend.phase}</span>
              {' | '}Velocity: {currentTrend.velocity}%/day | Projected Peak: {new Date(currentTrend.projectedPeak).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={currentTrend.dataPoints}>
                <defs>
                  <linearGradient id="adoptionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PHASE_COLORS[currentTrend.phase]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PHASE_COLORS[currentTrend.phase]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Adoption %', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(value: number) => [`${value}%`, 'Adoption']}
                  labelFormatter={(day: number) => `Day ${day}`}
                />
                <Area
                  type="monotone"
                  dataKey="adoption"
                  stroke={PHASE_COLORS[currentTrend.phase]}
                  strokeWidth={2}
                  fill="url(#adoptionGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Phase details + all trends summary */}
          <div className="space-y-4">
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Phase Breakdown</h3>
              <div className="space-y-2">
                {phaseOrder.map(phase => {
                  const isCurrent = phase === currentTrend.phase;
                  return (
                    <div
                      key={phase}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                        isCurrent ? 'bg-gray-700/50 border border-gray-600/40' : ''
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PHASE_COLORS[phase] }}
                      />
                      <span className={isCurrent ? 'text-white font-medium' : 'text-gray-400'}>{phase}</span>
                      {isCurrent && (
                        <span className="ml-auto text-white font-semibold">{currentTrend.adoptionPercent}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">All Trends Overview</h3>
              <div className="space-y-2">
                {trends.map(t => (
                  <div key={t.trendId} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PHASE_COLORS[t.phase] }} />
                    <span className="text-gray-300 flex-1 truncate">{t.name}</span>
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${t.adoptionPercent}%`, backgroundColor: PHASE_COLORS[t.phase] }}
                      />
                    </div>
                    <span className="text-gray-500 w-8 text-right">{t.adoptionPercent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Tab: Community Clusters ----

function CommunityClustersTab({ clusters }: { clusters: CommunityCluster[] }) {
  const activityColors: Record<string, string> = {
    high: 'text-green-400 bg-green-500/20',
    medium: 'text-amber-400 bg-amber-500/20',
    low: 'text-gray-400 bg-gray-500/20',
  };

  const clusterMemberData = useMemo(
    () => clusters.map(c => ({
      name: c.name.length > 18 ? c.name.slice(0, 18) + '...' : c.name,
      members: c.members.length,
      avgValue: c.avgPortfolioValue,
      fullName: c.name,
    })),
    [clusters]
  );

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Cluster Comparison - Member Count vs Avg Portfolio</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={clusterMemberData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              formatter={(value: number, name: string) => [
                name === 'avgValue' ? formatCurrency(value) : value,
                name === 'avgValue' ? 'Avg Portfolio' : 'Members',
              ]}
              labelFormatter={(_: string, payload: Array<{ payload?: { fullName?: string } }>) =>
                payload?.[0]?.payload?.fullName || ''
              }
            />
            <Legend formatter={(value: string) => (value === 'members' ? 'Members' : 'Avg Portfolio')} />
            <Bar yAxisId="left" dataKey="members" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="avgValue" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cluster Cards */}
      <div className="grid grid-cols-2 gap-4">
        {clusters.map(cluster => (
          <div key={cluster.id} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 hover:border-gray-600/60 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-white">{cluster.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{cluster.specialty}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activityColors[cluster.activityLevel]}`}>
                {cluster.activityLevel}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                <div className="text-gray-500">Members</div>
                <div className="text-white font-semibold text-base">{cluster.members.length}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                <div className="text-gray-500">Avg Rep</div>
                <div className="text-white font-semibold text-base">{cluster.avgReputation}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                <div className="text-gray-500">Avg Value</div>
                <div className="text-white font-semibold text-base">{formatCurrency(cluster.avgPortfolioValue)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {cluster.members.slice(0, 5).map(memberId => {
                const member = getCollectorProfile(memberId);
                if (!member) return null;
                return (
                  <div
                    key={memberId}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-gray-600"
                    style={{ backgroundColor: TIER_NODE_COLORS[member.tier] }}
                    title={member.username}
                  >
                    {member.avatarInitial}
                  </div>
                );
              })}
              {cluster.members.length > 5 && (
                <span className="text-xs text-gray-500 ml-1">+{cluster.members.length - 5} more</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Tab: Smart Alerts ----

function SmartAlertsTab({ alerts }: { alerts: InfluencerAlert[] }) {
  const actionIcons: Record<string, React.ReactNode> = {
    bought: <ShoppingCart size={14} className="text-green-400" />,
    sold: <Tag size={14} className="text-red-400" />,
    graded: <Award size={14} className="text-blue-400" />,
    listed: <Eye size={14} className="text-amber-400" />,
  };

  const actionColors: Record<string, string> = {
    bought: 'text-green-400 bg-green-500/10 border-green-500/30',
    sold: 'text-red-400 bg-red-500/10 border-red-500/30',
    graded: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    listed: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  };

  const impactData = useMemo(
    () => alerts.slice(0, 12).map(a => ({
      card: a.card.length > 25 ? a.card.slice(0, 25) + '...' : a.card,
      impact: a.marketImpactPercent,
      reactionTime: a.followerReactionTime,
    })),
    [alerts]
  );

  return (
    <div className="space-y-4">
      {/* Impact chart */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Market Impact by Alert</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={impactData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="card" tick={{ fill: '#9ca3af', fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              formatter={(value: number, name: string) => [
                name === 'impact' ? `${value > 0 ? '+' : ''}${value}%` : `${value} min`,
                name === 'impact' ? 'Market Impact' : 'Reaction Time',
              ]}
            />
            <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
              {impactData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.impact >= 0 ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Feed */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Live Alert Feed</h3>
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const influencer = getCollectorProfile(alert.influencerId);
            const timeSince = Math.round(
              (Date.now() - new Date(alert.timestamp).getTime()) / (1000 * 60 * 60)
            );
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${actionColors[alert.action]}`}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: influencer ? TIER_NODE_COLORS[influencer.tier] : '#6b7280' }}
                >
                  {influencer?.avatarInitial || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">{influencer?.username || alert.influencerId}</span>
                    <span className="flex items-center gap-1 text-xs">
                      {actionIcons[alert.action]}
                      <span className="uppercase font-medium">{alert.action}</span>
                    </span>
                    {influencer && <TierBadge tier={influencer.tier} />}
                  </div>
                  <div className="text-sm text-gray-200 truncate">{alert.card}</div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {timeSince}h ago
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity size={11} />
                      Follower reaction: {alert.followerReactionTime}m
                    </span>
                  </div>
                </div>

                {/* Impact */}
                <div className="shrink-0 text-right">
                  <div className={`text-lg font-bold flex items-center gap-0.5 ${
                    alert.marketImpactPercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {alert.marketImpactPercent >= 0 ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    {Math.abs(alert.marketImpactPercent).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">market impact</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Main Page Component ----

const CollectorSocialGraph: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('network');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [graph, setGraph] = useState<{ nodes: CollectorNode[]; edges: SocialEdge[] }>({ nodes: [], edges: [] });
  const [leaderboard, setLeaderboard] = useState<CollectorNode[]>([]);
  const [herdSignals, setHerdSignals] = useState<HerdSignal[]>([]);
  const [trends, setTrends] = useState<TrendAdoptionCurve[]>([]);
  const [clusters, setClusters] = useState<CommunityCluster[]>([]);
  const [alerts, setAlerts] = useState<InfluencerAlert[]>([]);
  const [momentum, setMomentum] = useState<MarketMomentum | null>(null);

  useEffect(() => {
    try {
      setGraph(getCollectorGraph());
      setLeaderboard(getInfluencerLeaderboard());
      setHerdSignals(getHerdSignals());
      setTrends(getAllTrendAdoptionCurves());
      setClusters(getAllCommunityClusters());
      setAlerts(getInfluencerAlerts());
      setMomentum(getMarketMomentum());
      setLoading(false);
    } catch {
      setError('Failed to load Collector Social Graph data');
      setLoading(false);
    }
  }, []);

  const momentumSummary = useMemo((): { label: string; value: string; sub: string }[] => {
    if (!momentum) return [];
    return [
      { label: 'Market Momentum', value: `${momentum.overall > 0 ? '+' : ''}${momentum.overall}`, sub: momentum.sentiment },
      { label: 'Volume Change', value: `${momentum.volumeChange > 0 ? '+' : ''}${momentum.volumeChange}%`, sub: '24h' },
      { label: 'Active Traders', value: momentum.activeTraders24h.toLocaleString(), sub: 'last 24h' },
      { label: 'Collector Network', value: graph.nodes.length.toString(), sub: `${graph.edges.length} connections` },
      { label: 'Herd Signals', value: herdSignals.length.toString(), sub: 'detected this week' },
      { label: 'Influencer Alerts', value: alerts.length.toString(), sub: 'last 7 days' },
    ];
  }, [momentum, graph, herdSignals, alerts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading Social Graph...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center max-w-md">
          <AlertTriangle size={32} className="mx-auto mb-2 text-red-400" />
          <div className="text-red-300 font-medium">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users size={24} className="text-indigo-400" />
              Collector Social Graph
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Map collector networks, detect herd behavior, and track influencer impact on the market.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              momentum?.sentiment === 'bullish'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : momentum?.sentiment === 'bearish'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              <Activity size={12} />
              Market: {momentum?.sentiment || 'neutral'}
            </span>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-6 gap-3">
          {momentumSummary.map((kpi, i) => (
            <StatCard key={i} label={kpi.label} value={kpi.value} sub={kpi.sub} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'network' && (
            <NetworkMapTab nodes={graph.nodes} edges={graph.edges} />
          )}
          {activeTab === 'influencers' && (
            <InfluencerBoardTab leaderboard={leaderboard} />
          )}
          {activeTab === 'herd' && (
            <HerdDetectionTab signals={herdSignals} />
          )}
          {activeTab === 'trends' && (
            <TrendAdoptionTab trends={trends} />
          )}
          {activeTab === 'clusters' && (
            <CommunityClustersTab clusters={clusters} />
          )}
          {activeTab === 'alerts' && (
            <SmartAlertsTab alerts={alerts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectorSocialGraph;
