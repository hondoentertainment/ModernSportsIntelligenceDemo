// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  getEstatePlan,
  getBeneficiaries,
  getInsuranceRecords,
  getEstateValuation,
  getDocumentChecklist,
} from '../../lib/core/estatePlanningService';

describe('estatePlanningService', () => {
  describe('getEstatePlan', () => {
    it('returns estate plan with valid fields', () => {
      const plan = getEstatePlan();
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(plan.totalValue).toBeGreaterThan(0);
      expect(plan.beneficiaries).toBeGreaterThan(0);
      expect(plan.lastUpdated).toBeTruthy();
      expect(['draft', 'active', 'under_review', 'finalized']).toContain(plan.status);
    });
  });

  describe('getBeneficiaries', () => {
    it('returns array of beneficiaries', () => {
      const bens = getBeneficiaries();
      expect(bens.length).toBeGreaterThan(0);
    });

    it('allocations sum to 100%', () => {
      const bens = getBeneficiaries();
      const total = bens.reduce((s, b) => s + b.allocationPercent, 0);
      expect(total).toBe(100);
    });

    it('each beneficiary has assigned cards', () => {
      const bens = getBeneficiaries();
      for (const b of bens) {
        expect(b.id).toBeTruthy();
        expect(b.name).toBeTruthy();
        expect(b.relationship).toBeTruthy();
        expect(b.assignedCards.length).toBeGreaterThan(0);
      }
    });

    it('assigned cards have valid values', () => {
      const bens = getBeneficiaries();
      for (const b of bens) {
        for (const card of b.assignedCards) {
          expect(card.id).toBeTruthy();
          expect(card.playerName).toBeTruthy();
          expect(card.estimatedValue).toBeGreaterThan(0);
        }
      }
    });

    it('includes different relationship types', () => {
      const bens = getBeneficiaries();
      const rels = bens.map(b => b.relationship);
      expect(rels).toContain('Son');
      expect(rels).toContain('Daughter');
    });
  });

  describe('getInsuranceRecords', () => {
    it('returns insurance records', () => {
      const records = getInsuranceRecords();
      expect(records.length).toBeGreaterThan(0);
    });

    it('each record has valid fields', () => {
      const records = getInsuranceRecords();
      for (const r of records) {
        expect(r.id).toBeTruthy();
        expect(r.provider).toBeTruthy();
        expect(r.policyNumber).toBeTruthy();
        expect(r.coverage).toBeGreaterThan(0);
        expect(r.premium).toBeGreaterThan(0);
        expect(r.expiresAt).toBeTruthy();
      }
    });

    it('total coverage exceeds $100k', () => {
      const records = getInsuranceRecords();
      const totalCoverage = records.reduce((s, r) => s + r.coverage, 0);
      expect(totalCoverage).toBeGreaterThan(100000);
    });
  });

  describe('getEstateValuation', () => {
    it('returns valuation with valid fields', () => {
      const val = getEstateValuation();
      expect(val.currentTotal).toBeGreaterThan(0);
      expect(val.insuredTotal).toBeGreaterThan(0);
      expect(typeof val.changePercent30d).toBe('number');
      expect(val.history.length).toBeGreaterThan(0);
    });

    it('uninsured gap is 0 when insured exceeds current', () => {
      const val = getEstateValuation();
      if (val.insuredTotal >= val.currentTotal) {
        expect(val.uninsuredGap).toBe(0);
      }
    });

    it('history has chronological snapshots', () => {
      const val = getEstateValuation();
      for (let i = 1; i < val.history.length; i++) {
        expect(val.history[i].date > val.history[i - 1].date).toBe(true);
      }
    });

    it('each snapshot has totalValue and insuredValue', () => {
      const val = getEstateValuation();
      for (const snap of val.history) {
        expect(snap.totalValue).toBeGreaterThan(0);
        expect(snap.insuredValue).toBeGreaterThan(0);
        expect(snap.date).toBeTruthy();
      }
    });
  });

  describe('getDocumentChecklist', () => {
    it('returns checklist items', () => {
      const items = getDocumentChecklist();
      expect(items.length).toBeGreaterThan(0);
    });

    it('includes all status types', () => {
      const items = getDocumentChecklist();
      const statuses = new Set(items.map(i => i.status));
      expect(statuses.has('complete')).toBe(true);
      expect(statuses.has('pending')).toBe(true);
    });

    it('complete items have completedAt date', () => {
      const items = getDocumentChecklist();
      const complete = items.filter(i => i.status === 'complete');
      for (const c of complete) {
        expect(c.completedAt).toBeTruthy();
      }
    });

    it('each item has label and description', () => {
      const items = getDocumentChecklist();
      for (const i of items) {
        expect(i.id).toBeTruthy();
        expect(i.label).toBeTruthy();
        expect(i.description).toBeTruthy();
      }
    });
  });
});
