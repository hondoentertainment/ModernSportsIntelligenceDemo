
import { CardInventory, Sport } from './types.ts';
import { PREPOPULATED_CARDS, PREPOPULATED_SUMMARY, INVENTORY_PLAYERS } from './prepopulatedCards.ts';
export { NAV_ITEMS } from './constants/navItems';

export const LEAGUES: readonly string[] = ['MLB', 'MiLB', 'NBA', 'NFL', 'Other'];
export const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

export const GRADING_COMPANIES = ['PSA', 'BGS', 'SGC', 'CSG', 'HGA', 'Other'];

export const MOCK_CARDS: CardInventory[] = PREPOPULATED_CARDS;

const INITIAL_MOCK_PLAYERS = [
  {
    id: '1',
    name: 'Victor Wembanyama',
    team: 'San Antonio Spurs',
    position: 'Center',
    league: 'NBA',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=300',
    breakoutScore: 94,
    trend: 12,
    intelligenceScore: 98,
    stats: [
      { label: 'PPG', value: '21.4', change: '+3.2' },
      { label: 'RPG', value: '10.6', change: '+1.5' },
      { label: 'BPG', value: '3.6', change: '+0.8' }
    ],
    summary: 'Generational defensive talent with rapidly evolving offensive bag.',
    marketContext: 'Market is pricing in superstardom; current prices reflect long-term potential.'
  },
  {
    id: '2',
    name: 'Tyrese Haliburton',
    team: 'Indiana Pacers',
    position: 'Guard',
    league: 'NBA',
    image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?auto=format&fit=crop&q=80&w=300',
    breakoutScore: 82,
    trend: 5,
    intelligenceScore: 95,
    stats: [
      { label: 'APG', value: '11.7', change: '+2.1' },
      { label: 'PPG', value: '20.1', change: '-1.2' },
      { label: 'TS%', value: '60.5%', change: '+0.5' }
    ],
    summary: 'Elite playmaker whose usage patterns suggest high performance stability.',
    marketContext: 'Strong buy signal for long-term hold collectors.'
  }
];

export const MOCK_PLAYERS = [
  ...INITIAL_MOCK_PLAYERS,
  ...INVENTORY_PLAYERS.filter(p => !INITIAL_MOCK_PLAYERS.some(mp => mp.name.toLowerCase() === p.name.toLowerCase()))
];

export const MOCK_TEAMS = [
  // NBA
  {
    id: 'nba-okc',
    name: 'Oklahoma City Thunder',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Oklahoma_City_Thunder.svg/1200px-Oklahoma_City_Thunder.svg.png',
    league: 'NBA',
    conference: 'Western',
    division: 'Northwest',
    form: 'hot',
    score: 92,
    offense: 96,
    defense: 94,
    summary: 'Elite young core delivering dominant two-way basketball with league-best net rating.',
    momentum: 'up' as const
  },
  {
    id: 'nba-bos',
    name: 'Boston Celtics',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/1200px-Boston_Celtics.svg.png',
    league: 'NBA',
    conference: 'Eastern',
    division: 'Atlantic',
    form: 'hot',
    score: 95,
    offense: 98,
    defense: 92,
    summary: 'Championship-caliber shooting and switching defense making them the team to beat.',
    momentum: 'up' as const
  },
  {
    id: 'nba-den',
    name: 'Denver Nuggets',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/76/Denver_Nuggets.svg/1200px-Denver_Nuggets.svg.png',
    league: 'NBA',
    conference: 'Western',
    division: 'Northwest',
    form: 'variable',
    score: 89,
    offense: 95,
    defense: 88,
    summary: 'Jokic-led offense remains elite but inconsistent defense creates variance.',
    momentum: 'stable' as const
  },
  {
    id: 'nba-min',
    name: 'Minnesota Wolves',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Minnesota_Timberwolves_logo.svg/1200px-Minnesota_Timberwolves_logo.svg.png',
    league: 'NBA',
    conference: 'Western',
    division: 'Northwest',
    form: 'stable',
    score: 91,
    offense: 89,
    defense: 97,
    summary: 'Defensive juggernaut anchored by elite rim protection and perimeter switchability.',
    momentum: 'up' as const
  },
  {
    id: 'nba-lal',
    name: 'LA Lakers',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/1200px-Los_Angeles_Lakers_logo.svg.png',
    league: 'NBA',
    conference: 'Western',
    division: 'Pacific',
    form: 'cold',
    score: 85,
    offense: 91,
    defense: 84,
    summary: 'Star-dependent offense struggling with depth and consistency on the defensive end.',
    momentum: 'down' as const
  },
  {
    id: 'nba-ny',
    name: 'NY Knicks',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/New_York_Knicks_logo.svg/1200px-New_York_Knicks_logo.svg.png',
    league: 'NBA',
    conference: 'Eastern',
    division: 'Atlantic',
    form: 'hot',
    score: 88,
    offense: 90,
    defense: 93,
    summary: 'Physical, defense-first identity with improved offensive versatility.',
    momentum: 'up' as const
  },
  // MLB
  {
    id: 'mlb-lad',
    name: 'LA Dodgers',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Los_Angeles_Dodgers_logo.svg/1200px-Los_Angeles_Dodgers_logo.svg.png',
    league: 'MLB',
    conference: 'National',
    division: 'NL West',
    form: 'hot',
    score: 97,
    offense: 99,
    defense: 91,
    summary: 'Loaded roster with historic offensive depth and deep pitching staff.',
    momentum: 'up' as const
  },
  {
    id: 'mlb-atl',
    name: 'Atlanta Braves',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Atlanta_Braves.svg/1200px-Atlanta_Braves.svg.png',
    league: 'MLB',
    conference: 'National',
    division: 'NL East',
    form: 'stable',
    score: 94,
    offense: 96,
    defense: 93,
    summary: 'Consistent powerhouse with elite farm system feeding major league success.',
    momentum: 'stable' as const
  },
  {
    id: 'mlb-bal',
    name: 'Baltimore Orioles',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/75/Baltimore_Orioles_cap.svg/1200px-Baltimore_Orioles_cap.svg.png',
    league: 'MLB',
    conference: 'American',
    division: 'AL East',
    form: 'hot',
    score: 93,
    offense: 94,
    defense: 90,
    summary: 'Young, exciting roster with top-tier prospect pipeline fueling rapid ascent.',
    momentum: 'up' as const
  },
  {
    id: 'mlb-nyy',
    name: 'NY Yankees',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/New_York_Yankees_logo.svg/1200px-New_York_Yankees_logo.svg.png',
    league: 'MLB',
    conference: 'American',
    division: 'AL East',
    form: 'variable',
    score: 91,
    offense: 95,
    defense: 88,
    summary: 'Power-heavy lineup with rotation questions creating boom-or-bust variance.',
    momentum: 'stable' as const
  },
  {
    id: 'mlb-tex',
    name: 'Texas Rangers',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Texas_Rangers.svg/1200px-Texas_Rangers.svg.png',
    league: 'MLB',
    conference: 'American',
    division: 'AL West',
    form: 'cold',
    score: 86,
    offense: 92,
    defense: 85,
    summary: 'Defending champions facing regression with pitching injuries and lineup changes.',
    momentum: 'down' as const
  },
  {
    id: 'mlb-phi',
    name: 'Philadelphia Phillies',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/Philadelphia_Phillies_Logo.svg/1200px-Philadelphia_Phillies_Logo.svg.png',
    league: 'MLB',
    conference: 'National',
    division: 'NL East',
    form: 'stable',
    score: 90,
    offense: 91,
    defense: 89,
    summary: 'Well-rounded contender with balanced pitching and consistent offensive production.',
    momentum: 'stable' as const
  }
];

export const MOCK_GAMES = [
  {
    id: '1',
    homeTeam: 'NY Knicks',
    awayTeam: 'PHI 76ers',
    homeLogo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=100',
    awayLogo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?auto=format&fit=crop&q=80&w=100',
    time: '7:30 PM EST',
    impactScore: 88,
    preview: 'High-intensity matchup focusing on interior defensive patterns.',
    keyMatchup: 'Brunson vs. Maxey: A battle of high-speed floor generals.',
    swingFactor: 'Bench depth efficiency in the second quarter.'
  }
];

export const MOCK_INVENTORY_SUMMARY = PREPOPULATED_SUMMARY;

/** First five mock rows include at least one graded card so demo UI covers both status branches */
const _gradedDemoCard = PREPOPULATED_CARDS.find((c) => c.isGraded)!;
const MOCK_INVENTORY_CARD_SOURCE = [...PREPOPULATED_CARDS.slice(0, 4), _gradedDemoCard];

export const MOCK_INVENTORY_ITEMS = MOCK_INVENTORY_CARD_SOURCE.map(card => ({
  id: card.id,
  image: card.image,
  cardName: `${card.year} ${card.manufacturer} ${card.player}`,
  status: card.isGraded ? 'Graded' : 'Raw',
  quantity: 1,
  marketValue: card.currentValue,
  purchasePrice: card.purchasePrice
}));

export const MOCK_ACQUISITION_TARGETS = [
  {
    id: '1',
    name: 'Jackson Holliday',
    team: 'BAL',
    league: 'MiLB',
    focus: 'Prospect',
    marketTrend: 'rising',
    confidence: 92,
    reason: 'Underlying contact metrics suggest elite MLB transition floor.',
    targetPrice: 250,
    image: 'https://img.mlbstatic.com/mlb-photos/person/702616.jpg'
  }
];

