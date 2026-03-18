// Phase 157 – Error Card & Misprint Database Service

import { store } from '../dal/syncStore';

// ---- Types ----

export type ErrorType = 'misprint' | 'miscut' | 'wrong_back' | 'double_print' | 'no_name' | 'inverted' | 'color_variation' | 'blank_back' | 'test_print' | 'reversed_negative' | 'wrong_photo' | 'missing_foil' | 'sp' | 'ssp' | 'photo_variation';

export interface ErrorCard {
  id: string;
  cardName: string;
  year: number;
  brand: string;
  sport: string;
  errorType: ErrorType;
  description: string;
  baseValue: number;
  errorPremium: number;
  multiplier: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'unique' | 'extremely_rare' | 'scarce' | 'common_error';
  verified: boolean;
  imageNotes: string;
  discoveryDate: string;
  // Extended fields used by page components
  player: string;
  set: string;
  manufacturer: string;
  normalValue: number;
  errorValue: number;
  premiumMultiplier: number;
  knownPopulation: number;
  verificationDifficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  identificationTips: string[];
}

export interface ErrorCategory {
  errorType: ErrorType;
  label: string;
  description: string;
  avgMultiplier: number;
  knownCount: number;
  collectability: number;
}

export interface ValueMultiplier {
  errorType: ErrorType;
  minMultiplier: number;
  maxMultiplier: number;
  avgMultiplier: number;
  factors: string[];
}

export interface IdentificationGuide {
  errorType: ErrorType;
  whatToLookFor: string[];
  commonExamples: string[];
  toolsNeeded: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface NotableError {
  id: string;
  cardName: string;
  year: number;
  brand: string;
  errorType: ErrorType;
  story: string;
  peakValue: number;
  currentValue: number;
  discoveredBy: string;
  discoveryYear: number;
}

export interface RecentDiscovery {
  id: string;
  cardName: string;
  year: number;
  brand: string;
  errorType: ErrorType;
  description: string;
  estimatedValue: number;
  discoveryDate: string;
  reportedBy: string;
  status: VerificationStatus;
}

export type VerificationStatus = 'pending' | 'confirmed' | 'debunked' | 'under_review';

export interface ErrorSet {
  name: string;
  year: number;
  brand: string;
  knownErrors: number;
  mostValuable: string;
  topValue: number;
}

export interface RarityEstimate {
  errorType: ErrorType;
  estimatedSurvivingCount: number;
  totalPrinted: number;
  survivalRate: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface MarketPremium {
  errorType: ErrorType;
  sport: string;
  avgPremiumPct: number;
  recentSales: number;
  demandTrend: 'hot' | 'warm' | 'stable' | 'cooling';
}

export interface CommunityReport {
  id: string;
  reporterName: string;
  cardName: string;
  year: number;
  brand: string;
  errorType: ErrorType;
  description: string;
  status: VerificationStatus;
  submittedDate: string;
  votes: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_error_card';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.has(`${STORAGE_KEY}_${key}`) ? store.get<T>(`${STORAGE_KEY}_${key}`, null as unknown as T) : null;
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Mock Data ----

const DIFFICULTY_BY_ERROR: Record<ErrorType, 'easy' | 'moderate' | 'hard' | 'expert'> = {
  misprint: 'easy', miscut: 'easy', wrong_back: 'moderate', double_print: 'moderate',
  no_name: 'easy', inverted: 'easy', color_variation: 'hard', blank_back: 'easy', test_print: 'expert',
  reversed_negative: 'easy', wrong_photo: 'moderate', missing_foil: 'easy', sp: 'hard', ssp: 'expert', photo_variation: 'hard',
};

const TIPS_BY_ERROR: Record<ErrorType, string[]> = {
  misprint: ['Compare to standard version side by side', 'Check all text elements carefully', 'Look for missing foil stamps or logos'],
  miscut: ['Measure borders with a ruler', 'Look for portions of adjacent cards', 'Check centering against standard tolerances'],
  wrong_back: ['Always flip the card and verify player name and stats', 'Cross-reference card number with checklist', 'Compare bio info to front player'],
  double_print: ['Use magnification to check for ghost/shadow images', 'Look for offset text doubling', 'Compare image sharpness to standard version'],
  no_name: ['Check front for missing player name text', 'Look for blank areas where text should be', 'Compare to a corrected version'],
  inverted: ['Check for reversed or upside-down images/text', 'Look at jersey numbers for mirror imaging', 'Verify logo orientations'],
  color_variation: ['Use natural lighting for comparison', 'Place next to a standard version', 'Look for tint differences especially in borders and backgrounds'],
  blank_back: ['Simply flip the card over to check', 'Verify the back is completely blank, not just faded', 'Hold up to light to confirm no printing at all'],
  test_print: ['Look for registration/alignment marks', 'Check for missing serial numbers', 'Examine color scheme vs production version', 'Use UV light for hidden markings'],
  reversed_negative: ['Check if image is horizontally flipped', 'Look for mirrored jersey numbers or logos', 'Compare text orientation to standard version'],
  wrong_photo: ['Compare player face to known photos', 'Cross-reference jersey number with player', 'Check build and features against verified images'],
  missing_foil: ['Compare surface reflectivity to standard version', 'Card should be matte where foil is expected', 'Tilt under light to confirm absence of foil layer'],
  sp: ['Check back code suffix against SP code list', 'Compare photo to base version', 'Verify with checklist for known SP variations'],
  ssp: ['Check back code suffix against SSP code list', 'Photo is typically very different from base', 'Cross-reference with confirmed SSP databases'],
  photo_variation: ['Compare image crop and pose to base card', 'Look for different background or uniform', 'Check code on card back for variation identifier'],
};

function extractPlayerName(cardName: string): string {
  const cleaned = cardName.replace(/\s*#\d+\s*$/, '').replace(/\s*\/\d+\s*$/, '');
  const parts = cleaned.split(' ');
  // Remove year at start
  const withoutYear = parts[0] && /^\d{4}$/.test(parts[0]) ? parts.slice(1) : parts;
  // Remove brand (1-3 words typically before player name)
  // Heuristic: find known brand-end words and take remainder
  const brandEnders = ['Fleer', 'Donruss', 'Topps', 'Chrome', 'Prizm', 'Heritage', 'Select', 'Deck', 'Score', 'Set', 'Optic', 'Flair', 'Treasures', 'Flawless', 'Bowman'];
  let playerStart = 0;
  for (let i = 0; i < withoutYear.length; i++) {
    if (brandEnders.some(b => withoutYear[i].includes(b))) {
      playerStart = i + 1;
    }
  }
  const playerParts = withoutYear.slice(playerStart);
  // Remove trailing suffixes like "FF", "RC", "Wrong Back", etc.
  const suffixes = ['FF', 'RC', 'Wrong', 'Reverse', 'Negative', 'No', 'Name', 'Missing', 'Foil', 'Stamping', 'Double', 'Print', 'Blank', 'Back', 'Test', 'Color', 'Shift', 'Miscut', 'Inverted', 'Image', 'Printing', 'Error', 'Both', 'Sports', 'Position', 'Prizm', 'Pattern', 'Double-Sided', 'Front', 'Severe', 'Anomaly', 'Die-Cut', 'Bleed', 'Refractor', 'Swap', 'Auto', 'Batch', 'Parallel', 'Sheet', 'SP', 'Leak', 'Strike', 'Silver', 'Misaligned', 'Coating', 'Various', 'Switcheroo', 'Logo', 'Marks', 'Visible', 'Alignment', 'UV', 'Young', 'Guns', 'Patch', 'Card', 'Tie-Dye'];
  const name: string[] = [];
  for (const p of playerParts) {
    if (suffixes.includes(p) || /^\(/.test(p)) break;
    name.push(p);
  }
  return name.join(' ') || playerParts.slice(0, 2).join(' ') || 'Unknown';
}

function enrichErrorCard(raw: Omit<ErrorCard, 'player' | 'set' | 'manufacturer' | 'normalValue' | 'errorValue' | 'premiumMultiplier' | 'knownPopulation' | 'verificationDifficulty' | 'identificationTips'>): ErrorCard {
  const player = extractPlayerName(raw.cardName);
  const setName = `${raw.year} ${raw.brand}`;
  return {
    ...raw,
    player,
    set: setName,
    manufacturer: raw.brand.split(' ')[0],
    normalValue: raw.baseValue,
    errorValue: raw.errorPremium,
    premiumMultiplier: raw.multiplier,
    knownPopulation: Math.max(1, Math.floor(Math.random() * 500) + 1),
    verificationDifficulty: DIFFICULTY_BY_ERROR[raw.errorType],
    identificationTips: TIPS_BY_ERROR[raw.errorType],
  } as ErrorCard;
}

// Seed the random for deterministic population counts
const _seedPops = [47, 120, 15, 340, 85, 200, 8, 95, 3, 12, 450, 28, 160, 300, 5, 220, 35, 2, 180, 75, 6, 110, 250, 400, 20, 310, 55, 1, 130, 10, 280, 42, 190, 65, 22, 150, 380, 18, 4, 90, 500, 33, 100, 260, 14, 70, 30, 7, 210, 50];

const RAW_ERROR_CARDS: Array<Omit<ErrorCard, 'player' | 'set' | 'manufacturer' | 'normalValue' | 'errorValue' | 'premiumMultiplier' | 'knownPopulation' | 'verificationDifficulty' | 'identificationTips'>> = [
  { id: 'ec_001', cardName: '1989 Fleer Billy Ripken FF', year: 1989, brand: 'Fleer', sport: 'Baseball', errorType: 'misprint', description: 'Obscenity written on bat knob clearly visible on card. Multiple corrected versions exist.', baseValue: 2, errorPremium: 3000, multiplier: 1500, rarity: 'legendary', verified: true, imageNotes: 'Look at bat knob for obscene text', discoveryDate: '1989-02-01' },
  { id: 'ec_002', cardName: '1990 Donruss Reverse Negative Nolan Ryan', year: 1990, brand: 'Donruss', sport: 'Baseball', errorType: 'inverted', description: 'Card printed with reverse negative image, creating mirror-image photo.', baseValue: 1, errorPremium: 250, multiplier: 250, rarity: 'rare', verified: true, imageNotes: 'Image appears as photographic negative', discoveryDate: '1990-03-15' },
  { id: 'ec_003', cardName: '2024 Topps Chrome Missing Foil Stamping', year: 2024, brand: 'Topps Chrome', sport: 'Baseball', errorType: 'misprint', description: 'Missing foil Topps Chrome logo on front. Several confirmed from Series 1 print run.', baseValue: 3, errorPremium: 150, multiplier: 50, rarity: 'rare', verified: true, imageNotes: 'No foil stamp where Topps Chrome logo should be', discoveryDate: '2024-08-10' },
  { id: 'ec_004', cardName: '1989 Upper Deck Dale Murphy Reverse Negative #357', year: 1989, brand: 'Upper Deck', sport: 'Baseball', errorType: 'inverted', description: 'Photo printed as reverse negative. First year of Upper Deck production had several errors.', baseValue: 1, errorPremium: 75, multiplier: 75, rarity: 'uncommon', verified: true, imageNotes: 'Check for reversed/negative image of Murphy', discoveryDate: '1989-06-01' },
  { id: 'ec_005', cardName: '1990 Topps Frank Thomas No Name on Front #414', year: 1990, brand: 'Topps', sport: 'Baseball', errorType: 'no_name', description: 'Missing name on card front. One of the most iconic error cards in the hobby.', baseValue: 1, errorPremium: 800, multiplier: 800, rarity: 'legendary', verified: true, imageNotes: 'Front has no player name printed', discoveryDate: '1990-04-01' },
  { id: 'ec_006', cardName: '1969 Topps Aurelio Rodriguez/Angel Bravo #653', year: 1969, brand: 'Topps', sport: 'Baseball', errorType: 'misprint', description: 'Photo shows batboy Angel Bravo instead of Aurelio Rodriguez.', baseValue: 5, errorPremium: 200, multiplier: 40, rarity: 'rare', verified: true, imageNotes: 'Wrong player photo on card', discoveryDate: '1969-08-01' },
  { id: 'ec_007', cardName: '2020 Panini Prizm Tua Tagovailoa Wrong Back', year: 2020, brand: 'Panini Prizm', sport: 'Football', errorType: 'wrong_back', description: 'Card back has Justin Herbert stats and bio instead of Tua.', baseValue: 20, errorPremium: 500, multiplier: 25, rarity: 'very_rare', verified: true, imageNotes: 'Compare back text to front player', discoveryDate: '2020-11-15' },
  { id: 'ec_008', cardName: '1985 Topps Pete Rose Wrong Back #600', year: 1985, brand: 'Topps', sport: 'Baseball', errorType: 'wrong_back', description: 'Card back contains Gary Carter stats instead of Pete Rose.', baseValue: 3, errorPremium: 150, multiplier: 50, rarity: 'rare', verified: true, imageNotes: 'Back shows Carter bio on Rose card', discoveryDate: '1985-05-01' },
  { id: 'ec_009', cardName: '2023 Topps Chrome Victor Wembanyama Double Print', year: 2023, brand: 'Topps Chrome', sport: 'Basketball', errorType: 'double_print', description: 'Double-printed front image creating ghost/shadow effect.', baseValue: 15, errorPremium: 400, multiplier: 27, rarity: 'very_rare', verified: true, imageNotes: 'Look for doubled/ghost image on front', discoveryDate: '2023-12-05' },
  { id: 'ec_010', cardName: '1962 Topps Babe Ruth Green Tint #139', year: 1962, brand: 'Topps', sport: 'Baseball', errorType: 'color_variation', description: 'Unique green color tint variation not seen in standard print run.', baseValue: 100, errorPremium: 2500, multiplier: 25, rarity: 'legendary', verified: true, imageNotes: 'Compare to standard version for green tint', discoveryDate: '1962-06-01' },
  { id: 'ec_011', cardName: '1991 Donruss Elite Series Ricky Henderson Blank Back', year: 1991, brand: 'Donruss', sport: 'Baseball', errorType: 'blank_back', description: 'Card back is completely blank white. Escaped quality control.', baseValue: 10, errorPremium: 350, multiplier: 35, rarity: 'very_rare', verified: true, imageNotes: 'Back is entirely blank/white', discoveryDate: '1991-07-15' },
  { id: 'ec_012', cardName: '1957 Topps Ted Williams Test Print', year: 1957, brand: 'Topps', sport: 'Baseball', errorType: 'test_print', description: 'Pre-production test print with different color scheme and no card number.', baseValue: 500, errorPremium: 15000, multiplier: 30, rarity: 'legendary', verified: true, imageNotes: 'Different color scheme, no card number', discoveryDate: '1972-01-01' },
  { id: 'ec_013', cardName: '2022 Panini Prizm Ja Morant Miscut #55', year: 2022, brand: 'Panini Prizm', sport: 'Basketball', errorType: 'miscut', description: 'Severely miscut showing portions of adjacent cards on both sides.', baseValue: 5, errorPremium: 120, multiplier: 24, rarity: 'uncommon', verified: true, imageNotes: 'Card shows portions of adjacent cards', discoveryDate: '2022-09-20' },
  { id: 'ec_014', cardName: '1990 Score Bo Jackson Both Sports Wrong Back', year: 1990, brand: 'Score', sport: 'Baseball', errorType: 'wrong_back', description: 'Baseball card with football stats on back, fitting for the dual-sport athlete.', baseValue: 1, errorPremium: 45, multiplier: 45, rarity: 'uncommon', verified: true, imageNotes: 'Football stats on baseball card back', discoveryDate: '1990-05-01' },
  { id: 'ec_015', cardName: '2021 Topps Chrome Kyle Tucker Magenta Printing Plate', year: 2021, brand: 'Topps Chrome', sport: 'Baseball', errorType: 'test_print', description: 'Magenta printing plate card, 1/1 from production process.', baseValue: 5, errorPremium: 600, multiplier: 120, rarity: 'legendary', verified: true, imageNotes: 'Single color magenta printing plate', discoveryDate: '2021-10-15' },
  { id: 'ec_016', cardName: '1989 Fleer Logo on Back Upside Down Randy Johnson', year: 1989, brand: 'Fleer', sport: 'Baseball', errorType: 'inverted', description: 'Fleer logo printed upside down on card back. Multiple confirmed copies.', baseValue: 2, errorPremium: 60, multiplier: 30, rarity: 'uncommon', verified: true, imageNotes: 'Check Fleer logo orientation on back', discoveryDate: '1989-04-01' },
  { id: 'ec_017', cardName: '2024 Bowman Chrome Missing Refractor Coating', year: 2024, brand: 'Bowman Chrome', sport: 'Baseball', errorType: 'misprint', description: 'Bowman Chrome card without the characteristic refractor coating, appearing matte.', baseValue: 5, errorPremium: 200, multiplier: 40, rarity: 'rare', verified: true, imageNotes: 'Card appears flat/matte instead of refractor finish', discoveryDate: '2024-10-01' },
  { id: 'ec_018', cardName: '2019 Panini National Treasures Zion Williamson Miscut RPA', year: 2019, brand: 'Panini National Treasures', sport: 'Basketball', errorType: 'miscut', description: 'Severely miscut Rookie Patch Auto. Even with error, patch and auto intact.', baseValue: 5000, errorPremium: 2000, multiplier: 1.4, rarity: 'very_rare', verified: true, imageNotes: 'Miscut but patch and auto still visible', discoveryDate: '2020-01-15' },
  { id: 'ec_019', cardName: '1977 Topps Dale Murphy Double Print #476', year: 1977, brand: 'Topps', sport: 'Baseball', errorType: 'double_print', description: 'Double-printed front with offset ghost image. Early Murphy RC error.', baseValue: 50, errorPremium: 400, multiplier: 8, rarity: 'rare', verified: true, imageNotes: 'Ghost/shadow double image on front', discoveryDate: '1977-07-01' },
  { id: 'ec_020', cardName: '2023 Topps Heritage Shohei Ohtani Color Swap #1', year: 2023, brand: 'Topps Heritage', sport: 'Baseball', errorType: 'color_variation', description: 'Team name printed in wrong color, blue instead of red for Angels.', baseValue: 10, errorPremium: 300, multiplier: 30, rarity: 'rare', verified: true, imageNotes: 'Compare team name color to standard version', discoveryDate: '2023-03-20' },
  { id: 'ec_021', cardName: '2015 Topps Chrome Kris Bryant No Name Error', year: 2015, brand: 'Topps Chrome', sport: 'Baseball', errorType: 'no_name', description: 'Missing player name on front of rookie card. Very limited quantity found.', baseValue: 30, errorPremium: 1200, multiplier: 40, rarity: 'very_rare', verified: true, imageNotes: 'No name text on card front', discoveryDate: '2015-09-01' },
  { id: 'ec_022', cardName: '2022 Panini Prizm Patrick Mahomes Inverted Image', year: 2022, brand: 'Panini Prizm', sport: 'Football', errorType: 'inverted', description: 'Player photo printed inverted (mirror image). Jersey number reads backwards.', baseValue: 8, errorPremium: 350, multiplier: 44, rarity: 'rare', verified: true, imageNotes: 'Jersey number and text appears reversed', discoveryDate: '2022-11-10' },
  { id: 'ec_023', cardName: '1987 Topps Barry Bonds Wrong Back #320', year: 1987, brand: 'Topps', sport: 'Baseball', errorType: 'wrong_back', description: 'Back of card shows Johnny Ray stats instead of Bonds RC stats.', baseValue: 15, errorPremium: 200, multiplier: 13, rarity: 'rare', verified: true, imageNotes: 'Back has Johnny Ray data', discoveryDate: '1987-05-01' },
  { id: 'ec_024', cardName: '2024 Topps Series 1 Blank Back Parallel', year: 2024, brand: 'Topps', sport: 'Baseball', errorType: 'blank_back', description: 'Complete blank back, white cardboard. Found in multiple hobby boxes.', baseValue: 1, errorPremium: 80, multiplier: 80, rarity: 'uncommon', verified: true, imageNotes: 'Back is entirely blank', discoveryDate: '2024-02-14' },
  { id: 'ec_025', cardName: '2023 Panini Select Connor Bedard Miscut Die-Cut', year: 2023, brand: 'Panini Select', sport: 'Hockey', errorType: 'miscut', description: 'Die-cut concourse pattern severely misaligned on this RC. Pattern shifted left.', baseValue: 25, errorPremium: 350, multiplier: 14, rarity: 'rare', verified: true, imageNotes: 'Die-cut pattern is off-center/misaligned', discoveryDate: '2024-01-20' },
  { id: 'ec_026', cardName: '1991 Pro Set Hockey Blank Back Wayne Gretzky', year: 1991, brand: 'Pro Set', sport: 'Hockey', errorType: 'blank_back', description: 'Gretzky card with completely blank back. Pro Set known for production issues.', baseValue: 2, errorPremium: 100, multiplier: 50, rarity: 'uncommon', verified: true, imageNotes: 'Back is entirely blank white', discoveryDate: '1991-10-01' },
  { id: 'ec_027', cardName: '2020 Donruss Optic Justin Herbert Double Strike Auto', year: 2020, brand: 'Donruss Optic', sport: 'Football', errorType: 'double_print', description: 'Autograph appears doubled with slight offset, creating shadow signature.', baseValue: 200, errorPremium: 800, multiplier: 4, rarity: 'very_rare', verified: true, imageNotes: 'Autograph has ghost/double impression', discoveryDate: '2021-02-15' },
  { id: 'ec_028', cardName: '1968 Topps Nolan Ryan Wrong Back (Jerry Koosman)', year: 1968, brand: 'Topps', sport: 'Baseball', errorType: 'wrong_back', description: 'Ryan/Koosman RC card with wrong back stats. One of the most valuable error cards.', baseValue: 3000, errorPremium: 12000, multiplier: 4, rarity: 'legendary', verified: true, imageNotes: 'Back shows incorrect player stats', discoveryDate: '1968-09-01' },
  { id: 'ec_029', cardName: '2022 Topps Chrome Julio Rodriguez Color Shift', year: 2022, brand: 'Topps Chrome', sport: 'Baseball', errorType: 'color_variation', description: 'Significant color shift making card appear with blue/purple tint instead of standard.', baseValue: 20, errorPremium: 300, multiplier: 15, rarity: 'rare', verified: true, imageNotes: 'Noticeable blue/purple tint vs standard', discoveryDate: '2022-10-05' },
  { id: 'ec_030', cardName: '2023 Prizm NBA Chet Holmgren Test Print', year: 2023, brand: 'Panini Prizm', sport: 'Basketball', errorType: 'test_print', description: 'Pre-production test print with alignment marks and no serial number.', baseValue: 10, errorPremium: 500, multiplier: 50, rarity: 'legendary', verified: true, imageNotes: 'Has alignment marks, missing serial', discoveryDate: '2023-06-01' },
  { id: 'ec_031', cardName: '1982 Topps Cal Ripken Jr Wrong Position #21', year: 1982, brand: 'Topps', sport: 'Baseball', errorType: 'misprint', description: 'Listed as 3B when Ripken played SS. Corrected version also exists.', baseValue: 100, errorPremium: 300, multiplier: 3, rarity: 'uncommon', verified: true, imageNotes: 'Position listed as 3B not SS', discoveryDate: '1982-04-01' },
  { id: 'ec_032', cardName: '2021 Panini Prizm Trevor Lawrence Missing Prizm Pattern', year: 2021, brand: 'Panini Prizm', sport: 'Football', errorType: 'misprint', description: 'Base Prizm card without the characteristic prismatic pattern, appears plain.', baseValue: 8, errorPremium: 180, multiplier: 23, rarity: 'rare', verified: true, imageNotes: 'Card lacks standard prismatic refraction', discoveryDate: '2021-10-10' },
  { id: 'ec_033', cardName: '1995 Flair Kevin Garnett Double-Sided Front', year: 1995, brand: 'Flair', sport: 'Basketball', errorType: 'double_print', description: 'Both sides of card have front image, no stats on back.', baseValue: 20, errorPremium: 600, multiplier: 30, rarity: 'very_rare', verified: true, imageNotes: 'Both sides show front image', discoveryDate: '1995-12-01' },
  { id: 'ec_034', cardName: '2024 Topps Heritage Gunnar Henderson Blank Back SP', year: 2024, brand: 'Topps Heritage', sport: 'Baseball', errorType: 'blank_back', description: 'Short print with completely blank back. Only a handful discovered.', baseValue: 15, errorPremium: 400, multiplier: 27, rarity: 'very_rare', verified: true, imageNotes: 'Back is blank white cardstock', discoveryDate: '2024-04-05' },
  { id: 'ec_035', cardName: '2023 Upper Deck Connor McDavid Color Bleed', year: 2023, brand: 'Upper Deck', sport: 'Hockey', errorType: 'color_variation', description: 'Severe color bleeding on jersey creating unique purple bleed effect.', baseValue: 10, errorPremium: 200, multiplier: 20, rarity: 'rare', verified: true, imageNotes: 'Purple color bleeding on jersey area', discoveryDate: '2023-11-15' },
  { id: 'ec_036', cardName: '2020 Topps Chrome Luis Robert Miscut Refractor', year: 2020, brand: 'Topps Chrome', sport: 'Baseball', errorType: 'miscut', description: 'Refractor with 60% off-center cut, showing adjacent card edge.', baseValue: 15, errorPremium: 100, multiplier: 7, rarity: 'uncommon', verified: true, imageNotes: 'Heavily off-center, shows adjacent card', discoveryDate: '2020-08-20' },
  { id: 'ec_037', cardName: '1990 Fleer Joe Montana Miscut #10', year: 1990, brand: 'Fleer', sport: 'Football', errorType: 'miscut', description: 'Extreme miscut showing full card above. Classic football error.', baseValue: 2, errorPremium: 50, multiplier: 25, rarity: 'uncommon', verified: true, imageNotes: 'Shows large portion of card above', discoveryDate: '1990-09-01' },
  { id: 'ec_038', cardName: '2025 Bowman 1st Chrome Test Print Ethan Salas', year: 2025, brand: 'Bowman Chrome', sport: 'Baseball', errorType: 'test_print', description: 'Pre-production test print found in packaging. No foil, registration marks visible.', baseValue: 50, errorPremium: 1500, multiplier: 30, rarity: 'legendary', verified: true, imageNotes: 'Registration marks, no foil stamp', discoveryDate: '2025-06-15' },
  { id: 'ec_039', cardName: '2022 Panini Flawless Luka Doncic Wrong Back Patch', year: 2022, brand: 'Panini Flawless', sport: 'Basketball', errorType: 'wrong_back', description: 'Patch card with wrong player bio on back (shows Trae Young info).', baseValue: 800, errorPremium: 2000, multiplier: 2.5, rarity: 'very_rare', verified: true, imageNotes: 'Back text is for Trae Young', discoveryDate: '2022-12-20' },
  { id: 'ec_040', cardName: '1971 Topps Pete Rose Color Variation #100', year: 1971, brand: 'Topps', sport: 'Baseball', errorType: 'color_variation', description: 'Darker red tint variation on card border. Subtle but confirmed by multiple experts.', baseValue: 80, errorPremium: 400, multiplier: 5, rarity: 'rare', verified: true, imageNotes: 'Compare border color to standard version', discoveryDate: '1975-01-01' },
  { id: 'ec_041', cardName: '2024 Panini Prizm Caleb Williams No Name Error', year: 2024, brand: 'Panini Prizm', sport: 'Football', errorType: 'no_name', description: 'Missing player name on front of highly anticipated RC.', baseValue: 10, errorPremium: 500, multiplier: 50, rarity: 'very_rare', verified: true, imageNotes: 'No player name text on front', discoveryDate: '2024-12-01' },
  { id: 'ec_042', cardName: '1986 Fleer Michael Jordan Inverted Back #57', year: 1986, brand: 'Fleer', sport: 'Basketball', errorType: 'inverted', description: 'Card back text printed upside down. Extremely rare on this iconic RC.', baseValue: 5000, errorPremium: 25000, multiplier: 5, rarity: 'legendary', verified: true, imageNotes: 'Back text and stats upside down', discoveryDate: '1987-01-01' },
  { id: 'ec_043', cardName: '2019 Topps Chrome Fernando Tatis Jr Double Refractor', year: 2019, brand: 'Topps Chrome', sport: 'Baseball', errorType: 'double_print', description: 'Double refractor layer creating unusual rainbow shimmer effect.', baseValue: 40, errorPremium: 500, multiplier: 13, rarity: 'rare', verified: true, imageNotes: 'Unusual double-layer refraction pattern', discoveryDate: '2019-08-15' },
  { id: 'ec_044', cardName: '2023 Topps Series 2 Missing Team Logo Various', year: 2023, brand: 'Topps', sport: 'Baseball', errorType: 'misprint', description: 'Missing team logo on several cards from Series 2 print run.', baseValue: 1, errorPremium: 30, multiplier: 30, rarity: 'uncommon', verified: true, imageNotes: 'No team logo where it should appear', discoveryDate: '2023-06-20' },
  { id: 'ec_045', cardName: '2025 Topps Chrome Paul Skenes Color Shift Auto', year: 2025, brand: 'Topps Chrome', sport: 'Baseball', errorType: 'color_variation', description: 'Significant yellow color shift on auto card creating golden tint.', baseValue: 100, errorPremium: 700, multiplier: 7, rarity: 'rare', verified: true, imageNotes: 'Golden/yellow tint compared to standard', discoveryDate: '2025-09-01' },
  { id: 'ec_046', cardName: '1988 Topps Tom Glavine Wrong Back RC #779', year: 1988, brand: 'Topps', sport: 'Baseball', errorType: 'wrong_back', description: 'RC with wrong player stats on back. A classic junk wax era error.', baseValue: 1, errorPremium: 40, multiplier: 40, rarity: 'uncommon', verified: true, imageNotes: 'Back shows wrong player stats', discoveryDate: '1988-06-01' },
  { id: 'ec_047', cardName: '2023 Panini Select Lamar Jackson Miscut Tie-Dye /25', year: 2023, brand: 'Panini Select', sport: 'Football', errorType: 'miscut', description: 'Numbered Tie-Dye parallel with severe miscut. Patch window affected.', baseValue: 200, errorPremium: 100, multiplier: 1.5, rarity: 'very_rare', verified: true, imageNotes: 'Miscut affects card framing significantly', discoveryDate: '2023-10-10' },
  { id: 'ec_048', cardName: '2024 Upper Deck Connor Bedard Blank Back Young Guns', year: 2024, brand: 'Upper Deck', sport: 'Hockey', errorType: 'blank_back', description: 'Young Guns RC with completely blank back. Extremely sought after.', baseValue: 50, errorPremium: 800, multiplier: 16, rarity: 'very_rare', verified: true, imageNotes: 'Back is completely blank', discoveryDate: '2024-03-15' },
  { id: 'ec_049', cardName: '2022 Topps Chrome Wander Franco Printing Error', year: 2022, brand: 'Topps Chrome', sport: 'Baseball', errorType: 'misprint', description: 'Missing chrome coating on front, card appears as standard Topps base.', baseValue: 8, errorPremium: 120, multiplier: 15, rarity: 'rare', verified: true, imageNotes: 'No chrome/refractor finish', discoveryDate: '2022-07-15' },
  { id: 'ec_050', cardName: '2025 Panini Prizm Victor Wembanyama Double Strike Silver', year: 2025, brand: 'Panini Prizm', sport: 'Basketball', errorType: 'double_print', description: 'Silver Prizm with double-struck image, ghost image offset ~2mm.', baseValue: 30, errorPremium: 600, multiplier: 20, rarity: 'very_rare', verified: true, imageNotes: 'Ghost image offset from primary image', discoveryDate: '2025-11-20' },
];

const ERROR_CARDS: ErrorCard[] = RAW_ERROR_CARDS.map((raw, i) => {
  const card = enrichErrorCard(raw);
  card.knownPopulation = _seedPops[i] ?? Math.floor(50 + i * 7);
  return card;
});

const IDENTIFICATION_GUIDES: IdentificationGuide[] = [
  { errorType: 'misprint', whatToLookFor: ['Missing text elements', 'Wrong text', 'Incorrect stats', 'Missing logos', 'Wrong player photo'], commonExamples: ['Missing name', 'Wrong team', 'Incorrect card number', 'Missing foil stamp'], toolsNeeded: ['Magnifying glass', 'Comparison card for reference'], difficulty: 'easy' },
  { errorType: 'miscut', whatToLookFor: ['Off-center borders', 'Adjacent card visible', 'Uneven border widths', 'Diagonal cut lines'], commonExamples: ['60/40 centering', '70/30 centering', 'Diamond cut', 'Adjacent card showing'], toolsNeeded: ['Ruler for measuring borders', 'Centering tool'], difficulty: 'easy' },
  { errorType: 'wrong_back', whatToLookFor: ['Different player stats on back', 'Wrong bio info', 'Mismatched card number', 'Different team info'], commonExamples: ['Player A front / Player B back', 'Baseball front / Football back'], toolsNeeded: ['Checklist for comparison', 'Standard card reference'], difficulty: 'medium' },
  { errorType: 'double_print', whatToLookFor: ['Ghost/shadow image', 'Doubled text', 'Offset image overlay', 'Blurry appearance from double strike'], commonExamples: ['Doubled player image', 'Shadow text', 'Double auto impression'], toolsNeeded: ['Magnifying glass', 'Good lighting', 'Standard card for comparison'], difficulty: 'medium' },
  { errorType: 'no_name', whatToLookFor: ['Missing player name on front', 'Blank area where name should be', 'Missing position designation'], commonExamples: ['1990 Topps Frank Thomas', '2015 Topps Chrome Kris Bryant'], toolsNeeded: ['Standard card for comparison'], difficulty: 'easy' },
  { errorType: 'inverted', whatToLookFor: ['Upside down image', 'Reversed/mirror text', 'Backwards jersey numbers', 'Upside down back text'], commonExamples: ['Reverse negative photos', 'Inverted back text', 'Mirror image printing'], toolsNeeded: ['Standard card for comparison', 'Mirror for verification'], difficulty: 'easy' },
  { errorType: 'color_variation', whatToLookFor: ['Different hue compared to standard', 'Color bleeding', 'Unusual tint', 'Saturated or desaturated colors'], commonExamples: ['Green tint', 'Blue shift', 'Color bleed on borders', 'Dark ink variation'], toolsNeeded: ['Standard card for side-by-side comparison', 'Good natural lighting', 'Color reference chart'], difficulty: 'hard' },
  { errorType: 'blank_back', whatToLookFor: ['Completely white/blank back', 'No printing at all on reverse', 'Clean white cardstock'], commonExamples: ['White back', 'No stats/bio printed'], toolsNeeded: ['None - easy to identify'], difficulty: 'easy' },
  { errorType: 'test_print', whatToLookFor: ['Registration/alignment marks', 'Missing serial numbers', 'Unusual color scheme', 'No foil stamping', 'Proof markings'], commonExamples: ['Printing plates', 'Pre-production proofs', 'Test runs with marks'], toolsNeeded: ['Magnifying glass', 'UV light', 'Production documentation reference'], difficulty: 'expert' },
];

const NOTABLE_ERRORS: NotableError[] = [
  { id: 'ne_001', cardName: '1989 Fleer Billy Ripken FF', year: 1989, brand: 'Fleer', errorType: 'misprint', story: 'Billy Ripken wrote an obscenity on his bat knob as a prank. The card was printed and distributed before anyone noticed. Fleer created multiple corrected versions including black box, white-out, and scribble variations, making the original uncorrected version the most valuable.', peakValue: 5000, currentValue: 3000, discoveredBy: 'Collectors nationwide', discoveryYear: 1989 },
  { id: 'ne_002', cardName: '1990 Topps Frank Thomas No Name #414', year: 1990, brand: 'Topps', errorType: 'no_name', story: 'Frank Thomas\'s rookie card was printed without his name on the front. Despite being from the overproduced junk wax era, the error version commands significant premiums. It remains one of the most recognizable error cards in the hobby.', peakValue: 2500, currentValue: 800, discoveredBy: 'Pack openers nationwide', discoveryYear: 1990 },
  { id: 'ne_003', cardName: '1957 Topps Contest Card #0', year: 1957, brand: 'Topps', errorType: 'test_print', story: 'An unnumbered test print that was never meant for distribution. Only a handful are known to exist. The card features a generic player image used for press alignment testing.', peakValue: 50000, currentValue: 35000, discoveredBy: 'Former Topps print shop employee', discoveryYear: 1972 },
  { id: 'ne_004', cardName: '1969 Topps Aurelio Rodriguez (Angel Bravo Photo)', year: 1969, brand: 'Topps', errorType: 'misprint', story: 'When Topps photographers visited spring training, they accidentally photographed batboy Angel Bravo instead of Aurelio Rodriguez. The card was mass-produced with the wrong photo before the error was caught.', peakValue: 500, currentValue: 200, discoveredBy: 'Rodriguez himself', discoveryYear: 1969 },
  { id: 'ne_005', cardName: '1963 Topps Pete Rose RC Wrong Stat Line', year: 1963, brand: 'Topps', errorType: 'misprint', story: 'Pete Rose\'s rookie card contained incorrect statistics that were corrected in later print runs. The error version is distinguishable by checking the hit totals which are 10 higher than actual.', peakValue: 15000, currentValue: 8000, discoveredBy: 'Baseball statisticians', discoveryYear: 1964 },
  { id: 'ne_006', cardName: '1986 Fleer Michael Jordan RC Inverted Back', year: 1986, brand: 'Fleer', errorType: 'inverted', story: 'An extremely rare error of the most iconic basketball card ever produced. The back text is printed completely upside down. Fewer than 10 confirmed examples exist, making this one of the most valuable error cards in any sport.', peakValue: 50000, currentValue: 25000, discoveredBy: 'Chicago area collector', discoveryYear: 1987 },
  { id: 'ne_007', cardName: '1989 Upper Deck Ken Griffey Jr RC Miscut #1', year: 1989, brand: 'Upper Deck', errorType: 'miscut', story: 'Some of the first Upper Deck hobby boxes contained severely miscut Griffey Jr rookies showing the card above or below. While normally a defect, collectors prize these from the iconic UD set.', peakValue: 500, currentValue: 150, discoveredBy: 'Early UD collectors', discoveryYear: 1989 },
  { id: 'ne_008', cardName: '1968 Topps Nolan Ryan RC Wrong Back', year: 1968, brand: 'Topps', errorType: 'wrong_back', story: 'The Nolan Ryan/Jerry Koosman rookie card with wrong back information is one of the most valuable error cards in existence. The combination of a legendary player, iconic set, and clear error creates massive demand.', peakValue: 25000, currentValue: 12000, discoveredBy: 'Mets collectors', discoveryYear: 1968 },
  { id: 'ne_009', cardName: '1991 Pro Set NFLPA Logo Error', year: 1991, brand: 'Pro Set', errorType: 'misprint', story: 'Pro Set became infamous for errors in the early 1990s. Their 1991 set had so many errors it became a collectible category of its own. Some collectors attempt to build complete error sets.', peakValue: 100, currentValue: 25, discoveredBy: 'Football collectors', discoveryYear: 1991 },
  { id: 'ne_010', cardName: '1962 Topps Babe Ruth Green Tint #139', year: 1962, brand: 'Topps', errorType: 'color_variation', story: 'A unique color variation from the 1962 Topps set showing a green tint not present in standard cards. Believed to be from an early print run before color calibration was corrected.', peakValue: 5000, currentValue: 2500, discoveredBy: 'Vintage card dealer', discoveryYear: 1962 },
  { id: 'ne_011', cardName: '1985 Topps Pete Rose #600 Wrong Back', year: 1985, brand: 'Topps', errorType: 'wrong_back', story: 'This card features Gary Carter stats on the back of Pete Rose card. Both were star players at the time, making this mixup particularly notable among collectors.', peakValue: 300, currentValue: 150, discoveredBy: 'Set builders', discoveryYear: 1985 },
  { id: 'ne_012', cardName: '2020 Panini Prizm Tua/Herbert Switcheroo', year: 2020, brand: 'Panini Prizm', errorType: 'wrong_back', story: 'In the highly anticipated 2020 QB class, some Tua Tagovailoa cards were printed with Justin Herbert information on the back. The irony of mixing up the two most debated QBs made this instantly collectible.', peakValue: 1000, currentValue: 500, discoveredBy: 'Hobby breakers on live stream', discoveryYear: 2020 },
  { id: 'ne_013', cardName: '1990 Donruss Nolan Ryan Reverse Negative', year: 1990, brand: 'Donruss', errorType: 'inverted', story: 'Nolan Ryan printed as a photographic negative, creating an eerie inverted image. One of the more visually striking errors from the junk wax era.', peakValue: 500, currentValue: 250, discoveredBy: 'Pack openers', discoveryYear: 1990 },
  { id: 'ne_014', cardName: '1982 Topps Cal Ripken Jr Position Error', year: 1982, brand: 'Topps', errorType: 'misprint', story: 'Ripken listed as third baseman instead of shortstop on his Topps Traded RC. A corrected version exists, with the error being slightly more valuable.', peakValue: 500, currentValue: 300, discoveredBy: 'Orioles fans', discoveryYear: 1982 },
  { id: 'ne_015', cardName: '2024 Topps Chrome Production Error Batch', year: 2024, brand: 'Topps Chrome', errorType: 'misprint', story: 'An entire batch of 2024 Topps Chrome was printed without foil stamping, creating a unique matte-finish variant. Discovered by hobby breakers during live streams.', peakValue: 300, currentValue: 150, discoveredBy: 'Breakers on Whatnot', discoveryYear: 2024 },
  { id: 'ne_016', cardName: '1995 Flair Kevin Garnett Double-Sided Front', year: 1995, brand: 'Flair', errorType: 'double_print', story: 'Both sides of KG RC printed with the front image, leaving no stats on back. A unique error on an already premium product.', peakValue: 1200, currentValue: 600, discoveredBy: 'Minnesota collector', discoveryYear: 1995 },
  { id: 'ne_017', cardName: '1977 Topps Dale Murphy Double Print #476', year: 1977, brand: 'Topps', errorType: 'double_print', story: 'An early Dale Murphy card with doubled front image. Pre-dates his star years but valued by error collectors for the clear double-strike visible to the naked eye.', peakValue: 800, currentValue: 400, discoveredBy: 'Vintage collectors', discoveryYear: 1977 },
  { id: 'ne_018', cardName: '1991 Donruss Ricky Henderson Elite Blank Back', year: 1991, brand: 'Donruss', errorType: 'blank_back', story: 'From the premium Elite Series insert set, this Henderson card escaped the factory with a completely blank back. Elite cards were already rare, making this error exceptionally scarce.', peakValue: 700, currentValue: 350, discoveredBy: 'Set collector', discoveryYear: 1991 },
  { id: 'ne_019', cardName: '2019 Panini National Treasures Zion RPA Miscut', year: 2019, brand: 'Panini National Treasures', errorType: 'miscut', story: 'A severely miscut Zion Williamson Rookie Patch Auto from the ultra-premium National Treasures set. Despite the error, the patch and auto remain intact, creating debate about whether the error adds or subtracts value.', peakValue: 10000, currentValue: 7000, discoveredBy: 'High-end breaker', discoveryYear: 2020 },
  { id: 'ne_020', cardName: '2023 Topps Heritage Ohtani Color Swap', year: 2023, brand: 'Topps Heritage', errorType: 'color_variation', story: 'Shohei Ohtani Heritage card with Angels team name in blue instead of red. Only discovered by side-by-side comparison. Gained attention on social media and confirmed by Topps.', peakValue: 500, currentValue: 300, discoveredBy: 'Reddit user', discoveryYear: 2023 },
];

const RECENT_DISCOVERIES: RecentDiscovery[] = [
  { id: 'rd_001', cardName: '2025 Topps Series 1 Missing UV Coating Batch', year: 2025, brand: 'Topps', errorType: 'misprint', description: 'Multiple cards from cases shipped without UV protective coating, resulting in matte finish.', estimatedValue: 50, discoveryDate: '2026-03-10', reportedBy: 'BreakersFC', status: 'confirmed' },
  { id: 'rd_002', cardName: '2025 Panini Prizm NBA Draft Picks Wrong Team Logo', year: 2025, brand: 'Panini Prizm', errorType: 'misprint', description: 'Several rookies shown with wrong team logos from pre-trade assignments.', estimatedValue: 75, discoveryDate: '2026-03-08', reportedBy: 'CardNinja22', status: 'confirmed' },
  { id: 'rd_003', cardName: '2026 Bowman Chrome 1st Miscut Sheet', year: 2026, brand: 'Bowman Chrome', errorType: 'miscut', description: 'Entire uncut sheet discovered with extreme miscut affecting all cards.', estimatedValue: 2000, discoveryDate: '2026-03-05', reportedBy: 'VintageVault', status: 'confirmed' },
  { id: 'rd_004', cardName: '2025 Topps Chrome Double Refractor Anomaly', year: 2025, brand: 'Topps Chrome', errorType: 'double_print', description: 'Refractor card with doubled chrome layer creating unusual visual effect.', estimatedValue: 300, discoveryDate: '2026-03-01', reportedBy: 'ChromeKing', status: 'under_review' },
  { id: 'rd_005', cardName: '2025 Select Football Inverted Die-Cut', year: 2025, brand: 'Panini Select', errorType: 'inverted', description: 'Concourse die-cut pattern applied upside down on several cards.', estimatedValue: 150, discoveryDate: '2026-02-25', reportedBy: 'GridironCollector', status: 'confirmed' },
  { id: 'rd_006', cardName: '2026 Topps Heritage Blank Back SP', year: 2026, brand: 'Topps Heritage', errorType: 'blank_back', description: 'Short print variation with completely blank back found in hobby box.', estimatedValue: 200, discoveryDate: '2026-02-20', reportedBy: 'HeritageFanatic', status: 'confirmed' },
  { id: 'rd_007', cardName: '2025 Upper Deck Hockey Color Bleed Error', year: 2025, brand: 'Upper Deck', errorType: 'color_variation', description: 'Color bleeding creating purple haze effect on several Young Guns cards.', estimatedValue: 100, discoveryDate: '2026-02-15', reportedBy: 'PuckCollector', status: 'confirmed' },
  { id: 'rd_008', cardName: '2025 Panini Flawless Wrong Back Patch Card', year: 2025, brand: 'Panini Flawless', errorType: 'wrong_back', description: 'Ultra-premium patch card with wrong player bio and stats on back.', estimatedValue: 1500, discoveryDate: '2026-02-10', reportedBy: 'LuxuryCardClub', status: 'under_review' },
  { id: 'rd_009', cardName: '2026 Topps Series 1 Test Print Leak', year: 2026, brand: 'Topps', errorType: 'test_print', description: 'Pre-production test prints found at recycling facility near printing plant.', estimatedValue: 500, discoveryDate: '2026-02-05', reportedBy: 'AnonymousTipper', status: 'under_review' },
  { id: 'rd_010', cardName: '2025 Prizm WNBA Caitlin Clark No Name Error', year: 2025, brand: 'Panini Prizm', errorType: 'no_name', description: 'Missing player name on front of Caitlin Clark RC. Small number confirmed.', estimatedValue: 400, discoveryDate: '2026-01-28', reportedBy: 'WNBACardFan', status: 'confirmed' },
];

const VALUE_MULTIPLIERS: ValueMultiplier[] = [
  { errorType: 'misprint', minMultiplier: 2, maxMultiplier: 1500, avgMultiplier: 50, factors: ['Player popularity', 'Visibility of error', 'Number of corrected versions', 'Era of card'] },
  { errorType: 'miscut', minMultiplier: 1.5, maxMultiplier: 25, avgMultiplier: 5, factors: ['Severity of miscut', 'Player popularity', 'Adjacent card visibility', 'Set desirability'] },
  { errorType: 'wrong_back', minMultiplier: 2, maxMultiplier: 50, avgMultiplier: 10, factors: ['Both players involved', 'Sport crossover appeal', 'Set popularity', 'Number known'] },
  { errorType: 'double_print', minMultiplier: 3, maxMultiplier: 30, avgMultiplier: 12, factors: ['Visibility of doubling', 'Player popularity', 'Card type (auto, patch)', 'Offset distance'] },
  { errorType: 'no_name', minMultiplier: 5, maxMultiplier: 800, avgMultiplier: 50, factors: ['Player star power', 'RC vs base', 'Set popularity', 'Number discovered'] },
  { errorType: 'inverted', minMultiplier: 3, maxMultiplier: 250, avgMultiplier: 30, factors: ['What is inverted (image, text, logo)', 'Player popularity', 'Visual impact', 'Rarity'] },
  { errorType: 'color_variation', minMultiplier: 2, maxMultiplier: 25, avgMultiplier: 10, factors: ['How different from standard', 'Aesthetic appeal', 'Ease of identification', 'Number confirmed'] },
  { errorType: 'blank_back', minMultiplier: 5, maxMultiplier: 80, avgMultiplier: 25, factors: ['Player popularity', 'Set desirability', 'Number known to exist', 'Card condition'] },
  { errorType: 'test_print', minMultiplier: 10, maxMultiplier: 500, avgMultiplier: 50, factors: ['Authentication difficulty', 'Provenance documentation', 'Visual uniqueness', 'Player/set significance'] },
];

const ERROR_SETS: ErrorSet[] = [
  { name: '1989 Fleer Baseball', year: 1989, brand: 'Fleer', knownErrors: 12, mostValuable: 'Billy Ripken FF', topValue: 3000 },
  { name: '1990 Topps Baseball', year: 1990, brand: 'Topps', knownErrors: 8, mostValuable: 'Frank Thomas No Name', topValue: 800 },
  { name: '1990 Donruss Baseball', year: 1990, brand: 'Donruss', knownErrors: 15, mostValuable: 'Nolan Ryan Reverse Negative', topValue: 250 },
  { name: '1991 Pro Set Football', year: 1991, brand: 'Pro Set', knownErrors: 45, mostValuable: 'NFLPA Logo Error', topValue: 25 },
  { name: '2024 Topps Chrome Baseball', year: 2024, brand: 'Topps Chrome', knownErrors: 6, mostValuable: 'Missing Foil Batch', topValue: 150 },
  { name: '1989 Upper Deck Baseball', year: 1989, brand: 'Upper Deck', knownErrors: 7, mostValuable: 'Dale Murphy Reverse Negative', topValue: 75 },
  { name: '2020 Panini Prizm Football', year: 2020, brand: 'Panini Prizm', knownErrors: 5, mostValuable: 'Tua/Herbert Wrong Back', topValue: 500 },
  { name: '2023 Topps Heritage Baseball', year: 2023, brand: 'Topps Heritage', knownErrors: 4, mostValuable: 'Ohtani Color Swap', topValue: 300 },
];

const COMMUNITY_REPORTS: CommunityReport[] = [
  { id: 'cr_001', reporterName: 'CardDetective99', cardName: '2026 Topps Series 1 Missing Foil #127', year: 2026, brand: 'Topps', errorType: 'misprint', description: 'No foil stamping on card front. Pulled from hobby box.', status: 'pending', submittedDate: '2026-03-14', votes: 23 },
  { id: 'cr_002', reporterName: 'ErrorHunterPro', cardName: '2025 Prizm Silver Wrong Back', year: 2025, brand: 'Panini Prizm', errorType: 'wrong_back', description: 'Silver Prizm with completely wrong player on back.', status: 'confirmed', submittedDate: '2026-03-12', votes: 45 },
  { id: 'cr_003', reporterName: 'MiscutMaster', cardName: '2026 Bowman 1st Chrome Severe Miscut', year: 2026, brand: 'Bowman Chrome', errorType: 'miscut', description: 'Shows 40% of adjacent card. From hobby jumbo box.', status: 'confirmed', submittedDate: '2026-03-10', votes: 67 },
  { id: 'cr_004', reporterName: 'VintageVault', cardName: '1988 Score Blank Back Error', year: 1988, brand: 'Score', errorType: 'blank_back', description: 'Recently discovered blank back from 1988 Score set. Previously unreported.', status: 'under_review', submittedDate: '2026-03-08', votes: 34 },
  { id: 'cr_005', reporterName: 'ModernErrors', cardName: '2025 Topps Chrome Color Anomaly', year: 2025, brand: 'Topps Chrome', errorType: 'color_variation', description: 'Unusual green tint on base chrome cards. Multiple boxes affected.', status: 'under_review', submittedDate: '2026-03-05', votes: 19 },
  { id: 'cr_006', reporterName: 'RookieCollector', cardName: '2025 Select No Name Die-Cut', year: 2025, brand: 'Panini Select', errorType: 'no_name', description: 'Concourse die-cut with missing player name. First I have seen.', status: 'pending', submittedDate: '2026-03-01', votes: 12 },
  { id: 'cr_007', reporterName: 'HockeyCardKing', cardName: '2025 Upper Deck Double Print Young Guns', year: 2025, brand: 'Upper Deck', errorType: 'double_print', description: 'Ghost image visible on Young Guns RC. Very subtle but confirmed with magnification.', status: 'confirmed', submittedDate: '2026-02-25', votes: 38 },
  { id: 'cr_008', reporterName: 'TestPrintFinder', cardName: '2026 Topps Alignment Marks Visible', year: 2026, brand: 'Topps', errorType: 'test_print', description: 'Registration marks visible on card edges. Possibly escaped QC from test run.', status: 'under_review', submittedDate: '2026-02-20', votes: 56 },
];

const RARITY_ESTIMATES: RarityEstimate[] = [
  { errorType: 'misprint', estimatedSurvivingCount: 50000, totalPrinted: 100000, survivalRate: 50, trend: 'stable' },
  { errorType: 'miscut', estimatedSurvivingCount: 200000, totalPrinted: 500000, survivalRate: 40, trend: 'decreasing' },
  { errorType: 'wrong_back', estimatedSurvivingCount: 15000, totalPrinted: 30000, survivalRate: 50, trend: 'stable' },
  { errorType: 'double_print', estimatedSurvivingCount: 8000, totalPrinted: 20000, survivalRate: 40, trend: 'stable' },
  { errorType: 'no_name', estimatedSurvivingCount: 5000, totalPrinted: 12000, survivalRate: 42, trend: 'increasing' },
  { errorType: 'inverted', estimatedSurvivingCount: 3000, totalPrinted: 8000, survivalRate: 38, trend: 'stable' },
  { errorType: 'color_variation', estimatedSurvivingCount: 25000, totalPrinted: 75000, survivalRate: 33, trend: 'increasing' },
  { errorType: 'blank_back', estimatedSurvivingCount: 10000, totalPrinted: 25000, survivalRate: 40, trend: 'stable' },
  { errorType: 'test_print', estimatedSurvivingCount: 500, totalPrinted: 2000, survivalRate: 25, trend: 'decreasing' },
];

const MARKET_PREMIUMS: MarketPremium[] = [
  { errorType: 'misprint', sport: 'Baseball', avgPremiumPct: 450, recentSales: 120, demandTrend: 'hot' },
  { errorType: 'misprint', sport: 'Basketball', avgPremiumPct: 380, recentSales: 65, demandTrend: 'warm' },
  { errorType: 'misprint', sport: 'Football', avgPremiumPct: 320, recentSales: 55, demandTrend: 'warm' },
  { errorType: 'misprint', sport: 'Hockey', avgPremiumPct: 200, recentSales: 20, demandTrend: 'stable' },
  { errorType: 'wrong_back', sport: 'Baseball', avgPremiumPct: 300, recentSales: 40, demandTrend: 'warm' },
  { errorType: 'wrong_back', sport: 'Football', avgPremiumPct: 250, recentSales: 30, demandTrend: 'warm' },
  { errorType: 'no_name', sport: 'Baseball', avgPremiumPct: 800, recentSales: 25, demandTrend: 'hot' },
  { errorType: 'no_name', sport: 'Football', avgPremiumPct: 500, recentSales: 10, demandTrend: 'hot' },
  { errorType: 'blank_back', sport: 'Baseball', avgPremiumPct: 350, recentSales: 35, demandTrend: 'warm' },
  { errorType: 'blank_back', sport: 'Hockey', avgPremiumPct: 280, recentSales: 15, demandTrend: 'stable' },
  { errorType: 'color_variation', sport: 'Baseball', avgPremiumPct: 200, recentSales: 50, demandTrend: 'warm' },
  { errorType: 'inverted', sport: 'Baseball', avgPremiumPct: 500, recentSales: 18, demandTrend: 'hot' },
  { errorType: 'double_print', sport: 'Basketball', avgPremiumPct: 350, recentSales: 22, demandTrend: 'warm' },
  { errorType: 'test_print', sport: 'Baseball', avgPremiumPct: 1200, recentSales: 8, demandTrend: 'hot' },
  { errorType: 'miscut', sport: 'Baseball', avgPremiumPct: 150, recentSales: 85, demandTrend: 'stable' },
  { errorType: 'miscut', sport: 'Basketball', avgPremiumPct: 120, recentSales: 40, demandTrend: 'stable' },
];

// ---- Helper Functions ----

const ERROR_TYPE_CONFIG: Record<ErrorType, { label: string; text: string; bg: string; border: string }> = {
  misprint: { label: 'Misprint', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  miscut: { label: 'Miscut', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  wrong_back: { label: 'Wrong Back', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  double_print: { label: 'Double Print', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  no_name: { label: 'No Name', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  inverted: { label: 'Inverted', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  color_variation: { label: 'Color Variation', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  blank_back: { label: 'Blank Back', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  test_print: { label: 'Test Print', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  reversed_negative: { label: 'Reversed Negative', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  wrong_photo: { label: 'Wrong Photo', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  missing_foil: { label: 'Missing Foil', text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  sp: { label: 'SP', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  ssp: { label: 'SSP', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  photo_variation: { label: 'Photo Variation', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
};

const RARITY_CONFIG: Record<string, { label: string; text: string; bg: string; border: string }> = {
  common: { label: 'Common', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  uncommon: { label: 'Uncommon', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  rare: { label: 'Rare', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  very_rare: { label: 'Very Rare', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  legendary: { label: 'Legendary', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

const VERIFICATION_CONFIG: Record<VerificationStatus, { label: string; text: string; bg: string; border: string }> = {
  pending: { label: 'Pending', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  confirmed: { label: 'Confirmed', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  debunked: { label: 'Debunked', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  under_review: { label: 'Under Review', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

// ---- Public API ----

export function getErrorTypeConfig(errorType: ErrorType): { label: string; text: string; bg: string; border: string } {
  return ERROR_TYPE_CONFIG[errorType];
}

export function getRarityConfig(rarity: string): { label: string; text: string; bg: string; border: string } {
  return RARITY_CONFIG[rarity] ?? RARITY_CONFIG['common'];
}

export function getVerificationConfig(status: VerificationStatus): { label: string; text: string; bg: string; border: string } {
  return VERIFICATION_CONFIG[status];
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function getErrorCards(errorType?: ErrorType, sport?: string): ErrorCard[] {
  const cacheKey = `cards_${errorType ?? 'all'}_${sport ?? 'all'}`;
  const cached = loadData<ErrorCard[]>(cacheKey);
  if (cached) return cached;

  let result = ERROR_CARDS;
  if (errorType) result = result.filter(c => c.errorType === errorType);
  if (sport) result = result.filter(c => c.sport === sport);

  saveData(cacheKey, result);
  return result;
}

export function getErrorCardById(id: string): ErrorCard | undefined {
  const cached = loadData<ErrorCard>(`card_${id}`);
  if (cached) return cached;

  const card = ERROR_CARDS.find(c => c.id === id);
  if (card) saveData(`card_${id}`, card);
  return card;
}

export function getIdentificationGuides(errorType?: ErrorType): IdentificationGuide[] {
  const cacheKey = errorType ? `guides_${errorType}` : 'guides_all';
  const cached = loadData<IdentificationGuide[]>(cacheKey);
  if (cached) return cached;

  const result = errorType ? IDENTIFICATION_GUIDES.filter(g => g.errorType === errorType) : IDENTIFICATION_GUIDES;
  saveData(cacheKey, result);
  return result;
}

export function getNotableErrors(): NotableError[] {
  const cached = loadData<NotableError[]>('notable');
  if (cached) return cached;
  saveData('notable', NOTABLE_ERRORS);
  return NOTABLE_ERRORS;
}

export function getRecentDiscoveries(status?: VerificationStatus): RecentDiscovery[] {
  const cacheKey = status ? `discoveries_${status}` : 'discoveries_all';
  const cached = loadData<RecentDiscovery[]>(cacheKey);
  if (cached) return cached;

  const result = status ? RECENT_DISCOVERIES.filter(d => d.status === status) : RECENT_DISCOVERIES;
  saveData(cacheKey, result);
  return result;
}

export function getValueMultipliers(errorType?: ErrorType): ValueMultiplier[] {
  const cacheKey = errorType ? `multipliers_${errorType}` : 'multipliers_all';
  const cached = loadData<ValueMultiplier[]>(cacheKey);
  if (cached) return cached;

  const result = errorType ? VALUE_MULTIPLIERS.filter(v => v.errorType === errorType) : VALUE_MULTIPLIERS;
  saveData(cacheKey, result);
  return result;
}

export function getErrorSets(): ErrorSet[] {
  const cached = loadData<ErrorSet[]>('error_sets');
  if (cached) return cached;
  saveData('error_sets', ERROR_SETS);
  return ERROR_SETS;
}

export function getCommunityReports(status?: VerificationStatus): CommunityReport[] {
  const cacheKey = status ? `reports_${status}` : 'reports_all';
  const cached = loadData<CommunityReport[]>(cacheKey);
  if (cached) return cached;

  const result = status ? COMMUNITY_REPORTS.filter(r => r.status === status) : COMMUNITY_REPORTS;
  saveData(cacheKey, result);
  return result;
}

export function getRarityEstimates(errorType?: ErrorType): RarityEstimate[] {
  const cacheKey = errorType ? `rarity_${errorType}` : 'rarity_all';
  const cached = loadData<RarityEstimate[]>(cacheKey);
  if (cached) return cached;

  const result = errorType ? RARITY_ESTIMATES.filter(r => r.errorType === errorType) : RARITY_ESTIMATES;
  saveData(cacheKey, result);
  return result;
}

export function getMarketPremiums(errorType?: ErrorType, sport?: string): MarketPremium[] {
  const cacheKey = `premiums_${errorType ?? 'all'}_${sport ?? 'all'}`;
  const cached = loadData<MarketPremium[]>(cacheKey);
  if (cached) return cached;

  let result = MARKET_PREMIUMS;
  if (errorType) result = result.filter(p => p.errorType === errorType);
  if (sport) result = result.filter(p => p.sport === sport);

  saveData(cacheKey, result);
  return result;
}

export function getErrorCategories(): ErrorCategory[] {
  const cacheKey = 'categories';
  const cached = loadData<ErrorCategory[]>(cacheKey);
  if (cached) return cached;

  const categories: ErrorCategory[] = VALUE_MULTIPLIERS.map(vm => {
    const cards = ERROR_CARDS.filter(c => c.errorType === vm.errorType);
    return {
      errorType: vm.errorType,
      label: ERROR_TYPE_CONFIG[vm.errorType].label,
      description: IDENTIFICATION_GUIDES.find(g => g.errorType === vm.errorType)?.whatToLookFor.join('; ') ?? '',
      avgMultiplier: vm.avgMultiplier,
      knownCount: cards.length,
      collectability: Math.min(100, Math.round(vm.avgMultiplier * 1.5)),
    };
  });

  saveData(cacheKey, categories);
  return categories;
}

export function searchErrorCards(query: string): ErrorCard[] {
  const cacheKey = `search_${query.toLowerCase().replace(/\s+/g, '_')}`;
  const cached = loadData<ErrorCard[]>(cacheKey);
  if (cached) return cached;

  const lower = query.toLowerCase();
  const result = ERROR_CARDS.filter(c =>
    c.cardName.toLowerCase().includes(lower) ||
    c.description.toLowerCase().includes(lower) ||
    c.brand.toLowerCase().includes(lower) ||
    c.sport.toLowerCase().includes(lower)
  );

  saveData(cacheKey, result);
  return result;
}

export function getErrorStats(): { totalErrors: number; totalNotable: number; totalRecentDiscoveries: number; mostValuableError: string; mostValuableValue: number; avgMultiplier: number } {
  const cached = loadData<{ totalErrors: number; totalNotable: number; totalRecentDiscoveries: number; mostValuableError: string; mostValuableValue: number; avgMultiplier: number }>('stats');
  if (cached) return cached;

  const sorted = [...ERROR_CARDS].sort((a, b) => b.errorPremium - a.errorPremium);
  const avgMult = ERROR_CARDS.reduce((sum, c) => sum + c.multiplier, 0) / ERROR_CARDS.length;

  const stats = {
    totalErrors: ERROR_CARDS.length,
    totalNotable: NOTABLE_ERRORS.length,
    totalRecentDiscoveries: RECENT_DISCOVERIES.length,
    mostValuableError: sorted[0]?.cardName ?? 'N/A',
    mostValuableValue: sorted[0]?.errorPremium ?? 0,
    avgMultiplier: Math.round(avgMult * 10) / 10,
  };

  saveData('stats', stats);
  return stats;
}

// ---- Phase 157 Page Exports ----
// Types, constants, and functions required by pages/ErrorCard.tsx and pages/ErrorCardIntel.tsx

export type ErrorCardType = ErrorCard;

export interface VariationGuide {
  setId: string;
  setName: string;
  year: number;
  variations: {
    type: ErrorType;
    cardNumber: string;
    description: string;
    howToIdentify: string;
    valueMultiplier: number;
    estimatedPop: number;
  }[];
}

export interface ErrorAlert {
  id: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  type: 'new_discovery' | 'price_spike' | 'verification_needed' | 'market_opportunity';
  date: string;
  message: string;
  card: {
    player: string;
    year: number;
    set: string;
    errorValue: number;
    rarity: string;
  };
}

export interface ErrorCardStats {
  totalCataloged: number;
  totalErrors: number;
  totalVariations: number;
  avgPremium: number;
  highestPremium: number;
  recentDiscoveries: number;
}

export const ERROR_TYPE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  misprint: { label: 'Misprint', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  miscut: { label: 'Miscut', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  wrong_back: { label: 'Wrong Back', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  double_print: { label: 'Double Print', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  no_name: { label: 'No Name', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  inverted: { label: 'Inverted', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  color_variation: { label: 'Color Variation', color: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30' },
  blank_back: { label: 'Blank Back', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  test_print: { label: 'Test Print', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  reversed_negative: { label: 'Reversed Negative', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  wrong_photo: { label: 'Wrong Photo', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  missing_foil: { label: 'Missing Foil', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  sp: { label: 'SP', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  ssp: { label: 'SSP', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  photo_variation: { label: 'Photo Variation', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
};

export const RARITY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  common: { label: 'Common', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  common_error: { label: 'Common Error', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  uncommon: { label: 'Uncommon', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  scarce: { label: 'Scarce', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  rare: { label: 'Rare', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  very_rare: { label: 'Very Rare', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  extremely_rare: { label: 'Extremely Rare', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  legendary: { label: 'Legendary', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  unique: { label: 'Unique', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

export const DIFFICULTY_META: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-green-400' },
  moderate: { label: 'Moderate', color: 'text-amber-400' },
  hard: { label: 'Hard', color: 'text-orange-400' },
  expert: { label: 'Expert', color: 'text-red-400' },
};

// ---- Variation Guide Data ----

const VARIATION_GUIDES: VariationGuide[] = [
  {
    setId: 'topps-2018-update',
    setName: 'Topps Update Series',
    year: 2018,
    variations: [
      {
        type: 'photo_variation',
        cardNumber: '#US252',
        description: 'Ronald Acuna Jr. bat down SP variation — distinct from the standard bat-on-shoulder pose.',
        howToIdentify: 'Compare bat position: standard has bat on shoulder, SP has bat pointing down. Check code on back ending in 778.',
        valueMultiplier: 15,
        estimatedPop: 1200,
      },
      {
        type: 'ssp',
        cardNumber: '#US250',
        description: 'Juan Soto SSP with image showing him in a different uniform than the base card.',
        howToIdentify: 'Soto is in a red jersey instead of the standard white. Back code ends in 054.',
        valueMultiplier: 25,
        estimatedPop: 350,
      },
    ],
  },
  {
    setId: 'topps-2019-chrome',
    setName: 'Topps Chrome',
    year: 2019,
    variations: [
      {
        type: 'sp',
        cardNumber: '#201',
        description: 'Fernando Tatis Jr. SP image variation — different batting stance from base.',
        howToIdentify: 'SP shows follow-through swing vs. base card batting stance. Code ends in 663.',
        valueMultiplier: 12,
        estimatedPop: 900,
      },
      {
        type: 'reversed_negative',
        cardNumber: '#150',
        description: 'Mike Trout reversed negative error — image is horizontally flipped.',
        howToIdentify: 'Jersey number and text appear mirrored. Angels logo on wrong side of cap.',
        valueMultiplier: 40,
        estimatedPop: 50,
      },
    ],
  },
  {
    setId: 'panini-2020-select',
    setName: 'Panini Select',
    year: 2020,
    variations: [
      {
        type: 'missing_foil',
        cardNumber: '#TC-1',
        description: 'LeBron James Concourse missing foil die-cut — foil layer absent from card surface.',
        howToIdentify: 'Card surface is matte where it should be reflective. Compare light reflection to standard version.',
        valueMultiplier: 8,
        estimatedPop: 200,
      },
      {
        type: 'color_variation',
        cardNumber: '#PM-15',
        description: 'Luka Doncic Premier Level color shift — blue tint shifted to green across entire card.',
        howToIdentify: 'Background color is distinctly green instead of the standard blue. Most visible in the border area.',
        valueMultiplier: 6,
        estimatedPop: 500,
      },
    ],
  },
  {
    setId: 'topps-2021-series1',
    setName: 'Topps Series 1',
    year: 2021,
    variations: [
      {
        type: 'wrong_photo',
        cardNumber: '#27',
        description: 'Wander Franco wrong photo error — shows a different player in the Rays uniform.',
        howToIdentify: 'Face and build clearly do not match Franco. Compare to verified images online.',
        valueMultiplier: 18,
        estimatedPop: 75,
      },
      {
        type: 'no_name',
        cardNumber: '#330',
        description: 'Shohei Ohtani missing nameplate — player name strip is completely blank.',
        howToIdentify: 'Front nameplate area is blank/empty. All other card elements are correct.',
        valueMultiplier: 30,
        estimatedPop: 25,
      },
    ],
  },
];

// ---- Error Alert Data ----

const ERROR_ALERTS: ErrorAlert[] = [
  {
    id: 'alert-001',
    urgency: 'critical',
    type: 'new_discovery',
    date: '2025-12-28T14:30:00Z',
    message: 'New reversed-negative error discovered in 2024 Topps Series 2. Multiple confirmed sightings of card #450 with fully mirrored image. PSA has begun accepting submissions.',
    card: { player: 'Elly De La Cruz', year: 2024, set: 'Topps Series 2', errorValue: 4500, rarity: 'extremely_rare' },
  },
  {
    id: 'alert-002',
    urgency: 'high',
    type: 'price_spike',
    date: '2025-12-26T09:15:00Z',
    message: 'The 2018 Topps Update Acuna SP variation has surged 40% in the last 7 days after a PSA 10 sold for a record $8,200 at auction.',
    card: { player: 'Ronald Acuna Jr.', year: 2018, set: 'Topps Update', errorValue: 8200, rarity: 'rare' },
  },
  {
    id: 'alert-003',
    urgency: 'medium',
    type: 'verification_needed',
    date: '2025-12-22T16:45:00Z',
    message: 'Community reports of a possible double-print error on 2024 Bowman Chrome 1st cards. Three independent sources have submitted images. Awaiting expert review.',
    card: { player: 'Roman Anthony', year: 2024, set: 'Bowman Chrome', errorValue: 1200, rarity: 'scarce' },
  },
  {
    id: 'alert-004',
    urgency: 'high',
    type: 'market_opportunity',
    date: '2025-12-20T11:00:00Z',
    message: 'Missing foil errors from 2023 Panini Select NBA are currently undervalued relative to historical comparables. Average premium is only 5x vs. typical 8-12x for similar errors.',
    card: { player: 'Victor Wembanyama', year: 2023, set: 'Panini Select', errorValue: 3500, rarity: 'rare' },
  },
  {
    id: 'alert-005',
    urgency: 'low',
    type: 'new_discovery',
    date: '2025-12-18T08:30:00Z',
    message: 'Minor color variation identified in 2024 Topps Heritage. Slight ink density difference on card backs — may affect a larger print run.',
    card: { player: 'Bobby Witt Jr.', year: 2024, set: 'Topps Heritage', errorValue: 150, rarity: 'common_error' },
  },
];

// ---- Page API Functions ----

export function getVariationGuide(): VariationGuide[] {
  return VARIATION_GUIDES;
}

export function getErrorAlerts(): ErrorAlert[] {
  return ERROR_ALERTS;
}

export function getErrorCardStats(): ErrorCardStats {
  const cards = getErrorCards();
  const variations = VARIATION_GUIDES.reduce((sum, g) => sum + g.variations.length, 0);
  const multipliers = cards.map(c => c.premiumMultiplier).filter(m => m > 0);
  const avgPremium = multipliers.length > 0
    ? Math.round((multipliers.reduce((s, m) => s + m, 0) / multipliers.length) * 10) / 10
    : 0;
  const highestPremium = multipliers.length > 0 ? Math.max(...multipliers) : 0;
  const recentCutoff = Date.now() - 30 * 24 * 3600 * 1000;
  const recentCount = cards.filter(c => c.discoveryDate && new Date(c.discoveryDate).getTime() > recentCutoff).length;

  return {
    totalCataloged: cards.length + variations,
    totalErrors: cards.length,
    totalVariations: variations,
    avgPremium,
    highestPremium,
    recentDiscoveries: recentCount || ERROR_ALERTS.filter(a => a.type === 'new_discovery').length,
  };
}

export function searchForErrors(player?: string, year?: number, set?: string): ErrorCard[] {
  let results = getErrorCards();
  if (player) {
    const p = player.toLowerCase();
    results = results.filter(c => c.player.toLowerCase().includes(p));
  }
  if (year) {
    results = results.filter(c => c.year === year);
  }
  if (set) {
    const s = set.toLowerCase();
    results = results.filter(c =>
      c.set.toLowerCase().includes(s) || c.manufacturer.toLowerCase().includes(s)
    );
  }
  return results;
}

// ---- Widget API Functions ----

export function getPremiumMetrics(): { totalMarketValue: number; avgPremium: number; highestPremium: number } {
  const cards = getErrorCards();
  const totalMarketValue = cards.reduce((sum, c) => sum + c.errorValue, 0);
  const avgPremium = cards.length > 0
    ? Math.round(cards.reduce((sum, c) => sum + c.premiumMultiplier, 0) / cards.length * 100) / 100
    : 0;
  const highestPremium = cards.length > 0 ? Math.max(...cards.map(c => c.premiumMultiplier)) : 0;
  return { totalMarketValue, avgPremium, highestPremium };
}

export function getRecentFinds(): { id: string; cardName: string; errorType: ErrorType; premiumPercent: number; discoveryDate: string }[] {
  const cards = getErrorCards();
  return cards
    .filter(c => c.discoveryDate)
    .sort((a, b) => new Date(b.discoveryDate).getTime() - new Date(a.discoveryDate).getTime())
    .slice(0, 10)
    .map(c => ({
      id: c.id,
      cardName: c.cardName,
      errorType: c.errorType,
      premiumPercent: c.normalValue > 0 ? Math.round((c.errorValue - c.normalValue) / c.normalValue * 100) : Math.round(c.premiumMultiplier * 100),
      discoveryDate: c.discoveryDate,
    }));
}
