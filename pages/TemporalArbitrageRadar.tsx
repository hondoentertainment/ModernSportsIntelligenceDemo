import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Globe,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Sun,
  Moon,
  Activity,
  DollarSign,
  Percent,
  Award,
  RefreshCw,
} from "lucide-react";
import type {
  ArbitrageOpportunity,
  EventWindowAnalysis,
  SeasonalPattern,
  IntradayPattern,
  CalendarAnomaly,
  ArbitragePerformance,
  UpcomingWindow,
  TimezoneArbitrage,
  EventType,
  ArbitrageType,
} from "../lib/temporalArbitrageService";
import {
  getActiveOpportunities,
  getEventWindowAnalysis,
  getSeasonalPattern,
  getIntradayPattern,
  getTimezoneArbitrage,
  getCalendarAnomalies,
  getArbitragePerformance,
  getUpcomingWindows,
} from "../lib/temporalArbitrageService";

// ─── Constants ──────────────────────────────────────────────────────────────────

const TABS = [
  "Live Radar",
  "Event Windows",
  "Seasonal Maps",
  "Intraday Patterns",
  "Calendar Anomalies",
  "Performance",
] as const;

type TabName = (typeof TABS)[number];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return "12a";
  if (i < 12) return `${i}a`;
  if (i === 12) return "12p";
  return `${i - 12}p`;
});

const TYPE_COLORS: Record<ArbitrageType, string> = {
  timezone: "#8b5cf6",
  "event-window": "#3b82f6",
  seasonal: "#10b981",
  intraday: "#f59e0b",
  "day-of-week": "#ec4899",
};

const TYPE_LABELS: Record<ArbitrageType, string> = {
  timezone: "Timezone",
  "event-window": "Event Window",
  seasonal: "Seasonal",
  intraday: "Intraday",
  "day-of-week": "Day of Week",
};

const RISK_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Low Risk" },
  medium: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Med Risk" },
  high: { bg: "bg-red-500/20", text: "text-red-400", label: "High Risk" },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatCountdown(expiresAt: Date): string {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  if (hours > 48) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function getHeatColor(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min || 1);
  if (ratio < 0.2) return "bg-emerald-600";
  if (ratio < 0.4) return "bg-emerald-500/70";
  if (ratio < 0.6) return "bg-slate-600";
  if (ratio < 0.8) return "bg-red-500/70";
  return "bg-red-600";
}

function getHeatLabel(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min || 1);
  if (ratio < 0.25) return "Best Buy";
  if (ratio < 0.5) return "Below Avg";
  if (ratio < 0.75) return "Above Avg";
  return "Best Sell";
}

// ─── Sub-Components ─────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
      <span className="ml-3 text-slate-400 text-lg">Loading temporal data...</span>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color =
    confidence >= 80
      ? "text-emerald-400 bg-emerald-500/20"
      : confidence >= 65
        ? "text-amber-400 bg-amber-500/20"
        : "text-red-400 bg-red-500/20";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      <Target className="h-3 w-3" />
      {confidence}%
    </span>
  );
}

function TypeBadge({ type }: { type: ArbitrageType }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: `${TYPE_COLORS[type]}22`,
        color: TYPE_COLORS[type],
      }}
    >
      {type === "timezone" && <Globe className="h-3 w-3" />}
      {type === "event-window" && <Calendar className="h-3 w-3" />}
      {type === "seasonal" && <Sun className="h-3 w-3" />}
      {type === "intraday" && <Clock className="h-3 w-3" />}
      {type === "day-of-week" && <BarChart3 className="h-3 w-3" />}
      {TYPE_LABELS[type]}
    </span>
  );
}

// ─── Tab: Live Radar ────────────────────────────────────────────────────────────

function LiveRadarTab({
  opportunities,
  timezoneArbs,
  upcomingWindows,
}: {
  opportunities: ArbitrageOpportunity[];
  timezoneArbs: TimezoneArbitrage[];
  upcomingWindows: UpcomingWindow[];
}) {
  const [now, setNow] = useState(Date.now());
  const [filterType, setFilterType] = useState<ArbitrageType | "all">("all");
  const [sortBy, setSortBy] = useState<"profit" | "confidence" | "expiry">("confidence");

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredOpps = useMemo(() => {
    let result =
      filterType === "all"
        ? opportunities
        : opportunities.filter((o) => o.type === filterType);
    result = [...result].sort((a, b) => {
      if (sortBy === "profit") return b.expectedProfit - a.expectedProfit;
      if (sortBy === "confidence") return b.confidence - a.confidence;
      return a.expiresAt.getTime() - b.expiresAt.getTime();
    });
    return result;
  }, [opportunities, filterType, sortBy]);

  const totalProfit = useMemo(
    () => opportunities.reduce((sum, o) => sum + o.expectedProfit, 0),
    [opportunities],
  );

  const avgConfidence = useMemo(
    () =>
      Math.round(
        opportunities.reduce((sum, o) => sum + o.confidence, 0) /
          (opportunities.length || 1),
      ),
    [opportunities],
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Zap className="h-4 w-4 text-blue-400" />
            Active Signals
          </div>
          <div className="mt-1 text-2xl font-bold text-white">{opportunities.length}</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            Total Potential
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">
            ${totalProfit.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Target className="h-4 w-4 text-amber-400" />
            Avg Confidence
          </div>
          <div className="mt-1 text-2xl font-bold text-white">{avgConfidence}%</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Globe className="h-4 w-4 text-purple-400" />
            TZ Spreads
          </div>
          <div className="mt-1 text-2xl font-bold text-white">{timezoneArbs.length}</div>
        </div>
      </div>

      {/* Upcoming Event Windows */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Calendar className="h-4 w-4 text-blue-400" />
          Upcoming Event Windows
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {upcomingWindows.slice(0, 5).map((w) => (
            <div
              key={w.eventName}
              className="flex-shrink-0 rounded-lg border border-slate-600 bg-slate-700/50 p-3"
              style={{ minWidth: 220 }}
            >
              <div className="text-sm font-semibold text-white">{w.eventName}</div>
              <div className="mt-1 text-xs text-slate-400">{w.date}</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-400">
                <Timer className="h-3 w-3" />
                {w.daysUntil} days away
              </div>
              <div className="mt-2 text-xs text-emerald-400">
                +{w.expectedImpact}% expected impact
              </div>
              <div className="mt-1 text-xs text-slate-500 line-clamp-1">
                {w.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ArbitrageType | "all")}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="event-window">Event Window</option>
            <option value="seasonal">Seasonal</option>
            <option value="intraday">Intraday</option>
            <option value="timezone">Timezone</option>
            <option value="day-of-week">Day of Week</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "profit" | "confidence" | "expiry")}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="confidence">Confidence</option>
            <option value="profit">Profit</option>
            <option value="expiry">Expiry</option>
          </select>
        </div>
        <div className="ml-auto text-xs text-slate-500">
          Last updated: {new Date(now).toLocaleTimeString()}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredOpps.map((opp) => {
          const risk = RISK_STYLES[opp.riskLevel];
          const returnPct = ((opp.expectedProfit / opp.currentPrice) * 100).toFixed(1);
          return (
            <div
              key={opp.id}
              className="group rounded-xl border border-slate-700 bg-slate-800/60 p-4 transition-colors hover:border-slate-500"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">
                    {opp.player}
                  </div>
                  <div className="truncate text-xs text-slate-400">{opp.cardName}</div>
                </div>
                <ConfidenceBadge confidence={opp.confidence} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <TypeBadge type={opp.type} />
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${risk.bg} ${risk.text}`}>
                  {risk.label}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-slate-500">Current</div>
                  <div className="text-sm font-semibold text-white">
                    {formatCurrency(opp.currentPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Target</div>
                  <div className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(opp.targetPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Profit</div>
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" />
                    {returnPct}%
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Timer className="h-3.5 w-3.5 text-amber-400" />
                  Expires
                </div>
                <div className="text-sm font-mono font-semibold text-amber-400">
                  {formatCountdown(opp.expiresAt)}
                </div>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
                {opp.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Event Windows ─────────────────────────────────────────────────────────

function EventWindowsTab({
  analyses,
}: {
  analyses: EventWindowAnalysis[];
}) {
  const [selectedEvent, setSelectedEvent] = useState<string>(
    analyses[0]?.eventName ?? "",
  );

  const selected = useMemo(
    () => analyses.find((a) => a.eventName === selectedEvent) ?? analyses[0],
    [analyses, selectedEvent],
  );

  const chartData = useMemo(() => {
    if (!selected) return [];
    return selected.typicalPattern.map((p) => {
      const label =
        p.hoursBeforeEvent > 0
          ? `${Math.round(p.hoursBeforeEvent / 24)}d before`
          : p.hoursBeforeEvent === 0
            ? "Event"
            : `${Math.round(Math.abs(p.hoursBeforeEvent) / 24)}d after`;
      return {
        label,
        priceChange: p.priceChangePercent,
        hours: p.hoursBeforeEvent,
      };
    });
  }, [selected]);

  if (!selected) return null;

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <div className="flex flex-wrap gap-2">
        {analyses.map((a) => (
          <button
            key={a.eventName}
            onClick={() => setSelectedEvent(a.eventName)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              selectedEvent === a.eventName
                ? "bg-blue-600 text-white"
                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {a.eventName}
          </button>
        ))}
      </div>

      {/* Event Detail */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {selected.eventName} — Price Pattern
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="eventGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#475569" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#475569" }}
                tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: 8,
                  color: "#f8fafc",
                }}
                formatter={(value: number) => [`${value > 0 ? "+" : ""}${value}%`, "Price Change"]}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="priceChange"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#eventGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-300">Event Details</h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500">Next Occurrence</div>
                <div className="text-sm font-semibold text-white">{selected.nextOccurrence}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Historical Accuracy</div>
                <div className="text-sm font-semibold text-emerald-400">
                  {selected.historicalAccuracy}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Avg Return</div>
                <div className="flex items-center gap-1 text-sm font-semibold text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />+{selected.avgReturn}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Sample Size</div>
                <div className="text-sm font-semibold text-white">
                  {selected.sampleSize} trades
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/20 p-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
              <CheckCircle className="h-4 w-4" /> Optimal Buy
            </h4>
            <p className="text-xs text-slate-300">{selected.optimalBuyWindow}</p>
          </div>
          <div className="rounded-xl border border-amber-800/50 bg-amber-900/20 p-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-400">
              <DollarSign className="h-4 w-4" /> Optimal Sell
            </h4>
            <p className="text-xs text-slate-300">{selected.optimalSellWindow}</p>
          </div>
        </div>
      </div>

      {/* All Events Summary Table */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-300">All Event Windows</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs text-slate-500">
                <th className="pb-2 pr-4">Event</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Avg Return</th>
                <th className="pb-2 pr-4">Accuracy</th>
                <th className="pb-2 pr-4">Sample</th>
                <th className="pb-2">Next</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((a) => (
                <tr
                  key={a.eventName}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer"
                  onClick={() => setSelectedEvent(a.eventName)}
                >
                  <td className="py-2 pr-4 font-medium text-white">{a.eventName}</td>
                  <td className="py-2 pr-4 capitalize text-slate-400">{a.eventType}</td>
                  <td className="py-2 pr-4 text-emerald-400">+{a.avgReturn}%</td>
                  <td className="py-2 pr-4 text-slate-300">{a.historicalAccuracy}%</td>
                  <td className="py-2 pr-4 text-slate-400">{a.sampleSize}</td>
                  <td className="py-2 text-slate-400">{a.nextOccurrence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Seasonal Maps ─────────────────────────────────────────────────────────

function SeasonalMapsTab({
  patterns,
}: {
  patterns: SeasonalPattern[];
}) {
  const [selectedCard, setSelectedCard] = useState<string>(
    patterns[0]?.cardId ?? "",
  );

  const selected = useMemo(
    () => patterns.find((p) => p.cardId === selectedCard) ?? patterns[0],
    [patterns, selectedCard],
  );

  const chartData = useMemo(() => {
    if (!selected) return [];
    return MONTH_LABELS.map((month, i) => ({
      month,
      price: selected.monthlyAvgPrices[i],
      isBestBuy: i === selected.bestBuyMonth,
      isBestSell: i === selected.bestSellMonth,
    }));
  }, [selected]);

  if (!selected) return null;

  const minPrice = Math.min(...selected.monthlyAvgPrices);
  const maxPrice = Math.max(...selected.monthlyAvgPrices);
  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="flex flex-wrap gap-2">
        {patterns.map((p) => (
          <button
            key={p.cardId}
            onClick={() => setSelectedCard(p.cardId)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCard === p.cardId
                ? "bg-emerald-600 text-white"
                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {p.player}
          </button>
        ))}
      </div>

      {/* Price Trend Chart */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{selected.player}</h3>
            <p className="text-xs text-slate-400">{selected.cardName}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Seasonal Swing</div>
            <div className="text-lg font-bold text-emerald-400">
              {selected.seasonalSwing.toFixed(1)}%
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="seasonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#475569" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#475569" }}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: 8,
                color: "#f8fafc",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Avg Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#seasonGrad)"
            />
            <Bar dataKey="price" barSize={20} fill="#10b981" opacity={0.3}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.isBestBuy
                      ? "#22c55e"
                      : entry.isBestSell
                        ? "#ef4444"
                        : i === currentMonth
                          ? "#3b82f6"
                          : "#475569"
                  }
                  opacity={entry.isBestBuy || entry.isBestSell || i === currentMonth ? 0.8 : 0.2}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-emerald-500" /> Best Buy Month
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-red-500" /> Best Sell Month
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-blue-500" /> Current Month
          </span>
        </div>
      </div>

      {/* 12-Month Heat Map Grid */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">
          All Cards — Monthly Price Heat Map
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Month headers */}
            <div className="mb-2 grid grid-cols-[180px_repeat(12,1fr)] gap-1 text-center text-xs text-slate-500">
              <div />
              {MONTH_LABELS.map((m) => (
                <div key={m} className={m === MONTH_LABELS[currentMonth] ? "font-bold text-blue-400" : ""}>
                  {m}
                </div>
              ))}
            </div>
            {/* Rows */}
            {patterns.map((p) => {
              const pMin = Math.min(...p.monthlyAvgPrices);
              const pMax = Math.max(...p.monthlyAvgPrices);
              return (
                <div
                  key={p.cardId}
                  className="mb-1 grid grid-cols-[180px_repeat(12,1fr)] gap-1 items-center"
                >
                  <div className="truncate text-xs text-slate-300 pr-2" title={p.cardName}>
                    {p.player}
                  </div>
                  {p.monthlyAvgPrices.map((price, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-center rounded py-1.5 text-xs font-medium text-white ${getHeatColor(price, pMin, pMax)} ${
                        i === p.bestBuyMonth
                          ? "ring-2 ring-emerald-400"
                          : i === p.bestSellMonth
                            ? "ring-2 ring-red-400"
                            : ""
                      }`}
                      title={`${MONTH_LABELS[i]}: $${price} — ${getHeatLabel(price, pMin, pMax)}`}
                    >
                      ${price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price}
                    </div>
                  ))}
                </div>
              );
            })}
            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-6 rounded bg-emerald-600" /> Cheapest
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-6 rounded bg-slate-600" /> Average
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-6 rounded bg-red-600" /> Most Expensive
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patterns.slice(0, 6).map((p) => (
          <div key={p.cardId} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="text-sm font-semibold text-white">{p.player}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Best Buy:</span>{" "}
                <span className="font-semibold text-emerald-400">{MONTH_LABELS[p.bestBuyMonth]}</span>
              </div>
              <div>
                <span className="text-slate-500">Best Sell:</span>{" "}
                <span className="font-semibold text-red-400">{MONTH_LABELS[p.bestSellMonth]}</span>
              </div>
              <div>
                <span className="text-slate-500">Swing:</span>{" "}
                <span className="font-semibold text-amber-400">{p.seasonalSwing.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-500">Reliability:</span>{" "}
                <span className="font-semibold text-slate-300">{p.reliability}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Intraday Patterns ─────────────────────────────────────────────────────

function IntradayPatternsTab({
  patterns,
}: {
  patterns: IntradayPattern[];
}) {
  const [selectedCard, setSelectedCard] = useState<string>(
    patterns[0]?.cardId ?? "",
  );

  const selected = useMemo(
    () => patterns.find((p) => p.cardId === selectedCard) ?? patterns[0],
    [patterns, selectedCard],
  );

  const hourlyData = useMemo(() => {
    if (!selected) return [];
    return HOUR_LABELS.map((hour, i) => ({
      hour,
      price: selected.hourlyAvgPrice[i],
      volume: selected.hourlyVolume[i],
      isPeak: i === selected.peakHour,
      isValley: i === selected.valleyHour,
    }));
  }, [selected]);

  const dowData = useMemo(() => {
    if (!selected) return [];
    return selected.dayOfWeekEffect.map((d) => ({
      day: d.day.slice(0, 3),
      delta: d.avgPriceDelta,
      fill: d.avgPriceDelta >= 0 ? "#10b981" : "#ef4444",
    }));
  }, [selected]);

  const radarData = useMemo(() => {
    if (!selected) return [];
    return selected.dayOfWeekEffect.map((d) => ({
      day: d.day.slice(0, 3),
      volume: Math.abs(d.avgPriceDelta) * 20 + 40,
      price: d.avgPriceDelta + 5,
    }));
  }, [selected]);

  if (!selected) return null;

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="flex flex-wrap gap-2">
        {patterns.map((p) => (
          <button
            key={p.cardId}
            onClick={() => setSelectedCard(p.cardId)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCard === p.cardId
                ? "bg-amber-600 text-white"
                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {p.player}
          </button>
        ))}
      </div>

      {/* 24-Hour Clock Visualization */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-white">
          {selected.player} — 24-Hour Price & Volume
        </h3>
        <p className="mb-4 text-xs text-slate-400">
          Peak hour: {HOUR_LABELS[selected.peakHour]} EST | Valley hour: {HOUR_LABELS[selected.valleyHour]} EST |
          Spread: ${(selected.hourlyAvgPrice[selected.peakHour] - selected.hourlyAvgPrice[selected.valleyHour]).toFixed(0)}
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={hourlyData}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="hour"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#475569" }}
            />
            <YAxis
              yAxisId="price"
              orientation="left"
              tick={{ fill: "#f59e0b", fontSize: 11 }}
              axisLine={{ stroke: "#f59e0b" }}
              tickFormatter={(v: number) => `$${v}`}
            />
            <YAxis
              yAxisId="volume"
              orientation="right"
              tick={{ fill: "#8b5cf6", fontSize: 11 }}
              axisLine={{ stroke: "#8b5cf6" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: 8,
                color: "#f8fafc",
              }}
            />
            <Legend />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              name="Volume"
              fill="#8b5cf6"
              opacity={0.4}
              barSize={12}
            />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              name="Avg Price"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#priceGrad)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Clock-Style Visualization (CSS grid circle) */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">24-Hour Clock View</h3>
        <div className="mx-auto grid max-w-xl grid-cols-6 gap-2">
          {HOUR_LABELS.map((hour, i) => {
            const price = selected.hourlyAvgPrice[i];
            const minP = Math.min(...selected.hourlyAvgPrice);
            const maxP = Math.max(...selected.hourlyAvgPrice);
            const ratio = (price - minP) / (maxP - minP || 1);
            const isNight = i < 6 || i >= 22;
            return (
              <div
                key={i}
                className={`relative flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-colors ${
                  i === selected.peakHour
                    ? "border-amber-500 bg-amber-500/20"
                    : i === selected.valleyHour
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-slate-700 bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  {isNight ? (
                    <Moon className="h-3 w-3 text-slate-500" />
                  ) : (
                    <Sun className="h-3 w-3 text-amber-500" />
                  )}
                  {hour}
                </div>
                <div className="mt-0.5 text-sm font-bold text-white">${price}</div>
                <div
                  className="mt-1 h-1 w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)`,
                    clipPath: `inset(0 ${(1 - ratio) * 100}% 0 0)`,
                  }}
                />
                <div className="text-[10px] text-slate-500">
                  vol: {selected.hourlyVolume[i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day of Week Effect */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-300">
            Day-of-Week Price Delta
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#475569" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#475569" }}
                tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: 8,
                  color: "#f8fafc",
                }}
                formatter={(value: number) => [`${value > 0 ? "+" : ""}${value}%`, "Price Delta"]}
              />
              <ReferenceLine y={0} stroke="#64748b" />
              <Bar dataKey="delta" name="Avg Price Delta" barSize={32}>
                {dowData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-300">
            Weekly Activity Radar
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: "#64748b", fontSize: 9 }} />
              <Radar
                name="Activity"
                dataKey="volume"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Calendar Anomalies ────────────────────────────────────────────────────

function CalendarAnomaliesTab({
  anomalies,
}: {
  anomalies: CalendarAnomaly[];
}) {
  return (
    <div className="space-y-6">
      {/* Impact Overview Chart */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">
          Calendar Anomaly Impact Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={anomalies.map((a) => ({
              name: a.name.length > 25 ? a.name.slice(0, 22) + "..." : a.name,
              impact: a.avgImpact,
              fill: a.avgImpact >= 0 ? "#10b981" : "#ef4444",
            }))}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              type="number"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#475569" }}
              tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={180}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#475569" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: 8,
                color: "#f8fafc",
              }}
              formatter={(value: number) => [
                `${value > 0 ? "+" : ""}${value}%`,
                "Avg Impact",
              ]}
            />
            <ReferenceLine x={0} stroke="#64748b" />
            <Bar dataKey="impact" barSize={20}>
              {anomalies.map((a, i) => (
                <Cell
                  key={i}
                  fill={a.avgImpact >= 0 ? "#10b981" : "#ef4444"}
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {anomalies.map((anomaly) => (
          <div
            key={anomaly.name}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{anomaly.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {anomaly.period}
                </div>
              </div>
              <div
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
                  anomaly.avgImpact >= 0
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {anomaly.avgImpact >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {anomaly.avgImpact > 0 ? "+" : ""}
                {anomaly.avgImpact}%
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {anomaly.explanation}
            </p>

            <div className="mt-3 rounded-lg bg-slate-900/50 p-3">
              <div className="text-xs font-semibold text-blue-400">Investment Window</div>
              <div className="mt-1 text-sm text-slate-300">{anomaly.investmentWindow}</div>
            </div>

            <div className="mt-3">
              <div className="text-xs text-slate-500">Affected Cards</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {anomaly.affectedCards.map((card) => (
                  <span
                    key={card}
                    className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                  >
                    {card}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Performance ───────────────────────────────────────────────────────────

function PerformanceTab({
  performance,
}: {
  performance: ArbitragePerformance;
}) {
  const cumulativeData = useMemo(
    () =>
      performance.monthlyReturns.map((m, i) => ({
        month: m.month.slice(2), // "25-04" etc
        return: m.return,
        trades: m.trades,
        cumulative: performance.cumulativeReturn[i],
      })),
    [performance],
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Activity className="h-4 w-4 text-blue-400" />
            Total Signals
          </div>
          <div className="mt-1 text-2xl font-bold text-white">
            {performance.totalOpportunities}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            Captured Profit
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">
            ${performance.capturedProfit.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Percent className="h-4 w-4 text-amber-400" />
            Win Rate
          </div>
          <div className="mt-1 text-2xl font-bold text-white">{performance.winRate}%</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            Avg Return
          </div>
          <div className="mt-1 text-2xl font-bold text-white">+{performance.avgReturn}%</div>
        </div>
      </div>

      {/* Cumulative Return Line Chart */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-4 text-lg font-semibold text-white">Cumulative Return</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#475569" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#475569" }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: 8,
                color: "#f8fafc",
              }}
              formatter={(value: number, name: string) => {
                if (name === "cumulative") return [`${value.toFixed(1)}%`, "Cumulative"];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#cumGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Returns + Trade Count */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">Monthly Returns & Trade Volume</h3>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#475569" }}
            />
            <YAxis
              yAxisId="return"
              orientation="left"
              tick={{ fill: "#10b981", fontSize: 11 }}
              axisLine={{ stroke: "#10b981" }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              yAxisId="trades"
              orientation="right"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: 8,
                color: "#f8fafc",
              }}
            />
            <Legend />
            <Bar
              yAxisId="trades"
              dataKey="trades"
              name="Trades"
              fill="#475569"
              barSize={16}
              opacity={0.5}
            />
            <Line
              yAxisId="return"
              type="monotone"
              dataKey="return"
              name="Return %"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Best / Worst Trades */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/20 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <Award className="h-4 w-4" /> Best Trade
          </div>
          <div className="mt-2 text-base font-bold text-white">
            {performance.bestTrade.card}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <span className="text-emerald-400 font-semibold">
              +${performance.bestTrade.profit.toLocaleString()}
            </span>
            <span className="text-slate-500">{performance.bestTrade.date}</span>
          </div>
        </div>
        <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
            <AlertTriangle className="h-4 w-4" /> Worst Trade
          </div>
          <div className="mt-2 text-base font-bold text-white">
            {performance.worstTrade.card}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <span className="text-red-400 font-semibold">
              -${Math.abs(performance.worstTrade.profit).toLocaleString()}
            </span>
            <span className="text-slate-500">{performance.worstTrade.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function TemporalArbitrageRadar() {
  const [activeTab, setActiveTab] = useState<TabName>("Live Radar");
  const [loading, setLoading] = useState(true);

  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [eventAnalyses, setEventAnalyses] = useState<EventWindowAnalysis[]>([]);
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([]);
  const [intradayPatterns, setIntradayPatterns] = useState<IntradayPattern[]>([]);
  const [timezoneArbs, setTimezoneArbs] = useState<TimezoneArbitrage[]>([]);
  const [calendarAnomalies, setCalendarAnomalies] = useState<CalendarAnomaly[]>([]);
  const [performance, setPerformance] = useState<ArbitragePerformance | null>(null);
  const [upcomingWindows, setUpcomingWindows] = useState<UpcomingWindow[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [opps, events, seasonal, intraday, tz, anomalies, perf, upcoming] =
          await Promise.all([
            getActiveOpportunities(),
            getEventWindowAnalysis(),
            getSeasonalPattern(),
            getIntradayPattern(),
            getTimezoneArbitrage(),
            getCalendarAnomalies(),
            getArbitragePerformance(),
            getUpcomingWindows(),
          ]);
        if (cancelled) return;
        setOpportunities(opps);
        setEventAnalyses(events);
        setSeasonalPatterns(seasonal);
        setIntradayPatterns(intraday);
        setTimezoneArbs(tz);
        setCalendarAnomalies(anomalies);
        setPerformance(perf);
        setUpcomingWindows(upcoming);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabIcons: Record<TabName, React.ReactNode> = useMemo(
    () => ({
      "Live Radar": <Zap className="h-4 w-4" />,
      "Event Windows": <Calendar className="h-4 w-4" />,
      "Seasonal Maps": <Sun className="h-4 w-4" />,
      "Intraday Patterns": <Clock className="h-4 w-4" />,
      "Calendar Anomalies": <AlertTriangle className="h-4 w-4" />,
      Performance: <TrendingUp className="h-4 w-4" />,
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Temporal Arbitrage Radar</h1>
              <p className="text-sm text-slate-400">
                Detect time-based arbitrage across time zones, events, seasons, and intraday patterns
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {tabIcons[tab]}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === "Live Radar" && (
              <LiveRadarTab
                opportunities={opportunities}
                timezoneArbs={timezoneArbs}
                upcomingWindows={upcomingWindows}
              />
            )}
            {activeTab === "Event Windows" && (
              <EventWindowsTab analyses={eventAnalyses} />
            )}
            {activeTab === "Seasonal Maps" && (
              <SeasonalMapsTab patterns={seasonalPatterns} />
            )}
            {activeTab === "Intraday Patterns" && (
              <IntradayPatternsTab patterns={intradayPatterns} />
            )}
            {activeTab === "Calendar Anomalies" && (
              <CalendarAnomaliesTab anomalies={calendarAnomalies} />
            )}
            {activeTab === "Performance" && performance && (
              <PerformanceTab performance={performance} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
