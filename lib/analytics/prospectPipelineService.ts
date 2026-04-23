// @ts-nocheck
import { store } from '../dal/syncStore';
import { Sport } from '../../types';

// ── Types ────────────────────────────────────────────────────────────────────────

export type ProspectStage = 'amateur' | 'drafted' | 'minor_league' | 'call_up' | 'rookie';
export type ProspectLeague = 'MiLB' | 'G-League' | 'NCAA-BB' | 'NCAA-FB' | 'CHL' | 'NCAA-HK' | 'NCAA-BSB';

export interface Prospect {
  id: string;
  name: string;
  sport: Sport;
  position: string;
  age: number;
  team: string;
  prospectLeague: ProspectLeague;
  stage: ProspectStage;
  ranking: number;           // overall prospect ranking within sport 1-100
  projectedDraftPos: number; // round pick e.g. 1-60
  keyStats: Record<string, string>;
  cardValuePreDraft: number;
  cardValuePostDraft: number;
  cardValueMinors: number;
  cardValueCallUp: number;
  cardValueRookie: number;
  callUpProbability: number; // 0-100 % chance within 6 months
  recentPromotion: boolean;
  promotionDate?: string;
  avgPriceJump: number;     // % average price increase at call-up 30-80
  valueCurve: number[];     // 12-month simulated price trajectory
  scouting: string;         // one-line scouting report
}

export interface StashEntry {
  id: string;
  prospectId: string;
  prospectName: string;
  sport: Sport;
  purchasePrice: number;
  currentValue: number;
  targetExitPrice: number;
  acquiredDate: string;
  notes: string;
}

export interface CallUpAlert {
  id: string;
  prospectId: string;
  prospectName: string;
  sport: Sport;
  fromStage: ProspectStage;
  toStage: ProspectStage;
  priceJump: number;       // percentage
  date: string;
  acknowledged: boolean;
}

export interface DraftBoardEntry {
  prospectId: string;
  projectedPick: number;
  preDraftValue: number;
  postDraftImpact: number; // percentage change
  team: string;
}

export interface PipelineFunnelStage {
  stage: ProspectStage;
  label: string;
  count: number;
  avgCardValue: number;
  prospects: Prospect[];
}

export interface StashPortfolioSummary {
  totalInvested: number;
  currentValue: number;
  targetValue: number;
  roi: number;
  count: number;
}

// ── Storage keys ─────────────────────────────────────────────────────────────────

const STORAGE_FOLLOWED = 'msi_prospect_followed';
const STORAGE_STASH = 'msi_prospect_stash';
const STORAGE_ALERTS_ACK = 'msi_prospect_alerts_ack';
const STORAGE_PREFS = 'msi_prospect_prefs';

// ── Deterministic helpers ────────────────────────────────────────────────────────

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateCurve(seed: number, basePrice: number, stages: number[]): number[] {
  const rand = seededRandom(seed);
  const curve: number[] = [];
  let price = basePrice;
  for (let i = 0; i < 12; i++) {
    const stageMultiplier = stages[Math.min(i, stages.length - 1)] ?? 1;
    price = price * stageMultiplier * (0.95 + rand() * 0.1);
    curve.push(Math.round(price * 100) / 100);
  }
  return curve;
}

// ── Hardcoded prospect database (50+) ────────────────────────────────────────────

const PROSPECT_DATA: Omit<Prospect, 'valueCurve'>[] = [
  // ─── Baseball (MiLB / NCAA) ────────────────────────────────
  { id: 'p-bb-01', name: 'Jackson Holliday', sport: 'Baseball', position: 'SS', age: 20, team: 'Norfolk Tides', prospectLeague: 'MiLB', stage: 'minor_league', ranking: 1, projectedDraftPos: 1, keyStats: { AVG: '.312', HR: '18', SB: '22' }, cardValuePreDraft: 15, cardValuePostDraft: 45, cardValueMinors: 85, cardValueCallUp: 180, cardValueRookie: 250, callUpProbability: 88, recentPromotion: false, avgPriceJump: 65, scouting: 'Elite bat speed, plus power from both sides. Gold-glove caliber defense.' },
  { id: 'p-bb-02', name: 'Dylan Crews', sport: 'Baseball', position: 'OF', age: 21, team: 'Harrisburg Senators', prospectLeague: 'MiLB', stage: 'minor_league', ranking: 3, projectedDraftPos: 2, keyStats: { AVG: '.298', HR: '14', OPS: '.895' }, cardValuePreDraft: 12, cardValuePostDraft: 35, cardValueMinors: 65, cardValueCallUp: 140, cardValueRookie: 200, callUpProbability: 72, recentPromotion: false, avgPriceJump: 55, scouting: 'Pure hitter with advanced approach. Five-tool ceiling with plus speed.' },
  { id: 'p-bb-03', name: 'Ethan Salas', sport: 'Baseball', position: 'C', age: 18, team: 'Lake Elsinore Storm', prospectLeague: 'MiLB', stage: 'minor_league', ranking: 5, projectedDraftPos: 0, keyStats: { AVG: '.275', HR: '10', OPS: '.825' }, cardValuePreDraft: 8, cardValuePostDraft: 20, cardValueMinors: 45, cardValueCallUp: 110, cardValueRookie: 175, callUpProbability: 25, recentPromotion: false, avgPriceJump: 72, scouting: 'Youngest top prospect in MiLB. Advanced bat for age with plus raw power.' },
  { id: 'p-bb-04', name: 'Travis Bazzana', sport: 'Baseball', position: '2B', age: 22, team: 'Akron RubberDucks', prospectLeague: 'MiLB', stage: 'drafted', ranking: 7, projectedDraftPos: 1, keyStats: { AVG: '.305', HR: '12', OBP: '.410' }, cardValuePreDraft: 10, cardValuePostDraft: 30, cardValueMinors: 55, cardValueCallUp: 120, cardValueRookie: 165, callUpProbability: 45, recentPromotion: false, avgPriceJump: 48, scouting: 'Elite contact hitter from Oregon State. Outstanding plate discipline.' },
  { id: 'p-bb-05', name: 'Roman Anthony', sport: 'Baseball', position: 'OF', age: 20, team: 'Portland Sea Dogs', prospectLeague: 'MiLB', stage: 'minor_league', ranking: 4, projectedDraftPos: 0, keyStats: { AVG: '.288', HR: '16', SB: '15' }, cardValuePreDraft: 10, cardValuePostDraft: 28, cardValueMinors: 60, cardValueCallUp: 135, cardValueRookie: 190, callUpProbability: 65, recentPromotion: true, promotionDate: '2026-02-20', avgPriceJump: 58, scouting: 'Premium power-speed combo. Recently promoted to AA, performing above expectations.' },
  { id: 'p-bb-06', name: 'Marcelo Mayer', sport: 'Baseball', position: 'SS', age: 21, team: 'Worcester Red Sox', prospectLeague: 'MiLB', stage: 'minor_league', ranking: 8, projectedDraftPos: 4, keyStats: { AVG: '.290', HR: '11', OPS: '.840' }, cardValuePreDraft: 12, cardValuePostDraft: 32, cardValueMinors: 55, cardValueCallUp: 115, cardValueRookie: 160, callUpProbability: 60, recentPromotion: false, avgPriceJump: 52, scouting: 'Smooth swing, advanced approach. Plus defensive SS with sneaky pop.' },
  { id: 'p-bb-07', name: 'Colson Montgomery', sport: 'Baseball', position: 'SS', age: 22, team: 'Charlotte Knights', prospectLeague: 'MiLB', stage: 'minor_league', ranking: 12, projectedDraftPos: 22, keyStats: { AVG: '.272', HR: '15', RBI: '68' }, cardValuePreDraft: 6, cardValuePostDraft: 18, cardValueMinors: 38, cardValueCallUp: 85, cardValueRookie: 120, callUpProbability: 70, recentPromotion: false, avgPriceJump: 45, scouting: 'Long-levered power from left side. AAA numbers suggest MLB-ready bat.' },
  { id: 'p-bb-08', name: 'Chase Burns', sport: 'Baseball', position: 'RHP', age: 22, team: 'Daytona Tortugas', prospectLeague: 'MiLB', stage: 'drafted', ranking: 6, projectedDraftPos: 2, keyStats: { ERA: '2.15', K: '145', WHIP: '0.95' }, cardValuePreDraft: 8, cardValuePostDraft: 25, cardValueMinors: 40, cardValueCallUp: 90, cardValueRookie: 130, callUpProbability: 35, recentPromotion: false, avgPriceJump: 50, scouting: 'Triple-digit heat with wipeout slider. Elite upside arm from Wake Forest.' },
  { id: 'p-bb-09', name: 'Sebastian Walcott', sport: 'Baseball', position: 'SS', age: 18, team: 'Hickory Crawdads', prospectLeague: 'MiLB', stage: 'minor_league', ranking: 9, projectedDraftPos: 0, keyStats: { AVG: '.265', HR: '14', SB: '20' }, cardValuePreDraft: 5, cardValuePostDraft: 15, cardValueMinors: 35, cardValueCallUp: 80, cardValueRookie: 130, callUpProbability: 15, recentPromotion: false, avgPriceJump: 68, scouting: 'Elite athlete with plus raw power. Tools are off the charts for his age.' },
  { id: 'p-bb-10', name: 'JJ Wetherholt', sport: 'Baseball', position: '2B', age: 22, team: 'Altoona Curve', prospectLeague: 'MiLB', stage: 'drafted', ranking: 14, projectedDraftPos: 7, keyStats: { AVG: '.310', HR: '8', OBP: '.405' }, cardValuePreDraft: 7, cardValuePostDraft: 22, cardValueMinors: 40, cardValueCallUp: 85, cardValueRookie: 115, callUpProbability: 40, recentPromotion: false, avgPriceJump: 42, scouting: 'Pure hitter with outstanding contact skills. West Virginia product with high floor.' },
  { id: 'p-bb-11', name: 'Roki Sasaki', sport: 'Baseball', position: 'RHP', age: 24, team: 'Rancho Cucamonga Quakes', prospectLeague: 'MiLB', stage: 'call_up', ranking: 2, projectedDraftPos: 0, keyStats: { ERA: '1.85', K: '160', 'K/9': '13.2' }, cardValuePreDraft: 30, cardValuePostDraft: 60, cardValueMinors: 90, cardValueCallUp: 220, cardValueRookie: 350, callUpProbability: 95, recentPromotion: true, promotionDate: '2026-03-01', avgPriceJump: 75, scouting: 'Japanese phenom with 102 mph fastball. Dodgers call-up imminent.' },
  { id: 'p-bb-12', name: 'Charlie Condon', sport: 'Baseball', position: '3B', age: 21, team: 'Bowie Baysox', prospectLeague: 'NCAA-BSB', stage: 'drafted', ranking: 10, projectedDraftPos: 3, keyStats: { AVG: '.385', HR: '32', OPS: '1.250' }, cardValuePreDraft: 10, cardValuePostDraft: 35, cardValueMinors: 50, cardValueCallUp: 105, cardValueRookie: 155, callUpProbability: 30, recentPromotion: false, avgPriceJump: 55, scouting: 'Historic college power numbers from Georgia. Adjusting to wood bats in pro ball.' },

  // ─── Basketball (G-League / NCAA) ──────────────────────────
  { id: 'p-bk-01', name: 'Cooper Flagg', sport: 'Basketball', position: 'SF', age: 18, team: 'Duke Blue Devils', prospectLeague: 'NCAA-BB', stage: 'amateur', ranking: 1, projectedDraftPos: 1, keyStats: { PPG: '18.5', RPG: '8.2', APG: '3.5' }, cardValuePreDraft: 25, cardValuePostDraft: 120, cardValueMinors: 150, cardValueCallUp: 280, cardValueRookie: 400, callUpProbability: 0, recentPromotion: false, avgPriceJump: 78, scouting: 'Generational two-way talent. Projected #1 pick with LeBron-level hype.' },
  { id: 'p-bk-02', name: 'Ace Bailey', sport: 'Basketball', position: 'SF', age: 19, team: 'Rutgers Scarlet Knights', prospectLeague: 'NCAA-BB', stage: 'amateur', ranking: 2, projectedDraftPos: 2, keyStats: { PPG: '20.1', RPG: '7.5', FG: '.485' }, cardValuePreDraft: 18, cardValuePostDraft: 85, cardValueMinors: 110, cardValueCallUp: 200, cardValueRookie: 300, callUpProbability: 0, recentPromotion: false, avgPriceJump: 72, scouting: 'Silky smooth scorer with prototypical wing build. Elite shooting stroke.' },
  { id: 'p-bk-03', name: 'Dylan Harper', sport: 'Basketball', position: 'PG', age: 19, team: 'Rutgers Scarlet Knights', prospectLeague: 'NCAA-BB', stage: 'amateur', ranking: 3, projectedDraftPos: 3, keyStats: { PPG: '22.4', APG: '5.8', FT: '.865' }, cardValuePreDraft: 15, cardValuePostDraft: 70, cardValueMinors: 95, cardValueCallUp: 175, cardValueRookie: 265, callUpProbability: 0, recentPromotion: false, avgPriceJump: 68, scouting: 'Dynamic playmaker with deep range. Son of Ron Harper, elite basketball pedigree.' },
  { id: 'p-bk-04', name: 'VJ Edgecombe', sport: 'Basketball', position: 'SG', age: 19, team: 'Baylor Bears', prospectLeague: 'NCAA-BB', stage: 'amateur', ranking: 5, projectedDraftPos: 5, keyStats: { PPG: '16.8', APG: '3.2', STL: '1.8' }, cardValuePreDraft: 10, cardValuePostDraft: 45, cardValueMinors: 65, cardValueCallUp: 120, cardValueRookie: 180, callUpProbability: 0, recentPromotion: false, avgPriceJump: 60, scouting: 'Explosive Bahamian guard with elite athleticism. Transition game is special.' },
  { id: 'p-bk-05', name: 'Kasparas Jakucionis', sport: 'Basketball', position: 'PG', age: 19, team: 'Illinois Fighting Illini', prospectLeague: 'NCAA-BB', stage: 'amateur', ranking: 6, projectedDraftPos: 6, keyStats: { PPG: '15.2', APG: '6.5', RPG: '5.1' }, cardValuePreDraft: 8, cardValuePostDraft: 38, cardValueMinors: 55, cardValueCallUp: 105, cardValueRookie: 160, callUpProbability: 0, recentPromotion: false, avgPriceJump: 55, scouting: 'Lithuanian floor general with elite size for position. High basketball IQ.' },
  { id: 'p-bk-06', name: 'Nolan Traore', sport: 'Basketball', position: 'PG', age: 19, team: 'Paris Basketball', prospectLeague: 'G-League', stage: 'amateur', ranking: 7, projectedDraftPos: 7, keyStats: { PPG: '12.5', APG: '7.2', STL: '2.1' }, cardValuePreDraft: 8, cardValuePostDraft: 35, cardValueMinors: 50, cardValueCallUp: 95, cardValueRookie: 145, callUpProbability: 0, recentPromotion: false, avgPriceJump: 52, scouting: 'French point guard with blazing speed. Best pure passer in class.' },
  { id: 'p-bk-07', name: 'Tre Johnson', sport: 'Basketball', position: 'SG', age: 19, team: 'Texas Longhorns', prospectLeague: 'NCAA-BB', stage: 'amateur', ranking: 4, projectedDraftPos: 4, keyStats: { PPG: '19.8', '3PT': '.398', FT: '.880' }, cardValuePreDraft: 12, cardValuePostDraft: 55, cardValueMinors: 75, cardValueCallUp: 140, cardValueRookie: 210, callUpProbability: 0, recentPromotion: false, avgPriceJump: 62, scouting: 'Shot-making guard with deep range. Clutch performer with elite scoring instincts.' },
  { id: 'p-bk-08', name: 'Khaman Maluach', sport: 'Basketball', position: 'C', age: 18, team: 'Duke Blue Devils', prospectLeague: 'NCAA-BB', stage: 'amateur', ranking: 10, projectedDraftPos: 10, keyStats: { PPG: '10.5', RPG: '7.8', BPG: '2.5' }, cardValuePreDraft: 6, cardValuePostDraft: 28, cardValueMinors: 40, cardValueCallUp: 75, cardValueRookie: 115, callUpProbability: 0, recentPromotion: false, avgPriceJump: 48, scouting: 'Massive 7-2 center with elite rim protection. Raw but immense upside.' },
  { id: 'p-bk-09', name: 'Liam McNeeley', sport: 'Basketball', position: 'SF', age: 19, team: 'UConn Huskies', prospectLeague: 'NCAA-BB', stage: 'amateur', ranking: 8, projectedDraftPos: 8, keyStats: { PPG: '14.5', RPG: '5.8', '3PT': '.385' }, cardValuePreDraft: 7, cardValuePostDraft: 32, cardValueMinors: 48, cardValueCallUp: 90, cardValueRookie: 135, callUpProbability: 0, recentPromotion: false, avgPriceJump: 50, scouting: 'Smooth two-way wing with plus shooting. UConn system maximizes his tools.' },
  { id: 'p-bk-10', name: 'Egor Demin', sport: 'Basketball', position: 'PG', age: 19, team: 'BYU Cougars', prospectLeague: 'NCAA-BB', stage: 'amateur', ranking: 12, projectedDraftPos: 12, keyStats: { PPG: '13.2', APG: '5.5', RPG: '4.8' }, cardValuePreDraft: 5, cardValuePostDraft: 25, cardValueMinors: 38, cardValueCallUp: 70, cardValueRookie: 105, callUpProbability: 0, recentPromotion: false, avgPriceJump: 45, scouting: 'Russian-born playmaker with excellent court vision and deceptive athleticism.' },

  // ─── Football (NCAA) ───────────────────────────────────────
  { id: 'p-fb-01', name: 'Shedeur Sanders', sport: 'Football', position: 'QB', age: 22, team: 'Colorado Buffaloes', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 1, projectedDraftPos: 1, keyStats: { YDS: '4,134', TD: '37', INT: '10' }, cardValuePreDraft: 20, cardValuePostDraft: 85, cardValueMinors: 100, cardValueCallUp: 180, cardValueRookie: 280, callUpProbability: 0, recentPromotion: false, avgPriceJump: 65, scouting: 'Polished passer with elite accuracy. NFL bloodlines and leadership presence.' },
  { id: 'p-fb-02', name: 'Cam Ward', sport: 'Football', position: 'QB', age: 23, team: 'Miami Hurricanes', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 2, projectedDraftPos: 2, keyStats: { YDS: '4,313', TD: '39', RATE: '162.5' }, cardValuePreDraft: 18, cardValuePostDraft: 78, cardValueMinors: 95, cardValueCallUp: 170, cardValueRookie: 260, callUpProbability: 0, recentPromotion: false, avgPriceJump: 62, scouting: 'Strong arm with improv ability. Best deep ball in the class with gunslinger mentality.' },
  { id: 'p-fb-03', name: 'Travis Hunter', sport: 'Football', position: 'WR/CB', age: 21, team: 'Colorado Buffaloes', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 3, projectedDraftPos: 3, keyStats: { REC: '92', YDS: '1,152', TD: '14' }, cardValuePreDraft: 22, cardValuePostDraft: 95, cardValueMinors: 115, cardValueCallUp: 200, cardValueRookie: 320, callUpProbability: 0, recentPromotion: false, avgPriceJump: 70, scouting: 'Heisman winner. Two-way star — best WR and CB in one player. Generational.' },
  { id: 'p-fb-04', name: 'Tetairoa McMillan', sport: 'Football', position: 'WR', age: 21, team: 'Arizona Wildcats', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 5, projectedDraftPos: 5, keyStats: { REC: '84', YDS: '1,319', TD: '10' }, cardValuePreDraft: 12, cardValuePostDraft: 50, cardValueMinors: 65, cardValueCallUp: 120, cardValueRookie: 185, callUpProbability: 0, recentPromotion: false, avgPriceJump: 55, scouting: 'Elite contested-catch WR with 6-5 frame. Comparison to AJ Green.' },
  { id: 'p-fb-05', name: 'Abdul Carter', sport: 'Football', position: 'EDGE', age: 21, team: 'Penn State Nittany Lions', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 4, projectedDraftPos: 4, keyStats: { SACK: '12', TFL: '18', FF: '4' }, cardValuePreDraft: 10, cardValuePostDraft: 42, cardValueMinors: 55, cardValueCallUp: 105, cardValueRookie: 160, callUpProbability: 0, recentPromotion: false, avgPriceJump: 52, scouting: 'Explosive edge rusher with elite first step. Versatile linebacker-DE hybrid.' },
  { id: 'p-fb-06', name: 'Mason Graham', sport: 'Football', position: 'DT', age: 21, team: 'Michigan Wolverines', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 6, projectedDraftPos: 6, keyStats: { SACK: '5', TFL: '12', PD: '3' }, cardValuePreDraft: 8, cardValuePostDraft: 30, cardValueMinors: 42, cardValueCallUp: 80, cardValueRookie: 120, callUpProbability: 0, recentPromotion: false, avgPriceJump: 45, scouting: 'Dominant interior presence. Best DT prospect since Quinnen Williams.' },
  { id: 'p-fb-07', name: 'Will Johnson', sport: 'Football', position: 'CB', age: 21, team: 'Michigan Wolverines', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 7, projectedDraftPos: 8, keyStats: { INT: '4', PBU: '12', TKL: '38' }, cardValuePreDraft: 7, cardValuePostDraft: 28, cardValueMinors: 40, cardValueCallUp: 75, cardValueRookie: 110, callUpProbability: 0, recentPromotion: false, avgPriceJump: 42, scouting: 'Lockdown corner with ball skills. Elite recovery speed and press technique.' },
  { id: 'p-fb-08', name: 'Ashton Jeanty', sport: 'Football', position: 'RB', age: 21, team: 'Boise State Broncos', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 8, projectedDraftPos: 10, keyStats: { YDS: '2,497', TD: '29', YPC: '7.0' }, cardValuePreDraft: 10, cardValuePostDraft: 40, cardValueMinors: 55, cardValueCallUp: 100, cardValueRookie: 155, callUpProbability: 0, recentPromotion: false, avgPriceJump: 50, scouting: 'Record-chasing RB with incredible vision. Nearly broke Barry Sanders single-season record.' },
  { id: 'p-fb-09', name: 'Mykel Williams', sport: 'Football', position: 'EDGE', age: 21, team: 'Georgia Bulldogs', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 9, projectedDraftPos: 9, keyStats: { SACK: '8', TFL: '14', QBH: '10' }, cardValuePreDraft: 7, cardValuePostDraft: 28, cardValueMinors: 38, cardValueCallUp: 72, cardValueRookie: 108, callUpProbability: 0, recentPromotion: false, avgPriceJump: 42, scouting: 'Powerful pass rusher with NFL-ready frame. Georgia pipeline producing another star.' },
  { id: 'p-fb-10', name: 'Kelvin Banks Jr.', sport: 'Football', position: 'OT', age: 21, team: 'Texas Longhorns', prospectLeague: 'NCAA-FB', stage: 'amateur', ranking: 10, projectedDraftPos: 12, keyStats: { 'Pass Block': '95.2', Starts: '38', 'Sacks Allowed': '2' }, cardValuePreDraft: 5, cardValuePostDraft: 20, cardValueMinors: 30, cardValueCallUp: 55, cardValueRookie: 85, callUpProbability: 0, recentPromotion: false, avgPriceJump: 38, scouting: 'Elite pass-blocking LT. Smooth mover with long arms and excellent technique.' },

  // ─── Hockey (CHL / NCAA) ───────────────────────────────────
  { id: 'p-hk-01', name: 'James Hagens', sport: 'Hockey', position: 'C', age: 18, team: 'Boston College Eagles', prospectLeague: 'NCAA-HK', stage: 'amateur', ranking: 1, projectedDraftPos: 1, keyStats: { G: '22', A: '35', PTS: '57' }, cardValuePreDraft: 15, cardValuePostDraft: 55, cardValueMinors: 75, cardValueCallUp: 150, cardValueRookie: 220, callUpProbability: 0, recentPromotion: false, avgPriceJump: 65, scouting: 'Elite playmaking center. Best skater in draft class with exceptional hockey sense.' },
  { id: 'p-hk-02', name: 'Porter Martone', sport: 'Hockey', position: 'RW', age: 18, team: 'Brampton Steelheads', prospectLeague: 'CHL', stage: 'amateur', ranking: 2, projectedDraftPos: 2, keyStats: { G: '42', A: '38', PTS: '80' }, cardValuePreDraft: 12, cardValuePostDraft: 45, cardValueMinors: 65, cardValueCallUp: 130, cardValueRookie: 195, callUpProbability: 0, recentPromotion: false, avgPriceJump: 60, scouting: 'Power forward with elite shot. Physical presence with skill to match.' },
  { id: 'p-hk-03', name: 'Ivan Demidov', sport: 'Hockey', position: 'LW', age: 19, team: 'SKA St. Petersburg', prospectLeague: 'CHL', stage: 'drafted', ranking: 3, projectedDraftPos: 5, keyStats: { G: '15', A: '22', PTS: '37' }, cardValuePreDraft: 10, cardValuePostDraft: 40, cardValueMinors: 60, cardValueCallUp: 125, cardValueRookie: 190, callUpProbability: 55, recentPromotion: true, promotionDate: '2026-02-15', avgPriceJump: 58, scouting: 'Dynamic Russian winger with elite offensive instincts. Montreal pick developing in KHL.' },
  { id: 'p-hk-04', name: 'Matthew Schaefer', sport: 'Hockey', position: 'LD', age: 18, team: 'Erie Otters', prospectLeague: 'CHL', stage: 'amateur', ranking: 4, projectedDraftPos: 3, keyStats: { G: '12', A: '40', PTS: '52' }, cardValuePreDraft: 10, cardValuePostDraft: 38, cardValueMinors: 55, cardValueCallUp: 110, cardValueRookie: 165, callUpProbability: 0, recentPromotion: false, avgPriceJump: 55, scouting: 'Skating defenseman with elite first pass. Comparison to Cale Makar.' },
  { id: 'p-hk-05', name: 'Michael Misa', sport: 'Hockey', position: 'C', age: 18, team: 'Saginaw Spirit', prospectLeague: 'CHL', stage: 'amateur', ranking: 5, projectedDraftPos: 4, keyStats: { G: '38', A: '42', PTS: '80' }, cardValuePreDraft: 9, cardValuePostDraft: 35, cardValueMinors: 50, cardValueCallUp: 100, cardValueRookie: 155, callUpProbability: 0, recentPromotion: false, avgPriceJump: 52, scouting: 'Exceptional talent granted early OHL entry. High-end skill with creativity.' },
  { id: 'p-hk-06', name: 'Macklin Celebrini', sport: 'Hockey', position: 'C', age: 19, team: 'San Jose Barracuda', prospectLeague: 'CHL', stage: 'call_up', ranking: 6, projectedDraftPos: 1, keyStats: { G: '18', A: '25', PTS: '43' }, cardValuePreDraft: 20, cardValuePostDraft: 65, cardValueMinors: 85, cardValueCallUp: 175, cardValueRookie: 280, callUpProbability: 92, recentPromotion: true, promotionDate: '2026-03-05', avgPriceJump: 70, scouting: '#1 pick showing star potential in AHL. San Jose call-up expected any day.' },
  { id: 'p-hk-07', name: 'Zeev Buium', sport: 'Hockey', position: 'LD', age: 19, team: 'Denver Pioneers', prospectLeague: 'NCAA-HK', stage: 'drafted', ranking: 8, projectedDraftPos: 12, keyStats: { G: '10', A: '32', PTS: '42' }, cardValuePreDraft: 7, cardValuePostDraft: 25, cardValueMinors: 38, cardValueCallUp: 75, cardValueRookie: 110, callUpProbability: 30, recentPromotion: false, avgPriceJump: 48, scouting: 'Smooth-skating defenseman with elite offensive instincts from the blue line.' },
  { id: 'p-hk-08', name: 'Tij Iginla', sport: 'Hockey', position: 'LW', age: 18, team: 'Kelowna Rockets', prospectLeague: 'CHL', stage: 'drafted', ranking: 7, projectedDraftPos: 6, keyStats: { G: '35', A: '30', PTS: '65' }, cardValuePreDraft: 8, cardValuePostDraft: 30, cardValueMinors: 45, cardValueCallUp: 90, cardValueRookie: 140, callUpProbability: 20, recentPromotion: false, avgPriceJump: 50, scouting: 'Son of Jarome Iginla. Complete power forward with NHL-caliber shot already.' },
  { id: 'p-hk-09', name: 'Anton Silayev', sport: 'Hockey', position: 'LD', age: 19, team: 'Utica Comets', prospectLeague: 'CHL', stage: 'minor_league', ranking: 11, projectedDraftPos: 10, keyStats: { G: '5', A: '18', PTS: '23' }, cardValuePreDraft: 5, cardValuePostDraft: 18, cardValueMinors: 32, cardValueCallUp: 65, cardValueRookie: 100, callUpProbability: 40, recentPromotion: false, avgPriceJump: 45, scouting: '6-7 Russian defenseman with elite reach. Developing in AHL with big upside.' },
  { id: 'p-hk-10', name: 'Carter Yakemchuk', sport: 'Hockey', position: 'RD', age: 19, team: 'Belleville Senators', prospectLeague: 'CHL', stage: 'minor_league', ranking: 13, projectedDraftPos: 7, keyStats: { G: '8', A: '20', PTS: '28' }, cardValuePreDraft: 6, cardValuePostDraft: 22, cardValueMinors: 35, cardValueCallUp: 70, cardValueRookie: 105, callUpProbability: 35, recentPromotion: false, avgPriceJump: 42, scouting: 'Offensive defenseman with cannon shot from the point. High-risk, high-reward.' },

  // ─── Soccer (no minor league pipeline — use academy → first team) ──
  { id: 'p-sc-01', name: 'Lamine Yamal', sport: 'Soccer', position: 'RW', age: 17, team: 'FC Barcelona', prospectLeague: 'NCAA-BB', stage: 'rookie', ranking: 1, projectedDraftPos: 0, keyStats: { G: '12', A: '15', Apps: '38' }, cardValuePreDraft: 50, cardValuePostDraft: 120, cardValueMinors: 200, cardValueCallUp: 400, cardValueRookie: 650, callUpProbability: 100, recentPromotion: false, avgPriceJump: 80, scouting: 'Teenage sensation already world class. Euro 2024 breakout star for Spain.' },
  { id: 'p-sc-02', name: 'Endrick', sport: 'Soccer', position: 'ST', age: 18, team: 'Real Madrid', prospectLeague: 'NCAA-BB', stage: 'rookie', ranking: 2, projectedDraftPos: 0, keyStats: { G: '6', A: '3', Apps: '22' }, cardValuePreDraft: 25, cardValuePostDraft: 60, cardValueMinors: 90, cardValueCallUp: 180, cardValueRookie: 300, callUpProbability: 100, recentPromotion: false, avgPriceJump: 65, scouting: 'Brazilian wonderkid at Real Madrid. Explosive finisher with raw talent.' },
  { id: 'p-sc-03', name: 'Cavan Sullivan', sport: 'Soccer', position: 'CAM', age: 15, team: 'Philadelphia Union II', prospectLeague: 'G-League', stage: 'minor_league', ranking: 3, projectedDraftPos: 0, keyStats: { G: '4', A: '8', Apps: '18' }, cardValuePreDraft: 5, cardValuePostDraft: 12, cardValueMinors: 25, cardValueCallUp: 60, cardValueRookie: 100, callUpProbability: 30, recentPromotion: false, avgPriceJump: 55, scouting: 'Youngest MLS debutant ever. American wonderkid with Man City academy interest.' },
  { id: 'p-sc-04', name: 'Estevao Willian', sport: 'Soccer', position: 'RW', age: 18, team: 'Palmeiras', prospectLeague: 'G-League', stage: 'minor_league', ranking: 4, projectedDraftPos: 0, keyStats: { G: '10', A: '7', Apps: '30' }, cardValuePreDraft: 10, cardValuePostDraft: 30, cardValueMinors: 55, cardValueCallUp: 110, cardValueRookie: 175, callUpProbability: 60, recentPromotion: false, avgPriceJump: 58, scouting: 'Chelsea-bound Brazilian winger. Dazzling dribbler with end product.' },
  { id: 'p-sc-05', name: 'Pau Cubarsi', sport: 'Soccer', position: 'CB', age: 17, team: 'FC Barcelona', prospectLeague: 'NCAA-BB', stage: 'rookie', ranking: 5, projectedDraftPos: 0, keyStats: { Apps: '35', 'Clean Sheets': '18', 'Pass%': '92' }, cardValuePreDraft: 15, cardValuePostDraft: 40, cardValueMinors: 70, cardValueCallUp: 140, cardValueRookie: 220, callUpProbability: 100, recentPromotion: false, avgPriceJump: 62, scouting: 'Teenage CB starting for Barca. Composure and reading of the game beyond his years.' },
  { id: 'p-sc-06', name: 'Kendry Paez', sport: 'Soccer', position: 'CAM', age: 17, team: 'Independiente del Valle', prospectLeague: 'G-League', stage: 'minor_league', ranking: 8, projectedDraftPos: 0, keyStats: { G: '8', A: '10', Apps: '25' }, cardValuePreDraft: 6, cardValuePostDraft: 18, cardValueMinors: 35, cardValueCallUp: 72, cardValueRookie: 115, callUpProbability: 45, recentPromotion: false, avgPriceJump: 50, scouting: 'Ecuadorian playmaker signed by Chelsea. Creative technician with set-piece prowess.' },
];

// ── Build full prospects with value curves ───────────────────────────────────────

function buildProspects(): Prospect[] {
  return PROSPECT_DATA.map(p => {
    const seed = hashStr(p.id);
    const stageMultipliers = [1.02, 1.05, 1.08, 1.15, 1.03];
    const valueCurve = generateCurve(seed, p.cardValuePreDraft, stageMultipliers);
    return { ...p, valueCurve };
  });
}

let _cachedProspects: Prospect[] | null = null;
function getAllProspectsInternal(): Prospect[] {
  if (!_cachedProspects) _cachedProspects = buildProspects();
  return _cachedProspects;
}

// ── Public API ───────────────────────────────────────────────────────────────────

export function getAllProspects(): Prospect[] {
  return getAllProspectsInternal();
}

export function getProspectById(id: string): Prospect | undefined {
  return getAllProspectsInternal().find(p => p.id === id);
}

export function getProspectsBySport(sport: Sport): Prospect[] {
  return getAllProspectsInternal().filter(p => p.sport === sport);
}

export function getProspectsByStage(stage: ProspectStage): Prospect[] {
  return getAllProspectsInternal().filter(p => p.stage === stage);
}

export function searchProspects(query: string): Prospect[] {
  const q = query.toLowerCase();
  return getAllProspectsInternal().filter(
    p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || p.sport.toLowerCase().includes(q)
  );
}

// ── Pipeline funnel ──────────────────────────────────────────────────────────────

const STAGE_ORDER: ProspectStage[] = ['amateur', 'drafted', 'minor_league', 'call_up', 'rookie'];
const STAGE_LABELS: Record<ProspectStage, string> = {
  amateur: 'Amateur / NCAA',
  drafted: 'Drafted',
  minor_league: 'Minor League',
  call_up: 'Call-Up Ready',
  rookie: 'Rookie',
};

export function getPipelineFunnel(sport?: Sport): PipelineFunnelStage[] {
  const prospects = sport ? getProspectsBySport(sport) : getAllProspectsInternal();
  return STAGE_ORDER.map(stage => {
    const stageProspects = prospects.filter(p => p.stage === stage);
    const valueKey = `cardValue${stage === 'amateur' ? 'PreDraft' : stage === 'drafted' ? 'PostDraft' : stage === 'minor_league' ? 'Minors' : stage === 'call_up' ? 'CallUp' : 'Rookie'}` as keyof Prospect;
    const avgVal = stageProspects.length > 0
      ? stageProspects.reduce((sum, p) => sum + (p[valueKey] as number), 0) / stageProspects.length
      : 0;
    return {
      stage,
      label: STAGE_LABELS[stage],
      count: stageProspects.length,
      avgCardValue: Math.round(avgVal * 100) / 100,
      prospects: stageProspects,
    };
  });
}

export function getStageLabel(stage: ProspectStage): string {
  return STAGE_LABELS[stage];
}

// ── Draft board ──────────────────────────────────────────────────────────────────

export function getDraftBoard(sport?: Sport): DraftBoardEntry[] {
  const prospects = sport ? getProspectsBySport(sport) : getAllProspectsInternal();
  return prospects
    .filter(p => p.projectedDraftPos > 0)
    .sort((a, b) => a.projectedDraftPos - b.projectedDraftPos)
    .map(p => ({
      prospectId: p.id,
      projectedPick: p.projectedDraftPos,
      preDraftValue: p.cardValuePreDraft,
      postDraftImpact: Math.round(((p.cardValuePostDraft - p.cardValuePreDraft) / p.cardValuePreDraft) * 100),
      team: p.team,
    }));
}

// ── Call-up alerts ───────────────────────────────────────────────────────────────

export function getCallUpAlerts(): CallUpAlert[] {
  const acked = getAcknowledgedAlerts();
  const prospects = getAllProspectsInternal();

  const alerts: CallUpAlert[] = [];

  // Recent promotions
  for (const p of prospects) {
    if (p.recentPromotion && p.promotionDate) {
      alerts.push({
        id: `callup-${p.id}`,
        prospectId: p.id,
        prospectName: p.name,
        sport: p.sport,
        fromStage: p.stage === 'call_up' ? 'minor_league' : p.stage === 'rookie' ? 'call_up' : 'drafted',
        toStage: p.stage,
        priceJump: p.avgPriceJump,
        date: p.promotionDate,
        acknowledged: acked.includes(`callup-${p.id}`),
      });
    }
  }

  // High call-up probability alerts
  for (const p of prospects) {
    if (p.callUpProbability >= 80 && !p.recentPromotion) {
      alerts.push({
        id: `pending-${p.id}`,
        prospectId: p.id,
        prospectName: p.name,
        sport: p.sport,
        fromStage: p.stage,
        toStage: p.stage === 'minor_league' ? 'call_up' : p.stage === 'call_up' ? 'rookie' : p.stage,
        priceJump: p.avgPriceJump,
        date: new Date().toISOString().split('T')[0],
        acknowledged: acked.includes(`pending-${p.id}`),
      });
    }
  }

  return alerts.sort((a, b) => b.priceJump - a.priceJump);
}

// ── Prospect value at specific stage ─────────────────────────────────────────────

export function getValueAtStage(prospect: Prospect, stage: ProspectStage): number {
  switch (stage) {
    case 'amateur': return prospect.cardValuePreDraft;
    case 'drafted': return prospect.cardValuePostDraft;
    case 'minor_league': return prospect.cardValueMinors;
    case 'call_up': return prospect.cardValueCallUp;
    case 'rookie': return prospect.cardValueRookie;
  }
}

// ── Prospect comparison ──────────────────────────────────────────────────────────

export interface ProspectComparison {
  prospect1: Prospect;
  prospect2: Prospect;
  stages: { stage: ProspectStage; label: string; value1: number; value2: number }[];
}

export function compareProspects(id1: string, id2: string): ProspectComparison | null {
  const p1 = getProspectById(id1);
  const p2 = getProspectById(id2);
  if (!p1 || !p2) return null;

  const stages = STAGE_ORDER.map(stage => ({
    stage,
    label: STAGE_LABELS[stage],
    value1: getValueAtStage(p1, stage),
    value2: getValueAtStage(p2, stage),
  }));

  return { prospect1: p1, prospect2: p2, stages };
}

// ── Nearest to call-up (for widget) ──────────────────────────────────────────────

export function getProspectsNearestCallUp(limit = 5): Prospect[] {
  return getAllProspectsInternal()
    .filter(p => p.callUpProbability > 0 && p.stage !== 'rookie')
    .sort((a, b) => b.callUpProbability - a.callUpProbability)
    .slice(0, limit);
}

export function getRecentPromotions(): Prospect[] {
  return getAllProspectsInternal().filter(p => p.recentPromotion);
}

// ── Stash tracker (syncStore) ────────────────────────────────────────────

export function getStashEntries(): StashEntry[] {
  return store.get<StashEntry[]>(STORAGE_STASH, []);
}

function saveStashEntries(entries: StashEntry[]): void {
  store.set(STORAGE_STASH, entries);
}

export function addStashEntry(entry: Omit<StashEntry, 'id'>): StashEntry {
  const entries = getStashEntries();
  const newEntry: StashEntry = { ...entry, id: `stash-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
  entries.push(newEntry);
  saveStashEntries(entries);
  return newEntry;
}

export function removeStashEntry(id: string): void {
  const entries = getStashEntries().filter(e => e.id !== id);
  saveStashEntries(entries);
}

export function updateStashEntry(id: string, updates: Partial<StashEntry>): void {
  const entries = getStashEntries().map(e => (e.id === id ? { ...e, ...updates } : e));
  saveStashEntries(entries);
}

export function getStashSummary(): StashPortfolioSummary {
  const entries = getStashEntries();
  if (entries.length === 0) {
    return { totalInvested: 0, currentValue: 0, targetValue: 0, roi: 0, count: 0 };
  }
  const totalInvested = entries.reduce((s, e) => s + e.purchasePrice, 0);
  const currentValue = entries.reduce((s, e) => s + e.currentValue, 0);
  const targetValue = entries.reduce((s, e) => s + e.targetExitPrice, 0);
  const roi = totalInvested > 0 ? Math.round(((currentValue - totalInvested) / totalInvested) * 100) : 0;
  return { totalInvested, currentValue, targetValue, roi, count: entries.length };
}

// ── Followed prospects (syncStore) ────────────────────────────────────────────

export function getFollowedProspects(): string[] {
  return store.get<string[]>(STORAGE_FOLLOWED, []);
}

export function followProspect(id: string): void {
  const followed = getFollowedProspects();
  if (!followed.includes(id)) {
    followed.push(id);
    store.set(STORAGE_FOLLOWED, followed);
  }
}

export function unfollowProspect(id: string): void {
  const followed = getFollowedProspects().filter(fid => fid !== id);
  store.set(STORAGE_FOLLOWED, followed);
}

export function isProspectFollowed(id: string): boolean {
  return getFollowedProspects().includes(id);
}

// ── Alert acknowledgement ────────────────────────────────────────────────────────

function getAcknowledgedAlerts(): string[] {
  return store.get<string[]>(STORAGE_ALERTS_ACK, []);
}

export function acknowledgeAlert(alertId: string): void {
  const acked = getAcknowledgedAlerts();
  if (!acked.includes(alertId)) {
    acked.push(alertId);
    store.set(STORAGE_ALERTS_ACK, acked);
  }
}

// ── Alert preferences ────────────────────────────────────────────────────────────

export interface AlertPreferences {
  callUpAlerts: boolean;
  promotionAlerts: boolean;
  priceJumpThreshold: number; // minimum % to alert
}

const DEFAULT_PREFS: AlertPreferences = {
  callUpAlerts: true,
  promotionAlerts: true,
  priceJumpThreshold: 30,
};

export function getAlertPreferences(): AlertPreferences {
  if (store.has(STORAGE_PREFS)) {
    return { ...DEFAULT_PREFS, ...store.get<Partial<AlertPreferences>>(STORAGE_PREFS, {}) };
  }
  return DEFAULT_PREFS;
}

export function saveAlertPreferences(prefs: Partial<AlertPreferences>): void {
  const current = getAlertPreferences();
  store.set(STORAGE_PREFS, { ...current, ...prefs });
}
