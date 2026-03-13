// ---- Types ----

export type ErrorType =
  | 'misprint'
  | 'wrong_back'
  | 'no_name'
  | 'reversed_negative'
  | 'wrong_photo'
  | 'double_print'
  | 'missing_foil'
  | 'color_variation'
  | 'sp'
  | 'ssp'
  | 'photo_variation';

export type Rarity =
  | 'common_error'
  | 'scarce'
  | 'rare'
  | 'extremely_rare'
  | 'unique';

export type VerificationDifficulty = 'easy' | 'moderate' | 'expert';

export interface ErrorCard {
  id: string;
  player: string;
  year: number;
  set: string;
  manufacturer: string;
  errorType: ErrorType;
  description: string;
  rarity: Rarity;
  normalValue: number;
  errorValue: number;
  premiumMultiplier: number;
  knownPopulation: number;
  identificationTips: string[];
  image?: string;
  verificationDifficulty: VerificationDifficulty;
}

export interface VariationGuide {
  setId: string;
  setName: string;
  year: number;
  variations: {
    cardNumber: string;
    type: ErrorType;
    description: string;
    howToIdentify: string;
    estimatedPop: number;
    valueMultiplier: number;
  }[];
}

export interface ErrorAlert {
  id: string;
  type: 'new_discovery' | 'price_spike' | 'verification_needed' | 'market_opportunity';
  card: ErrorCard;
  message: string;
  date: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorCardStats {
  totalCataloged: number;
  totalErrors: number;
  totalVariations: number;
  avgPremium: number;
  highestPremium: number;
  recentDiscoveries: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_error_cards';
const ALERTS_KEY = 'msi_error_alerts';

export const ERROR_TYPE_META: Record<ErrorType, { label: string; color: string; bg: string; border: string }> = {
  misprint:          { label: 'Misprint',           color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
  wrong_back:        { label: 'Wrong Back',         color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  no_name:           { label: 'No Name',            color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30' },
  reversed_negative: { label: 'Reversed Negative',  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  wrong_photo:       { label: 'Wrong Photo',        color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30' },
  double_print:      { label: 'Double Print',       color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30' },
  missing_foil:      { label: 'Missing Foil',       color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/30' },
  color_variation:   { label: 'Color Variation',    color: 'text-lime-400',   bg: 'bg-lime-500/10',   border: 'border-lime-500/30' },
  sp:                { label: 'SP',                 color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  ssp:               { label: 'SSP',                color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  photo_variation:   { label: 'Photo Variation',    color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
};

export const RARITY_META: Record<Rarity, { label: string; color: string; bg: string; border: string }> = {
  common_error:   { label: 'Common Error',   color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/30' },
  scarce:         { label: 'Scarce',         color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  rare:           { label: 'Rare',           color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  extremely_rare: { label: 'Extremely Rare', color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30' },
  unique:         { label: 'Unique',         color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
};

export const DIFFICULTY_META: Record<VerificationDifficulty, { label: string; color: string }> = {
  easy:     { label: 'Easy',     color: 'text-green-400' },
  moderate: { label: 'Moderate', color: 'text-amber-400' },
  expert:   { label: 'Expert',   color: 'text-red-400' },
};

// ---- Seed Data ----

const FAMOUS_ERROR_CARDS: ErrorCard[] = [
  {
    id: 'err_001',
    player: 'Billy Ripken',
    year: 1989,
    set: 'Fleer',
    manufacturer: 'Fleer',
    errorType: 'misprint',
    description: 'The infamous "FF" knob bat error — obscene phrase written on bat knob visible in photo. Multiple corrected versions exist including black box, white-out, and scribble variations.',
    rarity: 'rare',
    normalValue: 0.5,
    errorValue: 3000,
    premiumMultiplier: 6000,
    knownPopulation: 250,
    identificationTips: [
      'Look at the bat knob in the photo — the uncensored version shows "F*** Face" written clearly',
      'Multiple corrected versions exist: black box, white-out scribble, black scribble, airbrushed',
      'The uncensored version is the most valuable — check with magnification',
      'PSA population of graded copies is under 300 total',
    ],
    verificationDifficulty: 'easy',
  },
  {
    id: 'err_002',
    player: 'Fernando Tatis Jr.',
    year: 2019,
    set: 'Topps Series 2',
    manufacturer: 'Topps',
    errorType: 'photo_variation',
    description: 'Short print photo variation showing Tatis Jr. with a different batting stance. The SP version shows him mid-swing with a follow-through while the base version shows him in a ready stance.',
    rarity: 'scarce',
    normalValue: 15,
    errorValue: 500,
    premiumMultiplier: 33.3,
    knownPopulation: 800,
    identificationTips: [
      'Compare batting stance — SP shows full swing follow-through vs. ready stance',
      'Check the card code on the back — SP versions end in different print run codes',
      'The SP will have a slightly different background coloring in the stands',
      'Look for the Topps SP code on the back: usually a longer card number string',
    ],
    verificationDifficulty: 'moderate',
  },
  {
    id: 'err_003',
    player: 'Ronald Acuna Jr.',
    year: 2018,
    set: 'Topps Update',
    manufacturer: 'Topps',
    errorType: 'sp',
    description: 'The "bat down" SP variation of Acuna\'s rookie card. Base version shows him in fielding pose, SP shows him with bat pointed down after a swing. One of the key modern SP rookies.',
    rarity: 'scarce',
    normalValue: 40,
    errorValue: 1200,
    premiumMultiplier: 30,
    knownPopulation: 600,
    identificationTips: [
      'Base version: Acuna in fielding pose in the outfield',
      'SP version: Acuna holding bat pointed toward the ground post-swing',
      'Check the card number on the back — SP has a longer code ending',
      'SP version is noticeably different at a glance — this is not a subtle variation',
    ],
    verificationDifficulty: 'easy',
  },
  {
    id: 'err_004',
    player: 'Ichiro Suzuki',
    year: 2001,
    set: 'Topps',
    manufacturer: 'Topps',
    errorType: 'sp',
    description: 'Ichiro SP rookie variation from 2001 Topps. The SP version shows a different photo with Ichiro batting from a different angle. A modern classic that has steadily appreciated.',
    rarity: 'rare',
    normalValue: 25,
    errorValue: 800,
    premiumMultiplier: 32,
    knownPopulation: 450,
    identificationTips: [
      'Base version shows Ichiro in a standard batting pose from the right side',
      'SP version has a distinctly different camera angle — more close-up on the face',
      'Compare with checklists online — the photo difference is clear when you know what to look for',
      'Check the fine print card number — SP will have additional code digits',
    ],
    verificationDifficulty: 'moderate',
  },
  {
    id: 'err_005',
    player: 'Dale Murphy',
    year: 1987,
    set: 'Topps',
    manufacturer: 'Topps',
    errorType: 'reversed_negative',
    description: 'The image on the card was printed from a reversed negative, making it appear as a mirror image. Murphy appears to be batting left-handed when he was a right-handed batter.',
    rarity: 'common_error',
    normalValue: 1,
    errorValue: 25,
    premiumMultiplier: 25,
    knownPopulation: 5000,
    identificationTips: [
      'Murphy appears to be batting left-handed — he was a right-handed hitter',
      'Team logo on jersey/helmet may appear backwards or mirrored',
      'Compare the card to other Murphy cards from the same year for reference',
      'This is a common printing error for 1987 Topps — several other cards affected',
    ],
    verificationDifficulty: 'easy',
  },
  {
    id: 'err_006',
    player: 'Juan Gonzalez',
    year: 1990,
    set: 'Topps',
    manufacturer: 'Topps',
    errorType: 'wrong_photo',
    description: 'Card #331 features a photo of Juan Gonzalez but the name on the card front reads another player. A classic wrong-photo error from the junk wax era that still commands a premium.',
    rarity: 'scarce',
    normalValue: 0.5,
    errorValue: 40,
    premiumMultiplier: 80,
    knownPopulation: 3000,
    identificationTips: [
      'Compare the player in the photo to verified photos of Juan Gonzalez',
      'The name printed on the front does not match the player depicted',
      'Check the card number — #331 in 1990 Topps is the affected card',
      'Corrected versions were released later in the print run',
    ],
    verificationDifficulty: 'easy',
  },
  {
    id: 'err_007',
    player: 'Shohei Ohtani',
    year: 2018,
    set: 'Topps',
    manufacturer: 'Topps',
    errorType: 'ssp',
    description: 'Super short print variation of Ohtani\'s flagship Topps rookie. The SSP features a completely different photo showing Ohtani pitching instead of batting. Extremely difficult to pull from packs.',
    rarity: 'extremely_rare',
    normalValue: 80,
    errorValue: 5000,
    premiumMultiplier: 62.5,
    knownPopulation: 150,
    identificationTips: [
      'Base shows Ohtani in batting stance; SSP shows him mid-pitch delivery',
      'SSP has a distinctly different card code on the back — check Beckett for the specific number',
      'The photo is dramatically different, not subtle — you will notice immediately',
      'PSA pop is under 200 for the SSP in any grade',
    ],
    verificationDifficulty: 'moderate',
  },
  {
    id: 'err_008',
    player: 'Ken Griffey Jr.',
    year: 1989,
    set: 'Upper Deck',
    manufacturer: 'Upper Deck',
    errorType: 'color_variation',
    description: 'A rare color variation of the iconic Griffey Jr. Upper Deck rookie. Some copies were printed with a noticeably different hue on the card border, ranging from slightly purple-tinted to distinctly different.',
    rarity: 'rare',
    normalValue: 50,
    errorValue: 350,
    premiumMultiplier: 7,
    knownPopulation: 400,
    identificationTips: [
      'Compare the border color to a known standard copy side-by-side',
      'The color shift is most visible on the card border and team name area',
      'Some registry services note this variation specifically — check PSA/BGS registries',
      'Best viewed under natural daylight — artificial light can mask the difference',
    ],
    verificationDifficulty: 'expert',
  },
  {
    id: 'err_009',
    player: 'Frank Thomas',
    year: 1990,
    set: 'Topps',
    manufacturer: 'Topps',
    errorType: 'no_name',
    description: 'The "No Name on Front" error — Frank Thomas\' rookie card was printed without his name on the card front. One of the most famous modern error cards and a staple of the hobby.',
    rarity: 'rare',
    normalValue: 5,
    errorValue: 2500,
    premiumMultiplier: 500,
    knownPopulation: 300,
    identificationTips: [
      'The card front will have no player name printed at all — just the photo and team logo',
      'This is immediately obvious: compare to any normal 1990 Topps card which shows the name',
      'Back of the card still has all correct information including Thomas\' name',
      'Beware of counterfeits where the name has been chemically removed',
    ],
    verificationDifficulty: 'easy',
  },
  {
    id: 'err_010',
    player: 'Luka Doncic',
    year: 2018,
    set: 'Panini Prizm',
    manufacturer: 'Panini',
    errorType: 'sp',
    description: 'Short print base variation with a slightly different photo crop and jersey number visibility. The SP is much harder to pull and has been a strong performer in the modern card market.',
    rarity: 'scarce',
    normalValue: 200,
    errorValue: 2800,
    premiumMultiplier: 14,
    knownPopulation: 500,
    identificationTips: [
      'SP shows a tighter crop on Doncic — jersey number less visible than base',
      'Background detail differences between base and SP are subtle but distinct',
      'Check the print code on the back — SP will have a different code sequence',
      'Compare to the base at high resolution — the photo framing is different',
    ],
    verificationDifficulty: 'moderate',
  },
  {
    id: 'err_011',
    player: 'Jasson Dominguez',
    year: 2023,
    set: 'Topps Chrome',
    manufacturer: 'Topps',
    errorType: 'missing_foil',
    description: 'A printing error where the foil stamping on the card front was not applied. The Topps Chrome logo and player name appear without the expected foil layer, creating a flat matte look.',
    rarity: 'extremely_rare',
    normalValue: 30,
    errorValue: 600,
    premiumMultiplier: 20,
    knownPopulation: 50,
    identificationTips: [
      'The Topps Chrome logo on the front should be foil-stamped — on the error it appears flat/matte',
      'Player name text will also lack foil sheen',
      'Hold the card at an angle under light — a normal card will show foil reflection, the error will not',
      'Very limited population — fewer than 75 known to exist',
    ],
    verificationDifficulty: 'easy',
  },
  {
    id: 'err_012',
    player: 'Derek Jeter',
    year: 1993,
    set: 'SP',
    manufacturer: 'Upper Deck',
    errorType: 'sp',
    description: 'Jeter\'s iconic 1993 SP rookie is technically a short print itself — card #279 in the SP set was printed in lower quantities. The foil version is especially scarce and highly sought after.',
    rarity: 'rare',
    normalValue: 100,
    errorValue: 1500,
    premiumMultiplier: 15,
    knownPopulation: 800,
    identificationTips: [
      'Card #279 in the 1993 Upper Deck SP set is the key card',
      'Look for clean foil stamping and sharp corners for grading potential',
      'The SP version has a distinct holographic foil element not present in base Upper Deck',
      'Centering on this card is notoriously poor — well-centered copies command extra premium',
    ],
    verificationDifficulty: 'easy',
  },
  {
    id: 'err_013',
    player: 'Wander Franco',
    year: 2022,
    set: 'Topps Series 1',
    manufacturer: 'Topps',
    errorType: 'double_print',
    description: 'A double-printed base card where the image and text layer were printed twice with a slight offset, creating a visible ghost/shadow effect across the entire card front.',
    rarity: 'extremely_rare',
    normalValue: 10,
    errorValue: 200,
    premiumMultiplier: 20,
    knownPopulation: 35,
    identificationTips: [
      'Look for a visible shadow/ghost image — as if the entire card was printed twice',
      'Text will appear slightly doubled or blurred when examined closely',
      'Most visible on the player name and team name areas',
      'Use a loupe or magnifying glass to confirm the double impression on the print dots',
    ],
    verificationDifficulty: 'moderate',
  },
  {
    id: 'err_014',
    player: 'Patrick Mahomes',
    year: 2017,
    set: 'Panini Prizm',
    manufacturer: 'Panini',
    errorType: 'wrong_back',
    description: 'Mahomes rookie card with a completely wrong player\'s stats and bio on the back. Front shows Mahomes, back shows another player\'s information entirely. A true production error.',
    rarity: 'extremely_rare',
    normalValue: 250,
    errorValue: 4000,
    premiumMultiplier: 16,
    knownPopulation: 75,
    identificationTips: [
      'Front of the card correctly shows Patrick Mahomes',
      'Flip the card — the back will have a completely different player\'s stats and bio',
      'The card number on the back may not match the expected Mahomes number',
      'Document both sides with photos for authentication purposes',
    ],
    verificationDifficulty: 'easy',
  },
];

// ---- Variation Guides ----

const VARIATION_GUIDES: VariationGuide[] = [
  {
    setId: 'topps_2023_s1',
    setName: '2023 Topps Series 1',
    year: 2023,
    variations: [
      { cardNumber: '#1', type: 'sp', description: 'SP photo variation — horizontal layout', howToIdentify: 'Card is oriented horizontally instead of vertically. Check code on back.', estimatedPop: 500, valueMultiplier: 8 },
      { cardNumber: '#50', type: 'photo_variation', description: 'Shohei Ohtani photo variation — pitching vs batting', howToIdentify: 'Base shows batting, variation shows pitching delivery. Dramatically different photo.', estimatedPop: 300, valueMultiplier: 15 },
      { cardNumber: '#100', type: 'ssp', description: 'Mike Trout SSP — throwback jersey photo', howToIdentify: 'Trout wearing a throwback/retro jersey instead of current Angels uniform.', estimatedPop: 100, valueMultiplier: 25 },
      { cardNumber: '#150', type: 'sp', description: 'Aaron Judge SP — home run swing follow-through', howToIdentify: 'Different batting photo with crowd celebrating in background.', estimatedPop: 400, valueMultiplier: 10 },
      { cardNumber: '#215', type: 'photo_variation', description: 'Julio Rodriguez photo variation — sliding catch', howToIdentify: 'Base shows standard pose, variation shows diving/sliding catch in outfield.', estimatedPop: 350, valueMultiplier: 6 },
    ],
  },
  {
    setId: 'prizm_2023_nba',
    setName: '2023-24 Panini Prizm NBA',
    year: 2023,
    variations: [
      { cardNumber: '#1', type: 'sp', description: 'Victor Wembanyama SP — pre-draft photo', howToIdentify: 'Shows Wembanyama in international/pre-NBA jersey instead of Spurs uniform.', estimatedPop: 250, valueMultiplier: 20 },
      { cardNumber: '#75', type: 'color_variation', description: 'LeBron James Silver Prizm — color shift error', howToIdentify: 'Silver Prizm with a noticeable blue tint shift on the refractor pattern.', estimatedPop: 150, valueMultiplier: 5 },
      { cardNumber: '#200', type: 'ssp', description: 'Luka Doncic SSP — warm-up jacket photo', howToIdentify: 'Doncic in a warm-up jacket instead of game jersey. Very different from base.', estimatedPop: 80, valueMultiplier: 30 },
      { cardNumber: '#280', type: 'photo_variation', description: 'Jayson Tatum photo variation — championship celebration', howToIdentify: 'Base shows in-game action, variation shows celebration/trophy moment.', estimatedPop: 200, valueMultiplier: 8 },
    ],
  },
  {
    setId: 'topps_2024_s1',
    setName: '2024 Topps Series 1',
    year: 2024,
    variations: [
      { cardNumber: '#10', type: 'sp', description: 'Elly De La Cruz SP — base running action', howToIdentify: 'Base shows batting pose, SP shows him running the bases at full speed.', estimatedPop: 400, valueMultiplier: 12 },
      { cardNumber: '#78', type: 'ssp', description: 'Shohei Ohtani SSP — Dodgers debut photo', howToIdentify: 'Features Ohtani in Dodgers uniform from his debut. Extremely limited print run.', estimatedPop: 75, valueMultiplier: 50 },
      { cardNumber: '#120', type: 'photo_variation', description: 'Gunnar Henderson photo variation — spring training', howToIdentify: 'Shows Henderson in a spring training setting with different backdrop.', estimatedPop: 350, valueMultiplier: 5 },
      { cardNumber: '#225', type: 'sp', description: 'Corbin Carroll SP — Gold Glove celebration', howToIdentify: 'SP shows Carroll holding/celebrating with Gold Glove award. Check back code.', estimatedPop: 300, valueMultiplier: 8 },
      { cardNumber: '#300', type: 'missing_foil', description: 'Jackson Holliday missing foil error', howToIdentify: 'Topps logo and name lack foil treatment. Hold at angle — no reflection on text.', estimatedPop: 25, valueMultiplier: 35 },
    ],
  },
];

// ---- localStorage helpers ----

function loadErrorCards(): ErrorCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ErrorCard[];
  } catch {
    return [];
  }
}

function saveErrorCards(cards: ErrorCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // quota exceeded
  }
}

function loadAlerts(): ErrorAlert[] {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ErrorAlert[];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: ErrorAlert[]): void {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts.slice(-50)));
  } catch {
    // quota exceeded
  }
}

// ---- Public API ----

export function getErrorCards(): ErrorCard[] {
  const stored = loadErrorCards();
  if (stored.length > 0) return stored;
  // Seed with famous error cards on first load
  saveErrorCards(FAMOUS_ERROR_CARDS);
  return FAMOUS_ERROR_CARDS;
}

export function getVariationGuide(year?: number, set?: string): VariationGuide[] {
  let guides = [...VARIATION_GUIDES];
  if (year) {
    guides = guides.filter(g => g.year === year);
  }
  if (set) {
    const lower = set.toLowerCase();
    guides = guides.filter(g => g.setName.toLowerCase().includes(lower));
  }
  return guides;
}

export function getErrorAlerts(): ErrorAlert[] {
  const stored = loadAlerts();
  if (stored.length > 0) return stored;

  // Generate seed alerts
  const cards = getErrorCards();
  const now = new Date();
  const seedAlerts: ErrorAlert[] = [
    {
      id: 'alert_001',
      type: 'new_discovery',
      card: cards[10] ?? cards[0], // Jasson Dominguez missing foil
      message: 'New missing foil error discovered for 2023 Topps Chrome Jasson Dominguez. Only 3 confirmed copies so far — could be extremely rare.',
      date: new Date(now.getTime() - 2 * 3600000).toISOString(),
      urgency: 'critical',
    },
    {
      id: 'alert_002',
      type: 'price_spike',
      card: cards[0], // Ripken
      message: '1989 Fleer Billy Ripken "FF" error saw a 40% price spike after a PSA 10 sold for $4,800 at Goldin auction this week.',
      date: new Date(now.getTime() - 8 * 3600000).toISOString(),
      urgency: 'high',
    },
    {
      id: 'alert_003',
      type: 'market_opportunity',
      card: cards[6], // Ohtani SSP
      message: 'Multiple 2018 Topps Ohtani SSP copies listed below recent comp prices on eBay. Potential buying opportunity.',
      date: new Date(now.getTime() - 24 * 3600000).toISOString(),
      urgency: 'high',
    },
    {
      id: 'alert_004',
      type: 'verification_needed',
      card: cards[7], // Griffey color variation
      message: 'Community reports of a potential new color variation for 1989 Upper Deck Griffey Jr. — needs expert verification. Purple tint on card back reported.',
      date: new Date(now.getTime() - 48 * 3600000).toISOString(),
      urgency: 'medium',
    },
    {
      id: 'alert_005',
      type: 'new_discovery',
      card: cards[12], // Franco double print
      message: 'Additional copies of the 2022 Topps Wander Franco double print error found in a case break. Pop may be higher than originally estimated.',
      date: new Date(now.getTime() - 72 * 3600000).toISOString(),
      urgency: 'low',
    },
    {
      id: 'alert_006',
      type: 'price_spike',
      card: cards[2], // Acuna SP
      message: '2018 Topps Update Acuna "bat down" SP surged 25% after his strong postseason performance. Demand increasing.',
      date: new Date(now.getTime() - 96 * 3600000).toISOString(),
      urgency: 'medium',
    },
  ];

  saveAlerts(seedAlerts);
  return seedAlerts;
}

export function searchForErrors(player?: string, year?: number, set?: string): ErrorCard[] {
  const cards = getErrorCards();
  return cards.filter(c => {
    if (player && !c.player.toLowerCase().includes(player.toLowerCase())) return false;
    if (year && c.year !== year) return false;
    if (set && !c.set.toLowerCase().includes(set.toLowerCase()) && !c.manufacturer.toLowerCase().includes(set.toLowerCase())) return false;
    return true;
  });
}

export function getErrorCardStats(): ErrorCardStats {
  const cards = getErrorCards();
  const alerts = getErrorAlerts();
  const guides = getVariationGuide();

  const totalVariations = guides.reduce((sum, g) => sum + g.variations.length, 0);
  const premiums = cards.map(c => c.premiumMultiplier);
  const avgPremium = premiums.length > 0 ? premiums.reduce((a, b) => a + b, 0) / premiums.length : 0;
  const highestPremium = premiums.length > 0 ? Math.max(...premiums) : 0;
  const recentDiscoveries = alerts.filter(a => a.type === 'new_discovery').length;

  return {
    totalCataloged: cards.length + totalVariations,
    totalErrors: cards.length,
    totalVariations,
    avgPremium: Math.round(avgPremium * 10) / 10,
    highestPremium,
    recentDiscoveries,
  };
}
