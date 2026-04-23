// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Glasses, ChevronRight, DollarSign, Layers } from 'lucide-react';
import { getShowcaseCards, getShowcaseStats } from '../lib/utils/arShowcaseService';

interface ARShowcaseWidgetProps {
  onClick?: () => void;
}

export const ARShowcaseWidget: React.FC<ARShowcaseWidgetProps> = ({ onClick }) => {
  const cards = useMemo(() => getShowcaseCards(), []);
  const stats = useMemo(() => getShowcaseStats(cards), [cards]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const featuredCard = cards[0];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Glasses size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              AR <span className="text-brand-lime">Showcase</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              3D Virtual Card Gallery
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Featured Card with 3D Transform */}
      {featuredCard && (
        <div className="flex justify-center py-2">
          <div
            className="relative w-40 h-56 rounded-xl border-2 border-brand-lime/30 overflow-hidden cursor-pointer"
            onMouseEnter={() => setHoveredCard(featuredCard.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              perspective: '800px',
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex flex-col items-center justify-center p-3 transition-transform duration-500"
              style={{
                transform: hoveredCard === featuredCard.id
                  ? 'rotateY(12deg) rotateX(-5deg) translateZ(20px)'
                  : 'rotateY(0deg) rotateX(0deg) translateZ(0px)',
                transformStyle: 'preserve-3d',
                boxShadow: hoveredCard === featuredCard.id
                  ? '10px 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(132,204,22,0.15)'
                  : '4px 4px 15px rgba(0,0,0,0.3)',
              }}
            >
              {/* Card face */}
              <div className="w-12 h-12 rounded-full bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center mb-2">
                <span className="text-lg font-bebas text-brand-lime">
                  {featuredCard.player.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <p className="text-xs font-bold text-white text-center truncate w-full">
                {featuredCard.player}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {featuredCard.year} {featuredCard.set}
              </p>
              <div className="mt-2 px-2 py-0.5 bg-brand-lime/10 border border-brand-lime/30 rounded text-[10px] font-bold text-brand-lime">
                {featuredCard.grade}
              </div>
              <p className="text-sm font-bold text-white mt-2">
                ${featuredCard.value.toLocaleString()}
              </p>
              {/* Shine effect */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(132,204,22,0.06) 45%, rgba(255,255,255,0.08) 50%, rgba(132,204,22,0.06) 55%, transparent 60%)',
                  opacity: hoveredCard === featuredCard.id ? 1 : 0,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-brand-lime" />
          <span className="text-sm font-bold text-white">{stats.totalCards}</span>
          <span className="text-xs text-slate-400">cards</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">${stats.totalValue.toLocaleString()}</span>
          <span className="text-xs text-slate-400">total</span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-lime/10 border border-brand-lime/30 text-brand-lime rounded-xl text-xs font-bold">
        <Glasses size={14} />
        Open AR Showcase
      </div>
    </button>
  );
};

export default ARShowcaseWidget;
