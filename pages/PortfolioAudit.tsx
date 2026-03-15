
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Target,
  Briefcase,
  GitCompare,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { useSupabaseInventory } from '../lib/useSupabaseInventory.ts';
import { AggregationService } from '../lib/aggregationService.ts';

const PortfolioAudit: React.FC = () => {
    const { inventory } = useSupabaseInventory();

    const _metrics = useMemo(() => AggregationService.calculatePortfolioMetrics(inventory), [inventory]);
    const benchmarks = useMemo(() => AggregationService.getBenchmarkComparison(inventory), [inventory]);

    const diversityData = useMemo(() => {
        const leagues: Record<string, number> = {};
        inventory.forEach(c => {
            leagues[c.league] = (leagues[c.league] || 0) + 1;
        });
        return Object.entries(leagues).map(([name, value]) => ({ name, value }));
    }, [inventory]);

    const COLORS = ['#D9F99D', '#60A5FA', '#FCD34D', '#F87171', '#C084FC'];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded-full mb-2">
                        <ShieldCheck size={12} className="text-brand-orange" />
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Audit Terminal Active</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
                        Comparative <span className="text-brand-orange">Audit</span>
                    </h1>
                    <p className="text-brand-muted max-w-2xl font-medium">Benchmarking your asset allocation against global market indices and sector parity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Market Benchmark Chart */}
                <div className="xl:col-span-2 bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bebas tracking-widest flex items-center gap-3 text-white">
                            <TrendingUp className="text-brand-lime" size={24} />
                            Alpha Benchmarking
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-brand-slate rounded-lg text-[10px] font-black text-brand-muted uppercase tracking-widest">30D PERFORMANCE</span>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={benchmarks} layout="vertical" margin={{ left: 20, right: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 'bold' }}
                                    width={120}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '16px' }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                    {benchmarks.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {benchmarks.slice(0, 4).map((b, i) => (
                            <div key={i} className="p-5 bg-brand-slate border border-slate-800 rounded-[1.5rem] flex items-center justify-between group hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: b.color }}></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{b.name}</p>
                                        <p className="text-[10px] text-brand-muted font-bold uppercase tracking-tight">{b.description}</p>
                                    </div>
                                </div>
                                <span className={`text-sm font-mono font-black ${b.value >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                                    {b.value >= 0 ? '+' : ''}{b.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Portfolio Vitals */}
                <div className="space-y-8">
                    <section className="bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8">
                        <h2 className="text-2xl font-bebas tracking-wider mb-6 flex items-center gap-3 text-white">
                            <Activity className="text-brand-orange" size={24} />
                            Sector Parity
                        </h2>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={diversityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {diversityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '16px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 mt-4">
                            {diversityData.map((d, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-brand-slate border border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-xs font-bold text-slate-300">{d.name}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-white">{Math.round((d.value / inventory.length) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8">
                        <h2 className="text-2xl font-bebas tracking-wider mb-4 text-white">Alpha Score</h2>
                        <div className="flex items-center gap-6 mb-6">
                            <div className="text-6xl font-black text-brand-lime font-mono">88</div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Institutional Grade</p>
                                <div className="flex items-center gap-1 text-brand-green">
                                    <ArrowUpRight size={14} />
                                    <span className="text-xs font-bold">+12pts vs Peak</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-brand-muted leading-relaxed font-medium italic">
                            "Your high concentration in MiLB prospects and modern NBA rookies provides a significant volatility premium compared to standard Card Indices."
                        </p>
                    </section>
                </div>
            </div>

            {/* Comparative HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-brand-charcoal border border-slate-800 p-8 rounded-[2rem] flex flex-col gap-4">
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                        <GitCompare size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Bench Index Parity</p>
                        <h3 className="text-2xl font-bold text-white">Outperforming</h3>
                        <p className="text-xs text-brand-green font-bold mt-1">+5.8% vs S&P 500</p>
                    </div>
                </div>

                <div className="bg-brand-charcoal border border-slate-800 p-8 rounded-[2rem] flex flex-col gap-4">
                    <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Risk Exposure</p>
                        <h3 className="text-2xl font-bold text-white">Aggressive</h3>
                        <p className="text-xs text-brand-orange font-bold mt-1">High Volatility Detected</p>
                    </div>
                </div>

                <div className="bg-brand-charcoal border border-slate-800 p-8 rounded-[2rem] flex flex-col gap-4">
                    <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-lime">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Portfolio Velocity</p>
                        <h3 className="text-2xl font-bold text-white">High Liquidity</h3>
                        <p className="text-xs text-brand-green font-bold mt-1">Ready for repositioning</p>
                    </div>
                </div>

                <div className="bg-brand-charcoal border border-slate-800 p-8 rounded-[2rem] flex flex-col gap-4">
                    <div className="w-12 h-12 bg-brand-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Target Convergence</p>
                        <h3 className="text-2xl font-bold text-white">On Track</h3>
                        <p className="text-xs text-brand-green font-bold mt-1">92% Precision Score</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioAudit;
