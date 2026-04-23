// @ts-nocheck
// Phase 144: Youth & Next-Gen Collector Onboarding Platform
// Educational content, starter collections, glossary, achievements, and mentorship matching

// ---- Types ----

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  level: SkillLevel;
  estimatedMinutes: number;
  xpReward: number;
  category: string;
  order: number;
  completed: boolean;
  topics: string[];
  iconEmoji: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpValue: number;
  iconEmoji: string;
  unlocked: boolean;
  unlockedDate?: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface StarterCollection {
  id: string;
  name: string;
  description: string;
  budget: number;
  cardCount: number;
  sport: string;
  difficulty: SkillLevel;
  cards: { name: string; estimatedPrice: number; reason: string }[];
  tips: string[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  example?: string;
  relatedTerms: string[];
  category: string;
}

export interface MentorProfile {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  experience: string;
  rating: number;
  menteeCount: number;
  available: boolean;
  bio: string;
  responseTime: string;
}

export interface CollectorMilestone {
  id: string;
  title: string;
  description: string;
  xpRequired: number;
  reward: string;
  completed: boolean;
  order: number;
}

export interface SafetyTip {
  id: string;
  title: string;
  description: string;
  category: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface BudgetPlan {
  id: string;
  name: string;
  monthlyBudget: number;
  ageRange: string;
  allocation: { category: string; percentage: number; amount: number }[];
  tips: string[];
  savingsGoal: number;
}

export interface QuizQuestion {
  id: string;
  moduleId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

export interface ProgressTracker {
  totalXp: number;
  level: number;
  levelName: string;
  xpToNextLevel: number;
  modulesCompleted: number;
  totalModules: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  streak: number;
  lastActive: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  participants: number;
  deadline: string;
  difficulty: SkillLevel;
  status: 'active' | 'upcoming' | 'completed';
  tasks: string[];
}

// ---- Constants ----

const STORAGE_KEY = 'msi_youth_onboarding';

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, name: 'Rookie Collector' },
  { level: 2, xp: 200, name: 'Card Spotter' },
  { level: 3, xp: 500, name: 'Pack Opener' },
  { level: 4, xp: 1000, name: 'Set Builder' },
  { level: 5, xp: 2000, name: 'Grade Hunter' },
  { level: 6, xp: 3500, name: 'Market Scout' },
  { level: 7, xp: 5500, name: 'Collection Curator' },
  { level: 8, xp: 8000, name: 'Trading Pro' },
  { level: 9, xp: 12000, name: 'Hobby Veteran' },
  { level: 10, xp: 18000, name: 'Master Collector' },
];

// ---- Mock Data: 12 Learning Modules ----

const MOCK_LEARNING_MODULES: LearningModule[] = [
  { id: 'mod-001', title: 'What Are Trading Cards?', description: 'Discover the world of sports trading cards, from their history to how they are made and why people collect them.', level: 'beginner', estimatedMinutes: 15, xpReward: 50, category: 'Fundamentals', order: 1, completed: true, topics: ['Card history', 'Types of cards', 'Why people collect', 'Major sports covered'], iconEmoji: '🃏' },
  { id: 'mod-002', title: 'Understanding Card Grades', description: 'Learn what card grading is, why it matters, and how companies like PSA, BGS, and SGC assess card condition.', level: 'beginner', estimatedMinutes: 20, xpReward: 75, category: 'Grading', order: 2, completed: true, topics: ['What is grading', 'PSA vs BGS vs SGC', 'Grade scale explained', 'When to grade'], iconEmoji: '🔍' },
  { id: 'mod-003', title: 'Building Your First Collection', description: 'Step-by-step guide to starting your card collection on any budget. Learn what to buy first and how to organize.', level: 'beginner', estimatedMinutes: 25, xpReward: 100, category: 'Collecting', order: 3, completed: true, topics: ['Setting a budget', 'Choosing your focus', 'Where to buy', 'Storage basics'], iconEmoji: '📦' },
  { id: 'mod-004', title: 'Spotting Fakes & Counterfeits', description: 'Protect yourself by learning how to identify fake cards, trimmed cards, and other common scams in the hobby.', level: 'intermediate', estimatedMinutes: 30, xpReward: 125, category: 'Safety', order: 4, completed: false, topics: ['Common red flags', 'Fake auto detection', 'Trimmed card signs', 'Reputable sellers'], iconEmoji: '🛡️' },
  { id: 'mod-005', title: 'Smart Buying Strategies', description: 'Learn where and when to buy cards for the best deals. Understand market timing, auction strategies, and fair pricing.', level: 'intermediate', estimatedMinutes: 25, xpReward: 100, category: 'Market', order: 5, completed: false, topics: ['Buy low sell high', 'Auction tips', 'eBay best practices', 'Local card shows'], iconEmoji: '💡' },
  { id: 'mod-006', title: 'Card Care 101', description: 'Keep your cards in pristine condition with proper handling, storage, and display techniques.', level: 'beginner', estimatedMinutes: 15, xpReward: 50, category: 'Care', order: 6, completed: false, topics: ['Penny sleeves & top loaders', 'Handling techniques', 'Temperature & humidity', 'Display options'], iconEmoji: '🧤' },
  { id: 'mod-007', title: 'Market Basics & Card Values', description: 'Understand what makes a card valuable and how to research prices using comps, population reports, and market trends.', level: 'intermediate', estimatedMinutes: 30, xpReward: 125, category: 'Market', order: 7, completed: false, topics: ['Supply and demand', 'Comparable sales', 'Population reports', 'Rookies vs veterans'], iconEmoji: '📊' },
  { id: 'mod-008', title: 'The Art of Trading', description: 'Master the fundamentals of trading cards with other collectors. Learn etiquette, fair trade evaluation, and building relationships.', level: 'intermediate', estimatedMinutes: 20, xpReward: 100, category: 'Trading', order: 8, completed: false, topics: ['Trade etiquette', 'Evaluating trade offers', 'Online trading safety', 'Building trust'], iconEmoji: '🤝' },
  { id: 'mod-009', title: 'Understanding Parallels & Inserts', description: 'Decode the rainbow of parallel versions, insert sets, short prints, and other variations that make collecting exciting.', level: 'beginner', estimatedMinutes: 20, xpReward: 75, category: 'Fundamentals', order: 9, completed: false, topics: ['Base vs parallel', 'Numbered cards', 'Insert sets', 'Short prints & SSPs'], iconEmoji: '🌈' },
  { id: 'mod-010', title: 'Breaking & Box Opening', description: 'Learn about hobby boxes, retail boxes, and group breaks. Understand odds, expected value, and responsible opening.', level: 'intermediate', estimatedMinutes: 25, xpReward: 100, category: 'Collecting', order: 10, completed: false, topics: ['Box types explained', 'Understanding odds', 'Group breaks', 'Expected value'], iconEmoji: '📦' },
  { id: 'mod-011', title: 'Selling Your Cards', description: 'When you are ready to sell, learn the best platforms, pricing strategies, and shipping best practices.', level: 'advanced', estimatedMinutes: 30, xpReward: 150, category: 'Market', order: 11, completed: false, topics: ['eBay selling tips', 'Shipping safely', 'Setting prices', 'Other platforms'], iconEmoji: '💰' },
  { id: 'mod-012', title: 'Long-Term Collecting Strategy', description: 'Build a collection with lasting value. Learn about set building, player investing, and portfolio diversification.', level: 'advanced', estimatedMinutes: 35, xpReward: 175, category: 'Strategy', order: 12, completed: false, topics: ['Set completion', 'Player selection', 'Diversification', 'Patience pays'], iconEmoji: '🎯' },
];

// ---- Mock Achievements (20) ----

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-001', name: 'First Purchase', description: 'Buy your very first trading card', xpValue: 25, iconEmoji: '🛒', unlocked: true, unlockedDate: '2026-01-15', category: 'Collecting', rarity: 'common' },
  { id: 'ach-002', name: 'Grade Guru', description: 'Complete the Understanding Card Grades module', xpValue: 50, iconEmoji: '🎓', unlocked: true, unlockedDate: '2026-01-20', category: 'Learning', rarity: 'common' },
  { id: 'ach-003', name: 'Collection of 10', description: 'Reach 10 cards in your collection', xpValue: 30, iconEmoji: '🔟', unlocked: true, unlockedDate: '2026-02-01', category: 'Collecting', rarity: 'common' },
  { id: 'ach-004', name: 'Collection of 100', description: 'Reach 100 cards in your collection', xpValue: 100, iconEmoji: '💯', unlocked: false, category: 'Collecting', rarity: 'uncommon' },
  { id: 'ach-005', name: 'First Trade', description: 'Complete your first card trade with another collector', xpValue: 50, iconEmoji: '🤝', unlocked: true, unlockedDate: '2026-02-10', category: 'Trading', rarity: 'common' },
  { id: 'ach-006', name: 'Pack Rat', description: 'Open 10 packs of cards', xpValue: 40, iconEmoji: '📦', unlocked: true, unlockedDate: '2026-02-05', category: 'Collecting', rarity: 'common' },
  { id: 'ach-007', name: 'Sharp Eye', description: 'Successfully identify a fake card', xpValue: 75, iconEmoji: '👁️', unlocked: false, category: 'Safety', rarity: 'uncommon' },
  { id: 'ach-008', name: 'Budget Master', description: 'Stay within your monthly budget for 3 consecutive months', xpValue: 100, iconEmoji: '💵', unlocked: false, category: 'Finance', rarity: 'uncommon' },
  { id: 'ach-009', name: 'Rookie Hunter', description: 'Collect 5 different rookie cards', xpValue: 60, iconEmoji: '⭐', unlocked: true, unlockedDate: '2026-02-15', category: 'Collecting', rarity: 'common' },
  { id: 'ach-010', name: 'Set Builder', description: 'Complete your first card set', xpValue: 200, iconEmoji: '🏆', unlocked: false, category: 'Collecting', rarity: 'rare' },
  { id: 'ach-011', name: 'Quiz Whiz', description: 'Score 100% on any learning module quiz', xpValue: 50, iconEmoji: '🧠', unlocked: true, unlockedDate: '2026-01-22', category: 'Learning', rarity: 'common' },
  { id: 'ach-012', name: 'Show Goer', description: 'Attend your first card show', xpValue: 75, iconEmoji: '🎪', unlocked: false, category: 'Community', rarity: 'uncommon' },
  { id: 'ach-013', name: 'Grading Pro', description: 'Submit your first card for professional grading', xpValue: 100, iconEmoji: '📋', unlocked: false, category: 'Grading', rarity: 'uncommon' },
  { id: 'ach-014', name: 'Mentor Match', description: 'Connect with a mentor for the first time', xpValue: 50, iconEmoji: '🧑‍🏫', unlocked: false, category: 'Community', rarity: 'common' },
  { id: 'ach-015', name: 'Multi-Sport', description: 'Collect cards from 3 different sports', xpValue: 80, iconEmoji: '🏅', unlocked: false, category: 'Collecting', rarity: 'uncommon' },
  { id: 'ach-016', name: 'Knowledge Seeker', description: 'Complete 5 learning modules', xpValue: 150, iconEmoji: '📚', unlocked: false, category: 'Learning', rarity: 'rare' },
  { id: 'ach-017', name: 'Streak Master', description: 'Maintain a 7-day login streak', xpValue: 75, iconEmoji: '🔥', unlocked: false, category: 'Engagement', rarity: 'uncommon' },
  { id: 'ach-018', name: 'Community Star', description: 'Participate in 3 community challenges', xpValue: 120, iconEmoji: '🌟', unlocked: false, category: 'Community', rarity: 'rare' },
  { id: 'ach-019', name: 'Vintage Explorer', description: 'Add a card from before 2000 to your collection', xpValue: 80, iconEmoji: '🏛️', unlocked: false, category: 'Collecting', rarity: 'uncommon' },
  { id: 'ach-020', name: 'Hobby Legend', description: 'Reach Level 10 Master Collector', xpValue: 500, iconEmoji: '👑', unlocked: false, category: 'Milestone', rarity: 'legendary' },
];

// ---- Mock Starter Collections (6) ----

const MOCK_STARTER_COLLECTIONS: StarterCollection[] = [
  { id: 'sc-001', name: 'Budget Starter', description: 'The perfect entry point for new collectors. Focuses on affordable base cards and a few parallels.', budget: 50, cardCount: 25, sport: 'Multi-Sport', difficulty: 'beginner', cards: [{ name: '2024 Topps Series 1 Hobby Pack (x3)', estimatedPrice: 9, reason: 'Great way to experience pack opening with quality base cards' }, { name: 'Rookie card lot (10 random rookies)', estimatedPrice: 8, reason: 'Rookies are the building blocks of any collection' }, { name: 'Team set of your favorite team', estimatedPrice: 5, reason: 'Personal connection makes collecting fun' }, { name: 'Top loader + penny sleeve combo (50 ct)', estimatedPrice: 6, reason: 'Protect your best pulls immediately' }, { name: 'Single hobby pack Panini Prizm', estimatedPrice: 12, reason: 'Experience the popular Prizm brand' }, { name: 'Card storage box (200 ct)', estimatedPrice: 3, reason: 'Keep your growing collection organized' }, { name: 'Bargain bin star cards (5 cards)', estimatedPrice: 7, reason: 'Get recognizable names at discount prices' }], tips: ['Start with one sport you love', 'Do not chase expensive cards right away', 'Trade duplicates with friends', 'Keep your cards organized from day one'] },
  { id: 'sc-002', name: 'Sport Focus', description: 'Dive deep into one sport with a curated mix of base, rookies, and one graded card.', budget: 100, cardCount: 30, sport: 'Baseball', difficulty: 'beginner', cards: [{ name: '2024 Topps Chrome Hobby Pack (x2)', estimatedPrice: 20, reason: 'Chrome cards are iconic and hold value better than base' }, { name: 'PSA 8 vintage common (1970s-80s)', estimatedPrice: 15, reason: 'Your first graded card teaches you about the grading scale' }, { name: 'Current star base card lot (10 cards)', estimatedPrice: 12, reason: 'Build a foundation of current star players' }, { name: 'Rookie card of a top prospect', estimatedPrice: 18, reason: 'Investment in an up-and-coming player' }, { name: 'Insert/parallel lot (5 cards)', estimatedPrice: 10, reason: 'Learn to identify different card types' }, { name: 'Complete team set', estimatedPrice: 8, reason: 'Satisfaction of having a complete set' }, { name: 'Premium card sleeves & top loaders', estimatedPrice: 8, reason: 'Proper protection is essential' }, { name: 'Binder with 9-pocket pages', estimatedPrice: 9, reason: 'Display and organize your collection beautifully' }], tips: ['Learn the top rookies each year', 'Follow your team closely', 'Compare prices across multiple platforms', 'Start a want list'] },
  { id: 'sc-003', name: 'Graded Beginning', description: 'Start with professionally graded cards to learn about condition and long-term value.', budget: 200, cardCount: 8, sport: 'Multi-Sport', difficulty: 'intermediate', cards: [{ name: 'PSA 9 modern rookie card', estimatedPrice: 45, reason: 'A high-grade rookie is the cornerstone of any collection' }, { name: 'BGS 9.5 parallel card', estimatedPrice: 35, reason: 'Experience the BGS grading standard' }, { name: 'SGC graded vintage card (1980s)', estimatedPrice: 25, reason: 'SGC offers affordable vintage options' }, { name: 'PSA 10 base card of a star', estimatedPrice: 30, reason: 'See what perfection looks like in grading' }, { name: 'CGC graded card', estimatedPrice: 20, reason: 'Explore a newer grading company' }, { name: 'Raw card to submit for grading', estimatedPrice: 15, reason: 'Experience the grading submission process' }, { name: 'Grading submission fee (1 card)', estimatedPrice: 20, reason: 'Learn the process firsthand' }, { name: 'One-touch magnetic holders (5 ct)', estimatedPrice: 10, reason: 'Premium display for your graded cards' }], tips: ['Compare grades across companies', 'Learn sub-grade breakdowns for BGS', 'Centering is the most common issue', 'Start with economy grading tiers to save money'] },
  { id: 'sc-004', name: 'Vintage Explorer', description: 'Travel back in time with affordable vintage cards from the 1960s through 1990s.', budget: 150, cardCount: 15, sport: 'Baseball', difficulty: 'intermediate', cards: [{ name: '1980s Topps star card (ungraded)', estimatedPrice: 12, reason: 'Affordable stars from the junk wax era' }, { name: '1970s Topps common lot (10 cards)', estimatedPrice: 20, reason: 'Feel the history in your hands' }, { name: '1990 Topps Frank Thomas RC', estimatedPrice: 15, reason: 'Iconic rookie card at an accessible price' }, { name: '1987 Topps Barry Bonds RC', estimatedPrice: 10, reason: 'Controversial but historically significant' }, { name: '1989 Upper Deck Ken Griffey Jr RC', estimatedPrice: 25, reason: 'The card that changed the hobby' }, { name: '1960s Topps card (fair condition)', estimatedPrice: 18, reason: 'Your first true vintage piece' }, { name: '1993 SP Derek Jeter RC', estimatedPrice: 30, reason: 'A modern vintage classic' }, { name: 'Vintage card storage supplies', estimatedPrice: 8, reason: 'Older cards need gentle handling' }, { name: 'Price guide or Beckett issue', estimatedPrice: 12, reason: 'Learn to research vintage values' }], tips: ['Condition is everything with vintage', 'Learn about different Topps series by year', 'Junk wax era cards are great entry points', 'Handle vintage cards with clean dry hands'] },
  { id: 'sc-005', name: 'Modern Rookie', description: 'Focus on current rookies and prospects with the best chance of future appreciation.', budget: 100, cardCount: 12, sport: 'Football', difficulty: 'beginner', cards: [{ name: 'Top QB rookie base card', estimatedPrice: 15, reason: 'QBs drive the football card market' }, { name: 'Panini Prizm Silver rookie', estimatedPrice: 20, reason: 'Silver Prizms are the standard for football cards' }, { name: 'Donruss Rated Rookie lot (3 cards)', estimatedPrice: 8, reason: 'Rated Rookies are an iconic insert' }, { name: 'Select Concourse rookie', estimatedPrice: 12, reason: 'Select tiers teach you about product lines' }, { name: 'Optic Rated Rookie', estimatedPrice: 10, reason: 'The chrome version of Donruss' }, { name: 'Mosaic rookie card', estimatedPrice: 8, reason: 'Beautiful designs at a fair price' }, { name: 'Contenders rookie ticket', estimatedPrice: 12, reason: 'Contenders is key for football collectors' }, { name: 'Card supplies and storage', estimatedPrice: 15, reason: 'Protect your investments from day one' }], tips: ['Draft picks cards drop when pro versions release', 'Wait for prices to settle before buying rookies', 'Focus on skill positions in football', 'Track player performance throughout the season'] },
  { id: 'sc-006', name: 'Multi-Sport Sampler', description: 'Sample cards from baseball, basketball, football, and hockey to find your niche.', budget: 175, cardCount: 20, sport: 'Multi-Sport', difficulty: 'beginner', cards: [{ name: 'Topps Baseball hobby pack', estimatedPrice: 15, reason: 'Americas pastime and the original card hobby' }, { name: 'Panini Prizm Basketball pack', estimatedPrice: 20, reason: 'Basketball cards are the hottest market right now' }, { name: 'Donruss Football blaster box', estimatedPrice: 25, reason: 'Good value for football card variety' }, { name: 'Upper Deck Hockey pack', estimatedPrice: 12, reason: 'Hockey has a passionate collector community' }, { name: 'Baseball star card', estimatedPrice: 15, reason: 'An anchor card for your baseball section' }, { name: 'Basketball rookie card', estimatedPrice: 20, reason: 'NBA rookies are always exciting' }, { name: 'Football parallel card', estimatedPrice: 12, reason: 'Experience the rainbow of parallels' }, { name: 'Hockey Young Guns RC', estimatedPrice: 18, reason: 'The most popular hockey insert set' }, { name: 'Multi-sport storage solution', estimatedPrice: 15, reason: 'Organize by sport from the start' }, { name: 'Card sleeves and top loaders', estimatedPrice: 8, reason: 'Essential supplies for any collector' }, { name: 'Hobby magazine or guide', estimatedPrice: 15, reason: 'Stay informed across all sports' }], tips: ['Try each sport before committing to one', 'Basketball and football cards tend to be most expensive', 'Hockey offers great value for collectors on a budget', 'Baseball has the deepest history and most sets'] },
];

// ---- Mock Glossary (40 terms) ----

const MOCK_GLOSSARY: GlossaryTerm[] = [
  { id: 'gl-001', term: 'Auto', definition: 'Short for autograph. A card that has been signed by the player, either on-card or on a sticker applied to the card.', example: 'I pulled a Jaylen Brown auto from a Prizm box!', relatedTerms: ['On-Card Auto', 'Sticker Auto', 'Hard-Signed'], category: 'Card Types' },
  { id: 'gl-002', term: 'Base Card', definition: 'The standard, most common version of a card in a set. These make up the majority of cards produced.', example: 'Base cards are numbered in the main set checklist.', relatedTerms: ['Parallel', 'Insert', 'Short Print'], category: 'Card Types' },
  { id: 'gl-003', term: 'BGS', definition: 'Beckett Grading Services. One of the major card grading companies known for sub-grades in centering, corners, edges, and surface.', relatedTerms: ['PSA', 'SGC', 'CGC'], category: 'Grading' },
  { id: 'gl-004', term: 'Blaster Box', definition: 'A retail box of cards typically sold at stores like Walmart and Target, usually containing 6-8 packs.', example: 'I grabbed a Topps blaster at Target for $25.', relatedTerms: ['Hobby Box', 'Hanger Box', 'Fat Pack'], category: 'Products' },
  { id: 'gl-005', term: 'Break', definition: 'A group buying event where one person opens boxes and distributes cards to participants who bought spots.', example: 'I joined a Prizm case break and got the Lakers.', relatedTerms: ['Random Team', 'Pick Your Team', 'Hit Draft'], category: 'Buying' },
  { id: 'gl-006', term: 'Centering', definition: 'How well-centered the image is on the card. Poor centering reduces the grade. Measured as a ratio like 60/40.', relatedTerms: ['Grade', 'Surface', 'Corners', 'Edges'], category: 'Grading' },
  { id: 'gl-007', term: 'Chrome', definition: 'A type of card stock with a shiny, chromium finish. Topps Chrome and Bowman Chrome are popular examples.', example: 'Chrome cards have a distinct shine and feel compared to paper cards.', relatedTerms: ['Refractor', 'Paper', 'Base'], category: 'Card Types' },
  { id: 'gl-008', term: 'Comp', definition: 'Short for comparable sale. A recently sold listing used to determine a cards fair market value.', example: 'The last comp for this card was $45 on eBay.', relatedTerms: ['FMV', 'Last Sold', 'Market Value'], category: 'Market' },
  { id: 'gl-009', term: 'Ding', definition: 'A small dent or imperfection on the surface or edge of a card that can lower its grade.', relatedTerms: ['Corner Wear', 'Surface Scratch', 'Crease'], category: 'Condition' },
  { id: 'gl-010', term: 'Error Card', definition: 'A card with a printing mistake such as wrong stats, misspelled name, or incorrect photo. Some errors are valuable.', example: 'The 1989 Fleer Bill Ripken error card is famous.', relatedTerms: ['Variation', 'Corrected', 'SP'], category: 'Card Types' },
  { id: 'gl-011', term: 'FMV', definition: 'Fair Market Value. The price a card would reasonably sell for based on recent comparable sales.', relatedTerms: ['Comp', 'Book Value', 'Market Price'], category: 'Market' },
  { id: 'gl-012', term: 'Gem Mint', definition: 'The highest or near-highest grade a card can receive, typically PSA 10 or BGS 9.5. Indicates near-perfect condition.', relatedTerms: ['PSA 10', 'BGS 9.5', 'Pristine'], category: 'Grading' },
  { id: 'gl-013', term: 'Hobby Box', definition: 'A box of cards sold through card shops and hobby dealers, typically with guaranteed hits like autos or relics.', example: 'Hobby boxes are more expensive but guarantee autographs.', relatedTerms: ['Blaster Box', 'Jumbo Box', 'Super Box'], category: 'Products' },
  { id: 'gl-014', term: 'Insert', definition: 'A special card that is not part of the base set, often with unique designs and lower print runs.', example: 'I pulled a Stained Glass insert from my Prizm box!', relatedTerms: ['Base Card', 'Parallel', 'Chase Card'], category: 'Card Types' },
  { id: 'gl-015', term: 'Junk Wax Era', definition: 'The period from roughly 1987-1993 when cards were massively overproduced, making most base cards nearly worthless.', example: '1989 Donruss and 1990 Fleer are classic junk wax products.', relatedTerms: ['Overproduction', 'Vintage', 'Modern'], category: 'History' },
  { id: 'gl-016', term: 'Lot', definition: 'A group of cards sold together as a single listing, often themed by player, team, or set.', relatedTerms: ['Bundle', 'Collection', 'Bulk'], category: 'Buying' },
  { id: 'gl-017', term: 'Numbered', definition: 'A card with a specific serial number printed on it, indicating limited production. Written as /99, /50, etc.', example: 'This Gold parallel is numbered /50, meaning only 50 exist.', relatedTerms: ['Limited Edition', 'Print Run', 'Parallel'], category: 'Card Types' },
  { id: 'gl-018', term: 'One-of-One (1/1)', definition: 'A card that is the only one of its kind in existence. The most sought-after parallel level.', example: 'I pulled a 1/1 Superfractor from Topps Chrome!', relatedTerms: ['Numbered', 'Superfractor', 'Printing Plate'], category: 'Card Types' },
  { id: 'gl-019', term: 'Parallel', definition: 'A version of a base card with a different color, pattern, or finish. Parallels come in varying degrees of rarity.', example: 'The Silver Prizm is the most popular parallel in Prizm basketball.', relatedTerms: ['Base Card', 'Refractor', 'Numbered'], category: 'Card Types' },
  { id: 'gl-020', term: 'Patch Card', definition: 'A card containing a piece of game-worn or player-worn jersey material, often showing part of a team logo or number.', relatedTerms: ['Relic', 'Game-Used', 'Memorabilia'], category: 'Card Types' },
  { id: 'gl-021', term: 'Penny Sleeve', definition: 'A thin, inexpensive plastic sleeve used as the first layer of protection for a card.', relatedTerms: ['Top Loader', 'One-Touch', 'Card Saver'], category: 'Supplies' },
  { id: 'gl-022', term: 'Pop Report', definition: 'Population report showing how many cards of a specific type have been graded at each grade level by a grading company.', example: 'The PSA pop report shows only 5 copies of this card exist in PSA 10.', relatedTerms: ['Census', 'Registry', 'Scarcity'], category: 'Grading' },
  { id: 'gl-023', term: 'PSA', definition: 'Professional Sports Authenticator. The most widely recognized and used card grading service.', relatedTerms: ['BGS', 'SGC', 'CGC'], category: 'Grading' },
  { id: 'gl-024', term: 'RC', definition: 'Rookie Card. A players first officially licensed trading card, typically the most valuable card of that player.', example: 'The 2018 Topps Update Juan Soto RC is a key modern card.', relatedTerms: ['Prospect', '1st Bowman', 'Rated Rookie'], category: 'Card Types' },
  { id: 'gl-025', term: 'Refractor', definition: 'A type of parallel with a rainbow-like reflective surface, most commonly associated with Topps Chrome products.', example: 'Refractors catch the light differently at every angle.', relatedTerms: ['Chrome', 'Parallel', 'Prizm'], category: 'Card Types' },
  { id: 'gl-026', term: 'Relic', definition: 'A card containing a piece of memorabilia such as a jersey swatch, bat piece, or other game-used material.', relatedTerms: ['Patch Card', 'Game-Used', 'Memorabilia'], category: 'Card Types' },
  { id: 'gl-027', term: 'SGC', definition: 'Sportscard Guaranty Corporation. A grading company gaining popularity for its attractive tuxedo-style holders.', relatedTerms: ['PSA', 'BGS', 'CGC'], category: 'Grading' },
  { id: 'gl-028', term: 'Short Print (SP)', definition: 'A card produced in smaller quantities than regular base cards, making it more scarce and typically more valuable.', example: 'Image variation SPs in Topps are highly collected.', relatedTerms: ['SSP', 'Base Card', 'Variation'], category: 'Card Types' },
  { id: 'gl-029', term: 'Slab', definition: 'The hard plastic case a card is sealed in after being professionally graded.', example: 'My PSA 10 Jeter is in a perfect slab on my shelf.', relatedTerms: ['Grade', 'Case', 'Holder'], category: 'Grading' },
  { id: 'gl-030', term: 'Top Loader', definition: 'A rigid plastic holder used to protect individual cards. Cards are inserted from the top opening.', relatedTerms: ['Penny Sleeve', 'One-Touch', 'Card Saver'], category: 'Supplies' },
  { id: 'gl-031', term: 'Trimmed', definition: 'A card that has been illegally cut or altered to improve its appearance, especially centering. This is fraud.', relatedTerms: ['Altered', 'Counterfeit', 'Fake'], category: 'Safety' },
  { id: 'gl-032', term: 'Variation', definition: 'An alternate version of a card with a different image, design, or detail from the standard version.', example: 'Photo variation short prints can be very valuable.', relatedTerms: ['SP', 'SSP', 'Error Card'], category: 'Card Types' },
  { id: 'gl-033', term: 'Wax', definition: 'Originally referred to wax-sealed packs. Now used as a general term for sealed card product.', example: 'Are you ripping wax this weekend?', relatedTerms: ['Pack', 'Box', 'Sealed'], category: 'Products' },
  { id: 'gl-034', term: 'Young Guns', definition: 'Upper Deck hockey rookie card subset. The most popular and collected hockey rookie cards.', example: 'Connor McDavid Young Guns is worth over $200 in PSA 10.', relatedTerms: ['RC', 'Rookie', 'Upper Deck'], category: 'Card Types' },
  { id: 'gl-035', term: 'Case Hit', definition: 'An extremely rare card that statistically appears only once per sealed case of boxes.', relatedTerms: ['Box Hit', 'Odds', 'Pull Rate'], category: 'Products' },
  { id: 'gl-036', term: 'Flip', definition: 'Buying a card to quickly resell at a profit. Short-term card trading for financial gain.', example: 'I flipped that rookie for a $20 profit same day.', relatedTerms: ['Invest', 'Hold', 'Sell'], category: 'Market' },
  { id: 'gl-037', term: 'Graded', definition: 'A card that has been professionally evaluated and encased by a grading company with a numerical score.', relatedTerms: ['Raw', 'Slab', 'Grade'], category: 'Grading' },
  { id: 'gl-038', term: 'Hit', definition: 'A valuable or notable card pulled from a pack, usually an autograph, relic, or low-numbered parallel.', example: 'I got a huge hit — a numbered auto of the top pick!', relatedTerms: ['Pull', 'Chase Card', 'Auto'], category: 'Collecting' },
  { id: 'gl-039', term: 'Raw', definition: 'A card that has not been professionally graded. It is in its original, unencased state.', relatedTerms: ['Graded', 'Ungraded', 'Slab'], category: 'Condition' },
  { id: 'gl-040', term: 'Checklist', definition: 'A complete list of all cards in a set, including base cards, inserts, and parallels.', example: 'Check the checklist to see if your favorite player is in the set.', relatedTerms: ['Set', 'Base Card', 'Insert'], category: 'Products' },
];

// ---- Mock Mentor Profiles (8) ----

const MOCK_MENTORS: MentorProfile[] = [
  { id: 'mnt-001', name: 'Coach Martinez', avatar: 'CM', specialties: ['Baseball', 'Grading', 'Vintage Cards'], experience: '15 years collecting', rating: 4.9, menteeCount: 42, available: true, bio: 'Former card shop owner who loves helping new collectors find their passion. Specializes in vintage baseball from the 1950s to 1980s.', responseTime: 'Within 2 hours' },
  { id: 'mnt-002', name: 'Sarah K.', avatar: 'SK', specialties: ['Basketball', 'Modern Rookies', 'Market Analysis'], experience: '8 years collecting', rating: 4.8, menteeCount: 28, available: true, bio: 'Full-time basketball card collector and market analyst. Can help you navigate the modern rookie market and identify smart buys.', responseTime: 'Within 4 hours' },
  { id: 'mnt-003', name: 'Mike T.', avatar: 'MT', specialties: ['Football', 'Breaks', 'Budget Collecting'], experience: '10 years collecting', rating: 4.7, menteeCount: 35, available: true, bio: 'Budget-conscious collector who has built an impressive football card collection without breaking the bank. Great at finding deals.', responseTime: 'Within 6 hours' },
  { id: 'mnt-004', name: 'Dr. Cards', avatar: 'DC', specialties: ['Grading', 'Authentication', 'Fake Detection'], experience: '20 years collecting', rating: 5.0, menteeCount: 56, available: false, bio: 'Card authentication expert who has examined over 50,000 cards. Can teach you every trick for spotting fakes and altered cards.', responseTime: 'Within 24 hours' },
  { id: 'mnt-005', name: 'Jenny L.', avatar: 'JL', specialties: ['Hockey', 'Set Building', 'Young Guns'], experience: '6 years collecting', rating: 4.6, menteeCount: 18, available: true, bio: 'Hockey card enthusiast and completionist who has built over 20 full sets. Passionate about helping young collectors find hockey gems.', responseTime: 'Within 3 hours' },
  { id: 'mnt-006', name: 'The Card Dad', avatar: 'CD', specialties: ['Family Collecting', 'Budget Plans', 'Teaching Kids'], experience: '12 years collecting', rating: 4.9, menteeCount: 64, available: true, bio: 'Father of three who introduced all his kids to the hobby. Expert at making collecting fun, educational, and budget-friendly for families.', responseTime: 'Within 1 hour' },
  { id: 'mnt-007', name: 'Alex R.', avatar: 'AR', specialties: ['Trading', 'Online Safety', 'Community Building'], experience: '7 years collecting', rating: 4.5, menteeCount: 22, available: true, bio: 'Online trading specialist who can teach safe buying and selling practices. Runs a collector community with over 2,000 members.', responseTime: 'Within 4 hours' },
  { id: 'mnt-008', name: 'Vintage Vic', avatar: 'VV', specialties: ['Pre-War Cards', 'Tobacco Cards', 'Card History'], experience: '25 years collecting', rating: 4.8, menteeCount: 31, available: false, bio: 'The ultimate historian of the card hobby. Specializes in pre-war and tobacco era cards, and loves sharing the stories behind the cardboard.', responseTime: 'Within 12 hours' },
];

// ---- Mock Safety Tips (10) ----

const MOCK_SAFETY_TIPS: SafetyTip[] = [
  { id: 'st-001', title: 'Never Share Personal Information', description: 'Do not share your home address, school name, phone number, or full name with strangers online when trading or buying cards.', category: 'Online Safety', importance: 'critical' },
  { id: 'st-002', title: 'Always Use Protected Payment Methods', description: 'When buying online, use PayPal Goods & Services or credit cards that offer buyer protection. Never send cash, Zelle, or Venmo to strangers.', category: 'Financial Safety', importance: 'critical' },
  { id: 'st-003', title: 'Get a Parent or Guardian Involved', description: 'For any purchase over $20 or any in-person meetup to buy or trade cards, have a trusted adult present.', category: 'Personal Safety', importance: 'critical' },
  { id: 'st-004', title: 'Research Before You Buy', description: 'Always check recent sold listings on eBay before paying for a card. Asking prices are not real prices — only sold prices matter.', category: 'Financial Safety', importance: 'high' },
  { id: 'st-005', title: 'Beware of Too-Good-to-Be-True Deals', description: 'If someone offers a card far below market value, it is likely a scam or the card is fake. Trust your instincts and walk away.', category: 'Scam Prevention', importance: 'high' },
  { id: 'st-006', title: 'Verify Graded Card Cert Numbers', description: 'Before buying any graded card, look up the certification number on the grading company website to confirm it matches the card.', category: 'Authentication', importance: 'high' },
  { id: 'st-007', title: 'Set a Monthly Budget and Stick to It', description: 'Decide how much you can afford to spend each month on cards and do not exceed it, no matter how tempting a purchase might be.', category: 'Financial Safety', importance: 'high' },
  { id: 'st-008', title: 'Meet in Public Places for Local Trades', description: 'If meeting someone locally to trade or buy cards, always meet in a public place like a card shop, library, or police station parking lot.', category: 'Personal Safety', importance: 'critical' },
  { id: 'st-009', title: 'Keep Records of All Purchases', description: 'Track what you buy, what you paid, and where you bought it. This helps with budgeting, insurance, and resolving any disputes.', category: 'Financial Safety', importance: 'medium' },
  { id: 'st-010', title: 'Be Skeptical of Social Media Sellers', description: 'Instagram and TikTok sellers may not have return policies or buyer protections. Prefer established platforms with built-in safeguards.', category: 'Scam Prevention', importance: 'high' },
];

// ---- Mock Budget Plans (5) ----

const MOCK_BUDGET_PLANS: BudgetPlan[] = [
  { id: 'bp-001', name: 'Allowance Saver', monthlyBudget: 20, ageRange: '8-12', allocation: [{ category: 'Pack Opening', percentage: 40, amount: 8 }, { category: 'Single Cards', percentage: 30, amount: 6 }, { category: 'Supplies', percentage: 15, amount: 3 }, { category: 'Savings', percentage: 15, amount: 3 }], tips: ['Save for 2-3 months to buy something special', 'Trade duplicates instead of buying new packs', 'Ask for cards as birthday or holiday gifts'], savingsGoal: 50 },
  { id: 'bp-002', name: 'Part-Time Collector', monthlyBudget: 50, ageRange: '13-16', allocation: [{ category: 'Single Cards', percentage: 40, amount: 20 }, { category: 'Sealed Product', percentage: 25, amount: 12.50 }, { category: 'Grading Fund', percentage: 15, amount: 7.50 }, { category: 'Supplies', percentage: 10, amount: 5 }, { category: 'Savings', percentage: 10, amount: 5 }], tips: ['Focus on targeted singles over random packs', 'Save grading fund for 3 months then submit', 'Track your spending weekly'], savingsGoal: 150 },
  { id: 'bp-003', name: 'Serious Student', monthlyBudget: 100, ageRange: '16-18', allocation: [{ category: 'Investment Singles', percentage: 35, amount: 35 }, { category: 'Hobby Boxes', percentage: 25, amount: 25 }, { category: 'Grading Submissions', percentage: 15, amount: 15 }, { category: 'Card Shows', percentage: 10, amount: 10 }, { category: 'Supplies', percentage: 5, amount: 5 }, { category: 'Emergency/Savings', percentage: 10, amount: 10 }], tips: ['Reinvest profits from sales', 'Attend local card shows for deals', 'Build relationships with local card shop owners'], savingsGoal: 300 },
  { id: 'bp-004', name: 'Family Fun', monthlyBudget: 75, ageRange: 'Family', allocation: [{ category: 'Family Pack Opening', percentage: 35, amount: 26.25 }, { category: 'Kids Individual Cards', percentage: 25, amount: 18.75 }, { category: 'Parent Cards', percentage: 20, amount: 15 }, { category: 'Supplies', percentage: 10, amount: 7.50 }, { category: 'Show Fund', percentage: 10, amount: 7.50 }], tips: ['Make pack opening a family activity', 'Let kids choose their own cards within budget', 'Visit card shows together as a family outing'], savingsGoal: 200 },
  { id: 'bp-005', name: 'Gift Card Collector', monthlyBudget: 30, ageRange: '10-14', allocation: [{ category: 'Retail Packs', percentage: 50, amount: 15 }, { category: 'Dollar Bin Cards', percentage: 25, amount: 7.50 }, { category: 'Supplies', percentage: 15, amount: 4.50 }, { category: 'Savings Jar', percentage: 10, amount: 3 }], tips: ['Use birthday money and gift cards for special purchases', 'Shop at retail stores for best pack prices', 'The dollar bin at card shops can have hidden gems'], savingsGoal: 75 },
];

// ---- Mock Quiz Questions (15) ----

const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'qq-001', moduleId: 'mod-001', question: 'What are the most commonly collected types of trading cards?', options: ['Greeting cards', 'Sports trading cards', 'Business cards', 'Credit cards'], correctIndex: 1, explanation: 'Sports trading cards featuring athletes from baseball, basketball, football, and hockey are the most commonly collected type of trading card.', xpReward: 10 },
  { id: 'qq-002', moduleId: 'mod-001', question: 'When did modern sports card collecting begin?', options: ['1850s', '1880s-1900s with tobacco cards', '1990s', '2010s'], correctIndex: 1, explanation: 'The earliest sports cards were included in cigarette and tobacco products in the late 1800s, making this the origin of the hobby.', xpReward: 10 },
  { id: 'qq-003', moduleId: 'mod-002', question: 'What does PSA stand for?', options: ['Professional Sports Authenticator', 'Perfect Sports Association', 'Pro Score Agency', 'Player Stats Authority'], correctIndex: 0, explanation: 'PSA stands for Professional Sports Authenticator, the most widely used card grading service in the hobby.', xpReward: 10 },
  { id: 'qq-004', moduleId: 'mod-002', question: 'What is the highest grade a card can receive from PSA?', options: ['PSA 8', 'PSA 9', 'PSA 10 Gem Mint', 'PSA 100'], correctIndex: 2, explanation: 'PSA 10 Gem Mint is the highest grade, indicating the card is in virtually perfect condition.', xpReward: 10 },
  { id: 'qq-005', moduleId: 'mod-003', question: 'What should be your FIRST purchase when starting a collection?', options: ['The most expensive card you can find', 'Card protection supplies', 'A complete set', 'A grading submission'], correctIndex: 1, explanation: 'Card protection supplies like penny sleeves and top loaders should be purchased first so you can protect any cards you acquire.', xpReward: 10 },
  { id: 'qq-006', moduleId: 'mod-004', question: 'What is a common sign that a card might be fake?', options: ['It has a hologram sticker', 'The colors look slightly off or the card feels different', 'It is in a penny sleeve', 'It was bought at a card shop'], correctIndex: 1, explanation: 'Fake cards often have slightly off colors, wrong card stock thickness, or blurry text compared to authentic cards.', xpReward: 15 },
  { id: 'qq-007', moduleId: 'mod-005', question: 'What is the best way to determine a cards fair market value?', options: ['Asking the seller', 'Checking asking prices on eBay', 'Looking at recently SOLD listings on eBay', 'Guessing based on the player'], correctIndex: 2, explanation: 'Only completed/sold listings show what people actually paid for a card. Asking prices can be wildly inflated.', xpReward: 15 },
  { id: 'qq-008', moduleId: 'mod-006', question: 'What is the ideal humidity level for card storage?', options: ['0% - bone dry', '35-45% relative humidity', '75-85% relative humidity', 'Humidity does not matter'], correctIndex: 1, explanation: 'Cards should be stored at 35-45% relative humidity. Too much moisture causes warping and mold, while too dry can cause brittleness.', xpReward: 10 },
  { id: 'qq-009', moduleId: 'mod-007', question: 'Why are rookie cards typically the most valuable cards of a player?', options: ['They are always the rarest', 'They represent the first official card and carry the most nostalgia and demand', 'They are always graded highest', 'They come in the most colors'], correctIndex: 1, explanation: 'Rookie cards are the first official licensed card of a player and carry historical significance, driving the highest demand and prices.', xpReward: 15 },
  { id: 'qq-010', moduleId: 'mod-008', question: 'What is good trading etiquette?', options: ['Always try to win the trade by a lot', 'Be transparent about card condition and aim for fair value on both sides', 'Never show your cards first', 'Only trade with strangers online'], correctIndex: 1, explanation: 'Good trading is about fairness and transparency. Both parties should feel they got a fair deal to build lasting trading relationships.', xpReward: 15 },
  { id: 'qq-011', moduleId: 'mod-009', question: 'What is a parallel card?', options: ['Two identical cards', 'A version of a base card with a different color or finish', 'A card printed sideways', 'A card with two players'], correctIndex: 1, explanation: 'Parallels are alternate versions of base cards featuring different colors, patterns, or finishes, produced in varying quantities.', xpReward: 10 },
  { id: 'qq-012', moduleId: 'mod-010', question: 'What does expected value (EV) mean for a hobby box?', options: ['The expected shipping cost', 'The average total value of cards you would pull based on odds and market prices', 'The retail price', 'How many cards are in the box'], correctIndex: 1, explanation: 'Expected value is the statistical average of what your pulls would be worth based on published odds and current market prices.', xpReward: 15 },
  { id: 'qq-013', moduleId: 'mod-011', question: 'What is the safest way to ship a graded card?', options: ['In a regular envelope with a stamp', 'Wrapped in bubble wrap inside a padded mailer or small box', 'Loose in a large box', 'It does not matter how you ship it'], correctIndex: 1, explanation: 'Graded cards should be wrapped in bubble wrap and shipped in a padded mailer or small box to prevent damage during transit.', xpReward: 15 },
  { id: 'qq-014', moduleId: 'mod-012', question: 'What is diversification in card collecting?', options: ['Buying only one type of card', 'Spreading your collection across different players, sports, and eras to reduce risk', 'Having the most cards possible', 'Only collecting graded cards'], correctIndex: 1, explanation: 'Just like in investing, diversification means spreading your collection across different areas so that a downturn in one area does not destroy your entire value.', xpReward: 20 },
  { id: 'qq-015', moduleId: 'mod-003', question: 'What is the Junk Wax era?', options: ['A period of low card production', 'The 1987-1993 period of massive overproduction that made most cards nearly worthless', 'A type of premium card', 'Cards made from recycled wax'], correctIndex: 1, explanation: 'The Junk Wax Era (1987-1993) saw card companies print billions of cards, so many that most base cards from this period have little to no value today.', xpReward: 10 },
];

// ---- Mock Milestones (10) ----

const MOCK_MILESTONES: CollectorMilestone[] = [
  { id: 'ms-001', title: 'First Steps', description: 'Complete your first learning module', xpRequired: 50, reward: 'Collector Badge', completed: true, order: 1 },
  { id: 'ms-002', title: 'Getting Started', description: 'Reach Level 2 - Card Spotter', xpRequired: 200, reward: 'Card Spotter Title', completed: true, order: 2 },
  { id: 'ms-003', title: 'Knowledge Base', description: 'Complete 3 learning modules', xpRequired: 300, reward: 'Bronze Scholar Badge', completed: true, order: 3 },
  { id: 'ms-004', title: 'Pack Opener', description: 'Reach Level 3', xpRequired: 500, reward: 'Pack Opener Title', completed: false, order: 4 },
  { id: 'ms-005', title: 'Halfway Scholar', description: 'Complete 6 learning modules', xpRequired: 750, reward: 'Silver Scholar Badge', completed: false, order: 5 },
  { id: 'ms-006', title: 'Grade Hunter', description: 'Reach Level 5', xpRequired: 2000, reward: 'Grade Hunter Title', completed: false, order: 6 },
  { id: 'ms-007', title: 'Full Graduate', description: 'Complete all 12 learning modules', xpRequired: 1325, reward: 'Gold Scholar Badge', completed: false, order: 7 },
  { id: 'ms-008', title: 'Achievement Hunter', description: 'Unlock 10 achievements', xpRequired: 1500, reward: 'Achievement Hunter Badge', completed: false, order: 8 },
  { id: 'ms-009', title: 'Hobby Veteran', description: 'Reach Level 9', xpRequired: 12000, reward: 'Veteran Crown', completed: false, order: 9 },
  { id: 'ms-010', title: 'Master Collector', description: 'Reach Level 10 and complete all modules', xpRequired: 18000, reward: 'Master Collector Crown', completed: false, order: 10 },
];

// ---- Mock Community Challenges (8) ----

const MOCK_CHALLENGES: CommunityChallenge[] = [
  { id: 'ch-001', title: 'Rookie Roundup', description: 'Collect 3 rookie cards from the current year and share them with the community.', xpReward: 75, participants: 234, deadline: '2026-04-01', difficulty: 'beginner', status: 'active', tasks: ['Find 3 current year rookie cards', 'Take photos of each card', 'Share in the community feed', 'Explain why you chose each player'] },
  { id: 'ch-002', title: 'Budget Boss Challenge', description: 'Build the best collection you can with only $25. Share your haul and strategy!', xpReward: 100, participants: 189, deadline: '2026-03-31', difficulty: 'beginner', status: 'active', tasks: ['Set a $25 budget', 'Shop for cards', 'Document all purchases', 'Share your collection and total spent'] },
  { id: 'ch-003', title: 'Grade Guesser', description: 'Examine 5 raw cards and predict what grade they would receive. Closest predictions win!', xpReward: 125, participants: 156, deadline: '2026-04-15', difficulty: 'intermediate', status: 'active', tasks: ['Examine 5 provided card images', 'Submit grade predictions for each', 'Explain your reasoning', 'Compare with actual grades when revealed'] },
  { id: 'ch-004', title: 'Card Care Showcase', description: 'Show off your card storage setup and share tips on how you keep your collection safe.', xpReward: 50, participants: 312, deadline: '2026-04-10', difficulty: 'beginner', status: 'active', tasks: ['Photograph your storage setup', 'List all supplies you use', 'Share one unique tip', 'Help critique another collectors setup'] },
  { id: 'ch-005', title: 'Vintage Hunt', description: 'Find and acquire a card from before the year 2000. Share the story of how you found it.', xpReward: 100, participants: 98, deadline: '2026-04-30', difficulty: 'intermediate', status: 'active', tasks: ['Find a pre-2000 card', 'Research its history', 'Share the card and its story', 'Explain what you learned about vintage collecting'] },
  { id: 'ch-006', title: 'Trade Chain', description: 'Complete 3 trades with different collectors in one month. Document each trade and what you learned.', xpReward: 150, participants: 67, deadline: '2026-05-01', difficulty: 'intermediate', status: 'upcoming', tasks: ['Find 3 trading partners', 'Complete each trade', 'Document what you traded and received', 'Share what you learned about negotiation'] },
  { id: 'ch-007', title: 'Set Builder Sprint', description: 'Choose a base set and try to collect as many cards as possible in 30 days. Track your progress.', xpReward: 200, participants: 45, deadline: '2026-05-15', difficulty: 'advanced', status: 'upcoming', tasks: ['Choose a current base set', 'Track cards acquired daily', 'Share progress updates weekly', 'Calculate completion percentage'] },
  { id: 'ch-008', title: 'Glossary Master', description: 'Learn all 40 glossary terms and pass the vocabulary quiz with 90% or better.', xpReward: 100, participants: 278, deadline: '2026-03-25', difficulty: 'beginner', status: 'active', tasks: ['Study all glossary terms', 'Review with flashcard mode', 'Take the vocabulary quiz', 'Score 90% or higher'] },
];

// ---- localStorage Helpers ----

function loadData<T>(key: string): T | null {
  try {
    const raw = store.get(`${STORAGE_KEY}_${key}`, null);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    store.set(`${STORAGE_KEY}_${key}`, data);
  } catch {
    // storage full or unavailable
  }
}

// ---- Helper Functions ----

export function getLevelConfig(level: SkillLevel): { label: string; text: string; bg: string; border: string } {
  const configs: Record<SkillLevel, { label: string; text: string; bg: string; border: string }> = {
    beginner: { label: 'Beginner', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    intermediate: { label: 'Intermediate', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    advanced: { label: 'Advanced', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    expert: { label: 'Expert', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  };
  return configs[level];
}

export function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

export function calculateLevel(xp: number): { level: number; name: string; xpToNext: number; progress: number } {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] ?? { level: 11, xp: current.xp + 5000, name: 'Grandmaster' };
      break;
    }
  }

  const xpInLevel = xp - current.xp;
  const xpNeeded = next.xp - current.xp;
  const progress = xpNeeded > 0 ? Math.min(100, (xpInLevel / xpNeeded) * 100) : 100;

  return { level: current.level, name: current.name, xpToNext: next.xp - xp, progress };
}

// ---- Exported Service Functions ----

export function getLearningModules(level?: SkillLevel): LearningModule[] {
  const cached = loadData<LearningModule[]>('learning_modules');
  const data = cached ?? MOCK_LEARNING_MODULES;
  if (!cached) saveData('learning_modules', data);
  if (level) return data.filter(m => m.level === level);
  return [...data];
}

export function getAchievements(): Achievement[] {
  const cached = loadData<Achievement[]>('achievements');
  const data = cached ?? MOCK_ACHIEVEMENTS;
  if (!cached) saveData('achievements', data);
  return [...data];
}

export function getStarterCollections(): StarterCollection[] {
  const cached = loadData<StarterCollection[]>('starter_collections');
  const data = cached ?? MOCK_STARTER_COLLECTIONS;
  if (!cached) saveData('starter_collections', data);
  return [...data];
}

export function getGlossaryTerms(letter?: string): GlossaryTerm[] {
  const cached = loadData<GlossaryTerm[]>('glossary_terms');
  const data = cached ?? MOCK_GLOSSARY;
  if (!cached) saveData('glossary_terms', data);
  if (letter) return data.filter(t => t.term.charAt(0).toUpperCase() === letter.toUpperCase());
  return [...data].sort((a, b) => a.term.localeCompare(b.term));
}

export function getMentorProfiles(): MentorProfile[] {
  const cached = loadData<MentorProfile[]>('mentors');
  const data = cached ?? MOCK_MENTORS;
  if (!cached) saveData('mentors', data);
  return [...data];
}

export function getMilestones(): CollectorMilestone[] {
  const cached = loadData<CollectorMilestone[]>('milestones');
  const data = cached ?? MOCK_MILESTONES;
  if (!cached) saveData('milestones', data);
  return [...data].sort((a, b) => a.order - b.order);
}

export function getSafetyTips(): SafetyTip[] {
  const cached = loadData<SafetyTip[]>('safety_tips');
  const data = cached ?? MOCK_SAFETY_TIPS;
  if (!cached) saveData('safety_tips', data);
  return [...data];
}

export function getBudgetPlans(): BudgetPlan[] {
  const cached = loadData<BudgetPlan[]>('budget_plans');
  const data = cached ?? MOCK_BUDGET_PLANS;
  if (!cached) saveData('budget_plans', data);
  return [...data];
}

export function getQuizQuestions(moduleId?: string): QuizQuestion[] {
  const cached = loadData<QuizQuestion[]>('quiz_questions');
  const data = cached ?? MOCK_QUIZ_QUESTIONS;
  if (!cached) saveData('quiz_questions', data);
  if (moduleId) return data.filter(q => q.moduleId === moduleId);
  return [...data];
}

export function getProgressTracker(): ProgressTracker {
  const cached = loadData<ProgressTracker>('progress_tracker');
  if (cached) return cached;

  const modules = MOCK_LEARNING_MODULES;
  const achievements = MOCK_ACHIEVEMENTS;
  const completedModules = modules.filter(m => m.completed);
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalXp = completedModules.reduce((sum, m) => sum + m.xpReward, 0) + unlockedAchievements.reduce((sum, a) => sum + a.xpValue, 0);
  const levelInfo = calculateLevel(totalXp);

  const tracker: ProgressTracker = {
    totalXp,
    level: levelInfo.level,
    levelName: levelInfo.name,
    xpToNextLevel: levelInfo.xpToNext,
    modulesCompleted: completedModules.length,
    totalModules: modules.length,
    achievementsUnlocked: unlockedAchievements.length,
    totalAchievements: achievements.length,
    streak: 5,
    lastActive: '2026-03-15',
  };

  saveData('progress_tracker', tracker);
  return tracker;
}

export function getCommunityChallengers(): CommunityChallenge[] {
  const cached = loadData<CommunityChallenge[]>('community_challenges');
  const data = cached ?? MOCK_CHALLENGES;
  if (!cached) saveData('community_challenges', data);
  return [...data];
}

export function updateProgress(moduleId: string, completed: boolean): ProgressTracker {
  const modules = getLearningModules();
  const mod = modules.find(m => m.id === moduleId);
  if (mod) {
    mod.completed = completed;
    saveData('learning_modules', modules);
  }
  const tracker = getProgressTracker();
  if (completed && mod) {
    tracker.totalXp += mod.xpReward;
    tracker.modulesCompleted = modules.filter(m => m.completed).length;
    const levelInfo = calculateLevel(tracker.totalXp);
    tracker.level = levelInfo.level;
    tracker.levelName = levelInfo.name;
    tracker.xpToNextLevel = levelInfo.xpToNext;
    tracker.lastActive = new Date().toISOString().split('T')[0];
    saveData('progress_tracker', tracker);
  }
  return tracker;
}

import { store } from '../dal/syncStore';
export function getNextAchievement(): Achievement | null {
  const achievements = getAchievements();
  return achievements.find(a => !a.unlocked) ?? null;
}
