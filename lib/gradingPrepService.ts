// Card Grading Prep Guide Service

import { store } from './dal/syncStore';

// ---- Types ----

export type PrepCategory = 'cleaning' | 'holders' | 'submission' | 'inspection' | 'shipping';
export type PrepDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MistakeSeverity = 'minor' | 'major' | 'critical';
export type MistakeFrequency = 'common' | 'occasional' | 'rare';
export type CardSize = 'standard' | 'thick' | 'booklet' | 'oversized';

export interface PrepStep {
  stepNumber: number;
  title: string;
  description: string;
  tip?: string;
  warning?: string;
}

export interface PrepGuide {
  id: string;
  title: string;
  category: PrepCategory;
  difficulty: PrepDifficulty;
  steps: PrepStep[];
  tools: string[];
  estimatedTime: string;
  imageUrl?: string;
}

export interface SubmissionChecklist {
  id: string;
  cardName: string;
  player: string;
  items: { task: string; completed: boolean; category: string }[];
  completionPercent: number;
  notes: string;
  createdAt: string;
}

export interface CommonMistake {
  id: string;
  title: string;
  description: string;
  severity: MistakeSeverity;
  frequency: MistakeFrequency;
  prevention: string;
  imageUrl?: string;
}

export interface HolderRecommendation {
  cardSize: CardSize;
  holderType: string;
  brand: string;
  cost: number;
  fits: string;
  recommended: boolean;
}

export interface PrepStats {
  totalGuidesRead: number;
  checklistsCompleted: number;
  avgCompletionRate: number;
  topCategory: string;
  mistakesAvoided: number;
}

// ---- Storage Keys ----
const GUIDES_KEY = 'msi_grading_prep_guides';
const CHECKLISTS_KEY = 'msi_grading_prep_checklists';
const MISTAKES_KEY = 'msi_grading_prep_mistakes';

// ---- Mock Data ----

const MOCK_GUIDES: PrepGuide[] = [
  {
    id: 'guide-1',
    title: 'Basic Card Surface Cleaning',
    category: 'cleaning',
    difficulty: 'beginner',
    steps: [
      { stepNumber: 1, title: 'Gather Supplies', description: 'Get a microfiber cloth and compressed air canister.', tip: 'Use lint-free cloths only.' },
      { stepNumber: 2, title: 'Blow Off Debris', description: 'Use compressed air to remove loose dust and particles from the card surface.', warning: 'Hold can upright to avoid liquid spray.' },
      { stepNumber: 3, title: 'Wipe Gently', description: 'Lightly wipe the surface with the microfiber cloth in one direction.', tip: 'Never use circular motions.' },
    ],
    tools: ['Microfiber cloth', 'Compressed air'],
    estimatedTime: '5 mins',
  },
  {
    id: 'guide-2',
    title: 'Penny Sleeve & Top Loader Insertion',
    category: 'holders',
    difficulty: 'beginner',
    steps: [
      { stepNumber: 1, title: 'Select Correct Sleeve', description: 'Choose a standard penny sleeve for regular thickness cards.' },
      { stepNumber: 2, title: 'Insert Card', description: 'Slide card into penny sleeve top-first.', tip: 'Hold card by edges only.' },
      { stepNumber: 3, title: 'Place in Top Loader', description: 'Slide the sleeved card into a top loader.', warning: 'Do not force thick cards into standard top loaders.' },
    ],
    tools: ['Penny sleeves', 'Top loaders'],
    estimatedTime: '2 mins',
  },
  {
    id: 'guide-3',
    title: 'PSA Submission Form Preparation',
    category: 'submission',
    difficulty: 'intermediate',
    steps: [
      { stepNumber: 1, title: 'Create PSA Account', description: 'Register at psacard.com and verify your email.' },
      { stepNumber: 2, title: 'Fill Out Submission Form', description: 'Enter card details including year, brand, player, and card number.', tip: 'Double-check card number against a checklist database.' },
      { stepNumber: 3, title: 'Select Service Level', description: 'Choose the turnaround tier that fits your budget and timeline.', warning: 'Express tiers have higher per-card costs.' },
      { stepNumber: 4, title: 'Print and Include', description: 'Print the completed form and include it in your shipping package.' },
    ],
    tools: ['Computer', 'Printer', 'PSA account'],
    estimatedTime: '20 mins',
  },
  {
    id: 'guide-4',
    title: 'Surface Defect Inspection',
    category: 'inspection',
    difficulty: 'intermediate',
    steps: [
      { stepNumber: 1, title: 'Set Up Lighting', description: 'Use a bright LED light at multiple angles to reveal surface imperfections.' },
      { stepNumber: 2, title: 'Check Front Surface', description: 'Look for scratches, print lines, and surface dimples.', tip: 'Tilt the card slowly under light.' },
      { stepNumber: 3, title: 'Check Back Surface', description: 'Inspect the back for staining, whitening, and wax residue.' },
      { stepNumber: 4, title: 'Document Findings', description: 'Note all defects found for grading prediction.', warning: 'Even minor scratches can drop a grade.' },
    ],
    tools: ['LED lamp', 'Magnifying glass', 'Dark background mat'],
    estimatedTime: '10 mins',
  },
  {
    id: 'guide-5',
    title: 'Secure Shipping for Grading',
    category: 'shipping',
    difficulty: 'beginner',
    steps: [
      { stepNumber: 1, title: 'Prepare Cards', description: 'Ensure all cards are in penny sleeves and top loaders.' },
      { stepNumber: 2, title: 'Bundle Cards', description: 'Tape top loaders together in groups of 5 with painters tape.', warning: 'Never use rubber bands directly on top loaders.' },
      { stepNumber: 3, title: 'Box Preparation', description: 'Place bundled cards in a small box with bubble wrap padding.' },
      { stepNumber: 4, title: 'Seal and Label', description: 'Seal the box securely and attach the shipping label.', tip: 'Add fragile stickers for extra care.' },
    ],
    tools: ['Bubble wrap', 'Small shipping box', 'Painters tape', 'Shipping label'],
    estimatedTime: '15 mins',
  },
  {
    id: 'guide-6',
    title: 'Advanced Edge Inspection Technique',
    category: 'inspection',
    difficulty: 'advanced',
    steps: [
      { stepNumber: 1, title: 'Use 10x Loupe', description: 'Examine each edge at 10x magnification under bright light.' },
      { stepNumber: 2, title: 'Check for Chipping', description: 'Look for tiny white spots along cut edges that indicate chipping.', tip: 'Focus on corners first as they chip most easily.' },
      { stepNumber: 3, title: 'Assess Edge Straightness', description: 'Compare edges against a straight reference line.' },
    ],
    tools: ['10x jewelers loupe', 'LED lamp', 'Straight edge ruler'],
    estimatedTime: '8 mins',
  },
  {
    id: 'guide-7',
    title: 'Removing Cards from Screw-Down Holders',
    category: 'cleaning',
    difficulty: 'advanced',
    steps: [
      { stepNumber: 1, title: 'Unscrew Carefully', description: 'Remove all screws from the holder evenly.', warning: 'Do not pry the holder open.' },
      { stepNumber: 2, title: 'Separate Halves', description: 'Gently lift the top half straight up.' },
      { stepNumber: 3, title: 'Release Card', description: 'If stuck, breathe warm air to loosen adhesion.', tip: 'Never use water or solvents.' },
    ],
    tools: ['Small screwdriver', 'Clean gloves'],
    estimatedTime: '10 mins',
  },
  {
    id: 'guide-8',
    title: 'BGS Submission Walkthrough',
    category: 'submission',
    difficulty: 'intermediate',
    steps: [
      { stepNumber: 1, title: 'Create Beckett Account', description: 'Register at beckett.com/grading.' },
      { stepNumber: 2, title: 'Add Cards to Order', description: 'Enter each card with accurate descriptions and declared values.', tip: 'Use Beckett pricing for declared values.' },
      { stepNumber: 3, title: 'Select Subgrades Option', description: 'Choose whether to display subgrades on the label.', tip: 'Subgrades add value transparency for buyers.' },
      { stepNumber: 4, title: 'Submit and Ship', description: 'Complete payment and ship cards per Beckett instructions.' },
    ],
    tools: ['Computer', 'Printer', 'Beckett account'],
    estimatedTime: '25 mins',
  },
  {
    id: 'guide-9',
    title: 'Magnetic Holder Selection',
    category: 'holders',
    difficulty: 'beginner',
    steps: [
      { stepNumber: 1, title: 'Measure Card Thickness', description: 'Use a caliper or thickness guide to determine card point thickness.' },
      { stepNumber: 2, title: 'Select Matching Holder', description: 'Choose a One-Touch or magnetic holder that matches the card thickness.', warning: 'Using wrong thickness can damage card edges.' },
      { stepNumber: 3, title: 'Insert Card', description: 'Place sleeved card in the holder and snap shut.' },
    ],
    tools: ['Card thickness gauge', 'Magnetic holder'],
    estimatedTime: '3 mins',
  },
  {
    id: 'guide-10',
    title: 'International Shipping for Grading',
    category: 'shipping',
    difficulty: 'advanced',
    steps: [
      { stepNumber: 1, title: 'Customs Declaration', description: 'Fill out customs forms with accurate declared values.', warning: 'Underdeclaring can void insurance.' },
      { stepNumber: 2, title: 'Double Box Method', description: 'Place the inner box inside a larger outer box with padding.' },
      { stepNumber: 3, title: 'Insurance', description: 'Purchase shipping insurance for the full declared value.', tip: 'Take photos of packing process for claims.' },
    ],
    tools: ['Two shipping boxes', 'Customs forms', 'Packing peanuts', 'Insurance receipt'],
    estimatedTime: '30 mins',
  },
  {
    id: 'guide-11',
    title: 'Centering Measurement Guide',
    category: 'inspection',
    difficulty: 'intermediate',
    steps: [
      { stepNumber: 1, title: 'Get a Centering Tool', description: 'Use a centering tool or ruler to measure borders.' },
      { stepNumber: 2, title: 'Measure Top/Bottom', description: 'Compare top and bottom border widths.', tip: '60/40 or better is typically needed for a 9+.' },
      { stepNumber: 3, title: 'Measure Left/Right', description: 'Compare left and right border widths.' },
      { stepNumber: 4, title: 'Calculate Ratio', description: 'Express centering as a ratio like 50/50 or 55/45.' },
    ],
    tools: ['Centering tool', 'Ruler', 'Calculator'],
    estimatedTime: '5 mins',
  },
  {
    id: 'guide-12',
    title: 'Semi-Rigid Holder Preparation for Submission',
    category: 'holders',
    difficulty: 'intermediate',
    steps: [
      { stepNumber: 1, title: 'Insert Sleeved Card', description: 'Place the penny-sleeved card into a semi-rigid card saver.', tip: 'Card Saver 1 is the PSA-preferred holder.' },
      { stepNumber: 2, title: 'Fold Top Flap', description: 'Fold the flap over without creasing it against the card.', warning: 'Do not tape the flap shut—grading companies need to open it.' },
      { stepNumber: 3, title: 'Label with Order Number', description: 'Write or attach a small label with the submission line number.' },
    ],
    tools: ['Semi-rigid card savers', 'Penny sleeves', 'Fine-tip marker'],
    estimatedTime: '3 mins',
  },
];

const MOCK_MISTAKES: CommonMistake[] = [
  {
    id: 'mistake-1',
    title: 'Touching Card Surface with Bare Fingers',
    description: 'Oils from fingerprints can cause permanent marks that reduce grades.',
    severity: 'major',
    frequency: 'common',
    prevention: 'Always wear clean cotton or nitrile gloves when handling raw cards.',
  },
  {
    id: 'mistake-2',
    title: 'Using Wrong Size Top Loader',
    description: 'Forcing a thick card into a standard top loader can cause edge damage.',
    severity: 'critical',
    frequency: 'occasional',
    prevention: 'Measure card thickness and use appropriately sized top loaders.',
  },
  {
    id: 'mistake-3',
    title: 'Insufficient Shipping Padding',
    description: 'Cards can shift and get damaged during transit without proper padding.',
    severity: 'critical',
    frequency: 'common',
    prevention: 'Use bubble wrap and fill all empty space in the shipping box.',
  },
  {
    id: 'mistake-4',
    title: 'Cleaning with Household Products',
    description: 'Using Windex, alcohol, or other household cleaners can strip coating and damage the card.',
    severity: 'critical',
    frequency: 'occasional',
    prevention: 'Only use compressed air and microfiber cloths for cleaning.',
  },
  {
    id: 'mistake-5',
    title: 'Submitting Off-Center Cards at Premium Tiers',
    description: 'Paying for express grading on cards with obvious centering issues wastes money.',
    severity: 'minor',
    frequency: 'common',
    prevention: 'Pre-screen centering with a centering tool before selecting a premium service tier.',
  },
  {
    id: 'mistake-6',
    title: 'Rubber Bands on Top Loaders',
    description: 'Rubber bands can leave residue and warp top loaders, potentially damaging cards.',
    severity: 'major',
    frequency: 'occasional',
    prevention: 'Use painters tape or team bags to bundle top loaders.',
  },
  {
    id: 'mistake-7',
    title: 'Incorrect Declared Value',
    description: 'Under-declaring card value on submission forms can void insurance.',
    severity: 'major',
    frequency: 'rare',
    prevention: 'Research current market value and declare accurately on all forms.',
  },
  {
    id: 'mistake-8',
    title: 'Skipping Pre-Inspection',
    description: 'Submitting cards without inspecting them first leads to disappointing grades.',
    severity: 'minor',
    frequency: 'common',
    prevention: 'Always inspect cards under magnification and bright light before submitting.',
  },
  {
    id: 'mistake-9',
    title: 'Taping Card Saver Flaps Shut',
    description: 'Grading companies need to open holders; tape can slow processing or damage cards.',
    severity: 'minor',
    frequency: 'occasional',
    prevention: 'Simply fold the flap over without any tape or adhesive.',
  },
  {
    id: 'mistake-10',
    title: 'Storing Cards Near Windows',
    description: 'UV exposure from sunlight causes fading and yellowing over time.',
    severity: 'major',
    frequency: 'rare',
    prevention: 'Store cards in UV-protected holders away from direct sunlight.',
  },
  {
    id: 'mistake-11',
    title: 'Not Photographing Before Submission',
    description: 'Without pre-submission photos, you cannot dispute damage claims during transit.',
    severity: 'minor',
    frequency: 'common',
    prevention: 'Take detailed photos of each card front and back before shipping.',
  },
  {
    id: 'mistake-12',
    title: 'Mixing Service Tiers in One Submission',
    description: 'Some grading companies charge extra or reject mixed-tier submissions.',
    severity: 'minor',
    frequency: 'rare',
    prevention: 'Group cards by desired service tier into separate submissions.',
  },
];

const MOCK_HOLDER_RECOMMENDATIONS: HolderRecommendation[] = [
  { cardSize: 'standard', holderType: 'Penny Sleeve + Top Loader', brand: 'Ultra Pro', cost: 0.15, fits: 'Up to 20pt cards', recommended: true },
  { cardSize: 'standard', holderType: 'Card Saver 1', brand: 'Cardboard Gold', cost: 0.25, fits: 'Standard cards for PSA submission', recommended: true },
  { cardSize: 'standard', holderType: 'One-Touch 35pt', brand: 'Ultra Pro', cost: 3.50, fits: 'Standard cards up to 35pt', recommended: false },
  { cardSize: 'thick', holderType: 'One-Touch 75pt', brand: 'Ultra Pro', cost: 4.00, fits: 'Jersey/relic cards 55-75pt', recommended: true },
  { cardSize: 'thick', holderType: 'Thick Top Loader 75pt', brand: 'BCW', cost: 0.30, fits: 'Thick cards up to 75pt', recommended: true },
  { cardSize: 'thick', holderType: 'One-Touch 130pt', brand: 'Ultra Pro', cost: 5.00, fits: 'Patch cards 100-130pt', recommended: false },
  { cardSize: 'booklet', holderType: 'Booklet Card Holder', brand: 'Ultra Pro', cost: 6.50, fits: 'Booklet and foldout cards', recommended: true },
  { cardSize: 'booklet', holderType: 'Magnetic Booklet Case', brand: 'BCW', cost: 5.00, fits: 'Standard booklet cards', recommended: false },
  { cardSize: 'oversized', holderType: 'Mini Snap', brand: 'Ultra Pro', cost: 1.50, fits: 'Tobacco and mini cards', recommended: false },
  { cardSize: 'oversized', holderType: 'Large Top Loader', brand: 'BCW', cost: 0.75, fits: 'Oversized inserts and box toppers', recommended: true },
  { cardSize: 'oversized', holderType: 'Team Bag + Board', brand: 'Ultra Pro', cost: 0.50, fits: 'Posters and oversize promo cards', recommended: false },
  { cardSize: 'standard', holderType: 'Magnetic One-Touch 55pt', brand: 'Ultra Pro', cost: 4.00, fits: 'Slightly thick standard cards', recommended: false },
];

const SUBMISSION_TIPS: string[] = [
  'Always use Card Saver 1 holders for PSA submissions.',
  'Declare accurate values to maintain insurance coverage.',
  'Group cards by service tier to avoid processing delays.',
  'Include a printed packing slip with every submission.',
  'Write your order number on the outside of the shipping box.',
  'Take photos of every card before packaging for your records.',
  'Use USPS Priority Mail or UPS for domestic submissions.',
  'Consider bulk submission discounts for 20+ card orders.',
  'Check the grading company website for current turnaround estimates before choosing a tier.',
  'Remove cards from screw-down holders before submitting—grading companies may charge extra.',
];

// ---- Helper Functions ----

function loadFromStorage<T>(key: string, fallback: T): T {
  if (store.has(key)) {
    return store.get<T>(key, fallback);
  }
  store.set(key, fallback);
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(key, data);
}

// ---- Exported Functions ----

export function getGuides(): PrepGuide[] {
  return loadFromStorage<PrepGuide[]>(GUIDES_KEY, MOCK_GUIDES);
}

export function getGuideById(id: string): PrepGuide | undefined {
  const guides = getGuides();
  return guides.find((g) => g.id === id);
}

export function getGuidesByCategory(category: PrepCategory): PrepGuide[] {
  const guides = getGuides();
  return guides.filter((g) => g.category === category);
}

export function getChecklists(): SubmissionChecklist[] {
  return loadFromStorage<SubmissionChecklist[]>(CHECKLISTS_KEY, []);
}

export function createChecklist(checklist: Omit<SubmissionChecklist, 'id' | 'completionPercent' | 'createdAt'>): SubmissionChecklist {
  const checklists = getChecklists();
  const completedCount = checklist.items.filter((i) => i.completed).length;
  const completionPercent = checklist.items.length > 0 ? Math.round((completedCount / checklist.items.length) * 100) : 0;
  const newChecklist: SubmissionChecklist = {
    ...checklist,
    id: `checklist-${Date.now()}`,
    completionPercent,
    createdAt: new Date().toISOString(),
  };
  checklists.push(newChecklist);
  saveToStorage(CHECKLISTS_KEY, checklists);
  return newChecklist;
}

export function updateChecklistItem(id: string, taskIndex: number, completed: boolean): SubmissionChecklist | undefined {
  const checklists = getChecklists();
  const checklist = checklists.find((c) => c.id === id);
  if (!checklist || taskIndex < 0 || taskIndex >= checklist.items.length) return undefined;
  checklist.items[taskIndex].completed = completed;
  const completedCount = checklist.items.filter((i) => i.completed).length;
  checklist.completionPercent = checklist.items.length > 0 ? Math.round((completedCount / checklist.items.length) * 100) : 0;
  saveToStorage(CHECKLISTS_KEY, checklists);
  return checklist;
}

export function getCommonMistakes(): CommonMistake[] {
  return loadFromStorage<CommonMistake[]>(MISTAKES_KEY, MOCK_MISTAKES);
}

export function getMistakesBySeverity(severity: MistakeSeverity): CommonMistake[] {
  const mistakes = getCommonMistakes();
  return mistakes.filter((m) => m.severity === severity);
}

export function getHolderRecommendations(cardSize: CardSize): HolderRecommendation[] {
  return MOCK_HOLDER_RECOMMENDATIONS.filter((h) => h.cardSize === cardSize);
}

export function getSubmissionTips(): string[] {
  return [...SUBMISSION_TIPS];
}

export function getPrepStats(): PrepStats {
  const guides = getGuides();
  const checklists = getChecklists();
  const mistakes = getCommonMistakes();

  const completedChecklists = checklists.filter((c) => c.completionPercent === 100);
  const avgCompletion = checklists.length > 0
    ? Math.round(checklists.reduce((s, c) => s + c.completionPercent, 0) / checklists.length)
    : 0;

  const categoryCounts: Record<string, number> = {};
  guides.forEach((g) => {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'inspection';

  return {
    totalGuidesRead: guides.length,
    checklistsCompleted: completedChecklists.length,
    avgCompletionRate: avgCompletion,
    topCategory,
    mistakesAvoided: mistakes.length,
  };
}

export function formatTime(mins: number): string {
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''}`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (remaining === 0) return `${hours} hr${hours !== 1 ? 's' : ''}`;
  return `${hours} hr${hours !== 1 ? 's' : ''} ${remaining} min${remaining !== 1 ? 's' : ''}`;
}

export function getCategoryColor(category: PrepCategory): string {
  const colors: Record<PrepCategory, string> = {
    cleaning: '#3b82f6',
    holders: '#8b5cf6',
    submission: '#10b981',
    inspection: '#f59e0b',
    shipping: '#ef4444',
  };
  return colors[category] || '#6b7280';
}

export function getCategoryLabel(category: PrepCategory): string {
  const labels: Record<PrepCategory, string> = {
    cleaning: 'Cleaning',
    holders: 'Holders',
    submission: 'Submission',
    inspection: 'Inspection',
    shipping: 'Shipping',
  };
  return labels[category] || category;
}

export function getDifficultyColor(difficulty: PrepDifficulty): string {
  const colors: Record<PrepDifficulty, string> = {
    beginner: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };
  return colors[difficulty] || '#6b7280';
}

export function getSeverityColor(severity: MistakeSeverity): string {
  const colors: Record<MistakeSeverity, string> = {
    minor: '#f59e0b',
    major: '#f97316',
    critical: '#ef4444',
  };
  return colors[severity] || '#6b7280';
}

export function getFrequencyLabel(frequency: MistakeFrequency): string {
  const labels: Record<MistakeFrequency, string> = {
    common: 'Common',
    occasional: 'Occasional',
    rare: 'Rare',
  };
  return labels[frequency] || frequency;
}
