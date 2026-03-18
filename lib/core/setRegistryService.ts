import { CardInventory, Sport } from '../../types';
import { store } from '../dal/syncStore';

// ---- Types ----

export type ParallelType = 'base' | 'refractor' | 'auto' | 'numbered' | '1of1';

export interface SetCard {
  cardNumber: string;
  player: string;
  team: string;
  parallelType: ParallelType;
  estimatedValue: number;
  isInsert: boolean;
  isAuto: boolean;
  isNumbered: boolean;
  printRun?: number;
}

export interface CardSet {
  id: string;
  name: string;
  year: number;
  sport: Sport;
  manufacturer: string;
  cardCount: number;
  baseCount: number;
  insertCount: number;
  autoCount: number;
  numberedCount: number;
  avgBaseValue: number;
  avgInsertValue: number;
  avgAutoValue: number;
  description: string;
}

export interface SetEnrollment {
  id: string;
  setId: string;
  enrolledAt: string;
  ownedCardNumbers: string[];
  parallelTracking: Record<ParallelType, string[]>;
  notes?: string;
}

export interface SetProgress {
  setId: string;
  setName: string;
  totalCards: number;
  ownedCount: number;
  missingCount: number;
  completionPercent: number;
  estimatedCostToComplete: number;
  recentMatchCount: number;
}

export interface SetValueAnalysis {
  totalOwnedValue: number;
  estimatedCompleteSetValue: number;
  setPremiumPercent: number;
  avgCardValue: number;
  highestValueOwned: number;
  lowestValueMissing: number;
}

export interface MasterSetScore {
  totalScore: number;
  baseScore: number;
  insertScore: number;
  autoScore: number;
  numberedScore: number;
  oneOfOneScore: number;
  maxPossibleScore: number;
  percentOfMax: number;
}

export interface SetMissingCardInfo {
  cardNumber: string;
  player: string;
  team: string;
  estimatedPrice: number;
  parallelType: ParallelType;
  rarity: number; // 1-10 scale
}

// ---- Constants ----

const ENROLLMENT_KEY = 'msi_set_enrollments';

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

// ---- Set Database ----

const SET_DATABASE: CardSet[] = [
  // Baseball
  {
    id: 'topps-2024-s1',
    name: '2024 Topps Series 1',
    year: 2024,
    sport: 'Baseball',
    manufacturer: 'Topps',
    cardCount: 330,
    baseCount: 330,
    insertCount: 50,
    autoCount: 20,
    numberedCount: 15,
    avgBaseValue: 0.5,
    avgInsertValue: 3,
    avgAutoValue: 25,
    description: 'Flagship Topps baseball set featuring top MLB stars and rookies.',
  },
  {
    id: 'bowman-2023-chrome',
    name: '2023 Bowman Chrome',
    year: 2023,
    sport: 'Baseball',
    manufacturer: 'Bowman',
    cardCount: 250,
    baseCount: 200,
    insertCount: 30,
    autoCount: 40,
    numberedCount: 20,
    avgBaseValue: 1,
    avgInsertValue: 5,
    avgAutoValue: 40,
    description: 'Premier prospect set with chromium technology for baseball.',
  },
  {
    id: 'topps-2024-heritage',
    name: '2024 Topps Heritage',
    year: 2024,
    sport: 'Baseball',
    manufacturer: 'Topps',
    cardCount: 500,
    baseCount: 425,
    insertCount: 50,
    autoCount: 15,
    numberedCount: 10,
    avgBaseValue: 0.35,
    avgInsertValue: 2.5,
    avgAutoValue: 20,
    description: 'Vintage-inspired design paying homage to classic Topps sets.',
  },
  // Basketball
  {
    id: 'prizm-2023-24-basketball',
    name: '2023-24 Panini Prizm Basketball',
    year: 2023,
    sport: 'Basketball',
    manufacturer: 'Panini',
    cardCount: 300,
    baseCount: 300,
    insertCount: 45,
    autoCount: 25,
    numberedCount: 30,
    avgBaseValue: 0.75,
    avgInsertValue: 8,
    avgAutoValue: 50,
    description: 'The most popular basketball card set featuring Prizm technology.',
  },
  {
    id: 'donruss-2024-basketball',
    name: '2024 Donruss Basketball',
    year: 2024,
    sport: 'Basketball',
    manufacturer: 'Panini',
    cardCount: 250,
    baseCount: 200,
    insertCount: 35,
    autoCount: 15,
    numberedCount: 10,
    avgBaseValue: 0.4,
    avgInsertValue: 4,
    avgAutoValue: 30,
    description: 'Classic Donruss basketball with Rated Rookies and inserts.',
  },
  // Football
  {
    id: 'prizm-2024-football',
    name: '2024 Panini Prizm Football',
    year: 2024,
    sport: 'Football',
    manufacturer: 'Panini',
    cardCount: 400,
    baseCount: 350,
    insertCount: 60,
    autoCount: 30,
    numberedCount: 25,
    avgBaseValue: 0.5,
    avgInsertValue: 5,
    avgAutoValue: 35,
    description: 'Premium football set with iconic Prizm parallels.',
  },
  {
    id: 'mosaic-2023-football',
    name: '2023 Panini Mosaic Football',
    year: 2023,
    sport: 'Football',
    manufacturer: 'Panini',
    cardCount: 300,
    baseCount: 300,
    insertCount: 40,
    autoCount: 20,
    numberedCount: 15,
    avgBaseValue: 0.4,
    avgInsertValue: 4,
    avgAutoValue: 28,
    description: 'Mosaic pattern design with colorful parallels and inserts.',
  },
  {
    id: 'donruss-2024-football',
    name: '2024 Donruss Football',
    year: 2024,
    sport: 'Football',
    manufacturer: 'Panini',
    cardCount: 350,
    baseCount: 300,
    insertCount: 35,
    autoCount: 15,
    numberedCount: 10,
    avgBaseValue: 0.35,
    avgInsertValue: 3.5,
    avgAutoValue: 25,
    description: 'Classic Donruss football featuring Rated Rookies.',
  },
  // Hockey
  {
    id: 'upperdeck-2023-24-s1',
    name: '2023-24 Upper Deck Series 1',
    year: 2023,
    sport: 'Hockey',
    manufacturer: 'Upper Deck',
    cardCount: 250,
    baseCount: 200,
    insertCount: 30,
    autoCount: 10,
    numberedCount: 10,
    avgBaseValue: 0.3,
    avgInsertValue: 3,
    avgAutoValue: 20,
    description: 'The flagship hockey set featuring Young Guns rookies.',
  },
  {
    id: 'upperdeck-2023-24-s2',
    name: '2023-24 Upper Deck Series 2',
    year: 2023,
    sport: 'Hockey',
    manufacturer: 'Upper Deck',
    cardCount: 250,
    baseCount: 200,
    insertCount: 30,
    autoCount: 10,
    numberedCount: 10,
    avgBaseValue: 0.3,
    avgInsertValue: 3,
    avgAutoValue: 18,
    description: 'Continuation of the flagship hockey set with more Young Guns.',
  },
  // Soccer
  {
    id: 'topps-chrome-2023-24-ucl',
    name: '2023-24 Topps Chrome UCL',
    year: 2023,
    sport: 'Soccer',
    manufacturer: 'Topps',
    cardCount: 200,
    baseCount: 200,
    insertCount: 25,
    autoCount: 15,
    numberedCount: 12,
    avgBaseValue: 0.6,
    avgInsertValue: 6,
    avgAutoValue: 35,
    description: 'Chrome technology meets UEFA Champions League football.',
  },
  {
    id: 'prizm-2023-24-epl',
    name: '2023-24 Panini Prizm EPL',
    year: 2023,
    sport: 'Soccer',
    manufacturer: 'Panini',
    cardCount: 300,
    baseCount: 250,
    insertCount: 35,
    autoCount: 15,
    numberedCount: 10,
    avgBaseValue: 0.5,
    avgInsertValue: 5,
    avgAutoValue: 30,
    description: 'Prizm technology for English Premier League football.',
  },
];

// ---- Player Name Generator ----

const FIRST_NAMES = [
  'Mike', 'Aaron', 'Juan', 'Shohei', 'Mookie', 'Fernando', 'Ronald', 'Bobby',
  'Julio', 'Gunnar', 'Corbin', 'Adley', 'Elly', 'Josh', 'Marcus', 'Spencer',
  'LeBron', 'Jayson', 'Luka', 'Anthony', 'Victor', 'Tyrese', 'Paolo', 'Chet',
  'Patrick', 'Joe', 'Jalen', 'CJ', 'Caleb', 'Marvin', 'Drake', 'Bijan',
  'Connor', 'Nathan', 'Jason', 'Cale', 'Quinn', 'Trevor', 'Jack', 'Tim',
  'Erling', 'Kylian', 'Jude', 'Phil', 'Bukayo', 'Marcus', 'Cole', 'Vini',
];

const LAST_NAMES = [
  'Trout', 'Judge', 'Soto', 'Ohtani', 'Betts', 'Tatis', 'Acuna', 'Witt',
  'Rodriguez', 'Henderson', 'Carroll', 'Rutschman', 'De La Cruz', 'Jung', 'Strider', 'James',
  'Tatum', 'Doncic', 'Edwards', 'Wembanyama', 'Haliburton', 'Banchero', 'Holmgren', 'Brown',
  'Mahomes', 'Burrow', 'Hurts', 'Stroud', 'Williams', 'Harrison', 'Maye', 'Robinson',
  'McDavid', 'MacKinnon', 'Robertson', 'Makar', 'Hughes', 'Zegras', 'Eichel', 'Bedard',
  'Haaland', 'Mbappe', 'Bellingham', 'Foden', 'Saka', 'Rashford', 'Palmer', 'Junior',
];

const TEAM_NAMES: Record<Sport, string[]> = {
  Baseball: ['Yankees', 'Dodgers', 'Braves', 'Astros', 'Padres', 'Phillies', 'Rangers', 'Orioles', 'Twins', 'Mariners'],
  Basketball: ['Lakers', 'Celtics', 'Mavericks', 'Timberwolves', 'Spurs', 'Pacers', 'Magic', 'Thunder', '76ers', 'Nuggets'],
  Football: ['Chiefs', 'Bengals', 'Eagles', 'Texans', 'Bears', 'Cardinals', 'Patriots', 'Jaguars', 'Cowboys', 'Bills'],
  Hockey: ['Oilers', 'Avalanche', 'Stars', 'Avalanche', 'Devils', 'Ducks', 'Golden Knights', 'Blackhawks', 'Maple Leafs', 'Rangers'],
  Soccer: ['Man City', 'PSG', 'Real Madrid', 'Man City', 'Arsenal', 'Man United', 'Chelsea', 'Flamengo', 'Barcelona', 'Bayern'],
};

function generateSetCards(set: CardSet): SetCard[] {
  const cards: SetCard[] = [];
  const seed = hashString(set.id);

  for (let i = 1; i <= set.baseCount; i++) {
    const nameIdx = Math.floor(seededRange(seed, i * 3, 0, FIRST_NAMES.length));
    const lastIdx = Math.floor(seededRange(seed, i * 3 + 1, 0, LAST_NAMES.length));
    const teamIdx = Math.floor(seededRange(seed, i * 3 + 2, 0, TEAM_NAMES[set.sport].length));
    const valueMult = seededRange(seed, i * 7, 0.3, 3.0);

    cards.push({
      cardNumber: String(i),
      player: `${FIRST_NAMES[nameIdx]} ${LAST_NAMES[lastIdx]}`,
      team: TEAM_NAMES[set.sport][teamIdx],
      parallelType: 'base',
      estimatedValue: Math.round(set.avgBaseValue * valueMult * 100) / 100,
      isInsert: false,
      isAuto: false,
      isNumbered: false,
    });
  }

  // Inserts
  for (let i = 0; i < set.insertCount; i++) {
    const num = set.baseCount + i + 1;
    const nameIdx = Math.floor(seededRange(seed, (num) * 3 + 100, 0, FIRST_NAMES.length));
    const lastIdx = Math.floor(seededRange(seed, (num) * 3 + 101, 0, LAST_NAMES.length));
    const teamIdx = Math.floor(seededRange(seed, (num) * 3 + 102, 0, TEAM_NAMES[set.sport].length));
    const valueMult = seededRange(seed, num * 7 + 200, 0.5, 4.0);

    cards.push({
      cardNumber: `I-${i + 1}`,
      player: `${FIRST_NAMES[nameIdx]} ${LAST_NAMES[lastIdx]}`,
      team: TEAM_NAMES[set.sport][teamIdx],
      parallelType: 'refractor',
      estimatedValue: Math.round(set.avgInsertValue * valueMult * 100) / 100,
      isInsert: true,
      isAuto: false,
      isNumbered: false,
    });
  }

  // Autos
  for (let i = 0; i < set.autoCount; i++) {
    const num = set.baseCount + set.insertCount + i + 1;
    const nameIdx = Math.floor(seededRange(seed, (num) * 3 + 200, 0, FIRST_NAMES.length));
    const lastIdx = Math.floor(seededRange(seed, (num) * 3 + 201, 0, LAST_NAMES.length));
    const teamIdx = Math.floor(seededRange(seed, (num) * 3 + 202, 0, TEAM_NAMES[set.sport].length));
    const valueMult = seededRange(seed, num * 7 + 300, 0.5, 5.0);

    cards.push({
      cardNumber: `A-${i + 1}`,
      player: `${FIRST_NAMES[nameIdx]} ${LAST_NAMES[lastIdx]}`,
      team: TEAM_NAMES[set.sport][teamIdx],
      parallelType: 'auto',
      estimatedValue: Math.round(set.avgAutoValue * valueMult * 100) / 100,
      isInsert: false,
      isAuto: true,
      isNumbered: false,
    });
  }

  // Numbered
  for (let i = 0; i < set.numberedCount; i++) {
    const num = set.baseCount + set.insertCount + set.autoCount + i + 1;
    const nameIdx = Math.floor(seededRange(seed, (num) * 3 + 300, 0, FIRST_NAMES.length));
    const lastIdx = Math.floor(seededRange(seed, (num) * 3 + 301, 0, LAST_NAMES.length));
    const teamIdx = Math.floor(seededRange(seed, (num) * 3 + 302, 0, TEAM_NAMES[set.sport].length));
    const valueMult = seededRange(seed, num * 7 + 400, 1.0, 8.0);
    const printRun = Math.floor(seededRange(seed, num * 7 + 401, 1, 100));

    cards.push({
      cardNumber: `N-${i + 1}`,
      player: `${FIRST_NAMES[nameIdx]} ${LAST_NAMES[lastIdx]}`,
      team: TEAM_NAMES[set.sport][teamIdx],
      parallelType: printRun <= 1 ? '1of1' : 'numbered',
      estimatedValue: Math.round(set.avgAutoValue * valueMult * 100) / 100,
      isInsert: false,
      isAuto: false,
      isNumbered: true,
      printRun,
    });
  }

  return cards;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

// ---- Cache for generated set cards ----

const setCardCache = new Map<string, SetCard[]>();

function getSetCards(set: CardSet): SetCard[] {
  if (setCardCache.has(set.id)) {
    return setCardCache.get(set.id)!;
  }
  const cards = generateSetCards(set);
  setCardCache.set(set.id, cards);
  return cards;
}

// ---- localStorage helpers ----

export function loadEnrollments(): SetEnrollment[] {
  return store.get<SetEnrollment[]>(ENROLLMENT_KEY, []);
}

export function saveEnrollments(enrollments: SetEnrollment[]): void {
  store.set(ENROLLMENT_KEY, enrollments);
}

function saveEnrollment(enrollment: SetEnrollment): void {
  const enrollments = loadEnrollments();
  const idx = enrollments.findIndex(e => e.id === enrollment.id);
  if (idx >= 0) {
    enrollments[idx] = enrollment;
  } else {
    enrollments.push(enrollment);
  }
  saveEnrollments(enrollments);
}

// ---- Core Functions ----

export function getAvailableSets(sport?: Sport): CardSet[] {
  if (sport) {
    return SET_DATABASE.filter(s => s.sport === sport);
  }
  return [...SET_DATABASE];
}

export function getSetById(setId: string): CardSet | undefined {
  return SET_DATABASE.find(s => s.id === setId);
}

export function getSetCardList(setId: string): SetCard[] {
  const set = getSetById(setId);
  if (!set) return [];
  return getSetCards(set);
}

export function enrollInSet(setId: string, cards: CardInventory[]): SetEnrollment {
  const set = getSetById(setId);
  if (!set) {
    throw new Error(`Set not found: ${setId}`);
  }

  const setCards = getSetCards(set);
  const ownedNumbers: string[] = [];
  const parallelTracking: Record<ParallelType, string[]> = {
    base: [],
    refractor: [],
    auto: [],
    numbered: [],
    '1of1': [],
  };

  // Match owned cards to set by year + manufacturer + cardNumber
  for (const card of cards) {
    // Check if card matches this set's year and manufacturer
    const yearMatch = card.year === set.year;
    const mfgMatch = card.manufacturer.toLowerCase().includes(set.manufacturer.toLowerCase()) ||
      set.manufacturer.toLowerCase().includes(card.manufacturer.toLowerCase());
    const setMatch = card.set.toLowerCase().includes(set.name.toLowerCase().split(' ').slice(-1)[0]) ||
      set.name.toLowerCase().includes(card.set.toLowerCase());

    if (yearMatch && (mfgMatch || setMatch)) {
      // Try matching by card number
      const matchedSetCard = setCards.find(sc => sc.cardNumber === card.cardNumber);
      if (matchedSetCard) {
        if (!ownedNumbers.includes(matchedSetCard.cardNumber)) {
          ownedNumbers.push(matchedSetCard.cardNumber);
        }
        if (!parallelTracking[matchedSetCard.parallelType].includes(matchedSetCard.cardNumber)) {
          parallelTracking[matchedSetCard.parallelType].push(matchedSetCard.cardNumber);
        }
      } else {
        // Fuzzy match: try to match by numeric part of cardNumber
        const numericPart = card.cardNumber.replace(/\D/g, '');
        if (numericPart) {
          const fuzzyMatch = setCards.find(sc => sc.cardNumber === numericPart);
          if (fuzzyMatch && !ownedNumbers.includes(fuzzyMatch.cardNumber)) {
            ownedNumbers.push(fuzzyMatch.cardNumber);
            if (!parallelTracking[fuzzyMatch.parallelType].includes(fuzzyMatch.cardNumber)) {
              parallelTracking[fuzzyMatch.parallelType].push(fuzzyMatch.cardNumber);
            }
          }
        }
      }
    }
  }

  // If no real matches, simulate some owned cards based on inventory size for demo purposes
  if (ownedNumbers.length === 0 && cards.length > 0) {
    const seed = hashString(setId + cards.length);
    const simulatedCount = Math.min(
      Math.floor(cards.length * seededRange(seed, 1, 0.05, 0.3)),
      set.cardCount
    );

    for (let i = 0; i < simulatedCount; i++) {
      const idx = Math.floor(seededRange(seed, i + 10, 0, setCards.length));
      const sc = setCards[idx];
      if (!ownedNumbers.includes(sc.cardNumber)) {
        ownedNumbers.push(sc.cardNumber);
        if (!parallelTracking[sc.parallelType].includes(sc.cardNumber)) {
          parallelTracking[sc.parallelType].push(sc.cardNumber);
        }
      }
    }
  }

  const enrollment: SetEnrollment = {
    id: `enroll_${setId}_${Date.now()}`,
    setId,
    enrolledAt: new Date().toISOString(),
    ownedCardNumbers: ownedNumbers,
    parallelTracking,
  };

  saveEnrollment(enrollment);
  return enrollment;
}

export function getSetProgress(enrollment: SetEnrollment): SetProgress {
  const set = getSetById(enrollment.setId);
  if (!set) {
    return {
      setId: enrollment.setId,
      setName: 'Unknown Set',
      totalCards: 0,
      ownedCount: 0,
      missingCount: 0,
      completionPercent: 0,
      estimatedCostToComplete: 0,
      recentMatchCount: 0,
    };
  }

  const setCards = getSetCards(set);
  const totalCards = setCards.length;
  const ownedCount = enrollment.ownedCardNumbers.length;
  const missingCount = totalCards - ownedCount;
  const completionPercent = totalCards > 0 ? Math.round((ownedCount / totalCards) * 1000) / 10 : 0;

  // Estimated cost: avg value of missing cards
  const missingCards = setCards.filter(sc => !enrollment.ownedCardNumbers.includes(sc.cardNumber));
  const estimatedCostToComplete = missingCards.reduce((sum, mc) => sum + mc.estimatedValue, 0);

  // Recent matches: simulate based on enrollment age
  const enrolledDate = new Date(enrollment.enrolledAt);
  const daysSinceEnroll = Math.max(1, Math.floor((Date.now() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24)));
  const seed = hashString(enrollment.id);
  const recentMatchCount = Math.min(ownedCount, Math.floor(seededRange(seed, daysSinceEnroll, 0, 5)));

  return {
    setId: enrollment.setId,
    setName: set.name,
    totalCards,
    ownedCount,
    missingCount,
    completionPercent,
    estimatedCostToComplete: Math.round(estimatedCostToComplete * 100) / 100,
    recentMatchCount,
  };
}

export function getMissingCardsForEnrollment(enrollment: SetEnrollment): SetMissingCardInfo[] {
  const set = getSetById(enrollment.setId);
  if (!set) return [];

  const setCards = getSetCards(set);
  const missing = setCards.filter(sc => !enrollment.ownedCardNumbers.includes(sc.cardNumber));

  return missing.map(sc => {
    const seed = hashString(sc.cardNumber + sc.player);
    let rarity = 3; // default base rarity
    if (sc.isAuto) rarity = 8;
    else if (sc.isNumbered) rarity = sc.printRun && sc.printRun <= 10 ? 10 : 7;
    else if (sc.isInsert) rarity = 5;
    rarity = Math.min(10, Math.max(1, rarity + Math.floor(seededRange(seed, 1, -1, 2))));

    return {
      cardNumber: sc.cardNumber,
      player: sc.player,
      team: sc.team,
      estimatedPrice: sc.estimatedValue,
      parallelType: sc.parallelType,
      rarity,
    };
  });
}

export function getParallelProgress(
  enrollment: SetEnrollment,
  parallelType: ParallelType
): { total: number; owned: number; percent: number } {
  const set = getSetById(enrollment.setId);
  if (!set) return { total: 0, owned: 0, percent: 0 };

  const setCards = getSetCards(set);
  const parallelCards = setCards.filter(sc => sc.parallelType === parallelType);
  const ownedInParallel = enrollment.parallelTracking[parallelType]?.length ?? 0;

  return {
    total: parallelCards.length,
    owned: ownedInParallel,
    percent: parallelCards.length > 0 ? Math.round((ownedInParallel / parallelCards.length) * 1000) / 10 : 0,
  };
}

export function getSetValueAnalysis(enrollment: SetEnrollment): SetValueAnalysis {
  const set = getSetById(enrollment.setId);
  if (!set) {
    return {
      totalOwnedValue: 0,
      estimatedCompleteSetValue: 0,
      setPremiumPercent: 0,
      avgCardValue: 0,
      highestValueOwned: 0,
      lowestValueMissing: 0,
    };
  }

  const setCards = getSetCards(set);
  const ownedCards = setCards.filter(sc => enrollment.ownedCardNumbers.includes(sc.cardNumber));
  const missingCards = setCards.filter(sc => !enrollment.ownedCardNumbers.includes(sc.cardNumber));

  const totalOwnedValue = ownedCards.reduce((sum, c) => sum + c.estimatedValue, 0);
  const totalAllCardsValue = setCards.reduce((sum, c) => sum + c.estimatedValue, 0);

  // Complete sets typically carry a 15-30% premium
  const seed = hashString(set.id);
  const premiumFactor = seededRange(seed, 999, 1.15, 1.30);
  const estimatedCompleteSetValue = totalAllCardsValue * premiumFactor;
  const setPremiumPercent = Math.round((premiumFactor - 1) * 100);

  const avgCardValue = setCards.length > 0 ? totalAllCardsValue / setCards.length : 0;
  const highestValueOwned = ownedCards.length > 0
    ? Math.max(...ownedCards.map(c => c.estimatedValue))
    : 0;
  const lowestValueMissing = missingCards.length > 0
    ? Math.min(...missingCards.map(c => c.estimatedValue))
    : 0;

  return {
    totalOwnedValue: Math.round(totalOwnedValue * 100) / 100,
    estimatedCompleteSetValue: Math.round(estimatedCompleteSetValue * 100) / 100,
    setPremiumPercent,
    avgCardValue: Math.round(avgCardValue * 100) / 100,
    highestValueOwned: Math.round(highestValueOwned * 100) / 100,
    lowestValueMissing: Math.round(lowestValueMissing * 100) / 100,
  };
}

export function getMasterSetScore(enrollment: SetEnrollment): MasterSetScore {
  const set = getSetById(enrollment.setId);
  if (!set) {
    return {
      totalScore: 0,
      baseScore: 0,
      insertScore: 0,
      autoScore: 0,
      numberedScore: 0,
      oneOfOneScore: 0,
      maxPossibleScore: 0,
      percentOfMax: 0,
    };
  }

  const setCards = getSetCards(set);

  const weights: Record<ParallelType, number> = {
    base: 1,
    refractor: 2,
    auto: 5,
    numbered: 10,
    '1of1': 50,
  };

  let baseScore = 0;
  let insertScore = 0;
  let autoScore = 0;
  let numberedScore = 0;
  let oneOfOneScore = 0;
  let maxPossibleScore = 0;

  for (const sc of setCards) {
    const weight = weights[sc.parallelType];
    maxPossibleScore += weight;

    if (enrollment.ownedCardNumbers.includes(sc.cardNumber)) {
      switch (sc.parallelType) {
        case 'base': baseScore += weight; break;
        case 'refractor': insertScore += weight; break;
        case 'auto': autoScore += weight; break;
        case 'numbered': numberedScore += weight; break;
        case '1of1': oneOfOneScore += weight; break;
      }
    }
  }

  const totalScore = baseScore + insertScore + autoScore + numberedScore + oneOfOneScore;
  const percentOfMax = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 1000) / 10 : 0;

  return {
    totalScore,
    baseScore,
    insertScore,
    autoScore,
    numberedScore,
    oneOfOneScore,
    maxPossibleScore,
    percentOfMax,
  };
}

export function removeEnrollment(enrollmentId: string): void {
  const enrollments = loadEnrollments();
  const filtered = enrollments.filter(e => e.id !== enrollmentId);
  saveEnrollments(filtered);
}

// ---- Adapter types and functions for SetRegistry page (Phase 151) ----

export interface SetEntry {
  id: string;
  name: string;
  year: number;
  sport: string;
  manufacturer: string;
  totalCards: number;
  ownedCount: number;
  missingCount: number;
  completionPct: number;
  totalValue: number;
  estimatedCostToComplete: number;
}

export interface MissingCard {
  id: string;
  name: string;
  setName: string;
  cardNumber: string;
  lowestPrice: number;
  avgPrice: number;
  activeListings: number;
  availability: 'high' | 'medium' | 'low';
  priority: 'high' | 'medium' | 'low';
}

export interface CompletionStat {
  setName: string;
  completionPct: number;
  setValue: number;
}

export interface SetChallenge {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'not_started';
  progressPct: number;
  reward: string;
  deadline?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: string;
  reward: string;
}

export interface CategoryBreakdown {
  category: string;
  cardCount: number;
}

export interface SetRegistrySummary {
  totalSets: number;
  totalCards: number;
  completedSets: number;
}

export function getSetRegistry(): SetEntry[] {
  return SET_DATABASE.map(set => {
    const cards = getSetCards(set);
    const seed = hashString(set.id + 'registry');
    const ownedCount = Math.floor(seededRange(seed, 1, cards.length * 0.3, cards.length * 0.95));
    const missingCount = cards.length - ownedCount;
    const completionPct = Math.round((ownedCount / cards.length) * 1000) / 10;
    const totalValue = Math.round(cards.slice(0, ownedCount).reduce((s, c) => s + c.estimatedValue, 0) * 100) / 100;
    const costToComplete = Math.round(cards.slice(ownedCount).reduce((s, c) => s + c.estimatedValue, 0) * 100) / 100;

    return {
      id: set.id,
      name: set.name,
      year: set.year,
      sport: set.sport,
      manufacturer: set.manufacturer,
      totalCards: cards.length,
      ownedCount,
      missingCount,
      completionPct,
      totalValue,
      estimatedCostToComplete: costToComplete,
    };
  });
}

export function getCompletionStats(): CompletionStat[] {
  return getSetRegistry().map(entry => ({
    setName: entry.name,
    completionPct: entry.completionPct,
    setValue: entry.totalValue,
  }));
}

export function getSetChallenges(): SetChallenge[] {
  const challenges: SetChallenge[] = [
    { id: 'ch1', name: 'Complete a Base Set', description: 'Reach 100% completion on any base set.', status: 'in_progress', progressPct: 72, reward: '50 XP', deadline: '2025-12-31' },
    { id: 'ch2', name: 'Collect 10 Autographs', description: 'Own 10 autograph cards across all sets.', status: 'completed', progressPct: 100, reward: '100 XP' },
    { id: 'ch3', name: 'Master Set Hunter', description: 'Collect every parallel type in a single set.', status: 'not_started', progressPct: 0, reward: '200 XP', deadline: '2026-06-30' },
    { id: 'ch4', name: 'Rookie Rush', description: 'Collect 25 rookie cards from 2024 sets.', status: 'in_progress', progressPct: 56, reward: '75 XP', deadline: '2025-09-30' },
    { id: 'ch5', name: 'Multi-Sport Collector', description: 'Have active enrollments in 5 different sports.', status: 'in_progress', progressPct: 80, reward: '150 XP' },
  ];
  return challenges;
}

export function getMilestones(): Milestone[] {
  return [
    { id: 'm1', title: 'First Set Enrolled', description: 'Enrolled in your first card set.', achieved: true, achievedDate: '2024-03-15', reward: '10 XP' },
    { id: 'm2', title: '100 Cards Collected', description: 'Owned 100 cards across all sets.', achieved: true, achievedDate: '2024-06-01', reward: '25 XP' },
    { id: 'm3', title: '50% Completion', description: 'Reached 50% completion on any set.', achieved: true, achievedDate: '2024-08-20', reward: '50 XP' },
    { id: 'm4', title: 'First Complete Set', description: 'Completed a full base set at 100%.', achieved: false, reward: '100 XP' },
    { id: 'm5', title: '1000 Cards Collected', description: 'Owned 1000 cards across all sets.', achieved: false, reward: '200 XP' },
    { id: 'm6', title: 'Master Collector', description: 'Completed 5 full sets.', achieved: false, reward: '500 XP' },
  ];
}

export function getCategoryBreakdown(): CategoryBreakdown[] {
  let base = 0, inserts = 0, autographs = 0, parallels = 0, rookies = 0, memorabilia = 0, short_prints = 0;
  for (const set of SET_DATABASE) {
    const seed = hashString(set.id + 'cat');
    base += set.baseCount;
    inserts += set.insertCount;
    autographs += set.autoCount;
    parallels += set.numberedCount;
    rookies += Math.floor(seededRange(seed, 1, 10, 40));
    memorabilia += Math.floor(seededRange(seed, 2, 5, 15));
    short_prints += Math.floor(seededRange(seed, 3, 3, 12));
  }
  return [
    { category: 'Base', cardCount: base },
    { category: 'Inserts', cardCount: inserts },
    { category: 'Autographs', cardCount: autographs },
    { category: 'Parallels', cardCount: parallels },
    { category: 'Rookies', cardCount: rookies },
    { category: 'Memorabilia', cardCount: memorabilia },
    { category: 'Short_Prints', cardCount: short_prints },
  ];
}

export function getSummaryStats(): SetRegistrySummary {
  const registry = getSetRegistry();
  return {
    totalSets: registry.length,
    totalCards: registry.reduce((s, e) => s + e.ownedCount, 0),
    completedSets: registry.filter(e => e.completionPct >= 100).length,
  };
}

export function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function getCompletionColor(pct: number): string {
  if (pct >= 100) return 'text-emerald-400';
  if (pct >= 75) return 'text-blue-400';
  if (pct >= 50) return 'text-amber-400';
  return 'text-red-400';
}

// ---- Widget adapter functions ----

export function getSetRegistries(): { setName: string; completionPercent: number }[] {
  return getSetRegistry().map(e => ({
    setName: e.name,
    completionPercent: e.completionPct,
  }));
}

export function getOwnedCards(): { id: string }[] {
  const registry = getSetRegistry();
  const total = registry.reduce((s, e) => s + e.ownedCount, 0);
  return Array.from({ length: total }, (_, i) => ({ id: `owned-${i}` }));
}

export function getCompletionSummary(): { totalValue: number; missingCost: number } {
  const registry = getSetRegistry();
  const totalValue = registry.reduce((s, e) => s + e.totalValue, 0);
  const missingCost = registry.reduce((s, e) => s + e.estimatedCostToComplete, 0);
  return { totalValue: Math.round(totalValue * 100) / 100, missingCost: Math.round(missingCost * 100) / 100 };
}

export function getMissingCards(): MissingCard[] {
  const registry = getSetRegistry();
  const result: MissingCard[] = [];
  for (const entry of registry) {
    const set = getSetById(entry.id);
    if (!set) continue;
    const cards = getSetCards(set);
    const missing = cards.slice(entry.ownedCount);
    for (const sc of missing) {
      const seed = hashString(sc.cardNumber + sc.player + set.id);
      const lowestPrice = Math.round(sc.estimatedValue * 0.8 * 100) / 100;
      const avgPrice = Math.round(sc.estimatedValue * 100) / 100;
      const listings = Math.floor(seededRange(seed, 1, 1, 20));
      const avail: 'high' | 'medium' | 'low' = listings > 10 ? 'high' : listings > 4 ? 'medium' : 'low';
      const prio: 'high' | 'medium' | 'low' = sc.isAuto || sc.isNumbered ? 'high' : sc.isInsert ? 'medium' : 'low';
      result.push({
        id: `${set.id}-${sc.cardNumber}`,
        name: sc.player,
        setName: set.name,
        cardNumber: sc.cardNumber,
        lowestPrice,
        avgPrice,
        activeListings: listings,
        availability: avail,
        priority: prio,
      });
    }
  }
  return result.slice(0, 30);
}
