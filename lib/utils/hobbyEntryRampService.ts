// Phase 243 — Hobby Entry Ramp Service

export interface RampStep {
  order: number;
  title: string;
  description: string;
  action: string;
  completed: boolean;
}

export interface EntryRamp {
  id: string;
  name: string;
  budgetRange: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: RampStep[];
  estimatedTimeWeeks: number;
  recommendedCards: string[];
}

const entryRamps: EntryRamp[] = [
  {
    id: 'er-001',
    name: 'Budget Starter Pack',
    budgetRange: '$25–$100',
    difficulty: 'beginner',
    steps: [
      {
        order: 1,
        title: 'Learn the Basics',
        description: 'Understand grading scales (PSA, BGS), card types (base, parallel, auto), and terminology.',
        action: 'Complete the Collector 101 tutorial module',
        completed: true,
      },
      {
        order: 2,
        title: 'Buy Your First Pack',
        description: 'Pick up a retail blaster box of Topps Series 1 or Panini Prizm from a local store.',
        action: 'Purchase one retail product under $30',
        completed: true,
      },
      {
        order: 3,
        title: 'Catalog Your Pulls',
        description: 'Scan and log every card you pulled using the app card scanner.',
        action: 'Add at least 20 cards to your digital collection',
        completed: false,
      },
      {
        order: 4,
        title: 'Make Your First Trade',
        description: 'List a duplicate card for trade and complete a swap with another collector.',
        action: 'Complete one peer-to-peer trade',
        completed: false,
      },
    ],
    estimatedTimeWeeks: 2,
    recommendedCards: [
      '2024 Topps Series 1 Base — any rookie',
      '2024 Panini Prizm Base — Victor Wembanyama',
      '2024 Donruss Rated Rookie — any',
    ],
  },
  {
    id: 'er-002',
    name: 'Single-Card Investor',
    budgetRange: '$100–$500',
    difficulty: 'intermediate',
    steps: [
      {
        order: 1,
        title: 'Market Research',
        description: 'Study recent sales data for targeted players on eBay and PWCC.',
        action: 'Analyze 30-day price trends for 5 players',
        completed: true,
      },
      {
        order: 2,
        title: 'Set Price Alerts',
        description: 'Configure alerts for when target cards drop below your buy threshold.',
        action: 'Create 3 price alerts in the app',
        completed: true,
      },
      {
        order: 3,
        title: 'Acquire a Graded Card',
        description: 'Purchase a PSA 9 or 10 rookie card of a top prospect.',
        action: 'Buy one graded card under $300',
        completed: false,
      },
      {
        order: 4,
        title: 'Track Your ROI',
        description: 'Monitor daily value changes and set a target exit price.',
        action: 'Log the purchase in your portfolio tracker',
        completed: false,
      },
      {
        order: 5,
        title: 'Execute First Flip',
        description: 'Sell when your target is reached or after a catalyst event.',
        action: 'Complete a sale with at least 15% profit',
        completed: false,
      },
    ],
    estimatedTimeWeeks: 4,
    recommendedCards: [
      '2023 Prizm Silver — Victor Wembanyama PSA 9',
      '2020 Prizm Base — Anthony Edwards PSA 10',
      '2024 Topps Chrome — Paul Skenes PSA 9',
    ],
  },
  {
    id: 'er-003',
    name: 'Set Builder',
    budgetRange: '$200–$800',
    difficulty: 'intermediate',
    steps: [
      {
        order: 1,
        title: 'Choose Your Set',
        description: 'Select a base set to complete — Topps flagship and Prizm are popular choices.',
        action: 'Pick a target set and generate a checklist',
        completed: true,
      },
      {
        order: 2,
        title: 'Buy in Bulk',
        description: 'Purchase bulk lots of the set on eBay to fill common slots cheaply.',
        action: 'Acquire at least 60% of the set via bulk buys',
        completed: true,
      },
      {
        order: 3,
        title: 'Hunt the Short Prints',
        description: 'Identify and target the short-printed and high-numbered cards remaining.',
        action: 'Create a want list for remaining needs',
        completed: true,
      },
      {
        order: 4,
        title: 'Complete the Set',
        description: 'Trade duplicates and purchase final needs to finish the set.',
        action: 'Reach 100% set completion',
        completed: false,
      },
    ],
    estimatedTimeWeeks: 8,
    recommendedCards: [
      '2024 Topps Series 1 Complete Base Set (1-330)',
      '2024 Panini Prizm NBA Base Set (1-300)',
      '2024 Topps Chrome Base Set (1-200)',
    ],
  },
  {
    id: 'er-004',
    name: 'High-End Collector',
    budgetRange: '$1,000–$5,000+',
    difficulty: 'advanced',
    steps: [
      {
        order: 1,
        title: 'Define Your Niche',
        description: 'Focus on a specific player PC, vintage era, or premium product line.',
        action: 'Create a collecting mission statement and target list',
        completed: true,
      },
      {
        order: 2,
        title: 'Authenticate Everything',
        description: 'Only acquire cards with verified authenticity — use DNA fingerprinting when available.',
        action: 'Register all cards in the authentication vault',
        completed: false,
      },
      {
        order: 3,
        title: 'Build Relationships',
        description: 'Connect with dealers, breakers, and other high-end collectors for off-market deals.',
        action: 'Join 2 collector groups and attend a card show',
        completed: false,
      },
      {
        order: 4,
        title: 'Diversify Holdings',
        description: 'Spread investments across sports, eras, and card types to manage risk.',
        action: 'Ensure no single card exceeds 25% of portfolio value',
        completed: false,
      },
      {
        order: 5,
        title: 'Plan Your Exit Strategy',
        description: 'Set long-term goals: hold periods, target returns, and legacy planning.',
        action: 'Document a 3-year portfolio strategy',
        completed: false,
      },
    ],
    estimatedTimeWeeks: 12,
    recommendedCards: [
      '2023 National Treasures RPA — Victor Wembanyama',
      '2018 Prizm Silver — Luka Dončić PSA 10',
      '2003 Topps Chrome Refractor #111 — LeBron James',
    ],
  },
];

export function getEntryRamps(): EntryRamp[] {
  return entryRamps;
}

export function getRampProgress() {
  return entryRamps.map((ramp) => {
    const completedSteps = ramp.steps.filter((s) => s.completed).length;
    const totalSteps = ramp.steps.length;
    return {
      rampId: ramp.id,
      name: ramp.name,
      completedSteps,
      totalSteps,
      percentComplete: Math.round((completedSteps / totalSteps) * 100),
    };
  });
}

export function getEntryStats() {
  const totalRamps = entryRamps.length;
  const allSteps = entryRamps.flatMap((r) => r.steps);
  const completedSteps = allSteps.filter((s) => s.completed).length;
  const totalSteps = allSteps.length;

  return {
    totalRamps,
    totalSteps,
    completedSteps,
    overallProgress: Math.round((completedSteps / totalSteps) * 100),
    beginnerRamps: entryRamps.filter((r) => r.difficulty === 'beginner').length,
    intermediateRamps: entryRamps.filter((r) => r.difficulty === 'intermediate').length,
    advancedRamps: entryRamps.filter((r) => r.difficulty === 'advanced').length,
  };
}

const hobbyEntryRampService = {
  getEntryRamps,
  getRampProgress,
  getEntryStats,
};

export default hobbyEntryRampService;
