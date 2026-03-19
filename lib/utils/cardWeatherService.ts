// ---- Types ----

export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'hurricane'
  | 'tornado'
  | 'rainbow';

export type WindDirection = 'bullish' | 'bearish' | 'sideways';

export type SignalCategory =
  | 'momentum'
  | 'sentiment'
  | 'volume'
  | 'technical'
  | 'fundamental'
  | 'social'
  | 'seasonal';

export interface MarketWeather {
  condition: WeatherCondition;
  temperature: number; // market heat -20 to 120°F
  humidity: number; // liquidity 0-100%
  windSpeed: number; // volatility mph
  windDirection: WindDirection;
  pressure: number; // buying pressure hPa
  visibility: number; // market clarity miles
  uvIndex: number; // hype intensity 0-11+
  precipitationChance: number; // correction probability 0-100%
  dewPoint: number;
  feelsLike: number;
  updatedAt: string;
}

export interface WeatherSignal {
  id: string;
  name: string;
  value: number; // -100 to 100
  weight: number; // 0-1
  category: SignalCategory;
  description: string;
  trend: 'up' | 'down' | 'stable';
}

export interface WeatherForecast {
  day: string;
  date: string;
  condition: WeatherCondition;
  highTemp: number;
  lowTemp: number;
  precipitationChance: number;
  windSpeed: number;
  windDirection: WindDirection;
  summary: string;
}

export interface SportWeather {
  sport: string;
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: WindDirection;
  pressure: number;
  visibility: number;
  topMover: string;
  topMoverChange: number;
  marketCap: number;
  volume24h: number;
}

export interface RegionalWeather {
  region: string;
  category: string;
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windDirection: WindDirection;
  pressure: number;
  outlook: string;
  changePercent: number;
}

export interface WeatherAlert {
  id: string;
  type: 'storm_warning' | 'heat_advisory' | 'freeze_warning' | 'tornado_watch' | 'flash_flood' | 'fog_advisory';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  description: string;
  affectedArea: string;
  issuedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface WeatherHistory {
  date: string;
  temperature: number;
  humidity: number;
  condition: WeatherCondition;
  windSpeed: number;
  pressure: number;
  volume: number;
}

export interface SeasonalPattern {
  month: string;
  avgTemperature: number;
  avgHumidity: number;
  avgVolatility: number;
  historicalReturn: number;
  typicalCondition: WeatherCondition;
  notes: string;
}

export interface PressureSystem {
  id: string;
  type: 'high' | 'low';
  name: string;
  strength: number; // 1-10
  location: string;
  description: string;
  movingDirection: WindDirection;
  impact: string;
}

export interface WeatherMapData {
  regions: WeatherMapRegion[];
  overallCondition: WeatherCondition;
  heatIndex: number;
}

export interface WeatherMapRegion {
  id: string;
  name: string;
  sport: string;
  category: string;
  condition: WeatherCondition;
  temperature: number;
  intensity: number; // 0-1 for heat map
  x: number;
  y: number;
}

// ---- Helpers ----

function conditionLabel(c: WeatherCondition): string {
  const map: Record<WeatherCondition, string> = {
    sunny: 'Sunny (Bull Market)',
    partly_cloudy: 'Partly Cloudy',
    cloudy: 'Overcast',
    rain: 'Rain (Declining)',
    thunderstorm: 'Thunderstorm (Crash Risk)',
    snow: 'Snow (Frozen Market)',
    fog: 'Fog (Low Liquidity)',
    hurricane: 'Hurricane (Extreme Volatility)',
    tornado: 'Tornado (Flash Crash)',
    rainbow: 'Rainbow (Recovery)',
  };
  return map[c];
}

export { conditionLabel };

// ---- Mock Data: 40+ Signals ----

const MOCK_SIGNALS: WeatherSignal[] = [
  // Momentum (8)
  { id: 's01', name: 'Price RSI (14-day)', value: 62, weight: 0.08, category: 'momentum', description: 'Relative Strength Index across top 100 cards', trend: 'up' },
  { id: 's02', name: 'MACD Crossover', value: 45, weight: 0.07, category: 'momentum', description: 'Moving average convergence divergence signal', trend: 'up' },
  { id: 's03', name: '50-Day MA Trend', value: 38, weight: 0.06, category: 'momentum', description: 'Percentage of cards above 50-day moving average', trend: 'stable' },
  { id: 's04', name: '200-Day MA Trend', value: 55, weight: 0.06, category: 'momentum', description: 'Percentage of cards above 200-day moving average', trend: 'up' },
  { id: 's05', name: 'Momentum Breadth', value: 41, weight: 0.04, category: 'momentum', description: 'Advancing vs declining card prices', trend: 'up' },
  { id: 's06', name: 'Rate of Change (30d)', value: 28, weight: 0.04, category: 'momentum', description: '30-day rate of price change', trend: 'stable' },
  { id: 's07', name: 'Stochastic Oscillator', value: 71, weight: 0.03, category: 'momentum', description: 'Overbought/oversold indicator', trend: 'up' },
  { id: 's08', name: 'ADX Trend Strength', value: 34, weight: 0.03, category: 'momentum', description: 'Average directional index', trend: 'stable' },

  // Sentiment (7)
  { id: 's09', name: 'Collector Confidence Index', value: 58, weight: 0.07, category: 'sentiment', description: 'Survey-based confidence among active collectors', trend: 'up' },
  { id: 's10', name: 'Fear & Greed Index', value: 64, weight: 0.06, category: 'sentiment', description: 'Market fear vs greed composite', trend: 'up' },
  { id: 's11', name: 'Dealer Inventory Sentiment', value: 32, weight: 0.05, category: 'sentiment', description: 'Dealer willingness to hold inventory', trend: 'stable' },
  { id: 's12', name: 'Auction House Demand', value: 72, weight: 0.05, category: 'sentiment', description: 'Bid-to-lot ratio at major auctions', trend: 'up' },
  { id: 's13', name: 'New Collector Inflow', value: 48, weight: 0.04, category: 'sentiment', description: 'Rate of new market participants', trend: 'up' },
  { id: 's14', name: 'Put/Call Ratio (Options)', value: -15, weight: 0.03, category: 'sentiment', description: 'Bearish vs bullish positioning', trend: 'down' },
  { id: 's15', name: 'Smart Money Flow', value: 52, weight: 0.04, category: 'sentiment', description: 'Institutional and whale buying patterns', trend: 'up' },

  // Volume (6)
  { id: 's16', name: 'Total Market Volume', value: 44, weight: 0.06, category: 'volume', description: 'Aggregate trading volume across platforms', trend: 'up' },
  { id: 's17', name: 'Volume vs 30-Day Avg', value: 22, weight: 0.05, category: 'volume', description: 'Current volume relative to 30-day average', trend: 'stable' },
  { id: 's18', name: 'High-Value Transaction Count', value: 68, weight: 0.04, category: 'volume', description: 'Transactions >$1,000', trend: 'up' },
  { id: 's19', name: 'eBay Listing Velocity', value: 35, weight: 0.04, category: 'volume', description: 'Rate of new listings on eBay', trend: 'stable' },
  { id: 's20', name: 'PWCC Auction Participation', value: 55, weight: 0.03, category: 'volume', description: 'Bidder participation rate', trend: 'up' },
  { id: 's21', name: 'Grading Submission Volume', value: 41, weight: 0.03, category: 'volume', description: 'PSA/BGS/SGC submission rates', trend: 'up' },

  // Technical (6)
  { id: 's22', name: 'Support Level Strength', value: 60, weight: 0.05, category: 'technical', description: 'How well key price levels are holding', trend: 'up' },
  { id: 's23', name: 'Resistance Proximity', value: -20, weight: 0.04, category: 'technical', description: 'Distance to overhead resistance', trend: 'down' },
  { id: 's24', name: 'Bollinger Band Width', value: 30, weight: 0.03, category: 'technical', description: 'Volatility compression indicator', trend: 'stable' },
  { id: 's25', name: 'Fibonacci Retracement', value: 42, weight: 0.03, category: 'technical', description: 'Key retracement level analysis', trend: 'up' },
  { id: 's26', name: 'Volume-Price Trend', value: 50, weight: 0.03, category: 'technical', description: 'Volume-weighted price trend', trend: 'up' },
  { id: 's27', name: 'Breakout Signal Count', value: 38, weight: 0.02, category: 'technical', description: 'Number of cards breaking out of ranges', trend: 'up' },

  // Fundamental (6)
  { id: 's28', name: 'Player Performance Index', value: 65, weight: 0.06, category: 'fundamental', description: 'On-field/court performance composite', trend: 'up' },
  { id: 's29', name: 'Rookie Class Strength', value: 72, weight: 0.05, category: 'fundamental', description: 'Quality of current rookie class', trend: 'up' },
  { id: 's30', name: 'Set Scarcity Index', value: 48, weight: 0.04, category: 'fundamental', description: 'Available supply vs demand', trend: 'stable' },
  { id: 's31', name: 'Population Report Trend', value: 25, weight: 0.03, category: 'fundamental', description: 'PSA pop report changes', trend: 'down' },
  { id: 's32', name: 'HOF/Award Probability', value: 58, weight: 0.03, category: 'fundamental', description: 'Key players\' award trajectory', trend: 'up' },
  { id: 's33', name: 'Card Grade Premium', value: 40, weight: 0.02, category: 'fundamental', description: 'Premium for high grades vs raw', trend: 'stable' },

  // Social (5)
  { id: 's34', name: 'Social Media Buzz', value: 56, weight: 0.05, category: 'social', description: 'Twitter/X, Reddit, YouTube mentions', trend: 'up' },
  { id: 's35', name: 'YouTube Break Volume', value: 62, weight: 0.04, category: 'social', description: 'Pack/box opening content volume', trend: 'up' },
  { id: 's36', name: 'Reddit Sentiment Score', value: 44, weight: 0.03, category: 'social', description: 'r/sportscards sentiment analysis', trend: 'stable' },
  { id: 's37', name: 'Influencer Activity', value: 70, weight: 0.03, category: 'social', description: 'Key influencer engagement level', trend: 'up' },
  { id: 's38', name: 'Google Trends Index', value: 35, weight: 0.02, category: 'social', description: 'Search interest trends', trend: 'stable' },

  // Seasonal (5)
  { id: 's39', name: 'NFL Season Impact', value: 75, weight: 0.04, category: 'seasonal', description: 'Football season demand boost', trend: 'up' },
  { id: 's40', name: 'NBA Playoff Effect', value: 30, weight: 0.03, category: 'seasonal', description: 'Basketball playoff premium', trend: 'stable' },
  { id: 's41', name: 'MLB Opening Day Boost', value: 20, weight: 0.03, category: 'seasonal', description: 'Baseball season kickoff effect', trend: 'stable' },
  { id: 's42', name: 'Tax Season Liquidation', value: -25, weight: 0.03, category: 'seasonal', description: 'Selling pressure during tax season', trend: 'down' },
  { id: 's43', name: 'Holiday Buying Surge', value: 15, weight: 0.02, category: 'seasonal', description: 'Q4 gift-buying demand', trend: 'stable' },
];

// ---- Mock Weather Data ----

const MOCK_CURRENT_WEATHER: MarketWeather = {
  condition: 'partly_cloudy',
  temperature: 74,
  humidity: 62,
  windSpeed: 12,
  windDirection: 'bullish',
  pressure: 1018,
  visibility: 7.5,
  uvIndex: 6,
  precipitationChance: 25,
  dewPoint: 58,
  feelsLike: 78,
  updatedAt: new Date().toISOString(),
};

const MOCK_FORECAST: WeatherForecast[] = [
  { day: 'Today', date: '2026-03-15', condition: 'partly_cloudy', highTemp: 76, lowTemp: 62, precipitationChance: 25, windSpeed: 12, windDirection: 'bullish', summary: 'Mostly positive with some clouds' },
  { day: 'Mon', date: '2026-03-16', condition: 'sunny', highTemp: 82, lowTemp: 66, precipitationChance: 10, windSpeed: 8, windDirection: 'bullish', summary: 'Clear skies, strong buying' },
  { day: 'Tue', date: '2026-03-17', condition: 'sunny', highTemp: 85, lowTemp: 68, precipitationChance: 5, windSpeed: 6, windDirection: 'bullish', summary: 'Hot market, high demand' },
  { day: 'Wed', date: '2026-03-18', condition: 'partly_cloudy', highTemp: 78, lowTemp: 64, precipitationChance: 20, windSpeed: 10, windDirection: 'sideways', summary: 'Consolidation expected' },
  { day: 'Thu', date: '2026-03-19', condition: 'cloudy', highTemp: 70, lowTemp: 58, precipitationChance: 40, windSpeed: 15, windDirection: 'bearish', summary: 'Profit-taking likely' },
  { day: 'Fri', date: '2026-03-20', condition: 'rain', highTemp: 64, lowTemp: 54, precipitationChance: 65, windSpeed: 20, windDirection: 'bearish', summary: 'Correction possible, watch support' },
  { day: 'Sat', date: '2026-03-21', condition: 'rainbow', highTemp: 72, lowTemp: 60, precipitationChance: 30, windSpeed: 10, windDirection: 'bullish', summary: 'Recovery bounce expected' },
];

const MOCK_SPORT_WEATHER: SportWeather[] = [
  { sport: 'Football', condition: 'sunny', temperature: 88, humidity: 55, windSpeed: 8, windDirection: 'bullish', pressure: 1025, visibility: 9, topMover: 'Caleb Williams RC', topMoverChange: 12.5, marketCap: 2450000000, volume24h: 18500000 },
  { sport: 'Basketball', condition: 'partly_cloudy', temperature: 72, humidity: 65, windSpeed: 14, windDirection: 'bullish', pressure: 1015, visibility: 7, topMover: 'Victor Wembanyama', topMoverChange: 8.3, marketCap: 1890000000, volume24h: 14200000 },
  { sport: 'Baseball', condition: 'cloudy', temperature: 65, humidity: 70, windSpeed: 18, windDirection: 'sideways', pressure: 1008, visibility: 5, topMover: 'Paul Skenes RC', topMoverChange: -2.1, marketCap: 1620000000, volume24h: 9800000 },
  { sport: 'Hockey', condition: 'snow', temperature: 32, humidity: 80, windSpeed: 22, windDirection: 'bearish', pressure: 998, visibility: 3, topMover: 'Connor Bedard', topMoverChange: -5.4, marketCap: 420000000, volume24h: 3200000 },
  { sport: 'Soccer', condition: 'rain', temperature: 58, humidity: 75, windSpeed: 16, windDirection: 'bearish', pressure: 1005, visibility: 4, topMover: 'Jude Bellingham', topMoverChange: -3.8, marketCap: 680000000, volume24h: 5100000 },
];

const MOCK_REGIONAL_WEATHER: RegionalWeather[] = [
  { region: 'rookies', category: 'Rookie Cards', condition: 'sunny', temperature: 88, humidity: 58, windDirection: 'bullish', pressure: 1022, outlook: 'Strong demand with NFL draft approaching', changePercent: 8.4 },
  { region: 'vintage', category: 'Vintage (Pre-1980)', condition: 'partly_cloudy', temperature: 72, humidity: 45, windDirection: 'bullish', pressure: 1020, outlook: 'Steady appreciation, blue-chip stability', changePercent: 3.2 },
  { region: 'modern', category: 'Modern (1980-2010)', condition: 'fog', temperature: 55, humidity: 82, windDirection: 'sideways', pressure: 1010, outlook: 'Low liquidity, waiting for catalysts', changePercent: -0.8 },
  { region: 'autographs', category: 'Autographed Cards', condition: 'thunderstorm', temperature: 95, humidity: 70, windDirection: 'bullish', pressure: 1005, outlook: 'High volatility, authentication concerns', changePercent: 12.1 },
  { region: 'graded', category: 'Graded Gems (PSA 10)', condition: 'sunny', temperature: 84, humidity: 50, windDirection: 'bullish', pressure: 1025, outlook: 'Premium grades in strong demand', changePercent: 6.7 },
  { region: 'wax', category: 'Sealed Wax/Boxes', condition: 'rain', temperature: 48, humidity: 78, windDirection: 'bearish', pressure: 995, outlook: 'Declining interest in modern wax', changePercent: -4.5 },
];

const MOCK_ALERTS: WeatherAlert[] = [
  { id: 'a1', type: 'storm_warning', severity: 'high', title: 'Autograph Market Storm Warning', description: 'Increased fake autograph reports causing trust erosion. Major authentication controversy expected to impact prices 15-25% in affected segments.', affectedArea: 'Autographed Cards', issuedAt: '2026-03-15T08:00:00Z', expiresAt: '2026-03-18T08:00:00Z', active: true },
  { id: 'a2', type: 'heat_advisory', severity: 'moderate', title: 'Football Rookie Heat Advisory', description: 'NFL Combine hype driving rookie card prices to overheated levels. Risk of pullback after initial excitement fades.', affectedArea: 'Football Rookies', issuedAt: '2026-03-14T12:00:00Z', expiresAt: '2026-03-20T12:00:00Z', active: true },
  { id: 'a3', type: 'fog_advisory', severity: 'low', title: 'Modern Card Fog Advisory', description: 'Reduced visibility in modern card market. Low trading volume making price discovery difficult.', affectedArea: 'Modern Cards', issuedAt: '2026-03-15T06:00:00Z', expiresAt: '2026-03-17T06:00:00Z', active: true },
  { id: 'a4', type: 'freeze_warning', severity: 'moderate', title: 'Hockey Market Freeze Warning', description: 'Hockey card market entering seasonal freeze as NHL season winds down. Expect reduced liquidity.', affectedArea: 'Hockey Cards', issuedAt: '2026-03-13T10:00:00Z', expiresAt: '2026-03-22T10:00:00Z', active: true },
];

const MOCK_HISTORY: WeatherHistory[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2026-03-15');
  d.setDate(d.getDate() - (29 - i));
  const base = 70 + Math.sin(i / 4) * 15 + (Math.random() - 0.5) * 10;
  const conditions: WeatherCondition[] = ['sunny', 'partly_cloudy', 'cloudy', 'rain', 'partly_cloudy', 'sunny'];
  return {
    date: d.toISOString().split('T')[0],
    temperature: Math.round(base),
    humidity: Math.round(55 + Math.sin(i / 3) * 20 + (Math.random() - 0.5) * 10),
    condition: conditions[Math.floor(Math.abs(Math.sin(i / 3)) * conditions.length)] ?? 'partly_cloudy',
    windSpeed: Math.round(8 + Math.random() * 15),
    pressure: Math.round(1000 + Math.sin(i / 5) * 20),
    volume: Math.round(8000000 + Math.sin(i / 2) * 4000000 + Math.random() * 2000000),
  };
});

const MOCK_SEASONAL_PATTERNS: SeasonalPattern[] = [
  { month: 'Jan', avgTemperature: 55, avgHumidity: 60, avgVolatility: 15, historicalReturn: -2.1, typicalCondition: 'cloudy', notes: 'Post-holiday cooldown' },
  { month: 'Feb', avgTemperature: 62, avgHumidity: 58, avgVolatility: 18, historicalReturn: 1.8, typicalCondition: 'partly_cloudy', notes: 'Super Bowl boost for football' },
  { month: 'Mar', avgTemperature: 70, avgHumidity: 55, avgVolatility: 20, historicalReturn: 4.5, typicalCondition: 'partly_cloudy', notes: 'March Madness + MLB spring training' },
  { month: 'Apr', avgTemperature: 78, avgHumidity: 50, avgVolatility: 16, historicalReturn: 5.2, typicalCondition: 'sunny', notes: 'MLB opening day + NBA playoffs' },
  { month: 'May', avgTemperature: 82, avgHumidity: 48, avgVolatility: 14, historicalReturn: 3.8, typicalCondition: 'sunny', notes: 'Draft season peaks' },
  { month: 'Jun', avgTemperature: 88, avgHumidity: 52, avgVolatility: 12, historicalReturn: 2.1, typicalCondition: 'sunny', notes: 'NBA Finals + NHL Finals' },
  { month: 'Jul', avgTemperature: 92, avgHumidity: 65, avgVolatility: 10, historicalReturn: -0.5, typicalCondition: 'partly_cloudy', notes: 'Summer lull, MLB All-Star' },
  { month: 'Aug', avgTemperature: 85, avgHumidity: 68, avgVolatility: 12, historicalReturn: -1.2, typicalCondition: 'cloudy', notes: 'Pre-season anticipation building' },
  { month: 'Sep', avgTemperature: 80, avgHumidity: 60, avgVolatility: 22, historicalReturn: 6.8, typicalCondition: 'sunny', notes: 'NFL kickoff surge' },
  { month: 'Oct', avgTemperature: 76, avgHumidity: 55, avgVolatility: 25, historicalReturn: 5.5, typicalCondition: 'partly_cloudy', notes: 'World Series + NBA/NHL start' },
  { month: 'Nov', avgTemperature: 68, avgHumidity: 62, avgVolatility: 18, historicalReturn: 3.2, typicalCondition: 'rain', notes: 'Holiday buying begins' },
  { month: 'Dec', avgTemperature: 72, avgHumidity: 70, avgVolatility: 20, historicalReturn: 4.8, typicalCondition: 'partly_cloudy', notes: 'Gift-season demand peak' },
];

const MOCK_PRESSURE_SYSTEMS: PressureSystem[] = [
  { id: 'p1', type: 'high', name: 'NFL Draft Anticyclone', strength: 8, location: 'Football Rookies', description: 'Strong buying pressure from upcoming NFL Draft speculation', movingDirection: 'bullish', impact: 'Driving rookie card prices higher across all football products' },
  { id: 'p2', type: 'high', name: 'Wembanyama High', strength: 7, location: 'Basketball', description: 'Sustained institutional buying of Wembanyama cards', movingDirection: 'bullish', impact: 'Lifting the entire basketball rookie market' },
  { id: 'p3', type: 'low', name: 'Tax Season Depression', strength: 6, location: 'All Markets', description: 'Seasonal selling pressure as collectors liquidate for tax obligations', movingDirection: 'bearish', impact: 'Broad-based selling pressure on mid-tier cards' },
  { id: 'p4', type: 'low', name: 'Hockey Cyclone', strength: 5, location: 'Hockey', description: 'End-of-season interest decline', movingDirection: 'bearish', impact: 'Reduced liquidity in hockey segment' },
  { id: 'p5', type: 'high', name: 'Vintage Stability Ridge', strength: 9, location: 'Vintage Cards', description: 'Strong collector base providing price floor', movingDirection: 'sideways', impact: 'Maintaining stability in pre-1980 segment' },
];

const MOCK_WEATHER_MAP: WeatherMapData = {
  regions: [
    { id: 'm1', name: 'Football Rookies', sport: 'Football', category: 'Rookies', condition: 'sunny', temperature: 92, intensity: 0.9, x: 0, y: 0 },
    { id: 'm2', name: 'Football Vintage', sport: 'Football', category: 'Vintage', condition: 'partly_cloudy', temperature: 74, intensity: 0.6, x: 1, y: 0 },
    { id: 'm3', name: 'Football Modern', sport: 'Football', category: 'Modern', condition: 'cloudy', temperature: 62, intensity: 0.4, x: 2, y: 0 },
    { id: 'm4', name: 'Basketball Rookies', sport: 'Basketball', category: 'Rookies', condition: 'sunny', temperature: 85, intensity: 0.8, x: 0, y: 1 },
    { id: 'm5', name: 'Basketball Vintage', sport: 'Basketball', category: 'Vintage', condition: 'partly_cloudy', temperature: 70, intensity: 0.55, x: 1, y: 1 },
    { id: 'm6', name: 'Basketball Modern', sport: 'Basketball', category: 'Modern', condition: 'fog', temperature: 52, intensity: 0.3, x: 2, y: 1 },
    { id: 'm7', name: 'Baseball Rookies', sport: 'Baseball', category: 'Rookies', condition: 'partly_cloudy', temperature: 68, intensity: 0.5, x: 0, y: 2 },
    { id: 'm8', name: 'Baseball Vintage', sport: 'Baseball', category: 'Vintage', condition: 'sunny', temperature: 78, intensity: 0.65, x: 1, y: 2 },
    { id: 'm9', name: 'Baseball Modern', sport: 'Baseball', category: 'Modern', condition: 'rain', temperature: 45, intensity: 0.2, x: 2, y: 2 },
    { id: 'm10', name: 'Hockey Rookies', sport: 'Hockey', category: 'Rookies', condition: 'snow', temperature: 30, intensity: 0.15, x: 0, y: 3 },
    { id: 'm11', name: 'Hockey Vintage', sport: 'Hockey', category: 'Vintage', condition: 'cloudy', temperature: 50, intensity: 0.35, x: 1, y: 3 },
    { id: 'm12', name: 'Soccer All', sport: 'Soccer', category: 'All', condition: 'rain', temperature: 55, intensity: 0.25, x: 2, y: 3 },
  ],
  overallCondition: 'partly_cloudy',
  heatIndex: 68,
};

// ---- Service Functions ----

export function getCurrentWeather(): MarketWeather {
  return { ...MOCK_CURRENT_WEATHER };
}

export function getSportWeather(sport?: string): SportWeather[] {
  if (sport) {
    return MOCK_SPORT_WEATHER.filter(s => s.sport.toLowerCase() === sport.toLowerCase());
  }
  return [...MOCK_SPORT_WEATHER];
}

export function getRegionalWeather(): RegionalWeather[] {
  return [...MOCK_REGIONAL_WEATHER];
}

export function getForecast(days: number = 7): WeatherForecast[] {
  return MOCK_FORECAST.slice(0, days);
}

export function getWeatherAlerts(): WeatherAlert[] {
  return MOCK_ALERTS.filter(a => a.active);
}

export function getWeatherHistory(days: number = 30): WeatherHistory[] {
  return MOCK_HISTORY.slice(-days);
}

export function getSignalBreakdown(): WeatherSignal[] {
  return [...MOCK_SIGNALS];
}

export function getSeasonalPatterns(): SeasonalPattern[] {
  return [...MOCK_SEASONAL_PATTERNS];
}

export function getPressureSystems(): PressureSystem[] {
  return [...MOCK_PRESSURE_SYSTEMS];
}

export function getWeatherMap(): WeatherMapData {
  return { ...MOCK_WEATHER_MAP, regions: [...MOCK_WEATHER_MAP.regions] };
}
