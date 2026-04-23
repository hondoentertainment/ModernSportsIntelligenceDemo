// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

import {
  calculateHalfLife,
  getDecayProfile,
  getAllDecayProfiles,
  simulateDecay,
  getPreservationPlan,
  getMaterialDecayRates,
  compareStorageScenarios,
  getCollectionDecayForecast,
  getOptimalStorageRecommendation,
} from '../../lib/core/cardDecayService';

// ---- Shared fixtures ----

const idealStorage = {
  environment: 'museum-grade' as const,
  temperature_F: 65,
  humidity_percent: 42,
  lightExposure: 'none' as const,
  sleeved: true,
  toploadered: true,
  casedGrade: 'PSA 10',
};

const badStorage = {
  environment: 'garage' as const,
  temperature_F: 90,
  humidity_percent: 75,
  lightExposure: 'heavy' as const,
  sleeved: false,
  toploadered: false,
  casedGrade: null,
};

const chromeMaterial = {
  cardStock: 'Chromium-finish stock',
  coating: 'Chromium reflex coating',
  inkType: 'Gravure + offset hybrid',
  thickness_mm: 0.45,
  acidContent: 'low' as const,
  uvResistance: 72,
  moistureResistance: 68,
  oxidationRate: 0.012,
};

const preWarMaterial = {
  cardStock: 'Uncoated cardboard',
  coating: 'None',
  inkType: 'Lithographic ink',
  thickness_mm: 0.65,
  acidContent: 'high' as const,
  uvResistance: 15,
  moistureResistance: 10,
  oxidationRate: 0.045,
};

// ---- calculateHalfLife ----

describe('calculateHalfLife', () => {
  it('returns a positive number for any valid inputs', () => {
    const halfLife = calculateHalfLife(chromeMaterial, idealStorage);
    expect(halfLife).toBeGreaterThan(0);
  });

  it('ideal storage yields a longer half-life than poor storage', () => {
    const good = calculateHalfLife(chromeMaterial, idealStorage);
    const bad = calculateHalfLife(chromeMaterial, badStorage);
    expect(good).toBeGreaterThan(bad);
  });

  it('pre-war material has a shorter half-life than chrome under the same conditions', () => {
    const standard = {
      environment: 'standard-indoor' as const,
      temperature_F: 72,
      humidity_percent: 50,
      lightExposure: 'none' as const,
      sleeved: false,
      toploadered: false,
      casedGrade: null,
    };
    const preWarHL = calculateHalfLife(preWarMaterial, standard);
    const chromeHL = calculateHalfLife(chromeMaterial, standard);
    expect(preWarHL).toBeLessThan(chromeHL);
  });

  it('result is clamped between 3 and 500 years', () => {
    const extremeHeat = {
      ...badStorage,
      temperature_F: 150,
      humidity_percent: 99,
    };
    const tinyHL = calculateHalfLife(preWarMaterial, extremeHeat);
    expect(tinyHL).toBeGreaterThanOrEqual(3);

    const hl = calculateHalfLife(chromeMaterial, idealStorage);
    expect(hl).toBeLessThanOrEqual(500);
  });

  it('cased storage reduces decay acceleration', () => {
    const uncased = { ...idealStorage, casedGrade: null, toploadered: false, sleeved: false };
    const cased = { ...idealStorage, casedGrade: 'PSA 10' };
    const uncasedHL = calculateHalfLife(chromeMaterial, uncased);
    const casedHL = calculateHalfLife(chromeMaterial, cased);
    expect(casedHL).toBeGreaterThan(uncasedHL);
  });
});

// ---- getDecayProfile ----

describe('getDecayProfile', () => {
  it('returns a profile for a valid card id', async () => {
    const profile = await getDecayProfile('decay-001');
    expect(profile).not.toBeNull();
    expect(profile!.cardId).toBe('decay-001');
  });

  it('returns null for an unknown card id', async () => {
    const profile = await getDecayProfile('does-not-exist');
    expect(profile).toBeNull();
  });

  it('profile contains decay curve and projected grades', async () => {
    const profile = await getDecayProfile('decay-001');
    expect(Array.isArray(profile!.decayCurve)).toBe(true);
    expect(profile!.decayCurve.length).toBeGreaterThan(0);
    expect(profile!.projectedGradeAt.years5).toBeGreaterThan(0);
    expect(profile!.projectedGradeAt.years10).toBeGreaterThan(0);
    expect(profile!.halfLife).toBeGreaterThan(0);
  });

  it('preservationScore is between 0 and 100', async () => {
    const profile = await getDecayProfile('decay-001');
    expect(profile!.preservationScore).toBeGreaterThanOrEqual(0);
    expect(profile!.preservationScore).toBeLessThanOrEqual(100);
  });
});

// ---- getAllDecayProfiles ----

describe('getAllDecayProfiles', () => {
  it('returns an array of profiles', async () => {
    const profiles = await getAllDecayProfiles();
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles.length).toBeGreaterThan(0);
  });

  it('each profile has required fields', async () => {
    const profiles = await getAllDecayProfiles();
    for (const p of profiles) {
      expect(p.cardId).toBeTruthy();
      expect(p.cardName).toBeTruthy();
      expect(p.currentGrade).toBeGreaterThan(0);
      expect(p.halfLife).toBeGreaterThan(0);
    }
  });
});

// ---- simulateDecay ----

describe('simulateDecay', () => {
  it('returns decay points for a known card', async () => {
    const points = await simulateDecay('decay-001', 10, idealStorage);
    expect(Array.isArray(points)).toBe(true);
    expect(points!.length).toBeGreaterThan(0);
  });

  it('returns null for unknown card id', async () => {
    const points = await simulateDecay('unknown-id', 10, idealStorage);
    expect(points).toBeNull();
  });

  it('grade at year 0 equals (or is close to) current grade', async () => {
    const points = await simulateDecay('decay-001', 20, idealStorage);
    const yearZero = points!.find(p => p.year === 0);
    expect(yearZero).toBeDefined();
    // Grade at year 0 should be >= 1 and <= 10
    expect(yearZero!.projectedGrade).toBeGreaterThanOrEqual(1);
    expect(yearZero!.projectedGrade).toBeLessThanOrEqual(10);
  });

  it('grades decrease over time under poor storage', async () => {
    const points = await simulateDecay('decay-001', 50, badStorage);
    const first = points![0].projectedGrade;
    const last = points![points!.length - 1].projectedGrade;
    expect(last).toBeLessThanOrEqual(first);
  });

  it('confidence intervals bracket projected grade', async () => {
    const points = await simulateDecay('decay-001', 10, idealStorage);
    for (const p of points!) {
      expect(p.confidenceInterval.low).toBeLessThanOrEqual(p.projectedGrade);
      expect(p.confidenceInterval.high).toBeGreaterThanOrEqual(p.projectedGrade);
    }
  });
});

// ---- getPreservationPlan ----

describe('getPreservationPlan', () => {
  it('returns a plan for a valid card id', async () => {
    const plan = await getPreservationPlan('decay-016'); // Barry Bonds — garage storage, no protection
    expect(plan).not.toBeNull();
    expect(plan!.cardId).toBe('decay-016');
  });

  it('returns null for unknown card id', async () => {
    const plan = await getPreservationPlan('unknown-card');
    expect(plan).toBeNull();
  });

  it('plan includes at least one recommendation', async () => {
    const plan = await getPreservationPlan('decay-016');
    expect(plan!.recommendations.length).toBeGreaterThan(0);
  });

  it('recommendations are sorted by priority', async () => {
    const plan = await getPreservationPlan('decay-016');
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    for (let i = 1; i < plan!.recommendations.length; i++) {
      expect(order[plan!.recommendations[i].priority]).toBeGreaterThanOrEqual(
        order[plan!.recommendations[i - 1].priority]
      );
    }
  });
});

// ---- getMaterialDecayRates ----

describe('getMaterialDecayRates', () => {
  it('returns material decay rate reference data', async () => {
    const rates = await getMaterialDecayRates();
    expect(Array.isArray(rates)).toBe(true);
    expect(rates.length).toBeGreaterThan(0);
  });

  it('each entry has a positive baseHalfLifeYears', async () => {
    const rates = await getMaterialDecayRates();
    for (const r of rates) {
      expect(r.baseHalfLifeYears).toBeGreaterThan(0);
      expect(r.material).toBeTruthy();
    }
  });
});

// ---- compareStorageScenarios ----

describe('compareStorageScenarios', () => {
  it('returns results for multiple storage conditions', async () => {
    const results = await compareStorageScenarios('decay-001', [
      { label: 'Ideal', condition: idealStorage },
      { label: 'Garage', condition: badStorage },
    ]);
    expect(Array.isArray(results)).toBe(true);
    expect(results!.length).toBe(2);
  });

  it('returns null for unknown card', async () => {
    const results = await compareStorageScenarios('unknown', [
      { label: 'A', condition: idealStorage },
    ]);
    expect(results).toBeNull();
  });

  it('ideal storage has higher half-life than poor storage', async () => {
    const results = await compareStorageScenarios('decay-001', [
      { label: 'Ideal', condition: idealStorage },
      { label: 'Garage', condition: badStorage },
    ]);
    const [ideal, garage] = results!;
    expect(ideal.halfLife).toBeGreaterThan(garage.halfLife);
  });
});

// ---- getOptimalStorageRecommendation ----

describe('getOptimalStorageRecommendation', () => {
  it('returns optimal storage for a known card', async () => {
    const rec = await getOptimalStorageRecommendation('decay-001');
    expect(rec).not.toBeNull();
    expect(rec!.halfLife).toBeGreaterThan(0);
    expect(rec!.preservationScore).toBeGreaterThanOrEqual(0);
    expect(rec!.preservationScore).toBeLessThanOrEqual(100);
  });

  it('returns null for unknown card', async () => {
    const rec = await getOptimalStorageRecommendation('unknown-card');
    expect(rec).toBeNull();
  });
});

// ---- getCollectionDecayForecast ----

describe('getCollectionDecayForecast', () => {
  it('returns a forecast for valid card ids', async () => {
    const forecast = await getCollectionDecayForecast(['decay-001', 'decay-002']);
    expect(forecast).not.toBeNull();
    expect(forecast!.cardCount).toBe(2);
    expect(forecast!.averageHalfLife).toBeGreaterThan(0);
  });

  it('returns null when no cards match', async () => {
    const forecast = await getCollectionDecayForecast(['unknown-1', 'unknown-2']);
    expect(forecast).toBeNull();
  });

  it('forecast spans multiple years', async () => {
    const result = await getCollectionDecayForecast(['decay-001', 'decay-002']);
    expect(result!.forecast.length).toBeGreaterThan(1);
  });

  it('identifies weakest and strongest card', async () => {
    const result = await getCollectionDecayForecast(['decay-001', 'decay-002', 'decay-003']);
    expect(result!.weakestCard.cardId).toBeTruthy();
    expect(result!.strongestCard.cardId).toBeTruthy();
    expect(result!.weakestCard.halfLife).toBeLessThanOrEqual(result!.strongestCard.halfLife);
  });
});
