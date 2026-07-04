import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  analyzeCardImage,
  compareToPopulation,
  calculateGradingROI,
  estimateSubmissionCost,
  getSubmissionTiers,
  getGradingHistory,
  getCameraCalibrationGuide,
} from '../../lib/core/gradingVisionEngineService';

/**
 * Beta-exit coverage for `vision-grading` (docs/BETA_FEATURE_EXIT_CRITERIA.md).
 *
 * The engine is a labeled simulation — these tests pin the output contract
 * (shape, ranges, internal consistency) and the image-handling decision:
 * uploaded image data is processed in-memory only and never persisted.
 */

const FAKE_IMAGE = `data:image/png;base64,${'A'.repeat(500)}`;

async function runAnalysis(imageData = FAKE_IMAGE) {
  const promise = analyzeCardImage(imageData);
  // Simulated analysis resolves via a 2–3.5s setTimeout.
  await vi.advanceTimersByTimeAsync(4_000);
  return promise;
}

describe('analyzeCardImage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves a complete result with the four weighted subgrades', async () => {
    const result = await runAnalysis();

    expect(result.status).toBe('complete');
    expect(result.subgrades.map((s) => s.category).sort()).toEqual([
      'centering',
      'corners',
      'edges',
      'surface',
    ]);
    const totalWeight = result.subgrades.reduce((s, sg) => s + sg.weight, 0);
    expect(totalWeight).toBeCloseTo(1, 5);
    for (const sg of result.subgrades) {
      expect(sg.score).toBeGreaterThanOrEqual(5);
      expect(sg.score).toBeLessThanOrEqual(10);
      expect(sg.maxScore).toBe(10);
    }
  });

  it('computes overallScore as the weighted mean of the subgrades', async () => {
    const result = await runAnalysis();
    const weighted =
      result.subgrades.reduce((s, sg) => s + sg.score * sg.weight, 0) /
      result.subgrades.reduce((s, sg) => s + sg.weight, 0);
    expect(result.overallScore).toBeCloseTo(weighted, 1);
  });

  it('predicts a grade for each of PSA, BGS, and SGC with sane ranges', async () => {
    const result = await runAnalysis();
    expect(result.predictedGrades.map((p) => p.company).sort()).toEqual(['BGS', 'PSA', 'SGC']);
    for (const p of result.predictedGrades) {
      expect(p.predictedGrade).toBeGreaterThanOrEqual(5);
      expect(p.predictedGrade).toBeLessThanOrEqual(10);
      expect(p.probability).toBeGreaterThanOrEqual(0);
      expect(p.probability).toBeLessThanOrEqual(100);
      expect(p.estimatedValue).toBeGreaterThan(0);
    }
  });

  it('emits a grade distribution that sums to ~100%', async () => {
    const result = await runAnalysis();
    const total = result.gradeDistribution.reduce((s, g) => s + g.probability, 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('keeps image data in memory only: truncated preview, nothing persisted', async () => {
    // The image-handling decision for the vision-grading beta exit (same as
    // visual-audit): uploads are analyzed in-session and never written to
    // any storage. The result keeps at most a 100-char preview stub.
    const before = localStorage.length;
    const result = await runAnalysis(FAKE_IMAGE);

    expect(result.imagePreview.length).toBeLessThanOrEqual(100);
    expect(FAKE_IMAGE.startsWith(result.imagePreview)).toBe(true);
    expect(localStorage.length).toBe(before);
  });
});

describe('compareToPopulation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps subgrades to 0-100 percentiles consistently', async () => {
    const result = await runAnalysis();
    const cmp = compareToPopulation(result);

    for (const pct of [
      cmp.percentileCentering,
      cmp.percentileCorners,
      cmp.percentileEdges,
      cmp.percentileSurface,
      cmp.percentileOverall,
    ]) {
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
    expect(cmp.cardId).toBe(result.id);
    expect(cmp.betterThanPercent).toBe(cmp.percentileOverall);
    expect(cmp.similarCards).toHaveLength(4);
    expect(cmp.populationCount).toBeGreaterThan(0);
  });
});

describe('calculateGradingROI', () => {
  it('projects every grade tier with normalized probabilities', () => {
    const roi = calculateGradingROI('9', 100);
    expect(roi.predictedGrade).toBe('9');
    expect(roi.rawValue).toBe(100);
    expect(roi.projections.length).toBeGreaterThanOrEqual(7);

    const totalProb = roi.projections.reduce((s, p) => s + p.probability, 0);
    expect(totalProb).toBeGreaterThan(99);
    expect(totalProb).toBeLessThan(101);
  });

  it('values higher grades above lower grades at the same raw value', () => {
    const roi = calculateGradingROI('9', 100);
    const byGrade = Object.fromEntries(roi.projections.map((p) => [p.grade, p]));
    expect(byGrade['10'].gradedValue).toBeGreaterThan(byGrade['9'].gradedValue);
    expect(byGrade['9'].gradedValue).toBeGreaterThan(byGrade['7'].gradedValue);
  });

  it('recommends holding when grading costs exceed the value bump', () => {
    // $5 raw card: even an 8x multiplier at grade 10 ($40) cannot cover the
    // $45 grading+shipping cost, so every projection is negative.
    const roi = calculateGradingROI('7', 5);
    expect(roi.bestScenario.netProfit).toBeLessThanOrEqual(0);
    expect(roi.recommendation).toMatch(/hold/i);
  });

  it('best and worst scenarios bound the projections', () => {
    const roi = calculateGradingROI('9', 250);
    const profits = roi.projections.map((p) => p.netProfit);
    expect(roi.bestScenario.netProfit).toBe(Math.max(...profits));
    expect(roi.worstScenario.netProfit).toBe(Math.min(...profits));
  });
});

describe('submission costs', () => {
  it('estimates known company/tier combinations and defaults unknowns to 30', () => {
    expect(estimateSubmissionCost('PSA', 'economy')).toBe(30);
    expect(estimateSubmissionCost('bgs', 'Walk Through')).toBe(250);
    expect(estimateSubmissionCost('SGC', 'express')).toBe(60);
    expect(estimateSubmissionCost('Nope', 'whatever')).toBe(30);
  });

  it('lists tiers for all three graders with positive costs and turnarounds', () => {
    const tiers = getSubmissionTiers();
    const companies = new Set(tiers.map((t) => t.company));
    expect(companies).toEqual(new Set(['PSA', 'BGS', 'SGC']));
    for (const t of tiers) {
      expect(t.cost).toBeGreaterThan(0);
      expect(t.turnaroundDays).toBeGreaterThan(0);
    }
  });
});

describe('history and calibration surfaces', () => {
  it('getGradingHistory returns well-formed sample entries', () => {
    const history = getGradingHistory();
    expect(history.length).toBeGreaterThan(0);
    for (const entry of history) {
      expect(entry.predictedGrade).toBeGreaterThanOrEqual(1);
      expect(entry.predictedGrade).toBeLessThanOrEqual(10);
      expect(entry.confidence).toBeGreaterThanOrEqual(0);
      expect(entry.confidence).toBeLessThanOrEqual(100);
      expect(entry.gradedValue).toBeGreaterThan(0);
    }
  });

  it('getCameraCalibrationGuide returns ordered steps and full settings', () => {
    const guide = getCameraCalibrationGuide();
    expect(guide.steps.length).toBeGreaterThan(0);
    guide.steps.forEach((step, i) => expect(step.step).toBe(i + 1));
    for (const key of ['lighting', 'distance', 'angle', 'background', 'resolution'] as const) {
      expect(guide.recommendedSettings[key]).toBeTruthy();
    }
    expect(guide.tips.length).toBeGreaterThan(0);
  });
});
