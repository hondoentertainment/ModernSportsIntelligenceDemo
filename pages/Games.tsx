
import React from 'react';
import { Calendar, Target, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { MOCK_GAMES, MOCK_TEAMS } from '../constants.tsx';

const Games: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-white">Matchup Intelligence</h1>
          <p className="text-brand-muted max-w-2xl">Contextualizing why tonight's games matter beyond the score.</p>
        </div>
      </div>

      <div className="space-y-6">
        {MOCK_GAMES.map((game) => (
          <div key={game.id} className="bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-4">
              <div className="lg:col-span-1 p-8 bg-slate-900/50 border-r border-slate-800 flex flex-col justify-center items-center text-center">
                <div className="flex items-center gap-6 mb-4">
                  <img src={MOCK_TEAMS[0].logo} alt="" className="w-12 h-12 object-contain" />
                  <div className="text-xs font-black text-slate-700">VS</div>
                  <img src={MOCK_TEAMS[1].logo} alt="" className="w-12 h-12 object-contain" />
                </div>
                <h3 className="text-lg font-bold mb-1">{game.homeTeam} vs {game.awayTeam}</h3>
                <p className="text-xs text-brand-muted font-bold flex items-center gap-1">
                  <Calendar size={12} /> {game.time}
                </p>
              </div>

              <div className="lg:col-span-3 p-8 space-y-8">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-muted mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-brand-lime" /> Preview Intelligence
                  </h4>
                  <p className="text-lg text-slate-300 leading-relaxed font-medium">"{game.preview}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-5 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                    <h5 className="text-[10px] font-black text-brand-lime uppercase mb-2 flex items-center gap-2">
                      <Target size={14} /> Key Matchup Advantage
                    </h5>
                    <p className="text-sm font-medium text-slate-200 leading-relaxed">{game.keyMatchup}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Games;
