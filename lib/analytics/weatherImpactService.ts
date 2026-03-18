// Phase 99: Weather & Environmental Impact Engine
// How weather and environmental conditions affect sports card values

// ---- Types ----

export type WeatherCondition = 'clear' | 'rain' | 'snow' | 'wind' | 'dome' | 'extreme_heat' | 'extreme_cold';
export type GameStatus = 'on_time' | 'delayed' | 'postponed' | 'suspended';
export type AlertRecommendation = 'buy_before' | 'sell_before' | 'hold' | 'watch';
export type VenueType = 'dome' | 'retractable' | 'outdoor';

export interface WeatherGameImpact {
  gameId: string;
  date: string;
  teams: string;
  venue: string;
  weather: {
    temp: number;
    condition: WeatherCondition;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  };
  gameStatus: GameStatus;
  cardImpact: {
    player: string;
    impactType: string;
    description: string;
    valueChange: number;
  }[];
}

export interface HistoricWeatherEvent {
  id: string;
  date: string;
  event: string;
  weather: {
    temp: number;
    condition: WeatherCondition;
    windSpeed: number;
  };
  memorabiliaMultiplier: number;
  affectedCards: {
    player: string;
    card: string;
    premiumPercent: number;
  }[];
}

export interface VenueWeatherProfile {
  venue: string;
  city: string;
  type: VenueType;
  avgTemp: Record<string, number>;
  rainDelayFrequency: number;
  gamesCancelled: number;
  performanceImpact: {
    category: string;
    indoorAvg: number;
    outdoorAvg: number;
  }[];
}

export interface WeatherAlertCard {
  player: string;
  upcomingGame: string;
  forecast: string;
  expectedImpact: number;
  recommendation: AlertRecommendation;
  reasoning: string;
}

export interface WeatherStats {
  gamesTracked: number;
  postponements: number;
  weatherAlerts: number;
  avgWeatherImpact: number;
  topWeatherPremium: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_weather_impact';

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function _seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  try {
    return store.get(`${STORAGE_KEY}_${key}`, null);
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    store.set(`${STORAGE_KEY}_${key}`, data);
  } catch {
    // quota exceeded
  }
}

// ---- Data ----

const WEATHER_GAME_IMPACTS: WeatherGameImpact[] = [
  {
    gameId: 'wg_001',
    date: '2026-03-14',
    teams: 'Cubs vs Cardinals',
    venue: 'Wrigley Field',
    weather: { temp: 38, condition: 'wind', humidity: 45, windSpeed: 28, precipitation: 0 },
    gameStatus: 'on_time',
    cardImpact: [
      { player: 'Pete Crow-Armstrong', impactType: 'Wind Factor', description: 'High winds at Wrigley suppress fly ball power; defensive cards benefit', valueChange: -3.2 },
      { player: 'Seiya Suzuki', impactType: 'Cold Bat', description: 'Sub-40F temps historically reduce batting avg by 15-20 points', valueChange: -2.8 },
    ],
  },
  {
    gameId: 'wg_002',
    date: '2026-03-15',
    teams: 'Yankees vs Red Sox',
    venue: 'Fenway Park',
    weather: { temp: 34, condition: 'snow', humidity: 78, windSpeed: 12, precipitation: 0.4 },
    gameStatus: 'delayed',
    cardImpact: [
      { player: 'Aaron Judge', impactType: 'Delay Premium', description: 'Snow delay games generate rare memorabilia moments; potential postponement card', valueChange: 5.1 },
      { player: 'Gerrit Cole', impactType: 'Pitcher Rest', description: 'Delays disrupt pitcher rhythm; cold-weather starts reduce velocity 2-3 mph', valueChange: -4.5 },
    ],
  },
  {
    gameId: 'wg_003',
    date: '2026-03-16',
    teams: 'Astros vs Rangers',
    venue: 'Minute Maid Park',
    weather: { temp: 72, condition: 'dome', humidity: 50, windSpeed: 0, precipitation: 0 },
    gameStatus: 'on_time',
    cardImpact: [
      { player: 'Yordan Alvarez', impactType: 'Dome Advantage', description: 'Controlled environment benefits consistent hitters; dome parks show +8% HR rate', valueChange: 2.4 },
      { player: 'Kyle Tucker', impactType: 'Stable Conditions', description: 'No weather variance means pure performance-based card movements', valueChange: 1.1 },
    ],
  },
  {
    gameId: 'wg_004',
    date: '2026-03-17',
    teams: 'Dodgers vs Padres',
    venue: 'Dodger Stadium',
    weather: { temp: 95, condition: 'extreme_heat', humidity: 22, windSpeed: 5, precipitation: 0 },
    gameStatus: 'on_time',
    cardImpact: [
      { player: 'Shohei Ohtani', impactType: 'Heat Performance', description: 'Extreme heat reduces pitcher stamina; batters benefit from thinner air', valueChange: 3.8 },
      { player: 'Mookie Betts', impactType: 'Heat Endurance', description: 'Late-game fatigue in 95F+ creates opportunities for clutch performers', valueChange: 2.2 },
    ],
  },
  {
    gameId: 'wg_005',
    date: '2026-03-18',
    teams: 'Twins vs White Sox',
    venue: 'Target Field',
    weather: { temp: 18, condition: 'extreme_cold', humidity: 55, windSpeed: 15, precipitation: 0 },
    gameStatus: 'postponed',
    cardImpact: [
      { player: 'Royce Lewis', impactType: 'Postponement Rookie', description: 'Postponed debut games create scarcity events; rookie cards spike if debut delayed', valueChange: 8.5 },
      { player: 'Carlos Correa', impactType: 'Schedule Shift', description: 'Postponement creates doubleheader opportunities; fatigue impacts star players', valueChange: -1.5 },
    ],
  },
  {
    gameId: 'wg_006',
    date: '2026-03-19',
    teams: 'Mariners vs Angels',
    venue: 'T-Mobile Park',
    weather: { temp: 52, condition: 'rain', humidity: 88, windSpeed: 8, precipitation: 0.6 },
    gameStatus: 'delayed',
    cardImpact: [
      { player: 'Julio Rodriguez', impactType: 'Rain Delay Rally', description: 'Rain delays at retractable roof venues create unique game situations', valueChange: 1.8 },
      { player: 'Logan Gilbert', impactType: 'Disrupted Start', description: 'Pitchers lose warm-up rhythm during rain delays; ERA impact +0.5 in delay games', valueChange: -3.1 },
    ],
  },
  {
    gameId: 'wg_007',
    date: '2026-03-20',
    teams: 'Braves vs Mets',
    venue: 'Truist Park',
    weather: { temp: 62, condition: 'clear', humidity: 40, windSpeed: 6, precipitation: 0 },
    gameStatus: 'on_time',
    cardImpact: [
      { player: 'Ronald Acuna Jr', impactType: 'Perfect Conditions', description: 'Ideal weather maximizes athletic performance; optimal card value scenario', valueChange: 1.5 },
      { player: 'Spencer Strider', impactType: 'Clear Advantage', description: 'Clear skies and moderate temps are optimal for high-strikeout pitchers', valueChange: 2.0 },
    ],
  },
  {
    gameId: 'wg_008',
    date: '2026-03-21',
    teams: 'Bills vs Dolphins',
    venue: 'Highmark Stadium',
    weather: { temp: 12, condition: 'snow', humidity: 80, windSpeed: 22, precipitation: 1.2 },
    gameStatus: 'on_time',
    cardImpact: [
      { player: 'Josh Allen', impactType: 'Snow Game Premium', description: 'Snow games at Highmark are legendary memorabilia events; card premiums up 25-40%', valueChange: 18.5 },
      { player: 'James Cook', impactType: 'Ground Game Boost', description: 'Snow conditions favor run-heavy offense; RB cards spike in bad weather games', valueChange: 12.3 },
    ],
  },
];

const HISTORIC_WEATHER_EVENTS: HistoricWeatherEvent[] = [
  {
    id: 'hwe_001',
    date: '2007-12-16',
    event: 'Snow Bowl — Bills vs Browns (2007)',
    weather: { temp: 25, condition: 'snow', windSpeed: 30 },
    memorabiliaMultiplier: 3.2,
    affectedCards: [
      { player: 'Marshawn Lynch', card: '2007 Topps Chrome Rookie', premiumPercent: 185 },
      { player: 'Jamal Lewis', card: '2007 Topps Base', premiumPercent: 45 },
      { player: 'Derek Anderson', card: '2007 Bowman Chrome', premiumPercent: 65 },
    ],
  },
  {
    id: 'hwe_002',
    date: '1988-12-31',
    event: 'Fog Bowl — Eagles vs Bears (1988)',
    weather: { temp: 33, condition: 'wind', windSpeed: 15 },
    memorabiliaMultiplier: 4.5,
    affectedCards: [
      { player: 'Randall Cunningham', card: '1988 Topps', premiumPercent: 220 },
      { player: 'Mike Ditka (Coach)', card: '1988 Pro Set', premiumPercent: 95 },
      { player: 'Keith Jackson', card: '1988 Topps Rookie', premiumPercent: 150 },
    ],
  },
  {
    id: 'hwe_003',
    date: '1967-12-31',
    event: 'Ice Bowl — Cowboys vs Packers (1967)',
    weather: { temp: -13, condition: 'extreme_cold', windSpeed: 15 },
    memorabiliaMultiplier: 8.5,
    affectedCards: [
      { player: 'Bart Starr', card: '1967 Philadelphia', premiumPercent: 450 },
      { player: 'Vince Lombardi', card: 'Coaching Card', premiumPercent: 380 },
      { player: 'Tom Landry', card: 'Coaching Card', premiumPercent: 250 },
    ],
  },
  {
    id: 'hwe_004',
    date: '2024-01-13',
    event: 'Snow Game — Bills vs Steelers Playoff (2024)',
    weather: { temp: 15, condition: 'snow', windSpeed: 25 },
    memorabiliaMultiplier: 2.8,
    affectedCards: [
      { player: 'Josh Allen', card: '2024 Panini Prizm', premiumPercent: 125 },
      { player: 'James Cook', card: '2024 Topps Chrome', premiumPercent: 85 },
      { player: 'Stefon Diggs', card: '2024 Donruss', premiumPercent: 60 },
    ],
  },
  {
    id: 'hwe_005',
    date: '2008-10-05',
    event: 'Pine Tar Rain Game — Rays vs White Sox ALDS (2008)',
    weather: { temp: 42, condition: 'rain', windSpeed: 20 },
    memorabiliaMultiplier: 2.1,
    affectedCards: [
      { player: 'Evan Longoria', card: '2008 Bowman Chrome Rookie', premiumPercent: 95 },
      { player: 'Carl Crawford', card: '2008 Topps', premiumPercent: 40 },
      { player: 'Scott Kazmir', card: '2008 Topps Chrome', premiumPercent: 55 },
    ],
  },
  {
    id: 'hwe_006',
    date: '2003-01-04',
    event: 'Wind Game — 49ers vs Giants Playoff (2003)',
    weather: { temp: 39, condition: 'wind', windSpeed: 40 },
    memorabiliaMultiplier: 2.4,
    affectedCards: [
      { player: 'Jeff Garcia', card: '2003 Topps Chrome', premiumPercent: 110 },
      { player: 'Terrell Owens', card: '2003 Donruss Elite', premiumPercent: 75 },
      { player: 'Rich Gannon', card: '2003 Topps', premiumPercent: 50 },
    ],
  },
];

const VENUE_PROFILES: VenueWeatherProfile[] = [
  {
    venue: 'Wrigley Field',
    city: 'Chicago, IL',
    type: 'outdoor',
    avgTemp: { Apr: 48, May: 59, Jun: 70, Jul: 76, Aug: 75, Sep: 67 },
    rainDelayFrequency: 12.5,
    gamesCancelled: 3,
    performanceImpact: [
      { category: 'Batting Average', indoorAvg: 0.267, outdoorAvg: 0.252 },
      { category: 'Home Runs / Game', indoorAvg: 2.4, outdoorAvg: 1.9 },
      { category: 'ERA', indoorAvg: 3.85, outdoorAvg: 4.22 },
      { category: 'Stolen Bases / Game', indoorAvg: 0.8, outdoorAvg: 0.7 },
    ],
  },
  {
    venue: 'Fenway Park',
    city: 'Boston, MA',
    type: 'outdoor',
    avgTemp: { Apr: 47, May: 57, Jun: 67, Jul: 74, Aug: 72, Sep: 64 },
    rainDelayFrequency: 10.8,
    gamesCancelled: 2,
    performanceImpact: [
      { category: 'Batting Average', indoorAvg: 0.267, outdoorAvg: 0.258 },
      { category: 'Home Runs / Game', indoorAvg: 2.4, outdoorAvg: 2.1 },
      { category: 'ERA', indoorAvg: 3.85, outdoorAvg: 4.05 },
      { category: 'Stolen Bases / Game', indoorAvg: 0.8, outdoorAvg: 0.6 },
    ],
  },
  {
    venue: 'Minute Maid Park',
    city: 'Houston, TX',
    type: 'retractable',
    avgTemp: { Apr: 72, May: 79, Jun: 84, Jul: 88, Aug: 88, Sep: 83 },
    rainDelayFrequency: 2.1,
    gamesCancelled: 0,
    performanceImpact: [
      { category: 'Batting Average', indoorAvg: 0.271, outdoorAvg: 0.255 },
      { category: 'Home Runs / Game', indoorAvg: 2.6, outdoorAvg: 2.0 },
      { category: 'ERA', indoorAvg: 3.78, outdoorAvg: 4.15 },
      { category: 'Stolen Bases / Game', indoorAvg: 0.9, outdoorAvg: 0.7 },
    ],
  },
  {
    venue: 'Tropicana Field',
    city: 'St. Petersburg, FL',
    type: 'dome',
    avgTemp: { Apr: 78, May: 83, Jun: 86, Jul: 88, Aug: 88, Sep: 86 },
    rainDelayFrequency: 0,
    gamesCancelled: 0,
    performanceImpact: [
      { category: 'Batting Average', indoorAvg: 0.264, outdoorAvg: 0.251 },
      { category: 'Home Runs / Game', indoorAvg: 2.2, outdoorAvg: 1.8 },
      { category: 'ERA', indoorAvg: 3.92, outdoorAvg: 4.30 },
      { category: 'Stolen Bases / Game', indoorAvg: 0.9, outdoorAvg: 0.7 },
    ],
  },
  {
    venue: 'Coors Field',
    city: 'Denver, CO',
    type: 'outdoor',
    avgTemp: { Apr: 50, May: 60, Jun: 70, Jul: 77, Aug: 75, Sep: 66 },
    rainDelayFrequency: 8.2,
    gamesCancelled: 1,
    performanceImpact: [
      { category: 'Batting Average', indoorAvg: 0.267, outdoorAvg: 0.281 },
      { category: 'Home Runs / Game', indoorAvg: 2.4, outdoorAvg: 3.1 },
      { category: 'ERA', indoorAvg: 3.85, outdoorAvg: 5.12 },
      { category: 'Stolen Bases / Game', indoorAvg: 0.8, outdoorAvg: 0.9 },
    ],
  },
  {
    venue: 'Highmark Stadium',
    city: 'Buffalo, NY',
    type: 'outdoor',
    avgTemp: { Sep: 64, Oct: 52, Nov: 40, Dec: 28, Jan: 24 },
    rainDelayFrequency: 5.5,
    gamesCancelled: 2,
    performanceImpact: [
      { category: 'Passing Yards / Game', indoorAvg: 245, outdoorAvg: 198 },
      { category: 'Rushing Yards / Game', indoorAvg: 112, outdoorAvg: 135 },
      { category: 'Completion %', indoorAvg: 64.2, outdoorAvg: 56.8 },
      { category: 'Turnovers / Game', indoorAvg: 1.4, outdoorAvg: 2.1 },
    ],
  },
  {
    venue: 'Lambeau Field',
    city: 'Green Bay, WI',
    type: 'outdoor',
    avgTemp: { Sep: 60, Oct: 48, Nov: 34, Dec: 20, Jan: 16 },
    rainDelayFrequency: 3.8,
    gamesCancelled: 0,
    performanceImpact: [
      { category: 'Passing Yards / Game', indoorAvg: 245, outdoorAvg: 185 },
      { category: 'Rushing Yards / Game', indoorAvg: 112, outdoorAvg: 142 },
      { category: 'Completion %', indoorAvg: 64.2, outdoorAvg: 54.1 },
      { category: 'Turnovers / Game', indoorAvg: 1.4, outdoorAvg: 2.4 },
    ],
  },
  {
    venue: 'SoFi Stadium',
    city: 'Los Angeles, CA',
    type: 'dome',
    avgTemp: { Sep: 78, Oct: 72, Nov: 64, Dec: 58, Jan: 58 },
    rainDelayFrequency: 0,
    gamesCancelled: 0,
    performanceImpact: [
      { category: 'Passing Yards / Game', indoorAvg: 258, outdoorAvg: 225 },
      { category: 'Rushing Yards / Game', indoorAvg: 108, outdoorAvg: 118 },
      { category: 'Completion %', indoorAvg: 66.5, outdoorAvg: 61.2 },
      { category: 'Turnovers / Game', indoorAvg: 1.2, outdoorAvg: 1.8 },
    ],
  },
  {
    venue: 'Globe Life Field',
    city: 'Arlington, TX',
    type: 'retractable',
    avgTemp: { Apr: 68, May: 76, Jun: 85, Jul: 92, Aug: 93, Sep: 84 },
    rainDelayFrequency: 1.5,
    gamesCancelled: 0,
    performanceImpact: [
      { category: 'Batting Average', indoorAvg: 0.269, outdoorAvg: 0.254 },
      { category: 'Home Runs / Game', indoorAvg: 2.5, outdoorAvg: 2.0 },
      { category: 'ERA', indoorAvg: 3.82, outdoorAvg: 4.18 },
      { category: 'Stolen Bases / Game', indoorAvg: 0.8, outdoorAvg: 0.7 },
    ],
  },
  {
    venue: 'T-Mobile Park',
    city: 'Seattle, WA',
    type: 'retractable',
    avgTemp: { Apr: 50, May: 56, Jun: 62, Jul: 67, Aug: 68, Sep: 62 },
    rainDelayFrequency: 3.2,
    gamesCancelled: 0,
    performanceImpact: [
      { category: 'Batting Average', indoorAvg: 0.265, outdoorAvg: 0.248 },
      { category: 'Home Runs / Game', indoorAvg: 2.3, outdoorAvg: 1.8 },
      { category: 'ERA', indoorAvg: 3.88, outdoorAvg: 4.10 },
      { category: 'Stolen Bases / Game', indoorAvg: 0.8, outdoorAvg: 0.6 },
    ],
  },
];

const WEATHER_ALERTS: WeatherAlertCard[] = [
  {
    player: 'Shohei Ohtani',
    upcomingGame: 'Dodgers vs Padres — Mar 17',
    forecast: '95°F, Extreme Heat, Low Humidity',
    expectedImpact: 3.8,
    recommendation: 'buy_before',
    reasoning: 'Ohtani thrives in heat games. His batting average is .341 in 90F+ games vs .289 overall. Heat suppresses opposing pitcher stamina, creating late-game opportunities for elite batters.',
  },
  {
    player: 'Josh Allen',
    upcomingGame: 'Bills vs Dolphins — Mar 21',
    forecast: '12°F, Heavy Snow, 22 mph Wind',
    expectedImpact: 18.5,
    recommendation: 'buy_before',
    reasoning: 'Snow games at Highmark Stadium are premium memorabilia events. Allen\'s snow game cards have historically appreciated 25-40% within 48 hours of the game. The Bills-Dolphins snow rivalry adds collector interest.',
  },
  {
    player: 'Gerrit Cole',
    upcomingGame: 'Yankees vs Red Sox — Mar 15',
    forecast: '34°F, Snow, Potential Delay',
    expectedImpact: -4.5,
    recommendation: 'sell_before',
    reasoning: 'Cole\'s velocity drops 2-3 mph in sub-40F starts, and snow delays disrupt his meticulous warm-up routine. His ERA in cold-weather starts is 4.85 vs 2.95 in normal conditions.',
  },
  {
    player: 'Pete Crow-Armstrong',
    upcomingGame: 'Cubs vs Cardinals — Mar 14',
    forecast: '38°F, 28 mph Wind at Wrigley',
    expectedImpact: -3.2,
    recommendation: 'hold',
    reasoning: 'Wind at Wrigley suppresses power numbers but PCA\'s defensive value shines in difficult conditions. Hold through the game — defensive highlights could offset batting impact.',
  },
  {
    player: 'Royce Lewis',
    upcomingGame: 'Twins vs White Sox — Mar 18',
    forecast: '18°F, Extreme Cold — POSTPONED',
    expectedImpact: 8.5,
    recommendation: 'buy_before',
    reasoning: 'Game postponement delays Lewis\'s return from injury. Scarcity of his appearances makes each game more valuable. Buy now before the rescheduled game creates a debut-like card spike.',
  },
  {
    player: 'Julio Rodriguez',
    upcomingGame: 'Mariners vs Angels — Mar 19',
    forecast: '52°F, Rain, 88% Humidity',
    expectedImpact: 1.8,
    recommendation: 'watch',
    reasoning: 'T-Mobile Park\'s retractable roof may close for rain, converting this to a dome game. Monitor roof status — if closed, J-Rod\'s power numbers benefit from controlled conditions.',
  },
  {
    player: 'Ronald Acuna Jr',
    upcomingGame: 'Braves vs Mets — Mar 20',
    forecast: '62°F, Clear, Light Wind',
    expectedImpact: 1.5,
    recommendation: 'hold',
    reasoning: 'Perfect weather conditions at Truist Park mean pure performance-based card movements. No weather edge to exploit — hold and let Acuna\'s talent drive the value.',
  },
];

// ---- Public API ----

export function getWeatherGameImpacts(): WeatherGameImpact[] {
  const cached = loadData<WeatherGameImpact[]>('game_impacts');
  if (cached && cached.length > 0) return cached;
  saveData('game_impacts', WEATHER_GAME_IMPACTS);
  return WEATHER_GAME_IMPACTS;
}

export function getHistoricWeatherEvents(): HistoricWeatherEvent[] {
  const cached = loadData<HistoricWeatherEvent[]>('historic_events');
  if (cached && cached.length > 0) return cached;
  saveData('historic_events', HISTORIC_WEATHER_EVENTS);
  return HISTORIC_WEATHER_EVENTS;
}

export function getVenueProfiles(): VenueWeatherProfile[] {
  const cached = loadData<VenueWeatherProfile[]>('venue_profiles');
  if (cached && cached.length > 0) return cached;
  saveData('venue_profiles', VENUE_PROFILES);
  return VENUE_PROFILES;
}

export function getWeatherAlerts(): WeatherAlertCard[] {
  const cached = loadData<WeatherAlertCard[]>('alerts');
  if (cached && cached.length > 0) return cached;
  saveData('alerts', WEATHER_ALERTS);
  return WEATHER_ALERTS;
}

export function getWeatherStats(): WeatherStats {
  const impacts = getWeatherGameImpacts();
  const alerts = getWeatherAlerts();
  const historicEvents = getHistoricWeatherEvents();

  const postponements = impacts.filter(g => g.gameStatus === 'postponed' || g.gameStatus === 'suspended').length;
  const allValueChanges = impacts.flatMap(g => g.cardImpact.map(c => Math.abs(c.valueChange)));
  const avgImpact = allValueChanges.length > 0
    ? allValueChanges.reduce((a, b) => a + b, 0) / allValueChanges.length
    : 0;
  const topPremium = Math.max(...historicEvents.map(e => e.memorabiliaMultiplier));

  return {
    gamesTracked: impacts.length,
    postponements,
    weatherAlerts: alerts.length,
    avgWeatherImpact: Math.round(avgImpact * 10) / 10,
    topWeatherPremium: topPremium,
  };
}

// Helper: get a color for a weather condition
export function getConditionColor(condition: WeatherCondition): { text: string; bg: string; border: string } {
  const colors: Record<WeatherCondition, { text: string; bg: string; border: string }> = {
    clear: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    rain: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    snow: { text: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    wind: { text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    dome: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    extreme_heat: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    extreme_cold: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  };
  return colors[condition];
}

export function getConditionLabel(condition: WeatherCondition): string {
  const labels: Record<WeatherCondition, string> = {
    clear: 'Clear',
    rain: 'Rain',
    snow: 'Snow',
    wind: 'Wind',
    dome: 'Dome',
    extreme_heat: 'Extreme Heat',
    extreme_cold: 'Extreme Cold',
  };
  return labels[condition];
}

export function getStatusColor(status: GameStatus): { text: string; bg: string; border: string } {
  const colors: Record<GameStatus, { text: string; bg: string; border: string }> = {
    on_time: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    delayed: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    postponed: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    suspended: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  };
  return colors[status];
}

import { store } from '../dal/syncStore';
export function getRecommendationConfig(rec: AlertRecommendation): { label: string; text: string; bg: string; border: string } {
  const map: Record<AlertRecommendation, { label: string; text: string; bg: string; border: string }> = {
    buy_before: { label: 'BUY BEFORE', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    sell_before: { label: 'SELL BEFORE', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    hold: { label: 'HOLD', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    watch: { label: 'WATCH', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  };
  return map[rec];
}
