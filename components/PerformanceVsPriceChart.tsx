import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { PerformanceVsPricePoint } from '../lib/analytics/performanceVsPrice';

interface Props {
  points: PerformanceVsPricePoint[];
  subtitle?: string;
}

const PerformanceVsPriceChart: React.FC<Props> = ({
  points,
  subtitle = 'MLB Stats API line vs collection mark · not a valuation model',
}) => {
  if (points.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-brand-charcoal/40 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bebas tracking-wide text-white">Performance vs Price</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
          {subtitle}
        </p>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="player" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} />
            <YAxis yAxisId="price" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="perf" orientation="right" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar yAxisId="price" dataKey="price" fill="#84cc16" radius={[6, 6, 0, 0]} name="Mark ($)" />
            <Line yAxisId="perf" type="monotone" dataKey="performance" stroke="#38bdf8" strokeWidth={2} name="Perf score" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceVsPriceChart;
