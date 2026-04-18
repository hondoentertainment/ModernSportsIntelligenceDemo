// ---- Types ----

export type JumpCause = 'injury' | 'trade' | 'award' | 'scandal' | 'breakout-game' | 'grading-event' | 'media-viral' | 'market-crash';

export interface JumpEvent {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  date: string;
  priceBeforeJump: number;
  priceAfterJump: number;
  jumpPercent: number;
  cause: JumpCause;
  description: string;
  recoveryDays: number | null;
  permanent: boolean;
}

export interface DiffusionParameter {
  cardId: string;
  cardName: string;
  player: string;
  drift: number;
  diffusion: number;
  jumpIntensity: number;
  avgJumpSize: number;
  jumpVolatility: number;
  r2Fit: number;
}

export interface JumpDiffusionModel {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  currentPrice: number;
  drift: number;
  volatility: number;
  jumpFrequency: number;
  avgJumpMagnitude: number;
  projectedPrice30d: number;
  projectedPrice90d: number;
  jumpProbability30d: number;
  modelConfidence: number;
}

export interface ModelFit {
  month: string;
  actualPrice: number;
  modelPrice: number;
  driftComponent: number;
  diffusionComponent: number;
  jumpComponent: number;
  residual: number;
}

// ---- Mock Data ----

const mockJumpEvents: JumpEvent[] = [
  { id: 'je-1', cardName: '2023 Prizm Silver', player: 'Victor Wembanyama', sport: 'Basketball', date: '2026-03-15', priceBeforeJump: 8200, priceAfterJump: 11400, jumpPercent: 39.0, cause: 'breakout-game', description: '52-point triple-double in playoff game', recoveryDays: null, permanent: true },
  { id: 'je-2', cardName: '2020 Prizm Base', player: 'Justin Herbert', sport: 'Football', date: '2026-02-10', priceBeforeJump: 155, priceAfterJump: 92, jumpPercent: -40.6, cause: 'injury', description: 'Season-ending shoulder injury announced', recoveryDays: 45, permanent: false },
  { id: 'je-3', cardName: '2024 Topps Chrome Auto', player: 'Paul Skenes', sport: 'Baseball', date: '2026-04-02', priceBeforeJump: 1100, priceAfterJump: 1580, jumpPercent: 43.6, cause: 'award', description: 'NL Cy Young award announced', recoveryDays: null, permanent: true },
  { id: 'je-4', cardName: '2021 Topps Chrome Refractor', player: 'Wander Franco', sport: 'Baseball', date: '2025-08-14', priceBeforeJump: 185, priceAfterJump: 52, jumpPercent: -71.9, cause: 'scandal', description: 'Off-field legal issues surfaced', recoveryDays: null, permanent: true },
  { id: 'je-5', cardName: '2023 Optic Rated Rookie', player: 'Victor Wembanyama', sport: 'Basketball', date: '2026-01-22', priceBeforeJump: 620, priceAfterJump: 890, jumpPercent: 43.5, cause: 'media-viral', description: 'Viral highlight reel reached 50M views', recoveryDays: 28, permanent: false },
  { id: 'je-6', cardName: '2023 Prizm Base', player: 'Caleb Williams', sport: 'Football', date: '2026-03-28', priceBeforeJump: 110, priceAfterJump: 165, jumpPercent: 50.0, cause: 'breakout-game', description: 'Record-setting playoff comeback performance', recoveryDays: null, permanent: true },
  { id: 'je-7', cardName: '2019 Mosaic Base', player: 'Ja Morant', sport: 'Basketball', date: '2025-11-05', priceBeforeJump: 145, priceAfterJump: 78, jumpPercent: -46.2, cause: 'injury', description: 'ACL tear during regular season game', recoveryDays: 60, permanent: false },
  { id: 'je-8', cardName: '2023 Bowman Chrome 1st Auto', player: 'Jackson Holliday', sport: 'Baseball', date: '2026-04-10', priceBeforeJump: 2200, priceAfterJump: 2850, jumpPercent: 29.5, cause: 'breakout-game', description: 'First career grand slam in nationally televised game', recoveryDays: null, permanent: true },
  { id: 'je-9', cardName: '2022 Topps Chrome Auto', player: 'Julio Rodriguez', sport: 'Baseball', date: '2025-09-18', priceBeforeJump: 520, priceAfterJump: 340, jumpPercent: -34.6, cause: 'injury', description: 'Wrist fracture during batting practice', recoveryDays: 35, permanent: false },
  { id: 'je-10', cardName: '2020 Select Concourse', player: 'Joe Burrow', sport: 'Football', date: '2026-02-02', priceBeforeJump: 115, priceAfterJump: 195, jumpPercent: 69.6, cause: 'award', description: 'Super Bowl MVP performance', recoveryDays: null, permanent: true },
  { id: 'je-11', cardName: '2018 Prizm Silver', player: 'Luka Doncic', sport: 'Basketball', date: '2025-12-20', priceBeforeJump: 9200, priceAfterJump: 12500, jumpPercent: 35.9, cause: 'trade', description: 'Blockbuster trade to championship contender', recoveryDays: null, permanent: true },
  { id: 'je-12', cardName: '2022 Prizm Silver', player: 'Paolo Banchero', sport: 'Basketball', date: '2026-01-08', priceBeforeJump: 165, priceAfterJump: 98, jumpPercent: -40.6, cause: 'market-crash', description: 'Broad basketball card market correction', recoveryDays: 40, permanent: false },
  { id: 'je-13', cardName: '2024 Topps 1st Edition Auto', player: 'Paul Skenes', sport: 'Baseball', date: '2026-03-05', priceBeforeJump: 980, priceAfterJump: 1450, jumpPercent: 48.0, cause: 'grading-event', description: 'PSA population report showed only 12 PSA 10s', recoveryDays: null, permanent: true },
  { id: 'je-14', cardName: '2023 Select Concourse', player: 'CJ Stroud', sport: 'Football', date: '2026-01-15', priceBeforeJump: 180, priceAfterJump: 245, jumpPercent: 36.1, cause: 'breakout-game', description: 'Playoff record 5 TD passes in divisional round', recoveryDays: null, permanent: true },
  { id: 'je-15', cardName: '2019 Topps Chrome Update Auto', player: 'Yordan Alvarez', sport: 'Baseball', date: '2025-10-22', priceBeforeJump: 620, priceAfterJump: 435, jumpPercent: -29.8, cause: 'injury', description: 'Knee surgery announced, 4-month recovery timeline', recoveryDays: 50, permanent: false },
];

const mockDiffusionParams: DiffusionParameter[] = [
  { cardId: 'dp-1', cardName: '2023 Prizm Silver', player: 'Victor Wembanyama', drift: 0.024, diffusion: 0.18, jumpIntensity: 0.15, avgJumpSize: 0.35, jumpVolatility: 0.22, r2Fit: 0.89 },
  { cardId: 'dp-2', cardName: '2024 Topps Chrome Auto', player: 'Paul Skenes', drift: 0.031, diffusion: 0.22, jumpIntensity: 0.12, avgJumpSize: 0.42, jumpVolatility: 0.28, r2Fit: 0.85 },
  { cardId: 'dp-3', cardName: '2023 Prizm Base', player: 'Caleb Williams', drift: 0.018, diffusion: 0.28, jumpIntensity: 0.18, avgJumpSize: 0.38, jumpVolatility: 0.31, r2Fit: 0.82 },
  { cardId: 'dp-4', cardName: '2018 Prizm Silver', player: 'Luka Doncic', drift: 0.012, diffusion: 0.14, jumpIntensity: 0.08, avgJumpSize: 0.28, jumpVolatility: 0.18, r2Fit: 0.91 },
  { cardId: 'dp-5', cardName: '2020 Prizm Base', player: 'Justin Herbert', drift: -0.008, diffusion: 0.24, jumpIntensity: 0.14, avgJumpSize: -0.32, jumpVolatility: 0.25, r2Fit: 0.84 },
  { cardId: 'dp-6', cardName: '2023 Bowman Chrome 1st Auto', player: 'Jackson Holliday', drift: 0.028, diffusion: 0.20, jumpIntensity: 0.10, avgJumpSize: 0.30, jumpVolatility: 0.20, r2Fit: 0.87 },
];

const mockModels: JumpDiffusionModel[] = [
  { id: 'jdm-1', cardName: '2023 Prizm Silver', player: 'Victor Wembanyama', sport: 'Basketball', currentPrice: 11400, drift: 0.024, volatility: 0.18, jumpFrequency: 1.8, avgJumpMagnitude: 35.0, projectedPrice30d: 11820, projectedPrice90d: 12650, jumpProbability30d: 0.15, modelConfidence: 0.89 },
  { id: 'jdm-2', cardName: '2024 Topps Chrome Auto', player: 'Paul Skenes', sport: 'Baseball', currentPrice: 1580, drift: 0.031, volatility: 0.22, jumpFrequency: 1.4, avgJumpMagnitude: 42.0, projectedPrice30d: 1655, projectedPrice90d: 1820, jumpProbability30d: 0.12, modelConfidence: 0.85 },
  { id: 'jdm-3', cardName: '2023 Prizm Base', player: 'Caleb Williams', sport: 'Football', currentPrice: 165, drift: 0.018, volatility: 0.28, jumpFrequency: 2.2, avgJumpMagnitude: 38.0, projectedPrice30d: 170, projectedPrice90d: 182, jumpProbability30d: 0.18, modelConfidence: 0.82 },
  { id: 'jdm-4', cardName: '2018 Prizm Silver', player: 'Luka Doncic', sport: 'Basketball', currentPrice: 12500, drift: 0.012, volatility: 0.14, jumpFrequency: 1.0, avgJumpMagnitude: 28.0, projectedPrice30d: 12680, projectedPrice90d: 12950, jumpProbability30d: 0.08, modelConfidence: 0.91 },
  { id: 'jdm-5', cardName: '2020 Prizm Base', player: 'Justin Herbert', sport: 'Football', currentPrice: 92, drift: -0.008, volatility: 0.24, jumpFrequency: 1.7, avgJumpMagnitude: -32.0, projectedPrice30d: 89, projectedPrice90d: 84, jumpProbability30d: 0.14, modelConfidence: 0.84 },
  { id: 'jdm-6', cardName: '2023 Bowman Chrome 1st Auto', player: 'Jackson Holliday', sport: 'Baseball', currentPrice: 2850, drift: 0.028, volatility: 0.20, jumpFrequency: 1.2, avgJumpMagnitude: 30.0, projectedPrice30d: 2945, projectedPrice90d: 3180, jumpProbability30d: 0.10, modelConfidence: 0.87 },
];

const mockModelFits: ModelFit[] = [
  { month: '2025-07', actualPrice: 7200, modelPrice: 7150, driftComponent: 180, diffusionComponent: -120, jumpComponent: 0, residual: 50 },
  { month: '2025-08', actualPrice: 7450, modelPrice: 7380, driftComponent: 185, diffusionComponent: 45, jumpComponent: 0, residual: 70 },
  { month: '2025-09', actualPrice: 7680, modelPrice: 7620, driftComponent: 190, diffusionComponent: 50, jumpComponent: 0, residual: 60 },
  { month: '2025-10', actualPrice: 7520, modelPrice: 7580, driftComponent: 192, diffusionComponent: -232, jumpComponent: 0, residual: -60 },
  { month: '2025-11', actualPrice: 7890, modelPrice: 7810, driftComponent: 195, diffusionComponent: 35, jumpComponent: 0, residual: 80 },
  { month: '2025-12', actualPrice: 8200, modelPrice: 8050, driftComponent: 198, diffusionComponent: 42, jumpComponent: 0, residual: 150 },
  { month: '2026-01', actualPrice: 8850, modelPrice: 8720, driftComponent: 200, diffusionComponent: 70, jumpComponent: 400, residual: 130 },
  { month: '2026-02', actualPrice: 8400, modelPrice: 8500, driftComponent: 205, diffusionComponent: -425, jumpComponent: 0, residual: -100 },
  { month: '2026-03', actualPrice: 11400, modelPrice: 11200, driftComponent: 210, diffusionComponent: 90, jumpComponent: 2400, residual: 200 },
  { month: '2026-04', actualPrice: 11400, modelPrice: 11350, driftComponent: 215, diffusionComponent: -65, jumpComponent: 0, residual: 50 },
];

// ---- Getter Functions ----

export function getJumpEvents(): JumpEvent[] {
  return mockJumpEvents;
}

export function getDiffusionParameters(): DiffusionParameter[] {
  return mockDiffusionParams;
}

export function getJumpDiffusionModels(): JumpDiffusionModel[] {
  return mockModels;
}

export function getModelFitData(): ModelFit[] {
  return mockModelFits;
}

export function getJumpEventsByCause(cause: JumpCause): JumpEvent[] {
  return mockJumpEvents.filter(e => e.cause === cause);
}

export function getPositiveJumps(): JumpEvent[] {
  return mockJumpEvents.filter(e => e.jumpPercent > 0);
}

export function getNegativeJumps(): JumpEvent[] {
  return mockJumpEvents.filter(e => e.jumpPercent < 0);
}
