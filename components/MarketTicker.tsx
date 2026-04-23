// @ts-nocheck

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Wifi, WifiOff } from 'lucide-react';
import { CardInventory } from '../types';
import { useRealtimePrices, PriceTick } from '../lib/utils/useRealtimePrices';

interface MarketTickerProps {
    inventory: CardInventory[];
}

/** Build seed ticks from inventory so the ticker populates immediately. */
function buildSeedTicks(inventory: CardInventory[]): PriceTick[] {
    return inventory.slice(0, 20).map((item) => ({
        card_id: item.id,
        symbol: `${item.year} ${item.player}`.slice(0, 28),
        price: typeof item.currentValue === 'number' ? item.currentValue : 0,
        change_pct: 0,
    }));
}

const MarketTicker: React.FC<MarketTickerProps> = ({ inventory }) => {
    const seedTicks = useMemo(() => buildSeedTicks(inventory), [inventory]);

    const { prices, connected } = useRealtimePrices({ seedTicks, demoIntervalMs: 4500 });

    const tickerItems = useMemo(() => {
        const ticks = Array.from(prices.values()).filter((t) => t.price > 0);
        // Fall back to seed ticks when prices map is still empty
        const source = ticks.length > 0 ? ticks : seedTicks.filter((t) => t.price > 0);
        return source.slice(0, 20);
    }, [prices, seedTicks]);

    if (tickerItems.length === 0) return null;

    return (
        <div className="w-full bg-brand-charcoal/80 backdrop-blur-md border-y border-slate-800 h-10 flex items-center overflow-hidden z-20 relative">
            <div className="flex items-center px-4 border-r border-slate-800 h-full bg-brand-charcoal z-10 gap-2">
                <Activity size={14} className="text-brand-lime animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
                    Live Market Pulse
                </span>
                {connected ? (
                    <Wifi size={10} className="text-brand-lime" aria-label="Live data connected" />
                ) : (
                    <WifiOff size={10} className="text-slate-500" aria-label="Demo mode" />
                )}
            </div>

            <div className="flex flex-1 overflow-hidden pointer-events-none">
                <div className="flex animate-marquee whitespace-nowrap">
                    {[...tickerItems, ...tickerItems].map((item, idx) => {
                        const isPositive = item.change_pct >= 0;
                        return (
                            <div
                                key={`${item.card_id}-${idx}`}
                                className="flex items-center gap-4 px-8 border-r border-slate-800/50 pointer-events-auto cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                                    {item.symbol}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-white">
                                    ${item.price.toLocaleString()}
                                </span>
                                <div className={`flex items-center gap-1 text-[9px] font-black ${isPositive ? 'text-brand-green' : 'text-brand-red'}`}>
                                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {isPositive ? '+' : ''}{item.change_pct.toFixed(2)}%
                                </div>
                            </div>
                        );
                    })}
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
