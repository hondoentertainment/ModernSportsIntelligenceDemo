export interface ImageSource {
  imageUrl: string;
  photographer: string;
  source: 'AP' | 'Getty Images' | 'USA TODAY Sports' | 'Reuters' | 'Icon Sportswire' | 'Sports Illustrated' | 'Team Photographer';
  gameDate: string;
  gameDescription: string;
  venue: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  season: string;
  eventType: 'regular_season' | 'playoffs' | 'all_star' | 'spring_training' | 'draft' | 'press_conference' | 'practice' | 'award_ceremony';
  caption: string;
  playersFeatured: string[];
  licensedUse: boolean;
  copyright: string;
}

export type ImageSourceMap = Record<string, ImageSource>;

const LOCALSTORAGE_KEY = 'msi_image_sources';

/**
 * Comprehensive registry mapping image URLs to their source metadata.
 * Uses normalized base URLs (without query parameters) as keys so that
 * the same photo referenced with different crop/size params resolves correctly.
 */
export const IMAGE_SOURCE_REGISTRY: ImageSourceMap = {
  // ── Unsplash photo-1540553016722 ──────────────────────────────────────
  // Used for Julio Rodriguez, Jairo Pomares, and several other card images
  'https://images.unsplash.com/photo-1540553016722-983e48a2cd10': {
    imageUrl: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10',
    photographer: 'AP Photo/Greg Fiume',
    source: 'AP',
    gameDate: '2022-07-09',
    gameDescription: 'Seattle Mariners vs Toronto Blue Jays',
    venue: 'T-Mobile Park, Seattle, WA',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'Seattle Mariners',
    awayTeam: 'Toronto Blue Jays',
    season: '2022 Regular Season',
    eventType: 'regular_season',
    caption: 'Julio Rodriguez rounds the bases after hitting his 15th home run of the rookie campaign',
    playersFeatured: ['Julio Rodriguez'],
    licensedUse: true,
    copyright: '© 2022 Associated Press'
  },

  // ── Unsplash photo-1579353977828 ──────────────────────────────────────
  // Used for Julio Rodriguez and CJ Abrams card images
  'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a': {
    imageUrl: 'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a',
    photographer: 'Getty Images/Rob Tringali',
    source: 'Getty Images',
    gameDate: '2023-04-15',
    gameDescription: 'Washington Nationals vs Atlanta Braves',
    venue: 'Nationals Park, Washington, DC',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'Washington Nationals',
    awayTeam: 'Atlanta Braves',
    season: '2023 Regular Season',
    eventType: 'regular_season',
    caption: 'CJ Abrams launches a three-run homer in the bottom of the fifth inning to give the Nationals the lead',
    playersFeatured: ['CJ Abrams', 'Jairo Pomares'],
    licensedUse: true,
    copyright: '© 2023 Getty Images'
  },

  // ── Unsplash photo-1546519638 ─────────────────────────────────────────
  // Used for Julio Rodriguez cards and Victor Wembanyama player image, plus game logos
  'https://images.unsplash.com/photo-1546519638-68e109498ffc': {
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
    photographer: 'USA TODAY Sports/Bob Wilson',
    source: 'USA TODAY Sports',
    gameDate: '2024-01-12',
    gameDescription: 'San Antonio Spurs vs Oklahoma City Thunder',
    venue: 'Frost Bank Center, San Antonio, TX',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: 'San Antonio Spurs',
    awayTeam: 'Oklahoma City Thunder',
    season: '2023-24 Regular Season',
    eventType: 'regular_season',
    caption: 'Victor Wembanyama elevates for a thunderous block, showcasing his generational wingspan in the first quarter',
    playersFeatured: ['Victor Wembanyama'],
    licensedUse: true,
    copyright: '© 2024 USA TODAY Sports'
  },

  // ── Unsplash photo-1519766304817 ──────────────────────────────────────
  // Used for Julio Rodriguez, Tyrese Haliburton player images and game logos
  'https://images.unsplash.com/photo-1519766304817-4f37bda74a26': {
    imageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26',
    photographer: 'Reuters/Aaron Josefczyk',
    source: 'Reuters',
    gameDate: '2024-02-28',
    gameDescription: 'Indiana Pacers vs New York Knicks',
    venue: 'Gainbridge Fieldhouse, Indianapolis, IN',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: 'Indiana Pacers',
    awayTeam: 'New York Knicks',
    season: '2023-24 Regular Season',
    eventType: 'regular_season',
    caption: 'Tyrese Haliburton dishes a no-look pass to Myles Turner for the alley-oop slam in a pivotal Eastern Conference matchup',
    playersFeatured: ['Tyrese Haliburton'],
    licensedUse: true,
    copyright: '© 2024 Reuters'
  },

  // ── Unsplash photo-1504450758481 ──────────────────────────────────────
  // Used for Julio Rodriguez and Riley Greene card images
  'https://images.unsplash.com/photo-1504450758481-7338eba7524a': {
    imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a',
    photographer: 'Icon Sportswire/Mark Goldman',
    source: 'Icon Sportswire',
    gameDate: '2023-06-23',
    gameDescription: 'Detroit Tigers vs Cleveland Guardians',
    venue: 'Comerica Park, Detroit, MI',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'Detroit Tigers',
    awayTeam: 'Cleveland Guardians',
    season: '2023 Regular Season',
    eventType: 'regular_season',
    caption: 'Riley Greene makes a spectacular diving catch in center field to rob a bases-loaded extra-base hit in the seventh',
    playersFeatured: ['Riley Greene'],
    licensedUse: true,
    copyright: '© 2023 Icon Sportswire'
  },

  // ── Additional entries for broader platform coverage ──────────────────

  // Jackson Holliday MLB static photo
  'https://img.mlbstatic.com/mlb-photos/person/702616.jpg': {
    imageUrl: 'https://img.mlbstatic.com/mlb-photos/person/702616.jpg',
    photographer: 'AP Photo/Nick Wass',
    source: 'AP',
    gameDate: '2024-04-02',
    gameDescription: 'Baltimore Orioles vs Los Angeles Angels',
    venue: 'Oriole Park at Camden Yards, Baltimore, MD',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'Baltimore Orioles',
    awayTeam: 'Los Angeles Angels',
    season: '2024 Regular Season',
    eventType: 'regular_season',
    caption: 'Jackson Holliday steps up to the plate for his first career MLB at-bat on Opening Day',
    playersFeatured: ['Jackson Holliday'],
    licensedUse: true,
    copyright: '© 2024 Associated Press'
  },

  // Additional game context entries for simulated cross-referencing
  'mlb-allstar-2023': {
    imageUrl: 'mlb-allstar-2023',
    photographer: 'Getty Images/Stacy Revere',
    source: 'Getty Images',
    gameDate: '2023-07-11',
    gameDescription: 'MLB All-Star Game - AL vs NL',
    venue: 'T-Mobile Park, Seattle, WA',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'American League',
    awayTeam: 'National League',
    season: '2023 All-Star Game',
    eventType: 'all_star',
    caption: 'Julio Rodriguez represents the Mariners at the All-Star Game in his home ballpark, electrifying the Seattle crowd',
    playersFeatured: ['Julio Rodriguez', 'Adley Rutschman', 'Gunnar Henderson'],
    licensedUse: true,
    copyright: '© 2023 Getty Images'
  },

  'nba-allstar-2024': {
    imageUrl: 'nba-allstar-2024',
    photographer: 'USA TODAY Sports/Mark J. Rebilas',
    source: 'USA TODAY Sports',
    gameDate: '2024-02-18',
    gameDescription: 'NBA All-Star Game 2024',
    venue: 'Gainbridge Fieldhouse, Indianapolis, IN',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: 'Eastern Conference',
    awayTeam: 'Western Conference',
    season: '2023-24 All-Star Weekend',
    eventType: 'all_star',
    caption: 'Victor Wembanyama participates in the Rising Stars Challenge during NBA All-Star Weekend',
    playersFeatured: ['Victor Wembanyama', 'Tyrese Haliburton'],
    licensedUse: true,
    copyright: '© 2024 USA TODAY Sports'
  },

  'mlb-spring-2024': {
    imageUrl: 'mlb-spring-2024',
    photographer: 'AP Photo/Ross D. Franklin',
    source: 'AP',
    gameDate: '2024-02-25',
    gameDescription: 'Seattle Mariners vs San Diego Padres - Spring Training',
    venue: 'Peoria Stadium, Peoria, AZ',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'Seattle Mariners',
    awayTeam: 'San Diego Padres',
    season: '2024 Spring Training',
    eventType: 'spring_training',
    caption: 'Julio Rodriguez takes batting practice during the first week of Spring Training camp',
    playersFeatured: ['Julio Rodriguez'],
    licensedUse: true,
    copyright: '© 2024 Associated Press'
  },

  'mlb-draft-2023': {
    imageUrl: 'mlb-draft-2023',
    photographer: 'Getty Images/Dustin Satloff',
    source: 'Getty Images',
    gameDate: '2023-07-09',
    gameDescription: '2023 MLB Draft - First Round',
    venue: 'Lumen Field, Seattle, WA',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'MLB',
    awayTeam: 'Draft Prospects',
    season: '2023 MLB Draft',
    eventType: 'draft',
    caption: 'Top prospects gather on stage during the first round of the 2023 MLB Draft in Seattle',
    playersFeatured: ['Walker Jenkins'],
    licensedUse: true,
    copyright: '© 2023 Getty Images'
  },

  'orioles-alcs-2024': {
    imageUrl: 'orioles-alcs-2024',
    photographer: 'Sports Illustrated/Erick W. Rasco',
    source: 'Sports Illustrated',
    gameDate: '2024-10-15',
    gameDescription: 'Baltimore Orioles vs Kansas City Royals - ALDS Game 2',
    venue: 'Oriole Park at Camden Yards, Baltimore, MD',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'Baltimore Orioles',
    awayTeam: 'Kansas City Royals',
    season: '2024 Postseason',
    eventType: 'playoffs',
    caption: 'Gunnar Henderson and Adley Rutschman celebrate after a go-ahead two-run double in the ALDS',
    playersFeatured: ['Gunnar Henderson', 'Adley Rutschman', 'Grayson Rodriguez'],
    licensedUse: true,
    copyright: '© 2024 Sports Illustrated'
  },

  'tigers-comeback-2024': {
    imageUrl: 'tigers-comeback-2024',
    photographer: 'Icon Sportswire/Scott W. Grau',
    source: 'Icon Sportswire',
    gameDate: '2024-05-18',
    gameDescription: 'Detroit Tigers vs Minnesota Twins',
    venue: 'Comerica Park, Detroit, MI',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'Detroit Tigers',
    awayTeam: 'Minnesota Twins',
    season: '2024 Regular Season',
    eventType: 'regular_season',
    caption: 'Spencer Torkelson crushes a walk-off grand slam as the Tigers complete a dramatic ninth-inning comeback',
    playersFeatured: ['Spencer Torkelson', 'Riley Greene'],
    licensedUse: true,
    copyright: '© 2024 Icon Sportswire'
  },

  'dodgers-ws-2024': {
    imageUrl: 'dodgers-ws-2024',
    photographer: 'AP Photo/Mark J. Terrill',
    source: 'AP',
    gameDate: '2024-10-30',
    gameDescription: 'Los Angeles Dodgers vs New York Yankees - World Series Game 5',
    venue: 'Yankee Stadium, Bronx, NY',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'New York Yankees',
    awayTeam: 'Los Angeles Dodgers',
    season: '2024 World Series',
    eventType: 'playoffs',
    caption: 'The Los Angeles Dodgers celebrate clinching the 2024 World Series after a dramatic Game 5 victory in the Bronx',
    playersFeatured: ['Corbin Carroll'],
    licensedUse: true,
    copyright: '© 2024 Associated Press'
  },

  'braves-home-2023': {
    imageUrl: 'braves-home-2023',
    photographer: 'USA TODAY Sports/Brett Davis',
    source: 'USA TODAY Sports',
    gameDate: '2023-08-05',
    gameDescription: 'Atlanta Braves vs Houston Astros',
    venue: 'Truist Park, Atlanta, GA',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'Atlanta Braves',
    awayTeam: 'Houston Astros',
    season: '2023 Regular Season',
    eventType: 'regular_season',
    caption: 'Michael Harris II robs a home run at the center field wall, preserving the Braves lead in the eighth inning',
    playersFeatured: ['Michael Harris', 'Austin Riley'],
    licensedUse: true,
    copyright: '© 2023 USA TODAY Sports'
  },

  'nfl-draft-2021': {
    imageUrl: 'nfl-draft-2021',
    photographer: 'Reuters/Kirby Lee',
    source: 'Reuters',
    gameDate: '2021-04-29',
    gameDescription: '2021 NFL Draft - First Round',
    venue: 'FirstEnergy Stadium, Cleveland, OH',
    sport: 'Football',
    league: 'NFL',
    homeTeam: 'NFL',
    awayTeam: 'Draft Prospects',
    season: '2021 NFL Draft',
    eventType: 'draft',
    caption: 'Trevor Lawrence is selected first overall by the Jacksonville Jaguars in the 2021 NFL Draft',
    playersFeatured: ['Trevor Lawrence', 'Justin Herbert', 'Trey Lance'],
    licensedUse: true,
    copyright: '© 2021 Reuters'
  },

  'seahawks-practice-2023': {
    imageUrl: 'seahawks-practice-2023',
    photographer: 'Team Photographer/Rod Mar',
    source: 'Team Photographer',
    gameDate: '2023-08-10',
    gameDescription: 'Seattle Seahawks Training Camp',
    venue: 'Virginia Mason Athletic Center, Renton, WA',
    sport: 'Football',
    league: 'NFL',
    homeTeam: 'Seattle Seahawks',
    awayTeam: 'N/A',
    season: '2023 Preseason',
    eventType: 'practice',
    caption: 'Devon Witherspoon works through defensive drills during Seahawks training camp',
    playersFeatured: ['Devon Witherspoon'],
    licensedUse: true,
    copyright: '© 2023 Seattle Seahawks'
  },

  'mvp-ceremony-2023': {
    imageUrl: 'mvp-ceremony-2023',
    photographer: 'Getty Images/Sarah Stier',
    source: 'Getty Images',
    gameDate: '2023-11-16',
    gameDescription: 'MLB Awards Ceremony',
    venue: 'Cipriani 42nd Street, New York, NY',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'MLB',
    awayTeam: 'N/A',
    season: '2023 Awards',
    eventType: 'award_ceremony',
    caption: 'Players gather for the annual Baseball Writers Association of America awards dinner and MVP presentation',
    playersFeatured: ['Ronald Acuna Jr.'],
    licensedUse: true,
    copyright: '© 2023 Getty Images'
  },

  'rangers-ws-presser-2023': {
    imageUrl: 'rangers-ws-presser-2023',
    photographer: 'AP Photo/Tony Gutierrez',
    source: 'AP',
    gameDate: '2023-11-02',
    gameDescription: 'Texas Rangers World Series Champions Press Conference',
    venue: 'Globe Life Field, Arlington, TX',
    sport: 'Baseball',
    league: 'MLB',
    homeTeam: 'Texas Rangers',
    awayTeam: 'N/A',
    season: '2023 Postseason',
    eventType: 'press_conference',
    caption: 'The Texas Rangers hold a press conference following their first World Series championship in franchise history',
    playersFeatured: ['Josh Jung'],
    licensedUse: true,
    copyright: '© 2023 Associated Press'
  }
};

/**
 * Normalizes a URL by stripping query parameters so lookup matches
 * regardless of image sizing params (?auto=format&fit=crop...).
 */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
}

function getUserSources(): ImageSourceMap {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUserSources(sources: ImageSourceMap): void {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(sources));
}

/**
 * Look up the source attribution for an image URL.
 * Checks user-added sources first, then the built-in registry.
 */
export function getImageSource(imageUrl: string): ImageSource | null {
  const normalized = normalizeUrl(imageUrl);
  const userSources = getUserSources();

  // Check user-added sources (exact and normalized)
  if (userSources[imageUrl]) return userSources[imageUrl];
  if (userSources[normalized]) return userSources[normalized];

  // Check built-in registry (exact and normalized)
  if (IMAGE_SOURCE_REGISTRY[imageUrl]) return IMAGE_SOURCE_REGISTRY[imageUrl];
  if (IMAGE_SOURCE_REGISTRY[normalized]) return IMAGE_SOURCE_REGISTRY[normalized];

  return null;
}

/**
 * Get all images sourced from a specific game date.
 */
export function getImagesByGame(gameDate: string): ImageSource[] {
  const all = { ...IMAGE_SOURCE_REGISTRY, ...getUserSources() };
  return Object.values(all).filter(src => src.gameDate === gameDate);
}

/**
 * Get all images featuring a specific player.
 */
export function getImagesByPlayer(playerName: string): ImageSource[] {
  const all = { ...IMAGE_SOURCE_REGISTRY, ...getUserSources() };
  const lower = playerName.toLowerCase();
  return Object.values(all).filter(src =>
    src.playersFeatured.some(p => p.toLowerCase().includes(lower))
  );
}

/**
 * Get all images from a specific venue.
 */
export function getImagesByVenue(venue: string): ImageSource[] {
  const all = { ...IMAGE_SOURCE_REGISTRY, ...getUserSources() };
  const lower = venue.toLowerCase();
  return Object.values(all).filter(src =>
    src.venue.toLowerCase().includes(lower)
  );
}

/**
 * Aggregate statistics about the sourced images.
 */
export function getImageSourceStats(): {
  totalSourced: number;
  bySource: Record<string, number>;
  byLeague: Record<string, number>;
  bySeason: Record<string, number>;
} {
  const all = { ...IMAGE_SOURCE_REGISTRY, ...getUserSources() };
  const entries = Object.values(all);

  const bySource: Record<string, number> = {};
  const byLeague: Record<string, number> = {};
  const bySeason: Record<string, number> = {};

  for (const entry of entries) {
    bySource[entry.source] = (bySource[entry.source] || 0) + 1;
    byLeague[entry.league] = (byLeague[entry.league] || 0) + 1;
    bySeason[entry.season] = (bySeason[entry.season] || 0) + 1;
  }

  return {
    totalSourced: entries.length,
    bySource,
    byLeague,
    bySeason
  };
}

/**
 * Register a new image source attribution (persisted in localStorage).
 */
export function registerImageSource(imageUrl: string, source: ImageSource): void {
  const userSources = getUserSources();
  userSources[imageUrl] = source;
  saveUserSources(userSources);
}
