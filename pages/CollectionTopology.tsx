import React, { useState, useMemo } from 'react';
import {
  Hexagon,
  AlertTriangle,
  Shield,
  Activity,
  Eye,
  Layers,
  Target,
  Zap,
  BarChart3,
  TrendingDown,
} from 'lucide-react';
import {
  getTopologyHoles,
  getTopologyClusters,
  getTopologyNodes,
  getTopologyStats,
  getResilienceScenarios,
  getSeverityColor,
  getDimensionLabel,
} from '../lib/collectionTopologyService';

const CollectionTopology: React.FC = () => {
  const holes = useMemo(() => getTopologyHoles(), []);
  const clusters = useMemo(() => getTopologyClusters(), []);
  const nodes = useMemo(() => getTopologyNodes(), []);
  const stats = useMemo(() => getTopologyStats(), []);
  const scenarios = useMemo(() => getResilienceScenarios(), []);
  const [activeTab, setActiveTab] = useState<'overview' | 'holes' | 'clusters' | 'resilience'>('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Hexagon size={22} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Collection Topology Mapper</h1>
              <p className="text-slate-400 text-sm">
                Persistent homology analysis revealing structural gaps invisible to traditional portfolio metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Betti Numbers & Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Nodes</p>
            <p className="text-white font-bold text-3xl">{stats.totalNodes}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Clusters</p>
            <p className="text-white font-bold text-3xl">{stats.totalClusters}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Holes (β₁)</p>
            <p className="text-red-400 font-bold text-3xl">{stats.bettiNumbers.b1}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Voids (β₂)</p>
            <p className="text-amber-400 font-bold text-3xl">{stats.bettiNumbers.b2}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Resilience</p>
            <p className={`font-bold text-3xl ${stats.topologicalResilience >= 70 ? 'text-green-400' : stats.topologicalResilience >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {stats.topologicalResilience}%
            </p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Structural</p>
            <p className={`font-bold text-3xl ${stats.structuralScore >= 70 ? 'text-green-400' : stats.structuralScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {stats.structuralScore}%
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['overview', 'holes', 'clusters', 'resilience'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* 3D Topology Visualization (simplified as scatter) */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Hexagon size={16} className="text-indigo-400" />
                Topological Space Projection
              </h3>
              <div className="relative h-80 bg-slate-800/30 rounded-xl overflow-hidden">
                {/* Cluster backgrounds */}
                {clusters.map(cluster => {
                  const clusterNodes = nodes.filter(n => n.cluster === cluster.id);
                  if (clusterNodes.length === 0) return null;
                  const avgX = clusterNodes.reduce((s, n) => s + n.x, 0) / clusterNodes.length;
                  const avgY = clusterNodes.reduce((s, n) => s + n.y, 0) / clusterNodes.length;
                  return (
                    <div
                      key={cluster.id}
                      className="absolute rounded-full opacity-10"
                      style={{
                        left: `${avgX - 8}%`,
                        top: `${avgY - 8}%`,
                        width: '16%',
                        height: '16%',
                        backgroundColor: cluster.color,
                      }}
                    />
                  );
                })}
                {/* Nodes */}
                {nodes.map(node => {
                  const cluster = clusters.find(c => c.id === node.cluster);
                  return (
                    <div
                      key={node.id}
                      className="absolute group cursor-pointer"
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full border border-white/20 transition-transform hover:scale-150"
                        style={{ backgroundColor: cluster?.color || '#64748b' }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 rounded px-2 py-0.5 text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        {node.cardName} (${node.value.toLocaleString()})
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3">
                {clusters.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-400 text-xs">{c.label} ({c.cardCount})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liquidity Deserts */}
            {stats.liquidityDeserts.length > 0 && (
              <div className="bg-slate-900 rounded-xl border border-amber-500/30 p-5">
                <h3 className="text-amber-400 font-semibold text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Liquidity Deserts Detected
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stats.liquidityDeserts.map((d, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-white font-semibold text-sm">{d.priceRange}</p>
                      <p className="text-slate-400 text-xs">{d.gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'holes' && (
          <div className="space-y-4">
            {holes.map(hole => (
              <div key={hole.id} className={`bg-slate-900 rounded-xl border p-5 ${
                hole.severity === 'critical' ? 'border-red-500/50' : hole.severity === 'moderate' ? 'border-amber-500/50' : 'border-slate-800'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityColor(hole.severity)}`}>
                        {hole.severity}
                      </span>
                      <div className="flex gap-1">
                        {hole.dimensions.map(d => (
                          <span key={d} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px]">{getDimensionLabel(d)}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-white font-semibold text-sm">{hole.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-[10px] uppercase">Financial Impact</p>
                    <p className="text-amber-400 text-sm">{hole.financialImpact}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-[10px] uppercase">Recommendation</p>
                    <p className="text-green-400 text-sm">{hole.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'clusters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map(cluster => (
              <div key={cluster.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cluster.color }} />
                  <h3 className="text-white font-semibold text-sm">{cluster.label}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Cards</p>
                    <p className="text-white font-bold text-xl">{cluster.cardCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Avg Value</p>
                    <p className="text-white font-bold text-xl">${cluster.avgValue.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-[10px] uppercase">Cohesion</span>
                    <span className="text-slate-400 text-xs">{cluster.cohesion}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cluster.cohesion}%`, backgroundColor: cluster.color }}
                    />
                  </div>
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  Dominant: <span className="text-indigo-400">{getDimensionLabel(cluster.dominantDimension)}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resilience' && (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Shield size={16} className="text-indigo-400" />
                Topological Resilience Score
              </h3>
              <div className="flex items-center gap-6 mb-4">
                <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center" style={{
                  borderColor: stats.topologicalResilience >= 70 ? '#4ade80' : stats.topologicalResilience >= 40 ? '#fbbf24' : '#f87171'
                }}>
                  <span className="text-3xl font-bold text-white">{stats.topologicalResilience}</span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">
                    Your collection can withstand <span className="text-white font-semibold">{Math.round(stats.topologicalResilience * 0.6)}%</span> of cards losing 50% value
                    before structural integrity fragments into disconnected components.
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Isolated outliers: {stats.isolatedOutliers} cards with no cluster affiliation
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((s, i) => (
                <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <h4 className="text-white font-semibold text-sm mb-2">{s.name}</h4>
                  <p className="text-slate-400 text-xs mb-3">{s.description}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Nodes Lost</p>
                      <p className="text-red-400 font-bold">{s.nodesLost}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Resilience After</p>
                      <p className={`font-bold ${s.resilienceAfter >= 50 ? 'text-green-400' : 'text-red-400'}`}>{s.resilienceAfter}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Fragments</p>
                      <p className="text-amber-400 font-bold">{s.fragmentsCreated}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionTopology;
