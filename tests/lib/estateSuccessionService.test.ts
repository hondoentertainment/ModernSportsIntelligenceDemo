// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import {
  getPlan,
  getHeirs,
  getWill,
  getTriggers,
  getEducationModules,
} from '../../lib/core/estateSuccessionService';

// ---- getPlan ----

describe('getPlan', () => {
  it('returns a plan with a positive totalCollectionValue', () => {
    const plan = getPlan();
    expect(plan.totalCollectionValue).toBeGreaterThan(0);
  });

  it('plan has a valid status', () => {
    const plan = getPlan();
    expect(['draft', 'active', 'needs_review']).toContain(plan.status);
  });

  it('plan has an id and a name', () => {
    const plan = getPlan();
    expect(plan.id).toBeTruthy();
    expect(plan.name).toBeTruthy();
  });

  it('heirCount is greater than zero', () => {
    const plan = getPlan();
    expect(plan.heirCount).toBeGreaterThan(0);
  });

  it('allocationComplete is a boolean', () => {
    const plan = getPlan();
    expect(typeof plan.allocationComplete).toBe('boolean');
  });

  it('totalCollectionValue matches sum of heir allocations', () => {
    const plan = getPlan();
    const heirs = getHeirs();
    const allocatedTotal = heirs.reduce((sum, h) => sum + h.allocatedValue, 0);
    expect(allocatedTotal).toBe(plan.totalCollectionValue);
  });
});

// ---- getHeirs ----

describe('getHeirs', () => {
  it('returns a non-empty array of heirs', () => {
    const heirs = getHeirs();
    expect(heirs.length).toBeGreaterThan(0);
  });

  it('allocatedPercentage values sum to 100', () => {
    const heirs = getHeirs();
    const total = heirs.reduce((sum, h) => sum + h.allocatedPercentage, 0);
    expect(total).toBe(100);
  });

  it('each heir has a positive allocatedValue', () => {
    const heirs = getHeirs();
    for (const heir of heirs) {
      expect(heir.allocatedValue).toBeGreaterThan(0);
    }
  });

  it('heirs are sorted by allocatedPercentage descending', () => {
    const heirs = getHeirs();
    for (let i = 0; i < heirs.length - 1; i++) {
      expect(heirs[i].allocatedPercentage).toBeGreaterThanOrEqual(heirs[i + 1].allocatedPercentage);
    }
  });

  it('each heir has a name, relationship, and knowledge level', () => {
    const heirs = getHeirs();
    for (const heir of heirs) {
      expect(heir.name).toBeTruthy();
      expect(heir.relationship).toBeTruthy();
      expect(['none', 'beginner', 'intermediate', 'advanced']).toContain(heir.knowledgeLevel);
    }
  });

  it('educationProgress is between 0 and 100 for all heirs', () => {
    const heirs = getHeirs();
    for (const heir of heirs) {
      expect(heir.educationProgress).toBeGreaterThanOrEqual(0);
      expect(heir.educationProgress).toBeLessThanOrEqual(100);
    }
  });

  it('preferredAction is one of keep, sell, or undecided', () => {
    const heirs = getHeirs();
    for (const heir of heirs) {
      expect(['keep', 'sell', 'undecided']).toContain(heir.preferredAction);
    }
  });
});

// ---- getWill ----

describe('getWill', () => {
  it('returns a non-empty array of will sections', () => {
    const will = getWill();
    expect(will.length).toBeGreaterThan(0);
  });

  it('sections are sorted by priority ascending', () => {
    const will = getWill();
    for (let i = 0; i < will.length - 1; i++) {
      expect(will[i].priority).toBeLessThanOrEqual(will[i + 1].priority);
    }
  });

  it('each will entry has a positive estimatedValue', () => {
    const will = getWill();
    for (const entry of will) {
      expect(entry.estimatedValue).toBeGreaterThan(0);
    }
  });

  it('each will entry has assigned heir info', () => {
    const will = getWill();
    for (const entry of will) {
      expect(entry.assignedHeirId).toBeTruthy();
      expect(entry.assignedHeirName).toBeTruthy();
    }
  });

  it('sum of will estimatedValues equals totalCollectionValue', () => {
    const plan = getPlan();
    const will = getWill();
    const willTotal = will.reduce((sum, w) => sum + w.estimatedValue, 0);
    expect(willTotal).toBe(plan.totalCollectionValue);
  });
});

// ---- getTriggers ----

describe('getTriggers', () => {
  it('returns only enabled triggers', () => {
    const triggers = getTriggers();
    for (const t of triggers) {
      expect(t.enabled).toBe(true);
    }
  });

  it('each trigger has a name and an action', () => {
    const triggers = getTriggers();
    expect(triggers.length).toBeGreaterThan(0);
    for (const t of triggers) {
      expect(t.name).toBeTruthy();
      expect(t.action).toBeTruthy();
    }
  });
});

// ---- getEducationModules ----

describe('getEducationModules', () => {
  it('returns a non-empty array of modules', () => {
    const modules = getEducationModules();
    expect(modules.length).toBeGreaterThan(0);
  });

  it('modules are sorted beginner before intermediate before advanced', () => {
    const modules = getEducationModules();
    const diffOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    for (let i = 0; i < modules.length - 1; i++) {
      expect(diffOrder[modules[i].difficulty]).toBeLessThanOrEqual(
        diffOrder[modules[i + 1].difficulty]
      );
    }
  });

  it('each module has positive durationMinutes', () => {
    const modules = getEducationModules();
    for (const m of modules) {
      expect(m.durationMinutes).toBeGreaterThan(0);
    }
  });

  it('categories cover basics, grading, market, selling, and storage', () => {
    const modules = getEducationModules();
    const categories = new Set(modules.map(m => m.category));
    expect(categories.has('basics')).toBe(true);
    expect(categories.has('grading')).toBe(true);
    expect(categories.has('market')).toBe(true);
    expect(categories.has('selling')).toBe(true);
    expect(categories.has('storage')).toBe(true);
  });
});
