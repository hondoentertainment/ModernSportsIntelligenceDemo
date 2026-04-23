// @ts-nocheck
// ─────────────────────────────────────────────────────────────
// Forgery Evolution Network – Service Layer
// Maps how counterfeiting techniques evolve and spread across
// the sports card market
// ─────────────────────────────────────────────────────────────

export type ForgeryTechnique =
  | 'reprint'
  | 'trimming'
  | 'recoloring'
  | 'label-swap'
  | 'case-swap'
  | 'digital-alteration'
  | 'chemical-wash'
  | 'heat-press';

export type ThreatLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface ForgeryVector {
  id: string;
  technique: ForgeryTechnique;
  name: string;
  description: string;
  targetedCards: { name: string; estimatedFakeRate: number }[];
  detectionDifficulty: number; // 0-100
  prevalence: 'rare' | 'uncommon' | 'common' | 'widespread';
  firstDetected: string; // date
  evolutionRate: 'slow' | 'moderate' | 'rapid';
  financialExposure: number; // dollars
  detectionMethod: string;
  regions: string[];
}

export interface ThreatAlert {
  id: string;
  threatLevel: ThreatLevel;
  title: string;
  description: string;
  affectedCards: string[];
  detectedDate: string;
  recommendedAction: string;
}

export interface ForgeryStats {
  totalVectorsTracked: number;
  criticalThreats: number;
  activeThreatAlerts: number;
  estimatedMarketExposure: number; // dollars
  mostTargetedCard: string;
  fastestEvolvingTechnique: string;
  detectionSuccessRate: number; // percentage
}

export interface EvolutionTimeline {
  technique: ForgeryTechnique;
  events: { date: string; description: string; sophisticationLevel: number }[];
}

// ── Mock Forgery Vectors (8 vectors) ─────────────────────────

const MOCK_FORGERY_VECTORS: ForgeryVector[] = [
  {
    id: 'fv-001',
    technique: 'trimming',
    name: 'Precision Edge Trimming',
    description: 'Cards are trimmed with industrial-grade cutters to remove rough edges, artificially inflating grade from PSA 8 to PSA 9 or 10. Modern trimming leaves sub-millimeter evidence detectable only under magnification.',
    targetedCards: [
      { name: '1986 Michael Jordan Fleer RC', estimatedFakeRate: 8.2 },
      { name: '1952 Mickey Mantle Topps #311', estimatedFakeRate: 12.5 },
      { name: '2003 LeBron James Topps Chrome RC', estimatedFakeRate: 5.1 },
    ],
    detectionDifficulty: 72,
    prevalence: 'common',
    firstDetected: '2008-03-15',
    evolutionRate: 'moderate',
    financialExposure: 4200000,
    detectionMethod: 'Micrometer measurement comparison against population standards, corner radius analysis, and edge fiber pattern inspection.',
    regions: ['United States', 'China', 'United Kingdom'],
  },
  {
    id: 'fv-002',
    technique: 'label-swap',
    name: 'PSA Label Forgery',
    description: 'Authentic PSA cases are opened and lower-grade cards are swapped with the labeled higher grade. The label and case appear genuine while the card inside is a different grade or entirely different card.',
    targetedCards: [
      { name: '2018 Luka Doncic Prizm Silver PSA 10', estimatedFakeRate: 3.8 },
      { name: '1993 Derek Jeter SP Foil RC PSA 10', estimatedFakeRate: 6.2 },
      { name: '2020 Justin Herbert Prizm Silver PSA 10', estimatedFakeRate: 2.9 },
    ],
    detectionDifficulty: 58,
    prevalence: 'uncommon',
    firstDetected: '2015-07-22',
    evolutionRate: 'rapid',
    financialExposure: 8500000,
    detectionMethod: 'Case seam inspection under UV light, PSA cert number verification via database, and hologram authenticity check with polarized lens.',
    regions: ['United States', 'Philippines', 'Mexico'],
  },
  {
    id: 'fv-003',
    technique: 'reprint',
    name: 'High-Fidelity Reprints',
    description: 'Modern high-resolution printing creates near-identical reproductions of vintage cards. Advanced reprints now replicate cardboard stock texture and age-appropriate yellowing.',
    targetedCards: [
      { name: '1952 Mickey Mantle Topps #311', estimatedFakeRate: 15.0 },
      { name: '1909 T206 Honus Wagner', estimatedFakeRate: 18.0 },
      { name: '1916 Sporting News Babe Ruth RC', estimatedFakeRate: 11.0 },
    ],
    detectionDifficulty: 45,
    prevalence: 'common',
    firstDetected: '2002-11-08',
    evolutionRate: 'slow',
    financialExposure: 12000000,
    detectionMethod: 'Paper composition analysis, ink fluorescence under UV/black light, dot pattern analysis under 60x magnification.',
    regions: ['China', 'United States', 'Germany'],
  },
  {
    id: 'fv-004',
    technique: 'case-swap',
    name: 'BGS Case Resealing',
    description: 'BGS Beckett cases are carefully opened via heat application, cards are swapped, and cases are resealed. Sub-grade labels are reprinted to match the replacement card.',
    targetedCards: [
      { name: '2022 Paolo Banchero Mosaic Gold /10 BGS 9.5', estimatedFakeRate: 4.5 },
      { name: '2018 Shohei Ohtani Topps Chrome Auto BGS 9.5', estimatedFakeRate: 3.2 },
    ],
    detectionDifficulty: 65,
    prevalence: 'uncommon',
    firstDetected: '2019-02-14',
    evolutionRate: 'moderate',
    financialExposure: 3800000,
    detectionMethod: 'Case integrity inspection for heat marks, sub-grade label font consistency check, BGS certification database cross-reference.',
    regions: ['United States', 'Canada'],
  },
  {
    id: 'fv-005',
    technique: 'recoloring',
    name: 'Parallel Color Enhancement',
    description: 'Base cards are chemically or digitally treated to mimic rare parallel colorways — silver borders enhanced to look like gold, base cards dyed to resemble prizm refractors.',
    targetedCards: [
      { name: '2019 Zion Williamson Prizm Silver PSA 10', estimatedFakeRate: 2.1 },
      { name: '2023 Victor Wembanyama Prizm Gold /10', estimatedFakeRate: 5.8 },
    ],
    detectionDifficulty: 82,
    prevalence: 'rare',
    firstDetected: '2021-06-30',
    evolutionRate: 'rapid',
    financialExposure: 2200000,
    detectionMethod: 'Spectrophotometer color wavelength analysis, chemical residue testing, comparison against authenticated reference cards.',
    regions: ['China', 'Thailand', 'United States'],
  },
  {
    id: 'fv-006',
    technique: 'digital-alteration',
    name: 'AI-Enhanced Photo Manipulation',
    description: 'Sellers use AI tools to digitally alter listing photos — enhancing centering, removing surface flaws, or improving corner sharpness in images to misrepresent raw card condition.',
    targetedCards: [
      { name: 'Various raw/ungraded vintage cards', estimatedFakeRate: 22.0 },
      { name: 'Pre-grading submission raw moderns', estimatedFakeRate: 15.0 },
    ],
    detectionDifficulty: 88,
    prevalence: 'widespread',
    firstDetected: '2023-01-15',
    evolutionRate: 'rapid',
    financialExposure: 15000000,
    detectionMethod: 'EXIF metadata analysis, AI-generated image detection tools, request for video verification or additional unfiltered photos.',
    regions: ['Global'],
  },
  {
    id: 'fv-007',
    technique: 'chemical-wash',
    name: 'Chemical Surface Restoration',
    description: 'Chemical solutions are applied to vintage cards to remove stains, restore whiteness to borders, and reduce visible wear. Treated cards grade higher than their natural condition.',
    targetedCards: [
      { name: '1986 Michael Jordan Fleer RC', estimatedFakeRate: 6.0 },
      { name: '1979 Wayne Gretzky Topps RC', estimatedFakeRate: 4.5 },
      { name: '1980 Rickey Henderson Topps RC', estimatedFakeRate: 3.8 },
    ],
    detectionDifficulty: 78,
    prevalence: 'uncommon',
    firstDetected: '2012-09-03',
    evolutionRate: 'slow',
    financialExposure: 5600000,
    detectionMethod: 'UV fluorescence patterns reveal chemical residue, paper texture inconsistencies under magnification, unnatural border whiteness uniformity.',
    regions: ['United States', 'Japan', 'United Kingdom'],
  },
  {
    id: 'fv-008',
    technique: 'heat-press',
    name: 'Thermal Crease Removal',
    description: 'Heat and pressure are applied to flatten creases and bends in cards, artificially improving surface and corner grades. Advanced presses use precise temperature control to avoid visible damage.',
    targetedCards: [
      { name: '1989 Ken Griffey Jr. Upper Deck RC', estimatedFakeRate: 7.0 },
      { name: '1984 Dan Marino Topps RC', estimatedFakeRate: 5.5 },
      { name: '1971 Nolan Ryan Topps PSA candidates', estimatedFakeRate: 4.2 },
    ],
    detectionDifficulty: 68,
    prevalence: 'common',
    firstDetected: '2010-04-18',
    evolutionRate: 'moderate',
    financialExposure: 3200000,
    detectionMethod: 'Surface reflectivity analysis under raking light, paper fiber compression patterns, crease ghost detection under transmitted light.',
    regions: ['United States', 'Canada', 'Australia'],
  },
];

// ── Mock Threat Alerts (5 alerts) ────────────────────────────

const MOCK_THREAT_ALERTS: ThreatAlert[] = [
  {
    id: 'ta-001',
    threatLevel: 'critical',
    title: 'Surge in AI-Altered Listing Photos on Major Platforms',
    description: 'Detection systems have identified a 340% increase in AI-enhanced listing photos over the past 30 days. Sellers are using generative AI to fabricate pristine card images that do not match actual card condition.',
    affectedCards: ['Raw vintage cards $500+', 'Pre-submission modern rookies', 'Off-platform private sales'],
    detectedDate: '2026-03-10',
    recommendedAction: 'Request video walkthroughs for all raw card purchases over $200. Use reverse image search tools. Avoid sellers without verified transaction history.',
  },
  {
    id: 'ta-002',
    threatLevel: 'high',
    title: 'New PSA Label Replication Method Detected',
    description: 'A new method of PSA label replication has surfaced using commercial UV printers that can reproduce holographic elements. Cases appear fully authentic under normal inspection.',
    affectedCards: ['2018 Luka Doncic Prizm Silver PSA 10', '2020 Joe Burrow Prizm Silver PSA 10', '2003 LeBron James Topps Chrome RC PSA 10'],
    detectedDate: '2026-03-05',
    recommendedAction: 'Always verify PSA certification numbers via PSA\'s online database before purchase. Request close-up photos of case seams and hologram under angled lighting.',
  },
  {
    id: 'ta-003',
    threatLevel: 'high',
    title: 'Coordinated Recoloring Ring Identified in Southeast Asia',
    description: 'Law enforcement has identified a counterfeiting operation producing chemically recolored Prizm parallels. Base Prizm cards are being converted to Silver and Gold parallels with increasing accuracy.',
    affectedCards: ['2023 Victor Wembanyama Prizm parallels', '2022 Paolo Banchero Prizm parallels', '2019 Zion Williamson Prizm parallels'],
    detectedDate: '2026-02-28',
    recommendedAction: 'Purchase parallels only from established dealers or already-graded examples. If buying raw parallels, request spectrophotometer verification from seller.',
  },
  {
    id: 'ta-004',
    threatLevel: 'moderate',
    title: 'Trimmed 1986 Jordan Fleer RCs Entering Grading Pipeline',
    description: 'Multiple trimmed 1986 Michael Jordan Fleer RCs have been caught at PSA and BGS submission stages. Trimmers are using laser-guided cutters that leave minimal evidence.',
    affectedCards: ['1986 Michael Jordan Fleer RC #57'],
    detectedDate: '2026-02-15',
    recommendedAction: 'For raw 1986 Jordan Fleer RCs, measure dimensions with digital calipers before purchase. Standard dimensions: 2.5" x 3.5" with +/- 0.5mm tolerance.',
  },
  {
    id: 'ta-005',
    threatLevel: 'low',
    title: 'Vintage Reprint Batch Traced to German Print Shop',
    description: 'A batch of high-quality 1950s Topps baseball reprints has been traced to a commercial print operation in Germany. Cards feature accurate cardboard stock but fail under UV testing.',
    affectedCards: ['1952 Mickey Mantle Topps #311', '1955 Roberto Clemente Topps RC', '1956 Mickey Mantle Topps #135'],
    detectedDate: '2026-01-20',
    recommendedAction: 'All vintage purchases should include UV light verification. Request black light photos from sellers or purchase only from auction houses with guarantee policies.',
  },
];

// ── Mock Evolution Timelines (4 timelines) ───────────────────

const MOCK_EVOLUTION_TIMELINES: EvolutionTimeline[] = [
  {
    technique: 'trimming',
    events: [
      { date: '2008-03', description: 'First documented case of precision-trimmed vintage cards submitted to PSA. Crude scissors-based method.', sophisticationLevel: 20 },
      { date: '2012-06', description: 'Paper guillotine trimmers adopted, producing cleaner edges. Detection methods improved with micrometer measurements.', sophisticationLevel: 40 },
      { date: '2017-09', description: 'Industrial rotary cutters introduced. Edge quality nearly indistinguishable from factory cuts.', sophisticationLevel: 65 },
      { date: '2021-01', description: 'Laser-guided cutting systems deployed. Trimmers can achieve sub-0.1mm precision.', sophisticationLevel: 78 },
      { date: '2024-11', description: 'AI-assisted measurement systems at grading companies improve catch rate to 94%.', sophisticationLevel: 72 },
    ],
  },
  {
    technique: 'digital-alteration',
    events: [
      { date: '2019-05', description: 'Basic Photoshop retouching of listing photos — centering lines adjusted, surface scratches cloned out.', sophisticationLevel: 25 },
      { date: '2021-08', description: 'Mobile apps enable one-tap enhancement of card photos. Casual sellers begin unknowingly misrepresenting condition.', sophisticationLevel: 45 },
      { date: '2023-01', description: 'Generative AI tools produce photorealistic card images from text descriptions. First fully fabricated listing detected.', sophisticationLevel: 75 },
      { date: '2024-06', description: 'AI video generation creates fake card walkthroughs. Detection now requires forensic analysis of temporal consistency.', sophisticationLevel: 90 },
      { date: '2025-09', description: 'Counter-AI detection systems reach 87% accuracy. Arms race intensifies between forgers and verification platforms.', sophisticationLevel: 88 },
    ],
  },
  {
    technique: 'label-swap',
    events: [
      { date: '2015-07', description: 'First PSA case crack-and-swap detected. Crude method left visible case damage.', sophisticationLevel: 15 },
      { date: '2018-03', description: 'Ultrasonic welding tools allow clean case opening and resealing. Detection difficulty increases significantly.', sophisticationLevel: 50 },
      { date: '2020-11', description: 'Counterfeit PSA labels with UV-reactive ink appear on the market. Visual inspection alone becomes insufficient.', sophisticationLevel: 70 },
      { date: '2023-08', description: 'Full hologram replication achieved with commercial UV printers. Database verification becomes essential.', sophisticationLevel: 85 },
    ],
  },
  {
    technique: 'recoloring',
    events: [
      { date: '2021-06', description: 'First chemically recolored Prizm base-to-silver conversion detected. Color was slightly off under natural light.', sophisticationLevel: 30 },
      { date: '2022-12', description: 'Improved chemical formulations produce accurate silver and blue wave colorways. Detection requires spectrophotometer.', sophisticationLevel: 55 },
      { date: '2024-03', description: 'Gold parallel recoloring achieved using metallic ink overlays. Visual distinction from authentic becomes extremely difficult.', sophisticationLevel: 78 },
      { date: '2025-08', description: 'Nano-coating techniques replicate refractor light patterns. Only chemical residue analysis reliably detects fakes.', sophisticationLevel: 88 },
    ],
  },
];

// ── Utility Helpers ──────────────────────────────────────────

export function getThreatColor(level: ThreatLevel): string {
  const colors: Record<ThreatLevel, string> = {
    low: 'text-blue-400',
    moderate: 'text-amber-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  };
  return colors[level];
}

export function getTechniqueName(technique: ForgeryTechnique): string {
  const names: Record<ForgeryTechnique, string> = {
    reprint: 'Reprint / Reproduction',
    trimming: 'Edge Trimming',
    recoloring: 'Color Enhancement',
    'label-swap': 'Label Swap',
    'case-swap': 'Case Swap / Reseal',
    'digital-alteration': 'Digital Alteration',
    'chemical-wash': 'Chemical Wash',
    'heat-press': 'Heat Press',
  };
  return names[technique];
}

export function getDifficultyLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Extremely Difficult', color: 'text-red-400' };
  if (score >= 60) return { label: 'Difficult', color: 'text-orange-400' };
  if (score >= 40) return { label: 'Moderate', color: 'text-amber-400' };
  return { label: 'Detectable', color: 'text-green-400' };
}

// ── Public API Functions ─────────────────────────────────────

export function getForgeryVectors(): ForgeryVector[] {
  return MOCK_FORGERY_VECTORS;
}

export function getThreatAlerts(): ThreatAlert[] {
  return MOCK_THREAT_ALERTS;
}

export function getForgeryStats(): ForgeryStats {
  const vectors = MOCK_FORGERY_VECTORS;
  const alerts = MOCK_THREAT_ALERTS;

  const criticalAlerts = alerts.filter(a => a.threatLevel === 'critical').length;
  const totalExposure = vectors.reduce((sum, v) => sum + v.financialExposure, 0);

  // Find most targeted card across all vectors
  const cardTargetCounts = new Map<string, number>();
  for (const v of vectors) {
    for (const tc of v.targetedCards) {
      const current = cardTargetCounts.get(tc.name) || 0;
      cardTargetCounts.set(tc.name, current + tc.estimatedFakeRate);
    }
  }
  const mostTargeted = [...cardTargetCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const fastestEvolving = [...vectors].sort((a, b) => {
    const rateOrder = { rapid: 3, moderate: 2, slow: 1 };
    return rateOrder[b.evolutionRate] - rateOrder[a.evolutionRate];
  })[0];

  return {
    totalVectorsTracked: vectors.length,
    criticalThreats: criticalAlerts,
    activeThreatAlerts: alerts.length,
    estimatedMarketExposure: totalExposure,
    mostTargetedCard: mostTargeted?.[0] ?? 'Unknown',
    fastestEvolvingTechnique: getTechniqueName(fastestEvolving.technique),
    detectionSuccessRate: 82.4,
  };
}

export function getEvolutionTimelines(): EvolutionTimeline[] {
  return MOCK_EVOLUTION_TIMELINES;
}
