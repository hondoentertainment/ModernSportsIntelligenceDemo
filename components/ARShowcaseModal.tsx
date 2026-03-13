import React, { useMemo, useState } from 'react';
import {
  X,
  Glasses,
  Palette,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  getShowcaseCards,
  getThemes,
  ShowcaseCard,
  ShowcaseTheme,
} from '../lib/arShowcaseService';

interface ARShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ARShowcaseModal: React.FC<ARShowcaseModalProps> = ({ isOpen, onClose }) => {
  const cards = useMemo(() => getShowcaseCards(), []);
  const themes = useMemo(() => getThemes(), []);
  const [selectedTheme, setSelectedTheme] = useState<ShowcaseTheme>(themes[0]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-brand-lime/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl border border-brand-lime/30">
              <Glasses size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                  <Glasses size={10} />
                  Virtual Gallery
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                AR <span className="text-brand-lime">Showcase</span> Gallery
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <Palette size={14} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Gallery Theme
            </span>
          </div>
          <div className="flex gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  selectedTheme.id === theme.id
                    ? 'border-brand-lime text-brand-lime bg-brand-lime/10 ring-1 ring-brand-lime/30'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* Card Gallery */}
        <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
          <div
            className="rounded-2xl p-6 min-h-[300px] border border-slate-700/50 relative"
            style={{
              background: selectedTheme.background,
            }}
          >
            {/* Lighting overlay */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: selectedTheme.lighting }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
              {cards.map((card) => (
                <CardTile
                  key={card.id}
                  card={card}
                  isHovered={hoveredCard === card.id}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Card Tile ----

const CardTile: React.FC<{
  card: ShowcaseCard;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ card, isHovered, onMouseEnter, onMouseLeave }) => {
  const isPositive = card.change24h >= 0;

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ perspective: '600px' }}
    >
      <div
        className="rounded-xl border border-slate-600/50 bg-slate-800/80 backdrop-blur-sm p-4 transition-all duration-500"
        style={{
          transform: isHovered
            ? 'rotateY(8deg) rotateX(-4deg) translateZ(15px) scale(1.04)'
            : 'rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? '8px 8px 25px rgba(0,0,0,0.5), 0 0 15px rgba(132,204,22,0.1)'
            : '2px 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        {/* Player initials */}
        <div className="w-10 h-10 rounded-lg bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center mb-3">
          <span className="text-sm font-bebas text-brand-lime">
            {card.player.split(' ').map(n => n[0]).join('')}
          </span>
        </div>

        <p className="text-sm font-bold text-white truncate">{card.player}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {card.year} {card.set}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-brand-lime/10 border border-brand-lime/30 text-brand-lime rounded">
            {card.grade}
          </span>
          <span className="text-[10px] text-slate-500">{card.sport}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
          <span className="text-sm font-bold text-white">
            ${card.value.toLocaleString()}
          </span>
          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPositive ? '+' : ''}{card.change24h}%
          </span>
        </div>

        {/* Shine effect on hover */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(132,204,22,0.05) 45%, rgba(255,255,255,0.07) 50%, rgba(132,204,22,0.05) 55%, transparent 60%)',
            opacity: isHovered ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};

export default ARShowcaseModal;
