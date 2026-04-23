// @ts-nocheck
import { CardInventory } from '../../types';
import { store } from '../dal/syncStore';

// ---- Types ----

export type LayoutType = '2x2' | '3x3' | '4x4' | 'freeform';
export type ReactionType = 'fire' | 'thumbs_up' | 'heart' | 'mind_blown';

export interface ShowcaseTheme {
  id: string;
  name: string;
  background: string;
  cardBorder: string;
  textColor: string;
  accentColor: string;
}

export interface ShowcaseReaction {
  cardId: string;
  type: ReactionType;
  count: number;
}

export interface ShowcaseCard {
  cardId: string;
  position: number;
  caption?: string;
  isFeatured: boolean;
  featuredStory?: string;
  reactions: ShowcaseReaction[];
}

export interface ShowcaseAnalytics {
  viewCount: number;
  totalReactions: number;
  mostViewedCardId: string | null;
  lastViewedAt: string;
  shareClicks: number;
}

export interface Showcase {
  id: string;
  name: string;
  themeId: string;
  layout: LayoutType;
  cards: ShowcaseCard[];
  createdAt: string;
  updatedAt: string;
  analytics: ShowcaseAnalytics;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_showcases';

export const SHOWCASE_THEMES: ShowcaseTheme[] = [
  {
    id: 'trophy_room',
    name: 'Trophy Room',
    background: 'linear-gradient(135deg, #3e2723 0%, #4e342e 50%, #5d4037 100%)',
    cardBorder: '#8d6e63',
    textColor: '#efebe9',
    accentColor: '#d7ccc8',
  },
  {
    id: 'vault',
    name: 'Vault',
    background: 'linear-gradient(135deg, #37474f 0%, #455a64 50%, #546e7a 100%)',
    cardBorder: '#90a4ae',
    textColor: '#eceff1',
    accentColor: '#b0bec5',
  },
  {
    id: 'neon',
    name: 'Neon',
    background: 'linear-gradient(135deg, #1a0033 0%, #2d004d 50%, #0d1b2a 100%)',
    cardBorder: '#00e5ff',
    textColor: '#e0f7fa',
    accentColor: '#ce93d8',
  },
  {
    id: 'classic',
    name: 'Classic',
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
    cardBorder: '#a5d6a7',
    textColor: '#e8f5e9',
    accentColor: '#c8e6c9',
  },
  {
    id: 'ice',
    name: 'Ice',
    background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
    cardBorder: '#90caf9',
    textColor: '#e3f2fd',
    accentColor: '#bbdefb',
  },
  {
    id: 'fire',
    name: 'Fire',
    background: 'linear-gradient(135deg, #b71c1c 0%, #d84315 50%, #e65100 100%)',
    cardBorder: '#ff8a65',
    textColor: '#fbe9e7',
    accentColor: '#ffccbc',
  },
];

const REACTION_EMOJIS: Record<ReactionType, string> = {
  fire: '\uD83D\uDD25',
  thumbs_up: '\uD83D\uDC4D',
  heart: '\u2764\uFE0F',
  mind_blown: '\uD83E\uDD2F',
};

export { REACTION_EMOJIS };

// ---- Deterministic helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function generateId(): string {
  return `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---- localStorage helpers ----

function loadShowcases(): Showcase[] {
  return store.get<Showcase[]>(STORAGE_KEY, []);
}

function saveShowcases(showcases: Showcase[]): void {
  store.set(STORAGE_KEY, showcases);
}

// ---- CRUD ----

export function createShowcase(name: string, themeId: string, layout: LayoutType): Showcase {
  const now = new Date().toISOString();
  const showcase: Showcase = {
    id: generateId(),
    name,
    themeId,
    layout,
    cards: [],
    createdAt: now,
    updatedAt: now,
    analytics: {
      viewCount: 0,
      totalReactions: 0,
      mostViewedCardId: null,
      lastViewedAt: now,
      shareClicks: 0,
    },
  };

  const showcases = loadShowcases();
  showcases.push(showcase);
  saveShowcases(showcases);
  return showcase;
}

export function updateShowcase(id: string, updates: Partial<Pick<Showcase, 'name' | 'themeId' | 'layout'>>): Showcase | null {
  const showcases = loadShowcases();
  const idx = showcases.findIndex(s => s.id === id);
  if (idx < 0) return null;

  showcases[idx] = {
    ...showcases[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveShowcases(showcases);
  return showcases[idx];
}

export function deleteShowcase(id: string): boolean {
  const showcases = loadShowcases();
  const filtered = showcases.filter(s => s.id !== id);
  if (filtered.length === showcases.length) return false;
  saveShowcases(filtered);
  return true;
}

export function getShowcases(): Showcase[] {
  return loadShowcases();
}

export function getShowcase(id: string): Showcase | null {
  const showcases = loadShowcases();
  return showcases.find(s => s.id === id) ?? null;
}

// ---- Card management ----

export function addCardToShowcase(
  showcaseId: string,
  cardId: string,
  position: number,
  caption?: string
): Showcase | null {
  const showcases = loadShowcases();
  const idx = showcases.findIndex(s => s.id === showcaseId);
  if (idx < 0) return null;

  // Remove if already present
  showcases[idx].cards = showcases[idx].cards.filter(c => c.cardId !== cardId);

  showcases[idx].cards.push({
    cardId,
    position,
    caption,
    isFeatured: false,
    reactions: [],
  });

  showcases[idx].updatedAt = new Date().toISOString();
  saveShowcases(showcases);
  return showcases[idx];
}

export function removeCard(showcaseId: string, cardId: string): Showcase | null {
  const showcases = loadShowcases();
  const idx = showcases.findIndex(s => s.id === showcaseId);
  if (idx < 0) return null;

  showcases[idx].cards = showcases[idx].cards.filter(c => c.cardId !== cardId);
  showcases[idx].updatedAt = new Date().toISOString();
  saveShowcases(showcases);
  return showcases[idx];
}

export function setFeaturedCard(
  showcaseId: string,
  cardId: string,
  story?: string
): Showcase | null {
  const showcases = loadShowcases();
  const idx = showcases.findIndex(s => s.id === showcaseId);
  if (idx < 0) return null;

  // Unflag all, then flag target
  showcases[idx].cards.forEach(c => {
    c.isFeatured = false;
    c.featuredStory = undefined;
  });

  const cardIdx = showcases[idx].cards.findIndex(c => c.cardId === cardId);
  if (cardIdx >= 0) {
    showcases[idx].cards[cardIdx].isFeatured = true;
    showcases[idx].cards[cardIdx].featuredStory = story;
  }

  showcases[idx].updatedAt = new Date().toISOString();
  saveShowcases(showcases);
  return showcases[idx];
}

// ---- Sharing ----

export function generateShareUrl(showcase: Showcase): string {
  // Deterministic shareable ID based on showcase id
  let hash = 0;
  for (let i = 0; i < showcase.id.length; i++) {
    const chr = showcase.id.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  const shareId = Math.abs(hash).toString(36).padStart(8, '0');
  return `https://msi.cards/showcase/${shareId}`;
}

// ---- Reactions ----

export function addReaction(
  showcaseId: string,
  cardId: string,
  reactionType: ReactionType
): Showcase | null {
  const showcases = loadShowcases();
  const idx = showcases.findIndex(s => s.id === showcaseId);
  if (idx < 0) return null;

  const cardIdx = showcases[idx].cards.findIndex(c => c.cardId === cardId);
  if (cardIdx < 0) return null;

  const card = showcases[idx].cards[cardIdx];
  const reactionIdx = card.reactions.findIndex(r => r.type === reactionType);

  if (reactionIdx >= 0) {
    card.reactions[reactionIdx].count += 1;
  } else {
    card.reactions.push({ cardId, type: reactionType, count: 1 });
  }

  showcases[idx].analytics.totalReactions += 1;
  showcases[idx].updatedAt = new Date().toISOString();
  saveShowcases(showcases);
  return showcases[idx];
}

// ---- Analytics ----

export function getShowcaseAnalytics(showcase: Showcase): ShowcaseAnalytics {
  // Simulated analytics using deterministic seed from showcase id
  let seed = 0;
  for (let i = 0; i < showcase.id.length; i++) {
    seed = ((seed << 5) - seed) + showcase.id.charCodeAt(i);
    seed |= 0;
  }
  seed = Math.abs(seed);

  const daysSinceCreation = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(showcase.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const baseViews = Math.round(seededRandom(seed, 1) * 200 + daysSinceCreation * 5);
  const storedReactions = showcase.cards.reduce(
    (sum, c) => sum + c.reactions.reduce((s, r) => s + r.count, 0),
    0
  );
  const simulatedReactions = Math.round(baseViews * seededRandom(seed, 2) * 0.3) + storedReactions;

  // Pick most-viewed card
  let mostViewedCardId: string | null = null;
  if (showcase.cards.length > 0) {
    const featured = showcase.cards.find(c => c.isFeatured);
    if (featured) {
      mostViewedCardId = featured.cardId;
    } else {
      const pickIdx = Math.floor(seededRandom(seed, 3) * showcase.cards.length);
      mostViewedCardId = showcase.cards[pickIdx].cardId;
    }
  }

  return {
    viewCount: baseViews,
    totalReactions: simulatedReactions,
    mostViewedCardId,
    lastViewedAt: showcase.updatedAt,
    shareClicks: Math.round(baseViews * seededRandom(seed, 4) * 0.15),
  };
}

// ---- Export HTML ----

export function exportShowcaseHTML(showcase: Showcase, cards: CardInventory[]): string {
  const theme = SHOWCASE_THEMES.find(t => t.id === showcase.themeId) ?? SHOWCASE_THEMES[0];
  const layoutCols =
    showcase.layout === '2x2' ? 2 :
    showcase.layout === '3x3' ? 3 :
    showcase.layout === '4x4' ? 4 : 3;

  const cardMap = new Map(cards.map(c => [c.id, c]));

  const featuredCard = showcase.cards.find(c => c.isFeatured);
  const regularCards = showcase.cards.filter(c => !c.isFeatured);

  function renderCard(sc: ShowcaseCard, isFeatured: boolean): string {
    const card = cardMap.get(sc.cardId);
    if (!card) return '';
    const value = card.currentValue ?? card.purchasePrice;
    const grade = card.isGraded && card.grade ? `${card.gradingCompany ?? ''} ${card.grade}` : 'Raw';
    const reactionsHtml = sc.reactions.length > 0
      ? `<div style="display:flex;gap:8px;margin-top:6px;font-size:12px;">${sc.reactions.map(r => `<span>${REACTION_EMOJIS[r.type]} ${r.count}</span>`).join('')}</div>`
      : '';
    const captionHtml = sc.caption ? `<p style="font-size:11px;color:${theme.accentColor};margin-top:4px;font-style:italic;">${sc.caption}</p>` : '';
    const storyHtml = isFeatured && sc.featuredStory
      ? `<p style="font-size:12px;color:${theme.accentColor};margin-top:6px;line-height:1.4;">${sc.featuredStory}</p>`
      : '';

    return `<div style="background:rgba(0,0,0,0.35);border:2px solid ${theme.cardBorder};border-radius:12px;padding:${isFeatured ? '20px' : '14px'};${isFeatured ? 'grid-column:1/-1;text-align:center;' : ''}">
      <div style="font-size:${isFeatured ? '20px' : '15px'};font-weight:bold;color:${theme.textColor};">${card.player}</div>
      <div style="font-size:12px;color:${theme.accentColor};margin-top:2px;">${card.year} ${card.set}</div>
      <div style="display:flex;gap:8px;margin-top:6px;align-items:center;${isFeatured ? 'justify-content:center;' : ''}">
        <span style="background:${theme.cardBorder};color:#000;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:bold;">${grade}</span>
        <span style="color:${theme.textColor};font-size:13px;font-weight:bold;">$${value.toLocaleString()}</span>
      </div>
      ${captionHtml}
      ${storyHtml}
      ${reactionsHtml}
    </div>`;
  }

  const featuredHtml = featuredCard ? renderCard(featuredCard, true) : '';
  const gridHtml = regularCards.map(c => renderCard(c, false)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${showcase.name} - MSI Showcase</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:800px;margin:0 auto;padding:32px 20px;">
  <h1 style="text-align:center;color:${theme.textColor};font-size:28px;margin-bottom:4px;">${showcase.name}</h1>
  <p style="text-align:center;color:${theme.accentColor};font-size:13px;margin-bottom:24px;">
    ${showcase.cards.length} card${showcase.cards.length !== 1 ? 's' : ''} &middot; ${SHOWCASE_THEMES.find(t => t.id === showcase.themeId)?.name ?? ''} Theme
  </p>
  <div style="background:${theme.background};border-radius:20px;padding:24px;">
    ${featuredHtml}
    <div style="display:grid;grid-template-columns:repeat(${layoutCols}, 1fr);gap:14px;${featuredHtml ? 'margin-top:14px;' : ''}">
      ${gridHtml}
    </div>
  </div>
  <p style="text-align:center;color:#64748b;font-size:11px;margin-top:20px;">
    Built with Modern Sports Intelligence
  </p>
</div>
</body>
</html>`;
}
