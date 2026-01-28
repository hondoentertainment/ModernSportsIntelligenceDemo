
import React, { useState, useEffect } from 'react';
import { Calendar, Target, Zap, Clock, ShieldCheck, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import { generateDailySchedule, GameMatchup } from '../lib/matchupEngine.ts';

const Games: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [games, setGames] = useState<GameMatchup[]>([]);
  const [activeLeague, setActiveLeague] = useState<string>('ALL');

  useEffect(() => {
    const dailyGames = generateDailySchedule(selectedDate);
    setGames(dailyGames);
  }, [selectedDate]);

  const filteredGames = activeLeague === 'ALL'
    ? games
    : games.filter(g => g.league === activeLeague);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bebas tracking-tight text-white mb-2">Matchup <span className="text-brand-lime">Intelligence</span></h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            AI-powered pre-game analysis and tactical breakdown for today's slate.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-brand-slate border border-slate-800 p-2 rounded-2xl">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-2">
            <Calendar size={16} className="text-brand-lime" />
            <span className="font-mono font-bold text-sm min-w-[100px] text-center">
              {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* league Filter */}
      <div className="flex gap-2">
        {['ALL', 'NBA', 'MLB'].map(lg => (
          <button
            key={lg}
            onClick={() => setActiveLeague(lg)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeLeague === lg ? 'bg-brand-lime border-brand-lime text-brand-charcoal' : 'bg-transparent border-slate-800 text-brand-muted hover:border-slate-700'}`}
          >
            {lg}
          </button>
        ))}
      </div>

      {/* Games Feed */}
      <div className="space-y-6">
        {filteredGames.length > 0 ? filteredGames.map((game) => (
          <div key={game.id} className="bg-brand-slate border border-slate-800 rounded-[2.5rem] overflow-hidden group hover:border-brand-lime/30 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12">

              {/* Matchup Column */}
              <div className="lg:col-span-4 p-8 bg-brand-charcoal/50 border-r border-slate-800 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-lime/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black bg-slate-800 text-brand-muted px-2 py-1 rounded text-center uppercase tracking-widest">{game.league}</span>
                  <span className="text-[10px] font-black text-white flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                    <Clock size={12} className="text-brand-lime" /> {game.time}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <img src={game.awayTeam.logo} alt="" className="w-16 h-16 object-contain drop-shadow-lg" />
                    <span className="font-bold text-sm text-center leading-tight">{game.awayTeam.name.split(' ').pop()}</span>
                    <div className="text-[10px] font-mono text-slate-500">OFF: {game.awayTeam.offense}</div>
                  </div>

                  <div className="flex flex-col items-center gap-1 z-10">
                    <span className="text-2xl font-bebas text-brand-muted opacity-50">VS</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {game.odds.spread}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-3 flex-1">
                    <img src={game.homeTeam.logo} alt="" className="w-16 h-16 object-contain drop-shadow-lg" />
                    <span className="font-bold text-sm text-center leading-tight">{game.homeTeam.name.split(' ').pop()}</span>
                    <div className="text-[10px] font-mono text-slate-500">DEF: {game.homeTeam.defense}</div>
                  </div>
                </div>
              </div>

              {/* Intelligence Column */}
              <div className="lg:col-span-8 p-8 flex flex-col justify-center">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-brand-lime/10 rounded-2xl">
                    <Activity size={24} className="text-brand-lime" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{game.narrative.headline}</h3>
                    <p className="text-brand-muted text-sm leading-relaxed max-w-xl">
                      {game.narrative.preview}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-brand-charcoal/30 rounded-2xl border border-slate-800 flex items-start gap-3">
                    <Target size={18} className="text-brand-orange mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Key Factor</p>
                      <p className="text-sm font-bold text-white">{game.narrative.keyMatchup}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-brand-charcoal/30 rounded-2xl border border-slate-800 flex items-start gap-3">
                    <Zap size={18} className="text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Advantage</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{game.narrative.advantage}</span>
                        <span className="text-[10px] font-mono text-brand-green bg-brand-green/10 px-1.5 rounded">{game.narrative.confidence}% CONF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-brand-slate border border-slate-800 rounded-[3rem]">
            <p className="text-brand-muted font-medium">No matchups scheduled for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
