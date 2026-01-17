
import React from 'react';
import { User, Settings, Heart, History, Shield, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-teal to-blue-500 p-1">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-950">
             <User size={64} className="text-brand-teal" />
          </div>
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-1">Alex Rivera</h1>
            <p className="text-brand-muted font-bold uppercase tracking-[0.2em] text-sm">Lead Intelligence Analyst • Pro Account</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {['NBA Analyst', 'Tactical Specialist', 'Trend Seeker'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm">
           Edit Profile
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Heart className="text-brand-teal" size={20} />
            Favorite Ecosystems
          </h2>
          <div className="space-y-4">
             {[
               { name: 'NBA', detail: 'Advanced Efficiency Focus' },
               { name: 'NFL', detail: 'Tactical Play Patterns' },
               { name: 'Golden State Warriors', detail: 'Lineup Analysis' }
             ].map(fav => (
               <div key={fav.name} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
                 <div>
                   <p className="font-bold">{fav.name}</p>
                   <p className="text-[10px] text-brand-muted uppercase font-bold">{fav.detail}</p>
                 </div>
                 <button className="text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors">Manage</button>
               </div>
             ))}
          </div>
        </section>

        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Settings className="text-brand-teal" size={20} />
            Intelligence Preferences
          </h2>
          <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="font-bold text-sm">Insight Depth</p>
                 <p className="text-xs text-brand-muted">Balance between raw data and narrative.</p>
               </div>
               <select className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold p-2 focus:outline-none">
                 <option>Context Heavy</option>
                 <option>Balanced</option>
                 <option>Data Only</option>
               </select>
             </div>
             <div className="flex items-center justify-between">
               <div>
                 <p className="font-bold text-sm">Alert Sensitivity</p>
                 <p className="text-xs text-brand-muted">Only notify for high-impact signals.</p>
               </div>
               <div className="flex gap-2">
                 {['Low', 'Med', 'High'].map(lv => (
                   <button key={lv} className={`px-3 py-1 rounded-lg text-[10px] font-black border transition-all ${lv === 'High' ? 'bg-brand-teal border-brand-teal text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                     {lv}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        </section>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <History className="text-brand-teal" size={20} />
          Recently Viewed Intelligence
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="aspect-video bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-700 font-bold">
                Report #{i}
             </div>
           ))}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button className="flex items-center gap-2 text-red-400 font-bold hover:text-red-300 transition-colors uppercase tracking-[0.2em] text-xs">
          <LogOut size={16} /> Sign out of Intelligence Platform
        </button>
      </div>
    </div>
  );
};

export default Profile;
