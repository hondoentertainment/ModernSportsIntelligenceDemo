// @ts-nocheck
// Phase 136: AI Authentication Training Academy
// Gamified training system for card authentication with challenges, XP, badges, and community review

import { store } from '../dal/syncStore';

// ---- Types ----

export type TrainingCategory = 'fake_detection' | 'trimming' | 'recoloring' | 'reprints' | 'autograph_verification' | 'patch_manipulation';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type CardEraGuide = 'pre_war' | 'vintage' | 'junk_wax' | 'modern' | 'ultra_modern';

export interface TrainingModule {
  id: string;
  title: string;
  category: TrainingCategory;
  difficulty: Difficulty;
  lessons_count: number;
  completion_pct: number;
  description: string;
  icon: string;
  challenges: TrainingChallenge[];
}

export interface TrainingChallenge {
  id: string;
  moduleId: string;
  cardName: string;
  cardYear: number;
  cardImage: string;
  is_authentic: boolean;
  defect_annotations: string[];
  explanation: string;
  difficulty: Difficulty;
  xpReward: number;
}

export interface UserProgress {
  modules_completed: number;
  accuracy_score: number;
  streak: number;
  level: number;
  xp: number;
  xp_to_next: number;
  badges: Badge[];
  total_challenges: number;
  correct_answers: number;
  wrong_answers: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string | null;
  requirement: string;
}

export interface AuthConfidenceScore {
  overall: number;
  byCategory: { category: TrainingCategory; score: number; attempts: number }[];
}

export interface CommunityReview {
  id: string;
  cardName: string;
  cardYear: number;
  submittedBy: string;
  submittedDate: string;
  opinions: { authentic: number; fake: number; uncertain: number };
  status: 'pending' | 'resolved' | 'escalated';
  expertVerdict: string | null;
}

export interface ExpertAnnotation {
  id: string;
  cardId: string;
  expert: string;
  annotation: string;
  region: string;
  confidence: number;
}

export interface EraGuide {
  era: CardEraGuide;
  title: string;
  description: string;
  commonFakes: string[];
  keyTells: string[];
  difficultyLevel: Difficulty;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  accuracy: number;
  streak: number;
  badges: number;
}

export interface AccuracyTrend {
  week: string;
  accuracy: number;
  challenges: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_auth_training';

const XP_PER_CORRECT = 10;
const XP_PER_WRONG = -5;
const XP_PER_LEVEL = 100;

const CATEGORY_LABELS: Record<TrainingCategory, string> = {
  fake_detection: 'Fake Detection',
  trimming: 'Trimming Detection',
  recoloring: 'Recoloring Identification',
  reprints: 'Reprint Recognition',
  autograph_verification: 'Autograph Verification',
  patch_manipulation: 'Patch Manipulation',
};

const CATEGORY_COLORS: Record<TrainingCategory, { text: string; bg: string; border: string }> = {
  fake_detection: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  trimming: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  recoloring: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  reprints: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  autograph_verification: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  patch_manipulation: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

const DIFFICULTY_COLORS: Record<Difficulty, { text: string; bg: string }> = {
  beginner: { text: 'text-green-400', bg: 'bg-green-500/15' },
  intermediate: { text: 'text-blue-400', bg: 'bg-blue-500/15' },
  advanced: { text: 'text-amber-400', bg: 'bg-amber-500/15' },
  expert: { text: 'text-red-400', bg: 'bg-red-500/15' },
};

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.get<T | null>(`${STORAGE_KEY}_${key}`, null);
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Mock Challenges ----

function makeChallenges(moduleId: string, _category: TrainingCategory, _difficulty: Difficulty): TrainingChallenge[] {
  const challengeSets: Record<string, TrainingChallenge[]> = {
    mod_001: [
      { id: 'ch_001', moduleId: 'mod_001', cardName: '1986 Fleer Michael Jordan RC', cardYear: 1986, cardImage: 'jordan_86_fleer.jpg', is_authentic: false, defect_annotations: ['Dot pattern inconsistency at 40x magnification', 'Color saturation 12% higher than authentic', 'Paper stock slightly thinner'], explanation: 'This is a high-quality reprint. The dot pattern under magnification shows modern printing technology versus original offset lithography.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_002', moduleId: 'mod_001', cardName: '1989 Upper Deck Ken Griffey Jr RC', cardYear: 1989, cardImage: 'griffey_89_ud.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic card. Hologram is genuine with proper laser etching depth. Paper stock matches era specifications.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_003', moduleId: 'mod_001', cardName: '1952 Topps Mickey Mantle', cardYear: 1952, cardImage: 'mantle_52_topps.jpg', is_authentic: false, defect_annotations: ['Back printing alignment off by 0.5mm', 'Cardstock lacks expected aging patina', 'Color registration too precise for era'], explanation: 'Modern counterfeit of the most faked card in the hobby. The printing precision exceeds what 1950s technology could achieve.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_004', moduleId: 'mod_001', cardName: '2011 Topps Update Mike Trout RC', cardYear: 2011, cardImage: 'trout_11_topps.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic card. Paper stock, print quality, and cutting all match known authentic examples. No signs of alteration.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_005', moduleId: 'mod_001', cardName: '1993 SP Derek Jeter Foil RC', cardYear: 1993, cardImage: 'jeter_93_sp.jpg', is_authentic: false, defect_annotations: ['Foil pattern does not refract correctly', 'Card weight 0.3g lighter than authentic', 'Font kerning differs from genuine'], explanation: 'Counterfeit. The foil stamping technology used here creates a different refraction pattern than the original 1993 SP production run.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_006', moduleId: 'mod_001', cardName: '2018 Topps Chrome Ohtani RC Auto', cardYear: 2018, cardImage: 'ohtani_18_chrome.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic card and autograph. Chrome coating has proper depth, auto ink matches known Ohtani signatures from this period.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_007', moduleId: 'mod_001', cardName: '1909 T206 Ty Cobb Bat Off Shoulder', cardYear: 1909, cardImage: 'cobb_t206.jpg', is_authentic: false, defect_annotations: ['Paper fibers inconsistent with tobacco-era stock', 'Ink bleeding pattern suggests inkjet origin', 'Back advertisement font is slightly wrong'], explanation: 'Fake. T206 reprints are common. This one fails the paper fiber test - authentic cards have a distinctly different fiber composition.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_008', moduleId: 'mod_001', cardName: '2001 Bowman Chrome Pujols Auto', cardYear: 2001, cardImage: 'pujols_01_bowman.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic. Chrome surface under UV shows correct fluorescence pattern. Auto is on-card and matches certified exemplars.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_009', moduleId: 'mod_001', cardName: '1969 Topps Reggie Jackson RC', cardYear: 1969, cardImage: 'jackson_69_topps.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic vintage card. Print registration, paper stock aging, and color fading all consistent with genuine 1969 Topps production.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_010', moduleId: 'mod_001', cardName: '1955 Topps Roberto Clemente RC', cardYear: 1955, cardImage: 'clemente_55_topps.jpg', is_authentic: false, defect_annotations: ['Centering too perfect for era', 'Color vibrancy exceeds known authentic range', 'Cut corners lack natural 1950s machine patterns'], explanation: 'High-quality fake. The too-perfect centering is a tell - 1950s cutting machines produced characteristic variance that this card lacks.', difficulty: 'beginner', xpReward: 10 },
    ],
    mod_002: [
      { id: 'ch_011', moduleId: 'mod_002', cardName: '1987 Topps Barry Bonds RC (Trimmed)', cardYear: 1987, cardImage: 'bonds_87_trimmed.jpg', is_authentic: false, defect_annotations: ['Card measures 2.47 x 3.49 vs standard 2.50 x 3.50', 'Edge smoothness inconsistent with factory cutting', 'Centering appears artificially perfect'], explanation: 'This card has been trimmed. The 0.03 inch reduction on width and 0.01 on height, combined with unnaturally smooth edges, indicates post-production trimming to improve centering.', difficulty: 'intermediate', xpReward: 15 },
      { id: 'ch_012', moduleId: 'mod_002', cardName: '1975 Topps George Brett RC', cardYear: 1975, cardImage: 'brett_75_topps.jpg', is_authentic: true, defect_annotations: [], explanation: 'Not trimmed. Natural factory cutting marks visible under magnification. Dimensions within standard tolerance range.', difficulty: 'intermediate', xpReward: 15 },
      { id: 'ch_013', moduleId: 'mod_002', cardName: '1971 Topps Nolan Ryan (Trimmed)', cardYear: 1971, cardImage: 'ryan_71_trimmed.jpg', is_authentic: false, defect_annotations: ['Left edge shows micro-polishing marks', 'Height 0.02 inches short', 'Diamond cut pattern absent on trimmed edges'], explanation: 'Trimmed on left edge to remove wear. The polishing marks and missing diamond cut pattern from factory cutting are definitive indicators.', difficulty: 'intermediate', xpReward: 15 },
      { id: 'ch_014', moduleId: 'mod_002', cardName: '2024 Topps Chrome Paul Skenes RC', cardYear: 2024, cardImage: 'skenes_24_chrome.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic, untrimmed. Chrome cards have distinct factory edge characteristics that are preserved here.', difficulty: 'intermediate', xpReward: 15 },
      { id: 'ch_015', moduleId: 'mod_002', cardName: '1990 Leaf Frank Thomas RC (Trimmed)', cardYear: 1990, cardImage: 'thomas_90_trimmed.jpg', is_authentic: false, defect_annotations: ['Top edge razor-cut smooth', 'Card height 3.47 inches', 'Border width asymmetry corrected by trim'], explanation: 'Top edge trimmed to remove centering issue. The razor-smooth top contrasts with natural factory texture on other edges.', difficulty: 'intermediate', xpReward: 15 },
    ],
    mod_003: [
      { id: 'ch_016', moduleId: 'mod_003', cardName: '1933 Goudey Babe Ruth (Recolored)', cardYear: 1933, cardImage: 'ruth_33_recolored.jpg', is_authentic: false, defect_annotations: ['Background color saturation enhanced 20%', 'Skin tone shows modern pigment under UV', 'Color extends into creases unnaturally'], explanation: 'Recolored to enhance eye appeal. Under UV light, modern pigments fluoresce differently than original 1930s inks. Color filling creases is a dead giveaway.', difficulty: 'advanced', xpReward: 20 },
      { id: 'ch_017', moduleId: 'mod_003', cardName: '1952 Topps Willie Mays', cardYear: 1952, cardImage: 'mays_52_topps.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic color. Natural aging and fading patterns consistent with 70+ year old cardboard. No signs of color enhancement.', difficulty: 'advanced', xpReward: 20 },
      { id: 'ch_018', moduleId: 'mod_003', cardName: '1961 Topps Roger Maris (Recolored)', cardYear: 1961, cardImage: 'maris_61_recolored.jpg', is_authentic: false, defect_annotations: ['Yellow border shows brush strokes under magnification', 'Color density uneven across surface', 'Ink pooling visible in text areas'], explanation: 'Border recoloring to hide toning. The brush strokes and uneven density are visible at 10x magnification.', difficulty: 'advanced', xpReward: 20 },
      { id: 'ch_019', moduleId: 'mod_003', cardName: '1969 Topps Nolan Ryan', cardYear: 1969, cardImage: 'ryan_69_topps.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic. Natural toning pattern consistent with age. No evidence of color enhancement or border restoration.', difficulty: 'advanced', xpReward: 20 },
      { id: 'ch_020', moduleId: 'mod_003', cardName: '1956 Topps Mickey Mantle (Recolored)', cardYear: 1956, cardImage: 'mantle_56_recolored.jpg', is_authentic: false, defect_annotations: ['Blue background repainted with acrylic', 'Color sits on top of surface rather than embedded', 'UV reveals dual-layer coloring'], explanation: 'Full background recoloring. The acrylic paint layer is detectable by touch and definitively visible under UV illumination.', difficulty: 'advanced', xpReward: 20 },
    ],
    mod_004: [
      { id: 'ch_021', moduleId: 'mod_004', cardName: '1952 Topps Mantle Reprint (1983)', cardYear: 1983, cardImage: 'mantle_83_reprint.jpg', is_authentic: false, defect_annotations: ['1983 Topps reprint marking on back', 'Paper stock is modern white', 'Print quality exceeds 1952 capabilities'], explanation: 'Official 1983 Topps reprint. Has reprint marking on reverse, but unscrupulous sellers have been known to alter the back.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_022', moduleId: 'mod_004', cardName: '1989 Fleer Bill Ripken FF Error', cardYear: 1989, cardImage: 'ripken_89_fleer.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic error card. The genuine version has specific print characteristics matching Fleer 1989 production runs.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_023', moduleId: 'mod_004', cardName: '1986 Fleer Jordan RC Reprint', cardYear: 2006, cardImage: 'jordan_reprint_06.jpg', is_authentic: false, defect_annotations: ['Card thickness 15% thinner', 'Glossy finish absent from original', 'Back text font differs subtly'], explanation: 'Unauthorized reprint commonly sold at flea markets. Paper stock and finish immediately differentiate from original.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_024', moduleId: 'mod_004', cardName: '1987 Topps Traded Greg Maddux RC', cardYear: 1987, cardImage: 'maddux_87_topps.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic Topps Traded card. All characteristics match known genuine examples from this production run.', difficulty: 'beginner', xpReward: 10 },
      { id: 'ch_025', moduleId: 'mod_004', cardName: '1933 Goudey Ruth Reprint (1980s)', cardYear: 1985, cardImage: 'ruth_reprint_85.jpg', is_authentic: false, defect_annotations: ['Modern paper under UV', 'Printing dots visible at 5x', 'No aging consistent with 1933 origin'], explanation: 'Dover Publications style reprint from the 1980s. Common source of fraud when separated from the reprint set.', difficulty: 'beginner', xpReward: 10 },
    ],
    mod_005: [
      { id: 'ch_026', moduleId: 'mod_005', cardName: 'Mike Trout Signed 2011 Topps Update', cardYear: 2011, cardImage: 'trout_auto_11.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic Trout autograph. Pen pressure, letter formation, and flow are consistent with known certified examples from 2011-2012 signings.', difficulty: 'advanced', xpReward: 20 },
      { id: 'ch_027', moduleId: 'mod_005', cardName: 'Derek Jeter Signed Ball Card', cardYear: 1993, cardImage: 'jeter_auto_fake.jpg', is_authentic: false, defect_annotations: ['J formation inconsistent with Jeter exemplars', 'Pen lift pattern differs from authentic', 'Auto-pen machine regularity detected'], explanation: 'Auto-pen forgery. The mechanical consistency of pen pressure and the uniform speed of strokes indicate machine signing.', difficulty: 'advanced', xpReward: 20 },
      { id: 'ch_028', moduleId: 'mod_005', cardName: 'Shohei Ohtani Signed Chrome RC', cardYear: 2018, cardImage: 'ohtani_auto_18.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic on-card auto. Japanese character formation, pen pressure, and ink type all match Topps Certified examples.', difficulty: 'advanced', xpReward: 20 },
      { id: 'ch_029', moduleId: 'mod_005', cardName: 'Mickey Mantle Signed Photo Card', cardYear: 1960, cardImage: 'mantle_auto_fake.jpg', is_authentic: false, defect_annotations: ['Ink type postdates claimed signing era', 'M formation lacks Mantle characteristic loop', 'Signature baseline angle off by 15 degrees'], explanation: 'Forged Mantle autograph. The ink type (Sharpie) was not available when Mantle was actively signing in this style.', difficulty: 'advanced', xpReward: 20 },
      { id: 'ch_030', moduleId: 'mod_005', cardName: 'Ken Griffey Jr Signed 1989 UD RC', cardYear: 1989, cardImage: 'griffey_auto_89.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic Griffey signature. Consistent with early-career signing style. Blue ballpoint matches era-appropriate signing events.', difficulty: 'advanced', xpReward: 20 },
    ],
    mod_006: [
      { id: 'ch_031', moduleId: 'mod_006', cardName: '2020 National Treasures Burrow RPA', cardYear: 2020, cardImage: 'burrow_nt_patch.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic patch card. Thread pattern, material consistency, and window placement all match Panini production standards.', difficulty: 'expert', xpReward: 25 },
      { id: 'ch_032', moduleId: 'mod_006', cardName: '2018 National Treasures Mahomes RPA', cardYear: 2018, cardImage: 'mahomes_nt_fake.jpg', is_authentic: false, defect_annotations: ['Patch material does not match Nike game jersey specs', 'Window edge shows re-adhesion marks', 'Patch fibers inconsistent with claimed swatch'], explanation: 'Manipulated patch card. The original patch has been replaced with a more visually appealing swatch. Re-adhesion marks at the window edge confirm tampering.', difficulty: 'expert', xpReward: 25 },
      { id: 'ch_033', moduleId: 'mod_006', cardName: '2022 Flawless Wembanyama Patch Auto', cardYear: 2022, cardImage: 'wemby_flawless.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic. Patch material, auto placement, and card construction all verified against Panini Flawless specs.', difficulty: 'expert', xpReward: 25 },
      { id: 'ch_034', moduleId: 'mod_006', cardName: '2019 National Treasures Zion RPA', cardYear: 2019, cardImage: 'zion_nt_manipulated.jpg', is_authentic: false, defect_annotations: ['Color bleeding around patch window inconsistent', 'Patch shows no game wear despite game-used claim', 'Adhesive pattern irregular under UV'], explanation: 'Patch swap detected. The pristine condition of the patch material and irregular adhesive pattern indicate the original patch was replaced.', difficulty: 'expert', xpReward: 25 },
      { id: 'ch_035', moduleId: 'mod_006', cardName: '2023 National Treasures Stroud RPA', cardYear: 2023, cardImage: 'stroud_nt_23.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic RPA. Game wear on patch material, proper adhesion, and matching production serial all confirm legitimacy.', difficulty: 'expert', xpReward: 25 },
    ],
    mod_007: [
      { id: 'ch_036', moduleId: 'mod_007', cardName: '2024 Bowman Chrome Prospect Refractor', cardYear: 2024, cardImage: 'bowman_chrome_fake.jpg', is_authentic: false, defect_annotations: ['Refractor pattern angle incorrect', 'Chrome layer too thin at edges', 'Serial number font kerning off'], explanation: 'Counterfeit modern chrome card. The refractor pattern is generated digitally rather than through genuine Topps chrome plating process.', difficulty: 'intermediate', xpReward: 15 },
      { id: 'ch_037', moduleId: 'mod_007', cardName: '2024 Topps Chrome Gold /50', cardYear: 2024, cardImage: 'chrome_gold_auth.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic numbered parallel. Gold chrome layer, serial number, and card registration all match Topps specs.', difficulty: 'intermediate', xpReward: 15 },
      { id: 'ch_038', moduleId: 'mod_007', cardName: '2023 Bowman Sapphire 1st', cardYear: 2023, cardImage: 'bowman_sapphire_fake.jpg', is_authentic: false, defect_annotations: ['Sapphire texture pattern repeats', 'Card weight 0.5g light', 'UV fluorescence wrong color'], explanation: 'Fake Sapphire parallel. The repeating texture pattern and incorrect UV response indicate digital reproduction of the sapphire finish.', difficulty: 'intermediate', xpReward: 15 },
      { id: 'ch_039', moduleId: 'mod_007', cardName: '2024 Prizm Silver', cardYear: 2024, cardImage: 'prizm_silver_auth.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic Prizm Silver. Holographic pattern depth, card stock weight, and cutting all match Panini production standards.', difficulty: 'intermediate', xpReward: 15 },
      { id: 'ch_040', moduleId: 'mod_007', cardName: '2022 Topps Chrome Refractor', cardYear: 2022, cardImage: 'chrome_ref_fake.jpg', is_authentic: false, defect_annotations: ['Chrome finish peels at corner', 'Base card visible beneath chrome layer', 'Refractor lines too uniform'], explanation: 'A base card with applied chrome film. The peeling at the corner reveals the underlying non-chrome base card.', difficulty: 'intermediate', xpReward: 15 },
    ],
    mod_008: [
      { id: 'ch_041', moduleId: 'mod_008', cardName: 'T206 Honus Wagner (Reprint)', cardYear: 2020, cardImage: 'wagner_reprint.jpg', is_authentic: false, defect_annotations: ['Paper is acid-free modern stock', 'Artificially aged with tea staining', 'Print resolution exceeds original lithography'], explanation: 'Artificially aged reprint. Tea staining and artificial wear cannot replicate genuine 115+ years of natural aging.', difficulty: 'expert', xpReward: 25 },
      { id: 'ch_042', moduleId: 'mod_008', cardName: '1914 Cracker Jack Joe Jackson', cardYear: 1914, cardImage: 'jackson_crackerjack.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic pre-war issue. Paper composition, print technology, and aging are all consistent with 1914 Cracker Jack production.', difficulty: 'expert', xpReward: 25 },
      { id: 'ch_043', moduleId: 'mod_008', cardName: '1916 Sporting News Babe Ruth RC', cardYear: 1916, cardImage: 'ruth_1916_fake.jpg', is_authentic: false, defect_annotations: ['Paper fibers under microscope show modern bleaching', 'Ink chemistry inconsistent with 1916 production', 'Card dimensions off by 1mm'], explanation: 'Sophisticated counterfeit targeting the pre-war market. Microscopic paper analysis reveals modern bleaching chemicals not available in 1916.', difficulty: 'expert', xpReward: 25 },
      { id: 'ch_044', moduleId: 'mod_008', cardName: '1909 T206 Cy Young Portrait', cardYear: 1909, cardImage: 'young_t206.jpg', is_authentic: true, defect_annotations: [], explanation: 'Authentic T206. Piedmont back advertising, paper composition, and lithographic printing all verified against known authentic exemplars.', difficulty: 'expert', xpReward: 25 },
      { id: 'ch_045', moduleId: 'mod_008', cardName: '1933 Goudey Lou Gehrig (Recolored Fake)', cardYear: 1933, cardImage: 'gehrig_33_fake.jpg', is_authentic: false, defect_annotations: ['Base is a low-grade authentic card', 'Colors restored with airbrush', 'Surface coating added post-production'], explanation: 'This started as a genuine low-grade card that was restored and recolored. The airbrush work and surface coating transform a $500 card into a fraudulent $5000+ card.', difficulty: 'expert', xpReward: 25 },
    ],
  };

  return challengeSets[moduleId] ?? [];
}

// ---- Mock Training Modules ----

const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'mod_001', title: 'Counterfeit Card Fundamentals', category: 'fake_detection', difficulty: 'beginner',
    lessons_count: 10, completion_pct: 80,
    description: 'Learn the basics of identifying counterfeit cards across all eras. Covers print quality, paper stock, and common red flags.',
    icon: 'shield', challenges: [],
  },
  {
    id: 'mod_002', title: 'Trimming Detection Masterclass', category: 'trimming', difficulty: 'intermediate',
    lessons_count: 8, completion_pct: 45,
    description: 'Identify cards that have been trimmed to improve centering or remove edge damage. Measurement techniques and edge analysis.',
    icon: 'scissors', challenges: [],
  },
  {
    id: 'mod_003', title: 'Recoloring & Restoration ID', category: 'recoloring', difficulty: 'advanced',
    lessons_count: 7, completion_pct: 20,
    description: 'Detect color enhancement, border recoloring, and restoration attempts that artificially improve card eye appeal.',
    icon: 'palette', challenges: [],
  },
  {
    id: 'mod_004', title: 'Reprint Recognition 101', category: 'reprints', difficulty: 'beginner',
    lessons_count: 10, completion_pct: 90,
    description: 'Distinguish official reprints from originals. Covers paper differences, print technology tells, and common reprint sources.',
    icon: 'copy', challenges: [],
  },
  {
    id: 'mod_005', title: 'Autograph Authentication', category: 'autograph_verification', difficulty: 'advanced',
    lessons_count: 8, completion_pct: 35,
    description: 'Verify genuine autographs versus forgeries and auto-pen signatures. Pen pressure analysis and signature comparison techniques.',
    icon: 'pen-tool', challenges: [],
  },
  {
    id: 'mod_006', title: 'Patch & Relic Manipulation', category: 'patch_manipulation', difficulty: 'expert',
    lessons_count: 6, completion_pct: 10,
    description: 'Detect patch swaps, relic manipulation, and window tampering in memorabilia cards. Advanced material analysis.',
    icon: 'puzzle', challenges: [],
  },
  {
    id: 'mod_007', title: 'Modern Chrome & Refractor Fakes', category: 'fake_detection', difficulty: 'intermediate',
    lessons_count: 8, completion_pct: 55,
    description: 'Identify counterfeit chrome, refractor, and prizm cards. Focus on finish analysis, weight testing, and UV verification.',
    icon: 'sparkles', challenges: [],
  },
  {
    id: 'mod_008', title: 'Pre-War & Vintage Expert Lab', category: 'fake_detection', difficulty: 'expert',
    lessons_count: 6, completion_pct: 15,
    description: 'Advanced authentication of pre-war tobacco cards, early Goudey, and vintage Topps/Bowman. Paper science and ink chemistry.',
    icon: 'microscope', challenges: [],
  },
];

// Initialize challenges
TRAINING_MODULES.forEach(mod => {
  mod.challenges = makeChallenges(mod.id, mod.category, mod.difficulty);
});

// ---- Mock User Progress ----

const DEFAULT_PROGRESS: UserProgress = {
  modules_completed: 2,
  accuracy_score: 78,
  streak: 12,
  level: 14,
  xp: 1380,
  xp_to_next: 1400,
  total_challenges: 156,
  correct_answers: 122,
  wrong_answers: 34,
  badges: [
    { id: 'badge_001', name: 'First Steps', description: 'Complete your first challenge', icon: 'star', earnedDate: '2025-06-15', requirement: 'Complete 1 challenge' },
    { id: 'badge_002', name: 'Sharp Eye', description: 'Get 10 correct answers in a row', icon: 'eye', earnedDate: '2025-07-22', requirement: '10 streak' },
    { id: 'badge_003', name: 'Reprint Spotter', description: 'Complete the Reprint Recognition module', icon: 'copy', earnedDate: '2025-08-10', requirement: 'Complete mod_004' },
    { id: 'badge_004', name: 'Fake Buster', description: 'Complete Counterfeit Fundamentals', icon: 'shield-check', earnedDate: '2025-09-05', requirement: 'Complete mod_001' },
    { id: 'badge_005', name: 'Century Club', description: 'Complete 100 challenges', icon: 'trophy', earnedDate: '2025-11-20', requirement: '100 challenges' },
    { id: 'badge_006', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'flame', earnedDate: '2025-10-01', requirement: '7-day streak' },
    { id: 'badge_007', name: 'Precision Expert', description: 'Achieve 80% accuracy over 50+ challenges', icon: 'target', earnedDate: null, requirement: '80% accuracy, 50+ attempts' },
    { id: 'badge_008', name: 'Vintage Master', description: 'Complete the Pre-War Expert Lab', icon: 'crown', earnedDate: null, requirement: 'Complete mod_008' },
    { id: 'badge_009', name: 'Auto Authority', description: 'Complete Autograph Authentication with 85%+', icon: 'pen-tool', earnedDate: null, requirement: 'Complete mod_005 with 85%+' },
    { id: 'badge_010', name: 'Grand Master', description: 'Reach level 50', icon: 'gem', earnedDate: null, requirement: 'Reach level 50' },
  ],
};

// ---- Mock Community Reviews ----

const COMMUNITY_REVIEWS: CommunityReview[] = [
  {
    id: 'cr_001', cardName: '1986 Fleer Jordan RC Submitted by User', cardYear: 1986,
    submittedBy: 'CardNovice42', submittedDate: '2026-03-12',
    opinions: { authentic: 34, fake: 128, uncertain: 15 },
    status: 'resolved', expertVerdict: 'Confirmed counterfeit - dot matrix printing pattern inconsistent with original Fleer production',
  },
  {
    id: 'cr_002', cardName: '2024 Bowman Chrome Prospect Auto /25', cardYear: 2024,
    submittedBy: 'ChromeCollector', submittedDate: '2026-03-13',
    opinions: { authentic: 89, fake: 12, uncertain: 22 },
    status: 'pending', expertVerdict: null,
  },
  {
    id: 'cr_003', cardName: '1952 Topps Mantle - Possible Trimmed', cardYear: 1952,
    submittedBy: 'VintageHunter', submittedDate: '2026-03-11',
    opinions: { authentic: 45, fake: 67, uncertain: 38 },
    status: 'escalated', expertVerdict: null,
  },
  {
    id: 'cr_004', cardName: 'Signed Griffey Jr 1989 UD RC', cardYear: 1989,
    submittedBy: 'AutoCollector', submittedDate: '2026-03-10',
    opinions: { authentic: 102, fake: 8, uncertain: 11 },
    status: 'resolved', expertVerdict: 'Authentic signature - matches JSA certified exemplars',
  },
  {
    id: 'cr_005', cardName: '2023 National Treasures RPA Patch Swap?', cardYear: 2023,
    submittedBy: 'PatchPatrol', submittedDate: '2026-03-09',
    opinions: { authentic: 23, fake: 89, uncertain: 34 },
    status: 'escalated', expertVerdict: null,
  },
  {
    id: 'cr_006', cardName: '1971 Topps Clemente - Recolored Borders?', cardYear: 1971,
    submittedBy: 'RestorationWatch', submittedDate: '2026-03-08',
    opinions: { authentic: 56, fake: 41, uncertain: 28 },
    status: 'pending', expertVerdict: null,
  },
];

// ---- Mock Era Guides ----

const ERA_GUIDES: EraGuide[] = [
  {
    era: 'pre_war', title: 'Pre-War Authentication (Pre-1945)',
    description: 'Tobacco cards, Goudey, Play Ball, and early strip cards. Paper science and lithographic analysis.',
    commonFakes: ['T206 Wagner reprints', 'Goudey Ruth recolored low-grade', '1933 DeLong reprints', 'Artificially aged modern prints'],
    keyTells: ['Paper fiber composition under microscope', 'Lithographic dot pattern analysis', 'Ink chemistry aging profile', 'Natural vs artificial patina', 'Back advertisement verification'],
    difficultyLevel: 'expert',
  },
  {
    era: 'vintage', title: 'Vintage Authentication (1948-1979)',
    description: 'Topps, Bowman, and Fleer golden age cards. Focus on printing technology transitions and paper stock changes.',
    commonFakes: ['1952 Topps high numbers reprints', 'Trimmed vintage stars to improve grade', 'Recolored borders on yellowed cards', 'Back-altered reprints removing reprint markings'],
    keyTells: ['Factory cutting pattern analysis', 'Period-correct paper stock weight', 'Color registration alignment', 'Centering variance vs era norms', 'Wax pack residue patterns'],
    difficultyLevel: 'advanced',
  },
  {
    era: 'junk_wax', title: 'Junk Wax Era (1986-1993)',
    description: 'Mass-produced era with unique authentication challenges. Reprints are extremely common and quality varies widely.',
    commonFakes: ['1986 Fleer Jordan RC reprints (millions exist)', 'Altered rookie card error variations', 'Fake insert cards from later reprint sets', 'Trimmed junk wax to create PSA 10 candidates'],
    keyTells: ['Card stock thickness and flexibility', 'UV fluorescence testing', 'Glossy vs matte finish verification', 'Reprint set identification markers', 'Correct back numbering and copyright'],
    difficultyLevel: 'beginner',
  },
  {
    era: 'modern', title: 'Modern Era (1994-2015)',
    description: 'Introduction of chrome, refractors, and premium products. Authentication focuses on finish analysis and serial numbers.',
    commonFakes: ['Fake refractor finishes applied to base cards', 'Altered serial numbers on numbered cards', 'Counterfeit autograph sticker cards', 'Fake patch/relic windows'],
    keyTells: ['Chrome plating depth and consistency', 'Serial number font and ink analysis', 'Autograph sticker adhesive verification', 'Relic window seal integrity', 'UV response of chrome surfaces'],
    difficultyLevel: 'intermediate',
  },
  {
    era: 'ultra_modern', title: 'Ultra-Modern Era (2016+)',
    description: 'Current production with advanced security features. Rising counterfeit sophistication requires cutting-edge detection.',
    commonFakes: ['Counterfeit Bowman 1st Chrome autos', 'Fake Prizm Silver parallels', 'Manipulated patch cards for higher value swatches', 'Reprinted numbered parallels', 'Forged on-card autographs'],
    keyTells: ['Holographic security feature verification', 'Card weight precision testing', 'QR code and serial number database checks', 'Chrome finish UV fluorescence', 'On-card auto ink penetration depth'],
    difficultyLevel: 'intermediate',
  },
];

// ---- Mock Leaderboard ----

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'AuthMaster99', avatar: 'AM', level: 47, xp: 4680, accuracy: 96, streak: 45, badges: 9 },
  { rank: 2, username: 'FakeBusterPro', avatar: 'FB', level: 42, xp: 4150, accuracy: 94, streak: 32, badges: 8 },
  { rank: 3, username: 'VintageVerifier', avatar: 'VV', level: 38, xp: 3780, accuracy: 91, streak: 28, badges: 8 },
  { rank: 4, username: 'GradeGuardian', avatar: 'GG', level: 35, xp: 3450, accuracy: 89, streak: 21, badges: 7 },
  { rank: 5, username: 'ChromeChecker', avatar: 'CC', level: 31, xp: 3080, accuracy: 87, streak: 18, badges: 7 },
  { rank: 6, username: 'SlabScientist', avatar: 'SS', level: 28, xp: 2780, accuracy: 85, streak: 15, badges: 6 },
  { rank: 7, username: 'PatchPatrol', avatar: 'PP', level: 25, xp: 2480, accuracy: 84, streak: 14, badges: 6 },
  { rank: 8, username: 'AutoAnalyst', avatar: 'AA', level: 22, xp: 2180, accuracy: 82, streak: 11, badges: 5 },
  { rank: 9, username: 'You', avatar: 'ME', level: 14, xp: 1380, accuracy: 78, streak: 12, badges: 6 },
  { rank: 10, username: 'CardCop', avatar: 'CP', level: 12, xp: 1180, accuracy: 76, streak: 8, badges: 4 },
  { rank: 11, username: 'TrimDetector', avatar: 'TD', level: 10, xp: 980, accuracy: 74, streak: 6, badges: 3 },
  { rank: 12, username: 'NewbieNick', avatar: 'NN', level: 5, xp: 480, accuracy: 68, streak: 3, badges: 2 },
];

// ---- Accuracy Trend Data ----

const ACCURACY_TRENDS: AccuracyTrend[] = [
  { week: 'W1 Jan', accuracy: 62, challenges: 8 },
  { week: 'W2 Jan', accuracy: 65, challenges: 10 },
  { week: 'W3 Jan', accuracy: 68, challenges: 12 },
  { week: 'W4 Jan', accuracy: 66, challenges: 9 },
  { week: 'W1 Feb', accuracy: 71, challenges: 14 },
  { week: 'W2 Feb', accuracy: 73, challenges: 11 },
  { week: 'W3 Feb', accuracy: 72, challenges: 13 },
  { week: 'W4 Feb', accuracy: 76, challenges: 15 },
  { week: 'W1 Mar', accuracy: 78, challenges: 12 },
  { week: 'W2 Mar', accuracy: 80, challenges: 16 },
  { week: 'W3 Mar', accuracy: 79, challenges: 14 },
  { week: 'W4 Mar', accuracy: 82, challenges: 12 },
];

// ---- Public API ----

export function getCategoryLabel(category: TrainingCategory): string {
  return CATEGORY_LABELS[category];
}

export function getCategoryColor(category: TrainingCategory): { text: string; bg: string; border: string } {
  return CATEGORY_COLORS[category];
}

export function getDifficultyColor(difficulty: Difficulty): { text: string; bg: string } {
  return DIFFICULTY_COLORS[difficulty];
}

export function getTrainingModules(): TrainingModule[] {
  return TRAINING_MODULES;
}

export function getModuleDetail(id: string): TrainingModule | undefined {
  return TRAINING_MODULES.find(m => m.id === id);
}

export function getNextChallenge(moduleId: string): TrainingChallenge | null {
  const mod = TRAINING_MODULES.find(m => m.id === moduleId);
  if (!mod || mod.challenges.length === 0) return null;
  const completedIds = loadData<string[]>(`completed_${moduleId}`) ?? [];
  const remaining = mod.challenges.filter(c => !completedIds.includes(c.id));
  return remaining.length > 0 ? remaining[0] : mod.challenges[Math.floor(Math.random() * mod.challenges.length)];
}

export function submitAnswer(challengeId: string, answer: boolean): { correct: boolean; xpEarned: number; explanation: string } {
  const allChallenges = TRAINING_MODULES.flatMap(m => m.challenges);
  const challenge = allChallenges.find(c => c.id === challengeId);
  if (!challenge) return { correct: false, xpEarned: 0, explanation: 'Challenge not found' };

  const correct = answer === challenge.is_authentic;
  const xpEarned = correct ? XP_PER_CORRECT : XP_PER_WRONG;

  // Update progress
  const progress = getUserProgress();
  if (correct) {
    progress.correct_answers += 1;
    progress.streak += 1;
    progress.xp += XP_PER_CORRECT;
  } else {
    progress.wrong_answers += 1;
    progress.streak = 0;
    progress.xp = Math.max(0, progress.xp + XP_PER_WRONG);
  }
  progress.total_challenges += 1;
  progress.accuracy_score = Math.round((progress.correct_answers / progress.total_challenges) * 100);
  progress.level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  progress.xp_to_next = (progress.level) * XP_PER_LEVEL;
  saveData('progress', progress);

  // Track completed
  const completedIds = loadData<string[]>(`completed_${challenge.moduleId}`) ?? [];
  if (!completedIds.includes(challengeId)) {
    completedIds.push(challengeId);
    saveData(`completed_${challenge.moduleId}`, completedIds);
  }

  return { correct, xpEarned, explanation: challenge.explanation };
}

export function getUserProgress(): UserProgress {
  const cached = loadData<UserProgress>('progress');
  if (cached) return cached;
  saveData('progress', DEFAULT_PROGRESS);
  return { ...DEFAULT_PROGRESS };
}

export function getAccuracyScore(): number {
  return getUserProgress().accuracy_score;
}

export function getAuthConfidence(): AuthConfidenceScore {
  const progress = getUserProgress();
  return {
    overall: progress.accuracy_score,
    byCategory: [
      { category: 'fake_detection', score: 82, attempts: 45 },
      { category: 'trimming', score: 71, attempts: 22 },
      { category: 'recoloring', score: 65, attempts: 14 },
      { category: 'reprints', score: 92, attempts: 38 },
      { category: 'autograph_verification', score: 68, attempts: 18 },
      { category: 'patch_manipulation', score: 55, attempts: 8 },
    ],
  };
}

export function getCommunityReviews(): CommunityReview[] {
  return COMMUNITY_REVIEWS;
}

export function submitCommunityReview(cardName: string, opinion: 'authentic' | 'fake' | 'uncertain'): CommunityReview {
  const newReview: CommunityReview = {
    id: `cr_new_${Date.now()}`,
    cardName,
    cardYear: 2024,
    submittedBy: 'You',
    submittedDate: new Date().toISOString().split('T')[0],
    opinions: { authentic: opinion === 'authentic' ? 1 : 0, fake: opinion === 'fake' ? 1 : 0, uncertain: opinion === 'uncertain' ? 1 : 0 },
    status: 'pending',
    expertVerdict: null,
  };
  return newReview;
}

export function getExpertAnnotations(cardId: string): ExpertAnnotation[] {
  return [
    { id: `ea_${cardId}_1`, cardId, expert: 'PSA Authenticator', annotation: 'Surface analysis shows no evidence of tampering', region: 'Full surface', confidence: 95 },
    { id: `ea_${cardId}_2`, cardId, expert: 'BGS Expert', annotation: 'Edge inspection clear, no trimming detected', region: 'All edges', confidence: 92 },
    { id: `ea_${cardId}_3`, cardId, expert: 'Community Veteran', annotation: 'Print pattern consistent with production run', region: 'Print area', confidence: 88 },
  ];
}

export function getEraGuides(): EraGuide[] {
  return ERA_GUIDES;
}

export function getLeaderboard(): LeaderboardEntry[] {
  return LEADERBOARD;
}

export function getBadges(): Badge[] {
  return getUserProgress().badges;
}

export function getStreak(): number {
  return getUserProgress().streak;
}

export function getLevelProgress(): { level: number; xp: number; xpToNext: number; pct: number } {
  const p = getUserProgress();
  const xpInLevel = p.xp % XP_PER_LEVEL;
  return { level: p.level, xp: p.xp, xpToNext: p.xp_to_next, pct: Math.round((xpInLevel / XP_PER_LEVEL) * 100) };
}

export function getModulesByDifficulty(difficulty: Difficulty): TrainingModule[] {
  return TRAINING_MODULES.filter(m => m.difficulty === difficulty);
}

export function getAccuracyTrends(): AccuracyTrend[] {
  return ACCURACY_TRENDS;
}
