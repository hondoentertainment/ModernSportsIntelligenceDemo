import React, { useMemo } from 'react';
import {
  LayoutGrid,
  Heart,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getShowcases,
  getShowcaseAnalytics,
  SHOWCASE_THEMES,
} from '../lib/showcaseService';

interface ShowcaseWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

export const ShowcaseWidget: React.FC<ShowcaseWidgetProps> = ({ cards, onClick }) => {
  const showcases = useMemo(() => getShowcases(), []);

  const totalReactions = useMemo(() => {
    return showcases.reduce((sum, s) => {
      const analytics = getShowcaseAnalytics(s);
      return sum + analytics.totalReactions;
    }, 0);
  }, [showcases]);

  const featuredShowcase = useMemo(() => {
    if (showcases.length === 0) return null;
    // Pick the most recently updated showcase
    return [...showcases].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
  }, [showcases]);

  const featuredTheme = useMemo(() => {
    if (!featuredShowcase) return null;
    return SHOWCASE_THEMES.find(t => t.id === featuredShowcase.themeId) ?? SHOWCASE_THEMES[0];
  }, [featuredShowcase]);

  const cardMap = useMemo(() => {
    return new Map(cards.map(c => [c.id, c]));
  }, [cards]);

  const featuredPreviewCards = useMemo(() => {
    if (!featuredShowcase) return [];
    return featuredShowcase.cards.slice(0, 4).map(sc => {
      const card = cardMap.get(sc.cardId);
      return card ? { ...sc, card } : null;
    }).filter(Boolean) as { cardId: string; card: CardInventory }[];
  }, [featuredShowcase, cardMap]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
            <LayoutGrid size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Display <span className="text-purple-400">Showcases</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Digital display case builder
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-2">
          <LayoutGrid size={14} className="text-purple-400" />
          <span className="text-sm font-bold text-white">{showcases.length}</span>
          <span className="text-xs text-slate-400">showcase{showcases.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-red-400" />
          <span className="text-sm font-bold text-white">{totalReactions.toLocaleString()}</span>
          <span className="text-xs text-slate-400">reactions</span>
        </div>
      </div>

      {/* Featured Showcase Preview */}
      {featuredShowcase && featuredTheme && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            Latest: {featuredShowcase.name}
          </p>
          <div
            className="rounded-xl p-3 border"
            style={{
              background: featuredTheme.background,
              borderColor: featuredTheme.cardBorder + '40',
            }}
          >
            <div className="grid grid-cols-4 gap-2">
              {featuredPreviewCards.map(item => (
                <div
                  key={item.cardId}
                  className="rounded-lg p-2 text-center"
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    border: `1px solid ${featuredTheme.cardBorder}60`,
                  }}
                >
                  <div
                    className="text-[10px] font-bold truncate"
                    style={{ color: featuredTheme.textColor }}
                  >
                    {item.card.player}
                  </div>
                  <div
                    className="text-[9px] truncate"
                    style={{ color: featuredTheme.accentColor }}
                  >
                    ${(item.card.currentValue ?? item.card.purchasePrice).toLocaleString()}
                  </div>
                </div>
              ))}
              {featuredPreviewCards.length === 0 && (
                <div
                  className="col-span-4 text-center text-[10px] py-2"
                  style={{ color: featuredTheme.accentColor }}
                >
                  No cards added yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {showcases.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/5 border border-purple-500/15 rounded-xl">
          <Eye size={14} className="text-purple-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">
            Create your first showcase to display your best cards
          </span>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold">
        <LayoutGrid size={14} />
        Open Showcase Builder
      </div>
    </button>
  );
};

export default ShowcaseWidget;
