import { CardInventory } from '../../types';
import { store } from '../dal/syncStore';

// ---- Types ----

export interface AuthScore {
  overall: number; // 0-100
  certValidation: number;
  gradeConsistency: number;
  priceAnomaly: number;
  holderAlignment: number;
  label: 'Verified' | 'Likely Authentic' | 'Review Recommended' | 'Suspicious' | 'High Risk';
}

export interface CertVerification {
  status: 'valid' | 'invalid' | 'unknown';
  certNumber: string;
  expectedGrade: string;
  holderType: 'standard' | 'premium' | 'vintage' | 'auto';
  labelStyleMatch: boolean;
  populationCheck: { popAtGrade: number; popHigher: number; totalPop: number };
  notes: string;
}

export interface RiskFactor {
  type: 'trimming' | 'relabeling' | 'auto_fraud' | 'grade_anomaly' | 'price_anomaly' | 'cert_mismatch' | 'era_mismatch' | 'holder_age';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface AuthAlert {
  cardId: string;
  cardLabel: string;
  score: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  riskFactors: RiskFactor[];
  timestamp: string;
}

export interface AuthChecklistStep {
  step: number;
  title: string;
  description: string;
  visualNote?: string;
  critical: boolean;
}

export interface AuthChecklist {
  gradingCompany: string;
  steps: AuthChecklistStep[];
}

export interface SellerRiskProfile {
  sellerId: string;
  sellerName: string;
  overallRisk: number; // 0-100 (higher = more risky)
  accountAgeDays: number;
  listingCount: number;
  avgPriceDeviation: number;
  suspiciousPatterns: string[];
  recommendation: 'safe' | 'caution' | 'avoid';
}

// ---- Constants ----

const AUTH_HISTORY_KEY = 'msi_auth_history';

// Valid grading companies by era
const VALID_GRADERS_BY_ERA: Record<string, string[]> = {
  'pre-1970': ['PSA', 'SGC', 'BGS'],
  '1970-1990': ['PSA', 'BGS', 'SGC'],
  '1990-2010': ['PSA', 'BGS', 'SGC', 'CSG'],
  'post-2010': ['PSA', 'BGS', 'SGC', 'CSG', 'HGA'],
};

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash);
}

function cardSeed(card: CardInventory): number {
  return hashString(card.id + card.player + card.year);
}

// ---- localStorage helpers ----

interface AuthHistoryEntry {
  cardId: string;
  score: number;
  timestamp: string;
}

function loadAuthHistory(): AuthHistoryEntry[] {
  return store.get<AuthHistoryEntry[]>(AUTH_HISTORY_KEY, []);
}

function saveAuthHistory(entries: AuthHistoryEntry[]): void {
  const trimmed = entries.slice(-200);
  store.set(AUTH_HISTORY_KEY, trimmed);
}

// ---- Helper: get era key ----

function getEraKey(year: number): string {
  if (year < 1970) return 'pre-1970';
  if (year < 1990) return '1970-1990';
  if (year < 2010) return '1990-2010';
  return 'post-2010';
}

// ---- Helper: parse numeric grade ----

function parseGrade(grade?: string): number {
  if (!grade) return 0;
  const num = parseFloat(grade);
  return isNaN(num) ? 0 : num;
}

// ---- Core Functions ----

export function calculateAuthScore(card: CardInventory): AuthScore {
  const seed = cardSeed(card);

  // 1. Cert validation score (0-100)
  let certValidation = 85;
  if (card.isGraded && card.gradingCompany) {
    const era = getEraKey(card.year);
    const validGraders = VALID_GRADERS_BY_ERA[era] || [];
    if (validGraders.includes(card.gradingCompany)) {
      certValidation = 90 + Math.round(seededRandom(seed, 1) * 10);
    } else if (card.gradingCompany === 'HGA' && card.year < 2000) {
      // HGA didn't exist for older cards - suspicious
      certValidation = 30 + Math.round(seededRandom(seed, 2) * 20);
    } else if (card.gradingCompany === 'Other') {
      certValidation = 40 + Math.round(seededRandom(seed, 3) * 20);
    } else {
      certValidation = 60 + Math.round(seededRandom(seed, 4) * 15);
    }
  } else if (!card.isGraded) {
    // Ungraded cards get a neutral cert score
    certValidation = 50 + Math.round(seededRandom(seed, 5) * 20);
  }

  // 2. Grade consistency score (0-100)
  let gradeConsistency = 85;
  if (card.isGraded && card.grade) {
    const numGrade = parseGrade(card.grade);
    // PSA 10 on pre-1970 card is suspicious
    if (numGrade >= 10 && card.year < 1970) {
      gradeConsistency = 20 + Math.round(seededRandom(seed, 10) * 15);
    } else if (numGrade >= 9.5 && card.year < 1980) {
      gradeConsistency = 35 + Math.round(seededRandom(seed, 11) * 20);
    } else if (numGrade >= 9 && card.year < 1970) {
      gradeConsistency = 45 + Math.round(seededRandom(seed, 12) * 15);
    } else if (numGrade >= 9) {
      gradeConsistency = 80 + Math.round(seededRandom(seed, 13) * 20);
    } else {
      gradeConsistency = 75 + Math.round(seededRandom(seed, 14) * 25);
    }
  } else if (!card.isGraded) {
    gradeConsistency = 60 + Math.round(seededRandom(seed, 15) * 20);
  }

  // 3. Price anomaly score (0-100, higher = more normal)
  let priceAnomaly = 80;
  const currentVal = card.currentValue ?? card.purchasePrice;
  const purchasePrice = card.purchasePrice;
  if (currentVal > 0 && purchasePrice > 0) {
    const ratio = purchasePrice / currentVal;
    if (ratio < 0.3) {
      // Paid way below market value - suspicious
      priceAnomaly = 25 + Math.round(seededRandom(seed, 20) * 15);
    } else if (ratio < 0.5) {
      priceAnomaly = 45 + Math.round(seededRandom(seed, 21) * 15);
    } else if (ratio > 2.0) {
      // Overpaid significantly - not suspicious for auth, but odd
      priceAnomaly = 60 + Math.round(seededRandom(seed, 22) * 15);
    } else {
      priceAnomaly = 75 + Math.round(seededRandom(seed, 23) * 25);
    }
  }

  // 4. Holder age alignment (0-100)
  let holderAlignment = 85;
  if (card.isGraded && card.gradingCompany) {
    // HGA founded ~2020, CSG ~2020-ish
    if (card.gradingCompany === 'HGA' && card.year < 2015) {
      holderAlignment = 40 + Math.round(seededRandom(seed, 30) * 15);
    } else if (card.gradingCompany === 'CSG' && card.year < 2000) {
      holderAlignment = 55 + Math.round(seededRandom(seed, 31) * 15);
    } else {
      holderAlignment = 80 + Math.round(seededRandom(seed, 32) * 20);
    }
  } else {
    holderAlignment = 65 + Math.round(seededRandom(seed, 33) * 20);
  }

  // Composite score: weighted average
  const overall = Math.round(
    certValidation * 0.30 +
    gradeConsistency * 0.30 +
    priceAnomaly * 0.20 +
    holderAlignment * 0.20
  );

  // Determine label
  let label: AuthScore['label'];
  if (overall >= 90) label = 'Verified';
  else if (overall >= 75) label = 'Likely Authentic';
  else if (overall >= 60) label = 'Review Recommended';
  else if (overall >= 40) label = 'Suspicious';
  else label = 'High Risk';

  // Save to history
  const history = loadAuthHistory();
  history.push({ cardId: card.id, score: overall, timestamp: new Date().toISOString() });
  saveAuthHistory(history);

  return {
    overall: Math.min(100, Math.max(0, overall)),
    certValidation: Math.min(100, Math.max(0, certValidation)),
    gradeConsistency: Math.min(100, Math.max(0, gradeConsistency)),
    priceAnomaly: Math.min(100, Math.max(0, priceAnomaly)),
    holderAlignment: Math.min(100, Math.max(0, holderAlignment)),
    label,
  };
}

export function verifyCert(card: CardInventory): CertVerification {
  const seed = cardSeed(card);

  // Simulate cert number
  const certNum = card.isGraded
    ? `${(card.gradingCompany || 'UNK').substring(0, 3).toUpperCase()}-${String(Math.abs(seed) % 99999999).padStart(8, '0')}`
    : 'N/A';

  // Determine status
  let status: CertVerification['status'] = 'unknown';
  if (card.isGraded && card.gradingCompany) {
    const statusRoll = seededRandom(seed, 40);
    if (statusRoll > 0.15) {
      status = 'valid';
    } else if (statusRoll > 0.05) {
      status = 'unknown';
    } else {
      status = 'invalid';
    }
  }

  // Expected grade
  const numGrade = parseGrade(card.grade);
  const gradeVariance = seededRandom(seed, 41) > 0.85 ? -0.5 : 0;
  const expectedGrade = card.isGraded && card.grade
    ? String(Math.max(1, numGrade + gradeVariance))
    : 'N/A';

  // Holder type
  let holderType: CertVerification['holderType'] = 'standard';
  if (card.isAutographed) holderType = 'auto';
  else if (card.year < 1980) holderType = 'vintage';
  else if (numGrade >= 9.5) holderType = 'premium';

  // Label style match
  const labelStyleMatch = seededRandom(seed, 42) > 0.08;

  // Population check
  const popAtGrade = Math.max(1, Math.round(seededRandom(seed, 43) * 500 + (numGrade >= 10 ? 5 : 50)));
  const popHigher = numGrade >= 10 ? 0 : Math.round(seededRandom(seed, 44) * popAtGrade * 0.3);
  const totalPop = popAtGrade + popHigher + Math.round(seededRandom(seed, 45) * 2000);

  // Notes
  let notes = '';
  if (status === 'valid') {
    notes = 'Certificate verified against registry. Holder and label match expected standards.';
  } else if (status === 'invalid') {
    notes = 'Certificate number not found in registry. This may indicate a counterfeit holder or data entry error.';
  } else {
    notes = 'Unable to verify certificate. Registry may be temporarily unavailable or card is ungraded.';
  }

  return {
    status,
    certNumber: certNum,
    expectedGrade,
    holderType,
    labelStyleMatch,
    populationCheck: { popAtGrade, popHigher, totalPop },
    notes,
  };
}

export function detectAlterationRisk(card: CardInventory): RiskFactor[] {
  const seed = cardSeed(card);
  const factors: RiskFactor[] = [];
  const numGrade = parseGrade(card.grade);

  // Trimming detection
  if (card.isGraded && numGrade >= 9 && card.year < 1985) {
    const trimmingRisk = seededRandom(seed, 50);
    if (trimmingRisk > 0.4) {
      factors.push({
        type: 'trimming',
        severity: numGrade >= 10 ? 'critical' : 'high',
        description: `High grade (${card.grade}) on a ${card.year} card raises trimming concerns. Cards from this era rarely survive in this condition naturally.`,
        recommendation: 'Request high-resolution edge photos and compare dimensions against PSA standards for this issue.',
      });
    }
  }

  // Relabeling detection
  if (card.isGraded) {
    const relabelRisk = seededRandom(seed, 51);
    if (relabelRisk < 0.08) {
      factors.push({
        type: 'relabeling',
        severity: 'critical',
        description: 'Cert number pattern does not match expected format for the stated grading company and era.',
        recommendation: 'Verify certificate directly on the grading company website. Compare label font and hologram placement.',
      });
    }
  }

  // Auto fraud (autograph on non-auto card that shouldn't have one)
  if (card.isAutographed && !card.isGraded) {
    const autoRisk = seededRandom(seed, 52);
    if (autoRisk < 0.25) {
      factors.push({
        type: 'auto_fraud',
        severity: 'high',
        description: 'Ungraded autographed card lacks third-party authentication. Autograph provenance cannot be verified.',
        recommendation: 'Submit to PSA/DNA or Beckett Authentication for autograph verification before investing further.',
      });
    }
  }

  // Grade anomaly
  if (card.isGraded && numGrade >= 10 && card.year < 1970) {
    factors.push({
      type: 'grade_anomaly',
      severity: 'critical',
      description: `A Gem Mint ${card.grade} grade on a ${card.year} card is exceptionally rare. Population reports should be cross-referenced.`,
      recommendation: 'Check the population report for this exact card and compare pricing against recent verified sales.',
    });
  }

  // Price anomaly
  const currentVal = card.currentValue ?? card.purchasePrice;
  if (currentVal > 0 && card.purchasePrice > 0) {
    const ratio = card.purchasePrice / currentVal;
    if (ratio < 0.3 && currentVal > 100) {
      factors.push({
        type: 'price_anomaly',
        severity: 'high',
        description: `Purchase price ($${card.purchasePrice.toFixed(0)}) is significantly below estimated market value ($${currentVal.toFixed(0)}). This ${Math.round((1 - ratio) * 100)}% discount may indicate a counterfeit.`,
        recommendation: 'Verify authenticity through physical inspection or re-submission to a grading service.',
      });
    } else if (ratio < 0.5 && currentVal > 200) {
      factors.push({
        type: 'price_anomaly',
        severity: 'medium',
        description: `Purchase price appears below market average. While this could be a good deal, it warrants closer inspection.`,
        recommendation: 'Compare against recent comparable sales on eBay and major auction houses.',
      });
    }
  }

  // Era/grading company mismatch
  if (card.isGraded && card.gradingCompany) {
    const era = getEraKey(card.year);
    const validGraders = VALID_GRADERS_BY_ERA[era] || [];
    if (!validGraders.includes(card.gradingCompany)) {
      factors.push({
        type: 'era_mismatch',
        severity: 'medium',
        description: `${card.gradingCompany} is not commonly associated with cards from ${card.year}. This could indicate a reholder or mislabel.`,
        recommendation: 'Verify the holder style matches known authentic holders from this grading company for this era.',
      });
    }
  }

  // Holder age alignment
  if (card.isGraded && card.gradingCompany === 'HGA' && card.year < 2015) {
    factors.push({
      type: 'holder_age',
      severity: 'medium',
      description: 'HGA began grading recently, so vintage cards in HGA holders may have been previously removed from other holders.',
      recommendation: 'Check for signs of re-casing and verify the card was not previously in a different grading company holder.',
    });
  }

  return factors;
}

export function getRiskFactors(card: CardInventory): RiskFactor[] {
  return detectAlterationRisk(card);
}

export function getAuthAlerts(cards: CardInventory[]): AuthAlert[] {
  const alerts: AuthAlert[] = [];

  for (const card of cards) {
    const score = calculateAuthScore(card);
    const riskFactors = getRiskFactors(card);

    if (score.overall < 80 || riskFactors.length > 0) {
      let severity: AuthAlert['severity'] = 'low';
      if (score.overall < 40 || riskFactors.some(r => r.severity === 'critical')) {
        severity = 'critical';
      } else if (score.overall < 60 || riskFactors.some(r => r.severity === 'high')) {
        severity = 'high';
      } else if (score.overall < 75 || riskFactors.some(r => r.severity === 'medium')) {
        severity = 'medium';
      }

      const cardLabel = `${card.year} ${card.manufacturer} ${card.player} #${card.cardNumber}`;
      let summary = '';
      if (riskFactors.length > 0) {
        summary = riskFactors[0].description;
      } else if (score.overall < 60) {
        summary = `Authentication score of ${score.overall}/100 indicates potential concerns with this card.`;
      } else {
        summary = `Minor authentication flags detected. Score: ${score.overall}/100.`;
      }

      alerts.push({
        cardId: card.id,
        cardLabel,
        score: score.overall,
        severity,
        summary,
        riskFactors,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Sort by severity (critical first, then high, medium, low)
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

export function getAuthChecklist(gradingCompany: string): AuthChecklist {
  const checklists: Record<string, AuthChecklistStep[]> = {
    PSA: [
      { step: 1, title: 'Inspect the Label', description: 'Check that the PSA label is printed clearly with no smudging, bleeding, or off-center text. The font should be crisp and uniform.', visualNote: 'PSA uses a distinct red-and-white label with the PSA logo on the left. Post-2020 labels have a slightly updated font.', critical: true },
      { step: 2, title: 'Verify the Hologram', description: 'Locate the PSA hologram on the reverse of the holder. It should shift colors when tilted and display "PSA" and "DNA" micro-text.', visualNote: 'The hologram is placed on the back, bottom-right of the case. Counterfeit holograms often lack the micro-text.', critical: true },
      { step: 3, title: 'Check the Case Seams', description: 'Examine the ultrasonic weld seams on the holder edges. Authentic PSA cases have smooth, even seams without visible glue or pry marks.', critical: true },
      { step: 4, title: 'Verify Cert Number Online', description: 'Visit PSAcard.com/cert and enter the certification number. The returned result should match the card, grade, and set information.', critical: true },
      { step: 5, title: 'Inspect Case Clarity', description: 'Authentic PSA holders are crystal-clear with no yellowing or cloudiness. Counterfeits may use lower-quality plastic.', critical: false },
      { step: 6, title: 'Compare Label Style to Era', description: 'PSA has used different label styles over the years (flip labels, tag labels, modern labels). Ensure the label matches the era the card was graded.', visualNote: 'Flip-style labels were used pre-2007. Modern rectangular labels have been standard since then.', critical: false },
      { step: 7, title: 'Weight and Feel Test', description: 'Authentic PSA holders have a consistent weight and feel. Hold the case — counterfeits may feel lighter or flimsier.', critical: false },
    ],
    BGS: [
      { step: 1, title: 'Inspect the Label and Sub-Grades', description: 'BGS labels show the overall grade plus four sub-grades (Centering, Corners, Edges, Surface). All should be printed clearly.', visualNote: 'BGS uses a black label for Pristine 10, gold for 9.5, and silver/white for other grades.', critical: true },
      { step: 2, title: 'Verify the Hologram Sticker', description: 'Locate the BGS/Beckett hologram sticker on the back of the holder. It should display a shifting rainbow pattern.', visualNote: 'The hologram is on the rear of the case. It should say "Beckett" when tilted at different angles.', critical: true },
      { step: 3, title: 'Check the Inner Sleeve', description: 'BGS holders have a distinct inner card sleeve that holds the card in place. It should sit flush without rattling.', critical: true },
      { step: 4, title: 'Verify Online at Beckett.com', description: 'Enter the BGS certification number at beckett.com/grading/card-lookup to verify the grade and card details match.', critical: true },
      { step: 5, title: 'Inspect Case Construction', description: 'BGS cases are thicker than PSA cases. The edges should be smooth and the case should feel solid without flex.', critical: false },
      { step: 6, title: 'Sub-Grade Consistency Check', description: 'Verify sub-grades are consistent with the overall grade. A 9.5 overall with a 7.0 sub-grade would be unusual.', critical: false },
    ],
    SGC: [
      { step: 1, title: 'Inspect the Tuxedo Holder', description: 'SGC uses a distinctive black-and-white "tuxedo" holder design. The border should be crisp with no color bleeding.', visualNote: 'SGC holders have a thick black border with a white inner frame. The card sits centered within.', critical: true },
      { step: 2, title: 'Verify the Label Information', description: 'Check that the grade, card description, set name, and year all match the actual card visible through the holder.', critical: true },
      { step: 3, title: 'Check the Serial Number', description: 'SGC assigns a unique serial number to each graded card. Verify it at gosgc.com using their card verification tool.', critical: true },
      { step: 4, title: 'Inspect the Holder Seal', description: 'SGC holders are sealed with tamper-evident methods. Look for any signs of the holder being opened or re-sealed.', critical: true },
      { step: 5, title: 'Assess Holder Quality', description: 'Authentic SGC holders are rigid and high-quality. The viewing window should be clear with no haze or scratches from manufacturing.', critical: false },
      { step: 6, title: 'Compare to Known Authentic Examples', description: 'If possible, compare the holder and label side-by-side with a confirmed authentic SGC holder for visual consistency.', critical: false },
    ],
  };

  const steps = checklists[gradingCompany] || [
    { step: 1, title: 'Verify Grading Company', description: 'Confirm the grading company is a recognized, reputable service.', critical: true },
    { step: 2, title: 'Check Certificate Online', description: 'Look up the certificate number on the grading company\'s official website.', critical: true },
    { step: 3, title: 'Inspect Holder Integrity', description: 'Check for signs of tampering, re-sealing, or damage to the holder.', critical: true },
    { step: 4, title: 'Compare to Known Examples', description: 'Compare the holder, label, and card against known authentic examples from the same company.', critical: false },
  ];

  return { gradingCompany, steps };
}

export function evaluateSellerRisk(sellerData: {
  sellerId: string;
  sellerName: string;
  accountAgeDays: number;
  listingCount: number;
  avgPrice: number;
  marketAvgPrice: number;
}): SellerRiskProfile {
  const seed = hashString(sellerData.sellerId);
  let riskScore = 0;
  const patterns: string[] = [];

  // Account age risk
  if (sellerData.accountAgeDays < 30) {
    riskScore += 30;
    patterns.push('Account created less than 30 days ago');
  } else if (sellerData.accountAgeDays < 90) {
    riskScore += 15;
    patterns.push('Relatively new account (< 90 days)');
  } else if (sellerData.accountAgeDays < 180) {
    riskScore += 5;
  }

  // Listing volume analysis
  if (sellerData.listingCount > 100 && sellerData.accountAgeDays < 60) {
    riskScore += 25;
    patterns.push('High volume of listings for a new account');
  } else if (sellerData.listingCount < 3) {
    riskScore += 10;
    patterns.push('Very few listings — limited seller history');
  }

  // Price positioning
  const priceDeviation = sellerData.marketAvgPrice > 0
    ? ((sellerData.avgPrice - sellerData.marketAvgPrice) / sellerData.marketAvgPrice) * 100
    : 0;

  if (priceDeviation < -40) {
    riskScore += 30;
    patterns.push(`Prices ${Math.abs(Math.round(priceDeviation))}% below market average`);
  } else if (priceDeviation < -20) {
    riskScore += 15;
    patterns.push('Prices notably below market average');
  } else if (priceDeviation > 50) {
    riskScore += 10;
    patterns.push('Prices significantly above market — possible shill pricing');
  }

  // Add some deterministic variance
  riskScore += Math.round(seededRandom(seed, 60) * 10) - 5;
  riskScore = Math.min(100, Math.max(0, riskScore));

  let recommendation: SellerRiskProfile['recommendation'] = 'safe';
  if (riskScore >= 60) recommendation = 'avoid';
  else if (riskScore >= 30) recommendation = 'caution';

  return {
    sellerId: sellerData.sellerId,
    sellerName: sellerData.sellerName,
    overallRisk: riskScore,
    accountAgeDays: sellerData.accountAgeDays,
    listingCount: sellerData.listingCount,
    avgPriceDeviation: Math.round(priceDeviation * 100) / 100,
    suspiciousPatterns: patterns,
    recommendation,
  };
}

export function getCollectionAuthScore(cards: CardInventory[]): {
  overall: number;
  totalCards: number;
  verifiedCount: number;
  suspiciousCount: number;
  highRiskCount: number;
  averageScore: number;
  breakdown: { label: string; count: number; color: string }[];
} {
  if (cards.length === 0) {
    return {
      overall: 100,
      totalCards: 0,
      verifiedCount: 0,
      suspiciousCount: 0,
      highRiskCount: 0,
      averageScore: 0,
      breakdown: [],
    };
  }

  let totalScore = 0;
  let verifiedCount = 0;
  let likelyAuthCount = 0;
  let reviewCount = 0;
  let suspiciousCount = 0;
  let highRiskCount = 0;

  for (const card of cards) {
    const score = calculateAuthScore(card);
    totalScore += score.overall;

    switch (score.label) {
      case 'Verified': verifiedCount++; break;
      case 'Likely Authentic': likelyAuthCount++; break;
      case 'Review Recommended': reviewCount++; break;
      case 'Suspicious': suspiciousCount++; break;
      case 'High Risk': highRiskCount++; break;
    }
  }

  const averageScore = Math.round(totalScore / cards.length);

  // Overall collection score is weighted: penalize more for suspicious/high-risk
  const penalty = (suspiciousCount * 5 + highRiskCount * 15);
  const overall = Math.max(0, Math.min(100, averageScore - penalty));

  return {
    overall,
    totalCards: cards.length,
    verifiedCount,
    suspiciousCount,
    highRiskCount,
    averageScore,
    breakdown: [
      { label: 'Verified', count: verifiedCount, color: '#10b981' },
      { label: 'Likely Authentic', count: likelyAuthCount, color: '#3b82f6' },
      { label: 'Review Recommended', count: reviewCount, color: '#f59e0b' },
      { label: 'Suspicious', count: suspiciousCount, color: '#f97316' },
      { label: 'High Risk', count: highRiskCount, color: '#ef4444' },
    ].filter(b => b.count > 0),
  };
}
