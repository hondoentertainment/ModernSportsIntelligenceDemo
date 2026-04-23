// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  LayoutGrid,
  Palette,
  Share2,
  Plus,
  Trash2,
  Edit3,
  Star,
  Search,
  Copy,
  Download,
  Eye,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  Showcase,
  LayoutType,
  SHOWCASE_THEMES,
  REACTION_EMOJIS,
  getShowcases,
  createShowcase,
  updateShowcase,
  deleteShowcase,
  addCardToShowcase,
  removeCard,
  setFeaturedCard,
  generateShareUrl,
  getShowcaseAnalytics,
  exportShowcaseHTML,
} from '../lib/utils/showcaseService';

interface ShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'showcases' | 'builder' | 'share';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'showcases', label: 'My Showcases', icon: <LayoutGrid size={16} /> },
  { id: 'builder', label: 'Builder', icon: <Palette size={16} /> },
  { id: 'share', label: 'Share', icon: <Share2 size={16} /> },
];

const LAYOUT_OPTIONS: { value: LayoutType; label: string; cols: number }[] = [
  { value: '2x2', label: '2x2 Grid', cols: 2 },
  { value: '3x3', label: '3x3 Grid', cols: 3 },
  { value: '4x4', label: '4x4 Grid', cols: 4 },
  { value: 'freeform', label: 'Freeform', cols: 3 },
];

// ---- My Showcases Tab ----

const ShowcasesTab: React.FC<{
  cards: CardInventory[];
  onEdit: (_showcase: Showcase) => void;
  onDelete: (_id: string) => void;
  onCreate: () => void;
  onSelect: (_showcase: Showcase) => void;
}> = ({ cards, onEdit, onDelete, onCreate, onSelect }) => {
  const showcases = useMemo(() => getShowcases(), []);
  const cardMap = useMemo(() => new Map(cards.map(c => [c.id, c])), [cards]);

  const handleEditShowcase = useCallback((showcase: Showcase) => onEdit(showcase), [onEdit]);
  const handleDeleteShowcase = useCallback((id: string) => onDelete(id), [onDelete]);
  const handleSelectShowcase = useCallback((showcase: Showcase) => onSelect(showcase), [onSelect]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Your Showcases ({showcases.length})
        </p>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/25 transition-colors"
        >
          <Plus size={14} />
          New Showcase
        </button>
      </div>

      {showcases.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <LayoutGrid size={40} className="mx-auto text-slate-600" />
          <p className="text-sm text-slate-400">No showcases yet</p>
          <p className="text-xs text-slate-500">Create your first display case to show off your collection</p>
        </div>
      )}

      {showcases.map(showcase => {
        const theme = SHOWCASE_THEMES.find(t => t.id === showcase.themeId) ?? SHOWCASE_THEMES[0];
        const analytics = getShowcaseAnalytics(showcase);
        const previewCards = showcase.cards.slice(0, 3).map(sc => cardMap.get(sc.cardId)).filter(Boolean) as CardInventory[];

        return (
          <div
            key={showcase.id}
            className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: theme.background, border: `1px solid ${theme.cardBorder}40` }}
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{showcase.name}</h4>
                  <p className="text-[10px] text-slate-500">
                    {showcase.cards.length} card{showcase.cards.length !== 1 ? 's' : ''} &middot; {theme.name} &middot; {showcase.layout}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditShowcase(showcase)}
                  className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleSelectShowcase(showcase)}
                  className="p-2 hover:bg-slate-700 text-slate-400 hover:text-purple-400 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteShowcase(showcase.id)}
                  className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Mini preview */}
            {previewCards.length > 0 && (
              <div
                className="flex gap-2 p-2 rounded-lg"
                style={{ background: theme.background, border: `1px solid ${theme.cardBorder}30` }}
              >
                {previewCards.map(card => (
                  <div
                    key={card.id}
                    className="flex-1 rounded-md p-1.5 text-center"
                    style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${theme.cardBorder}50` }}
                  >
                    <div className="text-[9px] font-bold truncate" style={{ color: theme.textColor }}>
                      {card.player}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Analytics summary */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Eye size={12} /> {analytics.viewCount} views
              </span>
              <span className="flex items-center gap-1">
                <Heart size={12} /> {analytics.totalReactions} reactions
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Builder Tab ----

const BuilderTab: React.FC<{
  cards: CardInventory[];
  showcase: Showcase | null;
  onShowcaseUpdate: (_showcase: Showcase) => void;
}> = ({ cards, showcase, onShowcaseUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [featuredStoryText, setFeaturedStoryText] = useState('');
  const [showcaseName, setShowcaseName] = useState(showcase?.name ?? 'My Showcase');
  const [selectedTheme, setSelectedTheme] = useState(showcase?.themeId ?? SHOWCASE_THEMES[0].id);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>(showcase?.layout ?? '3x3');

  const theme = useMemo(
    () => SHOWCASE_THEMES.find(t => t.id === selectedTheme) ?? SHOWCASE_THEMES[0],
    [selectedTheme]
  );

  const cardMap = useMemo(() => new Map(cards.map(c => [c.id, c])), [cards]);

  const filteredCards = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return cards;
    return cards.filter(
      c =>
        c.player.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q) ||
        c.year.toString().includes(q)
    );
  }, [cards, searchQuery]);

  const showcaseCardIds = useMemo(
    () => new Set(showcase?.cards.map(c => c.cardId) ?? []),
    [showcase]
  );

  const layoutCols = LAYOUT_OPTIONS.find(l => l.value === selectedLayout)?.cols ?? 3;

  const handleAddCard = useCallback(
    (cardId: string) => {
      if (!showcase) return;
      const nextPos = showcase.cards.length;
      const updated = addCardToShowcase(showcase.id, cardId, nextPos);
      if (updated) onShowcaseUpdate(updated);
    },
    [showcase, onShowcaseUpdate]
  );

  const handleRemoveCard = useCallback(
    (cardId: string) => {
      if (!showcase) return;
      const updated = removeCard(showcase.id, cardId);
      if (updated) onShowcaseUpdate(updated);
    },
    [showcase, onShowcaseUpdate]
  );

  const handleToggleFeatured = useCallback(
    (cardId: string) => {
      if (!showcase) return;
      const existingFeatured = showcase.cards.find(c => c.isFeatured);
      if (existingFeatured?.cardId === cardId) {
        // Unfeature by setting a non-existent id then removing it
        const updated = setFeaturedCard(showcase.id, '__none__');
        if (updated) onShowcaseUpdate(updated);
      } else {
        const updated = setFeaturedCard(showcase.id, cardId, featuredStoryText || undefined);
        if (updated) onShowcaseUpdate(updated);
      }
    },
    [showcase, onShowcaseUpdate, featuredStoryText]
  );

  const handleSaveCaption = useCallback(
    (cardId: string) => {
      if (!showcase) return;
      // Re-add card with caption
      const sc = showcase.cards.find(c => c.cardId === cardId);
      if (!sc) return;
      const updated = addCardToShowcase(showcase.id, cardId, sc.position, captionText || undefined);
      if (updated) onShowcaseUpdate(updated);
      setEditingCaption(null);
      setCaptionText('');
    },
    [showcase, onShowcaseUpdate, captionText]
  );

  const handleThemeChange = useCallback(
    (themeId: string) => {
      setSelectedTheme(themeId);
      if (showcase) {
        const updated = updateShowcase(showcase.id, { themeId });
        if (updated) onShowcaseUpdate(updated);
      }
    },
    [showcase, onShowcaseUpdate]
  );

  const handleLayoutChange = useCallback(
    (layout: LayoutType) => {
      setSelectedLayout(layout);
      if (showcase) {
        const updated = updateShowcase(showcase.id, { layout });
        if (updated) onShowcaseUpdate(updated);
      }
    },
    [showcase, onShowcaseUpdate]
  );

  const handleNameChange = useCallback(
    (name: string) => {
      setShowcaseName(name);
      if (showcase) {
        updateShowcase(showcase.id, { name });
      }
    },
    [showcase]
  );

  if (!showcase) {
    return (
      <div className="text-center py-12 space-y-3">
        <Palette size={40} className="mx-auto text-slate-600" />
        <p className="text-sm text-slate-400">Select or create a showcase to start building</p>
      </div>
    );
  }

  const featuredCard = showcase.cards.find(c => c.isFeatured);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Panel: Controls */}
      <div className="lg:col-span-2 space-y-4">
        {/* Name */}
        <div>
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block mb-1.5">
            Showcase Name
          </label>
          <input
            type="text"
            value={showcaseName}
            onChange={e => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            placeholder="My Showcase"
          />
        </div>

        {/* Theme Picker */}
        <div>
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block mb-1.5">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SHOWCASE_THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  selectedTheme === t.id
                    ? 'border-purple-500 ring-1 ring-purple-500/30'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div
                  className="w-full h-6 rounded-lg mb-1"
                  style={{ background: t.background }}
                />
                <span className="text-[10px] text-slate-400">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Layout Picker */}
        <div>
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block mb-1.5">
            Layout
          </label>
          <div className="grid grid-cols-4 gap-2">
            {LAYOUT_OPTIONS.map(l => (
              <button
                key={l.value}
                onClick={() => handleLayoutChange(l.value)}
                className={`px-2 py-2 rounded-xl border text-xs font-bold transition-all ${
                  selectedLayout === l.value
                    ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Picker */}
        <div>
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block mb-1.5">
            Add Cards
          </label>
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              placeholder="Search cards..."
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 no-scrollbar">
            {filteredCards.map(card => {
              const inShowcase = showcaseCardIds.has(card.id);
              return (
                <div
                  key={card.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                    inShowcase
                      ? 'bg-purple-500/10 border border-purple-500/25'
                      : 'bg-slate-800/50 border border-transparent hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white truncate block">{card.player}</span>
                    <span className="text-slate-500 truncate block">
                      {card.year} {card.set}
                      {card.isGraded && card.grade ? ` - ${card.gradingCompany ?? ''} ${card.grade}` : ''}
                    </span>
                  </div>
                  <span className="text-slate-400 flex-shrink-0">
                    ${(card.currentValue ?? card.purchasePrice).toLocaleString()}
                  </span>
                  <button
                    onClick={() => (inShowcase ? handleRemoveCard(card.id) : handleAddCard(card.id))}
                    className={`p-1 rounded-md transition-colors flex-shrink-0 ${
                      inShowcase
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-purple-400 hover:bg-purple-500/10'
                    }`}
                  >
                    {inShowcase ? <Trash2 size={14} /> : <Plus size={14} />}
                  </button>
                </div>
              );
            })}
            {filteredCards.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No cards found</p>
            )}
          </div>
        </div>

        {/* Featured Story */}
        {featuredCard && (
          <div>
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block mb-1.5">
              Featured Card Story
            </label>
            <textarea
              value={featuredStoryText}
              onChange={e => setFeaturedStoryText(e.target.value)}
              onBlur={() => {
                if (featuredCard && featuredStoryText) {
                  const updated = setFeaturedCard(showcase.id, featuredCard.cardId, featuredStoryText);
                  if (updated) onShowcaseUpdate(updated);
                }
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-none h-20"
              placeholder="Tell the story behind your featured card..."
            />
          </div>
        )}
      </div>

      {/* Right Panel: Live Preview */}
      <div className="lg:col-span-3">
        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block mb-1.5">
          Preview
        </label>
        <div
          className="rounded-2xl p-5 min-h-[300px] border"
          style={{
            background: theme.background,
            borderColor: theme.cardBorder + '40',
          }}
        >
          <h3
            className="text-lg font-bold mb-4 text-center"
            style={{ color: theme.textColor }}
          >
            {showcaseName}
          </h3>

          {/* Featured card */}
          {featuredCard && (() => {
            const card = cardMap.get(featuredCard.cardId);
            if (!card) return null;
            const grade = card.isGraded && card.grade ? `${card.gradingCompany ?? ''} ${card.grade}` : 'Raw';
            return (
              <div
                className="rounded-xl p-4 mb-4 text-center relative"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  border: `2px solid ${theme.cardBorder}`,
                }}
              >
                <Star
                  size={16}
                  className="absolute top-3 right-3 cursor-pointer"
                  style={{ color: theme.accentColor }}
                  fill={theme.accentColor}
                  onClick={() => handleToggleFeatured(featuredCard.cardId)}
                />
                <div className="text-lg font-bold" style={{ color: theme.textColor }}>{card.player}</div>
                <div className="text-xs mt-1" style={{ color: theme.accentColor }}>
                  {card.year} {card.set}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: theme.cardBorder, color: '#000' }}
                  >
                    {grade}
                  </span>
                  <span className="text-sm font-bold" style={{ color: theme.textColor }}>
                    ${(card.currentValue ?? card.purchasePrice).toLocaleString()}
                  </span>
                </div>
                {featuredCard.caption && (
                  <p className="text-[10px] mt-2 italic" style={{ color: theme.accentColor }}>
                    {featuredCard.caption}
                  </p>
                )}
                {featuredCard.featuredStory && (
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: theme.accentColor }}>
                    {featuredCard.featuredStory}
                  </p>
                )}
                {/* Reactions */}
                {featuredCard.reactions.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {featuredCard.reactions.map(r => (
                      <span key={r.type} className="text-[10px]" style={{ color: theme.accentColor }}>
                        {REACTION_EMOJIS[r.type]} {r.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Card Grid */}
          <div
            className="gap-3"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${layoutCols}, 1fr)`,
            }}
          >
            {showcase.cards
              .filter(c => !c.isFeatured)
              .map(sc => {
                const card = cardMap.get(sc.cardId);
                if (!card) return null;
                const grade = card.isGraded && card.grade ? `${card.gradingCompany ?? ''} ${card.grade}` : 'Raw';
                return (
                  <div
                    key={sc.cardId}
                    className="rounded-xl p-3 relative group/card"
                    style={{
                      background: 'rgba(0,0,0,0.35)',
                      border: `1px solid ${theme.cardBorder}80`,
                    }}
                  >
                    {/* Action buttons */}
                    <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleFeatured(sc.cardId)}
                        className="p-1 rounded hover:bg-white/10"
                        title="Set as featured"
                      >
                        <Star size={10} style={{ color: theme.accentColor }} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCaption(sc.cardId);
                          setCaptionText(sc.caption ?? '');
                        }}
                        className="p-1 rounded hover:bg-white/10"
                        title="Edit caption"
                      >
                        <Edit3 size={10} style={{ color: theme.accentColor }} />
                      </button>
                      <button
                        onClick={() => handleRemoveCard(sc.cardId)}
                        className="p-1 rounded hover:bg-white/10"
                        title="Remove"
                      >
                        <Trash2 size={10} style={{ color: '#f87171' }} />
                      </button>
                    </div>

                    <div className="text-xs font-bold truncate" style={{ color: theme.textColor }}>
                      {card.player}
                    </div>
                    <div className="text-[10px] mt-0.5 truncate" style={{ color: theme.accentColor }}>
                      {card.year} {card.set}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: theme.cardBorder, color: '#000' }}
                      >
                        {grade}
                      </span>
                      <span className="text-[10px] font-bold" style={{ color: theme.textColor }}>
                        ${(card.currentValue ?? card.purchasePrice).toLocaleString()}
                      </span>
                    </div>

                    {/* Caption */}
                    {editingCaption === sc.cardId ? (
                      <div className="mt-1.5 flex gap-1">
                        <input
                          type="text"
                          value={captionText}
                          onChange={e => setCaptionText(e.target.value)}
                          className="flex-1 px-1.5 py-0.5 bg-black/30 border border-white/20 rounded text-[10px] text-white focus:outline-none"
                          placeholder="Caption..."
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveCaption(sc.cardId);
                            if (e.key === 'Escape') setEditingCaption(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveCaption(sc.cardId)}
                          className="p-0.5 rounded hover:bg-white/10"
                        >
                          <CheckCircle2 size={12} style={{ color: theme.accentColor }} />
                        </button>
                      </div>
                    ) : (
                      sc.caption && (
                        <p className="text-[9px] mt-1 italic truncate" style={{ color: theme.accentColor }}>
                          {sc.caption}
                        </p>
                      )
                    )}

                    {/* Reactions */}
                    {sc.reactions.length > 0 && (
                      <div className="flex gap-1.5 mt-1">
                        {sc.reactions.map(r => (
                          <span key={r.type} className="text-[9px]" style={{ color: theme.accentColor }}>
                            {REACTION_EMOJIS[r.type]} {r.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {showcase.cards.length === 0 && (
            <div className="text-center py-12" style={{ color: theme.accentColor }}>
              <LayoutGrid size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm opacity-60">Add cards from the picker to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---- Share Tab ----

const ShareTab: React.FC<{
  showcase: Showcase | null;
  cards: CardInventory[];
}> = ({ showcase, cards }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(
    () => (showcase ? generateShareUrl(showcase) : ''),
    [showcase]
  );

  const analytics = useMemo(
    () => (showcase ? getShowcaseAnalytics(showcase) : null),
    [showcase]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback
    });
  }, [shareUrl]);

  const handleExportHTML = useCallback(() => {
    if (!showcase) return;
    const html = exportShowcaseHTML(showcase, cards);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${showcase.name.replace(/[^a-zA-Z0-9]/g, '_')}_showcase.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [showcase, cards]);

  if (!showcase) {
    return (
      <div className="text-center py-12 space-y-3">
        <Share2 size={40} className="mx-auto text-slate-600" />
        <p className="text-sm text-slate-400">Select a showcase to view sharing options</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Share URL */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Share URL
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white font-mono truncate">
            {shareUrl}
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              copied
                ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                : 'bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25'
            }`}
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Analytics
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl text-center">
              <Eye size={16} className="mx-auto text-blue-400 mb-1" />
              <p className="text-lg font-bebas tracking-wider text-white">{analytics.viewCount.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">Views</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl text-center">
              <Heart size={16} className="mx-auto text-red-400 mb-1" />
              <p className="text-lg font-bebas tracking-wider text-white">{analytics.totalReactions.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">Reactions</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl text-center">
              <Share2 size={16} className="mx-auto text-purple-400 mb-1" />
              <p className="text-lg font-bebas tracking-wider text-white">{analytics.shareClicks.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">Share Clicks</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl text-center">
              <LayoutGrid size={16} className="mx-auto text-green-400 mb-1" />
              <p className="text-lg font-bebas tracking-wider text-white">{showcase.cards.length}</p>
              <p className="text-[10px] text-slate-500">Cards</p>
            </div>
          </div>
          {analytics.mostViewedCardId && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-xl">
              <Star size={12} className="text-amber-400" />
              <span className="text-xs text-slate-400">Most Viewed Card:</span>
              <span className="text-xs text-white font-bold">
                {(() => {
                  const card = cards.find(c => c.id === analytics.mostViewedCardId);
                  return card ? card.player : 'Unknown';
                })()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Export */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Export
        </p>
        <p className="text-xs text-slate-400">
          Download a self-contained HTML file you can share anywhere or host on your own site.
        </p>
        <button
          onClick={handleExportHTML}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/25 transition-colors"
        >
          <Download size={14} />
          Export as HTML
        </button>
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const ShowcaseModal: React.FC<ShowcaseModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('showcases');
  const [activeShowcase, setActiveShowcase] = useState<Showcase | null>(null);
  const [, setRefreshKey] = useState(0);

  const forceRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const handleCreate = useCallback(() => {
    const showcase = createShowcase('New Showcase', SHOWCASE_THEMES[0].id, '3x3');
    setActiveShowcase(showcase);
    setActiveTab('builder');
    forceRefresh();
  }, [forceRefresh]);

  const handleEdit = useCallback((showcase: Showcase) => {
    setActiveShowcase(showcase);
    setActiveTab('builder');
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteShowcase(id);
    if (activeShowcase?.id === id) setActiveShowcase(null);
    forceRefresh();
  }, [activeShowcase, forceRefresh]);

  const handleSelectForShare = useCallback((showcase: Showcase) => {
    setActiveShowcase(showcase);
    setActiveTab('share');
  }, []);

  const handleShowcaseUpdate = useCallback((showcase: Showcase) => {
    setActiveShowcase(showcase);
    forceRefresh();
  }, [forceRefresh]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-purple-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/30">
              <LayoutGrid size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Palette size={10} />
                  Display Builder
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Digital <span className="text-purple-400">Showcase</span> Builder
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

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-purple-400 border-purple-400 bg-purple-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'showcases' && (
            <ShowcasesTab
              cards={cards}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
              onSelect={handleSelectForShare}
            />
          )}
          {activeTab === 'builder' && (
            <BuilderTab
              cards={cards}
              showcase={activeShowcase}
              onShowcaseUpdate={handleShowcaseUpdate}
            />
          )}
          {activeTab === 'share' && (
            <ShareTab
              showcase={activeShowcase}
              cards={cards}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowcaseModal;
