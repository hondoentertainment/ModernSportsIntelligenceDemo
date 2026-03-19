// Phase 141 – Grading Trust & Transparency Auditor Service

import { store } from '../dal/syncStore';

// ---- Types ----

export type GradingCompany = 'psa' | 'bgs' | 'sgc' | 'cgc' | 'hga' | 'tag' | 'isa' | 'gma';

export type TurnaroundTier = 'economy' | 'standard' | 'express' | 'super_express' | 'walk_through';

export interface TrustScore {
  company: GradingCompany;
  overall: number;
  consistency: number;
  transparency: number;
  speed: number;
  value: number;
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export interface ConsistencyReport {
  company: GradingCompany;
  sampleSize: number;
  resubmissionMatchRate: number;
  crossoverAgreementRate: number;
  gradeVariance: number;
  controversyCount: number;
  period: string;
}

export interface CrossoverResult {
  id: string;
  fromCompany: GradingCompany;
  toCompany: GradingCompany;
  cardName: string;
  originalGrade: number;
  newGrade: number;
  gradeChange: number;
  success: boolean;
  date: string;
}

export interface TurnaroundData {
  company: GradingCompany;
  tier: TurnaroundTier;
  advertisedDays: number;
  actualDays: number;
  costPerCard: number;
  onTimeRate: number;
}

export interface GradeDistribution {
  company: GradingCompany;
  grade: number;
  count: number;
  percentage: number;
}

export interface PriceImpact {
  company: GradingCompany;
  grade: number;
  rawMultiplier: number;
  premiumOverRaw: number;
  avgSalePrice: number;
}

export interface AuditorAlert {
  id: string;
  company: GradingCompany;
  type: 'grade_inflation' | 'turnaround_delay' | 'price_premium_change' | 'consistency_drop' | 'population_spike' | 'policy_change';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  date: string;
  impact: string;
}

export interface PopulationReport {
  company: GradingCompany;
  totalGraded: number;
  gem10Count: number;
  mint9Count: number;
  nmMint8Count: number;
  lowerCount: number;
  gem10Pct: number;
  monthlyVolume: number;
  yearOverYearChange: number;
}

export interface GraderProfile {
  company: GradingCompany;
  fullName: string;
  founded: number;
  headquarters: string;
  totalGraded: number;
  avgTurnaround: number;
  slabDesignRating: number;
  holderDurability: number;
  marketAcceptance: number;
  digitalVerification: boolean;
  qrCodeEnabled: boolean;
  features: string[];
}

export interface SubmissionRecommendation {
  company: GradingCompany;
  recommendedTier: TurnaroundTier;
  estimatedCost: number;
  estimatedDays: number;
  expectedMultiplier: number;
  projectedValue: number;
  roi: number;
  reasoning: string;
}

export interface GradingTrend {
  month: string;
  psa: number;
  bgs: number;
  sgc: number;
  cgc: number;
  hga: number;
  submissions: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_grading_auditor';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.has(`${STORAGE_KEY}_${key}`) ? store.get<T>(`${STORAGE_KEY}_${key}`, null as unknown as T) : null;
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Mock Data ----

const GRADER_PROFILES: GraderProfile[] = [
  {
    company: 'psa', fullName: 'Professional Sports Authenticator', founded: 1991,
    headquarters: 'Santa Ana, CA', totalGraded: 58000000, avgTurnaround: 42,
    slabDesignRating: 88, holderDurability: 85, marketAcceptance: 98,
    digitalVerification: true, qrCodeEnabled: true,
    features: ['Cert verification', 'Pop report', 'Set registry', 'AI grading assist', 'Card Facts'],
  },
  {
    company: 'bgs', fullName: 'Beckett Grading Services', founded: 1999,
    headquarters: 'Dallas, TX', totalGraded: 22000000, avgTurnaround: 55,
    slabDesignRating: 92, holderDurability: 90, marketAcceptance: 92,
    digitalVerification: true, qrCodeEnabled: true,
    features: ['Sub-grades', 'Black label', 'Pristine 10', 'Online lookup', 'Beckett Raw Review'],
  },
  {
    company: 'sgc', fullName: 'Sportscard Guaranty Corporation', founded: 1998,
    headquarters: 'Parsippany, NJ', totalGraded: 8500000, avgTurnaround: 28,
    slabDesignRating: 84, holderDurability: 82, marketAcceptance: 80,
    digitalVerification: true, qrCodeEnabled: false,
    features: ['Tuxedo slab', 'Registry', 'Fast turnaround', 'Vintage specialty', 'Custom labels'],
  },
  {
    company: 'cgc', fullName: 'Certified Guaranty Company (Trading Cards)', founded: 2020,
    headquarters: 'Sarasota, FL', totalGraded: 3200000, avgTurnaround: 35,
    slabDesignRating: 90, holderDurability: 88, marketAcceptance: 72,
    digitalVerification: true, qrCodeEnabled: true,
    features: ['Inner well slab', 'Comics heritage', 'Population report', 'Crossover program', 'Tiered membership'],
  },
  {
    company: 'hga', fullName: 'Hybrid Grading Approach', founded: 2020,
    headquarters: 'Grand Rapids, MI', totalGraded: 1800000, avgTurnaround: 22,
    slabDesignRating: 86, holderDurability: 78, marketAcceptance: 55,
    digitalVerification: true, qrCodeEnabled: true,
    features: ['AI + human grading', 'Custom slab colors', 'Fast processing', 'Subgrades standard', 'App-based tracking'],
  },
  {
    company: 'tag', fullName: 'Technical Authentication & Grading', founded: 2021,
    headquarters: 'Denver, CO', totalGraded: 420000, avgTurnaround: 18,
    slabDesignRating: 80, holderDurability: 75, marketAcceptance: 35,
    digitalVerification: true, qrCodeEnabled: false,
    features: ['Transparent pricing', 'Bulk discounts', 'Quick turnaround', 'Modern card focus', 'NFC verification'],
  },
  {
    company: 'isa', fullName: 'International Sports Authentication', founded: 2018,
    headquarters: 'Mississauga, ON', totalGraded: 750000, avgTurnaround: 30,
    slabDesignRating: 78, holderDurability: 76, marketAcceptance: 40,
    digitalVerification: false, qrCodeEnabled: false,
    features: ['Canadian market focus', 'Hockey specialty', 'Affordable pricing', 'Bilingual certs', 'Emerging presence'],
  },
  {
    company: 'gma', fullName: 'GMA Grading', founded: 2014,
    headquarters: 'Milford, CT', totalGraded: 2100000, avgTurnaround: 15,
    slabDesignRating: 65, holderDurability: 60, marketAcceptance: 30,
    digitalVerification: false, qrCodeEnabled: false,
    features: ['Budget pricing', 'Fastest turnaround', 'Bulk specials', 'Low minimums', 'Reseller popular'],
  },
];

const TRUST_SCORES: TrustScore[] = [
  { company: 'psa', overall: 92, consistency: 88, transparency: 85, speed: 65, value: 78, accuracy: 90, trend: 'stable', lastUpdated: '2026-03-10' },
  { company: 'bgs', overall: 89, consistency: 92, transparency: 87, speed: 58, value: 75, accuracy: 93, trend: 'up', lastUpdated: '2026-03-10' },
  { company: 'sgc', overall: 85, consistency: 84, transparency: 82, speed: 88, value: 90, accuracy: 86, trend: 'up', lastUpdated: '2026-03-10' },
  { company: 'cgc', overall: 80, consistency: 82, transparency: 88, speed: 78, value: 82, accuracy: 84, trend: 'up', lastUpdated: '2026-03-10' },
  { company: 'hga', overall: 72, consistency: 70, transparency: 80, speed: 92, value: 85, accuracy: 74, trend: 'down', lastUpdated: '2026-03-10' },
  { company: 'tag', overall: 65, consistency: 68, transparency: 75, speed: 90, value: 88, accuracy: 70, trend: 'stable', lastUpdated: '2026-03-10' },
  { company: 'isa', overall: 60, consistency: 62, transparency: 65, speed: 82, value: 85, accuracy: 64, trend: 'stable', lastUpdated: '2026-03-10' },
  { company: 'gma', overall: 45, consistency: 42, transparency: 50, speed: 95, value: 92, accuracy: 40, trend: 'down', lastUpdated: '2026-03-10' },
];

const CROSSOVER_RESULTS: CrossoverResult[] = [
  { id: 'cr_001', fromCompany: 'sgc', toCompany: 'psa', cardName: '1986 Fleer Michael Jordan RC #57', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-01-15' },
  { id: 'cr_002', fromCompany: 'bgs', toCompany: 'psa', cardName: '2020 Prizm Joe Burrow RC Silver', originalGrade: 9.5, newGrade: 10, gradeChange: 0.5, success: true, date: '2026-01-20' },
  { id: 'cr_003', fromCompany: 'cgc', toCompany: 'psa', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto', originalGrade: 9.5, newGrade: 9, gradeChange: -0.5, success: false, date: '2026-01-22' },
  { id: 'cr_004', fromCompany: 'hga', toCompany: 'psa', cardName: '2023 Bowman Chrome 1st Jackson Holliday Auto', originalGrade: 9.5, newGrade: 9, gradeChange: -0.5, success: false, date: '2026-01-25' },
  { id: 'cr_005', fromCompany: 'sgc', toCompany: 'bgs', cardName: '1952 Topps Mickey Mantle #311', originalGrade: 5, newGrade: 5, gradeChange: 0, success: true, date: '2026-02-01' },
  { id: 'cr_006', fromCompany: 'psa', toCompany: 'bgs', cardName: '2018 Topps Chrome Shohei Ohtani RC Auto', originalGrade: 10, newGrade: 9.5, gradeChange: -0.5, success: true, date: '2026-02-05' },
  { id: 'cr_007', fromCompany: 'cgc', toCompany: 'bgs', cardName: '2023 Prizm Silver Victor Wembanyama RC', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-02-08' },
  { id: 'cr_008', fromCompany: 'gma', toCompany: 'psa', cardName: '2024 Topps Chrome Paul Skenes RC', originalGrade: 10, newGrade: 8, gradeChange: -2, success: false, date: '2026-02-10' },
  { id: 'cr_009', fromCompany: 'psa', toCompany: 'sgc', cardName: '1933 Goudey Babe Ruth #53', originalGrade: 4, newGrade: 4, gradeChange: 0, success: true, date: '2026-02-12' },
  { id: 'cr_010', fromCompany: 'bgs', toCompany: 'sgc', cardName: '1955 Topps Roberto Clemente RC #164', originalGrade: 7, newGrade: 7, gradeChange: 0, success: true, date: '2026-02-14' },
  { id: 'cr_011', fromCompany: 'hga', toCompany: 'bgs', cardName: '2022 Panini One Patrick Mahomes Patch Auto /10', originalGrade: 9, newGrade: 8.5, gradeChange: -0.5, success: false, date: '2026-02-15' },
  { id: 'cr_012', fromCompany: 'sgc', toCompany: 'psa', cardName: '1969 Topps Reggie Jackson RC #260', originalGrade: 7, newGrade: 7, gradeChange: 0, success: true, date: '2026-02-18' },
  { id: 'cr_013', fromCompany: 'psa', toCompany: 'bgs', cardName: '2021 Bowman 1st Jasson Dominguez Auto', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-02-20' },
  { id: 'cr_014', fromCompany: 'cgc', toCompany: 'sgc', cardName: '2023 Topps Chrome Elly De La Cruz RC Auto', originalGrade: 9.5, newGrade: 9.5, gradeChange: 0, success: true, date: '2026-02-22' },
  { id: 'cr_015', fromCompany: 'gma', toCompany: 'bgs', cardName: '2024 Bowman Chrome 1st Jac Caglianone Auto', originalGrade: 9.5, newGrade: 7.5, gradeChange: -2, success: false, date: '2026-02-24' },
  { id: 'cr_016', fromCompany: 'tag', toCompany: 'psa', cardName: '2023 Select Concourse Shohei Ohtani', originalGrade: 10, newGrade: 9, gradeChange: -1, success: false, date: '2026-02-26' },
  { id: 'cr_017', fromCompany: 'bgs', toCompany: 'psa', cardName: '2009 Bowman Chrome Mike Trout Auto RC', originalGrade: 9.5, newGrade: 10, gradeChange: 0.5, success: true, date: '2026-02-28' },
  { id: 'cr_018', fromCompany: 'sgc', toCompany: 'psa', cardName: '2011 Topps Update Mike Trout RC #US175', originalGrade: 10, newGrade: 10, gradeChange: 0, success: true, date: '2026-03-01' },
  { id: 'cr_019', fromCompany: 'isa', toCompany: 'psa', cardName: '2022 Topps Chrome Bo Bichette', originalGrade: 9.5, newGrade: 9, gradeChange: -0.5, success: false, date: '2026-03-02' },
  { id: 'cr_020', fromCompany: 'hga', toCompany: 'sgc', cardName: '2024 Prizm Silver Caleb Williams RC', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-03-03' },
  { id: 'cr_021', fromCompany: 'psa', toCompany: 'cgc', cardName: '2023 National Treasures Victor Wembanyama RPA /49', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-03-04' },
  { id: 'cr_022', fromCompany: 'gma', toCompany: 'sgc', cardName: '2022 Donruss Optic CeeDee Lamb', originalGrade: 10, newGrade: 8, gradeChange: -2, success: false, date: '2026-03-05' },
  { id: 'cr_023', fromCompany: 'sgc', toCompany: 'psa', cardName: '2024 Topps Heritage Gunnar Henderson SP', originalGrade: 9.5, newGrade: 10, gradeChange: 0.5, success: true, date: '2026-03-06' },
  { id: 'cr_024', fromCompany: 'bgs', toCompany: 'psa', cardName: '1989 Upper Deck Ken Griffey Jr RC #1', originalGrade: 9.5, newGrade: 10, gradeChange: 0.5, success: true, date: '2026-03-07' },
  { id: 'cr_025', fromCompany: 'cgc', toCompany: 'psa', cardName: '2022 Bowman Chrome Julio Rodriguez 1st Auto', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-03-08' },
  { id: 'cr_026', fromCompany: 'tag', toCompany: 'bgs', cardName: '2024 National Treasures Caleb Williams RPA /99', originalGrade: 9.5, newGrade: 9, gradeChange: -0.5, success: false, date: '2026-03-08' },
  { id: 'cr_027', fromCompany: 'psa', toCompany: 'bgs', cardName: '2001 Bowman Chrome Albert Pujols Auto', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-03-09' },
  { id: 'cr_028', fromCompany: 'isa', toCompany: 'sgc', cardName: '2023 Upper Deck Connor Bedard Young Guns RC', originalGrade: 9, newGrade: 9.5, gradeChange: 0.5, success: true, date: '2026-03-09' },
  { id: 'cr_029', fromCompany: 'hga', toCompany: 'psa', cardName: '2023 Immaculate Gunnar Henderson RPA /25', originalGrade: 9, newGrade: 8, gradeChange: -1, success: false, date: '2026-03-10' },
  { id: 'cr_030', fromCompany: 'sgc', toCompany: 'psa', cardName: '1975 Topps George Brett RC #228', originalGrade: 7, newGrade: 7, gradeChange: 0, success: true, date: '2026-03-10' },
  { id: 'cr_031', fromCompany: 'bgs', toCompany: 'psa', cardName: '2022 Flawless Connor McDavid Patch Auto /15', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-03-11' },
  { id: 'cr_032', fromCompany: 'gma', toCompany: 'psa', cardName: '2023 Topps Heritage Ronald Acuna Jr SP', originalGrade: 9.5, newGrade: 7, gradeChange: -2.5, success: false, date: '2026-03-11' },
  { id: 'cr_033', fromCompany: 'cgc', toCompany: 'bgs', cardName: '2024 Topps Chrome Paul Skenes RC Auto /25', originalGrade: 9.5, newGrade: 9.5, gradeChange: 0, success: true, date: '2026-03-12' },
  { id: 'cr_034', fromCompany: 'psa', toCompany: 'sgc', cardName: '1971 Topps Nolan Ryan #513', originalGrade: 6, newGrade: 6.5, gradeChange: 0.5, success: true, date: '2026-03-12' },
  { id: 'cr_035', fromCompany: 'tag', toCompany: 'sgc', cardName: '2023 Bowman Chrome Trevor Lawrence Auto', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-03-13' },
  { id: 'cr_036', fromCompany: 'hga', toCompany: 'cgc', cardName: '2024 Bowman 1st Chrome Travis Bazzana Auto', originalGrade: 9.5, newGrade: 9, gradeChange: -0.5, success: false, date: '2026-03-13' },
  { id: 'cr_037', fromCompany: 'sgc', toCompany: 'bgs', cardName: '1993 SP Foil Derek Jeter RC #279', originalGrade: 8, newGrade: 8, gradeChange: 0, success: true, date: '2026-03-14' },
  { id: 'cr_038', fromCompany: 'isa', toCompany: 'bgs', cardName: '2022 Upper Deck Cale Makar Young Guns Auto', originalGrade: 9, newGrade: 8.5, gradeChange: -0.5, success: false, date: '2026-03-14' },
  { id: 'cr_039', fromCompany: 'gma', toCompany: 'sgc', cardName: '2023 Prizm Silver Elly De La Cruz RC', originalGrade: 10, newGrade: 8.5, gradeChange: -1.5, success: false, date: '2026-03-14' },
  { id: 'cr_040', fromCompany: 'psa', toCompany: 'bgs', cardName: '2022 Topps Chrome Mookie Betts Gold Refractor /50', originalGrade: 10, newGrade: 9.5, gradeChange: -0.5, success: true, date: '2026-03-15' },
  { id: 'cr_041', fromCompany: 'bgs', toCompany: 'sgc', cardName: '2021 National Treasures Juan Soto Patch /49', originalGrade: 9, newGrade: 9, gradeChange: 0, success: true, date: '2026-03-15' },
  { id: 'cr_042', fromCompany: 'cgc', toCompany: 'psa', cardName: '2024 Topps Chrome Wyatt Langford RC', originalGrade: 10, newGrade: 10, gradeChange: 0, success: true, date: '2026-03-15' },
];

const TURNAROUND_DATA: TurnaroundData[] = [
  { company: 'psa', tier: 'economy', advertisedDays: 150, actualDays: 165, costPerCard: 25, onTimeRate: 72 },
  { company: 'psa', tier: 'standard', advertisedDays: 65, actualDays: 70, costPerCard: 50, onTimeRate: 80 },
  { company: 'psa', tier: 'express', advertisedDays: 20, actualDays: 22, costPerCard: 100, onTimeRate: 88 },
  { company: 'psa', tier: 'super_express', advertisedDays: 10, actualDays: 10, costPerCard: 200, onTimeRate: 95 },
  { company: 'psa', tier: 'walk_through', advertisedDays: 2, actualDays: 2, costPerCard: 600, onTimeRate: 99 },
  { company: 'bgs', tier: 'economy', advertisedDays: 120, actualDays: 145, costPerCard: 22, onTimeRate: 65 },
  { company: 'bgs', tier: 'standard', advertisedDays: 50, actualDays: 58, costPerCard: 40, onTimeRate: 75 },
  { company: 'bgs', tier: 'express', advertisedDays: 15, actualDays: 18, costPerCard: 100, onTimeRate: 82 },
  { company: 'bgs', tier: 'super_express', advertisedDays: 5, actualDays: 6, costPerCard: 250, onTimeRate: 90 },
  { company: 'bgs', tier: 'walk_through', advertisedDays: 2, actualDays: 2, costPerCard: 500, onTimeRate: 98 },
  { company: 'sgc', tier: 'economy', advertisedDays: 60, actualDays: 55, costPerCard: 18, onTimeRate: 90 },
  { company: 'sgc', tier: 'standard', advertisedDays: 30, actualDays: 28, costPerCard: 30, onTimeRate: 92 },
  { company: 'sgc', tier: 'express', advertisedDays: 10, actualDays: 10, costPerCard: 60, onTimeRate: 95 },
  { company: 'sgc', tier: 'super_express', advertisedDays: 5, actualDays: 5, costPerCard: 100, onTimeRate: 97 },
  { company: 'sgc', tier: 'walk_through', advertisedDays: 1, actualDays: 1, costPerCard: 250, onTimeRate: 99 },
  { company: 'cgc', tier: 'economy', advertisedDays: 90, actualDays: 85, costPerCard: 20, onTimeRate: 85 },
  { company: 'cgc', tier: 'standard', advertisedDays: 40, actualDays: 38, costPerCard: 35, onTimeRate: 88 },
  { company: 'cgc', tier: 'express', advertisedDays: 12, actualDays: 13, costPerCard: 75, onTimeRate: 90 },
  { company: 'cgc', tier: 'super_express', advertisedDays: 5, actualDays: 5, costPerCard: 150, onTimeRate: 94 },
  { company: 'cgc', tier: 'walk_through', advertisedDays: 2, actualDays: 2, costPerCard: 350, onTimeRate: 97 },
  { company: 'hga', tier: 'economy', advertisedDays: 45, actualDays: 40, costPerCard: 18, onTimeRate: 88 },
  { company: 'hga', tier: 'standard', advertisedDays: 20, actualDays: 22, costPerCard: 30, onTimeRate: 82 },
  { company: 'hga', tier: 'express', advertisedDays: 7, actualDays: 8, costPerCard: 55, onTimeRate: 85 },
  { company: 'hga', tier: 'super_express', advertisedDays: 3, actualDays: 3, costPerCard: 100, onTimeRate: 92 },
  { company: 'tag', tier: 'economy', advertisedDays: 30, actualDays: 28, costPerCard: 15, onTimeRate: 90 },
  { company: 'tag', tier: 'standard', advertisedDays: 15, actualDays: 15, costPerCard: 25, onTimeRate: 92 },
  { company: 'tag', tier: 'express', advertisedDays: 5, actualDays: 5, costPerCard: 50, onTimeRate: 95 },
  { company: 'isa', tier: 'economy', advertisedDays: 60, actualDays: 55, costPerCard: 12, onTimeRate: 85 },
  { company: 'isa', tier: 'standard', advertisedDays: 30, actualDays: 30, costPerCard: 20, onTimeRate: 88 },
  { company: 'isa', tier: 'express', advertisedDays: 10, actualDays: 12, costPerCard: 40, onTimeRate: 82 },
  { company: 'gma', tier: 'economy', advertisedDays: 20, actualDays: 18, costPerCard: 8, onTimeRate: 92 },
  { company: 'gma', tier: 'standard', advertisedDays: 10, actualDays: 10, costPerCard: 12, onTimeRate: 94 },
  { company: 'gma', tier: 'express', advertisedDays: 5, actualDays: 5, costPerCard: 25, onTimeRate: 96 },
];

const AUDITOR_ALERTS: AuditorAlert[] = [
  { id: 'aa_001', company: 'psa', type: 'grade_inflation', severity: 'warning', title: 'PSA Gem Mint 10 Rate Increasing', description: 'PSA gem rate for 2024 submissions has risen to 38% from 32% the prior year, raising consistency concerns among collectors.', date: '2026-03-10', impact: 'PSA 10 premiums may compress as supply increases' },
  { id: 'aa_002', company: 'bgs', type: 'turnaround_delay', severity: 'info', title: 'BGS Economy Tier Backlog', description: 'BGS economy turnaround times are running 20% over advertised due to increased vintage submissions.', date: '2026-03-08', impact: 'Plan for 145+ day turnaround on economy submissions' },
  { id: 'aa_003', company: 'hga', type: 'consistency_drop', severity: 'critical', title: 'HGA Consistency Rating Drops to 70', description: 'Multiple reports of identical resubmissions receiving different grades. AI calibration may need adjustment.', date: '2026-03-05', impact: 'Consider alternative graders for high-value submissions' },
  { id: 'aa_004', company: 'sgc', type: 'price_premium_change', severity: 'info', title: 'SGC Premiums Rising for Vintage', description: 'SGC tuxedo slabs are seeing increased auction premiums for pre-1970 cards, closing the gap with PSA.', date: '2026-03-03', impact: 'SGC vintage submissions may yield better ROI than PSA economy' },
  { id: 'aa_005', company: 'gma', type: 'grade_inflation', severity: 'critical', title: 'GMA Gem Rate Exceeds 65%', description: 'GMA gem mint rate continues to climb, with over 65% of submissions receiving 10s. Market confidence declining.', date: '2026-03-01', impact: 'GMA 10 multiplier now only 1.2x raw — crossover to PSA recommended' },
  { id: 'aa_006', company: 'cgc', type: 'policy_change', severity: 'info', title: 'CGC Introduces Crossover Program', description: 'CGC now accepts crossovers from PSA, BGS, and SGC with guaranteed minimum grade or return.', date: '2026-02-28', impact: 'New option for collectors dissatisfied with current grades' },
  { id: 'aa_007', company: 'psa', type: 'population_spike', severity: 'warning', title: 'PSA 10 Population Spike for 2024 Bowman Chrome', description: 'Over 12,000 PSA 10s registered for 2024 Bowman Chrome base set in first 90 days, suggesting high submission volume.', date: '2026-02-25', impact: 'Gem population growth may suppress per-card premiums' },
  { id: 'aa_008', company: 'tag', type: 'consistency_drop', severity: 'warning', title: 'TAG Grading Variance Reports', description: 'Collector forums report 1-2 grade variance on resubmissions to TAG. Small sample size but concerning trend.', date: '2026-02-20', impact: 'May want to wait for TAG calibration updates before submitting' },
  { id: 'aa_009', company: 'bgs', type: 'price_premium_change', severity: 'warning', title: 'BGS Black Label Premium Compressing', description: 'BGS Black Label 10 premium over standard Pristine 10 has declined from 3.5x to 2.8x over 6 months.', date: '2026-02-15', impact: 'Black Label speculation less attractive at current premiums' },
  { id: 'aa_010', company: 'psa', type: 'turnaround_delay', severity: 'info', title: 'PSA Walk-Through Available at Shows', description: 'PSA expanding walk-through grading at major card shows with 1-day turnaround for first 200 submissions.', date: '2026-02-10', impact: 'Good opportunity for immediate grading at shows' },
  { id: 'aa_011', company: 'sgc', type: 'population_spike', severity: 'info', title: 'SGC Gaining Modern Card Share', description: 'SGC submissions for 2023-2024 products up 45% year over year as collectors seek alternatives to PSA pricing.', date: '2026-02-05', impact: 'SGC modern premiums may increase with growing acceptance' },
  { id: 'aa_012', company: 'isa', type: 'policy_change', severity: 'info', title: 'ISA Expands US Acceptance', description: 'ISA opening US drop-off locations in Michigan and Texas, reducing cross-border shipping costs.', date: '2026-02-01', impact: 'ISA becomes more accessible for US-based hockey collectors' },
];

const POPULATION_REPORTS: PopulationReport[] = [
  { company: 'psa', totalGraded: 58000000, gem10Count: 18850000, mint9Count: 17400000, nmMint8Count: 10440000, lowerCount: 11310000, gem10Pct: 32.5, monthlyVolume: 850000, yearOverYearChange: 12 },
  { company: 'bgs', totalGraded: 22000000, gem10Count: 3520000, mint9Count: 7480000, nmMint8Count: 5720000, lowerCount: 5280000, gem10Pct: 16.0, monthlyVolume: 320000, yearOverYearChange: 8 },
  { company: 'sgc', totalGraded: 8500000, gem10Count: 2380000, mint9Count: 2890000, nmMint8Count: 1700000, lowerCount: 1530000, gem10Pct: 28.0, monthlyVolume: 185000, yearOverYearChange: 22 },
  { company: 'cgc', totalGraded: 3200000, gem10Count: 832000, mint9Count: 1088000, nmMint8Count: 672000, lowerCount: 608000, gem10Pct: 26.0, monthlyVolume: 95000, yearOverYearChange: 35 },
  { company: 'hga', totalGraded: 1800000, gem10Count: 540000, mint9Count: 594000, nmMint8Count: 360000, lowerCount: 306000, gem10Pct: 30.0, monthlyVolume: 42000, yearOverYearChange: -15 },
  { company: 'tag', totalGraded: 420000, gem10Count: 126000, mint9Count: 138600, nmMint8Count: 84000, lowerCount: 71400, gem10Pct: 30.0, monthlyVolume: 18000, yearOverYearChange: 40 },
  { company: 'isa', totalGraded: 750000, gem10Count: 195000, mint9Count: 255000, nmMint8Count: 157500, lowerCount: 142500, gem10Pct: 26.0, monthlyVolume: 22000, yearOverYearChange: 18 },
  { company: 'gma', totalGraded: 2100000, gem10Count: 1365000, mint9Count: 420000, nmMint8Count: 189000, lowerCount: 126000, gem10Pct: 65.0, monthlyVolume: 75000, yearOverYearChange: -8 },
];

const PRICE_IMPACTS: PriceImpact[] = [
  { company: 'psa', grade: 10, rawMultiplier: 5.2, premiumOverRaw: 420, avgSalePrice: 520 },
  { company: 'psa', grade: 9, rawMultiplier: 2.1, premiumOverRaw: 110, avgSalePrice: 210 },
  { company: 'psa', grade: 8, rawMultiplier: 1.4, premiumOverRaw: 40, avgSalePrice: 140 },
  { company: 'psa', grade: 7, rawMultiplier: 1.1, premiumOverRaw: 10, avgSalePrice: 110 },
  { company: 'bgs', grade: 10, rawMultiplier: 8.5, premiumOverRaw: 750, avgSalePrice: 850 },
  { company: 'bgs', grade: 9.5, rawMultiplier: 3.8, premiumOverRaw: 280, avgSalePrice: 380 },
  { company: 'bgs', grade: 9, rawMultiplier: 2.0, premiumOverRaw: 100, avgSalePrice: 200 },
  { company: 'bgs', grade: 8.5, rawMultiplier: 1.3, premiumOverRaw: 30, avgSalePrice: 130 },
  { company: 'sgc', grade: 10, rawMultiplier: 3.5, premiumOverRaw: 250, avgSalePrice: 350 },
  { company: 'sgc', grade: 9, rawMultiplier: 1.7, premiumOverRaw: 70, avgSalePrice: 170 },
  { company: 'sgc', grade: 8, rawMultiplier: 1.2, premiumOverRaw: 20, avgSalePrice: 120 },
  { company: 'sgc', grade: 7, rawMultiplier: 1.05, premiumOverRaw: 5, avgSalePrice: 105 },
  { company: 'cgc', grade: 10, rawMultiplier: 2.8, premiumOverRaw: 180, avgSalePrice: 280 },
  { company: 'cgc', grade: 9, rawMultiplier: 1.5, premiumOverRaw: 50, avgSalePrice: 150 },
  { company: 'cgc', grade: 8, rawMultiplier: 1.15, premiumOverRaw: 15, avgSalePrice: 115 },
  { company: 'hga', grade: 10, rawMultiplier: 1.8, premiumOverRaw: 80, avgSalePrice: 180 },
  { company: 'hga', grade: 9, rawMultiplier: 1.3, premiumOverRaw: 30, avgSalePrice: 130 },
  { company: 'hga', grade: 8, rawMultiplier: 1.05, premiumOverRaw: 5, avgSalePrice: 105 },
  { company: 'tag', grade: 10, rawMultiplier: 1.5, premiumOverRaw: 50, avgSalePrice: 150 },
  { company: 'tag', grade: 9, rawMultiplier: 1.15, premiumOverRaw: 15, avgSalePrice: 115 },
  { company: 'isa', grade: 10, rawMultiplier: 1.4, premiumOverRaw: 40, avgSalePrice: 140 },
  { company: 'isa', grade: 9, rawMultiplier: 1.1, premiumOverRaw: 10, avgSalePrice: 110 },
  { company: 'gma', grade: 10, rawMultiplier: 1.2, premiumOverRaw: 20, avgSalePrice: 120 },
  { company: 'gma', grade: 9, rawMultiplier: 1.05, premiumOverRaw: 5, avgSalePrice: 105 },
];

const GRADING_TRENDS: GradingTrend[] = [
  { month: '2025-04', psa: 90, bgs: 87, sgc: 82, cgc: 74, hga: 78, submissions: 1250000 },
  { month: '2025-05', psa: 90, bgs: 87, sgc: 82, cgc: 75, hga: 77, submissions: 1280000 },
  { month: '2025-06', psa: 91, bgs: 88, sgc: 83, cgc: 76, hga: 76, submissions: 1310000 },
  { month: '2025-07', psa: 91, bgs: 88, sgc: 83, cgc: 77, hga: 75, submissions: 1350000 },
  { month: '2025-08', psa: 91, bgs: 88, sgc: 84, cgc: 77, hga: 74, submissions: 1320000 },
  { month: '2025-09', psa: 92, bgs: 89, sgc: 84, cgc: 78, hga: 74, submissions: 1380000 },
  { month: '2025-10', psa: 92, bgs: 89, sgc: 84, cgc: 79, hga: 73, submissions: 1410000 },
  { month: '2025-11', psa: 92, bgs: 89, sgc: 85, cgc: 79, hga: 73, submissions: 1450000 },
  { month: '2025-12', psa: 92, bgs: 89, sgc: 85, cgc: 80, hga: 72, submissions: 1520000 },
  { month: '2026-01', psa: 92, bgs: 89, sgc: 85, cgc: 80, hga: 72, submissions: 1480000 },
  { month: '2026-02', psa: 92, bgs: 89, sgc: 85, cgc: 80, hga: 72, submissions: 1510000 },
  { month: '2026-03', psa: 92, bgs: 89, sgc: 85, cgc: 80, hga: 72, submissions: 1550000 },
];

// ---- Helper Functions ----

const COMPANY_CONFIG: Record<GradingCompany, { label: string; text: string; bg: string; border: string }> = {
  psa: { label: 'PSA', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  bgs: { label: 'BGS', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  sgc: { label: 'SGC', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  cgc: { label: 'CGC', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  hga: { label: 'HGA', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  tag: { label: 'TAG', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  isa: { label: 'ISA', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  gma: { label: 'GMA', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const GRADE_CONFIG: Record<string, { label: string; text: string; bg: string; border: string }> = {
  '10': { label: 'Gem Mint 10', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  '9.5': { label: 'Mint+ 9.5', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  '9': { label: 'Mint 9', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  '8.5': { label: 'NM-MT+ 8.5', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  '8': { label: 'NM-MT 8', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  '7': { label: 'NM 7', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  '6': { label: 'EX-MT 6', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  '5': { label: 'EX 5', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const SEVERITY_CONFIG: Record<string, { label: string; text: string; bg: string; border: string }> = {
  info: { label: 'Info', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  warning: { label: 'Warning', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  critical: { label: 'Critical', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

// ---- Public API ----

export function getCompanyConfig(company: GradingCompany): { label: string; text: string; bg: string; border: string } {
  return COMPANY_CONFIG[company];
}

export function getGradeConfig(grade: number): { label: string; text: string; bg: string; border: string } {
  return GRADE_CONFIG[String(grade)] ?? { label: `Grade ${grade}`, text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
}

export function getSeverityConfig(severity: string): { label: string; text: string; bg: string; border: string } {
  return SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG['info'];
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function getGraderProfiles(): GraderProfile[] {
  const cached = loadData<GraderProfile[]>('profiles');
  if (cached) return cached;
  saveData('profiles', GRADER_PROFILES);
  return GRADER_PROFILES;
}

export function getTrustScores(): TrustScore[] {
  const cached = loadData<TrustScore[]>('trust_scores');
  if (cached) return cached;
  saveData('trust_scores', TRUST_SCORES);
  return TRUST_SCORES;
}

export function getConsistencyReport(company?: GradingCompany): ConsistencyReport[] {
  const cacheKey = company ? `consistency_${company}` : 'consistency_all';
  const cached = loadData<ConsistencyReport[]>(cacheKey);
  if (cached) return cached;

  const reports: ConsistencyReport[] = GRADER_PROFILES.map(p => {
    const trust = TRUST_SCORES.find(t => t.company === p.company);
    const crossovers = CROSSOVER_RESULTS.filter(c => c.fromCompany === p.company || c.toCompany === p.company);
    const matchRate = crossovers.length > 0 ? Math.round(crossovers.filter(c => c.success).length / crossovers.length * 100) : 0;
    return {
      company: p.company,
      sampleSize: Math.round(p.totalGraded * 0.001),
      resubmissionMatchRate: trust?.consistency ?? 75,
      crossoverAgreementRate: matchRate,
      gradeVariance: Math.round((100 - (trust?.consistency ?? 75)) * 0.08 * 100) / 100,
      controversyCount: Math.round((100 - (trust?.consistency ?? 75)) * 0.3),
      period: '2025-Q4 to 2026-Q1',
    };
  });

  const result = company ? reports.filter(r => r.company === company) : reports;
  saveData(cacheKey, result);
  return result;
}

export function getCrossoverResults(from?: GradingCompany, to?: GradingCompany): CrossoverResult[] {
  const cacheKey = `crossovers_${from ?? 'all'}_${to ?? 'all'}`;
  const cached = loadData<CrossoverResult[]>(cacheKey);
  if (cached) return cached;

  let results = CROSSOVER_RESULTS;
  if (from) results = results.filter(r => r.fromCompany === from);
  if (to) results = results.filter(r => r.toCompany === to);

  saveData(cacheKey, results);
  return results;
}

export function getTurnaroundData(company?: GradingCompany): TurnaroundData[] {
  const cacheKey = company ? `turnaround_${company}` : 'turnaround_all';
  const cached = loadData<TurnaroundData[]>(cacheKey);
  if (cached) return cached;

  const result = company ? TURNAROUND_DATA.filter(t => t.company === company) : TURNAROUND_DATA;
  saveData(cacheKey, result);
  return result;
}

export function getGradeDistribution(company?: GradingCompany): GradeDistribution[] {
  const cacheKey = company ? `distribution_${company}` : 'distribution_all';
  const cached = loadData<GradeDistribution[]>(cacheKey);
  if (cached) return cached;

  const companies = company ? [POPULATION_REPORTS.find(p => p.company === company)!] : POPULATION_REPORTS;
  const result: GradeDistribution[] = [];

  companies.forEach(pop => {
    if (!pop) return;
    result.push({ company: pop.company, grade: 10, count: pop.gem10Count, percentage: pop.gem10Pct });
    result.push({ company: pop.company, grade: 9, count: pop.mint9Count, percentage: Math.round(pop.mint9Count / pop.totalGraded * 100 * 10) / 10 });
    result.push({ company: pop.company, grade: 8, count: pop.nmMint8Count, percentage: Math.round(pop.nmMint8Count / pop.totalGraded * 100 * 10) / 10 });
    result.push({ company: pop.company, grade: 7, count: Math.round(pop.lowerCount * 0.4), percentage: Math.round(pop.lowerCount * 0.4 / pop.totalGraded * 100 * 10) / 10 });
    result.push({ company: pop.company, grade: 6, count: Math.round(pop.lowerCount * 0.3), percentage: Math.round(pop.lowerCount * 0.3 / pop.totalGraded * 100 * 10) / 10 });
    result.push({ company: pop.company, grade: 5, count: Math.round(pop.lowerCount * 0.2), percentage: Math.round(pop.lowerCount * 0.2 / pop.totalGraded * 100 * 10) / 10 });
    result.push({ company: pop.company, grade: 4, count: Math.round(pop.lowerCount * 0.1), percentage: Math.round(pop.lowerCount * 0.1 / pop.totalGraded * 100 * 10) / 10 });
  });

  saveData(cacheKey, result);
  return result;
}

export function getPriceImpact(company?: GradingCompany, grade?: number): PriceImpact[] {
  const cacheKey = `price_impact_${company ?? 'all'}_${grade ?? 'all'}`;
  const cached = loadData<PriceImpact[]>(cacheKey);
  if (cached) return cached;

  let result = PRICE_IMPACTS;
  if (company) result = result.filter(p => p.company === company);
  if (grade) result = result.filter(p => p.grade === grade);

  saveData(cacheKey, result);
  return result;
}

export function getAuditorAlerts(): AuditorAlert[] {
  const cached = loadData<AuditorAlert[]>('alerts');
  if (cached) return cached;
  saveData('alerts', AUDITOR_ALERTS);
  return AUDITOR_ALERTS;
}

export function getPopulationReport(company?: GradingCompany): PopulationReport[] {
  const cacheKey = company ? `pop_${company}` : 'pop_all';
  const cached = loadData<PopulationReport[]>(cacheKey);
  if (cached) return cached;

  const result = company ? POPULATION_REPORTS.filter(p => p.company === company) : POPULATION_REPORTS;
  saveData(cacheKey, result);
  return result;
}

export function getSubmissionRecommendation(cardValue: number, company?: GradingCompany): SubmissionRecommendation[] {
  const cacheKey = `rec_${cardValue}_${company ?? 'all'}`;
  const cached = loadData<SubmissionRecommendation[]>(cacheKey);
  if (cached) return cached;

  const companies = company ? GRADER_PROFILES.filter(p => p.company === company) : GRADER_PROFILES;
  const recommendations: SubmissionRecommendation[] = [];

  companies.forEach(profile => {
    const tiers = TURNAROUND_DATA.filter(t => t.company === profile.company);
    const priceData = PRICE_IMPACTS.filter(p => p.company === profile.company);
    const bestMultiplier = priceData.length > 0 ? priceData[0].rawMultiplier : 1.5;

    const recommendedTier: TurnaroundTier = cardValue >= 5000 ? 'express' : cardValue >= 1000 ? 'standard' : 'economy';
    const tierData = tiers.find(t => t.tier === recommendedTier) ?? tiers[0];

    if (!tierData) return;

    const projectedValue = Math.round(cardValue * bestMultiplier);
    const roi = Math.round(((projectedValue - cardValue - tierData.costPerCard) / (cardValue + tierData.costPerCard)) * 100);

    let reasoning = '';
    if (profile.company === 'psa') reasoning = 'Highest market acceptance and liquidity. Best for cards you plan to sell.';
    else if (profile.company === 'bgs') reasoning = 'Strictest grading with sub-grades. Pristine/Black Label commands top premium.';
    else if (profile.company === 'sgc') reasoning = 'Best value with fast turnaround. Strong vintage market acceptance.';
    else if (profile.company === 'cgc') reasoning = 'Growing acceptance with strong holder design. Good for long-term holds.';
    else if (profile.company === 'hga') reasoning = 'Fast AI-assisted grading with custom slab colors. Budget-friendly option.';
    else if (profile.company === 'tag') reasoning = 'Transparent and affordable. Best for modern cards in bulk.';
    else if (profile.company === 'isa') reasoning = 'Affordable option popular in Canadian market. Good for hockey cards.';
    else reasoning = 'Most affordable option but limited market acceptance. Good for personal collection.';

    recommendations.push({
      company: profile.company,
      recommendedTier,
      estimatedCost: tierData.costPerCard,
      estimatedDays: tierData.actualDays,
      expectedMultiplier: bestMultiplier,
      projectedValue,
      roi,
      reasoning,
    });
  });

  recommendations.sort((a, b) => b.roi - a.roi);
  saveData(cacheKey, recommendations);
  return recommendations;
}

export function getGradingTrends(): GradingTrend[] {
  const cached = loadData<GradingTrend[]>('trends');
  if (cached) return cached;
  saveData('trends', GRADING_TRENDS);
  return GRADING_TRENDS;
}

export function comparePriceMultipliers(grade: number): PriceImpact[] {
  const cacheKey = `mult_compare_${grade}`;
  const cached = loadData<PriceImpact[]>(cacheKey);
  if (cached) return cached;

  const result = PRICE_IMPACTS.filter(p => p.grade === grade).sort((a, b) => b.rawMultiplier - a.rawMultiplier);
  saveData(cacheKey, result);
  return result;
}
