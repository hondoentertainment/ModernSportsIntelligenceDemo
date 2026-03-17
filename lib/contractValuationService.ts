// Contract Valuation Service — player contract impacts on card values

export interface ContractImpact {
  id: string;
  playerName: string;
  team: string;
  sport: string;
  contractType: string;
  contractValue: number;
  years: number;
  annualAvg: number;
  cardImpact: number;
  affectedCards: string[];
  date: string;
  analysis: string;
}

export interface FreeAgent {
  id: string;
  playerName: string;
  currentTeam: string;
  sport: string;
  position: string;
  age: number;
  projectedContract: number;
  projectedYears: number;
  topSuitors: string[];
  cardVolatility: number;
  currentCardValue: number;
  projectedCardValue: number;
  freeAgencyDate: string;
}

export function getContractImpacts(): ContractImpact[] {
  return [
    { id: 'ci-1', playerName: 'Jayson Tatum', team: 'Boston Celtics', sport: 'NBA', contractType: 'Supermax Extension', contractValue: 315000000, years: 5, annualAvg: 63000000, cardImpact: 12.5, affectedCards: ['2017 Prizm Tatum RC', '2017 Optic Tatum RC'], date: '2026-02-15', analysis: 'Supermax signals franchise commitment. Cards stabilize with upside.' },
    { id: 'ci-2', playerName: 'Shohei Ohtani', team: 'Los Angeles Dodgers', sport: 'MLB', contractType: 'Mega Extension', contractValue: 700000000, years: 10, annualAvg: 70000000, cardImpact: 18.3, affectedCards: ['2018 Topps Ohtani RC', '2018 Bowman Chrome Ohtani'], date: '2025-12-09', analysis: 'Historic contract cements legacy status. Sustained demand on premium cards.' },
    { id: 'ci-3', playerName: 'Patrick Mahomes', team: 'Kansas City Chiefs', sport: 'NFL', contractType: 'Restructure', contractValue: 450000000, years: 10, annualAvg: 45000000, cardImpact: 5.2, affectedCards: ['2017 Prizm Mahomes RC', '2017 Optic Mahomes RC'], date: '2026-03-01', analysis: 'Restructure expected. Minimal new impact on already-premium cards.' },
    { id: 'ci-4', playerName: 'Caitlin Clark', team: 'Indiana Fever', sport: 'WNBA', contractType: 'Rookie Extension', contractValue: 800000, years: 4, annualAvg: 200000, cardImpact: 35.0, affectedCards: ['2024 Prizm Caitlin Clark RC'], date: '2026-04-01', analysis: 'Extension locks in star. WNBA card market still nascent with upside.' },
    { id: 'ci-5', playerName: 'Connor McDavid', team: 'Edmonton Oilers', sport: 'NHL', contractType: 'UFA Extension', contractValue: 120000000, years: 8, annualAvg: 15000000, cardImpact: 9.8, affectedCards: ['2015 Upper Deck YG McDavid RC'], date: '2026-01-20', analysis: 'Long-term commitment in Edmonton. Canadian market loyalty drives demand.' },
  ];
}

export function getFreeAgents(): FreeAgent[] {
  return [
    { id: 'fa-1', playerName: 'Saquon Barkley', currentTeam: 'Philadelphia Eagles', sport: 'NFL', position: 'RB', age: 29, projectedContract: 40000000, projectedYears: 2, topSuitors: ['Eagles', 'Cowboys', 'Bears'], cardVolatility: 22, currentCardValue: 85, projectedCardValue: 95, freeAgencyDate: '2027-03-01' },
    { id: 'fa-2', playerName: 'Anthony Edwards', currentTeam: 'Minnesota Timberwolves', sport: 'NBA', position: 'SG', age: 24, projectedContract: 260000000, projectedYears: 5, topSuitors: ['Timberwolves'], cardVolatility: 15, currentCardValue: 450, projectedCardValue: 520, freeAgencyDate: '2029-07-01' },
    { id: 'fa-3', playerName: 'Juan Soto', currentTeam: 'New York Mets', sport: 'MLB', position: 'OF', age: 27, projectedContract: 700000000, projectedYears: 15, topSuitors: ['Mets'], cardVolatility: 8, currentCardValue: 320, projectedCardValue: 380, freeAgencyDate: '2040-11-01' },
    { id: 'fa-4', playerName: 'Lamar Jackson', currentTeam: 'Baltimore Ravens', sport: 'NFL', position: 'QB', age: 29, projectedContract: 200000000, projectedYears: 5, topSuitors: ['Ravens', 'Falcons'], cardVolatility: 28, currentCardValue: 210, projectedCardValue: 240, freeAgencyDate: '2027-03-01' },
  ];
}
