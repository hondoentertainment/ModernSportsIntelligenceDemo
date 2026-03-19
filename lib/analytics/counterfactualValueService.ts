// Counterfactual Value Engine Service
// "What would this card be worth if...?" — Model alternate realities

export interface CounterfactualScenario {
  id: string;
  playerName: string;
  cardName: string;
  scenarioTitle: string;
  scenarioDescription: string;
  category: 'health' | 'team-change' | 'career-event' | 'league-event' | 'record' | 'draft';
  actualValue: number;
  counterfactualValue: number;
  valueDelta: number;
  valueDeltaPercent: number;
  confidenceScore: number;
  methodology: string;
  keyAssumptions: string[];
}

export interface AlternateTimeline {
  id: string;
  scenarioId: string;
  timelineEvents: {
    year: number;
    event: string;
    cardValue: number;
    actualCardValue: number;
  }[];
}

export interface CounterfactualComparable {
  id: string;
  scenarioId: string;
  comparablePlayer: string;
  comparableScenario: string;
  similarityScore: number;
  outcomeValue: number;
}

export interface CounterfactualStats {
  totalScenarios: number;
  avgValueDelta: number;
  biggestUpside: { player: string; delta: number };
  biggestDownside: { player: string; delta: number };
  mostExplored: string;
  popularCategories: { category: string; count: number }[];
}

// ─── Mock Scenarios ────────────────────────────────────────────────────────────

const mockScenarios: CounterfactualScenario[] = [
  {
    id: 'cf-001',
    playerName: 'Shohei Ohtani',
    cardName: '2018 Topps Update RC #US1',
    scenarioTitle: 'What if Ohtani never had UCL surgery?',
    scenarioDescription:
      'Models an alternate timeline where Ohtani avoided both UCL injuries, pitching full seasons from 2018 onward while maintaining his two-way dominance without any interruption.',
    category: 'health',
    actualValue: 4500,
    counterfactualValue: 6075,
    valueDelta: 1575,
    valueDeltaPercent: 35,
    confidenceScore: 0.82,
    methodology: 'Comparable health-impact analysis using pitchers with similar stuff metrics who avoided TJ surgery',
    keyAssumptions: [
      'Ohtani maintains 2023-level production across both roles every full season',
      'No compensatory injuries from increased workload',
      'Two-way narrative intensifies with consecutive full healthy seasons',
      'MVP-caliber seasons drive 15-20% annual card appreciation',
    ],
  },
  {
    id: 'cf-002',
    playerName: 'Michael Jordan',
    cardName: '1986 Fleer #57 RC',
    scenarioTitle: 'What if Jordan never retired to play baseball?',
    scenarioDescription:
      'Explores the timeline where Jordan plays through the 1993-94 and 1994-95 NBA seasons, potentially winning 8 consecutive championships and solidifying GOAT status even further.',
    category: 'career-event',
    actualValue: 42000,
    counterfactualValue: 35700,
    valueDelta: -6300,
    valueDeltaPercent: -15,
    confidenceScore: 0.71,
    methodology: 'Narrative scarcity analysis — retirement created mystique and comeback story that boosted long-term card demand',
    keyAssumptions: [
      'The retirement/comeback narrative adds significant cultural value',
      'Without the baseball detour, the "Last Dance" documentary never happens',
      'Consecutive titles reduce individual season significance',
      'Father\'s murder still occurs, removing the emotional narrative arc',
    ],
  },
  {
    id: 'cf-003',
    playerName: 'Ken Griffey Jr.',
    cardName: '1989 Upper Deck #1 RC',
    scenarioTitle: 'What if Griffey Jr. stayed healthy?',
    scenarioDescription:
      'Projects card values if Griffey avoided the hamstring, knee, and ankle injuries that plagued his Cincinnati years, potentially reaching 800+ HRs and cementing the all-time HR record.',
    category: 'health',
    actualValue: 3200,
    counterfactualValue: 5184,
    valueDelta: 1984,
    valueDeltaPercent: 62,
    confidenceScore: 0.78,
    methodology: 'Career trajectory extrapolation using pre-injury WAR trends and comparable slugger aging curves',
    keyAssumptions: [
      'Griffey maintains 40+ HR pace through age 36',
      'Breaks Hank Aaron\'s HR record before Bonds',
      'Stays in Seattle, preserving the loyal franchise-player narrative',
      'Clean record gives him undisputed HR king status in the steroid era',
    ],
  },
  {
    id: 'cf-004',
    playerName: 'Luka Doncic',
    cardName: '2018 Panini Prizm #280 RC',
    scenarioTitle: 'What if Luka was drafted by Phoenix?',
    scenarioDescription:
      'Models the timeline where Phoenix selects Doncic #1 overall in 2018 instead of DeAndre Ayton. Luka pairs with Devin Booker and Chris Paul arrives in 2020.',
    category: 'draft',
    actualValue: 2800,
    counterfactualValue: 3584,
    valueDelta: 784,
    valueDeltaPercent: 28,
    confidenceScore: 0.68,
    methodology: 'Market-size and team-success multiplier analysis using historical draft-slot card premiums',
    keyAssumptions: [
      'Doncic-Booker duo reaches 2021 Finals and wins at least one title',
      'Phoenix market generates less individual hype than Dallas',
      'Championship ring adds 30-40% premium to RC values',
      'Reduced playoff disappointments stabilize card floor',
    ],
  },
  {
    id: 'cf-005',
    playerName: 'Multiple Players',
    cardName: '1994 Season Cards (Various)',
    scenarioTitle: 'What if the 2020 season wasn\'t shortened?',
    scenarioDescription:
      'Analyzes card values if the 2020 MLB season played a full 162 games. Players like Tatis Jr., Bieber, and Abreu would have posted career-defining full-season numbers.',
    category: 'league-event',
    actualValue: 1800,
    counterfactualValue: 2124,
    valueDelta: 324,
    valueDeltaPercent: 18,
    confidenceScore: 0.74,
    methodology: 'Per-game rate extrapolation to 162 games with regression-adjusted fatigue modeling',
    keyAssumptions: [
      'Fernando Tatis Jr. hits 45+ HRs over a full season',
      'Shane Bieber wins Cy Young with 220+ strikeouts',
      'Full season legitimizes record-pace performances',
      'Hobby boom still occurs but with stronger stat-driven narratives',
    ],
  },
  {
    id: 'cf-006',
    playerName: 'LeBron James',
    cardName: '2003 Topps Chrome #111 RC',
    scenarioTitle: 'What if LeBron was drafted by Detroit?',
    scenarioDescription:
      'Explores the timeline where Detroit trades up to draft LeBron #1 overall. He joins the 2004 championship core of Ben Wallace, Chauncey Billups, and Rip Hamilton.',
    category: 'draft',
    actualValue: 58000,
    counterfactualValue: 49300,
    valueDelta: -8700,
    valueDeltaPercent: -15,
    confidenceScore: 0.63,
    methodology: 'Franchise-narrative and market-size card premium analysis',
    keyAssumptions: [
      'Detroit is a smaller media market than Cleveland hometown narrative',
      'LeBron wins early titles but loses the "carrying Cleveland" underdog story',
      '"The Decision" never happens, removing a massive cultural moment',
      'Rivalry with Kobe is less intense without East-West dynamic shift',
    ],
  },
  {
    id: 'cf-007',
    playerName: 'Bo Jackson',
    cardName: '1986 Topps Traded #50T RC',
    scenarioTitle: 'What if Bo Jackson never got injured?',
    scenarioDescription:
      'Models the career of a fully healthy Bo Jackson who continues as a two-sport star through the mid-1990s, potentially reaching the NFL and MLB Hall of Fame.',
    category: 'health',
    actualValue: 850,
    counterfactualValue: 3400,
    valueDelta: 2550,
    valueDeltaPercent: 300,
    confidenceScore: 0.58,
    methodology: 'Dual-sport career projection using comparable athletic phenoms and HOF card multipliers',
    keyAssumptions: [
      'Bo plays both sports through age 33',
      'Reaches 300 HRs in MLB and 8,000+ rushing yards in NFL',
      'Dual-HOF status creates unique collectible premium',
      'Nike "Bo Knows" campaign continues, boosting cultural relevance',
    ],
  },
  {
    id: 'cf-008',
    playerName: 'Greg Oden',
    cardName: '2007 Topps Chrome #1 RC',
    scenarioTitle: 'What if Greg Oden stayed healthy?',
    scenarioDescription:
      'Projects the career where Oden\'s knees hold up, delivering on the promise of a franchise center for Portland alongside Brandon Roy and LaMarcus Aldridge.',
    category: 'health',
    actualValue: 45,
    counterfactualValue: 1800,
    valueDelta: 1755,
    valueDeltaPercent: 3900,
    confidenceScore: 0.52,
    methodology: 'Draft-position expected value with comparable #1 pick center career arcs',
    keyAssumptions: [
      'Oden develops into a top-5 center by year 3',
      'Portland Big Three contends for titles from 2009-2015',
      'Card value reaches comparable top-pick center levels',
      'Durant vs Oden debate shifts significantly',
    ],
  },
  {
    id: 'cf-009',
    playerName: 'Wayne Gretzky',
    cardName: '1979 O-Pee-Chee #18 RC',
    scenarioTitle: 'What if Gretzky was never traded from Edmonton?',
    scenarioDescription:
      'Explores the timeline where Peter Pocklington never sells Gretzky to LA in 1988. Gretzky spends his entire career as an Oiler, potentially winning 6+ Stanley Cups.',
    category: 'team-change',
    actualValue: 185000,
    counterfactualValue: 157250,
    valueDelta: -27750,
    valueDeltaPercent: -15,
    confidenceScore: 0.66,
    methodology: 'Market expansion impact analysis — LA trade grew hockey in the US, expanding collector base',
    keyAssumptions: [
      'Hockey never gains mainstream US popularity without the LA move',
      'Smaller collector base means lower long-term demand',
      'More championships but less cultural impact',
      'Card hobby for hockey remains niche through the 1990s',
    ],
  },
  {
    id: 'cf-010',
    playerName: 'Multiple Players',
    cardName: '1994-95 MLB/NHL Cards (Various)',
    scenarioTitle: 'What if the 1994 strike never happened?',
    scenarioDescription:
      'Models the hobby impact if the 1994 MLB strike and NHL lockout never occurred. The mid-90s card market collapse may have been avoided or softened.',
    category: 'league-event',
    actualValue: 500,
    counterfactualValue: 1250,
    valueDelta: 750,
    valueDeltaPercent: 150,
    confidenceScore: 0.55,
    methodology: 'Market sentiment modeling using pre-strike growth trajectories and consumer confidence data',
    keyAssumptions: [
      'Tony Gwynn hits .400 over a full season',
      'Matt Williams reaches 62 HRs before McGwire/Sosa',
      'Card market avoids the late-90s crash or delays it by 3+ years',
      'Collector fatigue still sets in but at reduced severity',
    ],
  },
  {
    id: 'cf-011',
    playerName: 'Patrick Mahomes',
    cardName: '2017 Panini Prizm #269 RC',
    scenarioTitle: 'What if Mahomes was drafted by the Bears?',
    scenarioDescription:
      'Models the timeline where Chicago selects Mahomes instead of Mitchell Trubisky at #2 overall in 2017, pairing him with a strong defense and the Chicago market.',
    category: 'draft',
    actualValue: 5200,
    counterfactualValue: 6760,
    valueDelta: 1560,
    valueDeltaPercent: 30,
    confidenceScore: 0.72,
    methodology: 'Market-size premium modeling with defensive-support championship probability analysis',
    keyAssumptions: [
      'Chicago market adds 10-15% media exposure premium',
      'Bears defense helps Mahomes win Super Bowl by year 2',
      'Andy Reid still develops Mahomes via different coaching tree',
      'Mahomes adapts to any offensive system given his talent ceiling',
    ],
  },
  {
    id: 'cf-012',
    playerName: 'Zion Williamson',
    cardName: '2019 Panini Prizm #248 RC',
    scenarioTitle: 'What if Zion stayed fully healthy?',
    scenarioDescription:
      'Projects card values in a timeline where Zion never suffers knee injuries, plays 75+ games per season, and develops into the dominant force his Duke tape promised.',
    category: 'health',
    actualValue: 320,
    counterfactualValue: 2240,
    valueDelta: 1920,
    valueDeltaPercent: 600,
    confidenceScore: 0.61,
    methodology: 'Games-played correlation analysis with comparable athletic big-man career arcs',
    keyAssumptions: [
      'Zion plays 75+ games for 4 consecutive seasons',
      'Averages 27+ PPG and makes 3+ All-Star teams by 2024',
      'New Orleans becomes a playoff contender',
      'Card value follows Giannis-like trajectory given similar physical profiles',
    ],
  },
];

// ─── Mock Timelines ────────────────────────────────────────────────────────────

const mockTimelines: AlternateTimeline[] = [
  {
    id: 'tl-001',
    scenarioId: 'cf-001',
    timelineEvents: [
      { year: 2018, event: 'Ohtani debuts as two-way star, wins ROY', cardValue: 1200, actualCardValue: 1200 },
      { year: 2019, event: 'Alt: Full healthy season, 15W + 30HR', cardValue: 2400, actualCardValue: 900 },
      { year: 2020, event: 'Alt: Shortened season, dominates both ways', cardValue: 2800, actualCardValue: 1100 },
      { year: 2021, event: 'Alt: MVP season, 20W + 48HR', cardValue: 4200, actualCardValue: 3800 },
      { year: 2022, event: 'Alt: Back-to-back MVP, 18W + 40HR', cardValue: 5100, actualCardValue: 3200 },
      { year: 2023, event: 'Alt: Signs mega-deal, 3rd MVP', cardValue: 5800, actualCardValue: 4100 },
      { year: 2024, event: 'Alt: Leads team to World Series, pitches and hits', cardValue: 6075, actualCardValue: 4500 },
    ],
  },
  {
    id: 'tl-002',
    scenarioId: 'cf-002',
    timelineEvents: [
      { year: 1991, event: 'Jordan wins 1st championship', cardValue: 8000, actualCardValue: 8000 },
      { year: 1992, event: 'Jordan wins 2nd championship', cardValue: 10000, actualCardValue: 10000 },
      { year: 1993, event: 'Jordan wins 3rd championship', cardValue: 12000, actualCardValue: 12000 },
      { year: 1994, event: 'Alt: Wins 4th straight, fatigue narratives begin', cardValue: 13500, actualCardValue: 14000 },
      { year: 1995, event: 'Alt: Loses in playoffs, "dynasty fatigue" sets in', cardValue: 12800, actualCardValue: 15000 },
      { year: 1996, event: 'Alt: Wins 5th title, 72-win season', cardValue: 18000, actualCardValue: 22000 },
      { year: 1998, event: 'Alt: Retires after 6th title, less dramatic arc', cardValue: 35700, actualCardValue: 42000 },
    ],
  },
  {
    id: 'tl-003',
    scenarioId: 'cf-003',
    timelineEvents: [
      { year: 1997, event: 'Griffey hits 56 HRs, MVP season', cardValue: 2200, actualCardValue: 2200 },
      { year: 1998, event: 'Griffey hits 56 HRs again, HR race with McGwire/Sosa', cardValue: 2600, actualCardValue: 2600 },
      { year: 2000, event: 'Alt: Stays in Seattle, 48 HRs', cardValue: 3100, actualCardValue: 1800 },
      { year: 2002, event: 'Alt: 550 career HRs, on pace for record', cardValue: 3800, actualCardValue: 1400 },
      { year: 2004, event: 'Alt: Passes 660 HRs, clean record king', cardValue: 4400, actualCardValue: 1200 },
      { year: 2006, event: 'Alt: Breaks Aaron\'s 755 HR record cleanly', cardValue: 5184, actualCardValue: 1600 },
    ],
  },
  {
    id: 'tl-004',
    scenarioId: 'cf-004',
    timelineEvents: [
      { year: 2019, event: 'Alt: Doncic ROY in Phoenix, pairs with Booker', cardValue: 800, actualCardValue: 600 },
      { year: 2020, event: 'Alt: CP3 arrives, Suns become contenders', cardValue: 1400, actualCardValue: 1200 },
      { year: 2021, event: 'Alt: Suns reach Finals with Luka as lead creator', cardValue: 2400, actualCardValue: 2000 },
      { year: 2022, event: 'Alt: Suns win championship, Luka Finals MVP', cardValue: 3200, actualCardValue: 2400 },
      { year: 2023, event: 'Alt: Back-to-back Finals appearance', cardValue: 3584, actualCardValue: 2800 },
    ],
  },
  {
    id: 'tl-005',
    scenarioId: 'cf-005',
    timelineEvents: [
      { year: 2020, event: 'Alt: Tatis Jr. plays 162 games, 48 HRs', cardValue: 1200, actualCardValue: 800 },
      { year: 2020, event: 'Alt: Bieber 220 Ks, dominant Cy Young', cardValue: 600, actualCardValue: 420 },
      { year: 2020, event: 'Alt: Full season validates hobby boom', cardValue: 2124, actualCardValue: 1800 },
      { year: 2021, event: 'Momentum carries into 2021 card prices', cardValue: 2400, actualCardValue: 2000 },
      { year: 2022, event: 'Market correction hits but higher floor', cardValue: 2200, actualCardValue: 1600 },
    ],
  },
  {
    id: 'tl-006',
    scenarioId: 'cf-006',
    timelineEvents: [
      { year: 2003, event: 'Alt: LeBron drafted #1 by Detroit', cardValue: 2000, actualCardValue: 2000 },
      { year: 2004, event: 'Alt: Pistons win title, LeBron contributes off bench', cardValue: 3500, actualCardValue: 2800 },
      { year: 2006, event: 'Alt: LeBron leads Pistons to Finals', cardValue: 8000, actualCardValue: 6500 },
      { year: 2010, event: 'Alt: No "Decision", signs extension in Detroit', cardValue: 18000, actualCardValue: 25000 },
      { year: 2016, event: 'Alt: Wins title in Detroit, less iconic narrative', cardValue: 35000, actualCardValue: 48000 },
      { year: 2023, event: 'Alt: Scoring record in Detroit, smaller market', cardValue: 49300, actualCardValue: 58000 },
    ],
  },
  {
    id: 'tl-007',
    scenarioId: 'cf-007',
    timelineEvents: [
      { year: 1987, event: 'Bo plays MLB and NFL, cultural icon rises', cardValue: 200, actualCardValue: 200 },
      { year: 1989, event: 'Bo breaks out: All-Star Game HR, NFL Pro Bowl', cardValue: 600, actualCardValue: 600 },
      { year: 1991, event: 'Alt: Bo avoids hip injury, continues both sports', cardValue: 1200, actualCardValue: 350 },
      { year: 1993, event: 'Alt: Bo hits 200th HR, 5000+ rushing yards', cardValue: 2000, actualCardValue: 300 },
      { year: 1995, event: 'Alt: Bo retires as dual-sport legend', cardValue: 2800, actualCardValue: 400 },
      { year: 2000, event: 'Alt: Dual HOF induction, card prices surge', cardValue: 3400, actualCardValue: 600 },
      { year: 2024, event: 'Alt: Legacy solidified as greatest athlete ever', cardValue: 3400, actualCardValue: 850 },
    ],
  },
  {
    id: 'tl-008',
    scenarioId: 'cf-008',
    timelineEvents: [
      { year: 2007, event: 'Oden drafted #1 overall by Portland', cardValue: 200, actualCardValue: 200 },
      { year: 2008, event: 'Alt: Healthy rookie year, 15 PPG 10 RPG', cardValue: 450, actualCardValue: 80 },
      { year: 2010, event: 'Alt: All-Star, Portland Big Three dominates', cardValue: 900, actualCardValue: 50 },
      { year: 2012, event: 'Alt: Portland reaches Western Conference Finals', cardValue: 1200, actualCardValue: 40 },
      { year: 2014, event: 'Alt: Championship contender, Oden at peak', cardValue: 1600, actualCardValue: 35 },
      { year: 2016, event: 'Alt: Multiple All-Star selections, elite center', cardValue: 1800, actualCardValue: 45 },
    ],
  },
  {
    id: 'tl-009',
    scenarioId: 'cf-009',
    timelineEvents: [
      { year: 1985, event: 'Gretzky leads Oilers to Stanley Cup', cardValue: 30000, actualCardValue: 30000 },
      { year: 1988, event: 'Alt: Gretzky stays in Edmonton, wins 5th Cup', cardValue: 55000, actualCardValue: 60000 },
      { year: 1992, event: 'Alt: Oilers dynasty continues, 7th Cup', cardValue: 80000, actualCardValue: 95000 },
      { year: 1996, event: 'Alt: Gretzky nears retirement in Edmonton', cardValue: 120000, actualCardValue: 140000 },
      { year: 1999, event: 'Alt: Retires as one-team legend in smaller market', cardValue: 157250, actualCardValue: 185000 },
    ],
  },
  {
    id: 'tl-010',
    scenarioId: 'cf-010',
    timelineEvents: [
      { year: 1993, event: 'Card market at peak, baseball thriving', cardValue: 800, actualCardValue: 800 },
      { year: 1994, event: 'Alt: No strike, Gwynn hits .394 over full season', cardValue: 1000, actualCardValue: 400 },
      { year: 1995, event: 'Alt: Hobby momentum sustained, collector trust intact', cardValue: 1100, actualCardValue: 350 },
      { year: 1997, event: 'Alt: Market correction lighter, cards hold value', cardValue: 1200, actualCardValue: 300 },
      { year: 2000, event: 'Alt: Hobby transitions smoothly to modern era', cardValue: 1250, actualCardValue: 500 },
    ],
  },
  {
    id: 'tl-011',
    scenarioId: 'cf-011',
    timelineEvents: [
      { year: 2017, event: 'Alt: Bears draft Mahomes #2 overall', cardValue: 300, actualCardValue: 300 },
      { year: 2018, event: 'Alt: Mahomes starts year 2, Bears defense elite', cardValue: 1200, actualCardValue: 1800 },
      { year: 2019, event: 'Alt: Bears reach Super Bowl, Mahomes MVP candidate', cardValue: 3200, actualCardValue: 3500 },
      { year: 2020, event: 'Alt: Wins Super Bowl in Chicago, massive market', cardValue: 5400, actualCardValue: 4800 },
      { year: 2023, event: 'Alt: Dynasty in Chicago, bigger market premium', cardValue: 6760, actualCardValue: 5200 },
    ],
  },
  {
    id: 'tl-012',
    scenarioId: 'cf-012',
    timelineEvents: [
      { year: 2019, event: 'Zion drafted #1, massive hype', cardValue: 800, actualCardValue: 800 },
      { year: 2020, event: 'Alt: Zion plays 72 games, 24 PPG', cardValue: 1200, actualCardValue: 500 },
      { year: 2021, event: 'Alt: All-Star starter, 27 PPG', cardValue: 1600, actualCardValue: 400 },
      { year: 2022, event: 'Alt: Pelicans make deep playoff run', cardValue: 1900, actualCardValue: 280 },
      { year: 2023, event: 'Alt: MVP candidate, Giannis-level impact', cardValue: 2240, actualCardValue: 320 },
    ],
  },
];

// ─── Mock Comparables ──────────────────────────────────────────────────────────

const mockComparables: CounterfactualComparable[] = [
  // Ohtani scenario comparables
  { id: 'comp-001', scenarioId: 'cf-001', comparablePlayer: 'Babe Ruth', comparableScenario: 'Full-time two-way career without position switch', similarityScore: 0.72, outcomeValue: 8500 },
  { id: 'comp-002', scenarioId: 'cf-001', comparablePlayer: 'Jacob deGrom', comparableScenario: 'Elite pitcher with extended healthy streak', similarityScore: 0.81, outcomeValue: 5200 },
  { id: 'comp-003', scenarioId: 'cf-001', comparablePlayer: 'Mike Trout', comparableScenario: 'Generational talent with consistent health', similarityScore: 0.76, outcomeValue: 6800 },

  // Jordan scenario comparables
  { id: 'comp-004', scenarioId: 'cf-002', comparablePlayer: 'Kobe Bryant', comparableScenario: 'Continuous dynasty run without interruption', similarityScore: 0.68, outcomeValue: 28000 },
  { id: 'comp-005', scenarioId: 'cf-002', comparablePlayer: 'Bill Russell', comparableScenario: 'Extended championship streak, reduced individual narrative', similarityScore: 0.62, outcomeValue: 22000 },

  // Griffey scenario comparables
  { id: 'comp-006', scenarioId: 'cf-003', comparablePlayer: 'Mike Trout', comparableScenario: 'Generational talent derailed by injuries', similarityScore: 0.85, outcomeValue: 4800 },
  { id: 'comp-007', scenarioId: 'cf-003', comparablePlayer: 'Albert Pujols', comparableScenario: 'Clean slugger with full career arc', similarityScore: 0.77, outcomeValue: 5500 },
  { id: 'comp-008', scenarioId: 'cf-003', comparablePlayer: 'Hank Aaron', comparableScenario: 'HR king with longevity and clean record', similarityScore: 0.71, outcomeValue: 6200 },

  // Luka scenario comparables
  { id: 'comp-009', scenarioId: 'cf-004', comparablePlayer: 'Steve Nash', comparableScenario: 'Star who elevated Phoenix franchise', similarityScore: 0.65, outcomeValue: 1800 },
  { id: 'comp-010', scenarioId: 'cf-004', comparablePlayer: 'Charles Barkley', comparableScenario: 'MVP-level player traded to Suns', similarityScore: 0.58, outcomeValue: 2200 },

  // 2020 season scenario comparables
  { id: 'comp-011', scenarioId: 'cf-005', comparablePlayer: 'Roger Maris', comparableScenario: 'Record pace validated over full season', similarityScore: 0.60, outcomeValue: 3200 },
  { id: 'comp-012', scenarioId: 'cf-005', comparablePlayer: 'Ichiro Suzuki', comparableScenario: 'Full debut season with record-setting performance', similarityScore: 0.55, outcomeValue: 2800 },

  // LeBron scenario comparables
  { id: 'comp-013', scenarioId: 'cf-006', comparablePlayer: 'Tim Duncan', comparableScenario: 'All-time great in small market for entire career', similarityScore: 0.74, outcomeValue: 38000 },
  { id: 'comp-014', scenarioId: 'cf-006', comparablePlayer: 'Kevin Garnett', comparableScenario: 'Franchise player in non-glamour market', similarityScore: 0.69, outcomeValue: 12000 },

  // Bo Jackson scenario comparables
  { id: 'comp-015', scenarioId: 'cf-007', comparablePlayer: 'Deion Sanders', comparableScenario: 'Dual-sport star with full career', similarityScore: 0.82, outcomeValue: 2800 },
  { id: 'comp-016', scenarioId: 'cf-007', comparablePlayer: 'Jim Thorpe', comparableScenario: 'Multi-sport legend with lasting cultural impact', similarityScore: 0.55, outcomeValue: 4500 },

  // Greg Oden scenario comparables
  { id: 'comp-017', scenarioId: 'cf-008', comparablePlayer: 'Tim Duncan', comparableScenario: '#1 pick center who delivered on promise', similarityScore: 0.70, outcomeValue: 2200 },
  { id: 'comp-018', scenarioId: 'cf-008', comparablePlayer: 'Dwight Howard', comparableScenario: 'Dominant young center, healthy prime', similarityScore: 0.78, outcomeValue: 1400 },

  // Gretzky scenario comparables
  { id: 'comp-019', scenarioId: 'cf-009', comparablePlayer: 'Bobby Orr', comparableScenario: 'One-team legend in original market', similarityScore: 0.60, outcomeValue: 120000 },
  { id: 'comp-020', scenarioId: 'cf-009', comparablePlayer: 'Mario Lemieux', comparableScenario: 'Franchise icon who never left', similarityScore: 0.75, outcomeValue: 95000 },

  // 1994 strike scenario comparables
  { id: 'comp-021', scenarioId: 'cf-010', comparablePlayer: 'Tony Gwynn', comparableScenario: 'Season-long .400 chase with full schedule', similarityScore: 0.68, outcomeValue: 1800 },
  { id: 'comp-022', scenarioId: 'cf-010', comparablePlayer: 'Matt Williams', comparableScenario: '60+ HR season before McGwire era', similarityScore: 0.63, outcomeValue: 1500 },

  // Mahomes scenario comparables
  { id: 'comp-023', scenarioId: 'cf-011', comparablePlayer: 'Aaron Rodgers', comparableScenario: 'Elite QB in major NFC North market', similarityScore: 0.73, outcomeValue: 4200 },
  { id: 'comp-024', scenarioId: 'cf-011', comparablePlayer: 'Peyton Manning', comparableScenario: 'Franchise QB with immediate team success', similarityScore: 0.80, outcomeValue: 7800 },

  // Zion scenario comparables
  { id: 'comp-025', scenarioId: 'cf-012', comparablePlayer: 'Giannis Antetokounmpo', comparableScenario: 'Athletic freak with healthy development arc', similarityScore: 0.83, outcomeValue: 3500 },
  { id: 'comp-026', scenarioId: 'cf-012', comparablePlayer: 'Charles Barkley', comparableScenario: 'Undersized power forward who dominated', similarityScore: 0.71, outcomeValue: 2100 },
];

// ─── Service Functions ─────────────────────────────────────────────────────────

export function getCounterfactualScenarios(): CounterfactualScenario[] {
  return mockScenarios;
}

export function getScenario(id: string): CounterfactualScenario | undefined {
  return mockScenarios.find((s) => s.id === id);
}

export function getAlternateTimeline(scenarioId: string): AlternateTimeline | undefined {
  return mockTimelines.find((t) => t.scenarioId === scenarioId);
}

export function getComparables(scenarioId: string): CounterfactualComparable[] {
  return mockComparables.filter((c) => c.scenarioId === scenarioId);
}

export function getCounterfactualStats(): CounterfactualStats {
  const scenarios = mockScenarios;
  const deltas = scenarios.map((s) => s.valueDeltaPercent);
  const avgDelta = Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length);

  const upsides = scenarios.filter((s) => s.valueDelta > 0).sort((a, b) => b.valueDeltaPercent - a.valueDeltaPercent);
  const downsides = scenarios.filter((s) => s.valueDelta < 0).sort((a, b) => a.valueDeltaPercent - b.valueDeltaPercent);

  const categoryCounts: Record<string, number> = {};
  scenarios.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  const popularCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalScenarios: scenarios.length,
    avgValueDelta: avgDelta,
    biggestUpside: {
      player: upsides[0]?.playerName ?? 'N/A',
      delta: upsides[0]?.valueDeltaPercent ?? 0,
    },
    biggestDownside: {
      player: downsides[0]?.playerName ?? 'N/A',
      delta: downsides[0]?.valueDeltaPercent ?? 0,
    },
    mostExplored: popularCategories[0]?.category ?? 'health',
    popularCategories,
  };
}

export function getScenariosByCategory(category: CounterfactualScenario['category']): CounterfactualScenario[] {
  return mockScenarios.filter((s) => s.category === category);
}

export function getTopUpsideScenarios(): CounterfactualScenario[] {
  return [...mockScenarios]
    .filter((s) => s.valueDelta > 0)
    .sort((a, b) => b.valueDeltaPercent - a.valueDeltaPercent)
    .slice(0, 5);
}
