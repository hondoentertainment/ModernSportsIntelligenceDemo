import { describe, it, expect } from 'vitest';
import {
  getPlayerTrajectory,
  getAllPlayerTrajectories,
  getComparablePlayers,
  getTrajectoryScore,
  getTrajectoryFactors,
  getTopProjectedPlayer,
  getPlayerIds,
} from '../../lib/playerTrajectoryService';

describe('playerTrajectoryService', () => {
  describe('getPlayerTrajectory', () => {
    it('returns trajectory for known player', () => {
      const data = getPlayerTrajectory('p-001');
      expect(data).not.toBeNull();
      expect(data!.playerName).toBe('Jayson Tatum');
      expect(data!.trajectoryScore).toBeGreaterThan(0);
      expect(data!.projections.length).toBeGreaterThan(0);
    });

    it('returns null for unknown player', () => {
      const data = getPlayerTrajectory('nonexistent');
      expect(data).toBeNull();
    });

    it('projections have optimistic > baseline > pessimistic', () => {
      const data = getPlayerTrajectory('p-002');
      expect(data).not.toBeNull();
      for (const p of data!.projections) {
        expect(p.optimistic).toBeGreaterThanOrEqual(p.baseline);
        expect(p.baseline).toBeGreaterThanOrEqual(p.pessimistic);
      }
    });

    it('has valid risk level', () => {
      const data = getPlayerTrajectory('p-001');
      expect(['low', 'moderate', 'high']).toContain(data!.riskLevel);
    });

    it('factors have valid impact range', () => {
      const data = getPlayerTrajectory('p-001');
      for (const f of data!.factors) {
        expect(f.impact).toBeGreaterThanOrEqual(-100);
        expect(f.impact).toBeLessThanOrEqual(100);
        expect(f.label).toBeTruthy();
        expect(f.description).toBeTruthy();
      }
    });
  });

  describe('getAllPlayerTrajectories', () => {
    it('returns all players', () => {
      const all = getAllPlayerTrajectories();
      expect(all.length).toBeGreaterThanOrEqual(6);
    });

    it('each player has unique id', () => {
      const all = getAllPlayerTrajectories();
      const ids = all.map(p => p.playerId);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('covers multiple sports', () => {
      const all = getAllPlayerTrajectories();
      const sports = new Set(all.map(p => p.sport));
      expect(sports.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getComparablePlayers', () => {
    it('returns comparables for known player', () => {
      const comps = getComparablePlayers('p-001');
      expect(comps.length).toBeGreaterThan(0);
    });

    it('returns empty for unknown player', () => {
      const comps = getComparablePlayers('nonexistent');
      expect(comps).toEqual([]);
    });

    it('comparables have valid career arcs', () => {
      const comps = getComparablePlayers('p-002');
      for (const c of comps) {
        expect(c.name).toBeTruthy();
        expect(c.similarity).toBeGreaterThan(0);
        expect(c.similarity).toBeLessThanOrEqual(100);
        expect(['rising', 'peak', 'declining', 'breakout', 'steady']).toContain(c.careerArc);
      }
    });
  });

  describe('getTrajectoryScore', () => {
    it('returns score for known player', () => {
      const score = getTrajectoryScore('p-002');
      expect(score).toBe(96);
    });

    it('returns 0 for unknown player', () => {
      const score = getTrajectoryScore('nonexistent');
      expect(score).toBe(0);
    });
  });

  describe('getTrajectoryFactors', () => {
    it('returns factors for known player', () => {
      const factors = getTrajectoryFactors('p-001');
      expect(factors.length).toBeGreaterThan(0);
    });

    it('returns empty for unknown player', () => {
      const factors = getTrajectoryFactors('nonexistent');
      expect(factors).toEqual([]);
    });
  });

  describe('getTopProjectedPlayer', () => {
    it('returns the highest trajectory score player', () => {
      const top = getTopProjectedPlayer();
      const all = getAllPlayerTrajectories();
      const maxScore = Math.max(...all.map(p => p.trajectoryScore));
      expect(top.trajectoryScore).toBe(maxScore);
    });
  });

  describe('getPlayerIds', () => {
    it('returns id, name, sport for each player', () => {
      const ids = getPlayerIds();
      expect(ids.length).toBeGreaterThan(0);
      for (const p of ids) {
        expect(p.id).toBeTruthy();
        expect(p.name).toBeTruthy();
        expect(p.sport).toBeTruthy();
      }
    });
  });
});
