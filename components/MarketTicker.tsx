
import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { CardInventory } from '../types';

interface MarketTickerProps {
    inventory: CardInventory[];
}

const MarketTicker: React.FC<MarketTickerProps> = ({ inventory }) => {
    const tickerItems = useMemo(() => {
        // Select a mix of inventory and targets to show in ticker
        const items = [...inventory].slice(0, 10);
        return items.map(item => ({
            id: item.id,
            label: `${item.year} ${item.manufacturer} ${item.player}`,
            price: item.currentValue || 0,
            change: (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2),
            isPositive: Math.random() > 0.4 // Lean positive for demo
        }));
    }, [inventory]);

    return (
        <div className="w-full bg-brand-charcoal/80 backdrop-blur-md border-y border-slate-800 h-10 flex items-center overflow-hidden z-20 relative">
            <div className="flex items-center px-4 border-r border-slate-800 h-full bg-brand-charcoal z-10">
                <Activity size={14} className="text-brand-lime mr-2 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
                    Live Market Pulse
                </span>
            </div>

            <div className="flex flex-1 overflow-hidden pointer-events-none">
                <div className="flex animate-marquee whitespace-nowrap">
                    {[...tickerItems, ...tickerItems].map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex items-center gap-4 px-8 border-r border-slate-800/50 pointer-events-auto cursor-pointer hover:bg-white/5 transition-colors">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                                {item.label}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-white">
                                ${item.price.toLocaleString()}
                            </span>
                            <div className={`flex items-center gap-1 text-[9px] font-black ${item.isPositive ? 'text-brand-green' : 'text-brand-red'}`}>
                                {item.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {item.isPositive ? '+' : ''}{item.change}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
        </div>
    );
};

export default MarketTicker;
