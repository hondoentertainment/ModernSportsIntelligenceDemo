
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, TrendingUp, BarChart, Shield, Target, Flame, CreditCard, ArrowUpRight, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_PLAYERS } from '../constants.tsx';

const PlayerDetail: React.FC = () => {
  const { id } = useParams();
  const player = MOCK_PLAYERS.find(p => p.id === id) || MOCK_PLAYERS[0];

  const trendData = [
    { name: 'Jan 1', score: 88, usage: 22 },
    { name: 'Jan 5', score: 90, usage: 24 },
    { name: 'Jan 10', score: 89, usage: 25 },
    { name: 'Jan 15', score: 92, usage: 28 },
    { name: 'Jan 20', score: 95, usage: 31 },
    { name: 'Jan 25', score: 94, usage: 32 },
    { name: 'Jan 30', score: 96, usage: 34 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/players" className="inline-flex items-center gap-2 text-brand-muted hover:text-white transition-colors font-semibold text-sm">
        <ChevronLeft size={18} /> Back to Players
      </Link>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-8 opacity-5 transition-opacity ${player.breakoutScore > 80 ? 'text-brand-green opacity-10' : 'text-slate-100'}`}>
           <Flame size={120} />
        </div>
        <img src={player.image} alt={player.name} className="w-40 h-40 rounded-3xl object-cover border-4 border-slate-800 z-10" />
        <div className="flex-1 space-y-4 text-center md:text-left z-10">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-4xl font-black tracking-tight">{player.name}</h1>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${player.breakoutScore > 80 ? 'bg-brand-green/10 border-brand-green/20 text-brand-green' : 'bg-brand-lime/10 border-brand-lime/20 text-brand-lime'}`}>
                {player.breakoutScore > 80 ? 'BREAKOUT ALERT' : 'ELITE TIER 1'}
              </span>
            </div>
            <p className="text-brand-muted text-lg font-medium">{player.team} • {player.position} • #0</p>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl italic">
            "{player.summary}"
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end justify-center bg-slate-950 p-6 rounded-3xl border border-slate-800 z-10 min-w-[180px]">
          <p className="text-xs font-bold text-brand-muted uppercase mb-1">Breakout Score</p>
          <span className={`text-6xl font-black ${player.breakoutScore > 80 ? 'text-brand-green' : 'text-white'}`}>{player.breakoutScore}</span>
          <div className="flex items-center gap-2 mt-2 text-brand-green font-black">
            <TrendingUp size={18} /> +{player.trend}% (30D)
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart className="text-brand-lime" size={20} />
                Breakout IQ vs. Usage
              </h2>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-lime"></div>
                    <span className="text-[10px] font-bold text-brand-muted uppercase">Intelligence</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-brand-muted uppercase">Usage %</span>
                 </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="score" stroke="oklch(0.88 0.20 127)" strokeWidth={4} dot={{ fill: 'oklch(0.88 0.20 127)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line yAxisId="right" type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-brand-lime/5 border border-brand-lime/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
               <CreditCard className="text-brand-lime" size={24} />
               <h2 className="text-lg font-bold">Market Intelligence</h2>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                 <p className="text-[10px] font-black uppercase text-brand-muted mb-2 tracking-widest">Collector Intelligence</p>
                 <p className="text-sm text-slate-300 italic leading-relaxed">
                   "{player.marketContext}"
                 </p>
              </div>
              
              <Link to="/collection" className="block w-full py-3 bg-brand-lime hover:bg-lime-400 text-brand-charcoal text-center font-bold rounded-xl transition-all shadow-lg shadow-brand-lime/20 text-xs">
                Add to Watchlist
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
