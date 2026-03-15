import React, { useState, useMemo } from 'react';
import {
  Glasses,
  Share2,
  Copy,
  CheckCircle2,
  Palette,
  Grid3X3,
  Layers,
  TrendingUp,
  TrendingDown,
  Eye,
  DollarSign,
  Award,
  BarChart3,
} from 'lucide-react';
import {
  getShowcaseCards,
  getThemes,
  getShareableLink,
  getShowcaseStats,
  ShowcaseCard,
  ShowcaseTheme,
} from '../lib/arShowcaseService';

type ViewMode = 'grid' | 'spotlight' | 'stack';

const VIEW_MODES: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'grid', label: 'Grid', icon: <Grid3X3 size={16} /> },
  { id: 'spotlight', label: 'Spotlight', icon: <Eye size={16} /> },
  { id: 'stack', label: 'Stack', icon: <Layers size={16} /> },
];

const ARShowcase: React.FC = () => {
  const cards = useMemo(() => getShowcaseCards(), []);
  const themes = useMemo(() => getThemes(), []);
  const stats = useMemo(() => getShowcaseStats(cards), [cards]);

  const [selectedTheme, setSelectedTheme] = useState<ShowcaseTheme>(themes[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const shareUrl = useMemo(
    () => getShareableLink(cards.map(c => c.id)),
    [cards]
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-lime/20 border border-brand-lime/30">
            <Glasses size={24} className="text-brand-lime" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">AR Showcase</h1>
            <p className="text-sm text-slate-400">3D Virtual Card Gallery & Display</p>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            copied
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-brand-lime/10 border border-brand-lime/30 text-brand-lime hover:bg-brand-lime/20'
          }`}
        >
          {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
          {copied ? 'Link Copied!' : 'Share Showcase'}
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        {/* Display Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Display
          </span>
          <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === mode.id
                    ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-slate-700" />

        {/* Theme Selector */}
        <div className="flex items-center gap-2">
          <Palette size={14} className="text-brand-lime" />
          <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Theme
          </span>
          <div className="flex gap-1">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTheme.id === theme.id
                    ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                    : 'text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-slate-700" />

        {/* Stats Toggle */}
        <button
          onClick={() => setShowStats(!showStats)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            showStats
              ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
              : 'text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          <BarChart3 size={14} />
          Stats
        </button>
      </div>

      {/* Stats Overlay */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            icon={<Layers size={16} className="text-brand-lime" />}
            label="Total Cards"
            value={stats.totalCards.toString()}
          />
          <StatCard
            icon={<DollarSign size={16} className="text-emerald-400" />}
            label="Total Value"
            value={`$${stats.totalValue.toLocaleString()}`}
          />
          <StatCard
            icon={<Award size={16} className="text-amber-400" />}
            label="Avg Grade"
            value={stats.avgGrade.toString()}
          />
          <StatCard
            icon={<BarChart3 size={16} className="text-blue-400" />}
            label="Top Sport"
            value={stats.topSport}
          />
          <StatCard
            icon={<Eye size={16} className="text-purple-400" />}
            label="Views"
            value={stats.viewCount.toLocaleString()}
          />
          <StatCard
            icon={<Share2 size={16} className="text-brand-lime" />}
            label="Shares"
            value={stats.shareCount.toLocaleString()}
          />
        </div>
      )}

      {/* Main Gallery Area */}
      <div
        className="rounded-2xl border border-slate-700/50 relative overflow-hidden"
        style={{
          background: selectedTheme.background,
          minHeight: '500px',
        }}
      >
        {/* Lighting overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: selectedTheme.lighting }}
        />

        <div className="relative z-10 p-6">
          {viewMode === 'grid' && (
            <GridView
              cards={cards}
              hoveredCard={hoveredCard}
              onHover={setHoveredCard}
            />
          )}
          {viewMode === 'spotlight' && (
            <SpotlightView
              cards={cards}
              activeIndex={spotlightIndex}
              onChangeIndex={setSpotlightIndex}
            />
          )}
          {viewMode === 'stack' && (
            <StackView
              cards={cards}
              hoveredCard={hoveredCard}
              onHover={setHoveredCard}
            />
          )}
        </div>
      </div>

      {/* Shareable Link */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-3">
          <Share2 size={14} className="text-brand-lime flex-shrink-0" />
          <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Shareable Link
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white font-mono truncate">
            {shareUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-brand-lime/10 border border-brand-lime/30 text-brand-lime hover:bg-brand-lime/20'
            }`}
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Stat Card ----

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-lg font-bebas tracking-wider text-white">{value}</p>
    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
  </div>
);

// ---- Grid View ----

const GridView: React.FC<{
  cards: ShowcaseCard[];
  hoveredCard: string | null;
  onHover: (_id: string | null) => void;
}> = ({ cards, hoveredCard, onHover }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {cards.map((card) => (
      <div
        key={card.id}
        className="relative cursor-pointer"
        onMouseEnter={() => onHover(card.id)}
        onMouseLeave={() => onHover(null)}
        style={{ perspective: '800px' }}
      >
        <div
          className="rounded-xl border border-slate-600/50 bg-slate-800/80 backdrop-blur-sm p-4 transition-all duration-500"
          style={{
            transform: hoveredCard === card.id
              ? 'rotateY(10deg) rotateX(-5deg) translateZ(20px) scale(1.05)'
              : 'rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)',
            transformStyle: 'preserve-3d',
            boxShadow: hoveredCard === card.id
              ? '10px 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(132,204,22,0.12)'
              : '2px 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          <CardContent card={card} />

          {/* Shine effect */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(132,204,22,0.05) 45%, rgba(255,255,255,0.08) 50%, rgba(132,204,22,0.05) 55%, transparent 60%)',
              opacity: hoveredCard === card.id ? 1 : 0,
            }}
          />
        </div>
      </div>
    ))}
  </div>
);

// ---- Spotlight View ----

const SpotlightView: React.FC<{
  cards: ShowcaseCard[];
  activeIndex: number;
  onChangeIndex: (_index: number) => void;
}> = ({ cards, activeIndex, onChangeIndex }) => {
  const activeCard = cards[activeIndex];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main spotlight card */}
      <div style={{ perspective: '1200px' }} className="w-full max-w-sm">
        <div
          className="rounded-2xl border-2 border-brand-lime/30 bg-slate-800/90 backdrop-blur-sm p-8 transition-all duration-700 mx-auto"
          style={{
            transform: 'rotateY(0deg) rotateX(2deg) translateZ(30px)',
            transformStyle: 'preserve-3d',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(132,204,22,0.1)',
          }}
        >
          {/* Large player initials */}
          <div className="w-20 h-20 rounded-2xl bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bebas text-brand-lime">
              {activeCard.player.split(' ').map(n => n[0]).join('')}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white text-center">{activeCard.player}</h3>
          <p className="text-sm text-slate-400 text-center mt-1">
            {activeCard.year} {activeCard.set}
          </p>

          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="px-3 py-1 bg-brand-lime/10 border border-brand-lime/30 text-brand-lime rounded-lg text-sm font-bold">
              {activeCard.grade}
            </span>
            <span className="text-xs text-slate-500 px-2 py-1 bg-slate-700/50 rounded-lg">
              {activeCard.sport}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-700/50">
            <span className="text-2xl font-bold text-white">
              ${activeCard.value.toLocaleString()}
            </span>
            <span className={`flex items-center gap-1 text-sm font-bold ${activeCard.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {activeCard.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {activeCard.change24h >= 0 ? '+' : ''}{activeCard.change24h}%
            </span>
          </div>

          {/* Spotlight glow */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(132,204,22,0.08) 0%, transparent 60%)',
            }}
          />
        </div>
      </div>

      {/* Card selector strip */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => onChangeIndex(index)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              index === activeIndex
                ? 'border-brand-lime text-brand-lime bg-brand-lime/10'
                : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            {card.player.split(' ').pop()}
          </button>
        ))}
      </div>
    </div>
  );
};

// ---- Stack View ----

const StackView: React.FC<{
  cards: ShowcaseCard[];
  hoveredCard: string | null;
  onHover: (_id: string | null) => void;
}> = ({ cards, hoveredCard, onHover }) => (
  <div className="flex justify-center py-8">
    <div className="relative" style={{ perspective: '1200px', width: '300px', height: '420px' }}>
      {cards.map((card, index) => {
        const isHovered = hoveredCard === card.id;
        const offset = index * 3;
        const rotation = (index - Math.floor(cards.length / 2)) * 4;

        return (
          <div
            key={card.id}
            className="absolute inset-0 cursor-pointer transition-all duration-500"
            onMouseEnter={() => onHover(card.id)}
            onMouseLeave={() => onHover(null)}
            style={{
              transform: isHovered
                ? `translateY(-40px) translateX(${rotation * 3}px) rotateZ(0deg) rotateY(5deg) translateZ(${60 + index * 10}px) scale(1.05)`
                : `translateY(${offset}px) translateX(${rotation * 1.5}px) rotateZ(${rotation * 0.5}deg) translateZ(${index * 5}px)`,
              transformStyle: 'preserve-3d',
              zIndex: isHovered ? 50 : cards.length - index,
              transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            <div
              className="w-full h-full rounded-2xl border bg-slate-800/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center"
              style={{
                borderColor: isHovered ? 'rgba(132,204,22,0.4)' : 'rgba(100,116,139,0.3)',
                boxShadow: isHovered
                  ? '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(132,204,22,0.1)'
                  : `0 ${4 + index * 2}px ${10 + index * 3}px rgba(0,0,0,0.3)`,
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center mb-3">
                <span className="text-xl font-bebas text-brand-lime">
                  {card.player.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              <h4 className="text-lg font-bold text-white text-center">{card.player}</h4>
              <p className="text-xs text-slate-400 mt-1">
                {card.year} {card.set}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 bg-brand-lime/10 border border-brand-lime/30 text-brand-lime rounded text-xs font-bold">
                  {card.grade}
                </span>
                <span className="text-xs text-slate-500">{card.sport}</span>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-700/50">
                <span className="text-lg font-bold text-white">
                  ${card.value.toLocaleString()}
                </span>
                <span className={`flex items-center gap-0.5 text-xs font-bold ${card.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.change24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {card.change24h >= 0 ? '+' : ''}{card.change24h}%
                </span>
              </div>

              {/* Shine */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(110deg, transparent 35%, rgba(132,204,22,0.04) 45%, rgba(255,255,255,0.06) 50%, rgba(132,204,22,0.04) 55%, transparent 65%)',
                  opacity: isHovered ? 1 : 0,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ---- Card Content (shared) ----

const CardContent: React.FC<{ card: ShowcaseCard }> = ({ card }) => {
  const isPositive = card.change24h >= 0;

  return (
    <>
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
    </>
  );
};

export default ARShowcase;
