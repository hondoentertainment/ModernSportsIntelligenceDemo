import React, { useState, useMemo, useCallback } from 'react';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Trophy,
  Clock,
  DollarSign,
  Layers,
  Info,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  getAllLegends,
  comparePlayers,
  getPlayerColor,
  formatCurrency,
  formatPercent,
  formatMultiple,
  rankByROI,
  type LegendPlayer,
  type NormalizedMetric,
  type HoldingPeriodReturn,
  type InflationAdjustedValue,
  type PlayerRanking,
} from '../lib/multiGenCompareService';

// ── Constants ────────────────────────────────────────────────────────────────────

type TabKey = 'overlay' | 'value' | 'holding' | 'inflation' | 'ranking';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overlay', label: 'Career Overlay', icon: <Layers className="w-4 h-4" /> },
  { key: 'value', label: 'Card Value Curves', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'holding', label: 'Holding Period', icon: <Clock className="w-4 h-4" /> },
  { key: 'inflation', label: 'Inflation-Adjusted', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'ranking', label: 'Era Ranking', icon: <Trophy className="w-4 h-4" /> },
];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

// ── Helper Components ────────────────────────────────────────────────────────────

function StatBadge({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-1.5">
      <span className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold" style={{ color: color ?? '#84cc16' }}>
        {value}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <GitCompare className="w-12 h-12 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function ChartTooltipContent({ active, payload, label, isCurrency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-300 font-medium mb-1.5">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 mb-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="text-slate-100 font-medium">
            {isCurrency ? formatCurrency(entry.value) : entry.value?.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Player Selector ──────────────────────────────────────────────────────────────

function PlayerSelector({
  allPlayers,
  selectedIds,
  onToggle,
}: {
  allPlayers: LegendPlayer[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sportGroups = useMemo(() => {
    const map = new Map<string, LegendPlayer[]>();
    for (const p of allPlayers) {
      const list = map.get(p.sport) ?? [];
      list.push(p);
      map.set(p.sport, list);
    }
    return map;
  }, [allPlayers]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200">Select Players to Compare</h3>
          <span className="text-xs text-slate-400">
            ({selectedIds.length}/{MAX_PLAYERS} selected, min {MIN_PLAYERS})
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-lime-400 flex items-center gap-1 transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Compact chip view */}
      <div className="flex flex-wrap gap-2">
        {allPlayers.map((player) => {
          const isSelected = selectedIds.includes(player.id);
          const isDisabled = !isSelected && selectedIds.length >= MAX_PLAYERS;
          const color = getPlayerColor(player.id);

          return (
            <button
              key={player.id}
              onClick={() => !isDisabled && onToggle(player.id)}
              disabled={isDisabled}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                border transition-all duration-200
                ${isSelected
                  ? 'border-lime-500/50 bg-lime-500/10 text-lime-300 shadow-sm shadow-lime-500/10'
                  : isDisabled
                    ? 'border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed opacity-50'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700'
                }
              `}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: isSelected ? color : '#475569' }}
              />
              {player.name}
              {isSelected && <Check className="w-3 h-3 text-lime-400" />}
            </button>
          );
        })}
      </div>

      {/* Expanded detail view */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {Array.from(sportGroups.entries()).map(([sport, players]) => (
            <div key={sport}>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {sport}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {players.map((player) => {
                  const isSelected = selectedIds.includes(player.id);
                  const isDisabled = !isSelected && selectedIds.length >= MAX_PLAYERS;
                  const color = getPlayerColor(player.id);

                  return (
                    <button
                      key={player.id}
                      onClick={() => !isDisabled && onToggle(player.id)}
                      disabled={isDisabled}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200 border
                        ${isSelected
                          ? 'border-lime-500/40 bg-lime-500/5'
                          : isDisabled
                            ? 'border-slate-700/50 bg-slate-800/30 opacity-40 cursor-not-allowed'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }
                      `}
                    >
                      <span
                        className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: isSelected ? color : '#475569' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200 truncate">
                            {player.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {player.position} &middot; {player.era} Era &middot; Draft {player.draftYear}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {player.keyCard.set} &middot; {player.keyCard.grade}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-slate-400">
                            Current: <span className="text-lime-400">{formatCurrency(player.keyCard.currentValue)}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Peak: <span className="text-yellow-400">{formatCurrency(player.keyCard.peakValue)}</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Career Overlay Tab ───────────────────────────────────────────────────────────

function CareerOverlayChart({ metrics, playerIds }: { metrics: NormalizedMetric[]; playerIds: string[] }) {
  // Pivot data: each career year becomes a row with columns per player
  const chartData = useMemo(() => {
    const yearMap = new Map<number, Record<string, any>>();
    for (const m of metrics) {
      if (!playerIds.includes(m.playerId)) continue;
      if (!yearMap.has(m.careerYear)) {
        yearMap.set(m.careerYear, { careerYear: m.careerYear });
      }
      const row = yearMap.get(m.careerYear)!;
      row[`${m.playerId}_value`] = m.cardValueNormalized;
      row[`${m.playerId}_perf`] = m.performanceIndex;
    }
    return Array.from(yearMap.values()).sort((a, b) => a.careerYear - b.careerYear);
  }, [metrics, playerIds]);

  const allPlayers = useMemo(() => getAllLegends(), []);

  if (!chartData.length) return <EmptyState message="No overlay data available" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
        <Info className="w-4 h-4 flex-shrink-0 text-lime-400" />
        <span>
          Career year 1 = rookie season. Card values are normalized to 0-100 scale (100 = player&apos;s all-time peak).
          Dashed lines show on-field performance index.
        </span>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-4">
          Normalized Card Value &amp; Performance by Career Year
        </h4>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="careerYear"
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              label={{ value: 'Career Year', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              label={{ value: 'Normalized (0-100)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              iconType="plainline"
            />
            {playerIds.map((pid) => {
              const player = allPlayers.find((p) => p.id === pid);
              const color = getPlayerColor(pid);
              return (
                <React.Fragment key={pid}>
                  <Line
                    type="monotone"
                    dataKey={`${pid}_value`}
                    name={`${player?.name ?? pid} Value`}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: color }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey={`${pid}_perf`}
                    name={`${player?.name ?? pid} Perf`}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray="6 3"
                    dot={false}
                    connectNulls
                  />
                </React.Fragment>
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Card Value Curves Tab ────────────────────────────────────────────────────────

function CardValueCurvesChart({ players }: { players: LegendPlayer[] }) {
  const chartData = useMemo(() => {
    // Gather all years across all players
    const yearSet = new Set<number>();
    for (const p of players) {
      for (const ph of p.keyCard.priceHistory) {
        yearSet.add(ph.year);
      }
    }
    const years = Array.from(yearSet).sort((a, b) => a - b);
    return years.map((year) => {
      const row: Record<string, any> = { year };
      for (const p of players) {
        // Find the closest data point at or before this year
        let val: number | undefined;
        for (const ph of p.keyCard.priceHistory) {
          if (ph.year <= year) val = ph.value;
        }
        if (val !== undefined) row[p.id] = val;
      }
      return row;
    });
  }, [players]);

  const [logScale, setLogScale] = useState(true);

  if (!players.length) return <EmptyState message="Select players to view value curves" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex-1 mr-4">
          <Info className="w-4 h-4 flex-shrink-0 text-lime-400" />
          <span>
            Absolute card values over calendar time. Use log scale to compare players with vastly different price levels.
          </span>
        </div>
        <button
          onClick={() => setLogScale(!logScale)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
            ${logScale
              ? 'border-lime-500/50 bg-lime-500/10 text-lime-300'
              : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
            }
          `}
        >
          {logScale ? 'Log Scale' : 'Linear Scale'}
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-4">
          Card Value Over Time ({logScale ? 'Log' : 'Linear'} Scale)
        </h4>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              scale={logScale ? 'log' : 'auto'}
              domain={logScale ? ['auto', 'auto'] : [0, 'auto']}
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => formatCurrency(v)}
              width={80}
            />
            <Tooltip content={<ChartTooltipContent isCurrency />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" />
            {players.map((p) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.id}
                name={p.name}
                stroke={getPlayerColor(p.id)}
                strokeWidth={2.5}
                dot={{ r: 3, fill: getPlayerColor(p.id) }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {players.map((p) => {
          const card = p.keyCard;
          const roi = ((card.currentValue - card.releasePrice) / card.releasePrice) * 100;
          return (
            <div
              key={p.id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getPlayerColor(p.id) }}
                />
                <span className="text-xs font-medium text-slate-200 truncate">{p.name}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Release</span>
                  <span className="text-slate-200">{formatCurrency(card.releasePrice)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Peak</span>
                  <span className="text-yellow-400">{formatCurrency(card.peakValue)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Current</span>
                  <span className="text-lime-400">{formatCurrency(card.currentValue)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Total ROI</span>
                  <span className={roi >= 0 ? 'text-lime-400' : 'text-red-400'}>
                    {formatPercent(roi)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Holding Period Tab ───────────────────────────────────────────────────────────

function HoldingPeriodChart({ returns }: { returns: HoldingPeriodReturn[] }) {
  const holdingPeriods = [1, 5, 10, 20];
  const [selectedPeriod, setSelectedPeriod] = useState(5);

  const filteredReturns = useMemo(
    () => returns.filter((r) => r.holdingYears === selectedPeriod),
    [returns, selectedPeriod]
  );

  const barData = useMemo(
    () =>
      filteredReturns.map((r) => ({
        name: r.playerName,
        annualized: r.annualizedReturn,
        nominal: r.nominalReturn,
        inflationAdj: r.inflationAdjustedReturn,
        drawdown: -r.peakDrawdown,
        color: getPlayerColor(r.playerId),
      })),
    [filteredReturns]
  );

  if (!returns.length) return <EmptyState message="Select players to see holding period analysis" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
        <Info className="w-4 h-4 flex-shrink-0 text-lime-400" />
        <span>
          Annualized returns (CAGR) for different holding periods. Drawdown shows maximum peak-to-trough loss during the period.
        </span>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {holdingPeriods.map((period) => {
          const hasData = returns.some((r) => r.holdingYears === period);
          return (
            <button
              key={period}
              onClick={() => hasData && setSelectedPeriod(period)}
              disabled={!hasData}
              className={`
                px-4 py-2 rounded-lg text-xs font-medium border transition-colors
                ${selectedPeriod === period
                  ? 'border-lime-500/50 bg-lime-500/10 text-lime-300'
                  : hasData
                    ? 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                    : 'border-slate-700 bg-slate-800/30 text-slate-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              {period}yr Hold
            </button>
          );
        })}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-4">
          {selectedPeriod}-Year Holding Period Returns (Annualized CAGR)
        </h4>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={barData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-xs">
                    <p className="text-slate-300 font-medium mb-1.5">{label}</p>
                    {payload.map((entry: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 mb-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: entry.color ?? '#84cc16' }}
                        />
                        <span className="text-slate-300">{entry.name}:</span>
                        <span className="text-slate-100 font-medium">
                          {entry.value?.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={0} stroke="#475569" />
            <Bar dataKey="annualized" name="Annualized Return" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`ann-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey="inflationAdj" name="Inflation-Adj Return" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`inf-${index}`} fill={entry.color} fillOpacity={0.45} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Player</th>
              <th className="text-right px-4 py-2.5 text-slate-400 font-medium">Start Value</th>
              <th className="text-right px-4 py-2.5 text-slate-400 font-medium">End Value</th>
              <th className="text-right px-4 py-2.5 text-slate-400 font-medium">Nominal</th>
              <th className="text-right px-4 py-2.5 text-slate-400 font-medium">CAGR</th>
              <th className="text-right px-4 py-2.5 text-slate-400 font-medium">Real Return</th>
              <th className="text-right px-4 py-2.5 text-slate-400 font-medium">Max DD</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.map((r) => (
              <tr key={r.playerId} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPlayerColor(r.playerId) }}
                    />
                    <span className="text-slate-200 font-medium">{r.playerName}</span>
                  </div>
                </td>
                <td className="text-right px-4 py-2.5 text-slate-300">{formatCurrency(r.startValue)}</td>
                <td className="text-right px-4 py-2.5 text-slate-300">{formatCurrency(r.endValue)}</td>
                <td className={`text-right px-4 py-2.5 font-medium ${r.nominalReturn >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                  {formatPercent(r.nominalReturn)}
                </td>
                <td className={`text-right px-4 py-2.5 font-medium ${r.annualizedReturn >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                  {formatPercent(r.annualizedReturn)}
                </td>
                <td className={`text-right px-4 py-2.5 font-medium ${r.inflationAdjustedReturn >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                  {formatPercent(r.inflationAdjustedReturn)}
                </td>
                <td className="text-right px-4 py-2.5 text-red-400 font-medium">
                  -{r.peakDrawdown.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Inflation-Adjusted Tab ───────────────────────────────────────────────────────

function InflationAdjustedChart({
  data,
  players,
}: {
  data: InflationAdjustedValue[];
  players: LegendPlayer[];
}) {
  const [showReal, setShowReal] = useState(true);
  const [showNominal, setShowNominal] = useState(true);

  const chartData = useMemo(() => {
    const yearMap = new Map<number, Record<string, any>>();
    for (const d of data) {
      if (!yearMap.has(d.year)) {
        yearMap.set(d.year, { year: d.year });
      }
      const row = yearMap.get(d.year)!;
      if (showNominal) row[`${d.playerId}_nom`] = d.nominalValue;
      if (showReal) row[`${d.playerId}_real`] = d.realValue;
    }
    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  }, [data, showReal, showNominal]);

  if (!data.length) return <EmptyState message="Select players to view inflation analysis" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex-1 min-w-[250px]">
          <Info className="w-4 h-4 flex-shrink-0 text-lime-400" />
          <span>
            Real values are adjusted to 2026 dollars using CPI-U data. The gap between nominal and real shows inflation&apos;s impact on returns.
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNominal(!showNominal)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
              ${showNominal
                ? 'border-lime-500/50 bg-lime-500/10 text-lime-300'
                : 'border-slate-600 bg-slate-700 text-slate-400 hover:border-slate-500'
              }
            `}
          >
            Nominal
          </button>
          <button
            onClick={() => setShowReal(!showReal)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
              ${showReal
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                : 'border-slate-600 bg-slate-700 text-slate-400 hover:border-slate-500'
              }
            `}
          >
            Real (2026$)
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-4">
          Nominal vs Inflation-Adjusted Card Values
        </h4>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis
              scale="log"
              domain={['auto', 'auto']}
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => formatCurrency(v)}
              width={80}
            />
            <Tooltip content={<ChartTooltipContent isCurrency />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" />
            {players.map((p) => (
              <React.Fragment key={p.id}>
                {showNominal && (
                  <Line
                    type="monotone"
                    dataKey={`${p.id}_nom`}
                    name={`${p.name} (Nominal)`}
                    stroke={getPlayerColor(p.id)}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: getPlayerColor(p.id) }}
                    connectNulls
                  />
                )}
                {showReal && (
                  <Line
                    type="monotone"
                    dataKey={`${p.id}_real`}
                    name={`${p.name} (Real 2026$)`}
                    stroke={getPlayerColor(p.id)}
                    strokeWidth={1.5}
                    strokeDasharray="6 3"
                    dot={{ r: 2, fill: getPlayerColor(p.id) }}
                    connectNulls
                  />
                )}
              </React.Fragment>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Inflation impact summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {players.map((p) => {
          const playerData = data.filter((d) => d.playerId === p.id);
          const latest = playerData[playerData.length - 1];
          const earliest = playerData[0];
          if (!latest || !earliest) return null;
          const inflationDrag = latest.nominalValue > 0
            ? ((latest.nominalValue - latest.realValue) / latest.nominalValue) * 100
            : 0;

          return (
            <div key={p.id} className="bg-slate-800 rounded-xl border border-slate-700 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getPlayerColor(p.id) }}
                />
                <span className="text-xs font-medium text-slate-200">{p.name}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Card Year</span>
                  <span className="text-slate-200">{p.keyCard.year}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Cumulative Inflation</span>
                  <span className="text-orange-400">{latest.cumulativeInflation.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Inflation Drag</span>
                  <span className="text-red-400">{inflationDrag.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Real Value (2026$)</span>
                  <span className="text-blue-400">{formatCurrency(latest.realValue)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Era Ranking Tab ──────────────────────────────────────────────────────────────

function EraRankingTable({
  rankings,
  selectedIds,
}: {
  rankings: PlayerRanking[];
  selectedIds: string[];
}) {
  type SortKey = 'rank' | 'totalROI' | 'annualizedROI' | 'peakMultiple' | 'currentMultiple' | 'sharpeRatio' | 'maxDrawdown' | 'holdingScore';

  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'rank' || key === 'maxDrawdown');
    }
  }, [sortKey, sortAsc]);

  const sorted = useMemo(() => {
    const arr = [...rankings];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return arr;
  }, [rankings, sortKey, sortAsc]);

  // All players ranking for context, plus filtered view
  const allRankings = useMemo(() => rankByROI(), []);
  const [showAll, setShowAll] = useState(false);
  const displayRankings = showAll ? allRankings : sorted;

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="text-right px-3 py-2.5 text-slate-400 font-medium cursor-pointer hover:text-slate-200 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-end gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortKey === field ? 'text-lime-400' : 'text-slate-500'}`} />
      </div>
    </th>
  );

  if (!rankings.length) return <EmptyState message="Select players to view rankings" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex-1 min-w-[250px]">
          <Info className="w-4 h-4 flex-shrink-0 text-lime-400" />
          <span>
            Rankings use a composite "Holding Score" factoring in annualized ROI, risk-adjusted returns (Sharpe-like ratio), and maximum drawdown.
          </span>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
            ${showAll
              ? 'border-lime-500/50 bg-lime-500/10 text-lime-300'
              : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
            }
          `}
        >
          {showAll ? 'Show Selected Only' : 'Show All Legends'}
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700">
              <th
                className="text-left px-3 py-2.5 text-slate-400 font-medium cursor-pointer hover:text-slate-200 transition-colors select-none"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center gap-1">
                  Rank
                  <ArrowUpDown className={`w-3 h-3 ${sortKey === 'rank' ? 'text-lime-400' : 'text-slate-500'}`} />
                </div>
              </th>
              <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Player</th>
              <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Sport</th>
              <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Era</th>
              <SortHeader label="Total ROI" field="totalROI" />
              <SortHeader label="CAGR" field="annualizedROI" />
              <SortHeader label="Peak x" field="peakMultiple" />
              <SortHeader label="Current x" field="currentMultiple" />
              <SortHeader label="Sharpe" field="sharpeRatio" />
              <SortHeader label="Max DD" field="maxDrawdown" />
              <SortHeader label="Score" field="holdingScore" />
            </tr>
          </thead>
          <tbody>
            {displayRankings.map((r, idx) => {
              const isSelected = selectedIds.includes(r.playerId);
              return (
                <tr
                  key={r.playerId}
                  className={`
                    border-b border-slate-700/50 transition-colors
                    ${isSelected ? 'bg-lime-500/5' : 'hover:bg-slate-700/30'}
                  `}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {r.rank <= 3 && (
                        <Trophy className={`w-3.5 h-3.5 ${
                          r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-slate-300' : 'text-amber-600'
                        }`} />
                      )}
                      <span className="text-slate-200 font-medium">#{r.rank}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getPlayerColor(r.playerId) }}
                      />
                      <span className={`font-medium ${isSelected ? 'text-lime-300' : 'text-slate-200'}`}>
                        {r.playerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">{r.sport}</td>
                  <td className="px-3 py-2.5">
                    <span className={`
                      px-2 py-0.5 rounded text-[10px] font-medium
                      ${r.era === 'Vintage' ? 'bg-amber-500/10 text-amber-400' :
                        r.era === 'Junk-Wax' ? 'bg-purple-500/10 text-purple-400' :
                        r.era === 'Modern' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-lime-500/10 text-lime-400'}
                    `}>
                      {r.era}
                    </span>
                  </td>
                  <td className={`text-right px-3 py-2.5 font-mono font-medium ${r.totalROI >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                    {formatPercent(r.totalROI)}
                  </td>
                  <td className={`text-right px-3 py-2.5 font-mono font-medium ${r.annualizedROI >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                    {formatPercent(r.annualizedROI)}
                  </td>
                  <td className="text-right px-3 py-2.5 font-mono text-yellow-400">
                    {formatMultiple(r.peakMultiple)}
                  </td>
                  <td className="text-right px-3 py-2.5 font-mono text-slate-200">
                    {formatMultiple(r.currentMultiple)}
                  </td>
                  <td className={`text-right px-3 py-2.5 font-mono ${r.sharpeRatio >= 1 ? 'text-lime-400' : r.sharpeRatio >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {r.sharpeRatio.toFixed(2)}
                  </td>
                  <td className="text-right px-3 py-2.5 font-mono text-red-400">
                    -{r.maxDrawdown.toFixed(1)}%
                  </td>
                  <td className="text-right px-3 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, r.holdingScore)}%`,
                            backgroundColor: r.holdingScore >= 70 ? '#84cc16' : r.holdingScore >= 40 ? '#facc15' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-slate-200 font-medium w-8 text-right">
                        {r.holdingScore.toFixed(0)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 px-1">
        <span><span className="text-slate-200 font-medium">Total ROI:</span> Lifetime return from release price</span>
        <span><span className="text-slate-200 font-medium">CAGR:</span> Compound annual growth rate</span>
        <span><span className="text-slate-200 font-medium">Peak x:</span> Peak value / release price</span>
        <span><span className="text-slate-200 font-medium">Sharpe:</span> Risk-adjusted return ratio</span>
        <span><span className="text-slate-200 font-medium">Max DD:</span> Maximum drawdown from peak</span>
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────────

const MultiGenCompare: React.FC = () => {
  const allPlayers = useMemo(() => getAllLegends(), []);
  const [selectedIds, setSelectedIds] = useState<string[]>(['mj-23', 'lbj-23', 'luka-77']);
  const [activeTab, setActiveTab] = useState<TabKey>('overlay');

  const togglePlayer = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pid) => pid !== id);
      }
      if (prev.length >= MAX_PLAYERS) return prev;
      return [...prev, id];
    });
  }, []);

  const comparison = useMemo(() => {
    if (selectedIds.length < MIN_PLAYERS) return null;
    return comparePlayers(selectedIds);
  }, [selectedIds]);

  const selectedPlayers = useMemo(
    () => allPlayers.filter((p) => selectedIds.includes(p.id)),
    [allPlayers, selectedIds]
  );

  const canCompare = selectedIds.length >= MIN_PLAYERS;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-lime-500/10 rounded-xl border border-lime-500/20">
            <GitCompare className="w-7 h-7 text-lime-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Multi-Gen Player Comparison
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Cross-era card investment analysis with time-normalized metrics, inflation-adjusted returns, and holding period performance.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              1986 Jordan vs 2003 LeBron vs 2018 Luka &mdash; career overlay, card value curves, and more.
            </p>
          </div>
        </div>

        {/* Summary stats for selected players */}
        {canCompare && comparison && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Players Selected</span>
              <span className="text-xl font-bold text-lime-400">{selectedIds.length}</span>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Total Era Span</span>
              <span className="text-xl font-bold text-slate-100">
                {Math.min(...selectedPlayers.map((p) => p.keyCard.year))}
                &ndash;
                {Math.max(...selectedPlayers.map((p) => p.keyCard.priceHistory[p.keyCard.priceHistory.length - 1]?.year ?? 2026))}
              </span>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Best CAGR</span>
              {(() => {
                const best = comparison.rankings.reduce((a, b) => a.annualizedROI > b.annualizedROI ? a : b);
                return (
                  <div>
                    <span className="text-xl font-bold text-lime-400">{formatPercent(best.annualizedROI)}</span>
                    <span className="text-[10px] text-slate-400 block">{best.playerName}</span>
                  </div>
                );
              })()}
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Highest Peak x</span>
              {(() => {
                const best = comparison.rankings.reduce((a, b) => a.peakMultiple > b.peakMultiple ? a : b);
                return (
                  <div>
                    <span className="text-xl font-bold text-yellow-400">{formatMultiple(best.peakMultiple)}</span>
                    <span className="text-[10px] text-slate-400 block">{best.playerName}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Player Selector */}
        <PlayerSelector
          allPlayers={allPlayers}
          selectedIds={selectedIds}
          onToggle={togglePlayer}
        />

        {/* Minimum player warning */}
        {!canCompare && (
          <div className="bg-slate-800/50 rounded-xl border border-yellow-500/20 p-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-300">
              Select at least {MIN_PLAYERS} players to begin comparison. Currently {selectedIds.length} selected.
            </p>
          </div>
        )}

        {/* Tabs */}
        {canCompare && (
          <>
            <div className="flex gap-1 bg-slate-800 rounded-xl border border-slate-700 p-1 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                    ${activeTab === tab.key
                      ? 'bg-lime-500/15 text-lime-300 border border-lime-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-transparent'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'overlay' && comparison && (
                <CareerOverlayChart
                  metrics={comparison.careerOverlay}
                  playerIds={selectedIds}
                />
              )}

              {activeTab === 'value' && (
                <CardValueCurvesChart players={selectedPlayers} />
              )}

              {activeTab === 'holding' && comparison && (
                <HoldingPeriodChart returns={comparison.holdingPeriodReturns} />
              )}

              {activeTab === 'inflation' && comparison && (
                <InflationAdjustedChart
                  data={comparison.inflationAdjusted}
                  players={selectedPlayers}
                />
              )}

              {activeTab === 'ranking' && comparison && (
                <EraRankingTable
                  rankings={comparison.rankings}
                  selectedIds={selectedIds}
                />
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-slate-800">
          Data is illustrative. Card values based on historical auction results and market estimates.
          CPI adjustments use US Bureau of Labor Statistics CPI-U index.
        </div>
      </div>
    </div>
  );
};

export default MultiGenCompare;
