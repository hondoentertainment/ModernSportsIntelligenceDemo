// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, BarChart3, GitCompare, Target, Calendar, AlertTriangle } from 'lucide-react';
import {
  getRookieClassIndices,
  getClassDetail,
  getClassPerformance,
  compareClasses,
  getDraftCapitalEfficiency,
  getPositionROI,
  getPreDraftProjections,
  getHistoricalClassRankings,
  getInvestableIndex,
  type RookieClassIndex as RookieClassIndexType,
  type RookieIndexEntry,
  type ClassComparison,
  type DraftCapitalEfficiency,
  type DraftPositionROI,
  type PreDraftProjection,
  type Sport,
  type InvestableIndex,
} from '../lib/analytics/rookieClassIndexService.ts';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SPORT_LABELS: Record<Sport, string> = { nba: 'NBA', nfl: 'NFL', mlb: 'MLB', nhl: 'NHL' };
const TREND_ICONS: Record<string, React.ReactNode> = {
  up: <TrendingUp size={12} className="text-emerald-400" />,
  down: <TrendingDown size={12} className="text-red-400" />,
  stable: <Minus size={12} className="text-slate-400" />,
};
const BUY_RATING_STYLES: Record<string, string> = {
  strong_buy: 'bg-emerald-500/20 text-emerald-400',
  buy: 'bg-green-500/20 text-green-400',
  hold: 'bg-amber-500/20 text-amber-400',
  sell: 'bg-orange-500/20 text-orange-400',
  strong_sell: 'bg-red-500/20 text-red-400',
};

const RookieClassIndex: React.FC = () => {
  const [sport, setSport] = useState<Sport>('nba');
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [compareYear, setCompareYear] = useState<number>(2003);
  const [classes, setClasses] = useState<RookieClassIndexType[]>([]);
  const [classDetail, setClassDetail] = useState<RookieIndexEntry[]>([]);
  const [draftEfficiency, setDraftEfficiency] = useState<DraftCapitalEfficiency[]>([]);
  const [positionROI, setPositionROI] = useState<DraftPositionROI[]>([]);
  const [projections, setProjections] = useState<PreDraftProjection[]>([]);
  const [rankings, setRankings] = useState<RookieClassIndexType[]>([]);
  const [comparison, setComparison] = useState<ClassComparison | null>(null);
  const [investable, setInvestable] = useState<InvestableIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setClasses(getRookieClassIndices(sport));
      setClassDetail(getClassDetail(selectedYear, sport));
      setDraftEfficiency(getDraftCapitalEfficiency(sport));
      setPositionROI(getPositionROI(sport));
      setProjections(getPreDraftProjections(2026, sport));
      setRankings(getHistoricalClassRankings(sport));
      setComparison(compareClasses(selectedYear, compareYear, sport));
      setInvestable(getInvestableIndex(selectedYear, sport));
      setLoading(false);
    } catch {
      setError('Failed to load rookie class index data');
      setLoading(false);
    }
  }, [sport, selectedYear, compareYear]);

  const timeline = useMemo(() => {
    const perf = getClassPerformance(selectedYear, sport);
    return perf?.index_values || [];
  }, [selectedYear, sport]);

  const totalMarketCap = useMemo(() => {
    return classes.reduce((s, c) => s + c.aggregate_market_cap, 0);
  }, [classes]);

  const bestClass = useMemo(() => {
    return [...classes].sort((a, b) => b.change_pct - a.change_pct)[0];
  }, [classes]);

  const bestRookie = useMemo(() => {
    return classDetail.length > 0 ? classDetail[0] : null;
  }, [classDetail]);

  const availableYears = useMemo(() => {
    return classes.map((c) => c.year).sort((a, b) => b - a);
  }, [classes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Rookie Class Index...</p>
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Trophy size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Rookie Class &amp; Draft Capital Index</h1>
            <p className="text-sm text-slate-400">
              Predictive analytics, class comparisons &amp; draft efficiency &mdash; Phase 138
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sport}
            onChange={(e) => {
              const newSport = e.target.value as Sport;
              setSport(newSport);
              const newClasses = getRookieClassIndices(newSport);
              if (newClasses.length > 0) setSelectedYear(newClasses[0].year);
            }}
            className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg"
          >
            {(Object.entries(SPORT_LABELS) as [Sport, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y} Class</option>
            ))}
          </select>
          {investable && (
            <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase ${BUY_RATING_STYLES[investable.buy_rating]}`}>
              {investable.buy_rating.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Classes Tracked</p>
          <p className="text-3xl font-bold text-cyan-400">{classes.length}</p>
          <p className="text-xs text-slate-600 mt-1">{SPORT_LABELS[sport]} classes</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Market Cap</p>
          <p className="text-3xl font-bold text-white">${(totalMarketCap / 1000000).toFixed(0)}M</p>
          <p className="text-xs text-slate-600 mt-1">Aggregate value</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Best Class ROI</p>
          <p className="text-3xl font-bold text-emerald-400">+{bestClass?.change_pct || 0}%</p>
          <p className="text-xs text-slate-600 mt-1">{bestClass ? `${bestClass.year} class` : ''}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Rookie</p>
          <p className="text-3xl font-bold text-amber-400">{bestRookie ? `+${bestRookie.roi_since_draft}%` : 'N/A'}</p>
          <p className="text-xs text-slate-600 mt-1">{bestRookie?.player || ''}</p>
        </div>
      </div>

      {/* Class Performance Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-cyan-400" />
          {selectedYear} {SPORT_LABELS[sport]} Class Index Over Time
        </h2>
        {timeline.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => v.slice(2)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Index']}
                />
                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">Timeline data not available for this class.</p>
        )}
      </div>

      {/* Top Performers & Class Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            {selectedYear} {SPORT_LABELS[sport]} Top Performers
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {classDetail.map((entry, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded-full">
                      #{entry.draft_position > 0 ? entry.draft_position : 'IFA'}
                    </span>
                    <p className="text-sm font-bold text-white truncate">{entry.player}</p>
                    {TREND_ICONS[entry.trend]}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{entry.team} &bull; {entry.card_count} cards &bull; ${entry.avg_value} avg</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className={`text-sm font-bold ${entry.roi_since_draft >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.roi_since_draft >= 0 ? '+' : ''}{entry.roi_since_draft}%
                  </p>
                  <p className="text-[10px] text-slate-500">${(entry.total_market_cap / 1000000).toFixed(1)}M cap</p>
                </div>
              </div>
            ))}
            {classDetail.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No player data for this class/sport combination.</p>
            )}
          </div>
        </div>

        {/* Class Comparison */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <GitCompare size={18} className="text-purple-400" />
            Class Comparison
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-slate-400">Compare:</span>
            <span className="text-xs font-bold text-cyan-400">{selectedYear}</span>
            <span className="text-xs text-slate-500">vs</span>
            <select
              value={compareYear}
              onChange={(e) => setCompareYear(Number(e.target.value))}
              className="px-2 py-1 text-xs bg-slate-900/50 border border-slate-700/50 text-slate-300 rounded-lg"
            >
              {availableYears.filter((y) => y !== selectedYear).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {comparison && (
            <div className="space-y-3">
              {comparison.comparison_metrics.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <span className="text-xs text-slate-400 w-28">{m.metric}</span>
                  <div className="flex items-center gap-4 flex-1 justify-end">
                    <span className={`text-sm font-bold ${m.winner === 'a' ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {typeof m.value_a === 'number' ? m.value_a.toLocaleString() : m.value_a}
                    </span>
                    <span className="text-[10px] text-slate-600">vs</span>
                    <span className={`text-sm font-bold ${m.winner === 'b' ? 'text-purple-400' : 'text-slate-500'}`}>
                      {typeof m.value_b === 'number' ? m.value_b.toLocaleString() : m.value_b}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Draft Capital Efficiency Curve */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-emerald-400" />
          Draft Capital Efficiency &mdash; {SPORT_LABELS[sport]} (Pick # vs Avg ROI %)
        </h2>
        {positionROI.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={positionROI}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="position" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Pick #', position: 'insideBottom', offset: -2, style: { fontSize: 10, fill: '#64748b' } }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Avg ROI %', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number) => [`${value}%`, 'Avg ROI']}
                  labelFormatter={(label) => `Pick #${label}`}
                />
                <Area type="monotone" dataKey="avg_roi" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">Position ROI data not available for {SPORT_LABELS[sport]}.</p>
        )}
        {/* Efficiency brackets */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {draftEfficiency.slice(0, 6).map((d, idx) => (
            <div key={idx} className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <p className="text-xs font-bold text-white">{d.position_range}</p>
              <p className="text-sm font-bold text-emerald-400">{d.historical_roi_avg}% avg ROI</p>
              <p className="text-[10px] text-slate-500 mt-1">Best: {d.best_pick.player} ({d.best_pick.roi}%)</p>
              <p className="text-[10px] text-red-400/70">Worst: {d.worst_pick.player} ({d.worst_pick.roi}%)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Rankings & Pre-Draft Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Class Rankings */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" />
            All-Time {SPORT_LABELS[sport]} Class Rankings
          </h2>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {rankings.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold w-8 text-center ${
                    idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-slate-500'
                  }`}>
                    #{r.rank_all_time}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{r.year} Class</p>
                    <p className="text-[10px] text-slate-500">{r.top_performers.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{r.index_value.toLocaleString()}</p>
                  <p className={`text-[10px] ${r.change_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.change_pct >= 0 ? '+' : ''}{r.change_pct}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-Draft Projections */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" />
            2026 {SPORT_LABELS[sport]} Pre-Draft Projections
          </h2>
          {projections.length > 0 ? (
            <div className="space-y-3">
              {projections.map((p, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                        #{p.projected_position}
                      </span>
                      <span className="text-sm font-bold text-white">{p.player}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      p.risk_level === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                      p.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    }`}>{p.risk_level} risk</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{p.school_or_team} &bull; Comp: {p.comp_player}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-emerald-400">+{p.projected_roi_year1}% proj. Y1 ROI</span>
                    <span className="text-xs text-slate-500">${(p.projected_market_cap / 1000000).toFixed(0)}M proj. cap</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-slate-600">Confidence:</span>
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: `${p.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{Math.round(p.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No pre-draft projections available for {SPORT_LABELS[sport]}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RookieClassIndex;
