
import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart,
  Flame,
  Target,
  Layers,
  Trophy,
  DollarSign,
  Percent
} from 'lucide-react';
import { useInventory } from '../lib/useInventory.ts';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  Cell
} from 'recharts';

const Trends: React.FC = () => {
  const { inventory } = useInventory();

  // Calculate portfolio metrics
  const analytics = useMemo(() => {
    const withPerformance = inventory.map(card => {
      const gainLoss = (card.currentValue || 0) - (card.purchasePrice || 0);
      const roiPercent = card.purchasePrice > 0 ? (gainLoss / card.purchasePrice) * 100 : 0;
      return { card, gainLoss, roiPercent };
    });

    const sorted = [...withPerformance].sort((a, b) => b.roiPercent - a.roiPercent);
    const topGainers = sorted.filter(p => p.roiPercent > 0).slice(0, 5);
    const topLosers = sorted.filter(p => p.roiPercent < 0).slice(-5).reverse();

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
      value: data.value
    }));

    // Year distribution
    const yearMap = new Map<number, number>();
    inventory.forEach(card => {
      yearMap.set(card.year, (yearMap.get(card.year) || 0) + 1);
    });
    const byYear = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year)
      .slice(-10);

    // Summary stats
    const totalInvested = inventory.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);
    const currentValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const gradedCount = inventory.filter(c => c.isGraded).length;
    const autoCount = inventory.filter(c => c.isAutographed).length;

    return {
      topGainers,
      topLosers,
      byLeague,
      byYear,
      totalInvested,
      currentValue,
      gradedCount,
      autoCount,
      roi: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0
    };
  }, [inventory]);

  const COLORS = ['#D9F99D', '#22C55E', '#10B981', '#059669', '#047857'];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Portfolio <span className="text-brand-lime">Trends</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            Performance analytics, gainers/losers, and portfolio composition insights.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: inventory.length, icon: Layers, color: 'text-white' },
          { label: 'Total Invested', value: `$${analytics.totalInvested.toLocaleString()}`, icon: DollarSign, color: 'text-white' },
          { label: 'Current Value', value: `$${analytics.currentValue.toLocaleString()}`, icon: TrendingUp, color: 'text-brand-lime' },
          { label: 'Portfolio ROI', value: `${analytics.roi >= 0 ? '+' : ''}${analytics.roi.toFixed(1)}%`, icon: Percent, color: analytics.roi >= 0 ? 'text-brand-green' : 'text-brand-red' }
        ].map((stat, i) => (
          <div key={i} className="bg-brand-slate border border-slate-800 rounded-[2rem] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-brand-charcoal rounded-xl">
                <stat.icon className="text-brand-lime" size={18} />
              </div>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Gainers */}
        <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green">
              <Flame size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">Top Gainers</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Highest ROI Assets</p>
            </div>
          </div>

          {analytics.topGainers.length > 0 ? (
            <div className="space-y-3">
              {analytics.topGainers.map((item, i) => (
                <div key={item.card.id} className="flex items-center gap-4 p-4 bg-brand-charcoal/50 rounded-2xl border border-slate-800/50">
                  <span className="text-2xl font-bebas text-brand-green w-8">#{i + 1}</span>
                  <img
                    src={item.card.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600'}
                    alt=""
                    className="w-12 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{item.card.player}</p>
                    <p className="text-[10px] text-brand-muted uppercase tracking-widest truncate">{item.card.set}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-brand-green">+{item.roiPercent.toFixed(1)}%</p>
                    <p className="text-[10px] text-brand-muted">+${item.gainLoss.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-brand-muted">
              <Activity className="mx-auto mb-4 opacity-30" size={48} />
              <p className="font-medium">Run Market Sync to see top gainers</p>
            </div>
          )}
        </section>

        {/* Top Losers */}
        <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-red/10 rounded-2xl text-brand-red">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">Underperformers</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Lowest ROI Assets</p>
            </div>
          </div>

          {analytics.topLosers.length > 0 ? (
            <div className="space-y-3">
              {analytics.topLosers.map((item, i) => (
                <div key={item.card.id} className="flex items-center gap-4 p-4 bg-brand-charcoal/50 rounded-2xl border border-slate-800/50">
                  <span className="text-2xl font-bebas text-brand-red w-8">#{i + 1}</span>
                  <img
                    src={item.card.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600'}
                    alt=""
                    className="w-12 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{item.card.player}</p>
                    <p className="text-[10px] text-brand-muted uppercase tracking-widest truncate">{item.card.set}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-brand-red">{item.roiPercent.toFixed(1)}%</p>
                    <p className="text-[10px] text-brand-muted">-${Math.abs(item.gainLoss).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-brand-muted">
              <TrendingDown className="mx-auto mb-4 opacity-30" size={48} />
              <p className="font-medium">Run Market Sync to see underperformers</p>
            </div>
          )}
        </section>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* League Distribution */}
        <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8">
          <h2 className="text-2xl font-bebas tracking-widest text-white mb-2">League Distribution</h2>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-6">Portfolio Value by League</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={analytics.byLeague} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={60} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-brand-charcoal border border-slate-800 rounded-xl p-3 shadow-xl">
                          <p className="font-bold text-white">{data.name}</p>
                          <p className="text-brand-lime font-mono">${data.value.toLocaleString()}</p>
                          <p className="text-xs text-brand-muted">{data.count} cards</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {analytics.byLeague.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Year Distribution */}
        <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8">
          <h2 className="text-2xl font-bebas tracking-widest text-white mb-2">Year Distribution</h2>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-6">Card Count by Release Year</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.byYear}>
                <defs>
                  <linearGradient id="colorYear" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9F99D" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#D9F99D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-brand-charcoal border border-slate-800 rounded-xl p-3 shadow-xl">
                          <p className="font-bold text-white">{payload[0].payload.year}</p>
                          <p className="text-brand-lime font-mono">{payload[0].value} cards</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#D9F99D" fillOpacity={1} fill="url(#colorYear)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Portfolio Composition */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Graded Cards', value: analytics.gradedCount, icon: Trophy, color: 'text-brand-lime' },
          { label: 'Raw Cards', value: inventory.length - analytics.gradedCount, icon: Layers, color: 'text-slate-400' },
          { label: 'Autographed', value: analytics.autoCount, icon: Flame, color: 'text-amber-400' },
          { label: 'Non-Auto', value: inventory.length - analytics.autoCount, icon: BarChart, color: 'text-slate-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-brand-charcoal/50 border border-slate-800/50 rounded-2xl p-5 text-center">
            <stat.icon className={`mx-auto mb-2 ${stat.color}`} size={24} />
            <p className="text-2xl font-mono font-bold text-white">{stat.value}</p>
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trends;
