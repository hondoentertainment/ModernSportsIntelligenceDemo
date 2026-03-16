import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  type Sport,
  type ProspectLevel,
  type ProspectProfile,
  type PipelineStage,
  type DraftClassProjection,
  type ProspectComparison,
  type WatchlistAlert,
  type RiskRating,
  getProspects,
  getPipelineByStage,
  getDraftClassProjection,
  getProspectComparisons,
  getWatchlistAlerts,
} from '../lib/rookiePipelineService';

// ---- Constants ----

type TabId =
  | 'prospect-board'
  | 'pipeline-funnel'
  | 'draft-class'
  | 'comparables'
  | 'value-projections'
  | 'watchlist';

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'prospect-board', label: 'Prospect Board' },
  { id: 'pipeline-funnel', label: 'Pipeline Funnel' },
  { id: 'draft-class', label: 'Draft Class Preview' },
  { id: 'comparables', label: 'Comparable Players' },
  { id: 'value-projections', label: 'Value Projections' },
  { id: 'watchlist', label: 'Watchlist' },
];

const SPORTS: Sport[] = ['NFL', 'NBA', 'NHL', 'Soccer'];

const LEVELS: { value: ProspectLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'high-school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'minor-league', label: 'Minor League / CHL' },
  { value: 'international', label: 'International' },
  { value: 'g-league', label: 'G-League' },
  { value: 'ahl', label: 'AHL' },
  { value: 'mls-next', label: 'MLS Next' },
];

type SortField =
  | 'scoutGrade'
  | 'projectedDraftPosition'
  | 'cardValueProjection'
  | 'age'
  | 'riskRating';

const RISK_COLORS: Record<RiskRating, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'very-high': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const RISK_ORDER: Record<RiskRating, number> = {
  low: 1,
  medium: 2,
  high: 3,
  'very-high': 4,
};

const ALERT_ICONS: Record<WatchlistAlert['type'], string> = {
  promotion: '\u2B06',
  injury: '\uD83C\uDFE5',
  'stats-breakout': '\uD83D\uDD25',
  'draft-stock-rise': '\uD83D\uDCC8',
  'draft-stock-fall': '\uD83D\uDCC9',
};

const ALERT_COLORS: Record<WatchlistAlert['type'], string> = {
  promotion: 'text-blue-400',
  injury: 'text-red-400',
  'stats-breakout': 'text-orange-400',
  'draft-stock-rise': 'text-green-400',
  'draft-stock-fall': 'text-red-400',
};

const STAGE_LABELS: Record<string, string> = {
  'high-school': 'High School',
  college: 'College',
  'minor-league': 'Minor League',
  international: 'International',
  'g-league': 'G-League',
  ahl: 'AHL',
  'mls-next': 'MLS Next',
};

const FUNNEL_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#10b981',
  '#06b6d4',
  '#eab308',
];

// ---- Helper Components ----

function ScoutGradeBar({ grade }: { grade: number }) {
  const pct = ((grade - 20) / 60) * 100;
  const color =
    grade >= 70
      ? 'bg-green-500'
      : grade >= 60
        ? 'bg-blue-500'
        : grade >= 50
          ? 'bg-yellow-500'
          : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-6">{grade}</span>
    </div>
  );
}

function RiskBadge({ risk }: { risk: RiskRating }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded border ${RISK_COLORS[risk]}`}
    >
      {risk.replace('-', ' ')}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
      <span className="ml-3 text-slate-400 text-sm">Scanning pipeline...</span>
    </div>
  );
}

function formatCurrency(val: number): string {
  return val >= 1000 ? `$${(val / 1000).toFixed(1)}K` : `$${val}`;
}

// ---- Tab: Prospect Board ----

function ProspectBoardTab({
  prospects,
}: {
  prospects: ProspectProfile[];
}) {
  const [sortField, setSortField] = useState<SortField>('scoutGrade');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    const list = [...prospects];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'scoutGrade':
          cmp = a.scoutGrade - b.scoutGrade;
          break;
        case 'projectedDraftPosition':
          cmp = a.projectedDraftPosition - b.projectedDraftPosition;
          break;
        case 'cardValueProjection':
          cmp =
            a.cardValueProjection.median - b.cardValueProjection.median;
          break;
        case 'age':
          cmp = a.age - b.age;
          break;
        case 'riskRating':
          cmp = RISK_ORDER[a.riskRating] - RISK_ORDER[b.riskRating];
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [prospects, sortField, sortAsc]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortAsc((prev) => !prev);
      } else {
        setSortField(field);
        setSortAsc(field === 'projectedDraftPosition' || field === 'age');
      }
    },
    [sortField],
  );

  const sortArrow = (field: SortField) =>
    sortField === field ? (sortAsc ? ' \u25B2' : ' \u25BC') : '';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400 text-left">
            <th className="py-3 px-3 font-medium">Prospect</th>
            <th className="py-3 px-2 font-medium">Pos</th>
            <th className="py-3 px-2 font-medium">Level</th>
            <th className="py-3 px-2 font-medium">Team</th>
            <th
              className="py-3 px-2 font-medium cursor-pointer hover:text-slate-200"
              onClick={() => handleSort('age')}
            >
              Age{sortArrow('age')}
            </th>
            <th
              className="py-3 px-2 font-medium cursor-pointer hover:text-slate-200"
              onClick={() => handleSort('projectedDraftPosition')}
            >
              Proj. Pick{sortArrow('projectedDraftPosition')}
            </th>
            <th
              className="py-3 px-2 font-medium cursor-pointer hover:text-slate-200"
              onClick={() => handleSort('scoutGrade')}
            >
              Scout Grade{sortArrow('scoutGrade')}
            </th>
            <th
              className="py-3 px-2 font-medium cursor-pointer hover:text-slate-200"
              onClick={() => handleSort('cardValueProjection')}
            >
              Card Value (Med){sortArrow('cardValueProjection')}
            </th>
            <th className="py-3 px-2 font-medium">Range</th>
            <th
              className="py-3 px-2 font-medium cursor-pointer hover:text-slate-200"
              onClick={() => handleSort('riskRating')}
            >
              Risk{sortArrow('riskRating')}
            </th>
            <th className="py-3 px-2 font-medium">Comparable</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.id}
              className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
            >
              <td className="py-3 px-3">
                <span className="font-semibold text-slate-100">
                  {p.name}
                </span>
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                  {p.sport}
                </span>
              </td>
              <td className="py-3 px-2 text-slate-300">{p.position}</td>
              <td className="py-3 px-2 text-slate-400 text-xs">
                {STAGE_LABELS[p.currentLevel] ?? p.currentLevel}
              </td>
              <td className="py-3 px-2 text-slate-400 text-xs max-w-[120px] truncate">
                {p.team}
              </td>
              <td className="py-3 px-2 text-slate-300">{p.age}</td>
              <td className="py-3 px-2">
                <span className="font-mono text-blue-400">
                  #{p.projectedDraftPosition}
                </span>
              </td>
              <td className="py-3 px-2">
                <ScoutGradeBar grade={p.scoutGrade} />
              </td>
              <td className="py-3 px-2 font-mono text-green-400">
                {formatCurrency(p.cardValueProjection.median)}
              </td>
              <td className="py-3 px-2 text-xs text-slate-500">
                {formatCurrency(p.cardValueProjection.floor)} -{' '}
                {formatCurrency(p.cardValueProjection.ceiling)}
              </td>
              <td className="py-3 px-2">
                <RiskBadge risk={p.riskRating} />
              </td>
              <td className="py-3 px-2 text-slate-400 text-xs italic">
                {p.comparablePlayer}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="text-center text-slate-500 py-8">
          No prospects match the selected filters.
        </p>
      )}
    </div>
  );
}

// ---- Tab: Pipeline Funnel ----

function PipelineFunnelTab({
  stages,
  sport,
}: {
  stages: PipelineStage[];
  sport: Sport;
}) {
  if (stages.length === 0) {
    return (
      <p className="text-center text-slate-500 py-12">
        No pipeline data for {sport}.
      </p>
    );
  }

  const maxCount = Math.max(...stages.map((s) => s.prospects.length));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funnel visualization */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
            Pipeline Funnel &mdash; {sport}
          </h3>
          {stages.map((stage, idx) => {
            const widthPct = Math.max(
              30,
              (stage.prospects.length / maxCount) * 100,
            );
            return (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-24 text-right shrink-0">
                  {STAGE_LABELS[stage.stage]}
                </span>
                <div className="flex-1 flex justify-center">
                  <div
                    className="h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white transition-all"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor:
                        FUNNEL_COLORS[idx % FUNNEL_COLORS.length],
                      opacity: 0.85,
                    }}
                  >
                    {stage.prospects.length} prospect
                    {stage.prospects.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
            Stage Statistics
          </h3>
          <div className="space-y-2">
            {stages.map((stage, idx) => (
              <div
                key={stage.stage}
                className="flex items-center justify-between bg-slate-800/60 rounded-lg px-4 py-3 border border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        FUNNEL_COLORS[idx % FUNNEL_COLORS.length],
                    }}
                  />
                  <span className="text-sm text-slate-200">
                    {STAGE_LABELS[stage.stage]}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <span className="text-slate-400">
                    Avg Age:{' '}
                    <span className="text-slate-200 font-mono">
                      {stage.avgAge}
                    </span>
                  </span>
                  <span className="text-slate-400">
                    Avg Grade:{' '}
                    <span className="text-slate-200 font-mono">
                      {stage.avgScoutGrade}
                    </span>
                  </span>
                  <span className="text-slate-400">
                    Promo Rate:{' '}
                    <span className="text-green-400 font-mono">
                      {(stage.promotionRate * 100).toFixed(0)}%
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scatter chart: grade vs projected pick */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
          Scout Grade vs. Projected Draft Position
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="projectedDraftPosition"
              name="Proj. Pick"
              type="number"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{
                value: 'Projected Draft Position',
                position: 'insideBottom',
                offset: -5,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              dataKey="scoutGrade"
              name="Scout Grade"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={[50, 80]}
              label={{
                value: 'Scout Grade',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                value,
                name,
              ]}
              labelFormatter={() => ''}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Scatter
              data={stages.flatMap((s) => s.prospects)}
              fill="#3b82f6"
            >
              {stages
                .flatMap((s) => s.prospects)
                .map((p, i) => (
                  <Cell
                    key={p.id}
                    fill={
                      p.scoutGrade >= 70
                        ? '#22c55e'
                        : p.scoutGrade >= 65
                          ? '#3b82f6'
                          : '#f59e0b'
                    }
                  />
                ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---- Tab: Draft Class Preview ----

function DraftClassTab({
  projections,
}: {
  projections: Record<Sport, DraftClassProjection | null>;
}) {
  const sports = SPORTS.filter((s) => projections[s] !== null);

  const barData = useMemo(
    () =>
      sports.map((s) => {
        const p = projections[s]!;
        return {
          sport: s,
          totalValue: p.totalProjectedCardMarketValue,
          topProspect: p.topProspectValue,
          strength: p.classStrength,
          count: p.prospects.length,
        };
      }),
    [projections, sports],
  );

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sports.map((s) => {
          const p = projections[s]!;
          return (
            <div
              key={s}
              className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4"
            >
              <div className="text-sm font-semibold text-slate-300 mb-2">
                {s} &mdash; {p.year}
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {formatCurrency(p.totalProjectedCardMarketValue)}
              </div>
              <div className="text-xs text-slate-500">
                Total projected card market
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Top prospect ceiling:{' '}
                  <span className="text-blue-400 font-mono">
                    {formatCurrency(p.topProspectValue)}
                  </span>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Class Strength:
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-4 rounded-sm ${
                        i < p.classStrength
                          ? 'bg-blue-500'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono text-slate-300">
                  {p.classStrength}/10
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar chart: total projected market value by sport */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
          Projected Card Market Value by Sport
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barData}
            margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="sport"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [
                formatCurrency(value),
                'Value',
              ]}
            />
            <Bar dataKey="totalValue" name="Total Market Value" radius={[6, 6, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell
                  key={entry.sport}
                  fill={
                    ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'][i % 4]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top prospects table per sport */}
      {sports.map((s) => {
        const p = projections[s]!;
        const top5 = [...p.prospects]
          .sort(
            (a, b) =>
              b.cardValueProjection.ceiling -
              a.cardValueProjection.ceiling,
          )
          .slice(0, 5);
        return (
          <div key={s}>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              {s} Top 5 Projected Card Values
            </h3>
            <div className="space-y-2">
              {top5.map((pr, i) => (
                <div
                  key={pr.id}
                  className="flex items-center gap-4 bg-slate-800/40 rounded-lg px-4 py-2 border border-slate-700/30"
                >
                  <span className="text-lg font-bold text-slate-600 w-6">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-100">
                      {pr.name}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {pr.position}
                    </span>
                  </div>
                  <ScoutGradeBar grade={pr.scoutGrade} />
                  <div className="text-right">
                    <div className="text-sm font-mono text-green-400">
                      {formatCurrency(pr.cardValueProjection.ceiling)}
                    </div>
                    <div className="text-xs text-slate-500">ceiling</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Tab: Comparable Players ----

function ComparablesTab({
  prospects,
  comparisons,
}: {
  prospects: ProspectProfile[];
  comparisons: Map<string, ProspectComparison>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const prospectIds = useMemo(
    () =>
      prospects
        .filter((p) => comparisons.has(p.id))
        .sort((a, b) => b.scoutGrade - a.scoutGrade),
    [prospects, comparisons],
  );

  const selected = selectedId ?? prospectIds[0]?.id ?? null;
  const prospect = prospects.find((p) => p.id === selected);
  const comp = selected ? comparisons.get(selected) : null;

  const radarData = useMemo(() => {
    if (!prospect) return [];
    return prospect.keyMetrics.map((m) => ({
      metric: m.name,
      value: m.percentile,
    }));
  }, [prospect]);

  if (prospectIds.length === 0) {
    return (
      <p className="text-center text-slate-500 py-12">
        No comparable data available for selected filters.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prospect selector */}
      <div className="flex flex-wrap gap-2">
        {prospectIds.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              selected === p.id
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
            }`}
          >
            {p.name}
            <span className="ml-1 text-xs opacity-60">({p.sport})</span>
          </button>
        ))}
      </div>

      {prospect && comp && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar chart */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
              {prospect.name} &mdash; Skill Percentiles
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Radar
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Comparables list */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
              Historical Comparables
            </h3>
            <div className="space-y-3">
              {comp.comparables.map((c) => (
                <div
                  key={c.playerId}
                  className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-100">
                      {c.name}
                    </span>
                    <span className="text-xs font-mono text-blue-400">
                      {(c.similarity * 100).toFixed(0)}% match
                    </span>
                  </div>
                  {/* Similarity bar */}
                  <div className="w-full h-2 bg-slate-700 rounded-full mb-3">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${c.similarity * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mb-1">
                    {c.careerOutcome}
                  </div>
                  <div className="text-xs text-slate-500">
                    Peak card value:{' '}
                    <span className="text-green-400 font-mono">
                      {formatCurrency(c.peakCardValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trajectory line chart */}
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Projected Card Value Trajectory
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={[
                    {
                      year: 'Pre-Draft',
                      value: prospect.cardValueProjection.floor * 0.5,
                    },
                    {
                      year: 'Draft Night',
                      value: prospect.cardValueProjection.floor,
                    },
                    {
                      year: 'Year 1',
                      value: prospect.cardValueProjection.median,
                    },
                    {
                      year: 'Year 2',
                      value:
                        prospect.cardValueProjection.median * 1.2,
                    },
                    {
                      year: 'Peak',
                      value: prospect.cardValueProjection.ceiling,
                    },
                  ]}
                  margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Projected Value',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Tab: Value Projections ----

function ValueProjectionsTab({
  prospects,
}: {
  prospects: ProspectProfile[];
}) {
  const chartData = useMemo(() => {
    return [...prospects]
      .sort(
        (a, b) =>
          b.cardValueProjection.ceiling - a.cardValueProjection.ceiling,
      )
      .slice(0, 15)
      .map((p) => ({
        name: p.name.split(' ').pop(),
        fullName: p.name,
        floor: p.cardValueProjection.floor,
        median: p.cardValueProjection.median - p.cardValueProjection.floor,
        ceiling:
          p.cardValueProjection.ceiling - p.cardValueProjection.median,
        sport: p.sport,
      }));
  }, [prospects]);

  const areaData = useMemo(() => {
    const top5 = [...prospects]
      .sort(
        (a, b) =>
          b.cardValueProjection.ceiling - a.cardValueProjection.ceiling,
      )
      .slice(0, 5);
    const years = ['Pre-Draft', 'Draft', 'Yr 1', 'Yr 2', 'Yr 3', 'Peak'];
    return years.map((yr, i) => {
      const entry: Record<string, string | number> = { year: yr };
      top5.forEach((p) => {
        const multipliers = [0.3, 0.6, 1.0, 1.1, 1.3, 1.0];
        entry[p.name] = Math.round(
          p.cardValueProjection.median * multipliers[i],
        );
      });
      return entry;
    });
  }, [prospects]);

  const top5Names = useMemo(
    () =>
      [...prospects]
        .sort(
          (a, b) =>
            b.cardValueProjection.ceiling - a.cardValueProjection.ceiling,
        )
        .slice(0, 5)
        .map((p) => p.name),
    [prospects],
  );

  const lineColors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8">
      {/* Stacked bar: floor / median / ceiling range */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
          Card Value Range (Floor / Median / Ceiling)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, bottom: 5, left: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              type="number"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  floor: 'Floor',
                  median: 'Floor-to-Median',
                  ceiling: 'Median-to-Ceiling',
                };
                return [formatCurrency(value), labels[name] ?? name];
              }}
              labelFormatter={(label) => {
                const item = chartData.find((d) => d.name === label);
                return item?.fullName ?? label;
              }}
            />
            <Bar
              dataKey="floor"
              stackId="a"
              fill="#ef4444"
              name="floor"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="median"
              stackId="a"
              fill="#3b82f6"
              name="median"
            />
            <Bar
              dataKey="ceiling"
              stackId="a"
              fill="#22c55e"
              name="ceiling"
              radius={[0, 4, 4, 0]}
            />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  floor: 'Floor',
                  median: 'Floor \u2192 Median',
                  ceiling: 'Median \u2192 Ceiling',
                };
                return labels[value] ?? value;
              }}
              wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Area chart: top-5 value trajectories */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
          Top 5 Projected Value Trajectories
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={areaData}
            margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [
                formatCurrency(value),
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {top5Names.map((name, i) => (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stroke={lineColors[i]}
                fill={lineColors[i]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---- Tab: Watchlist ----

function WatchlistTab({
  alerts,
  prospects,
}: {
  alerts: WatchlistAlert[];
  prospects: ProspectProfile[];
}) {
  const prospectMap = useMemo(() => {
    const map = new Map<string, ProspectProfile>();
    prospects.forEach((p) => map.set(p.id, p));
    return map;
  }, [prospects]);

  return (
    <div className="space-y-3">
      {alerts.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          No alerts for selected filters.
        </p>
      )}
      {alerts.map((alert, idx) => {
        const prospect = prospectMap.get(alert.prospectId);
        return (
          <div
            key={`${alert.prospectId}-${idx}`}
            className="flex items-start gap-4 bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 hover:bg-slate-800/80 transition-colors"
          >
            {/* Significance indicator */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className={`text-xl ${ALERT_COLORS[alert.type]}`}>
                {ALERT_ICONS[alert.type]}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-sm ${
                      i < alert.significance
                        ? alert.significance >= 8
                          ? 'bg-red-500'
                          : alert.significance >= 6
                            ? 'bg-yellow-500'
                            : 'bg-slate-500'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {prospect && (
                  <span className="text-sm font-semibold text-slate-100">
                    {prospect.name}
                  </span>
                )}
                {prospect && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                    {prospect.sport}
                  </span>
                )}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded border ${
                    alert.type === 'draft-stock-rise' || alert.type === 'promotion'
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : alert.type === 'injury' || alert.type === 'draft-stock-fall'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                  }`}
                >
                  {alert.type.replace(/-/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-300">{alert.alert}</p>
              <span className="text-xs text-slate-500 mt-1 block">
                {alert.date}
              </span>
            </div>

            {prospect && (
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-500">Card value proj.</div>
                <div className="text-sm font-mono text-green-400">
                  {formatCurrency(prospect.cardValueProjection.median)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Main Component ----

const RookiePipelineScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('prospect-board');
  const [activeSport, setActiveSport] = useState<Sport>('NFL');
  const [levelFilter, setLevelFilter] = useState<ProspectLevel | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // Data state
  const [allProspects, setAllProspects] = useState<ProspectProfile[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [draftProjections, setDraftProjections] = useState<
    Record<Sport, DraftClassProjection | null>
  >({ NFL: null, NBA: null, NHL: null, Soccer: null });
  const [comparisons, setComparisons] = useState<
    Map<string, ProspectComparison>
  >(new Map());
  const [watchAlerts, setWatchAlerts] = useState<WatchlistAlert[]>([]);

  // Load data on mount and when sport changes
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      const [prospects, pipeline, alerts] = await Promise.all([
        getProspects(),
        getPipelineByStage(activeSport),
        getWatchlistAlerts(),
      ]);

      if (cancelled) return;

      setAllProspects(prospects);
      setPipelineStages(pipeline);
      setWatchAlerts(alerts);

      // Load draft projections for all sports
      const projPromises = SPORTS.map((s) =>
        getDraftClassProjection(s, 2025),
      );
      const projResults = await Promise.all(projPromises);
      if (cancelled) return;

      const projMap = { NFL: null as DraftClassProjection | null, NBA: null as DraftClassProjection | null, NHL: null as DraftClassProjection | null, Soccer: null as DraftClassProjection | null };
      SPORTS.forEach((s, i) => {
        projMap[s] = projResults[i];
      });
      setDraftProjections(projMap);

      // Load comparisons for known prospects
      const compIds = prospects
        .filter((p) => p.sport === activeSport)
        .slice(0, 10)
        .map((p) => p.id);
      const compResults = await Promise.all(
        compIds.map((id) => getProspectComparisons(id)),
      );
      if (cancelled) return;

      const compMap = new Map<string, ProspectComparison>();
      compResults.forEach((c) => {
        if (c) compMap.set(c.prospectId, c);
      });
      setComparisons(compMap);

      setLoading(false);
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [activeSport]);

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    let list = allProspects.filter((p) => p.sport === activeSport);
    if (levelFilter !== 'all') {
      list = list.filter((p) => p.currentLevel === levelFilter);
    }
    return list;
  }, [allProspects, activeSport, levelFilter]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    const sportProspectIds = new Set(
      allProspects.filter((p) => p.sport === activeSport).map((p) => p.id),
    );
    return watchAlerts.filter((a) => sportProspectIds.has(a.prospectId));
  }, [watchAlerts, allProspects, activeSport]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredProspects.length;
    const avgGrade =
      total > 0
        ? (
            filteredProspects.reduce((s, p) => s + p.scoutGrade, 0) / total
          ).toFixed(1)
        : '0';
    const totalMedian = filteredProspects.reduce(
      (s, p) => s + p.cardValueProjection.median,
      0,
    );
    const totalCeiling = filteredProspects.reduce(
      (s, p) => s + p.cardValueProjection.ceiling,
      0,
    );
    return { total, avgGrade, totalMedian, totalCeiling };
  }, [filteredProspects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-500/20">
          <svg
            className="w-6 h-6 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Rookie Pipeline Scanner
          </h1>
          <p className="text-sm text-slate-400">
            Venture-capital scouting for future card value &mdash; track
            prospects before they go pro
          </p>
        </div>
      </div>

      {/* Sport filter tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-slate-800/80 rounded-lg p-1 border border-slate-700/50">
          {SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                activeSport === sport
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        <select
          value={levelFilter}
          onChange={(e) =>
            setLevelFilter(e.target.value as ProspectLevel | 'all')
          }
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Prospects Tracked
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">
            {stats.total}
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Avg Scout Grade
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {stats.avgGrade}
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Total Median Value
          </div>
          <div className="text-2xl font-bold text-green-400 mt-1">
            {formatCurrency(stats.totalMedian)}
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Total Ceiling Value
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {formatCurrency(stats.totalCeiling)}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-700/50 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === 'prospect-board' && (
              <ProspectBoardTab prospects={filteredProspects} />
            )}
            {activeTab === 'pipeline-funnel' && (
              <PipelineFunnelTab
                stages={pipelineStages}
                sport={activeSport}
              />
            )}
            {activeTab === 'draft-class' && (
              <DraftClassTab projections={draftProjections} />
            )}
            {activeTab === 'comparables' && (
              <ComparablesTab
                prospects={filteredProspects}
                comparisons={comparisons}
              />
            )}
            {activeTab === 'value-projections' && (
              <ValueProjectionsTab prospects={filteredProspects} />
            )}
            {activeTab === 'watchlist' && (
              <WatchlistTab
                alerts={filteredAlerts}
                prospects={allProspects}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RookiePipelineScanner;
