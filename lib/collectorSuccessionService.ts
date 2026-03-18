// Collector Succession Protocol Service

// ---- Types ----

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  accessLevel: 'full' | 'view-only' | 'liquidation-only';
  notificationPreference: 'immediate' | '30-days' | 'on-request';
  educationCompleted: boolean;
  lastVerified: string;
}

export interface LiquidationWaterfall {
  id: string;
  tier: number;
  name: string;
  description: string;
  cardsInTier: number;
  estimatedValue: number;
  liquidationMethod: 'bulk-sell' | 'auction' | 'dealer' | 'hold';
  timeline: string;
  notes?: string;
}

export interface SuccessionDocument {
  id: string;
  type: 'appraisal' | 'inventory' | 'insurance' | 'trust-language' | 'beneficiary-letter' | 'education-guide';
  name: string;
  status: 'generated' | 'pending' | 'outdated';
  generatedAt?: string;
  fileSize?: string;
}

export interface SuccessionReadiness {
  score: number;
  completedSteps: string[];
  pendingSteps: string[];
  criticalGaps: string[];
  estimatedCollectionValue: number;
  designatedBeneficiaries: number;
}

export interface EducationModule {
  id: string;
  title: string;
  targetAudience: 'heir' | 'executor' | 'both';
  duration: string;
  completed: boolean;
  content: string[];
}

export interface AttorneyContact {
  name: string;
  firm: string;
  specialty: string;
  phone: string;
  email: string;
  integrationStatus: 'connected' | 'pending' | 'not connected';
}

// ---- Data ----

const beneficiaries: Beneficiary[] = [
  {
    id: 'ben-001',
    name: 'Sarah Mitchell',
    relationship: 'Spouse',
    email: 'sarah.mitchell@email.com',
    phone: '(555) 234-5678',
    accessLevel: 'full',
    notificationPreference: 'immediate',
    educationCompleted: true,
    lastVerified: '2026-01-15',
  },
  {
    id: 'ben-002',
    name: 'James Mitchell Jr.',
    relationship: 'Son',
    email: 'james.jr@email.com',
    phone: '(555) 345-6789',
    accessLevel: 'view-only',
    notificationPreference: '30-days',
    educationCompleted: false,
    lastVerified: '2025-09-22',
  },
  {
    id: 'ben-003',
    name: 'Robert Chen',
    relationship: 'Estate Attorney',
    email: 'rchen@chenlaw.com',
    phone: '(555) 456-7890',
    accessLevel: 'liquidation-only',
    notificationPreference: 'immediate',
    educationCompleted: true,
    lastVerified: '2026-02-01',
  },
];

const liquidationWaterfall: LiquidationWaterfall[] = [
  {
    id: 'tier-1',
    tier: 1,
    name: 'Tier 1: Bulk Commons',
    description: 'Low-value base cards, duplicates, and commons under $5 each. Sell as lots on eBay or to a local dealer.',
    cardsInTier: 4200,
    estimatedValue: 8400,
    liquidationMethod: 'bulk-sell',
    timeline: 'Within 30 days',
    notes: 'Contact SportsBulk Buyers for batch pricing; expect 60-70 cents on the dollar.',
  },
  {
    id: 'tier-2',
    tier: 2,
    name: 'Tier 2: Mid-Range Parallels',
    description: 'Serial-numbered parallels, short prints, and cards valued $5–$100.',
    cardsInTier: 820,
    estimatedValue: 41000,
    liquidationMethod: 'dealer',
    timeline: 'Within 60 days',
    notes: 'COMC consignment recommended. Expect 4–8 week sale cycle.',
  },
  {
    id: 'tier-3',
    tier: 3,
    name: 'Tier 3: Certified Autos',
    description: 'On-card autographs and certified signed cards, $100–$500 range.',
    cardsInTier: 145,
    estimatedValue: 38750,
    liquidationMethod: 'auction',
    timeline: 'Within 90 days',
    notes: 'eBay auction format works well. Consider MySlabs for graded pieces.',
  },
  {
    id: 'tier-4',
    tier: 4,
    name: 'Tier 4: PSA/BGS Graded Keys',
    description: 'Professionally graded rookies, vintage stars, and low-pop key cards over $500.',
    cardsInTier: 68,
    estimatedValue: 124500,
    liquidationMethod: 'auction',
    timeline: 'Within 120 days',
    notes: 'Heritage or Goldin auction houses preferred. Do NOT rush this tier.',
  },
  {
    id: 'tier-5',
    tier: 5,
    name: 'Tier 5: Grail Pieces',
    description: '1/1 Superfractors, PSA 10 high-pop vintage, and irreplaceable cornerstone pieces.',
    cardsInTier: 7,
    estimatedValue: 312000,
    liquidationMethod: 'hold',
    timeline: 'Hold unless market peaks — 12–24 month window',
    notes: 'Consult with Robert Chen before any sale. Items include the 1952 Topps Mantle PSA 6 and the 2003 LeBron James BGS 9.5 RC.',
  },
];

const successionDocuments: SuccessionDocument[] = [
  {
    id: 'doc-001',
    type: 'inventory',
    name: 'Complete Collection Inventory (CSV + PDF)',
    status: 'generated',
    generatedAt: '2026-02-14',
    fileSize: '4.2 MB',
  },
  {
    id: 'doc-002',
    type: 'appraisal',
    name: 'Professional Appraisal Report — 2026',
    status: 'generated',
    generatedAt: '2026-01-20',
    fileSize: '1.8 MB',
  },
  {
    id: 'doc-003',
    type: 'insurance',
    name: 'Collectibles Insurance Policy Schedule',
    status: 'generated',
    generatedAt: '2025-11-05',
    fileSize: '920 KB',
  },
  {
    id: 'doc-004',
    type: 'beneficiary-letter',
    name: 'Letter of Instruction to Beneficiaries',
    status: 'generated',
    generatedAt: '2026-01-30',
    fileSize: '340 KB',
  },
  {
    id: 'doc-005',
    type: 'trust-language',
    name: 'Trust Amendment — Collectibles Schedule A',
    status: 'pending',
  },
  {
    id: 'doc-006',
    type: 'education-guide',
    name: 'Heir Orientation Guide: Understanding the Collection',
    status: 'generated',
    generatedAt: '2026-02-01',
    fileSize: '2.1 MB',
  },
  {
    id: 'doc-007',
    type: 'appraisal',
    name: 'Grail Tier Independent Appraisal (Updated)',
    status: 'outdated',
    generatedAt: '2024-08-11',
    fileSize: '880 KB',
  },
  {
    id: 'doc-008',
    type: 'trust-language',
    name: 'Pour-Over Will — Sports Card Addendum',
    status: 'pending',
  },
];

const educationModules: EducationModule[] = [
  {
    id: 'edu-001',
    title: 'Understanding Card Grades',
    targetAudience: 'heir',
    duration: '12 min',
    completed: true,
    content: [
      'What PSA, BGS, and SGC grades mean',
      'Why a PSA 10 can be worth 10x a PSA 8',
      'How to read a grading label',
      'Submitting cards for grading after inheritance',
    ],
  },
  {
    id: 'edu-002',
    title: 'How to Avoid Scams',
    targetAudience: 'both',
    duration: '18 min',
    completed: true,
    content: [
      'Common fraud tactics targeting heirs and estates',
      'How to verify buyer identity and escrow services',
      'Red flags in bulk-buy offers',
      'Recommended trusted platforms',
    ],
  },
  {
    id: 'edu-003',
    title: 'Navigating the Liquidation Waterfall',
    targetAudience: 'executor',
    duration: '25 min',
    completed: false,
    content: [
      'Step-by-step walkthrough of your tiered liquidation plan',
      'Timing considerations and market cycles',
      'When to hold vs. sell a grail piece',
      'Tax implications of collection sales',
    ],
  },
  {
    id: 'edu-004',
    title: 'Auction House Basics for Executors',
    targetAudience: 'executor',
    duration: '20 min',
    completed: false,
    content: [
      'Heritage, Goldin, and PWCC — how consignment works',
      'Reserve prices and buyer premiums explained',
      'Timelines from consignment to payment',
      'Which platform is best for which card type',
    ],
  },
  {
    id: 'edu-005',
    title: 'Your Inheritance: What to Expect',
    targetAudience: 'heir',
    duration: '15 min',
    completed: false,
    content: [
      'Overview of the collection value and composition',
      'Your role vs. the executor\'s role',
      'How distributions will be structured',
      'Resources and contacts for questions',
    ],
  },
  {
    id: 'edu-006',
    title: 'Working with the Estate Attorney',
    targetAudience: 'both',
    duration: '10 min',
    completed: true,
    content: [
      'Documents the attorney will need from you',
      'Timeline for probate or trust settlement',
      'How to request a status update',
      'Understanding attorney fees and estate costs',
    ],
  },
];

const attorneyContacts: AttorneyContact[] = [
  {
    name: 'Robert Chen, Esq.',
    firm: 'Chen & Associates Estate Law',
    specialty: 'Collectibles & Tangible Property Estates',
    phone: '(555) 456-7890',
    email: 'rchen@chenlaw.com',
    integrationStatus: 'connected',
  },
  {
    name: 'Patricia Wills, CPA/Esq.',
    firm: 'Wills Tax & Estate Group',
    specialty: 'Collectibles Tax Strategy & Appraisal Review',
    phone: '(555) 567-8901',
    email: 'pwills@willsgroup.com',
    integrationStatus: 'pending',
  },
];

const successionReadiness: SuccessionReadiness = {
  score: 71,
  completedSteps: [
    'Collection inventory digitized and timestamped',
    'Professional appraisal completed (2026)',
    'Primary beneficiary designated (Sarah Mitchell)',
    'Insurance policy up to date',
    'Estate attorney retained and connected',
    'Letter of instruction drafted',
    'Liquidation waterfall configured',
    'Heir orientation guide generated',
  ],
  pendingSteps: [
    'Trust amendment with Schedule A not yet signed',
    'Pour-over will addendum pending attorney review',
    'Secondary beneficiary (James Jr.) has not completed education modules',
    'Grail tier appraisal is outdated — refresh recommended',
    'Second attorney integration pending (Wills Group)',
  ],
  criticalGaps: [
    'Trust language for collectibles not finalized — creates probate risk',
    'Grail appraisal outdated by 18 months — insurance and estate values may be understated',
  ],
  estimatedCollectionValue: 524650,
  designatedBeneficiaries: 3,
};

// ---- Exported Functions ----

export function getBeneficiaries(): Beneficiary[] {
  return beneficiaries;
}

export function getLiquidationWaterfall(): LiquidationWaterfall[] {
  return liquidationWaterfall;
}

export function getSuccessionDocuments(): SuccessionDocument[] {
  return successionDocuments;
}

export function getSuccessionReadiness(): SuccessionReadiness {
  return successionReadiness;
}

export function getEducationModules(): EducationModule[] {
  return educationModules;
}

export function getAttorneyContacts(): AttorneyContact[] {
  return attorneyContacts;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
