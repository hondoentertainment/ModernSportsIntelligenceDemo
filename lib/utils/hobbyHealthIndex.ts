export type HobbyHealthBand = 'stressed' | 'cautious' | 'stable' | 'expansive';

export interface HobbyHealthComponent {
  id: string;
  label: string;
  value: number;
  weight: number;
}

export interface HobbyHealthIndex {
  score: number;
  band: HobbyHealthBand;
  components: HobbyHealthComponent[];
  asOf: string;
  disclosure: string;
}

export const HOBBY_HEALTH_DISCLOSURE =
  'Seeded synthetic composite for orientation only — not a live eBay, PSA, or sentiment feed.';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function seededUnit(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

export function bandForHobbyScore(score: number): HobbyHealthBand {
  if (score < 40) return 'stressed';
  if (score < 55) return 'cautious';
  if (score < 72) return 'stable';
  return 'expansive';
}

/**
 * Lightweight Hobby Health Index on seeded series.
 * Optional inventory NAV only nudges the composite; it never pretends to be live market data.
 */
export function computeHobbyHealthIndex(options?: {
  seed?: number;
  portfolioNav?: number;
  asOf?: string;
}): HobbyHealthIndex {
  const seed = options?.seed ?? 20260906;
  const navNudge = clamp(((options?.portfolioNav ?? 0) % 50000) / 50000, 0, 1) * 6;

  const components: HobbyHealthComponent[] = [
    { id: 'velocity', label: 'Modeled sale velocity', value: Math.round(48 + seededUnit(seed, 1) * 28), weight: 0.3 },
    { id: 'asp', label: 'Modeled average sale price', value: Math.round(50 + seededUnit(seed, 2) * 26), weight: 0.25 },
    { id: 'psa', label: 'Modeled PSA submission heat', value: Math.round(42 + seededUnit(seed, 3) * 30), weight: 0.2 },
    { id: 'sentiment', label: 'Modeled social sentiment', value: Math.round(45 + seededUnit(seed, 4) * 30), weight: 0.25 },
  ];

  const raw = components.reduce((sum, c) => sum + c.value * c.weight, 0) + navNudge;
  const score = Math.round(clamp(raw, 0, 100));

  return {
    score,
    band: bandForHobbyScore(score),
    components,
    asOf: options?.asOf ?? new Date().toISOString(),
    disclosure: HOBBY_HEALTH_DISCLOSURE,
  };
}
