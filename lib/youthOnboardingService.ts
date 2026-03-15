// Phase 144: Youth & Next-Gen Collector Onboarding Platform
// Interactive learning platform for new and young collectors with guided modules, achievements, and mentorship

// ---- Types ----

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: SkillLevel;
  estimatedMinutes: number;
  xpReward: number;
  completed: boolean;
  order: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpValue: number;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

export interface StarterCollection {
  id: string;
  name: string;
  description: string;
  budget: number;
  cards: { player: string; year: number; set: string; estimatedValue: number }[];
  sport: string;
  difficulty: SkillLevel;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
}

export interface MentorProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  specialties: string[];
  rating: number;
  availability: string;
  yearsExperience: number;
  studentsHelped: number;
}

export interface CollectorMilestone {
  id: string;
  title: string;
  description: string;
  xpRequired: number;
  reward: string;
  reached: boolean;
}

export interface SafetyTip {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

export interface BudgetPlan {
  id: string;
  name: string;
  monthlyBudget: number;
  description: string;
  breakdown: { category: string; percentage: number; amount: number }[];
  skillLevel: SkillLevel;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  difficulty: SkillLevel;
  moduleId: string;
  xpReward: number;
}

export interface ProgressTracker {
  level: number;
  xp: number;
  totalXp: number;
  modulesCompleted: number;
  achievementsUnlocked: number;
  streakDays: number;
  joinDate: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: string;
  xpReward: number;
  participants: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

// ---- Storage ----

const STORAGE_KEY = 'msi_youth_onboarding';

function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    console.warn(`Failed to save data for key: ${key}`);
  }
}

// ---- Mock Data: Learning Modules ----

const MOCK_LEARNING_MODULES: LearningModule[] = [
  {
    id: 'mod_001',
    title: 'What Are Trading Cards?',
    description: 'An introduction to the world of sports trading cards, their history, and why people collect them.',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    xpReward: 100,
    completed: false,
    order: 1,
  },
  {
    id: 'mod_002',
    title: 'Understanding Card Grades',
    description: 'Learn how cards are graded on a scale of 1-10 and why condition matters so much to collectors.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
    xpReward: 150,
    completed: false,
    order: 2,
  },
  {
    id: 'mod_003',
    title: 'Building Your First Collection',
    description: 'Step-by-step guide to starting your own card collection on any budget.',
    difficulty: 'beginner',
    estimatedMinutes: 25,
    xpReward: 200,
    completed: false,
    order: 3,
  },
  {
    id: 'mod_004',
    title: 'Spotting Fakes & Counterfeits',
    description: 'How to identify counterfeit cards and protect yourself from scams in the hobby.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    xpReward: 250,
    completed: false,
    order: 4,
  },
  {
    id: 'mod_005',
    title: 'Smart Buying Strategies',
    description: 'Tips and techniques for getting the best deals on cards whether buying online or in person.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    xpReward: 200,
    completed: false,
    order: 5,
  },
  {
    id: 'mod_006',
    title: 'Card Care & Storage 101',
    description: 'Proper techniques for handling, storing, and preserving your cards to maintain their value.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
    xpReward: 150,
    completed: false,
    order: 6,
  },
  {
    id: 'mod_007',
    title: 'Market Basics',
    description: 'Understanding supply and demand, market trends, and what drives card values up or down.',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    xpReward: 300,
    completed: false,
    order: 7,
  },
  {
    id: 'mod_008',
    title: 'The Grading Process',
    description: 'A deep dive into professional grading services like PSA, BGS, and SGC and how to submit cards.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    xpReward: 250,
    completed: false,
    order: 8,
  },
  {
    id: 'mod_009',
    title: 'Trading & Selling',
    description: 'How to trade cards fairly and sell them through various platforms and marketplaces.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    xpReward: 300,
    completed: false,
    order: 9,
  },
  {
    id: 'mod_010',
    title: 'Digital Cards & NFTs',
    description: 'Exploring the world of digital trading cards, NFTs, and how they fit into the collecting hobby.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    xpReward: 250,
    completed: false,
    order: 10,
  },
  {
    id: 'mod_011',
    title: 'Hobby History',
    description: 'The fascinating history of sports card collecting from the 1800s tobacco cards to modern releases.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
    xpReward: 150,
    completed: false,
    order: 11,
  },
  {
    id: 'mod_012',
    title: 'Advanced Investing',
    description: 'Advanced strategies for treating cards as investments including portfolio diversification and long-term holds.',
    difficulty: 'expert',
    estimatedMinutes: 45,
    xpReward: 500,
    completed: false,
    order: 12,
  },
];

// ---- Mock Data: Achievements ----

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_001', name: 'First Steps', description: 'Complete your first learning module', xpValue: 50, icon: '🎓', unlocked: false, category: 'learning' },
  { id: 'ach_002', name: 'Knowledge Seeker', description: 'Complete 3 learning modules', xpValue: 100, icon: '📚', unlocked: false, category: 'learning' },
  { id: 'ach_003', name: 'Scholar', description: 'Complete 6 learning modules', xpValue: 200, icon: '🏅', unlocked: false, category: 'learning' },
  { id: 'ach_004', name: 'Master Graduate', description: 'Complete all 12 learning modules', xpValue: 500, icon: '🎖️', unlocked: false, category: 'learning' },
  { id: 'ach_005', name: 'Quiz Whiz', description: 'Answer 10 quiz questions correctly', xpValue: 100, icon: '🧠', unlocked: false, category: 'quiz' },
  { id: 'ach_006', name: 'Perfect Score', description: 'Get 100% on any module quiz', xpValue: 150, icon: '💯', unlocked: false, category: 'quiz' },
  { id: 'ach_007', name: 'Card Spotter', description: 'Identify your first counterfeit card in training', xpValue: 75, icon: '🔍', unlocked: false, category: 'skills' },
  { id: 'ach_008', name: 'Budget Boss', description: 'Create your first budget plan', xpValue: 100, icon: '💰', unlocked: false, category: 'finance' },
  { id: 'ach_009', name: 'Community Member', description: 'Join your first community challenge', xpValue: 75, icon: '🤝', unlocked: false, category: 'community' },
  { id: 'ach_010', name: 'Streak Starter', description: 'Maintain a 3-day learning streak', xpValue: 100, icon: '🔥', unlocked: false, category: 'engagement' },
  { id: 'ach_011', name: 'Week Warrior', description: 'Maintain a 7-day learning streak', xpValue: 200, icon: '⚡', unlocked: false, category: 'engagement' },
  { id: 'ach_012', name: 'Glossary Guru', description: 'Look up 20 glossary terms', xpValue: 100, icon: '📖', unlocked: false, category: 'learning' },
  { id: 'ach_013', name: 'Mentor Connection', description: 'Connect with your first mentor', xpValue: 150, icon: '👨‍🏫', unlocked: false, category: 'community' },
  { id: 'ach_014', name: 'Collection Starter', description: 'Build your first starter collection', xpValue: 200, icon: '📦', unlocked: false, category: 'collecting' },
  { id: 'ach_015', name: 'Safety First', description: 'Read all safety tips', xpValue: 100, icon: '🛡️', unlocked: false, category: 'safety' },
  { id: 'ach_016', name: 'Level 5 Collector', description: 'Reach Level 5', xpValue: 250, icon: '⭐', unlocked: false, category: 'progress' },
  { id: 'ach_017', name: 'Level 10 Collector', description: 'Reach Level 10', xpValue: 500, icon: '🌟', unlocked: false, category: 'progress' },
  { id: 'ach_018', name: 'Challenge Champion', description: 'Complete 3 community challenges', xpValue: 300, icon: '🏆', unlocked: false, category: 'community' },
  { id: 'ach_019', name: 'Grading Expert', description: 'Complete the grading process module with a perfect quiz score', xpValue: 350, icon: '💎', unlocked: false, category: 'skills' },
  { id: 'ach_020', name: 'Hobby Historian', description: 'Complete the Hobby History module and score 80%+ on the quiz', xpValue: 200, icon: '📜', unlocked: false, category: 'learning' },
];

// ---- Mock Data: Starter Collections ----

const MOCK_STARTER_COLLECTIONS: StarterCollection[] = [
  {
    id: 'sc_001',
    name: 'Baseball Beginners Bundle',
    description: 'A great starting point for young baseball card collectors featuring iconic players.',
    budget: 50,
    cards: [
      { player: 'Mike Trout', year: 2020, set: 'Topps Series 1', estimatedValue: 8 },
      { player: 'Shohei Ohtani', year: 2021, set: 'Topps Chrome', estimatedValue: 12 },
      { player: 'Ronald Acuna Jr.', year: 2019, set: 'Topps Update', estimatedValue: 10 },
      { player: 'Juan Soto', year: 2020, set: 'Topps Heritage', estimatedValue: 7 },
      { player: 'Mookie Betts', year: 2021, set: 'Topps Series 2', estimatedValue: 6 },
      { player: 'Fernando Tatis Jr.', year: 2020, set: 'Topps Chrome', estimatedValue: 7 },
    ],
    sport: 'Baseball',
    difficulty: 'beginner',
  },
  {
    id: 'sc_002',
    name: 'Basketball Starter Pack',
    description: 'Essential basketball cards featuring current superstars and rising stars.',
    budget: 75,
    cards: [
      { player: 'Luka Doncic', year: 2020, set: 'Panini Prizm', estimatedValue: 15 },
      { player: 'Ja Morant', year: 2021, set: 'Panini Select', estimatedValue: 12 },
      { player: 'Anthony Edwards', year: 2021, set: 'Panini Prizm', estimatedValue: 14 },
      { player: 'LaMelo Ball', year: 2021, set: 'Panini Hoops', estimatedValue: 10 },
      { player: 'Zion Williamson', year: 2020, set: 'Panini Mosaic', estimatedValue: 12 },
      { player: 'Tyrese Haliburton', year: 2022, set: 'Panini Prizm', estimatedValue: 8 },
    ],
    sport: 'Basketball',
    difficulty: 'beginner',
  },
  {
    id: 'sc_003',
    name: 'Football Fundamentals',
    description: 'Core football cards featuring top quarterbacks and skill position players.',
    budget: 100,
    cards: [
      { player: 'Patrick Mahomes', year: 2020, set: 'Panini Prizm', estimatedValue: 20 },
      { player: 'Justin Herbert', year: 2021, set: 'Panini Mosaic', estimatedValue: 18 },
      { player: 'Joe Burrow', year: 2021, set: 'Panini Select', estimatedValue: 16 },
      { player: 'Josh Allen', year: 2020, set: 'Panini Prizm', estimatedValue: 15 },
      { player: 'Trevor Lawrence', year: 2022, set: 'Panini Prizm', estimatedValue: 12 },
      { player: 'Ja\'Marr Chase', year: 2022, set: 'Panini Mosaic', estimatedValue: 10 },
      { player: 'CeeDee Lamb', year: 2021, set: 'Panini Select', estimatedValue: 9 },
    ],
    sport: 'Football',
    difficulty: 'intermediate',
  },
  {
    id: 'sc_004',
    name: 'Multi-Sport Sampler',
    description: 'A diverse collection spanning multiple sports to help you discover your favorite.',
    budget: 100,
    cards: [
      { player: 'Aaron Judge', year: 2022, set: 'Topps Chrome', estimatedValue: 15 },
      { player: 'Victor Wembanyama', year: 2024, set: 'Panini Prizm', estimatedValue: 25 },
      { player: 'Travis Kelce', year: 2021, set: 'Panini Prizm', estimatedValue: 12 },
      { player: 'Connor McDavid', year: 2020, set: 'Upper Deck', estimatedValue: 18 },
      { player: 'Lionel Messi', year: 2022, set: 'Topps Chrome', estimatedValue: 20 },
      { player: 'Caitlin Clark', year: 2024, set: 'Panini Prizm', estimatedValue: 10 },
    ],
    sport: 'Multi-Sport',
    difficulty: 'beginner',
  },
  {
    id: 'sc_005',
    name: 'Vintage Appreciation Set',
    description: 'Affordable vintage cards that teach young collectors about card history and preservation.',
    budget: 150,
    cards: [
      { player: 'Ken Griffey Jr.', year: 1989, set: 'Upper Deck', estimatedValue: 25 },
      { player: 'Cal Ripken Jr.', year: 1982, set: 'Topps Traded', estimatedValue: 30 },
      { player: 'Derek Jeter', year: 1993, set: 'Topps', estimatedValue: 20 },
      { player: 'Michael Jordan', year: 1990, set: 'Fleer', estimatedValue: 35 },
      { player: 'Wayne Gretzky', year: 1990, set: 'Pro Set', estimatedValue: 15 },
      { player: 'Nolan Ryan', year: 1990, set: 'Topps', estimatedValue: 10 },
      { player: 'Magic Johnson', year: 1988, set: 'Fleer', estimatedValue: 15 },
    ],
    sport: 'Multi-Sport',
    difficulty: 'intermediate',
  },
  {
    id: 'sc_006',
    name: 'Premium Rookie Investment',
    description: 'Higher-end rookie cards with strong long-term potential for the serious young collector.',
    budget: 200,
    cards: [
      { player: 'Victor Wembanyama', year: 2024, set: 'Panini Prizm Silver', estimatedValue: 45 },
      { player: 'Shohei Ohtani', year: 2018, set: 'Topps Chrome Refractor', estimatedValue: 40 },
      { player: 'Caleb Williams', year: 2024, set: 'Panini Prizm', estimatedValue: 30 },
      { player: 'Connor Bedard', year: 2024, set: 'Upper Deck Young Guns', estimatedValue: 35 },
      { player: 'Chet Holmgren', year: 2023, set: 'Panini Select', estimatedValue: 25 },
      { player: 'Anthony Richardson', year: 2024, set: 'Panini Prizm', estimatedValue: 25 },
    ],
    sport: 'Multi-Sport',
    difficulty: 'advanced',
  },
];

// ---- Mock Data: Glossary Terms ----

const MOCK_GLOSSARY_TERMS: GlossaryTerm[] = [
  { id: 'gl_001', term: 'Auto', definition: 'Short for autograph. A card that has been signed by the featured player, either on-card or on a sticker affixed to the card.', category: 'Card Types', relatedTerms: ['On-Card Auto', 'Sticker Auto'] },
  { id: 'gl_002', term: 'Base Card', definition: 'The standard, most common cards in a set. They make up the majority of any product release.', category: 'Card Types', relatedTerms: ['Parallel', 'Insert'] },
  { id: 'gl_003', term: 'BGS', definition: 'Beckett Grading Services. One of the top professional card grading companies known for subgrades.', category: 'Grading', relatedTerms: ['PSA', 'SGC', 'Subgrade'] },
  { id: 'gl_004', term: 'Box Break', definition: 'Opening an entire box of cards, often streamed live. Group breaks split the cost among participants.', category: 'Buying', relatedTerms: ['Hobby Box', 'Case Break'] },
  { id: 'gl_005', term: 'Centering', definition: 'How well-centered the image is on the card. A key factor in grading, measured by border symmetry.', category: 'Grading', relatedTerms: ['Subgrade', 'Surface', 'Corners'] },
  { id: 'gl_006', term: 'Chrome', definition: 'A type of card stock with a shiny, reflective surface. Topps Chrome is one of the most popular product lines.', category: 'Card Types', relatedTerms: ['Refractor', 'Base Card'] },
  { id: 'gl_007', term: 'Comps', definition: 'Short for comparables. Recent sales of similar cards used to determine a card\'s current market value.', category: 'Market', relatedTerms: ['Fair Market Value', 'Last Sold'] },
  { id: 'gl_008', term: 'Corners', definition: 'One of the four grading subgrades. Refers to the sharpness and condition of a card\'s corners.', category: 'Grading', relatedTerms: ['Centering', 'Edges', 'Surface'] },
  { id: 'gl_009', term: 'Dinged', definition: 'A card with visible damage, typically dents or dings on the edges or corners, reducing its grade and value.', category: 'Condition', relatedTerms: ['Corners', 'Edges', 'Raw'] },
  { id: 'gl_010', term: 'Edges', definition: 'The sides of a card. One of the four grading subgrades, examining chips, nicks, or wear along the edges.', category: 'Grading', relatedTerms: ['Corners', 'Surface', 'Centering'] },
  { id: 'gl_011', term: 'Fair Market Value', definition: 'The price a card would reasonably sell for on the open market based on recent comparable sales.', category: 'Market', relatedTerms: ['Comps', 'Book Value'] },
  { id: 'gl_012', term: 'Gem Mint', definition: 'The highest grade a card can receive (PSA 10 or BGS 9.5+). Indicates near-perfect condition.', category: 'Grading', relatedTerms: ['PSA', 'BGS', 'Mint'] },
  { id: 'gl_013', term: 'Hobby Box', definition: 'A sealed box of cards sold through hobby shops and authorized dealers, usually with guaranteed hits.', category: 'Buying', relatedTerms: ['Retail Box', 'Box Break', 'Hits'] },
  { id: 'gl_014', term: 'Hits', definition: 'Valuable cards found in packs, typically autographs, memorabilia cards, or low-numbered parallels.', category: 'Card Types', relatedTerms: ['Auto', 'Patch Card', 'Parallel'] },
  { id: 'gl_015', term: 'Insert', definition: 'A special card that is not part of the base set, often with a unique design or theme.', category: 'Card Types', relatedTerms: ['Base Card', 'Parallel', 'Short Print'] },
  { id: 'gl_016', term: 'Junk Wax Era', definition: 'The period from roughly 1987-1994 when cards were massively overproduced, making most cards from this era worth very little.', category: 'History', relatedTerms: ['Overproduction', 'Vintage'] },
  { id: 'gl_017', term: 'Lot', definition: 'A group of cards sold together as a single listing, often at a discount compared to individual sales.', category: 'Buying', relatedTerms: ['Comps', 'Fair Market Value'] },
  { id: 'gl_018', term: 'Mint', definition: 'A card in excellent condition with minimal flaws. Typically a grade of 9 on a 10-point scale.', category: 'Grading', relatedTerms: ['Gem Mint', 'Near Mint', 'Raw'] },
  { id: 'gl_019', term: 'Numbered Card', definition: 'A card that is serial numbered (e.g., /99 or /25), indicating limited print run and often higher value.', category: 'Card Types', relatedTerms: ['Parallel', 'Short Print', 'One of One'] },
  { id: 'gl_020', term: 'One of One (1/1)', definition: 'A card with only a single copy in existence, making it the most rare type of numbered card.', category: 'Card Types', relatedTerms: ['Numbered Card', 'Parallel'] },
  { id: 'gl_021', term: 'Parallel', definition: 'A variation of a base card with a different color, design, or finish, often numbered to a limited quantity.', category: 'Card Types', relatedTerms: ['Base Card', 'Refractor', 'Numbered Card'] },
  { id: 'gl_022', term: 'Patch Card', definition: 'A memorabilia card containing a piece of game-worn jersey, often featuring multi-colored patches.', category: 'Card Types', relatedTerms: ['Hits', 'Memorabilia', 'Game-Used'] },
  { id: 'gl_023', term: 'Penny Sleeve', definition: 'A thin, inexpensive plastic sleeve used as the first layer of protection for a card.', category: 'Storage', relatedTerms: ['Top Loader', 'One-Touch', 'Card Saver'] },
  { id: 'gl_024', term: 'Population Report', definition: 'A database showing how many of each card have been graded at each grade level by a grading company.', category: 'Grading', relatedTerms: ['PSA', 'BGS', 'Gem Mint'] },
  { id: 'gl_025', term: 'PSA', definition: 'Professional Sports Authenticator. The most widely recognized card grading and authentication service.', category: 'Grading', relatedTerms: ['BGS', 'SGC', 'Gem Mint'] },
  { id: 'gl_026', term: 'Raw', definition: 'An ungraded card that has not been submitted to a professional grading service.', category: 'Condition', relatedTerms: ['PSA', 'BGS', 'Grading'] },
  { id: 'gl_027', term: 'Refractor', definition: 'A type of Chrome card with a rainbow-like reflective finish, highly sought after by collectors.', category: 'Card Types', relatedTerms: ['Chrome', 'Parallel', 'Prizm'] },
  { id: 'gl_028', term: 'Retail Box', definition: 'Cards sold at major retail stores like Walmart or Target, typically with lower odds of hits than hobby boxes.', category: 'Buying', relatedTerms: ['Hobby Box', 'Blaster Box'] },
  { id: 'gl_029', term: 'ROI', definition: 'Return on Investment. The profit or loss on a card purchase expressed as a percentage of the original cost.', category: 'Market', relatedTerms: ['Fair Market Value', 'Comps'] },
  { id: 'gl_030', term: 'Rookie Card (RC)', definition: 'A player\'s first officially licensed trading card, usually the most valuable and collected card of that player.', category: 'Card Types', relatedTerms: ['Base Card', 'Prospect'] },
  { id: 'gl_031', term: 'SGC', definition: 'Sportscard Guaranty Corporation. A professional grading service known for its distinctive tuxedo-style holders.', category: 'Grading', relatedTerms: ['PSA', 'BGS'] },
  { id: 'gl_032', term: 'Short Print (SP)', definition: 'A card printed in smaller quantities than the standard base cards, making it rarer and often more valuable.', category: 'Card Types', relatedTerms: ['Super Short Print', 'Base Card', 'Insert'] },
  { id: 'gl_033', term: 'Slab', definition: 'The hard plastic case a card is sealed in after being graded by a professional grading company.', category: 'Grading', relatedTerms: ['PSA', 'BGS', 'Raw'] },
  { id: 'gl_034', term: 'Surface', definition: 'One of the four grading subgrades. Refers to the condition of the card\'s front and back surfaces.', category: 'Grading', relatedTerms: ['Centering', 'Corners', 'Edges'] },
  { id: 'gl_035', term: 'Top Loader', definition: 'A rigid plastic holder used to protect individual cards. More protection than a penny sleeve.', category: 'Storage', relatedTerms: ['Penny Sleeve', 'One-Touch', 'Card Saver'] },
  { id: 'gl_036', term: 'Trimmed', definition: 'A card whose edges have been illegally cut to improve centering or remove damage. Considered altered and fraudulent.', category: 'Condition', relatedTerms: ['Counterfeit', 'Altered'] },
  { id: 'gl_037', term: 'Vintage', definition: 'Generally refers to cards produced before 1980, though definitions vary among collectors.', category: 'History', relatedTerms: ['Junk Wax Era', 'Pre-War'] },
  { id: 'gl_038', term: 'Wax Pack', definition: 'A pack of cards sealed in wax paper wrapping, common before the 1990s. Now used loosely to refer to any card pack.', category: 'Buying', relatedTerms: ['Hobby Box', 'Retail Box'] },
  { id: 'gl_039', term: 'Wrapper Redemption', definition: 'A promotion where collectors can exchange wrappers or proof of purchase for exclusive cards or prizes at events.', category: 'Buying', relatedTerms: ['Hobby Box', 'Insert'] },
  { id: 'gl_040', term: 'X-Fractors', definition: 'A popular parallel type in Topps Chrome featuring an X-shaped refractor pattern on the card surface.', category: 'Card Types', relatedTerms: ['Refractor', 'Chrome', 'Parallel'] },
];

// ---- Mock Data: Mentor Profiles ----

const MOCK_MENTOR_PROFILES: MentorProfile[] = [
  {
    id: 'mentor_001',
    name: 'Coach Williams',
    avatar: '/avatars/coach-williams.png',
    bio: 'Former card shop owner with 25 years in the hobby. Specializes in helping beginners understand card values and market basics.',
    specialties: ['Market Analysis', 'Vintage Cards', 'Baseball'],
    rating: 4.9,
    availability: 'Weekdays 9am-5pm EST',
    yearsExperience: 25,
    studentsHelped: 342,
  },
  {
    id: 'mentor_002',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah-chen.png',
    bio: 'Professional card grader turned educator. Expert in card authentication and condition assessment.',
    specialties: ['Card Grading', 'Authentication', 'Counterfeit Detection'],
    rating: 4.8,
    availability: 'Mon-Wed-Fri 10am-3pm EST',
    yearsExperience: 15,
    studentsHelped: 218,
  },
  {
    id: 'mentor_003',
    name: 'Marcus Thompson',
    avatar: '/avatars/marcus-thompson.png',
    bio: 'Basketball card specialist and content creator with a passion for helping young collectors build smart collections.',
    specialties: ['Basketball Cards', 'Rookie Investing', 'Social Media'],
    rating: 4.7,
    availability: 'Daily 12pm-8pm EST',
    yearsExperience: 10,
    studentsHelped: 567,
  },
  {
    id: 'mentor_004',
    name: 'Dr. Emily Park',
    avatar: '/avatars/emily-park.png',
    bio: 'Sports memorabilia historian and professor. Brings academic rigor to understanding the hobby\'s past and future.',
    specialties: ['Hobby History', 'Pre-War Cards', 'Set Building'],
    rating: 4.9,
    availability: 'Tue-Thu 2pm-6pm EST',
    yearsExperience: 20,
    studentsHelped: 145,
  },
  {
    id: 'mentor_005',
    name: 'Jake Rivera',
    avatar: '/avatars/jake-rivera.png',
    bio: 'Young collector who turned his childhood hobby into a thriving business. Relatable mentor for teen collectors.',
    specialties: ['Football Cards', 'Budget Collecting', 'Online Selling'],
    rating: 4.6,
    availability: 'Weekends 10am-4pm EST',
    yearsExperience: 8,
    studentsHelped: 890,
  },
  {
    id: 'mentor_006',
    name: 'Lisa Nakamura',
    avatar: '/avatars/lisa-nakamura.png',
    bio: 'Digital cards and NFT expert. Helps young collectors navigate the intersection of technology and collecting.',
    specialties: ['Digital Cards', 'NFTs', 'Technology'],
    rating: 4.5,
    availability: 'Mon-Fri 11am-7pm EST',
    yearsExperience: 6,
    studentsHelped: 312,
  },
  {
    id: 'mentor_007',
    name: 'Robert "Big Rob" Jackson',
    avatar: '/avatars/big-rob.png',
    bio: 'Card show veteran and community leader. Known for running the most welcoming card shows in the Midwest.',
    specialties: ['Card Shows', 'Trading', 'Community Building'],
    rating: 4.8,
    availability: 'Weekdays 3pm-9pm EST',
    yearsExperience: 30,
    studentsHelped: 720,
  },
  {
    id: 'mentor_008',
    name: 'Amanda Torres',
    avatar: '/avatars/amanda-torres.png',
    bio: 'Financial advisor who collects cards. Teaches young people about budgeting, saving, and responsible spending in the hobby.',
    specialties: ['Budgeting', 'Financial Literacy', 'Long-Term Investing'],
    rating: 4.7,
    availability: 'Tue-Sat 9am-1pm EST',
    yearsExperience: 12,
    studentsHelped: 256,
  },
];

// ---- Mock Data: Milestones ----

const MOCK_MILESTONES: CollectorMilestone[] = [
  { id: 'ms_001', title: 'Rookie Collector', description: 'Begin your collecting journey', xpRequired: 0, reward: 'Welcome Badge', reached: true },
  { id: 'ms_002', title: 'Card Apprentice', description: 'Reach 500 XP', xpRequired: 500, reward: 'Apprentice Badge + 1 Free Glossary Download', reached: false },
  { id: 'ms_003', title: 'Rising Star', description: 'Reach 1,500 XP', xpRequired: 1500, reward: 'Rising Star Badge + Mentor Access', reached: false },
  { id: 'ms_004', title: 'Hobby Enthusiast', description: 'Reach 3,000 XP', xpRequired: 3000, reward: 'Enthusiast Badge + Exclusive Quiz Pack', reached: false },
  { id: 'ms_005', title: 'Seasoned Collector', description: 'Reach 5,000 XP', xpRequired: 5000, reward: 'Seasoned Badge + Advanced Module Access', reached: false },
  { id: 'ms_006', title: 'Expert Collector', description: 'Reach 8,000 XP', xpRequired: 8000, reward: 'Expert Badge + Community Leader Status', reached: false },
  { id: 'ms_007', title: 'Master Collector', description: 'Reach 12,000 XP', xpRequired: 12000, reward: 'Master Badge + Mentor Certification', reached: false },
  { id: 'ms_008', title: 'Hall of Fame', description: 'Reach 20,000 XP', xpRequired: 20000, reward: 'Hall of Fame Badge + Lifetime Achievement', reached: false },
  { id: 'ms_009', title: 'Legend', description: 'Reach 35,000 XP', xpRequired: 35000, reward: 'Legend Badge + Platform Ambassador', reached: false },
  { id: 'ms_010', title: 'GOAT Collector', description: 'Reach 50,000 XP', xpRequired: 50000, reward: 'GOAT Badge + Custom Profile Theme', reached: false },
];

// ---- Mock Data: Safety Tips ----

const MOCK_SAFETY_TIPS: SafetyTip[] = [
  { id: 'st_001', title: 'Never Share Personal Information', description: 'Never share your full name, address, school, or phone number with strangers online when buying or trading cards.', category: 'Online Safety', priority: 'high' },
  { id: 'st_002', title: 'Always Involve a Parent or Guardian', description: 'Before making any purchase over $20 or meeting someone to trade, always get permission from a parent or guardian.', category: 'Purchasing', priority: 'high' },
  { id: 'st_003', title: 'Use Trusted Platforms Only', description: 'Only buy cards from reputable websites and marketplaces. Avoid deals that seem too good to be true.', category: 'Online Safety', priority: 'high' },
  { id: 'st_004', title: 'Verify Before You Buy', description: 'Always check recent sales (comps) before buying a card to make sure the price is fair and reasonable.', category: 'Purchasing', priority: 'medium' },
  { id: 'st_005', title: 'Beware of Counterfeit Cards', description: 'Learn the signs of fake cards: blurry printing, wrong card stock weight, missing holograms, or misaligned borders.', category: 'Authentication', priority: 'high' },
  { id: 'st_006', title: 'Set a Budget and Stick to It', description: 'Decide how much you can spend each month and never go over that amount. Collecting should be fun, not stressful.', category: 'Financial', priority: 'medium' },
  { id: 'st_007', title: 'Protect Your Cards Properly', description: 'Always use penny sleeves and top loaders to protect valuable cards. Store them in a cool, dry place away from sunlight.', category: 'Card Care', priority: 'medium' },
  { id: 'st_008', title: 'Meet in Public Places for Trades', description: 'If meeting someone in person to trade or buy cards, always meet in a well-lit public place with an adult present.', category: 'In-Person Safety', priority: 'high' },
  { id: 'st_009', title: 'Keep Records of Your Collection', description: 'Maintain a list or spreadsheet of your cards and what you paid. This helps with insurance and tracking value.', category: 'Organization', priority: 'low' },
  { id: 'st_010', title: 'Don\'t Chase Losses', description: 'If you buy a box and don\'t get great hits, resist the urge to buy another immediately. Take a break and reassess.', category: 'Financial', priority: 'medium' },
];

// ---- Mock Data: Budget Plans ----

const MOCK_BUDGET_PLANS: BudgetPlan[] = [
  {
    id: 'bp_001',
    name: 'Pocket Money Plan',
    monthlyBudget: 20,
    description: 'Perfect for young collectors working with a small allowance. Focus on singles and retail packs.',
    breakdown: [
      { category: 'Singles', percentage: 50, amount: 10 },
      { category: 'Retail Packs', percentage: 30, amount: 6 },
      { category: 'Supplies', percentage: 20, amount: 4 },
    ],
    skillLevel: 'beginner',
  },
  {
    id: 'bp_002',
    name: 'Birthday Money Plan',
    monthlyBudget: 50,
    description: 'A step up for collectors who save birthday and holiday money for the hobby.',
    breakdown: [
      { category: 'Singles', percentage: 40, amount: 20 },
      { category: 'Blaster Boxes', percentage: 30, amount: 15 },
      { category: 'Grading Fund', percentage: 15, amount: 7.50 },
      { category: 'Supplies', percentage: 15, amount: 7.50 },
    ],
    skillLevel: 'beginner',
  },
  {
    id: 'bp_003',
    name: 'Part-Time Job Plan',
    monthlyBudget: 100,
    description: 'For teen collectors with part-time income who want to build a quality collection.',
    breakdown: [
      { category: 'Singles', percentage: 35, amount: 35 },
      { category: 'Hobby Boxes', percentage: 30, amount: 30 },
      { category: 'Grading Submissions', percentage: 20, amount: 20 },
      { category: 'Supplies & Storage', percentage: 15, amount: 15 },
    ],
    skillLevel: 'intermediate',
  },
  {
    id: 'bp_004',
    name: 'Savings Goal Plan',
    monthlyBudget: 150,
    description: 'A balanced approach that includes saving for bigger purchases while still enjoying the hobby.',
    breakdown: [
      { category: 'Key Singles', percentage: 30, amount: 45 },
      { category: 'Hobby Products', percentage: 25, amount: 37.50 },
      { category: 'Grading', percentage: 15, amount: 22.50 },
      { category: 'Savings for Big Purchase', percentage: 20, amount: 30 },
      { category: 'Supplies', percentage: 10, amount: 15 },
    ],
    skillLevel: 'intermediate',
  },
  {
    id: 'bp_005',
    name: 'Serious Collector Plan',
    monthlyBudget: 250,
    description: 'For dedicated collectors ready to make strategic investments and build a premium collection.',
    breakdown: [
      { category: 'Investment Singles', percentage: 35, amount: 87.50 },
      { category: 'Premium Hobby Boxes', percentage: 25, amount: 62.50 },
      { category: 'Grading & Authentication', percentage: 15, amount: 37.50 },
      { category: 'Long-Term Hold Fund', percentage: 15, amount: 37.50 },
      { category: 'Supplies & Insurance', percentage: 10, amount: 25 },
    ],
    skillLevel: 'advanced',
  },
];

// ---- Mock Data: Quiz Questions ----

const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q_001',
    question: 'What does "RC" stand for on a trading card?',
    options: ['Rare Card', 'Rookie Card', 'Retail Copy', 'Regular Chrome'],
    correctIndex: 1,
    explanation: 'RC stands for Rookie Card, which is a player\'s first officially licensed trading card.',
    difficulty: 'beginner',
    moduleId: 'mod_001',
    xpReward: 10,
  },
  {
    id: 'q_002',
    question: 'What is the highest grade a PSA-graded card can receive?',
    options: ['PSA 8', 'PSA 9', 'PSA 10', 'PSA 12'],
    correctIndex: 2,
    explanation: 'PSA grades cards on a scale of 1-10, with PSA 10 (Gem Mint) being the highest possible grade.',
    difficulty: 'beginner',
    moduleId: 'mod_002',
    xpReward: 10,
  },
  {
    id: 'q_003',
    question: 'What is the first thing you should do when you pull a valuable card from a pack?',
    options: ['Post it on social media', 'Put it in a penny sleeve and top loader', 'Bend it to test the stock', 'Lick the back to test authenticity'],
    correctIndex: 1,
    explanation: 'Always protect valuable cards immediately by placing them in a penny sleeve first, then a top loader.',
    difficulty: 'beginner',
    moduleId: 'mod_003',
    xpReward: 10,
  },
  {
    id: 'q_004',
    question: 'Which of these is a red flag that a card might be counterfeit?',
    options: ['Sharp corners', 'Proper hologram', 'Blurry text and images', 'Correct card stock thickness'],
    correctIndex: 2,
    explanation: 'Blurry text and images are a common sign of counterfeit cards, as reproductions often lack the print quality of genuine cards.',
    difficulty: 'intermediate',
    moduleId: 'mod_004',
    xpReward: 15,
  },
  {
    id: 'q_005',
    question: 'What are "comps" in card collecting?',
    options: ['Complimentary free cards', 'Competition entries', 'Comparable recent sales', 'Complete sets'],
    correctIndex: 2,
    explanation: 'Comps (comparables) are recent sales of similar cards used to determine current market value.',
    difficulty: 'beginner',
    moduleId: 'mod_005',
    xpReward: 10,
  },
  {
    id: 'q_006',
    question: 'What is the ideal temperature range for storing trading cards?',
    options: ['32-45\u00B0F', '60-72\u00B0F', '80-90\u00B0F', 'Temperature doesn\'t matter'],
    correctIndex: 1,
    explanation: 'Cards should be stored at 60-72\u00B0F (room temperature) in a dry environment to prevent warping and damage.',
    difficulty: 'beginner',
    moduleId: 'mod_006',
    xpReward: 10,
  },
  {
    id: 'q_007',
    question: 'What typically happens to a rookie card\'s value when the player gets injured?',
    options: ['It always goes up', 'It usually decreases temporarily', 'It stays exactly the same', 'It permanently becomes worthless'],
    correctIndex: 1,
    explanation: 'Player injuries typically cause a temporary decrease in card value due to uncertainty, though it often recovers if the player returns.',
    difficulty: 'intermediate',
    moduleId: 'mod_007',
    xpReward: 15,
  },
  {
    id: 'q_008',
    question: 'Which grading company uses the distinctive "tuxedo" style holder?',
    options: ['PSA', 'BGS', 'SGC', 'CSG'],
    correctIndex: 2,
    explanation: 'SGC (Sportscard Guaranty Corporation) is known for its distinctive black and white "tuxedo" style holders.',
    difficulty: 'intermediate',
    moduleId: 'mod_008',
    xpReward: 15,
  },
  {
    id: 'q_009',
    question: 'What percentage does eBay typically charge as a final value fee on card sales?',
    options: ['0%', 'About 3%', 'About 13%', 'About 30%'],
    correctIndex: 2,
    explanation: 'eBay typically charges around 13% in final value fees on sports card sales, which sellers must factor into their pricing.',
    difficulty: 'intermediate',
    moduleId: 'mod_009',
    xpReward: 15,
  },
  {
    id: 'q_010',
    question: 'What does "NFT" stand for in the context of digital cards?',
    options: ['New Format Technology', 'Non-Fungible Token', 'National Football Trading', 'Next-Gen File Type'],
    correctIndex: 1,
    explanation: 'NFT stands for Non-Fungible Token, a unique digital asset verified using blockchain technology.',
    difficulty: 'beginner',
    moduleId: 'mod_010',
    xpReward: 10,
  },
  {
    id: 'q_011',
    question: 'What era is known as the "Junk Wax Era" in card collecting?',
    options: ['1950s-1960s', '1970s-1980s', '1987-1994', '2000-2010'],
    correctIndex: 2,
    explanation: 'The Junk Wax Era (roughly 1987-1994) was when cards were massively overproduced, making most cards from this era worth very little.',
    difficulty: 'beginner',
    moduleId: 'mod_011',
    xpReward: 10,
  },
  {
    id: 'q_012',
    question: 'What does "portfolio diversification" mean in card investing?',
    options: ['Buying only one player\'s cards', 'Spreading investments across different players, sports, and eras', 'Only buying graded cards', 'Selling everything at once'],
    correctIndex: 1,
    explanation: 'Diversification means spreading your card investments across different players, sports, eras, and card types to reduce risk.',
    difficulty: 'advanced',
    moduleId: 'mod_012',
    xpReward: 20,
  },
  {
    id: 'q_013',
    question: 'What is a "parallel" in card collecting?',
    options: ['Two identical base cards', 'A variation of a base card with different color or finish', 'A card from a different sport', 'A damaged card'],
    correctIndex: 1,
    explanation: 'A parallel is a variation of a base card with a different color, design, or finish, often numbered to a limited quantity.',
    difficulty: 'beginner',
    moduleId: 'mod_001',
    xpReward: 10,
  },
  {
    id: 'q_014',
    question: 'What are the four subgrades that BGS evaluates?',
    options: ['Color, Size, Weight, Smell', 'Centering, Corners, Edges, Surface', 'Front, Back, Top, Bottom', 'Rarity, Age, Player, Team'],
    correctIndex: 1,
    explanation: 'BGS evaluates four subgrades: Centering, Corners, Edges, and Surface, each scored individually.',
    difficulty: 'intermediate',
    moduleId: 'mod_002',
    xpReward: 15,
  },
  {
    id: 'q_015',
    question: 'Why should you never use rubber bands to hold cards together?',
    options: ['They make cards invisible', 'They can leave indentations and damage the card surface', 'Rubber bands are too expensive', 'They attract bugs'],
    correctIndex: 1,
    explanation: 'Rubber bands can leave indentations, cause warping, and damage card surfaces and edges over time, significantly reducing their value.',
    difficulty: 'beginner',
    moduleId: 'mod_006',
    xpReward: 10,
  },
];

// ---- Mock Data: Community Challenges ----

const MOCK_COMMUNITY_CHALLENGES: CommunityChallenge[] = [
  {
    id: 'cc_001',
    title: 'Complete 3 Modules This Week',
    description: 'Finish any 3 learning modules before the week ends to earn bonus XP.',
    type: 'learning',
    xpReward: 200,
    participants: 1247,
    startDate: '2026-03-09',
    endDate: '2026-03-15',
    active: true,
  },
  {
    id: 'cc_002',
    title: 'Glossary Scavenger Hunt',
    description: 'Find and read 15 glossary terms from at least 5 different categories.',
    type: 'exploration',
    xpReward: 150,
    participants: 892,
    startDate: '2026-03-09',
    endDate: '2026-03-15',
    active: true,
  },
  {
    id: 'cc_003',
    title: 'Budget Builder Challenge',
    description: 'Create a personalized budget plan and stick to it for a full month.',
    type: 'financial',
    xpReward: 300,
    participants: 534,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    active: true,
  },
  {
    id: 'cc_004',
    title: 'Quiz Marathon',
    description: 'Answer 30 quiz questions correctly across all modules.',
    type: 'quiz',
    xpReward: 250,
    participants: 1089,
    startDate: '2026-03-09',
    endDate: '2026-03-22',
    active: true,
  },
  {
    id: 'cc_005',
    title: 'Mentor Meet & Greet',
    description: 'Connect with at least 2 different mentors and complete their recommended modules.',
    type: 'mentorship',
    xpReward: 200,
    participants: 345,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    active: true,
  },
  {
    id: 'cc_006',
    title: 'Streak Supreme',
    description: 'Maintain a 14-day consecutive learning streak.',
    type: 'engagement',
    xpReward: 400,
    participants: 678,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    active: true,
  },
  {
    id: 'cc_007',
    title: 'Fake Spotter Training',
    description: 'Complete the counterfeit detection module and ace the quiz with 90%+ accuracy.',
    type: 'skills',
    xpReward: 250,
    participants: 421,
    startDate: '2026-03-09',
    endDate: '2026-03-22',
    active: true,
  },
  {
    id: 'cc_008',
    title: 'Collection Show & Tell',
    description: 'Build a starter collection and share your picks with the community for feedback.',
    type: 'community',
    xpReward: 175,
    participants: 756,
    startDate: '2026-03-09',
    endDate: '2026-03-22',
    active: true,
  },
];

// ---- Mock Data: Progress Tracker ----

const MOCK_PROGRESS_TRACKER: ProgressTracker = {
  level: 1,
  xp: 0,
  totalXp: 0,
  modulesCompleted: 0,
  achievementsUnlocked: 0,
  streakDays: 0,
  joinDate: '2026-03-15',
};

// ---- Level Configuration ----

const LEVEL_CONFIG: { level: number; xpRequired: number; title: string }[] = [
  { level: 1, xpRequired: 0, title: 'Rookie' },
  { level: 2, xpRequired: 200, title: 'Novice' },
  { level: 3, xpRequired: 500, title: 'Apprentice' },
  { level: 4, xpRequired: 1000, title: 'Hobbyist' },
  { level: 5, xpRequired: 1750, title: 'Enthusiast' },
  { level: 6, xpRequired: 2750, title: 'Collector' },
  { level: 7, xpRequired: 4000, title: 'Specialist' },
  { level: 8, xpRequired: 5500, title: 'Expert' },
  { level: 9, xpRequired: 7500, title: 'Master' },
  { level: 10, xpRequired: 10000, title: 'Legend' },
];

// ---- Exported Functions ----

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getLearningModules(): LearningModule[] {
  const cached = loadData<LearningModule[]>('learning_modules');
  if (cached) return cached;
  saveData('learning_modules', MOCK_LEARNING_MODULES);
  return MOCK_LEARNING_MODULES;
}

export function getAchievements(): Achievement[] {
  const cached = loadData<Achievement[]>('achievements');
  if (cached) return cached;
  saveData('achievements', MOCK_ACHIEVEMENTS);
  return MOCK_ACHIEVEMENTS;
}

export function getStarterCollections(): StarterCollection[] {
  const cached = loadData<StarterCollection[]>('starter_collections');
  if (cached) return cached;
  saveData('starter_collections', MOCK_STARTER_COLLECTIONS);
  return MOCK_STARTER_COLLECTIONS;
}

export function getGlossaryTerms(): GlossaryTerm[] {
  const cached = loadData<GlossaryTerm[]>('glossary_terms');
  if (cached) return cached;
  saveData('glossary_terms', MOCK_GLOSSARY_TERMS);
  return MOCK_GLOSSARY_TERMS;
}

export function getMentorProfiles(): MentorProfile[] {
  const cached = loadData<MentorProfile[]>('mentor_profiles');
  if (cached) return cached;
  saveData('mentor_profiles', MOCK_MENTOR_PROFILES);
  return MOCK_MENTOR_PROFILES;
}

export function getMilestones(): CollectorMilestone[] {
  const cached = loadData<CollectorMilestone[]>('milestones');
  if (cached) return cached;
  saveData('milestones', MOCK_MILESTONES);
  return MOCK_MILESTONES;
}

export function getSafetyTips(): SafetyTip[] {
  const cached = loadData<SafetyTip[]>('safety_tips');
  if (cached) return cached;
  saveData('safety_tips', MOCK_SAFETY_TIPS);
  return MOCK_SAFETY_TIPS;
}

export function getBudgetPlans(): BudgetPlan[] {
  const cached = loadData<BudgetPlan[]>('budget_plans');
  if (cached) return cached;
  saveData('budget_plans', MOCK_BUDGET_PLANS);
  return MOCK_BUDGET_PLANS;
}

export function getQuizQuestions(): QuizQuestion[] {
  const cached = loadData<QuizQuestion[]>('quiz_questions');
  if (cached) return cached;
  saveData('quiz_questions', MOCK_QUIZ_QUESTIONS);
  return MOCK_QUIZ_QUESTIONS;
}

export function getProgressTracker(): ProgressTracker {
  const cached = loadData<ProgressTracker>('progress_tracker');
  if (cached) return cached;
  saveData('progress_tracker', MOCK_PROGRESS_TRACKER);
  return MOCK_PROGRESS_TRACKER;
}

export function getCommunityChallengers(): CommunityChallenge[] {
  const cached = loadData<CommunityChallenge[]>('community_challenges');
  if (cached) return cached;
  saveData('community_challenges', MOCK_COMMUNITY_CHALLENGES);
  return MOCK_COMMUNITY_CHALLENGES;
}

export function updateProgress(xpGained: number, moduleCompleted?: boolean, achievementUnlocked?: boolean): ProgressTracker {
  const tracker = getProgressTracker();
  tracker.xp += xpGained;
  tracker.totalXp += xpGained;
  if (moduleCompleted) {
    tracker.modulesCompleted += 1;
  }
  if (achievementUnlocked) {
    tracker.achievementsUnlocked += 1;
  }
  const newLevel = calculateLevel(tracker.totalXp);
  tracker.level = newLevel;
  saveData('progress_tracker', tracker);
  return tracker;
}

export function calculateLevel(totalXp: number): number {
  let level = 1;
  for (const config of LEVEL_CONFIG) {
    if (totalXp >= config.xpRequired) {
      level = config.level;
    } else {
      break;
    }
  }
  return level;
}

export function getNextAchievement(): Achievement | null {
  const achievements = getAchievements();
  const nextLocked = achievements.find((a) => !a.unlocked);
  return nextLocked || null;
}

export function getLevelConfig(): { level: number; xpRequired: number; title: string }[] {
  return LEVEL_CONFIG;
}
