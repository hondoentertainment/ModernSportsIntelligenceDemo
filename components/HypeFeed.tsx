import React from 'react';
import { Zap, TrendingUp, Bell, Sparkles, Activity } from 'lucide-react';

interface HypeEvent {
    id: string;
    type: 'hype' | 'signal' | 'trade' | 'scarcity';
    content: string;
    intensity: 'high' | 'medium' | 'low';
    timestamp: string;
}

const MOCK_EVENTS: HypeEvent[] = [
    { id: '1', type: 'scarcity', content: 'Pop 1 logic triggered for 1952 Topps Mickey Mantle. Market liquidity tightening.', intensity: 'high', timestamp: '2m ago' },
    { id: '2', type: 'hype', content: 'Caitlin Clark rookie sales volume up 400% in last 24h. Alpha divergence detected.', intensity: 'high', timestamp: '5m ago' },
    { id: '3', type: 'signal', content: 'Accumulate signal: Japanese Ohtani secondary market shows lagging alpha.', intensity: 'medium', timestamp: '12m ago' },
    { id: '4', type: 'trade', content: 'Institutional whale moved $45k into 90s inserts. Sector rotation active.', intensity: 'medium', timestamp: '25m ago' },
    { id: '5', type: 'hype', content: 'Anthony Edwards sentiment shift: "Aggressive" seller stance emerging.', intensity: 'low', timestamp: '40m ago' }
];

const HypeFeed: React.FC = () => {
    return (
        <div className="bg-brand-charcoal border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 bg-brand-charcoal/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-brand-lime animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Live Phase 14 <span className="text-brand-lime">Hype Feed</span></h3>
                </div>
                <Bell size={14} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {MOCK_EVENTS.map(event => (
                    <div key={event.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-brand-blue/30 transition-all group relative overflow-hidden">
                        <div className="flex gap-3">
                            <div className={`mt-1 h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${event.type === 'scarcity' ? 'bg-amber-500/10 text-amber-500' :
                                    event.type === 'hype' ? 'bg-brand-blue/10 text-brand-blue' :
                                        event.type === 'signal' ? 'bg-brand-lime/10 text-brand-lime' :
                                            'bg-brand-teal/10 text-brand-teal'
                                }`}>
                                {event.type === 'scarcity' ? <Zap size={12} /> :
                                    event.type === 'hype' ? <TrendingUp size={12} /> :
                                        event.type === 'signal' ? <Sparkles size={12} /> :
                                            <Activity size={12} />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                                    {event.content}
                                </p>
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                    <span className={event.intensity === 'high' ? 'text-brand-orange animate-pulse' : 'text-slate-500'}>
                                        {event.intensity} intensity
                                    </span>
                                    <span className="text-slate-600">{event.timestamp}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-brand-charcoal border-t border-slate-800 text-center">
                <button className="text-[9px] font-black uppercase tracking-widest text-brand-blue hover:text-white transition-colors">
                    Analyze Market Deep-History
                </button>
            </div>
        </div>
    );
};

export default React.memo(HypeFeed);
