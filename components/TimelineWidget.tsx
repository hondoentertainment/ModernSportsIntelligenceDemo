import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { CardInventory } from '../types';
import {
  getSnapshots,
  generateHistoricalSnapshots,
  captureSnapshot,
} from '../lib/analytics/timeMachineService';

interface TimelineWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

export const TimelineWidget: React.FC<TimelineWidgetProps> = ({ cards, onClick }) => {
  const snapshots = useMemo(() => {
    // Ensure we have a current snapshot
    captureSnapshot(cards);
    // Generate historical data if needed
    const all = generateHistoricalSnapshots(cards);
    return all.length > 0 ? all : getSnapshots();
  }, [cards]);

  // Last 12 months of data for sparkline
  const chartData = useMemo(() => {
    const last12 = snapshots.slice(-12);
    return last12.map(s => ({
      date: s.date,
      nav: s.totalNAV,
      label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    }));
  }, [snapshots]);

  // YTD return
  const ytdReturn = useMemo(() => {
    const now = new Date();
    const yearStart = `${now.getFullYear()}-01-01`;
    const janSnap = snapshots.find(s => s.date >= yearStart);
    const latestSnap = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
    if (!janSnap || !latestSnap || janSnap.totalNAV === 0) return 0;
    return Math.round(((latestSnap.totalNAV - janSnap.totalNAV) / janSnap.totalNAV) * 10000) / 100;
  }, [snapshots]);

  // This day last year comparison
  const lastYearDiff = useMemo(() => {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const targetDate = oneYearAgo.toISOString().slice(0, 10);
    const latestSnap = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

    // Find closest snapshot to one year ago
    let closest: typeof snapshots[0] | null = null;
    let closestDiff = Infinity;
    for (const s of snapshots) {
      const diff = Math.abs(new Date(s.date).getTime() - oneYearAgo.getTime());
      if (diff < closestDiff && s.date <= targetDate) {
        closestDiff = diff;
        closest = s;
      }
    }

    if (!closest || !latestSnap) return null;
    return {
      diff: Math.round((latestSnap.totalNAV - closest.totalNAV) * 100) / 100,
      percent: closest.totalNAV > 0
        ? Math.round(((latestSnap.totalNAV - closest.totalNAV) / closest.totalNAV) * 10000) / 100
        : 0,
    };
  }, [snapshots]);

  const lastSnapshotDate = useMemo(() => {
    if (snapshots.length === 0) return 'Never';
    const last = snapshots[snapshots.length - 1];
    return new Date(last.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [snapshots]);

  const isPositiveYTD = ytdReturn >= 0;
  const chartColor = isPositiveYTD ? '#10b981' : '#ef4444';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Clock size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Portfolio <span className="text-blue-400">Timeline</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Historical NAV & snapshots
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Sparkline */}
      {chartData.length > 1 && (
        <div className="h-16 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="navGradientWidget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'NAV']}
                labelFormatter={(label: string) => label}
              />
              <Area
                type="monotone"
                dataKey="nav"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#navGradientWidget)"
                dot={false}
                activeDot={{ r: 3, fill: chartColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4">
        {/* YTD Return */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
            isPositiveYTD
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {isPositiveYTD ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositiveYTD ? '+' : ''}{ytdReturn}% YTD
          </div>
        </div>

        {/* Last Year Comparison */}
        {lastYearDiff && (
          <div className="text-xs text-slate-400">
            <span className="text-slate-500">vs 1yr ago:</span>{' '}
            <span className={lastYearDiff.diff >= 0 ? 'text-green-400' : 'text-red-400'}>
              {lastYearDiff.diff >= 0 ? '+' : ''}${Math.abs(lastYearDiff.diff).toLocaleString()}
            </span>
          </div>
        )}

        {/* Last Snapshot */}
        <div className="ml-auto text-xs text-slate-500">
          Last: {lastSnapshotDate}
        </div>
      </div>
    </button>
  );
};

export default TimelineWidget;
