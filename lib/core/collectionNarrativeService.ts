// @ts-nocheck
// ---- Types ----

import type { CardInventory } from '../../types';
import { store } from '../dal/syncStore';

export interface MomentLink {
  cardId: string;
  cardLabel: string;
  year: number;
  player: string;
  momentDate: string;
  momentTitle: string;
  momentDescription: string;
  significance: 'iconic' | 'major' | 'notable';
  imageUrl?: string;
}

export interface CollectionTheme {
  id: string;
  label: string;
  description: string;
  percentage: number; // 0-100 — share of collection matching this theme
  matchingCardIds: string[];
  insight: string; // AI-generated insight about the pattern
}

export interface ThemeAnalysis {
  themes: CollectionTheme[];
  primaryTheme: CollectionTheme;
  collectorPersona: string;
  narrativeSummary: string;
  unconsciousPatterns: string[];
}

export interface ExhibitionSection {
  id: string;
  title: string;
  subtitle: string;
  curatorialNote: string;
  cardIds: string[];
  order: number;
  accentColor: string;
}

export interface HeritageStory {
  title: string;
  subtitle: string;
  openingParagraph: string;
  chapters: {
    heading: string;
    body: string;
    cardIds: string[];
  }[];
  closingReflection: string;
  generatedAt: string;
}

export interface NarrativeExport {
  format: 'pdf' | 'social' | 'web';
  url: string;
  generatedAt: string;
  previewHtml: string;
}

export interface LegacyMemo {
  id: string;
  cardId: string;
  cardLabel: string;
  text: string;
  type: 'text' | 'voice';
  createdAt: string;
}

export interface CollectionNarrative {
  significanceScore: number; // 0-100
  primaryTheme: string;
  storyPreview: string;
  totalMomentLinks: number;
  totalMemos: number;
  heritageStory: HeritageStory;
  themeAnalysis: ThemeAnalysis;
  momentLinks: MomentLink[];
  exhibitionSections: ExhibitionSection[];
}

// ---- Storage Keys ----

const NARRATIVE_KEY = 'msi_collection_narrative';
const MEMOS_KEY = 'msi_legacy_memos';
const SIGNIFICANCE_KEY = 'msi_significance_score';

// ---- Mock Moment Links ----

const MOCK_MOMENT_LINKS: MomentLink[] = [
  {
    cardId: 'card-1',
    cardLabel: '1986 Fleer Michael Jordan #57 RC',
    year: 1986,
    player: 'Michael Jordan',
    momentDate: '1986-04-20',
    momentTitle: '63-Point Playoff Explosion',
    momentDescription:
      'Jordan scored 63 points against the Boston Celtics in Game 2 of the first round, a playoff record that still stands. Larry Bird famously said, "God disguised as Michael Jordan."',
    significance: 'iconic',
  },
  {
    cardId: 'card-2',
    cardLabel: '1989 Upper Deck Ken Griffey Jr. #1 RC',
    year: 1989,
    player: 'Ken Griffey Jr.',
    momentDate: '1990-04-10',
    momentTitle: 'The Sweetest Swing Debuts',
    momentDescription:
      'Griffey\'s rookie season marked the arrival of a generational talent. His backwards cap and effortless swing redefined what a baseball star could look like, launching the Upper Deck brand into dominance.',
    significance: 'iconic',
  },
  {
    cardId: 'card-3',
    cardLabel: '2003-04 Topps Chrome LeBron James #111 RC',
    year: 2003,
    player: 'LeBron James',
    momentDate: '2003-10-29',
    momentTitle: 'The Chosen One Arrives',
    momentDescription:
      'LeBron\'s NBA debut against Sacramento — 25 points, 9 assists, 6 rebounds, 4 steals. The most hyped prospect since Jordan immediately validated every expectation.',
    significance: 'iconic',
  },
  {
    cardId: 'card-4',
    cardLabel: '1952 Topps Mickey Mantle #311',
    year: 1952,
    player: 'Mickey Mantle',
    momentDate: '1953-04-17',
    momentTitle: 'The 565-Foot Blast',
    momentDescription:
      'Mantle hit a tape-measure home run at Griffith Stadium — measured at 565 feet. This moment cemented the mythology of Mantle\'s raw power and made his 1952 Topps the holy grail of baseball cards.',
    significance: 'iconic',
  },
  {
    cardId: 'card-5',
    cardLabel: '2018 Panini Prizm Luka Doncic #280 RC',
    year: 2018,
    player: 'Luka Doncic',
    momentDate: '2019-01-27',
    momentTitle: 'Euro Wunderkind Goes 35-11-6',
    momentDescription:
      'Doncic posted a triple-double-caliber line against the Raptors in his rookie year, showcasing the court vision and scoring that made him the fastest European player to reach All-Star status.',
    significance: 'major',
  },
  {
    cardId: 'card-6',
    cardLabel: '1993 SP Derek Jeter #279 RC',
    year: 1993,
    player: 'Derek Jeter',
    momentDate: '2001-10-31',
    momentTitle: 'The Flip Play',
    momentDescription:
      'In Game 3 of the 2001 ALDS, Jeter sprinted across the diamond to relay an errant throw and tag Jeremy Giambi at home plate. The play defined Jeter\'s "Mr. November" persona.',
    significance: 'iconic',
  },
  {
    cardId: 'card-7',
    cardLabel: '2017 Panini National Treasures Patrick Mahomes #161 RC Auto',
    year: 2017,
    player: 'Patrick Mahomes',
    momentDate: '2020-02-02',
    momentTitle: 'Super Bowl LIV Comeback',
    momentDescription:
      'Mahomes led the Chiefs from a 10-20 deficit to win Super Bowl LIV 31-20, earning MVP honors. The first Chiefs Super Bowl win in 50 years catalyzed a modern-card market boom.',
    significance: 'iconic',
  },
  {
    cardId: 'card-8',
    cardLabel: '2009 Bowman Chrome Mike Trout #BDPP61 RC',
    year: 2009,
    player: 'Mike Trout',
    momentDate: '2012-08-21',
    momentTitle: 'The Millville Meteor\'s Rookie Campaign',
    momentDescription:
      'By August 2012, Trout had 27 HR, 44 SB, and a .965 OPS — one of the greatest rookie seasons in MLB history. His 2009 Bowman Chrome became the flagship modern baseball card.',
    significance: 'iconic',
  },
  {
    cardId: 'card-9',
    cardLabel: '1996-97 Topps Chrome Kobe Bryant #138 RC',
    year: 1996,
    player: 'Kobe Bryant',
    momentDate: '2006-01-22',
    momentTitle: '81 Points Against the Raptors',
    momentDescription:
      'Kobe\'s 81-point game is the second-highest single-game total in NBA history. This transcendent performance cemented Bryant\'s legacy and drove collector demand for his rookie cards to all-time highs.',
    significance: 'iconic',
  },
  {
    cardId: 'card-10',
    cardLabel: '2020 Panini Prizm Justin Herbert #325 RC',
    year: 2020,
    player: 'Justin Herbert',
    momentDate: '2020-10-25',
    momentTitle: 'Rookie TD Record Falls',
    momentDescription:
      'Herbert set the NFL rookie record for touchdown passes in a season with 31, surpassing Baker Mayfield and Russell Wilson. His Prizm RC became one of the most traded modern football cards.',
    significance: 'major',
  },
];

// ---- Mock Themes ----

const MOCK_THEMES: CollectionTheme[] = [
  {
    id: 'theme-1',
    label: 'Defensive Greatness',
    description: 'Cards of players known for elite defensive play',
    percentage: 73,
    matchingCardIds: ['card-1', 'card-6', 'card-9'],
    insight:
      '73% of your vintage picks were All-Defense selections — you gravitate toward undervalued defensive players who defined their eras through grit rather than highlight reels.',
  },
  {
    id: 'theme-2',
    label: 'Franchise Cornerstones',
    description: 'Players who spent 10+ years with one franchise',
    percentage: 64,
    matchingCardIds: ['card-2', 'card-4', 'card-6', 'card-8'],
    insight:
      'You instinctively collect franchise loyalists — players who became synonymous with a city. Jeter/Yankees, Griffey/Mariners, Mantle/Yankees, Trout/Angels. Loyalty resonates in your collecting DNA.',
  },
  {
    id: 'theme-3',
    label: 'Cultural Crossover Icons',
    description: 'Athletes who transcended their sport into pop culture',
    percentage: 58,
    matchingCardIds: ['card-1', 'card-2', 'card-9'],
    insight:
      'More than half your collection features athletes who reshaped culture beyond the field — Jordan, Griffey, and Kobe didn\'t just play sports, they changed fashion, advertising, and youth culture.',
  },
  {
    id: 'theme-4',
    label: 'Modern QB Revolution',
    description: 'Next-generation quarterbacks reshaping the game',
    percentage: 22,
    matchingCardIds: ['card-7', 'card-10'],
    insight:
      'Your football holdings lean toward the new wave of mobile, strong-armed QBs. Mahomes and Herbert represent a stylistic shift — you\'re betting on the future of the position.',
  },
  {
    id: 'theme-5',
    label: 'Rookie Card Purist',
    description: 'Emphasis on flagship rookie cards over parallels and inserts',
    percentage: 90,
    matchingCardIds: ['card-1', 'card-2', 'card-3', 'card-5', 'card-7', 'card-8', 'card-9', 'card-10'],
    insight:
      '90% of your collection consists of flagship rookie cards rather than parallels, inserts, or numbered variants. You believe in the canonical card — the one that will be remembered in 50 years.',
  },
];

// ---- Mock Exhibition Sections ----

const MOCK_EXHIBITION_SECTIONS: ExhibitionSection[] = [
  {
    id: 'section-1',
    title: 'The Foundations',
    subtitle: 'Pre-2000 Icons That Defined Collecting',
    curatorialNote:
      'This section opens with the pillars — the cards that existed before "the hobby" became "the market." Each piece here represents a moment when cardboard transcended commerce and became cultural artifact. The 1952 Mantle and 1986 Jordan are not merely collectibles; they are monuments.',
    cardIds: ['card-1', 'card-4', 'card-6', 'card-9'],
    order: 1,
    accentColor: '#c9a84c',
  },
  {
    id: 'section-2',
    title: 'The New Titans',
    subtitle: 'Modern Rookie Cards Reshaping Values',
    curatorialNote:
      'The modern era brought chromium finishes, numbered parallels, and global access. Yet the collector behind this exhibition chose restraint — flagship rookies, not chased parallels. LeBron, Luka, Trout, and Herbert represent a curated bet on longevity over hype.',
    cardIds: ['card-3', 'card-5', 'card-8', 'card-10'],
    order: 2,
    accentColor: '#22d3ee',
  },
  {
    id: 'section-3',
    title: 'The Crossroads',
    subtitle: 'Where Sport Meets Culture',
    curatorialNote:
      'Some athletes change more than their sport. Griffey redefined what a baseball star looked like. Jordan created a sneaker empire. Mahomes revived a dormant Kansas City. This section explores the cards that sit at the intersection of athletic achievement and cultural transformation.',
    cardIds: ['card-2', 'card-1', 'card-7'],
    order: 3,
    accentColor: '#a78bfa',
  },
];

// ---- Mock Heritage Story ----

const MOCK_HERITAGE_STORY: HeritageStory = {
  title: 'A Story Written in Cardboard',
  subtitle: 'The Narrative Arc of a Collector Who Values Legacy Over Hype',
  openingParagraph:
    'Every collection tells a story, even when the collector doesn\'t realize they\'re writing one. Across 10 carefully chosen cards spanning four decades and three sports, a clear philosophy emerges: this is a collector who values the canonical moment, the defining rookie card, the player who meant something beyond statistics. There are no chase parallels here, no /25 numbered inserts bought for scarcity alone. Instead, there is a thesis — that the greatest cards are the ones that capture a turning point in sports history.',
  chapters: [
    {
      heading: 'Chapter 1: The Foundation Years',
      body: 'The collection begins, as all serious collections must, with the pillars. The 1952 Topps Mickey Mantle — not a high-grade specimen, but an authentic piece of the card that started it all. The 1986 Fleer Jordan, acquired before the speculative boom of 2020 reshaped its price forever. These are not investments; they are declarations of intent. The collector who starts here is saying: "I understand where this hobby came from."',
      cardIds: ['card-4', 'card-1'],
    },
    {
      heading: 'Chapter 2: The Golden Bridge',
      body: 'The 1989 Upper Deck Griffey and 1993 SP Jeter represent the bridge between vintage and modern. Upper Deck\'s arrival changed everything — photography replaced illustration, foil replaced flat stock, and suddenly cards felt like luxury goods. Griffey and Jeter were the perfect ambassadors for this transition: iconic players on iconic products that elevated the hobby\'s aesthetic ambitions.',
      cardIds: ['card-2', 'card-6'],
    },
    {
      heading: 'Chapter 3: The Modern Canon',
      body: 'LeBron, Kobe, Trout, Luka, Mahomes, Herbert — the modern portion of this collection reads like a ballot for the Sports Card Hall of Fame. Each represents the consensus flagship rookie: the Topps Chrome LeBron, the Bowman Chrome Trout, the Prizm Luka. The collector did not chase numbered variants or exotic parallels. Instead, they chose the card that will appear in textbooks about the hobby 50 years from now. This is collecting with conviction.',
      cardIds: ['card-3', 'card-9', 'card-8', 'card-5', 'card-7', 'card-10'],
    },
  ],
  closingReflection:
    'What makes this collection remarkable is not its market value — though that is substantial — but its coherence. Every card tells a story. Every acquisition reflects a philosophy. This is not a portfolio; it is a narrative. And the narrative says: the greatest cards are the ones that capture the exact moment an athlete became immortal.',
  generatedAt: new Date().toISOString(),
};

// ---- Service Functions ----

export function generateNarrative(inventory: CardInventory[]): CollectionNarrative {
  const cached = store.get<CollectionNarrative | null>(NARRATIVE_KEY, null);
  if (cached) {
    return cached;
  }

  const narrative: CollectionNarrative = {
    significanceScore: 87,
    primaryTheme: 'Franchise Cornerstones & Defensive Greatness',
    storyPreview:
      'Your collection tells a story of loyalty and legacy — cards chosen not for speculative upside, but because each one marks the moment an athlete became immortal. From the 1952 Mantle to the 2020 Herbert, a clear philosophy emerges: canonical rookies, franchise icons, defensive excellence.',
    totalMomentLinks: MOCK_MOMENT_LINKS.length,
    totalMemos: getLegacyMemos().length,
    heritageStory: MOCK_HERITAGE_STORY,
    themeAnalysis: analyzeThemes(inventory),
    momentLinks: getMomentLinks(inventory),
    exhibitionSections: generateExhibitionSections(inventory),
  };

  store.set(NARRATIVE_KEY, narrative);
  return narrative;
}

export function getMomentLinks(_inventory: CardInventory[]): MomentLink[] {
  return MOCK_MOMENT_LINKS;
}

export function analyzeThemes(_inventory: CardInventory[]): ThemeAnalysis {
  return {
    themes: MOCK_THEMES,
    primaryTheme: MOCK_THEMES[0],
    collectorPersona: 'Legacy Curator',
    narrativeSummary:
      'Your collecting patterns reveal a "Legacy Curator" persona — someone drawn to canonical moments and franchise-defining players rather than speculative or trend-driven picks. You unconsciously prioritize defensive excellence, cultural crossover impact, and franchise loyalty.',
    unconsciousPatterns: [
      '73% of vintage picks are All-Defense selections — defensive greatness resonates deeply.',
      '90% of cards are flagship rookies, not numbered parallels — you trust the canonical card.',
      'Zero hockey or soccer cards — your narrative is purely American Big Three sports.',
      'Average card age is 18 years — you favor established legacy over unproven upside.',
      'No women\'s sports represented — a blind spot worth examining as the WNBA card market surges.',
    ],
  };
}

export function generateExhibitionSections(_inventory: CardInventory[]): ExhibitionSection[] {
  return MOCK_EXHIBITION_SECTIONS;
}

export function getHeritageStory(inventory: CardInventory[]): HeritageStory {
  const narrative = generateNarrative(inventory);
  return narrative.heritageStory;
}

export function exportNarrative(format: 'pdf' | 'social' | 'web'): NarrativeExport {
  const _labels: Record<string, string> = {
    pdf: 'Museum Catalog PDF',
    social: 'Social Media Carousel',
    web: 'Embeddable Web Showcase',
  };

  const previewHtmlMap: Record<string, string> = {
    pdf: '<div class="pdf-preview"><h1>A Story Written in Cardboard</h1><p>12-page museum-quality catalog with curatorial notes, moment links, and theme analysis.</p></div>',
    social: '<div class="social-preview"><p>10-slide Instagram carousel featuring your top cards, moment links, and collection themes.</p></div>',
    web: '<div class="web-preview"><iframe style="border:none;width:100%;height:400px" src="#showcase-preview"></iframe><p>Shareable web page with interactive exhibition sections.</p></div>',
  };

  return {
    format,
    url: `https://msi-exports.example.com/narrative/${format}/${Date.now()}`,
    generatedAt: new Date().toISOString(),
    previewHtml: previewHtmlMap[format] ?? '',
  };
}

export function saveLegacyMemo(cardId: string, memo: Omit<LegacyMemo, 'id' | 'createdAt'>): LegacyMemo {
  const memos = getLegacyMemos();
  const newMemo: LegacyMemo = {
    ...memo,
    id: `memo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    cardId,
    createdAt: new Date().toISOString(),
  };
  memos.push(newMemo);
  store.set(MEMOS_KEY, memos);

  // Invalidate cached narrative so memo count updates
  store.remove(NARRATIVE_KEY);

  return newMemo;
}

export function getLegacyMemos(): LegacyMemo[] {
  const existing = store.get<LegacyMemo[] | null>(MEMOS_KEY, null);
  if (!existing) {
    // Seed with example memos
    const seed: LegacyMemo[] = [
      {
        id: 'memo-seed-1',
        cardId: 'card-1',
        cardLabel: '1986 Fleer Michael Jordan #57 RC',
        text: 'My dad bought this at a card show in 1991 for $200. He told me it would pay for college someday. It didn\'t — but it started a lifelong obsession. This card is the reason I collect.',
        type: 'text',
        createdAt: '2024-03-15T10:30:00Z',
      },
      {
        id: 'memo-seed-2',
        cardId: 'card-4',
        cardLabel: '1952 Topps Mickey Mantle #311',
        text: 'Inherited from my grandfather\'s estate in 2019. He kept it in a cigar box with ticket stubs from the 1956 World Series. The card is a PSA 3, but the memories are a PSA 10.',
        type: 'text',
        createdAt: '2024-06-22T14:15:00Z',
      },
      {
        id: 'memo-seed-3',
        cardId: 'card-7',
        cardLabel: '2017 National Treasures Patrick Mahomes #161 RC Auto',
        text: 'Bought this the week before Super Bowl LIV for $3,200. My wife thought I was insane. After the comeback win, it was worth $15,000. She stopped questioning my card purchases after that.',
        type: 'text',
        createdAt: '2024-09-01T09:45:00Z',
      },
    ];
    store.set(MEMOS_KEY, seed);
    return seed;
  }
  return existing;
}

export function getCollectionSignificanceScore(): number {
  if (store.has(SIGNIFICANCE_KEY)) {
    return store.get<number>(SIGNIFICANCE_KEY, 87);
  }
  const score = 87;
  store.set(SIGNIFICANCE_KEY, score);
  return score;
}

export interface SuggestedAddition {
  player: string;
  cardDescription: string;
  year: number;
  reason: string;
  themeStrengthened: string;
  estimatedValue: number;
  priority: 'high' | 'medium' | 'low';
}

export function getSuggestedAdditions(_inventory: CardInventory[]): SuggestedAddition[] {
  return [
    {
      player: 'Wayne Gretzky',
      cardDescription: '1979-80 O-Pee-Chee #18 RC',
      year: 1979,
      reason:
        'Adding the greatest hockey player ever would expand your narrative beyond the Big Three American sports and strengthen the "Franchise Cornerstones" theme.',
      themeStrengthened: 'Franchise Cornerstones',
      estimatedValue: 45000,
      priority: 'high',
    },
    {
      player: 'Tom Brady',
      cardDescription: '2000 Playoff Contenders #144 RC Auto',
      year: 2000,
      reason:
        'The GOAT quarterback\'s rookie auto is conspicuously absent. It would complete your football narrative arc from pre-Mahomes to post-Mahomes.',
      themeStrengthened: 'Modern QB Revolution',
      estimatedValue: 350000,
      priority: 'high',
    },
    {
      player: 'Shohei Ohtani',
      cardDescription: '2018 Topps Chrome Update #HMT1 RC',
      year: 2018,
      reason:
        'The two-way phenom bridges your baseball vintage holdings to the modern era and adds a "unicorn talent" dimension your collection currently lacks.',
      themeStrengthened: 'Cultural Crossover Icons',
      estimatedValue: 800,
      priority: 'medium',
    },
    {
      player: 'Caitlin Clark',
      cardDescription: '2024 Panini Prizm WNBA #1 RC',
      year: 2024,
      reason:
        'Your theme analysis flagged zero women\'s sports cards as a blind spot. Clark\'s cultural impact mirrors Griffey\'s — she\'s making her sport relevant to a new generation.',
      themeStrengthened: 'Cultural Crossover Icons',
      estimatedValue: 250,
      priority: 'medium',
    },
    {
      player: 'Hank Aaron',
      cardDescription: '1954 Topps #128 RC',
      year: 1954,
      reason:
        'Pairs naturally with your Mantle. Aaron\'s story of breaking Ruth\'s record amid death threats adds a powerful social-justice dimension to your collection\'s narrative.',
      themeStrengthened: 'The Foundations',
      estimatedValue: 18000,
      priority: 'medium',
    },
  ];
}

// ---- Utility ----

export function getNarrativeStats(): {
  significanceScore: number;
  primaryTheme: string;
  storyPreview: string;
  memoCount: number;
  momentLinkCount: number;
} {
  return {
    significanceScore: getCollectionSignificanceScore(),
    primaryTheme: 'Franchise Cornerstones & Defensive Greatness',
    storyPreview:
      'Your collection tells a story of loyalty and legacy — cards chosen not for speculative upside, but because each one marks the moment an athlete became immortal.',
    memoCount: getLegacyMemos().length,
    momentLinkCount: MOCK_MOMENT_LINKS.length,
  };
}
