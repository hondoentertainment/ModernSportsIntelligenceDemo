// Card Genome Sequencer Service
// The "23andMe of Trading Cards" — breaks every card into measurable genetic markers
// producing a unique genome fingerprint for condition analysis, comparison, and valuation.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type GeneDominance = 'dominant' | 'recessive' | 'codominant';

export type GeneCategory = 'Physical' | 'Visual' | 'Chemical' | 'Rarity';

export interface CardGene {
  name: string;
  category: GeneCategory;
  score: number; // 0-100
  percentile: number; // 0-100 relative to population
  dominance: GeneDominance;
  weight: number; // contribution weight to overall genome 0-1
  description: string;
}

export interface GenomeSnapshot {
  date: string; // ISO date
  genes: Record<string, number>; // gene name -> score
  overallScore: number;
  trigger: string; // what caused the re-evaluation
}

export interface GenomeProfile {
  id: string;
  cardName: string;
  player: string;
  year: number;
  sport: string;
  set: string;
  cardNumber: string;
  genes: CardGene[];
  overallGenomeScore: number;
  rarityDNA: string; // hex fingerprint e.g. "3F7A2B9E"
  genomeSimilarity: number; // 0-100 similarity to population average
  mutationFlags: string[]; // anomalies detected
  heritageLineage: string[]; // print lineage / related cards
  sequencedAt: string; // ISO timestamp
  confidence: number; // 0-100 sequencing confidence
}

export interface GenomePairMatch {
  card1: GenomeProfile;
  card2: GenomeProfile;
  geneticDistance: number; // 0-100, 0 = identical
  sharedTraits: string[];
  divergentTraits: string[];
  compatibilityScore: number; // 0-100
  recommendation: string;
}

export interface GeneDistributionBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface ClusterGroup {
  id: string;
  label: string;
  centroidX: number;
  centroidY: number;
  cardCount: number;
  avgGenomeScore: number;
  cards: string[]; // card IDs
}

export interface PopulationGenomics {
  totalCards: number;
  avgGenomeScore: number;
  medianGenomeScore: number;
  stdDeviation: number;
  geneDistributions: Record<string, GeneDistributionBucket[]>;
  outlierCards: GenomeProfile[];
  clusterGroups: ClusterGroup[];
  topPercentileThreshold: number;
  sport: string;
  year: number;
}

export interface GenomeEvolution {
  cardId: string;
  cardName: string;
  snapshots: GenomeSnapshot[];
  totalDrift: number; // cumulative score change
  mostVolatileGene: string;
  mostStableGene: string;
  trend: 'improving' | 'degrading' | 'stable';
}

export interface GradePrediction {
  predictedPSA: number;
  psaConfidence: number;
  predictedBGS: number;
  bgsConfidence: number;
  predictedSGC: number;
  sgcConfidence: number;
  subgrades: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  limitingFactor: string;
  estimatedValue: { raw: number; graded: number; premium: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// Gene Definitions — 18 gene categories across 4 families
// ─────────────────────────────────────────────────────────────────────────────

export const GENE_DEFINITIONS: Array<{
  name: string;
  category: GeneCategory;
  weight: number;
  description: string;
}> = [
  // Physical (card condition pillars)
  { name: 'Centering', category: 'Physical', weight: 0.09, description: 'Front/back print centering ratio (60/40 = perfect, 50/50 = off)' },
  { name: 'Corner Integrity', category: 'Physical', weight: 0.09, description: 'Sharpness and structural integrity of all four corners' },
  { name: 'Edge Sharpness', category: 'Physical', weight: 0.08, description: 'Consistency and sharpness along all four edges' },
  { name: 'Surface Quality', category: 'Physical', weight: 0.08, description: 'Freedom from scratches, print lines, and surface imperfections' },

  // Visual (aesthetic and print quality)
  { name: 'Color Saturation', category: 'Visual', weight: 0.06, description: 'Vibrancy and depth of printed colors relative to reference' },
  { name: 'Print Registration', category: 'Visual', weight: 0.06, description: 'Alignment accuracy of color layers during printing' },
  { name: 'Gloss Uniformity', category: 'Visual', weight: 0.05, description: 'Evenness of coating/gloss across the card surface' },
  { name: 'Contrast Ratio', category: 'Visual', weight: 0.05, description: 'Dynamic range between lightest and darkest printed areas' },
  { name: 'Foil Reflectivity', category: 'Visual', weight: 0.04, description: 'Brilliance and consistency of foil/refractor elements' },

  // Chemical (longevity markers)
  { name: 'Paper Composition', category: 'Chemical', weight: 0.04, description: 'Card stock quality, thickness, and structural resilience' },
  { name: 'Ink Adhesion', category: 'Chemical', weight: 0.04, description: 'Bond strength of ink to card substrate' },
  { name: 'UV Resistance', category: 'Chemical', weight: 0.04, description: 'Resistance to fading and yellowing under UV exposure' },
  { name: 'Age Stability', category: 'Chemical', weight: 0.05, description: 'Projected condition retention over time based on material analysis' },
  { name: 'Moisture Tolerance', category: 'Chemical', weight: 0.03, description: 'Resistance to warping and damage from humidity' },

  // Rarity (scarcity and collectibility genes)
  { name: 'Print Run Scarcity', category: 'Rarity', weight: 0.06, description: 'Inverse of total print run — fewer cards = higher score' },
  { name: 'Variant Multiplier', category: 'Rarity', weight: 0.05, description: 'Boost from parallel/variant status (refractor, prizm, auto, etc.)' },
  { name: 'Serial Proximity', category: 'Rarity', weight: 0.04, description: 'Closeness to desirable serial numbers (1/1, jersey #, etc.)' },
  { name: 'Error Gene', category: 'Rarity', weight: 0.05, description: 'Presence and desirability of print errors or anomalies' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed helper
// ─────────────────────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickDominance(score: number): GeneDominance {
  if (score >= 80) return 'dominant';
  if (score <= 40) return 'recessive';
  return 'codominant';
}

function generateGenes(rand: () => number, baseQuality: number, rarityBias: number): CardGene[] {
  return GENE_DEFINITIONS.map((def) => {
    let base = baseQuality + (rand() - 0.5) * 30;
    if (def.category === 'Rarity') base = base * 0.7 + rarityBias * 0.3;
    const score = Math.max(5, Math.min(100, Math.round(base + (rand() - 0.5) * 20)));
    const percentile = Math.max(1, Math.min(99, Math.round(score + (rand() - 0.5) * 15)));
    return {
      name: def.name,
      category: def.category,
      score,
      percentile,
      dominance: pickDominance(score),
      weight: def.weight,
      description: def.description,
    };
  });
}

function computeOverallScore(genes: CardGene[]): number {
  const totalWeight = genes.reduce((s, g) => s + g.weight, 0);
  const weighted = genes.reduce((s, g) => s + g.score * g.weight, 0);
  return Math.round((weighted / totalWeight) * 10) / 10;
}

function computeRarityDNA(genes: CardGene[]): string {
  let hash = 0;
  genes.forEach((g) => {
    hash = ((hash << 5) - hash + g.score * 7 + g.percentile * 3) | 0;
  });
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

function detectMutations(genes: CardGene[]): string[] {
  const flags: string[] = [];
  const centering = genes.find((g) => g.name === 'Centering');
  const errorGene = genes.find((g) => g.name === 'Error Gene');
  const foil = genes.find((g) => g.name === 'Foil Reflectivity');
  if (centering && centering.score < 30) flags.push('SEVERE_MISCUT');
  if (centering && centering.score > 95) flags.push('FACTORY_PERFECT_CENTERING');
  if (errorGene && errorGene.score > 85) flags.push('DESIRABLE_ERROR_VARIANT');
  if (foil && foil.score > 95) flags.push('PRISMATIC_ANOMALY');
  const avgPhysical = genes.filter((g) => g.category === 'Physical').reduce((s, g) => s + g.score, 0) / 4;
  if (avgPhysical > 92) flags.push('GEM_MINT_CANDIDATE');
  if (avgPhysical < 35) flags.push('SIGNIFICANT_WEAR');
  const variance = genes.reduce((s, g) => s + Math.pow(g.score - computeOverallScore(genes), 2), 0) / genes.length;
  if (Math.sqrt(variance) > 25) flags.push('HIGH_GENE_VARIANCE');
  return flags;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Card Database — 24 fully profiled cards
// ─────────────────────────────────────────────────────────────────────────────

interface CardSeed {
  id: string;
  cardName: string;
  player: string;
  year: number;
  sport: string;
  set: string;
  cardNumber: string;
  baseQuality: number;
  rarityBias: number;
  lineage: string[];
}

const CARD_SEEDS: CardSeed[] = [
  { id: 'cg-001', cardName: '2023 Prizm Silver Victor Wembanyama RC', player: 'Victor Wembanyama', year: 2023, sport: 'Basketball', set: 'Panini Prizm', cardNumber: '275', baseQuality: 88, rarityBias: 82, lineage: ['2018 Prizm Luka Doncic', '2019 Prizm Zion Williamson'] },
  { id: 'cg-002', cardName: '2018 Prizm Silver Luka Doncic RC', player: 'Luka Doncic', year: 2018, sport: 'Basketball', set: 'Panini Prizm', cardNumber: '280', baseQuality: 91, rarityBias: 78, lineage: ['2012 Prizm Anthony Davis', '2017 Prizm Jayson Tatum'] },
  { id: 'cg-003', cardName: '2020 Mosaic Pink Camo Ja Morant', player: 'Ja Morant', year: 2020, sport: 'Basketball', set: 'Panini Mosaic', cardNumber: '219', baseQuality: 72, rarityBias: 65, lineage: ['2019 Mosaic Base Ja Morant', '2020 Prizm Ja Morant'] },
  { id: 'cg-004', cardName: '1986 Fleer Michael Jordan RC #57', player: 'Michael Jordan', year: 1986, sport: 'Basketball', set: 'Fleer', cardNumber: '57', baseQuality: 62, rarityBias: 98, lineage: ['1984 Star Michael Jordan XRC', '1986 Fleer Sticker MJ'] },
  { id: 'cg-005', cardName: '2022 Topps Chrome Gold Julio Rodriguez RC /50', player: 'Julio Rodriguez', year: 2022, sport: 'Baseball', set: 'Topps Chrome', cardNumber: '164', baseQuality: 85, rarityBias: 90, lineage: ['2022 Topps Series 1 Julio Rodriguez', '2022 Bowman Chrome Julio Rodriguez'] },
  { id: 'cg-006', cardName: '2011 Topps Update Mike Trout RC #US175', player: 'Mike Trout', year: 2011, sport: 'Baseball', set: 'Topps Update', cardNumber: 'US175', baseQuality: 75, rarityBias: 95, lineage: ['2009 Bowman Chrome Mike Trout', '2011 Bowman Mike Trout'] },
  { id: 'cg-007', cardName: '2020 Prizm Black Finite Justin Herbert RC 1/1', player: 'Justin Herbert', year: 2020, sport: 'Football', set: 'Panini Prizm', cardNumber: '325', baseQuality: 93, rarityBias: 100, lineage: ['2020 Optic Justin Herbert', '2020 Select Justin Herbert'] },
  { id: 'cg-008', cardName: '2000 Playoff Contenders Tom Brady Auto RC #144', player: 'Tom Brady', year: 2000, sport: 'Football', set: 'Playoff Contenders', cardNumber: '144', baseQuality: 58, rarityBias: 97, lineage: ['2000 SPx Tom Brady', '2000 Press Pass Tom Brady'] },
  { id: 'cg-009', cardName: '2015 Topps Chrome Patrick Mahomes II RC', player: 'Patrick Mahomes', year: 2017, sport: 'Football', set: 'Topps Chrome', cardNumber: '1', baseQuality: 82, rarityBias: 85, lineage: ['2017 Donruss Optic Mahomes', '2017 Panini Prizm Mahomes'] },
  { id: 'cg-010', cardName: '2023 Topps Chrome Refractor Corbin Carroll RC', player: 'Corbin Carroll', year: 2023, sport: 'Baseball', set: 'Topps Chrome', cardNumber: '200', baseQuality: 90, rarityBias: 70, lineage: ['2023 Topps Series 1 Corbin Carroll', '2022 Bowman Chrome Carroll'] },
  { id: 'cg-011', cardName: '2019 Prizm Neon Green Zion Williamson RC /25', player: 'Zion Williamson', year: 2019, sport: 'Basketball', set: 'Panini Prizm', cardNumber: '248', baseQuality: 78, rarityBias: 88, lineage: ['2019 Hoops Zion Williamson', '2019 Mosaic Zion Williamson'] },
  { id: 'cg-012', cardName: '2022 Panini National Treasures Brock Purdy RPA /99', player: 'Brock Purdy', year: 2022, sport: 'Football', set: 'National Treasures', cardNumber: '164', baseQuality: 86, rarityBias: 92, lineage: ['2022 Prizm Brock Purdy', '2022 Optic Brock Purdy'] },
  { id: 'cg-013', cardName: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle', year: 1952, sport: 'Baseball', set: 'Topps', cardNumber: '311', baseQuality: 38, rarityBias: 100, lineage: ['1951 Bowman Mickey Mantle', '1953 Topps Mickey Mantle'] },
  { id: 'cg-014', cardName: '2023 Topps Inception Elly De La Cruz Auto /75', player: 'Elly De La Cruz', year: 2023, sport: 'Baseball', set: 'Topps Inception', cardNumber: 'IA-EC', baseQuality: 92, rarityBias: 86, lineage: ['2023 Bowman Chrome Elly DLCR', '2023 Topps Series 2 DLCR'] },
  { id: 'cg-015', cardName: '2018 Optic Rated Rookie Shai Gilgeous-Alexander', player: 'Shai Gilgeous-Alexander', year: 2018, sport: 'Basketball', set: 'Donruss Optic', cardNumber: '162', baseQuality: 80, rarityBias: 72, lineage: ['2018 Prizm SGA', '2018 Select SGA'] },
  { id: 'cg-016', cardName: '2023 Bowman Chrome 1st Ethan Salas Auto', player: 'Ethan Salas', year: 2023, sport: 'Baseball', set: 'Bowman Chrome', cardNumber: 'CPA-ES', baseQuality: 94, rarityBias: 88, lineage: ['2023 Bowman 1st Ethan Salas', '2023 Bowman Chrome Draft Salas'] },
  { id: 'cg-017', cardName: '2022 Panini Prizm Shimmer Paolo Banchero RC', player: 'Paolo Banchero', year: 2022, sport: 'Basketball', set: 'Panini Prizm', cardNumber: '231', baseQuality: 84, rarityBias: 75, lineage: ['2022 Hoops Paolo Banchero', '2022 Select Paolo Banchero'] },
  { id: 'cg-018', cardName: '2024 Topps Chrome Refractor Paul Skenes RC', player: 'Paul Skenes', year: 2024, sport: 'Baseball', set: 'Topps Chrome', cardNumber: '150', baseQuality: 95, rarityBias: 80, lineage: ['2024 Topps Series 1 Skenes', '2023 Bowman Chrome 1st Skenes'] },
  { id: 'cg-019', cardName: '1993 SP Foil Derek Jeter RC #279', player: 'Derek Jeter', year: 1993, sport: 'Baseball', set: 'Upper Deck SP', cardNumber: '279', baseQuality: 55, rarityBias: 94, lineage: ['1992 Classic Draft Derek Jeter', '1993 Topps Derek Jeter'] },
  { id: 'cg-020', cardName: '2023 Prizm Color Blast Chet Holmgren', player: 'Chet Holmgren', year: 2023, sport: 'Basketball', set: 'Panini Prizm', cardNumber: 'CB-11', baseQuality: 89, rarityBias: 93, lineage: ['2022 Prizm Chet Holmgren', '2023 Select Chet Holmgren'] },
  { id: 'cg-021', cardName: '2020 Bowman Chrome Sapphire Jasson Dominguez 1st /75', player: 'Jasson Dominguez', year: 2020, sport: 'Baseball', set: 'Bowman Chrome', cardNumber: 'BCP-8', baseQuality: 87, rarityBias: 85, lineage: ['2020 Bowman 1st Dominguez', '2020 Bowman Chrome Dominguez'] },
  { id: 'cg-022', cardName: '2018 National Treasures Lamar Jackson RPA /99', player: 'Lamar Jackson', year: 2018, sport: 'Football', set: 'National Treasures', cardNumber: '178', baseQuality: 76, rarityBias: 89, lineage: ['2018 Prizm Lamar Jackson', '2018 Optic Lamar Jackson'] },
  { id: 'cg-023', cardName: '2022 Topps Chrome Black CJ Stroud Auto /199', player: 'CJ Stroud', year: 2023, sport: 'Football', set: 'Topps Chrome', cardNumber: 'CBA-CS', baseQuality: 88, rarityBias: 84, lineage: ['2023 Prizm CJ Stroud', '2023 Select CJ Stroud'] },
  { id: 'cg-024', cardName: '2003 Topps Chrome Refractor LeBron James RC #111', player: 'LeBron James', year: 2003, sport: 'Basketball', set: 'Topps Chrome', cardNumber: '111', baseQuality: 67, rarityBias: 99, lineage: ['2003 Bowman Chrome LeBron', '2003 Upper Deck LeBron'] },
];

// Build full genome profiles
function buildProfile(seed: CardSeed): GenomeProfile {
  const rand = seededRandom(seed.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 31);
  const genes = generateGenes(rand, seed.baseQuality, seed.rarityBias);
  const overall = computeOverallScore(genes);
  const rarityDNA = computeRarityDNA(genes);
  const mutations = detectMutations(genes);
  const similarity = Math.max(20, Math.min(95, Math.round(60 + (rand() - 0.5) * 40)));

  return {
    id: seed.id,
    cardName: seed.cardName,
    player: seed.player,
    year: seed.year,
    sport: seed.sport,
    set: seed.set,
    cardNumber: seed.cardNumber,
    genes,
    overallGenomeScore: overall,
    rarityDNA,
    genomeSimilarity: similarity,
    mutationFlags: mutations,
    heritageLineage: seed.lineage,
    sequencedAt: new Date(2025, 0, 15 + Math.floor(rand() * 60)).toISOString(),
    confidence: Math.round(85 + rand() * 14),
  };
}

const GENOME_DATABASE: Map<string, GenomeProfile> = new Map();
CARD_SEEDS.forEach((seed) => {
  GENOME_DATABASE.set(seed.id, buildProfile(seed));
});

// ─────────────────────────────────────────────────────────────────────────────
// Evolution snapshot generator
// ─────────────────────────────────────────────────────────────────────────────

function generateEvolutionSnapshots(profile: GenomeProfile): GenomeSnapshot[] {
  const rand = seededRandom(profile.id.charCodeAt(3) * 97 + profile.year);
  const triggers = [
    'Initial sequencing',
    'Post-grading rescan',
    '6-month environment audit',
    'UV exposure test update',
    'Annual recalibration',
    'Holder transfer rescan',
  ];
  const snapshots: GenomeSnapshot[] = [];
  let currentGenes: Record<string, number> = {};
  profile.genes.forEach((g) => {
    currentGenes[g.name] = g.score;
  });

  for (let i = 0; i < triggers.length; i++) {
    const genesCopy = { ...currentGenes };
    // Apply drift
    if (i > 0) {
      Object.keys(genesCopy).forEach((key) => {
        const drift = (rand() - 0.55) * 4; // slight downward bias over time
        genesCopy[key] = Math.max(5, Math.min(100, Math.round(genesCopy[key] + drift)));
      });
      currentGenes = genesCopy;
    }
    const values = Object.values(genesCopy);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    snapshots.push({
      date: new Date(2024, i * 2, 1 + Math.floor(rand() * 28)).toISOString().split('T')[0],
      genes: { ...genesCopy },
      overallScore: Math.round(avg * 10) / 10,
      trigger: triggers[i],
    });
  }
  return snapshots;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Functions
// ─────────────────────────────────────────────────────────────────────────────

/** Retrieve the full genome profile for a card */
export async function getCardGenome(cardId: string): Promise<GenomeProfile | null> {
  await simulateLatency(180);
  return GENOME_DATABASE.get(cardId) ?? null;
}

/** Get all available genome profiles */
export async function getAllGenomes(): Promise<GenomeProfile[]> {
  await simulateLatency(120);
  return Array.from(GENOME_DATABASE.values());
}

/** Compare two card genomes side by side */
export async function compareGenomes(id1: string, id2: string): Promise<GenomePairMatch | null> {
  await simulateLatency(250);
  const card1 = GENOME_DATABASE.get(id1);
  const card2 = GENOME_DATABASE.get(id2);
  if (!card1 || !card2) return null;

  const shared: string[] = [];
  const divergent: string[] = [];
  let distanceSum = 0;

  card1.genes.forEach((g1) => {
    const g2 = card2.genes.find((g) => g.name === g1.name);
    if (!g2) return;
    const diff = Math.abs(g1.score - g2.score);
    distanceSum += diff;
    if (diff <= 8) {
      shared.push(g1.name);
    } else if (diff >= 20) {
      divergent.push(g1.name);
    }
  });

  const geneticDistance = Math.round((distanceSum / card1.genes.length) * 10) / 10;
  const compatibilityScore = Math.max(0, Math.round(100 - geneticDistance * 2));

  let recommendation = '';
  if (geneticDistance < 8) recommendation = 'Near-identical twins. Excellent pair for a matched graded set.';
  else if (geneticDistance < 15) recommendation = 'Strong genetic similarity. These cards share dominant condition traits.';
  else if (geneticDistance < 25) recommendation = 'Moderate divergence. Different condition stories but comparable overall quality.';
  else recommendation = 'Significant genetic distance. These cards have distinctly different condition profiles.';

  return {
    card1,
    card2,
    geneticDistance,
    sharedTraits: shared,
    divergentTraits: divergent,
    compatibilityScore,
    recommendation,
  };
}

/** Get population-level genomics for a sport/year */
export async function getPopulationGenomics(sport: string, year?: number): Promise<PopulationGenomics> {
  await simulateLatency(300);
  let cards = Array.from(GENOME_DATABASE.values());
  if (sport !== 'All') cards = cards.filter((c) => c.sport === sport);
  if (year) cards = cards.filter((c) => c.year === year);
  if (cards.length === 0) cards = Array.from(GENOME_DATABASE.values());

  const scores = cards.map((c) => c.overallGenomeScore);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const sorted = [...scores].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance = scores.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Build distributions for each gene
  const distributions: Record<string, GeneDistributionBucket[]> = {};
  GENE_DEFINITIONS.forEach((def) => {
    const buckets: GeneDistributionBucket[] = [];
    const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    ranges.forEach((range) => {
      const [lo, hi] = range.split('-').map(Number);
      const count = cards.filter((c) => {
        const gene = c.genes.find((g) => g.name === def.name);
        return gene && gene.score >= lo && gene.score <= hi;
      }).length;
      buckets.push({ range, count, percentage: cards.length > 0 ? Math.round((count / cards.length) * 1000) / 10 : 0 });
    });
    distributions[def.name] = buckets;
  });

  // Outliers: cards with overall scores > 1.5 stdDev from mean
  const outliers = cards.filter((c) => Math.abs(c.overallGenomeScore - avg) > stdDev * 1.5);

  // Cluster groups via simple k-means approximation
  const clusters: ClusterGroup[] = [
    { id: 'cl-gem', label: 'Gem Mint Tier', centroidX: 85, centroidY: 90, cardCount: 0, avgGenomeScore: 0, cards: [] },
    { id: 'cl-high', label: 'High Grade', centroidX: 70, centroidY: 72, cardCount: 0, avgGenomeScore: 0, cards: [] },
    { id: 'cl-mid', label: 'Mid Grade', centroidX: 55, centroidY: 55, cardCount: 0, avgGenomeScore: 0, cards: [] },
    { id: 'cl-vintage', label: 'Vintage Character', centroidX: 38, centroidY: 85, cardCount: 0, avgGenomeScore: 0, cards: [] },
  ];

  cards.forEach((c) => {
    const physAvg = c.genes.filter((g) => g.category === 'Physical').reduce((s, g) => s + g.score, 0) / 4;
    const rarAvg = c.genes.filter((g) => g.category === 'Rarity').reduce((s, g) => s + g.score, 0) / 4;
    let bestCluster = clusters[2];
    let bestDist = Infinity;
    clusters.forEach((cl) => {
      const d = Math.sqrt(Math.pow(physAvg - cl.centroidX, 2) + Math.pow(rarAvg - cl.centroidY, 2));
      if (d < bestDist) { bestDist = d; bestCluster = cl; }
    });
    bestCluster.cards.push(c.id);
    bestCluster.cardCount++;
  });

  clusters.forEach((cl) => {
    if (cl.cardCount > 0) {
      const clCards = cl.cards.map((id) => GENOME_DATABASE.get(id)!);
      cl.avgGenomeScore = Math.round(clCards.reduce((s, c) => s + c.overallGenomeScore, 0) / cl.cardCount * 10) / 10;
    }
  });

  return {
    totalCards: cards.length,
    avgGenomeScore: Math.round(avg * 10) / 10,
    medianGenomeScore: Math.round(median * 10) / 10,
    stdDeviation: Math.round(stdDev * 10) / 10,
    geneDistributions: distributions,
    outlierCards: outliers,
    clusterGroups: clusters.filter((cl) => cl.cardCount > 0),
    topPercentileThreshold: Math.round((avg + stdDev * 1.3) * 10) / 10,
    sport: sport || 'All',
    year: year || 0,
  };
}

/** Find cards with genomes highly similar to the given card */
export async function findGeneticTwins(cardId: string, threshold: number = 95): Promise<GenomePairMatch[]> {
  await simulateLatency(350);
  const source = GENOME_DATABASE.get(cardId);
  if (!source) return [];

  const results: GenomePairMatch[] = [];
  for (const [id, profile] of GENOME_DATABASE) {
    if (id === cardId) continue;
    const match = await compareGenomes(cardId, id);
    if (match && match.compatibilityScore >= threshold) {
      results.push(match);
    }
  }
  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/** Get genome evolution timeline for a card */
export async function getGenomeEvolution(cardId: string): Promise<GenomeEvolution | null> {
  await simulateLatency(200);
  const profile = GENOME_DATABASE.get(cardId);
  if (!profile) return null;

  const snapshots = generateEvolutionSnapshots(profile);

  // Calculate drift per gene
  if (snapshots.length < 2) {
    return { cardId, cardName: profile.cardName, snapshots, totalDrift: 0, mostVolatileGene: 'N/A', mostStableGene: 'N/A', trend: 'stable' };
  }

  const first = snapshots[0].genes;
  const last = snapshots[snapshots.length - 1].genes;
  const drifts: Record<string, number> = {};
  let maxDrift = 0;
  let minDrift = Infinity;
  let volatileGene = '';
  let stableGene = '';

  Object.keys(first).forEach((gene) => {
    const allValues = snapshots.map((s) => s.genes[gene]);
    const range = Math.max(...allValues) - Math.min(...allValues);
    drifts[gene] = range;
    if (range > maxDrift) { maxDrift = range; volatileGene = gene; }
    if (range < minDrift) { minDrift = range; stableGene = gene; }
  });

  const totalDrift = Math.round((last[volatileGene] - first[volatileGene]) * 10) / 10;
  const firstOverall = snapshots[0].overallScore;
  const lastOverall = snapshots[snapshots.length - 1].overallScore;
  const trend: GenomeEvolution['trend'] =
    lastOverall > firstOverall + 1.5 ? 'improving' :
    lastOverall < firstOverall - 1.5 ? 'degrading' : 'stable';

  return {
    cardId,
    cardName: profile.cardName,
    snapshots,
    totalDrift,
    mostVolatileGene: volatileGene,
    mostStableGene: stableGene,
    trend,
  };
}

/** Compute a rarity DNA hex string from an array of genes */
export function calculateRarityDNA(genes: CardGene[]): string {
  return computeRarityDNA(genes);
}

/** Predict grading company grades from genome data */
export async function predictGradeFromGenome(genes: CardGene[]): Promise<GradePrediction> {
  await simulateLatency(200);

  const physical = genes.filter((g) => g.category === 'Physical');
  const centering = genes.find((g) => g.name === 'Centering')?.score ?? 70;
  const corners = genes.find((g) => g.name === 'Corner Integrity')?.score ?? 70;
  const edges = genes.find((g) => g.name === 'Edge Sharpness')?.score ?? 70;
  const surface = genes.find((g) => g.name === 'Surface Quality')?.score ?? 70;

  // PSA grading: heavily weight physical, limiting factor approach
  const physicalScores = [centering, corners, edges, surface];
  const minPhysical = Math.min(...physicalScores);
  const avgPhysical = physicalScores.reduce((a, b) => a + b, 0) / 4;

  // PSA uses whole numbers 1-10
  const psaRaw = (minPhysical * 0.4 + avgPhysical * 0.6) / 10;
  const predictedPSA = Math.max(1, Math.min(10, Math.round(psaRaw * 2) / 2)); // round to 0.5
  const psaConfidence = Math.round(70 + (100 - Math.abs(avgPhysical - minPhysical)) * 0.25);

  // BGS uses 0.5 increments with subgrades
  const bgsCenter = Math.max(5, Math.min(10, Math.round(centering / 10 * 2) / 2));
  const bgsCorners = Math.max(5, Math.min(10, Math.round(corners / 10 * 2) / 2));
  const bgsEdges = Math.max(5, Math.min(10, Math.round(edges / 10 * 2) / 2));
  const bgsSurface = Math.max(5, Math.min(10, Math.round(surface / 10 * 2) / 2));
  const predictedBGS = Math.round(((bgsCenter + bgsCorners + bgsEdges + bgsSurface) / 4) * 2) / 2;
  const bgsConfidence = Math.round(72 + (100 - Math.abs(avgPhysical - minPhysical)) * 0.22);

  // SGC
  const predictedSGC = Math.max(1, Math.min(10, Math.round(psaRaw * 2) / 2));
  const sgcConfidence = Math.round(68 + (100 - Math.abs(avgPhysical - minPhysical)) * 0.2);

  const limitingFactors = physical.sort((a, b) => a.score - b.score);
  const limitingFactor = limitingFactors[0]?.name ?? 'Unknown';

  // Estimated value multipliers
  const baseValue = 100;
  const rawMultiplier = 1;
  const gradedMultiplier = predictedPSA >= 10 ? 8 : predictedPSA >= 9.5 ? 5 : predictedPSA >= 9 ? 3 : predictedPSA >= 8 ? 1.8 : 1.2;

  return {
    predictedPSA,
    psaConfidence: Math.min(98, psaConfidence),
    predictedBGS,
    bgsConfidence: Math.min(98, bgsConfidence),
    predictedSGC,
    sgcConfidence: Math.min(98, sgcConfidence),
    subgrades: {
      centering: bgsCenter,
      corners: bgsCorners,
      edges: bgsEdges,
      surface: bgsSurface,
    },
    limitingFactor,
    estimatedValue: {
      raw: Math.round(baseValue * rawMultiplier),
      graded: Math.round(baseValue * gradedMultiplier),
      premium: Math.round(baseValue * gradedMultiplier - baseValue * rawMultiplier),
    },
  };
}

/** Get gene distribution across all cards for a specific gene */
export async function getGeneDistribution(geneName: string): Promise<GeneDistributionBucket[]> {
  await simulateLatency(100);
  const cards = Array.from(GENOME_DATABASE.values());
  const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
  return ranges.map((range) => {
    const [lo, hi] = range.split('-').map(Number);
    const count = cards.filter((c) => {
      const gene = c.genes.find((g) => g.name === geneName);
      return gene && gene.score >= lo && gene.score <= hi;
    }).length;
    return { range, count, percentage: Math.round((count / cards.length) * 1000) / 10 };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.floor(ms * 0.3 + Math.random() * ms * 0.4)));
}
