
import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { CardInventory } from '../types';
import DataSourceBadge from './DataSourceBadge';

interface MarketTickerProps {
    inventory: CardInventory[];
}

interface TickerItem {
    id: string;
    label: string;
    price: number;
    change: string;
    isPositive: boolean | null;
}

function computeDelta(item: CardInventory): number | null {
    const current = typeof item.currentValue === 'number' ? item.currentValue : null;
    if (current === null) return null;
    const basis = typeof item.purchasePrice === 'number' && item.purchasePrice > 0 ? item.purchasePrice : null;
    if (basis === null) return null;
    return ((current - basis) / basis) * 100;
}

const MarketTicker: React.FC<MarketTickerProps> = ({ inventory }) => {
    const tickerItems = useMemo<TickerItem[]>(() => {
        const items = [...inventory].slice(0, 10);
        return items.map(item => {
            const delta = computeDelta(item);
            if (delta === null) {
                return {
                    id: item.id,
                    label: `${item.year} ${item.manufacturer} ${item.player}`,
                    price: item.currentValue || 0,
                    change: '—',
                    isPositive: null,
                };
            }
            return {
                id: item.id,
                label: `${item.year} ${item.manufacturer} ${item.player}`,
                price: item.currentValue || 0,
                change: delta.toFixed(2),
                isPositive: delta >= 0,
            };
        });
    }, [inventory]);

    const allFallback = tickerItems.length === 0 || tickerItems.every(item => item.change === '—');

    return (
        <div className="w-full bg-brand-charcoal/80 backdrop-blur-md border-y border-slate-800 h-10 flex items-center overflow-hidden z-20 relative">
            <div className="flex items-center gap-2 px-4 border-r border-slate-800 h-full bg-brand-charcoal z-10">
                <Activity size={14} className="text-brand-lime mr-2 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
                    Live Market Pulse
                </span>
                {allFallback && <DataSourceBadge variant="sample" size="xs" />}
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
                            {item.isPositive === null ? (
                                <div className="flex items-center gap-1 text-[9px] font-black text-slate-500">
                                    {item.change}
                                </div>
                            ) : (
                                <div className={`flex items-center gap-1 text-[9px] font-black ${item.isPositive ? 'text-brand-green' : 'text-brand-red'}`}>
                                    {item.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {item.isPositive ? '+' : ''}{item.change}%
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketTicker;
