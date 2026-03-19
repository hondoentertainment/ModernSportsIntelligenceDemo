// Phase 103 – Collection Vault Security & Storage Intelligence Service

// ---- Types ----

export interface StorageUnit {
  id: string;
  name: string;
  type: 'home_safe' | 'bank_safe_deposit' | 'third_party_vault' | 'climate_controlled' | 'standard_storage';
  provider?: string;
  location: string;
  capacity: number;
  used: number;
  temperature: { current: number; optimal: number; status: 'optimal' | 'warning' | 'critical' };
  humidity: { current: number; optimal: number; status: 'optimal' | 'warning' | 'critical' };
  securityLevel: 'basic' | 'enhanced' | 'maximum' | 'institutional';
  insuranceCoverage: number;
  monthlyFee: number;
  cards: string[];
}

export interface VaultProvider {
  id: string;
  name: string;
  type: string;
  locations: string[];
  pricing: { monthly: number; annual: number; perCard: number };
  insurance: { included: boolean; maxCoverage: number; additionalRate: number };
  features: string[];
  rating: number;
  securityFeatures: string[];
  climateControlled: boolean;
}

export interface EnvironmentalAlert {
  id: string;
  unit: string;
  type: 'temperature' | 'humidity' | 'uv_exposure' | 'pest' | 'flood_risk' | 'fire_risk';
  severity: 'info' | 'warning' | 'critical';
  current: number;
  optimal: number;
  recommendation: string;
  timestamp: string;
}

export interface DisasterPlan {
  id: string;
  type: 'fire' | 'flood' | 'theft' | 'earthquake' | 'power_outage';
  preparations: string[];
  insuranceCoverage: number;
  recoverySteps: string[];
  estimatedRecoveryTime: string;
  lastReviewed: string;
}

export interface VaultStats {
  totalUnits: number;
  totalCapacity: number;
  totalUsed: number;
  avgTemperature: number;
  avgHumidity: number;
  alertCount: number;
  totalInsured: number;
  insuranceGaps: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_vault_security';

// ---- Seed helpers ----

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ---- Simulated data generators ----

const CARD_NAMES = [
  '2023 Topps Chrome Wander Franco RC Auto /25',
  '2022 Bowman Chrome Julio Rodriguez 1st Auto',
  '2020 Prizm Silver Luka Doncic #75',
  '2023 National Treasures Victor Wembanyama RPA /49',
  '2021 Topps Chrome Mike Trout Refractor',
  '2022 Panini One Patrick Mahomes Patch Auto /10',
  '2023 Select Concourse Shohei Ohtani',
  '2021 Bowman 1st Jasson Dominguez Auto',
  '2023 Immaculate Gunnar Henderson RPA /25',
  '2022 Flawless Connor McDavid Patch Auto /15',
  '2023 Topps Heritage Ronald Acuna Jr SP',
  '2022 Donruss Optic Bryce Harper',
  '2023 Prizm Silver Elly De La Cruz RC',
  '2021 National Treasures Juan Soto Patch /49',
  '2022 Topps Chrome Mookie Betts Gold Refractor /50',
  '2023 Bowman Chrome Trevor Lawrence Auto',
];

function generateStorageUnits(): StorageUnit[] {
  return [
    {
      id: 'su-1',
      name: 'Primary Vault — PWCC',
      type: 'third_party_vault',
      provider: 'PWCC Vault',
      location: 'Portland, OR',
      capacity: 200,
      used: 143,
      temperature: { current: 68, optimal: 68, status: 'optimal' },
      humidity: { current: 45, optimal: 45, status: 'optimal' },
      securityLevel: 'institutional',
      insuranceCoverage: 250000,
      monthlyFee: 89,
      cards: CARD_NAMES.slice(0, 8),
    },
    {
      id: 'su-2',
      name: 'Home Office Safe',
      type: 'home_safe',
      location: 'Home — Austin, TX',
      capacity: 50,
      used: 34,
      temperature: { current: 74, optimal: 68, status: 'warning' },
      humidity: { current: 62, optimal: 45, status: 'warning' },
      securityLevel: 'enhanced',
      insuranceCoverage: 15000,
      monthlyFee: 0,
      cards: CARD_NAMES.slice(8, 13),
    },
    {
      id: 'su-3',
      name: 'Bank Safe Deposit — Chase',
      type: 'bank_safe_deposit',
      provider: 'Chase Bank',
      location: 'Austin, TX',
      capacity: 30,
      used: 18,
      temperature: { current: 70, optimal: 68, status: 'optimal' },
      humidity: { current: 48, optimal: 45, status: 'optimal' },
      securityLevel: 'maximum',
      insuranceCoverage: 25000,
      monthlyFee: 25,
      cards: CARD_NAMES.slice(13, 16),
    },
  ];
}

function generateVaultProviders(): VaultProvider[] {
  return [
    {
      id: 'vp-1',
      name: 'PWCC Vault',
      type: 'Premium Third-Party Vault',
      locations: ['Portland, OR', 'Dallas, TX'],
      pricing: { monthly: 89, annual: 960, perCard: 0.50 },
      insurance: { included: true, maxCoverage: 250000, additionalRate: 0.004 },
      features: ['High-res imaging', 'Instant liquidity', 'Market analytics', 'Auction integration', 'White-glove shipping'],
      rating: 4.8,
      securityFeatures: ['24/7 armed security', 'Biometric access', 'Seismic-rated vault', 'Fire suppression', 'Redundant power'],
      climateControlled: true,
    },
    {
      id: 'vp-2',
      name: 'Collectors Vault',
      type: 'Third-Party Vault',
      locations: ['Chicago, IL', 'Los Angeles, CA', 'New York, NY'],
      pricing: { monthly: 49, annual: 530, perCard: 0.35 },
      insurance: { included: true, maxCoverage: 100000, additionalRate: 0.006 },
      features: ['Online inventory management', 'Scheduled viewings', 'Shipping coordination', 'Collection reports'],
      rating: 4.5,
      securityFeatures: ['24/7 security monitoring', 'Access logging', 'Fire suppression', 'Climate monitoring'],
      climateControlled: true,
    },
    {
      id: 'vp-3',
      name: 'SGC Vault',
      type: 'Grading Company Vault',
      locations: ['Orlando, FL'],
      pricing: { monthly: 39, annual: 420, perCard: 0.25 },
      insurance: { included: true, maxCoverage: 50000, additionalRate: 0.008 },
      features: ['Grading integration', 'Population reports', 'Registry sets', 'Direct submission'],
      rating: 4.3,
      securityFeatures: ['Secure facility', 'Access control', 'Fire suppression', 'Video surveillance'],
      climateControlled: true,
    },
    {
      id: 'vp-4',
      name: 'CGC Safe Storage',
      type: 'Grading Company Vault',
      locations: ['Sarasota, FL'],
      pricing: { monthly: 45, annual: 480, perCard: 0.30 },
      insurance: { included: true, maxCoverage: 75000, additionalRate: 0.005 },
      features: ['CGC grading integration', 'Registry support', 'Online portfolio', 'Authentication services'],
      rating: 4.4,
      securityFeatures: ['Climate-controlled facility', 'Armed security', 'Biometric locks', 'Insurance included'],
      climateControlled: true,
    },
    {
      id: 'vp-5',
      name: 'Local Bank Safe Deposit',
      type: 'Bank Safe Deposit',
      locations: ['Any major bank branch'],
      pricing: { monthly: 25, annual: 275, perCard: 0 },
      insurance: { included: false, maxCoverage: 0, additionalRate: 0 },
      features: ['Branch access during hours', 'Physical key + ID access', 'No online inventory'],
      rating: 3.2,
      securityFeatures: ['Bank vault security', 'Time-lock vault door', 'Security cameras', 'Armed guards during hours'],
      climateControlled: false,
    },
    {
      id: 'vp-6',
      name: 'Home Safe (Liberty)',
      type: 'Home Storage',
      locations: ['Your home'],
      pricing: { monthly: 0, annual: 0, perCard: 0 },
      insurance: { included: false, maxCoverage: 0, additionalRate: 0 },
      features: ['24/7 personal access', 'No recurring fees', 'Full control', 'No shipping required'],
      rating: 2.5,
      securityFeatures: ['Fire-rated safe', 'Combination lock', 'Bolt-down mounting'],
      climateControlled: false,
    },
  ];
}

function generateEnvironmentalAlerts(): EnvironmentalAlert[] {
  return [
    {
      id: 'ea-1',
      unit: 'su-2',
      type: 'humidity',
      severity: 'warning',
      current: 62,
      optimal: 45,
      recommendation: 'Humidity 37% above optimal. Add a dehumidifier to your home office or move high-value cards to climate-controlled vault. Prolonged exposure above 55% RH risks moisture damage, warping, and mold growth.',
      timestamp: '2026-03-12T08:30:00Z',
    },
    {
      id: 'ea-2',
      unit: 'su-2',
      type: 'temperature',
      severity: 'warning',
      current: 74,
      optimal: 68,
      recommendation: 'Temperature 6°F above optimal range. Sustained temperatures above 72°F accelerate card yellowing and can soften adhesives on vintage cards. Consider relocating to a climate-controlled space.',
      timestamp: '2026-03-12T08:30:00Z',
    },
    {
      id: 'ea-3',
      unit: 'su-2',
      type: 'uv_exposure',
      severity: 'info',
      current: 3,
      optimal: 0,
      recommendation: 'Low UV exposure detected near storage area. Ensure cards are stored in opaque containers or UV-filtering sleeves. Even indirect sunlight causes fading over time.',
      timestamp: '2026-03-11T14:00:00Z',
    },
    {
      id: 'ea-4',
      unit: 'su-3',
      type: 'flood_risk',
      severity: 'info',
      current: 15,
      optimal: 0,
      recommendation: 'Bank branch is in a moderate flood zone (Zone B). Verify flood insurance coverage and consider waterproof containers for bottom-shelf storage.',
      timestamp: '2026-03-10T10:00:00Z',
    },
  ];
}

function generateDisasterPlans(): DisasterPlan[] {
  return [
    {
      id: 'dp-1',
      type: 'fire',
      preparations: [
        'Store high-value cards in fire-rated safe (minimum UL 350 1-hour)',
        'Keep digital inventory with photos off-site or in cloud',
        'Install smoke detectors within 10 feet of storage',
        'Maintain fire extinguisher near collection area',
        'Review fire insurance rider annually',
      ],
      insuranceCoverage: 250000,
      recoverySteps: [
        'Document all damage with photos before cleanup',
        'Contact insurance adjuster within 24 hours',
        'Provide digital inventory and purchase receipts',
        'Submit professional appraisal for damaged items',
        'Track all replacement costs for tax deduction',
      ],
      estimatedRecoveryTime: '3-6 months',
      lastReviewed: '2026-02-15',
    },
    {
      id: 'dp-2',
      type: 'flood',
      preparations: [
        'Store cards above ground level (minimum 4 feet)',
        'Use waterproof containers and silica gel packets',
        'Check FEMA flood zone maps for storage locations',
        'Add flood rider to homeowners insurance',
        'Install water sensors near collection storage',
      ],
      insuranceCoverage: 100000,
      recoverySteps: [
        'Remove cards from water-damaged area immediately',
        'Do NOT attempt to separate wet cards — let air dry',
        'Photograph all damage for insurance claim',
        'Contact professional conservator for high-value items',
        'File flood insurance claim within 60 days',
      ],
      estimatedRecoveryTime: '2-4 months',
      lastReviewed: '2026-01-20',
    },
    {
      id: 'dp-3',
      type: 'theft',
      preparations: [
        'Install security camera system covering storage area',
        'Use a safe with UL TL-15 or higher burglary rating',
        'Maintain detailed inventory with serial numbers and cert IDs',
        'Register high-value cards with grading company registries',
        'Do not publicly share storage location or collection details',
      ],
      insuranceCoverage: 200000,
      recoverySteps: [
        'File police report immediately',
        'Contact insurance company within 24 hours',
        'Alert grading companies (PSA, BGS, SGC) to flag stolen cards',
        'Post alerts on collector forums and stolen card databases',
        'Provide serial numbers and cert IDs to law enforcement',
      ],
      estimatedRecoveryTime: '1-12 months',
      lastReviewed: '2026-03-01',
    },
    {
      id: 'dp-4',
      type: 'earthquake',
      preparations: [
        'Bolt safes to structural walls or floor',
        'Use padded dividers to prevent card-to-card contact',
        'Store cards away from shelves with heavy objects above',
        'Add earthquake coverage to insurance policy',
        'Keep grab-and-go bag with top 10 highest-value cards accessible',
      ],
      insuranceCoverage: 50000,
      recoverySteps: [
        'Assess structural damage before re-entering storage area',
        'Document all physical damage to cards and storage equipment',
        'Contact earthquake insurance provider (separate from homeowners)',
        'Have damaged slabs re-evaluated by grading company',
        'Consider temporary relocation to professional vault',
      ],
      estimatedRecoveryTime: '2-8 months',
      lastReviewed: '2025-11-10',
    },
    {
      id: 'dp-5',
      type: 'power_outage',
      preparations: [
        'Ensure climate-controlled units have backup power',
        'Install battery-powered temperature/humidity monitors',
        'Set up mobile alerts for environmental threshold breaches',
        'Identify backup storage with independent power grid',
        'Keep portable dehumidifier with battery backup',
      ],
      insuranceCoverage: 0,
      recoverySteps: [
        'Check temperature and humidity immediately upon discovering outage',
        'If outage exceeds 24 hours, relocate sensitive items',
        'Monitor for condensation on card surfaces after power restore',
        'Run dehumidifier for 48 hours after climate system restarts',
        'Document any damage from environmental exposure',
      ],
      estimatedRecoveryTime: '1-7 days',
      lastReviewed: '2026-02-28',
    },
  ];
}

function generateEnvironmentalHistory(): { day: string; temp1: number; hum1: number; temp2: number; hum2: number; temp3: number; hum3: number }[] {
  const data: { day: string; temp1: number; hum1: number; temp2: number; hum2: number; temp3: number; hum3: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const seed = 103000 + i;
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 100);
    const r3 = seededRandom(seed + 200);
    const r4 = seededRandom(seed + 300);
    const r5 = seededRandom(seed + 400);
    const r6 = seededRandom(seed + 500);

    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;

    data.push({
      day: dayLabel,
      temp1: Math.round((67 + r1 * 3) * 10) / 10,   // PWCC vault — tight control
      hum1: Math.round((44 + r2 * 3) * 10) / 10,
      temp2: Math.round((70 + r3 * 8) * 10) / 10,   // Home safe — wider variance
      hum2: Math.round((48 + r4 * 18) * 10) / 10,   // Humidity spikes
      temp3: Math.round((69 + r5 * 3) * 10) / 10,   // Bank — moderate control
      hum3: Math.round((44 + r6 * 6) * 10) / 10,
    });
  }
  return data;
}

// ---- Persistence ----

interface StoredData {
  units: StorageUnit[];
  alerts: EnvironmentalAlert[];
  plans: DisasterPlan[];
  generatedAt: string;
}

function loadOrGenerate(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredData = JSON.parse(raw);
      // Refresh daily
      const generatedDate = parsed.generatedAt?.substring(0, 10);
      const today = new Date().toISOString().substring(0, 10);
      if (generatedDate === today) return parsed;
    }
  } catch { /* regenerate */ }

  const data: StoredData = {
    units: generateStorageUnits(),
    alerts: generateEnvironmentalAlerts(),
    plans: generateDisasterPlans(),
    generatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// ---- Public API ----

export function getStorageUnits(): StorageUnit[] {
  return loadOrGenerate().units;
}

export function getVaultProviders(): VaultProvider[] {
  return generateVaultProviders();
}

export function getEnvironmentalAlerts(): EnvironmentalAlert[] {
  const data = loadOrGenerate();
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  return [...data.alerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function getDisasterPlans(): DisasterPlan[] {
  return loadOrGenerate().plans;
}

export function getEnvironmentalHistory(): { day: string; temp1: number; hum1: number; temp2: number; hum2: number; temp3: number; hum3: number }[] {
  return generateEnvironmentalHistory();
}

export function getVaultStats(): VaultStats {
  const units = getStorageUnits();
  const alerts = getEnvironmentalAlerts();

  const totalCapacity = units.reduce((s, u) => s + u.capacity, 0);
  const totalUsed = units.reduce((s, u) => s + u.used, 0);
  const avgTemperature = Math.round((units.reduce((s, u) => s + u.temperature.current, 0) / units.length) * 10) / 10;
  const avgHumidity = Math.round((units.reduce((s, u) => s + u.humidity.current, 0) / units.length) * 10) / 10;
  const totalInsured = units.reduce((s, u) => s + u.insuranceCoverage, 0);

  // Estimate collection value and find gap
  const estimatedValue = 350000; // simulated total collection value
  const insuranceGaps = Math.max(0, estimatedValue - totalInsured);

  return {
    totalUnits: units.length,
    totalCapacity,
    totalUsed,
    avgTemperature,
    avgHumidity,
    alertCount: alerts.length,
    totalInsured,
    insuranceGaps,
  };
}

export function getStorageRecommendation(collectionValue: number): { tier: string; recommendation: string; provider: string; monthlyBudget: string; features: string[] } {
  if (collectionValue >= 100000) {
    return {
      tier: 'Institutional',
      recommendation: 'Use a premium third-party vault with full insurance, climate control, and 24/7 security. Your collection value warrants institutional-grade protection.',
      provider: 'PWCC Vault',
      monthlyBudget: '$89-150/mo',
      features: ['Full insurance coverage', 'Climate-controlled 68°F / 45% RH', 'Biometric access', 'Instant liquidity options', 'Professional imaging'],
    };
  }
  if (collectionValue >= 25000) {
    return {
      tier: 'Enhanced',
      recommendation: 'Split between a professional vault for high-value cards and a quality home safe for frequently accessed items. Ensure adequate insurance riders.',
      provider: 'Collectors Vault or SGC Vault',
      monthlyBudget: '$39-89/mo',
      features: ['Professional vault for top cards', 'Home safe for daily access', 'Insurance rider required', 'Climate monitoring recommended'],
    };
  }
  if (collectionValue >= 5000) {
    return {
      tier: 'Standard',
      recommendation: 'A quality fire-rated home safe with a dehumidifier is sufficient. Consider a bank safe deposit box for your top 10-20 cards.',
      provider: 'Home Safe + Bank Safe Deposit',
      monthlyBudget: '$0-25/mo',
      features: ['UL-rated fire safe', 'Bank box for highest value', 'Homeowners insurance rider', 'Silica gel packets'],
    };
  }
  return {
    tier: 'Basic',
    recommendation: 'Store in penny sleeves and top-loaders inside a cool, dry closet. A small safe is a good investment as your collection grows.',
    provider: 'Home Storage',
    monthlyBudget: '$0/mo',
    features: ['Penny sleeves + top-loaders', 'Cool, dry location', 'Avoid direct sunlight', 'Consider grading for protection'],
  };
}
