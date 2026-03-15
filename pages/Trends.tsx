
import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Activity,
  BarChart,
  Flame,
  Layers,
  DollarSign,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useInventory } from '../lib/useInventory.ts';
import { AggregationService } from '../lib/aggregationService';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  CartesianGrid,
} from 'recharts';

const Trends: React.FC = () => {
  const { inventory } = useInventory();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '6m' | '1y'>('30d');

  // Calculate aggregate metrics
  const metrics = useMemo(() => AggregationService.calculatePortfolioMetrics(inventory), [inventory]);

  // Calculate temporal comparison based on selected timeframe
  const comparison = useMemo(() =>
    AggregationService.getComparisonMetrics(inventory, timeframe),
    [inventory, timeframe]
  );

  // Get trend data for the chart
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '6m' ? 180 : 365;
  const trendData = useMemo(() =>
    AggregationService.getAggregatedTrendData(inventory, days),
    [inventory, days]
  );

  // Re-calculate distribution data (legacy but using updated inventory)
  const distributions = useMemo(() => {
    // League distribution
    const leagueMap = new Map<string, { count: number; value: number }>();
    inventory.forEach(card => {
      const existing = leagueMap.get(card.league) || { count: 0, value: 0 };
      leagueMap.set(card.league, {
        count: existing.count + 1,
        value: existing.value + (card.currentValue || 0)
      });
    });
    const byLeague = Array.from(leagueMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      value: Math.round(data.value)
    }));

    // Year distribution
    const yearMap = new Map<number, number>();
    inventory.forEach(card => {
      yearMap.set(card.year, (yearMap.get(card.year) || 0) + 1);
    });
    const byYear = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year)
      .slice(-12);

    return { byLeague, byYear };
  }, [inventory]);

  const COLORS = ['#D9F99D', '#22C55E', '#10B981', '#059669', '#047857'];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full text-[10px] font-black text-brand-lime uppercase tracking-widest">
            <Zap size={12} />
            Phase 13 Intelligence Active
          </div>
          <h1 className="text-5xl md:text-8xl font-bebas tracking-tight text-white leading-[0.85]">
            Market <span className="text-brand-lime">Trends</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium text-lg">
            High-fidelity portfolio oversight. Tracking <span className="text-white font-bold">{inventory.length} assets</span> across temporal shifts.
          </p>
        </div>

        <div className="flex bg-brand-charcoal border border-slate-800 p-1.5 rounded-2xl">
          {(['7d', '30d', '6m', '1y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeframe === tf
                ? 'bg-brand-lime text-brand-charcoal shadow-lg shadow-brand-lime/20'
                : 'text-brand-muted hover:text-white'
                }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Market Valuation',
            value: `$${metrics.totalValue.toLocaleString()}`,
            sub: `${comparison.delta >= 0 ? '+' : ''}$${Math.abs(Math.round(comparison.delta)).toLocaleString()} shifts`,
            icon: DollarSign,
            color: 'text-white'
          },
          {
            label: 'Effective ROI',
            value: `${metrics.totalROIPercent.toFixed(1)}%`,
            sub: `On $${metrics.totalCostBasis.toLocaleString()} basis`,
            icon: TrendingUp,
            color: metrics.totalROIPercent >= 0 ? 'text-brand-green' : 'text-brand-red'
          },
          {
            label: `${timeframe.toUpperCase()} Velocity`,
            value: `${comparison.deltaPercent >= 0 ? '+' : ''}${comparison.deltaPercent.toFixed(1)}%`,
            sub: 'Market price delta',
            icon: Activity,
            color: comparison.deltaPercent >= 0 ? 'text-brand-green' : 'text-brand-red'
          },
          {
            label: 'Asset Count',
            value: metrics.assetCount,
            sub: 'Distributed across leagues',
            icon: Layers,
            color: 'text-white'
          },
        ].map((stat, i) => (
          <div key={i} className="luminous-card rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-5 rounded-full -mr-12 -mt-12 transition-all group-hover:opacity-10 ${stat.color.includes('green') ? 'bg-brand-green' : 'bg-brand-lime'}`}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-brand-charcoal rounded-xl border border-slate-800">
                  <stat.icon className="text-brand-lime" size={20} />
                </div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{stat.label}</p>
              </div>
              <p className={`text-4xl font-mono font-bold tracking-tight mb-2 ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Temporal Chart */}
      <section className="luminous-card rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-brand-lime/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bebas tracking-wider text-white mb-2">Portfolio <span className="text-brand-lime">Valuation Flow</span></h2>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Temporal Delta Tracking: {timeframe.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 bg-brand-slate/50 border border-slate-800 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Growth Forecast</span>
              <span className={`text-xl font-mono font-bold flex items-center gap-2 ${comparison.deltaPercent >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                {comparison.deltaPercent >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                {Math.abs(comparison.deltaPercent).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D9F99D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D9F99D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(val) => `$${val > 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                itemStyle={{ color: '#D9F99D', fontWeight: 800 }}
                labelStyle={{ color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#D9F99D"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorVal)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Performance Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <section className="luminous-card rounded-[2.5rem] p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green">
                <Flame size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bebas tracking-widest text-white">Alpha Leaders</h2>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Highest Lifetime ROI</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {metrics.topPerformers.map((item, i) => (
              <div key={i} className="flex items-center gap-6 p-5 luminous-card rounded-2xl group hover:border-brand-green/30 transition-all">
                <span className="text-3xl font-bebas text-brand-green/30 group-hover:text-brand-green transition-colors w-6">0{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-lg truncate leading-none mb-1">{item.player}</p>
                  <p className="text-[10px] text-brand-muted uppercase tracking-widest font-bold">Strategic Asset</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono font-bold text-brand-green">+{item.roiPercent.toFixed(1)}%</p>
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">+${Math.round(item.roi).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Distribution Breakdown */}
        <section className="luminous-card rounded-[2.5rem] p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 rounded-2xl text-brand-lime">
              <BarChart size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">League Exposure</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">NAV Split by Professional Circuit</p>
            </div>
          </div>

          <div className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={distributions.byLeague} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} width={60} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1e293b', borderRadius: '12px' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {distributions.byLeague.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Secondary Composition Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Graded Maturity', percent: (inventory.filter(c => c.isGraded).length / inventory.length) * 100, color: 'text-brand-lime' },
          { label: 'Autographed Mass', percent: (inventory.filter(c => c.isAutographed).length / inventory.length) * 100, color: 'text-brand-teal' },
          { label: 'Modern Exposure', percent: (inventory.filter(c => c.year >= 2000).length / inventory.length) * 100, color: 'text-brand-green' },
          { label: 'Vintage Anchor', percent: (inventory.filter(c => c.year < 2000).length / inventory.length) * 100, color: 'text-brand-orange' }
        ].map((item, i) => (
          <div key={i} className="bg-brand-charcoal/50 border border-slate-800/80 rounded-[2rem] p-6 text-center space-y-4">
            <div className="relative h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-1000 ${item.color.replace('text', 'bg')}`}
                style={{ width: `${item.percent}%` }}
              ></div>
            </div>
            <div>
              <p className="text-3xl font-bebas text-white leading-none whitespace-nowrap">{Math.round(item.percent)}%</p>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em]">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trends;
