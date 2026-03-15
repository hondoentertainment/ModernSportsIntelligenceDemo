import React, { useState, useEffect } from 'react';
import {
    Maximize2,
    Minimize2,
    Shield,
    Target,
    TrendingUp,
    Clock,
    Zap,
    Layout,
    Eye,
    EyeOff,
    Activity,
    Globe,
    ArrowUpRight,
    Search
} from 'lucide-react';

interface WallHUDProps {
    onClose: () => void;
    inventoryCount: number;
    totalMarketValue: string;
}

const InstitutionalWallHUD: React.FC<WallHUDProps> = ({ onClose, inventoryCount, totalMarketValue }) => {
    const [isStealthMode, setIsStealthMode] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatValue = (val: string) => isStealthMode ? '[REDACTED]' : val;

    return (
        <div className="fixed inset-0 z-[100] bg-brand-charcoal text-white flex flex-col font-mono overflow-hidden animate-in fade-in duration-700">
            {/* Top Navigation / Status Bar */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-brand-lime rounded-full animate-pulse" />
                        <span className="text-xl font-bebas tracking-[0.2em] text-white">MODERN SPORTS INTELLIGENCE // INSTITUTIONAL HUD</span>
                    </div>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Globe size={12} /> EST SERVER: ONLINE</span>
                        <span className="flex items-center gap-1"><Activity size={12} /> SYSTEM LATENCY: 12ms</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-xl text-white/60 font-mono tracking-tighter">
                        {currentTime}
                    </div>
                    <button
                        onClick={() => setIsStealthMode(!isStealthMode)}
                        className={`p-3 rounded-xl transition-all flex items-center gap-2 border ${isStealthMode ? 'bg-brand-red/10 border-brand-red/30 text-brand-red' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        {isStealthMode ? <EyeOff size={18} /> : <Eye size={18} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{isStealthMode ? 'Stealth Engaged' : 'Stealth Off'}</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
                    >
                        <Minimize2 size={18} />
                    </button>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="flex-1 grid grid-cols-12 gap-1 p-2 bg-black/20 overflow-hidden">

                {/* Left Column: Inventory Stream */}
                <div className="col-span-3 flex flex-col gap-1 overflow-hidden">
                    <div className="flex-1 bg-white/5 border border-white/5 p-4 space-y-4 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Live Asset Stream</span>
                            <Search size={14} className="text-white/20" />
                        </div>
                        <div className="space-y-1 overflow-y-auto max-h-full no-scrollbar">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-tight">V. Wembanyama Prizm</span>
                                        <span className="text-[9px] text-white/30 uppercase">PSA 10 // NBA</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-brand-lime">$4,250.00</div>
                                        <div className="text-[8px] text-white/20 font-bold uppercase">2m ago</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Hero NAV & Matrix */}
                <div className="col-span-6 flex flex-col gap-1">
                    {/* Top Hero Stats */}
                    <div className="grid grid-cols-3 gap-1 h-40">
                        <div className="bg-white/5 border border-white/5 p-6 flex flex-col justify-between">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Target size={12} className="text-brand-lime" /> PORTFOLIO NAV
                            </div>
                            <div className="text-5xl font-mono text-white tracking-tighter">
                                {formatValue(totalMarketValue)}
                            </div>
                            <div className="flex items-center gap-2 text-brand-lime text-[10px] font-bold">
                                <TrendingUp size={12} /> +2.4% TODAY
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 flex flex-col justify-between">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Shield size={12} className="text-brand-blue" /> ASSETS HELD
                            </div>
                            <div className="text-5xl font-mono text-white tracking-tighter">
                                {inventoryCount}
                            </div>
                            <div className="text-[10px] text-white/40 font-bold">INSTITUTIONAL TIER</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 flex flex-col justify-between">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Zap size={12} className="text-brand-orange" /> LIQUIDITY SCORE
                            </div>
                            <div className="text-5xl font-mono text-brand-orange tracking-tighter">
                                84<span className="text-2xl text-white/20">/100</span>
                            </div>
                            <div className="text-[10px] text-brand-orange/60 font-bold">HIGH LIQUIDITY</div>
                        </div>
                    </div>

                    {/* Main Visualizer Area */}
                    <div className="flex-1 bg-white/5 border border-white/5 relative group overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* This would be a 3D canvas or complex chart in a real app */}
                            <div className="w-full h-full p-8 flex flex-col items-center justify-center gap-8 opacity-40">
                                <div className="text-[10px] font-black tracking-[0.5em] text-white/20 uppercase">Market Volatility Heatmap</div>
                                <div className="grid grid-cols-12 gap-2 w-full">
                                    {[...Array(144)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`aspect-square rounded-[2px] border border-white/5 transition-all duration-1000`}
                                            style={{
                                                backgroundColor: `rgba(${Math.random() * 100}, ${150 + Math.random() * 100}, ${Math.random() * 50}, ${0.1 + Math.random() * 0.4})`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Overlay HUD Labels */}
                        <div className="absolute top-4 left-4 p-4 border-l-2 border-brand-lime bg-black/40 backdrop-blur-sm">
                            <div className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Active Scouting Zone</div>
                            <div className="text-[18px] font-mono text-white">MiLB BREAKOUT SECTOR // NYM</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Alerts & Swarm */}
                <div className="col-span-3 flex flex-col gap-1 overflow-hidden">
                    <div className="h-1/2 bg-white/5 border border-white/5 p-6 flex flex-col gap-4 overflow-hidden">
                        <div className="flex items-center gap-2 text-brand-red">
                            <Shield size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Risk Matrix Alerts</span>
                        </div>
                        <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                            {[
                                { t: 'CONCENTRATION RISK', d: 'MLB exposure > 45%', s: 'CRITICAL' },
                                { t: 'PRICE DRIFT', d: 'Ohtani Bowman Auto -12%', s: 'WARNING' },
                                { t: 'LIQUIDITY CRUNCH', d: 'Vintage NHL volume drop', s: 'STABLE' },
                            ].map((a, i) => (
                                <div key={i} className="p-3 bg-white/5 border border-white/10 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-white">{a.t}</span>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded ${a.s === 'CRITICAL' ? 'bg-brand-red text-white' : 'bg-brand-orange/20 text-brand-orange'}`}>{a.s}</span>
                                    </div>
                                    <div className="text-[9px] text-white/40">{a.d}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-1/2 bg-white/5 border border-white/5 p-6 flex flex-col gap-4 overflow-hidden italic">
                        <div className="flex items-center gap-2 text-brand-blue">
                            <Layout size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Commentary</span>
                        </div>
                        <div className="flex-1 text-[11px] text-white/60 space-y-4 font-light leading-relaxed">
                            <p>"Macro-Sentinel has detected an unusual accumulation of 1990s Skybox inserts in the Asia-Pacific region. Cross-asset correlation suggests a 14% spillover into early 2000s Refractors within the next 48-72 hours."</p>
                            <p>"Alpha Scout recommends exiting positions in current NBA hype-players before the upcoming liquidity window closes on Friday market open."</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Ticker */}
            <div className="h-10 bg-brand-lime text-black flex items-center overflow-hidden border-t-2 border-black">
                <div className="whitespace-nowrap animate-marquee flex gap-12 text-[11px] font-black uppercase tracking-widest italic">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <span>WHEELER 2013 CHROME +14.2%</span>
                            <span>//</span>
                            <span>JUDGE ROOKIE PSA 10 -2.1%</span>
                            <span>//</span>
                            <span>SOTO BOWMAN AUTO $14,500</span>
                            <span>//</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InstitutionalWallHUD;
