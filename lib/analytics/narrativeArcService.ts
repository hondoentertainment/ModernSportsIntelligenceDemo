// ─── Narrative Arc Engine Service ───────────────────────────────────────────
// Models card value through player career narratives — quantifying how storytelling drives collectible value

export type ArcType = 'rise' | 'peak' | 'decline' | 'redemption' | 'dynasty' | 'tragedy' | 'comeback' | 'underdog' | 'rivalry' | 'legacy';
export type ArcPhase = 'rising-action' | 'climax' | 'falling-action' | 'resolution';
export type Sentiment = 'positive' | 'negative' | 'neutral' | 'dramatic';
export type CulturalCategory = 'championship' | 'scandal' | 'retirement' | 'trade' | 'injury' | 'record-break' | 'hall-of-fame' | 'death' | 'comeback';

export interface Chapter {
  number: number;
  title: string;
  period: string;
  events: string[];
  sentiment: Sentiment;
  cardValueImpact: number; // percent
  keyCards: string[];
}

export interface NarrativeArc {
  id: string;
  playerId: string;
  playerName: string;
  sport: string;
  arcType: ArcType;
  currentChapter: number;
  totalChapters: number;
  narrativeScore: number; // 0-100
  arcPhase: ArcPhase;
  emotionalIntensity: number; // 0-100
  mediaAmplification: number; // 0-100
  chapters: Chapter[];
}

export interface NarrativeValuation {
  playerId: string;
  playerName: string;
  baseValue: number;
  narrativePremium: number; // percent
  components: {
    arcType: number;
    emotionalIntensity: number;
    mediaAmplification: number;
    culturalRelevance: number;
    scarcityNarrative: number;
  };
}

export interface ArcComparison {
  player1: string;
  player2: string;
  arcSimilarity: number;
  divergencePoint: string;
  projectedOutcomes: string[];
}

export interface NarrativeTrend {
  trendId: string;
  name: string;
  description: string;
  players: string[];
  momentum: number; // -100 to 100
  investmentThesis: string;
}

export interface CulturalMoment {
  id: string;
  event: string;
  date: string;
  players: string[];
  cardImpact: number; // percent
  narrativeShift: string;
  category: CulturalCategory;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const narrativeArcs: NarrativeArc[] = [
  {
    id: 'arc-jordan', playerId: 'p-jordan', playerName: 'Michael Jordan', sport: 'NBA',
    arcType: 'legacy', currentChapter: 8, totalChapters: 8, narrativeScore: 99,
    arcPhase: 'resolution', emotionalIntensity: 95, mediaAmplification: 100,
    chapters: [
      { number: 1, title: 'The Beginning', period: '1984-1986', events: ['Drafted 3rd overall', 'ROY Award', 'Broken foot comeback'], sentiment: 'positive', cardValueImpact: 15, keyCards: ['1986 Fleer #57'] },
      { number: 2, title: 'Rising Star', period: '1987-1990', events: ['First scoring title', 'Slam Dunk Contest wins', 'Playoff heartbreak vs Pistons'], sentiment: 'dramatic', cardValueImpact: 25, keyCards: ['1986 Fleer #57', '1988 Fleer All-Star'] },
      { number: 3, title: 'First Three-Peat', period: '1991-1993', events: ['First championship', 'Dream Team', 'Three consecutive titles'], sentiment: 'positive', cardValueImpact: 45, keyCards: ['1986 Fleer #57'] },
      { number: 4, title: 'The Departure', period: '1993-1995', events: ['Father murdered', 'Baseball career', 'Shocking retirement'], sentiment: 'dramatic', cardValueImpact: -10, keyCards: ['1994 Upper Deck Baseball'] },
      { number: 5, title: 'The Return', period: '1995', events: ['"I\'m Back" fax', '55-point MSG game', 'Playoff loss to Magic'], sentiment: 'dramatic', cardValueImpact: 30, keyCards: ['1995 Upper Deck #23'] },
      { number: 6, title: 'Second Three-Peat', period: '1996-1998', events: ['72-10 season', 'Flu Game', 'Last Shot vs Jazz'], sentiment: 'positive', cardValueImpact: 60, keyCards: ['1986 Fleer #57', '1997 Metal Universe PMG'] },
      { number: 7, title: 'The Last Dance', period: '2001-2003', events: ['Wizards comeback at 38', 'Final farewell tour', 'Dignity in decline'], sentiment: 'neutral', cardValueImpact: -5, keyCards: ['2001 Upper Deck Wizards'] },
      { number: 8, title: 'The Legend', period: '2003-present', events: ['The Last Dance documentary', 'GOAT debate rages', 'Cultural icon status'], sentiment: 'positive', cardValueImpact: 80, keyCards: ['1986 Fleer #57'] },
    ],
  },
  {
    id: 'arc-brady', playerId: 'p-brady', playerName: 'Tom Brady', sport: 'NFL',
    arcType: 'dynasty', currentChapter: 7, totalChapters: 7, narrativeScore: 97,
    arcPhase: 'resolution', emotionalIntensity: 90, mediaAmplification: 95,
    chapters: [
      { number: 1, title: '199th Pick', period: '2000-2001', events: ['Drafted 199th overall', 'Bledsoe injury opens door', 'Super Bowl XXXVI upset'], sentiment: 'dramatic', cardValueImpact: 20, keyCards: ['2000 Playoff Contenders #144'] },
      { number: 2, title: 'Early Dynasty', period: '2002-2004', events: ['Two more Super Bowls', 'Youngest QB with 3 rings', 'Spygate begins'], sentiment: 'positive', cardValueImpact: 40, keyCards: ['2000 Playoff Contenders #144'] },
      { number: 3, title: 'The Drought', period: '2005-2013', events: ['18-1 heartbreak', 'ACL tear 2008', 'Two Super Bowl losses to Giants'], sentiment: 'dramatic', cardValueImpact: -15, keyCards: ['2000 Bowman Chrome #236'] },
      { number: 4, title: 'Deflategate', period: '2014-2016', events: ['Accused of cheating', '4-game suspension', 'Returns to win SB LI 28-3 comeback'], sentiment: 'dramatic', cardValueImpact: 35, keyCards: ['2000 Playoff Contenders #144'] },
      { number: 5, title: 'Ageless Wonder', period: '2017-2019', events: ['Wins 6th ring at 41', 'TB12 Method debates', 'Leaves Patriots'], sentiment: 'positive', cardValueImpact: 50, keyCards: ['2000 Playoff Contenders #144'] },
      { number: 6, title: 'Tampa Triumph', period: '2020-2021', events: ['Wins 7th ring with Bucs', 'Proves he was the system', 'Retirement fakeout'], sentiment: 'positive', cardValueImpact: 65, keyCards: ['2000 Playoff Contenders #144'] },
      { number: 7, title: 'The Farewell', period: '2022-present', events: ['Final retirement', 'Broadcasting career', 'GOAT status cemented'], sentiment: 'positive', cardValueImpact: 25, keyCards: ['2000 Playoff Contenders #144'] },
    ],
  },
  {
    id: 'arc-lebron', playerId: 'p-lebron', playerName: 'LeBron James', sport: 'NBA',
    arcType: 'rise', currentChapter: 6, totalChapters: 7, narrativeScore: 96,
    arcPhase: 'falling-action', emotionalIntensity: 92, mediaAmplification: 98,
    chapters: [
      { number: 1, title: 'The Chosen One', period: '2003-2007', events: ['#1 pick, SI cover at 16', 'Immediate stardom', 'Carried Cleveland'], sentiment: 'positive', cardValueImpact: 30, keyCards: ['2003 Topps Chrome #111'] },
      { number: 2, title: 'The Decision', period: '2010', events: ['Leaves Cleveland on live TV', 'National villain', '"Not 1, not 2..."'], sentiment: 'negative', cardValueImpact: -25, keyCards: ['2003 Topps Chrome #111'] },
      { number: 3, title: 'Miami Heat Era', period: '2011-2014', events: ['Back-to-back championships', 'Headband game', 'Four Finals in a row'], sentiment: 'positive', cardValueImpact: 40, keyCards: ['2003 Topps Chrome #111'] },
      { number: 4, title: 'The Return', period: '2014-2018', events: ['Returns to Cleveland', 'Delivers promised championship', '3-1 comeback vs Warriors'], sentiment: 'dramatic', cardValueImpact: 55, keyCards: ['2003 Topps Chrome #111'] },
      { number: 5, title: 'Lakers Legacy', period: '2018-2020', events: ['Joins Lakers', 'Bubble championship', 'Kobe tribute ring'], sentiment: 'positive', cardValueImpact: 35, keyCards: ['2003 Topps Chrome #111'] },
      { number: 6, title: 'The Final Chapters', period: '2021-present', events: ['All-time scoring record', 'Playing with son Bronny', 'Defying age'], sentiment: 'dramatic', cardValueImpact: 45, keyCards: ['2003 Topps Chrome #111', '2003 Exquisite RPA'] },
    ],
  },
  {
    id: 'arc-vick', playerId: 'p-vick', playerName: 'Michael Vick', sport: 'NFL',
    arcType: 'redemption', currentChapter: 5, totalChapters: 5, narrativeScore: 78,
    arcPhase: 'resolution', emotionalIntensity: 88, mediaAmplification: 82,
    chapters: [
      { number: 1, title: 'Electric Debut', period: '2001-2006', events: ['#1 overall pick', 'Revolutionary dual-threat QB', 'Pro Bowl selections'], sentiment: 'positive', cardValueImpact: 25, keyCards: ['2001 Topps Chrome #135'] },
      { number: 2, title: 'The Downfall', period: '2007', events: ['Dog fighting charges', 'Federal prison sentence', 'Suspended from NFL'], sentiment: 'negative', cardValueImpact: -70, keyCards: ['2001 Topps Chrome #135'] },
      { number: 3, title: 'Prison', period: '2007-2009', events: ['Served 21 months', 'Bankruptcy', 'Public disgrace'], sentiment: 'negative', cardValueImpact: -30, keyCards: [] },
      { number: 4, title: 'Redemption in Philly', period: '2009-2013', events: ['Eagles sign him', 'Comeback Player of Year', 'Pro Bowl season 2010'], sentiment: 'positive', cardValueImpact: 45, keyCards: ['2001 Topps Chrome #135', '2010 Topps #200'] },
      { number: 5, title: 'Legacy of Change', period: '2014-present', events: ['Animal rights advocacy', 'Coaching career', 'Complex legacy discussions'], sentiment: 'neutral', cardValueImpact: 10, keyCards: ['2001 Topps Chrome #135'] },
    ],
  },
  {
    id: 'arc-gretzky', playerId: 'p-gretzky', playerName: 'Wayne Gretzky', sport: 'NHL',
    arcType: 'legacy', currentChapter: 6, totalChapters: 6, narrativeScore: 94,
    arcPhase: 'resolution', emotionalIntensity: 85, mediaAmplification: 88,
    chapters: [
      { number: 1, title: 'The Great One Emerges', period: '1979-1983', events: ['WHA prodigy joins NHL', 'Shatters scoring records', 'Edmonton dynasty begins'], sentiment: 'positive', cardValueImpact: 35, keyCards: ['1979 O-Pee-Chee #18'] },
      { number: 2, title: 'Dynasty Years', period: '1984-1988', events: ['Four Stanley Cups', 'Record 215 points in season', 'Most dominant athlete alive'], sentiment: 'positive', cardValueImpact: 55, keyCards: ['1979 O-Pee-Chee #18'] },
      { number: 3, title: 'The Trade', period: '1988', events: ['Traded to LA Kings', 'Edmonton mourns', '"The Trade" shocks hockey world'], sentiment: 'dramatic', cardValueImpact: 20, keyCards: ['1979 O-Pee-Chee #18'] },
      { number: 4, title: 'Hollywood Years', period: '1988-1996', events: ['Grows hockey in LA', 'Kings to Cup Finals', 'Breaks Howe\'s all-time record'], sentiment: 'positive', cardValueImpact: 30, keyCards: ['1979 O-Pee-Chee #18'] },
      { number: 5, title: 'The Farewell', period: '1996-1999', events: ['Final seasons in NY', 'Emotional retirement ceremony', 'Number 99 retired league-wide'], sentiment: 'dramatic', cardValueImpact: 40, keyCards: ['1979 O-Pee-Chee #18'] },
      { number: 6, title: 'Eternal Legend', period: '1999-present', events: ['Ambassador of hockey', 'Unbreakable records', 'GOAT status unchallenged'], sentiment: 'positive', cardValueImpact: 50, keyCards: ['1979 O-Pee-Chee #18'] },
    ],
  },
  {
    id: 'arc-bo', playerId: 'p-bo', playerName: 'Bo Jackson', sport: 'NFL',
    arcType: 'tragedy', currentChapter: 4, totalChapters: 4, narrativeScore: 82,
    arcPhase: 'resolution', emotionalIntensity: 90, mediaAmplification: 85,
    chapters: [
      { number: 1, title: 'Bo Knows Everything', period: '1986-1990', events: ['Heisman winner', 'Two-sport phenom', '"Bo Knows" Nike campaign'], sentiment: 'positive', cardValueImpact: 45, keyCards: ['1986 Topps Traded #50T', '1990 Score #697'] },
      { number: 2, title: 'The Injury', period: '1991', events: ['Hip injury during playoff game', 'Avascular necrosis diagnosis', 'Career-threatening moment'], sentiment: 'negative', cardValueImpact: -40, keyCards: ['1986 Topps Traded #50T'] },
      { number: 3, title: 'The Comeback Attempt', period: '1993-1994', events: ['Hip replacement surgery', 'Returns to MLB with White Sox', 'Proves doubters wrong briefly'], sentiment: 'dramatic', cardValueImpact: 15, keyCards: ['1994 Upper Deck #255'] },
      { number: 4, title: 'The Legend of What If', period: '1995-present', events: ['Retirement', '"Greatest athlete ever" debates', '"What if" drives card premium'], sentiment: 'dramatic', cardValueImpact: 60, keyCards: ['1986 Topps Traded #50T'] },
    ],
  },
  {
    id: 'arc-kobe', playerId: 'p-kobe', playerName: 'Kobe Bryant', sport: 'NBA',
    arcType: 'legacy', currentChapter: 7, totalChapters: 7, narrativeScore: 98,
    arcPhase: 'resolution', emotionalIntensity: 100, mediaAmplification: 100,
    chapters: [
      { number: 1, title: 'Straight from High School', period: '1996-1999', events: ['Drafted at 17', 'Youngest All-Star', 'Learning from Shaq'], sentiment: 'positive', cardValueImpact: 20, keyCards: ['1996 Topps Chrome #138'] },
      { number: 2, title: 'Three-Peat Dynasty', period: '2000-2002', events: ['Three championships with Shaq', 'Alley-oop to Shaq', 'Most exciting duo'], sentiment: 'positive', cardValueImpact: 40, keyCards: ['1996 Topps Chrome #138'] },
      { number: 3, title: 'The Controversy', period: '2003-2004', events: ['Colorado case', 'Shaq traded', 'Public image shattered'], sentiment: 'negative', cardValueImpact: -35, keyCards: ['1996 Topps Chrome #138'] },
      { number: 4, title: 'Mamba Mentality', period: '2005-2010', events: ['81-point game', 'MVP season', 'Two more championships'], sentiment: 'positive', cardValueImpact: 55, keyCards: ['1996 Topps Chrome #138'] },
      { number: 5, title: 'The Final Act', period: '2013-2016', events: ['Achilles tear', '60-point farewell game', '"Mamba Out"'], sentiment: 'dramatic', cardValueImpact: 30, keyCards: ['1996 Topps Chrome #138'] },
      { number: 6, title: 'Post-Retirement Renaissance', period: '2016-2020', events: ['Oscar winner (Dear Basketball)', 'Coaching Gigi', 'Business empire'], sentiment: 'positive', cardValueImpact: 20, keyCards: ['1996 Topps Chrome #138'] },
      { number: 7, title: 'Immortality', period: '2020-present', events: ['Helicopter crash', 'Global mourning', 'Card values explode, permanent icon'], sentiment: 'dramatic', cardValueImpact: 200, keyCards: ['1996 Topps Chrome #138', '1996 Topps Chrome Refractor #138'] },
    ],
  },
  {
    id: 'arc-bird-magic', playerId: 'p-bird', playerName: 'Larry Bird & Magic Johnson', sport: 'NBA',
    arcType: 'rivalry', currentChapter: 5, totalChapters: 5, narrativeScore: 91,
    arcPhase: 'resolution', emotionalIntensity: 88, mediaAmplification: 90,
    chapters: [
      { number: 1, title: 'College Showdown', period: '1979', events: ['NCAA Championship game', 'Michigan State vs Indiana State', 'Most-watched college game ever'], sentiment: 'dramatic', cardValueImpact: 15, keyCards: ['1980 Topps #34 Bird', '1980 Topps #18 Magic'] },
      { number: 2, title: 'Saving the NBA', period: '1980-1984', events: ['East vs West rivalry', 'Three championships combined', 'NBA popularity explodes'], sentiment: 'positive', cardValueImpact: 40, keyCards: ['1980 Topps #34', '1980 Topps #18'] },
      { number: 3, title: 'Peak Rivalry', period: '1984-1987', events: ['Three Finals meetings', 'Bird steals, Magic Hook', 'Greatest rivalry in sports'], sentiment: 'dramatic', cardValueImpact: 50, keyCards: ['1980 Topps #34', '1980 Topps #18'] },
      { number: 4, title: 'Magic\'s HIV Announcement', period: '1991', events: ['Magic announces HIV+', 'Bird emotional reaction', 'Rivalry becomes friendship'], sentiment: 'dramatic', cardValueImpact: 30, keyCards: ['1980 Topps #18'] },
      { number: 5, title: 'Friendship & Legacy', period: '1992-present', events: ['Dream Team together', 'Joint business ventures', 'Documentary and book'], sentiment: 'positive', cardValueImpact: 25, keyCards: ['1980 Topps #34', '1980 Topps #18'] },
    ],
  },
  {
    id: 'arc-zion', playerId: 'p-zion', playerName: 'Zion Williamson', sport: 'NBA',
    arcType: 'decline', currentChapter: 3, totalChapters: 5, narrativeScore: 55,
    arcPhase: 'falling-action', emotionalIntensity: 65, mediaAmplification: 70,
    chapters: [
      { number: 1, title: 'The Duke Phenom', period: '2018-2019', events: ['Nike shoe explosion', '#1 pick hype', 'Shoe blowout game goes viral'], sentiment: 'positive', cardValueImpact: 80, keyCards: ['2019 Panini Prizm #248'] },
      { number: 2, title: 'NBA Debut Promise', period: '2019-2021', events: ['Delayed debut (meniscus)', '27 PPG on historic efficiency', 'All-Star selection'], sentiment: 'positive', cardValueImpact: 40, keyCards: ['2019 Panini Prizm #248'] },
      { number: 3, title: 'The Weight of Expectations', period: '2021-present', events: ['Chronic injuries', 'Weight concerns', 'Games missed mounting', 'Card values plummet'], sentiment: 'negative', cardValueImpact: -65, keyCards: ['2019 Panini Prizm #248'] },
    ],
  },
  {
    id: 'arc-tiger', playerId: 'p-tiger', playerName: 'Tiger Woods', sport: 'Golf',
    arcType: 'redemption', currentChapter: 6, totalChapters: 6, narrativeScore: 93,
    arcPhase: 'resolution', emotionalIntensity: 95, mediaAmplification: 97,
    chapters: [
      { number: 1, title: 'The Prodigy', period: '1996-2002', events: ['Youngest Masters winner', 'Tiger Slam', 'Dominance unprecedented'], sentiment: 'positive', cardValueImpact: 50, keyCards: ['2001 Upper Deck Golf #1'] },
      { number: 2, title: 'Continued Dominance', period: '2003-2008', events: ['14 majors total', 'Wins US Open on torn ACL', 'Greatest golfer ever debates'], sentiment: 'positive', cardValueImpact: 35, keyCards: ['2001 Upper Deck Golf #1'] },
      { number: 3, title: 'The Scandal', period: '2009-2010', events: ['Car accident', 'Infidelity scandal', 'Public humiliation', 'Sponsors flee'], sentiment: 'negative', cardValueImpact: -45, keyCards: ['2001 Upper Deck Golf #1'] },
      { number: 4, title: 'The Wilderness Years', period: '2011-2017', events: ['Back surgeries (4)', 'DUI arrest', 'Dropped from rankings', 'Comeback doubted'], sentiment: 'negative', cardValueImpact: -20, keyCards: [] },
      { number: 5, title: 'The Masters Comeback', period: '2019', events: ['Wins 15th major at 2019 Masters', 'Greatest comeback in sports history', 'Standing ovation at Augusta'], sentiment: 'dramatic', cardValueImpact: 75, keyCards: ['2001 Upper Deck Golf #1'] },
      { number: 6, title: 'The Survivor', period: '2021-present', events: ['Car accident, nearly loses leg', 'Returns to play majors', 'Competing on will alone'], sentiment: 'dramatic', cardValueImpact: 30, keyCards: ['2001 Upper Deck Golf #1'] },
    ],
  },
  {
    id: 'arc-messi', playerId: 'p-messi', playerName: 'Lionel Messi', sport: 'Soccer',
    arcType: 'rise', currentChapter: 5, totalChapters: 5, narrativeScore: 95,
    arcPhase: 'resolution', emotionalIntensity: 93, mediaAmplification: 99,
    chapters: [
      { number: 1, title: 'La Masia Prodigy', period: '2004-2009', events: ['Barcelona debut at 17', 'Growth hormone treatment story', 'First Champions League title'], sentiment: 'positive', cardValueImpact: 30, keyCards: ['2004 Panini Mega Cracks'] },
      { number: 2, title: 'The Best Ever', period: '2009-2015', events: ['91 goals in calendar year', '4 Ballon d\'Or in a row', 'MSN trident'], sentiment: 'positive', cardValueImpact: 55, keyCards: ['2004 Panini Mega Cracks'] },
      { number: 3, title: 'Argentina Heartbreak', period: '2014-2016', events: ['World Cup Final loss', 'Copa America finals losses', 'International retirement'], sentiment: 'negative', cardValueImpact: -15, keyCards: ['2004 Panini Mega Cracks'] },
      { number: 4, title: 'World Cup Glory', period: '2022', events: ['Finally wins World Cup at 35', 'Greatest Final ever vs France', 'GOAT debate resolved for many'], sentiment: 'dramatic', cardValueImpact: 120, keyCards: ['2004 Panini Mega Cracks', '2022 Panini World Cup'] },
      { number: 5, title: 'MLS & Legacy', period: '2023-present', events: ['Inter Miami move', 'Grows US soccer interest', 'Farewell tour'], sentiment: 'positive', cardValueImpact: 25, keyCards: ['2004 Panini Mega Cracks', '2023 Topps MLS'] },
    ],
  },
  {
    id: 'arc-ohtani', playerId: 'p-ohtani', playerName: 'Shohei Ohtani', sport: 'MLB',
    arcType: 'rise', currentChapter: 3, totalChapters: 5, narrativeScore: 88,
    arcPhase: 'climax', emotionalIntensity: 85, mediaAmplification: 92,
    chapters: [
      { number: 1, title: 'Japanese Phenom', period: '2018-2019', events: ['Posted from Japan', 'ROY Award', 'Two-way player renaissance'], sentiment: 'positive', cardValueImpact: 35, keyCards: ['2018 Topps Chrome #150'] },
      { number: 2, title: 'MVP Dominance', period: '2021-2023', events: ['Unanimous MVP', '40+ HR and elite pitching', '"The most talented player ever"'], sentiment: 'positive', cardValueImpact: 70, keyCards: ['2018 Topps Chrome #150'] },
      { number: 3, title: 'Dodgers Era', period: '2024-present', events: ['Record $700M contract', 'Ippei scandal', 'World Series winner'], sentiment: 'dramatic', cardValueImpact: 45, keyCards: ['2018 Topps Chrome #150'] },
    ],
  },
  {
    id: 'arc-manning-brady', playerId: 'p-manning', playerName: 'Peyton Manning vs Tom Brady', sport: 'NFL',
    arcType: 'rivalry', currentChapter: 5, totalChapters: 5, narrativeScore: 87,
    arcPhase: 'resolution', emotionalIntensity: 80, mediaAmplification: 88,
    chapters: [
      { number: 1, title: 'The Draft Contrast', period: '1998-2003', events: ['Manning #1 pick vs Brady #199', 'Manning early struggles, Brady early rings', 'Opposite paths to greatness'], sentiment: 'dramatic', cardValueImpact: 15, keyCards: ['1998 Topps Chrome #165', '2000 Playoff Contenders #144'] },
      { number: 2, title: 'Manning Catches Up', period: '2004-2007', events: ['Manning wins SB XLI', 'Both with MVP seasons', 'Spygate controversy'], sentiment: 'dramatic', cardValueImpact: 25, keyCards: ['1998 Topps Chrome #165'] },
      { number: 3, title: 'Peak Rivalry', period: '2008-2014', events: ['Neck injury, Broncos move', 'Manning breaks records', '5 combined MVPs in era'], sentiment: 'positive', cardValueImpact: 30, keyCards: ['1998 Topps Chrome #165', '2000 Playoff Contenders #144'] },
      { number: 4, title: 'Manning\'s Final Win', period: '2015-2016', events: ['Manning beats Brady in AFC Championship', 'Wins SB 50', 'Rides off into sunset'], sentiment: 'dramatic', cardValueImpact: 20, keyCards: ['1998 Topps Chrome #165'] },
      { number: 5, title: 'Brady Outlasts', period: '2016-present', events: ['Brady wins 4 more rings', 'Manning becomes broadcaster', 'Brady declared GOAT'], sentiment: 'positive', cardValueImpact: -10, keyCards: ['2000 Playoff Contenders #144'] },
    ],
  },
  {
    id: 'arc-griffey', playerId: 'p-griffey', playerName: 'Ken Griffey Jr.', sport: 'MLB',
    arcType: 'tragedy', currentChapter: 5, totalChapters: 5, narrativeScore: 80,
    arcPhase: 'resolution', emotionalIntensity: 75, mediaAmplification: 78,
    chapters: [
      { number: 1, title: 'The Kid', period: '1989-1997', events: ['Debuted at 19', 'Sweetest swing ever', '7 consecutive All-Star games'], sentiment: 'positive', cardValueImpact: 40, keyCards: ['1989 Upper Deck #1'] },
      { number: 2, title: 'The Home Run Chase', period: '1997-1999', events: ['56 HR in 1997, 56 in 1998', 'MVP Award', 'Could have broken record'], sentiment: 'positive', cardValueImpact: 50, keyCards: ['1989 Upper Deck #1'] },
      { number: 3, title: 'Homecoming to Cincinnati', period: '2000-2004', events: ['Traded to Reds', 'Devastating injuries pile up', 'Promise unfulfilled'], sentiment: 'negative', cardValueImpact: -35, keyCards: ['1989 Upper Deck #1'] },
      { number: 4, title: 'The Clean GOAT', period: '2005-2010', events: ['600 HR milestone', 'Clean in steroid era', 'HOF first ballot'], sentiment: 'positive', cardValueImpact: 25, keyCards: ['1989 Upper Deck #1'] },
      { number: 5, title: 'Legacy Premium', period: '2010-present', events: ['Seen as "what should have been"', 'Clean record premium vs steroid era', 'Nostalgia generation collectors'], sentiment: 'positive', cardValueImpact: 30, keyCards: ['1989 Upper Deck #1'] },
    ],
  },
  {
    id: 'arc-mahomes', playerId: 'p-mahomes', playerName: 'Patrick Mahomes', sport: 'NFL',
    arcType: 'rise', currentChapter: 3, totalChapters: 6, narrativeScore: 85,
    arcPhase: 'rising-action', emotionalIntensity: 82, mediaAmplification: 90,
    chapters: [
      { number: 1, title: 'The Rocket Arm', period: '2017-2019', events: ['Sat behind Alex Smith', '50 TD season, MVP', 'No-look passes go viral'], sentiment: 'positive', cardValueImpact: 55, keyCards: ['2017 Panini Prizm #269'] },
      { number: 2, title: 'Super Bowl Champion', period: '2019-2021', events: ['Wins Super Bowl LIV', '$500M contract', 'Lost Super Bowl LV'], sentiment: 'positive', cardValueImpact: 40, keyCards: ['2017 Panini Prizm #269'] },
      { number: 3, title: 'Dynasty Builder', period: '2022-present', events: ['Back-to-back Super Bowls', 'Three rings before 30', 'Brady comparisons begin'], sentiment: 'positive', cardValueImpact: 65, keyCards: ['2017 Panini Prizm #269'] },
    ],
  },
];

const narrativeValuations: NarrativeValuation[] = [
  { playerId: 'p-jordan', playerName: 'Michael Jordan', baseValue: 500000, narrativePremium: 340, components: { arcType: 95, emotionalIntensity: 92, mediaAmplification: 100, culturalRelevance: 98, scarcityNarrative: 85 } },
  { playerId: 'p-kobe', playerName: 'Kobe Bryant', baseValue: 75000, narrativePremium: 520, components: { arcType: 90, emotionalIntensity: 100, mediaAmplification: 100, culturalRelevance: 95, scarcityNarrative: 80 } },
  { playerId: 'p-brady', playerName: 'Tom Brady', baseValue: 150000, narrativePremium: 280, components: { arcType: 92, emotionalIntensity: 85, mediaAmplification: 95, culturalRelevance: 90, scarcityNarrative: 75 } },
  { playerId: 'p-lebron', playerName: 'LeBron James', baseValue: 200000, narrativePremium: 210, components: { arcType: 88, emotionalIntensity: 90, mediaAmplification: 98, culturalRelevance: 92, scarcityNarrative: 70 } },
  { playerId: 'p-gretzky', playerName: 'Wayne Gretzky', baseValue: 300000, narrativePremium: 180, components: { arcType: 85, emotionalIntensity: 82, mediaAmplification: 85, culturalRelevance: 80, scarcityNarrative: 90 } },
  { playerId: 'p-messi', playerName: 'Lionel Messi', baseValue: 45000, narrativePremium: 350, components: { arcType: 90, emotionalIntensity: 93, mediaAmplification: 99, culturalRelevance: 96, scarcityNarrative: 65 } },
  { playerId: 'p-bo', playerName: 'Bo Jackson', baseValue: 2500, narrativePremium: 450, components: { arcType: 88, emotionalIntensity: 90, mediaAmplification: 85, culturalRelevance: 75, scarcityNarrative: 60 } },
  { playerId: 'p-tiger', playerName: 'Tiger Woods', baseValue: 5000, narrativePremium: 380, components: { arcType: 92, emotionalIntensity: 95, mediaAmplification: 97, culturalRelevance: 93, scarcityNarrative: 55 } },
  { playerId: 'p-vick', playerName: 'Michael Vick', baseValue: 800, narrativePremium: 290, components: { arcType: 85, emotionalIntensity: 88, mediaAmplification: 82, culturalRelevance: 70, scarcityNarrative: 50 } },
  { playerId: 'p-griffey', playerName: 'Ken Griffey Jr.', baseValue: 35000, narrativePremium: 160, components: { arcType: 78, emotionalIntensity: 75, mediaAmplification: 78, culturalRelevance: 82, scarcityNarrative: 72 } },
  { playerId: 'p-mahomes', playerName: 'Patrick Mahomes', baseValue: 85000, narrativePremium: 190, components: { arcType: 80, emotionalIntensity: 82, mediaAmplification: 90, culturalRelevance: 85, scarcityNarrative: 60 } },
  { playerId: 'p-ohtani', playerName: 'Shohei Ohtani', baseValue: 60000, narrativePremium: 220, components: { arcType: 82, emotionalIntensity: 85, mediaAmplification: 92, culturalRelevance: 88, scarcityNarrative: 55 } },
  { playerId: 'p-zion', playerName: 'Zion Williamson', baseValue: 1200, narrativePremium: -40, components: { arcType: 30, emotionalIntensity: 65, mediaAmplification: 70, culturalRelevance: 45, scarcityNarrative: 40 } },
  { playerId: 'p-bird', playerName: 'Larry Bird', baseValue: 25000, narrativePremium: 200, components: { arcType: 82, emotionalIntensity: 85, mediaAmplification: 88, culturalRelevance: 85, scarcityNarrative: 78 } },
  { playerId: 'p-manning', playerName: 'Peyton Manning', baseValue: 12000, narrativePremium: 120, components: { arcType: 75, emotionalIntensity: 78, mediaAmplification: 85, culturalRelevance: 80, scarcityNarrative: 65 } },
];

const culturalMoments: CulturalMoment[] = [
  { id: 'cm-1', event: 'Kobe Bryant helicopter crash', date: '2020-01-26', players: ['Kobe Bryant'], cardImpact: 200, narrativeShift: 'Mortality premium — instant immortality pricing', category: 'death' },
  { id: 'cm-2', event: 'The Last Dance documentary airs', date: '2020-04-19', players: ['Michael Jordan'], cardImpact: 80, narrativeShift: 'New generation discovers Jordan narrative', category: 'comeback' },
  { id: 'cm-3', event: 'Tom Brady wins 7th Super Bowl', date: '2021-02-07', players: ['Tom Brady'], cardImpact: 65, narrativeShift: 'GOAT debate definitively settled for many', category: 'championship' },
  { id: 'cm-4', event: 'LeBron breaks scoring record', date: '2023-02-07', players: ['LeBron James'], cardImpact: 45, narrativeShift: 'Statistical GOAT argument strengthened', category: 'record-break' },
  { id: 'cm-5', event: 'Messi wins World Cup', date: '2022-12-18', players: ['Lionel Messi'], cardImpact: 120, narrativeShift: 'Missing trophy narrative resolved — GOAT confirmed', category: 'championship' },
  { id: 'cm-6', event: 'Tiger Woods wins Masters at 43', date: '2019-04-14', players: ['Tiger Woods'], cardImpact: 75, narrativeShift: 'Greatest sports comeback narrative established', category: 'comeback' },
  { id: 'cm-7', event: 'Michael Vick released from prison', date: '2009-05-20', players: ['Michael Vick'], cardImpact: 30, narrativeShift: 'Redemption arc begins — controversial investment thesis', category: 'comeback' },
  { id: 'cm-8', event: 'Wayne Gretzky traded to LA', date: '1988-08-09', players: ['Wayne Gretzky'], cardImpact: 20, narrativeShift: 'Hockey grows beyond Canada — cultural expansion', category: 'trade' },
  { id: 'cm-9', event: 'Bo Jackson hip injury ends career', date: '1991-01-13', players: ['Bo Jackson'], cardImpact: -40, narrativeShift: '"What if" narrative begins — tragedy premium over time', category: 'injury' },
  { id: 'cm-10', event: 'Magic Johnson HIV announcement', date: '1991-11-07', players: ['Magic Johnson', 'Larry Bird'], cardImpact: 30, narrativeShift: 'Rivalry transforms to friendship — deeper emotional connection', category: 'retirement' },
  { id: 'cm-11', event: 'Mahomes wins back-to-back Super Bowls', date: '2024-02-11', players: ['Patrick Mahomes'], cardImpact: 55, narrativeShift: 'Dynasty narrative officially begins', category: 'championship' },
  { id: 'cm-12', event: 'LeBron "The Decision" on ESPN', date: '2010-07-08', players: ['LeBron James'], cardImpact: -25, narrativeShift: 'Hero-to-villain narrative shift — card prices crash', category: 'trade' },
  { id: 'cm-13', event: 'Ohtani signs $700M Dodgers deal', date: '2023-12-09', players: ['Shohei Ohtani'], cardImpact: 40, narrativeShift: 'Biggest contract ever validates two-way narrative', category: 'trade' },
  { id: 'cm-14', event: 'Zion Williamson shoe blowout at Duke', date: '2019-02-20', players: ['Zion Williamson'], cardImpact: 30, narrativeShift: 'Peak hype moment — power as narrative', category: 'injury' },
];

const narrativeTrends: NarrativeTrend[] = [
  { trendId: 'nt-1', name: 'The Farewell Premium', description: 'Players in final seasons see card value spikes from nostalgia and finality', players: ['LeBron James'], momentum: 75, investmentThesis: 'Buy during farewell tour announcement, sell at peak emotional moment' },
  { trendId: 'nt-2', name: 'Tragedy Premium Acceleration', description: 'Unexpected player deaths create permanent price floors that only increase', players: ['Kobe Bryant'], momentum: 60, investmentThesis: 'Tragedy creates permanent scarcity narrative — cards become memorial artifacts' },
  { trendId: 'nt-3', name: 'Redemption Arc Discount', description: 'Players recovering from scandal/injury are underpriced relative to comeback potential', players: ['Tiger Woods', 'Michael Vick'], momentum: 45, investmentThesis: 'Buy at peak scandal, hold through redemption arc for maximum narrative premium' },
  { trendId: 'nt-4', name: 'Dynasty Builder Premium', description: 'Active dynasty builders see compounding premiums with each championship', players: ['Patrick Mahomes', 'Tom Brady'], momentum: 80, investmentThesis: 'Each ring adds exponentially to narrative premium — invest early in dynasty arc' },
  { trendId: 'nt-5', name: 'What-If Nostalgia Wave', description: 'Injury-shortened careers gaining premium from "what could have been" narrative', players: ['Bo Jackson', 'Ken Griffey Jr.'], momentum: 55, investmentThesis: 'Nostalgia increases over time — long-term hold for generational collector shifts' },
  { trendId: 'nt-6', name: 'GOAT Debate Catalyst', description: 'Active GOAT debates drive card values as fans invest to support their argument', players: ['Michael Jordan', 'LeBron James', 'Lionel Messi'], momentum: 90, investmentThesis: 'GOAT debates are self-reinforcing — high card prices prove greatness narrative' },
  { trendId: 'nt-7', name: 'International Crossover Surge', description: 'Players who transcend national boundaries command global collector demand', players: ['Lionel Messi', 'Shohei Ohtani'], momentum: 70, investmentThesis: 'Global audience expands demand pool — underpriced by US-centric market' },
];

// ─── Service Functions ──────────────────────────────────────────────────────

export function getPlayerNarrative(playerId: string): NarrativeArc | null {
  return narrativeArcs.find(a => a.playerId === playerId) ?? null;
}

export function getNarrativeValuation(playerId: string): NarrativeValuation | null {
  return narrativeValuations.find(v => v.playerId === playerId) ?? null;
}

export function getActiveNarratives(sport?: string): NarrativeArc[] {
  if (sport) return narrativeArcs.filter(a => a.sport === sport);
  return [...narrativeArcs];
}

export function compareNarrativeArcs(id1: string, id2: string): ArcComparison | null {
  const arc1 = narrativeArcs.find(a => a.id === id1);
  const arc2 = narrativeArcs.find(a => a.id === id2);
  if (!arc1 || !arc2) return null;
  const similarity = 100 - Math.abs(arc1.narrativeScore - arc2.narrativeScore) - Math.abs(arc1.emotionalIntensity - arc2.emotionalIntensity) / 2;
  return {
    player1: arc1.playerName,
    player2: arc2.playerName,
    arcSimilarity: Math.max(0, Math.min(100, similarity)),
    divergencePoint: arc1.arcType === arc2.arcType ? 'Arcs follow similar trajectory' : `Diverged at arc type: ${arc1.arcType} vs ${arc2.arcType}`,
    projectedOutcomes: [
      `${arc1.playerName}: ${arc1.arcPhase === 'resolution' ? 'Arc complete, legacy phase' : 'Arc still developing — investment upside remains'}`,
      `${arc2.playerName}: ${arc2.arcPhase === 'resolution' ? 'Arc complete, legacy phase' : 'Arc still developing — investment upside remains'}`,
    ],
  };
}

export function getNarrativeTrends(): NarrativeTrend[] {
  return [...narrativeTrends];
}

export function getCulturalMoments(sport?: string, _period?: string): CulturalMoment[] {
  if (!sport) return [...culturalMoments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sportPlayers: Record<string, string[]> = {
    NBA: ['Michael Jordan', 'LeBron James', 'Kobe Bryant', 'Magic Johnson', 'Larry Bird', 'Zion Williamson'],
    NFL: ['Tom Brady', 'Patrick Mahomes', 'Michael Vick', 'Peyton Manning', 'Bo Jackson'],
    NHL: ['Wayne Gretzky'],
    Soccer: ['Lionel Messi'],
    MLB: ['Shohei Ohtani', 'Ken Griffey Jr.', 'Bo Jackson'],
    Golf: ['Tiger Woods'],
  };
  const players = sportPlayers[sport] ?? [];
  return culturalMoments.filter(cm => cm.players.some(p => players.includes(p))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function predictNarrativeTrajectory(playerId: string): { projectedPhase: ArcPhase; projectedScore: number; investmentOutlook: string } | null {
  const arc = narrativeArcs.find(a => a.playerId === playerId);
  if (!arc) return null;
  if (arc.arcPhase === 'resolution') {
    return { projectedPhase: 'resolution', projectedScore: arc.narrativeScore + 2, investmentOutlook: 'Legacy premium stable — hold for generational appreciation' };
  }
  if (arc.arcPhase === 'climax') {
    return { projectedPhase: 'falling-action', projectedScore: arc.narrativeScore + 5, investmentOutlook: 'Peak narrative moment — consider taking profits on momentum' };
  }
  return { projectedPhase: 'climax', projectedScore: arc.narrativeScore + 10, investmentOutlook: 'Rising narrative — accumulate before climax moment' };
}

export function getNarrativePremiumLeaderboard(): NarrativeValuation[] {
  return [...narrativeValuations].sort((a, b) => b.narrativePremium - a.narrativePremium);
}

export function getAllNarrativeArcs(): NarrativeArc[] {
  return [...narrativeArcs];
}

export function getAllCulturalMoments(): CulturalMoment[] {
  return [...culturalMoments];
}
