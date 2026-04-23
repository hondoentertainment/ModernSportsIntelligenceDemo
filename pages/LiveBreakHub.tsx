// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  AlertTriangle,
  Eye,
  Flame,
  Zap,
  Users,
  Calendar,
  BarChart3,
  Award,
  TrendingUp,
} from 'lucide-react';
import {
  getLiveBreaks,
  getRecentResults,
  getBreakSchedule,
  getViewerStats,
  getBreakerProfiles,
  getBreakFormats,
  getPlatformStats,
  getTopHitsToday,
  getHitTracker,
  getPlatformConfig,
  getFormatConfig,
  getStatusConfig,
  formatCurrency,
  type LiveBreak,
  type BreakResult,
  type BreakSchedule,
  type ViewerStats,
  type BreakerProfile,
  type HitTracker,
} from '../lib/social/liveBreakHubService.ts';
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
  LineChart,
  Line,
} from 'recharts';

const CHART_COLORS = ['#a78bfa', '#60a5fa', '#f87171', '#c084fc', '#34d399', '#fbbf24', '#22d3ee', '#fb923c'];

const LiveBreakHub: React.FC = () => {
  const [breaks, setBreaks] = useState<LiveBreak[]>([]);
  const [_results, setResults] = useState<BreakResult[]>([]);
  const [schedule, setSchedule] = useState<BreakSchedule[]>([]);
  const [viewerStats, setViewerStats] = useState<ViewerStats[]>([]);
  const [breakers, setBreakers] = useState<BreakerProfile[]>([]);
  const [hitTrackers, setHitTrackers] = useState<HitTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setBreaks(getLiveBreaks());
      setResults(getRecentResults());
      setSchedule(getBreakSchedule());
      setViewerStats(getViewerStats());
      setBreakers(getBreakerProfiles());
      const trackerIds = ['prod_001', 'prod_002', 'prod_003', 'prod_004', 'prod_005'];
      const trackers: HitTracker[] = [];
      trackerIds.forEach(id => {
        const t = getHitTracker(id);
        if (t) trackers.push(t);
      });
      setHitTrackers(trackers);
      setLoading(false);
    } catch {
      setError('Failed to load Live Break Hub data');
      setLoading(false);
    }
  }, []);

  const liveBreaks = useMemo(() => breaks.filter(b => b.status === 'live'), [breaks]);
  const totalViewers = useMemo(() => viewerStats.reduce((s, v) => s + v.totalViewers, 0), [viewerStats]);
  const topHits = useMemo(() => getTopHitsToday(), []);
  const platformStats = useMemo(() => getPlatformStats(), []);
  const formats = useMemo(() => getBreakFormats(), []);

  const viewerChartData = useMemo(() =>
    viewerStats.map(v => ({
      platform: getPlatformConfig(v.platform).label,
      viewers: v.totalViewers,
      peak: v.peakToday,
    })), [viewerStats]);

  const formatDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    breaks.forEach(b => {
      const label = getFormatConfig(b.format).label;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [breaks]);

  const viewerTrend = useMemo(() => [
    { time: '12:00', viewers: 4200 },
    { time: '13:00', viewers: 5800 },
    { time: '14:00', viewers: 7100 },
    { time: '15:00', viewers: 9400 },
    { time: '16:00', viewers: 12800 },
    { time: '17:00', viewers: 18200 },
    { time: '18:00', viewers: 22400 },
    { time: '19:00', viewers: 25100 },
    { time: '20:00', viewers: totalViewers },
    { time: '21:00', viewers: 21800 },
    { time: '22:00', viewers: 16500 },
    { time: '23:00', viewers: 9200 },
  ], [totalViewers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Live Break Hub...</p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <Radio size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Live Event &amp; Break Streaming Hub</h1>
            <p className="text-sm text-slate-400">Real-time card breaks, auctions &amp; streaming across all platforms &mdash; Phase 145</p>
          </div>
        </div>
        {liveBreaks.length > 0 && (
          <span className="px-3 py-1.5 text-sm font-bold bg-red-500/20 text-red-300 rounded-full animate-pulse">
            {liveBreaks.length} BREAKS LIVE
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Live Breaks</p>
          <p className="text-3xl font-bold text-red-400">{liveBreaks.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Viewers</p>
          <p className="text-3xl font-bold text-blue-400">{(totalViewers / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Platforms Active</p>
          <p className="text-3xl font-bold text-purple-400">{viewerStats.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Hit Today</p>
          <p className="text-2xl font-bold text-emerald-400">{topHits.length > 0 ? formatCurrency(topHits[0].estimatedValue) : '$0'}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Notable Hits</p>
          <p className="text-3xl font-bold text-amber-400">{topHits.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Upcoming</p>
          <p className="text-3xl font-bold text-brand-lime">{schedule.filter(s => s.status === 'scheduled').length}</p>
        </div>
      </div>

      {/* Live Now Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Radio size={18} className="text-red-400" />
          Live Now
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveBreaks.map(b => {
            const pc = getPlatformConfig(b.platform);
            const fc = getFormatConfig(b.format);
            const sc = getStatusConfig(b.status);
            return (
              <div
                key={b.id}
                className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${pc.bg} ${pc.text} ${pc.border} border`}>{pc.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${fc.bg} ${fc.text}`}>{fc.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text} animate-pulse`}>{sc.label}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-white truncate mb-1">{b.breakerName}</p>
                <p className="text-[10px] text-slate-500 mb-3 truncate">{b.product}</p>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-slate-500">Spot Price</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(b.spotPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Viewers</p>
                    <p className="text-sm font-bold text-red-400 flex items-center gap-1 justify-end">
                      <Eye size={12} /> {b.viewerCount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>{b.spotsFilled}/{b.spotsTotal} spots filled</span>
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(b.spotsFilled / b.spotsTotal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Break Spotlight */}
      {liveBreaks.length > 0 && (() => {
        const featured = liveBreaks.sort((a, b) => b.viewerCount - a.viewerCount)[0];
        const pc = getPlatformConfig(featured.platform);
        const fc = getFormatConfig(featured.format);
        return (
          <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Flame size={18} className="text-orange-400" />
              Featured Break Spotlight
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-2">{featured.title}</h3>
                <p className="text-sm text-slate-400 mb-4">Hosted by {featured.breakerName}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Platform</p>
                    <p className={`text-sm font-bold ${pc.text}`}>{pc.label}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Format</p>
                    <p className={`text-sm font-bold ${fc.text}`}>{fc.label}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Viewers</p>
                    <p className="text-sm font-bold text-red-400">{featured.viewerCount.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Spot Price</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(featured.spotPrice)}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center bg-slate-900/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2 uppercase">Spots Remaining</p>
                <p className="text-4xl font-bold text-emerald-400">{featured.spotsTotal - featured.spotsFilled}</p>
                <p className="text-xs text-slate-500 mt-1">of {featured.spotsTotal} total</p>
                <div className="w-full h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(featured.spotsFilled / featured.spotsTotal) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Break Format Guide */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-purple-400" />
          Break Format Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {formats.map(f => {
            const fc = getFormatConfig(f.format);
            return (
              <div key={f.format} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${fc.text}`}>{f.label}</span>
                  <span className="text-[10px] text-slate-500">{f.typicalPriceRange}</span>
                </div>
                <p className="text-[11px] text-slate-400">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Results + Top Hits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            Top Hits Today
          </h2>
          <div className="space-y-3">
            {topHits.slice(0, 8).map((hit, idx) => {
              const pc = getPlatformConfig(hit.platform);
              return (
                <div key={hit.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-600 w-5">#{idx + 1}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${pc.bg} ${pc.text} border ${pc.border} flex-shrink-0`}>{pc.label}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{hit.player}</p>
                      <p className="text-[10px] text-slate-500 truncate">{hit.cardPulled}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 flex-shrink-0 ml-2">{formatCurrency(hit.estimatedValue)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Viewer Distribution */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Eye size={18} className="text-blue-400" />
            Viewer Distribution by Platform
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewerChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="platform" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="viewers" name="Current" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="peak" name="Peak Today" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breaker Leaderboard */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Award size={18} className="text-amber-400" />
          Breaker Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Rank</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Breaker</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Platform</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Rating</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Total Breaks</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Hit Rate</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3">Followers</th>
              </tr>
            </thead>
            <tbody>
              {breakers
                .sort((a, b) => b.rating - a.rating)
                .map((b, idx) => {
                  const pc = getPlatformConfig(b.platform);
                  return (
                    <tr key={b.id} className="border-b border-slate-700/20">
                      <td className="py-3 pr-3">
                        <span className={`text-sm font-bold ${idx < 3 ? 'text-amber-400' : 'text-slate-600'}`}>#{idx + 1}</span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{b.name}</span>
                          {b.isVerified && <span className="text-[10px] text-blue-400">&#10003;</span>}
                        </div>
                        <p className="text-[10px] text-slate-500">{b.specialty}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${pc.bg} ${pc.text} border ${pc.border}`}>{pc.label}</span>
                      </td>
                      <td className="py-3 pr-3 text-center">
                        <span className="text-sm font-bold text-amber-400">{b.rating}</span>
                      </td>
                      <td className="py-3 pr-3 text-center">
                        <span className="text-sm text-white">{b.totalBreaks.toLocaleString()}</span>
                      </td>
                      <td className="py-3 pr-3 text-center">
                        <span className="text-sm font-bold text-emerald-400">{b.avgHitRate}%</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm text-slate-400">{(b.followers / 1000).toFixed(0)}K</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Schedule + Format Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            Upcoming Schedule
          </h2>
          <div className="space-y-3">
            {schedule.slice(0, 8).map(s => {
              const pc = getPlatformConfig(s.platform);
              const fc = getFormatConfig(s.format);
              const statusColors: Record<string, string> = {
                scheduled: 'text-blue-400 bg-blue-500/10',
                filling: 'text-amber-400 bg-amber-500/10',
                sold_out: 'text-red-400 bg-red-500/10',
              };
              return (
                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${pc.bg} ${pc.text} border ${pc.border} flex-shrink-0`}>{pc.label}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{s.breakerName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{s.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${fc.bg} ${fc.text}`}>{fc.label}</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(s.estimatedSpotPrice)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusColors[s.status] || ''}`}>
                      {s.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-400" />
            Break Format Popularity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {formatDistribution.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {formatDistribution.map((entry, idx) => (
              <span key={entry.name} className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hit Tracker Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-emerald-400" />
          Hit Tracker by Product
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hitTrackers.map(ht => (
            <div key={ht.productId} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-2 truncate">{ht.productName}</h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">Opened</p>
                  <p className="text-sm font-bold text-white">{ht.totalOpened.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">Hit Rate</p>
                  <p className="text-sm font-bold text-emerald-400">{ht.hitRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">Avg Value</p>
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(ht.avgBoxValue)}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 mb-2">
                <p className="text-[10px] text-slate-500">Best Pull</p>
                <p className="text-xs text-white font-bold truncate">{ht.bestPull}</p>
                <p className="text-[10px] text-emerald-400">{formatCurrency(ht.bestPullValue)}</p>
              </div>
              <div className="space-y-1">
                {ht.recentPulls.slice(0, 3).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 truncate flex-1 mr-2">{p.card}</span>
                    <span className="text-emerald-400 font-bold flex-shrink-0">{formatCurrency(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Stats + Viewer Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Users size={18} className="text-cyan-400" />
            Platform Comparison
          </h2>
          <div className="space-y-3">
            {platformStats
              .filter(p => p.liveBreaks > 0 || p.totalViewers > 0)
              .sort((a, b) => b.totalViewers - a.totalViewers)
              .map(p => {
                const pc = getPlatformConfig(p.platform);
                const viewerPct = totalViewers > 0 ? (p.totalViewers / totalViewers) * 100 : 0;
                return (
                  <div key={p.platform} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${pc.bg} ${pc.text} border ${pc.border} flex-shrink-0 w-24 text-center`}>{pc.label}</span>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${viewerPct}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-white font-bold">{p.totalViewers.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">{p.liveBreaks} live</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Viewer Trends Today
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewerTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`${value.toLocaleString()} viewers`, 'Viewers']}
                />
                <Line type="monotone" dataKey="viewers" stroke="#84cc16" strokeWidth={2} dot={{ fill: '#84cc16', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBreakHub;
