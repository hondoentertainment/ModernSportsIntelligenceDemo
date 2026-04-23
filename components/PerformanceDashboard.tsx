// @ts-nocheck
/**
 * PerformanceDashboard — dev-only page for monitoring bundle sizes,
 * load times, and Web Vitals across the entire application.
 *
 * Only rendered when `import.meta.env.DEV` is true.
 * Uses Recharts for visualisation.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getRouteChunkSizes,
  getLargestChunks,
  getSharedDependencies,
  getPerformanceReport,
  getRouteLoadMeasurements,
  getWebVitals,
  measureRouteLoad,
  type PerformanceReport,
} from '../lib/utils/performanceOptimizer';

// Guard: only render in development
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

// ─── Colours ───────────────────────────────────────────────────────────
const COLORS = [
  '#84cc16', // lime
  '#22d3ee', // cyan
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
];

const ratingColor = (rating: string) => {
  switch (rating) {
    case 'good':
      return 'text-green-400';
    case 'needs-improvement':
      return 'text-amber-400';
    case 'poor':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
};

// ─── Component ─────────────────────────────────────────────────────────
const PerformanceDashboard: React.FC = () => {
  const [report, setReport] = useState<PerformanceReport | null>(null);

  useEffect(() => {
    setReport(getPerformanceReport());
  }, []);

  // Bar chart data: top 20 largest route chunks
  const chunkBarData = useMemo(() => {
    const sizes = getRouteChunkSizes();
    return Object.entries(sizes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([route, sizeKB]) => ({
        route: route.length > 24 ? route.slice(0, 22) + '...' : route,
        fullRoute: route,
        sizeKB,
      }));
  }, []);

  // Pie chart data: bundle composition by category
  const compositionData = useMemo(() => {
    const deps = getSharedDependencies();
    return deps.map((d) => ({ name: d.name, value: d.sizeKB }));
  }, []);

  // Load time data
  const loadTimeData = useMemo(() => {
    const measurements = getRouteLoadMeasurements();
    return measurements.map((m) => ({
      route: m.route.length > 24 ? m.route.slice(0, 22) + '...' : m.route,
      fullRoute: m.route,
      durationMs: m.durationMs,
      success: m.success,
    }));
  }, [report]);

  // Web Vitals
  const vitals = useMemo(() => getWebVitals(), [report]);

  if (!isDev) {
    return (
      <div className="p-8 text-slate-400 text-center">
        <p>Performance Dashboard is only available in development mode.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Performance Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Bundle analysis, route load times, and Web Vitals for the MSI platform.
          <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
            DEV ONLY
          </span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Routes"
          value={String(Object.keys(getRouteChunkSizes()).length)}
        />
        <SummaryCard
          label="Est. Total Bundle"
          value={`${report?.totalEstimatedBundleSizeKB ?? '...'} KB`}
        />
        <SummaryCard
          label="Largest Chunk"
          value={
            report?.largestChunks[0]
              ? `${report.largestChunks[0].route} (${report.largestChunks[0].sizeKB} KB)`
              : '...'
          }
        />
        <SummaryCard
          label="Load Measurements"
          value={String(getRouteLoadMeasurements().length)}
        />
      </div>

      {/* Route Chunk Sizes — Horizontal Bar Chart */}
      <section className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Route Chunk Sizes (Top 20)
        </h2>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chunkBarData} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} unit=" KB" />
              <YAxis
                dataKey="route"
                type="category"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                width={130}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: 8,
                  color: '#e2e8f0',
                }}
                formatter={(value: number) => [`${value} KB`, 'Estimated Size']}
                labelFormatter={(label: string) => `Route: ${label}`}
              />
              <Bar dataKey="sizeKB" fill="#84cc16" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Load Time Measurements */}
      <section className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Route Load Times</h2>
        {loadTimeData.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No measurements yet. Routes are measured as they are loaded lazily. Use{' '}
            <code className="bg-slate-700 px-1 rounded">measureRouteLoad(route)</code> to
            manually trigger a measurement.
          </p>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loadTimeData} layout="vertical" margin={{ left: 140 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  unit=" ms"
                />
                <YAxis
                  dataKey="route"
                  type="category"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  width={130}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: 8,
                    color: '#e2e8f0',
                  }}
                  formatter={(value: number) => [`${value} ms`, 'Load Time']}
                />
                <Bar dataKey="durationMs" fill="#22d3ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Bundle Composition — Pie Chart */}
      <section className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Shared Dependency Composition
        </h2>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={compositionData}
                cx="50%"
                cy="50%"
                outerRadius={130}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name} (${value} KB)`}
                labelLine={{ stroke: '#64748b' }}
              >
                {compositionData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: 8,
                  color: '#e2e8f0',
                }}
                formatter={(value: number) => [`${value} KB`, 'Size']}
              />
              <Legend
                wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Web Vitals */}
      <section className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Web Vitals</h2>
        {vitals.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No Web Vitals captured yet. They are recorded automatically via
            PerformanceObserver as the page loads and the user interacts.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vitals.map((v, i) => (
              <div
                key={`${v.name}-${i}`}
                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-300">{v.name}</span>
                  <span
                    className={`text-xs font-semibold uppercase ${ratingColor(v.rating)}`}
                  >
                    {v.rating}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-100">
                  {v.name === 'CLS' ? v.value.toFixed(3) : `${Math.round(v.value)} ms`}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Optimization Recommendations */}
      <section className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Optimization Recommendations
        </h2>
        {report?.suggestions && report.suggestions.length > 0 ? (
          <ul className="space-y-3">
            {report.suggestions.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-slate-300 bg-slate-900/40 rounded-lg p-3 border border-slate-700/30"
              >
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-sm">No suggestions available yet.</p>
        )}
      </section>
    </div>
  );
};

// ─── Helper Components ─────────────────────────────────────────────────

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-100 truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

export default PerformanceDashboard;
