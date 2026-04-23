// @ts-nocheck
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from 'vitest';

// Mock syncStore before importing the service
vi.mock('../../lib/dal/syncStore', () => {
  const mem: Record<string, unknown> = {};
  return {
    store: {
      get: vi.fn((key: string, fallback: unknown) => (key in mem ? mem[key] : fallback)),
      set: vi.fn((key: string, value: unknown) => { mem[key] = value; }),
      has: vi.fn((key: string) => key in mem),
    },
  };
});

vi.mock('../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import {
  getVerificationHistory,
  verifyCert,
  getCounterfeitAlerts,
  reportCounterfeit,
  getVerificationStats,
  getRegistryEntry,
  checkPopulation,
  getFlaggedItems,
  getRecentVerifications,
  getBatchVerification,
  formatCertNumber,
  getStatusColor,
  getStatusLabel,
  getSeverityColor,
  getCompanyColor,
  getFlagIcon,
} from '../../lib/core/slabVerificationService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('slabVerificationService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ---- getVerificationHistory ----
  describe('getVerificationHistory', () => {
    it('returns an array of verification results', () => {
      const history = getVerificationHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('each result has required fields', () => {
      const history = getVerificationHistory();
      for (const r of history) {
        expect(r.id).toBeTruthy();
        expect(r.certNumber).toBeTruthy();
        expect(['PSA', 'BGS', 'SGC', 'CGC']).toContain(r.company);
        expect(r.cardName).toBeTruthy();
        expect(r.player).toBeTruthy();
        expect(r.year).toBeGreaterThan(1800);
        expect(r.set).toBeTruthy();
        expect(r.grade).toBeTruthy();
        expect(typeof r.verified).toBe('boolean');
        expect(['authentic', 'suspect', 'counterfeit', 'not_found']).toContain(r.verificationStatus);
        expect(Array.isArray(r.flags)).toBe(true);
        expect(r.populationCount).toBeGreaterThanOrEqual(0);
        expect(r.labelType).toBeTruthy();
        expect(r.scanDate).toBeTruthy();
      }
    });

    it('persists to localStorage', () => {
      getVerificationHistory();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  // ---- verifyCert ----
  describe('verifyCert', () => {
    it('returns a result for a known cert number and company', () => {
      const result = verifyCert('12345678', 'PSA');
      expect(result).not.toBeNull();
      expect(result!.certNumber).toBe('12345678');
      expect(result!.company).toBe('PSA');
    });

    it('returns null for an unknown cert number', () => {
      const result = verifyCert('00000000', 'PSA');
      expect(result).toBeNull();
    });

    it('returns null when company does not match', () => {
      const result = verifyCert('12345678', 'BGS');
      expect(result).toBeNull();
    });

    it('strips hyphens and spaces from cert number', () => {
      const result = verifyCert('1234-5678', 'PSA');
      expect(result).not.toBeNull();
      expect(result!.certNumber).toBe('12345678');
    });
  });

  // ---- getCounterfeitAlerts ----
  describe('getCounterfeitAlerts', () => {
    it('returns an array of alerts', () => {
      const alerts = getCounterfeitAlerts();
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('each alert has required fields', () => {
      const alerts = getCounterfeitAlerts();
      for (const a of alerts) {
        expect(a.id).toBeTruthy();
        expect(a.certNumber).toBeTruthy();
        expect(['duplicate_cert', 'grade_mismatch', 'label_anomaly', 'case_tampering']).toContain(a.alertType);
        expect(['high', 'medium', 'low']).toContain(a.severity);
        expect(a.description).toBeTruthy();
        expect(a.reportedDate).toBeTruthy();
        expect(a.reportCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ---- reportCounterfeit ----
  describe('reportCounterfeit', () => {
    it('creates a new alert with generated id', () => {
      const alert = reportCounterfeit({
        certNumber: '99999999',
        alertType: 'duplicate_cert',
        severity: 'high',
        description: 'Test counterfeit alert',
        reportedDate: '2025-12-01',
        reportCount: 1,
      });
      expect(alert.id).toBeTruthy();
      expect(alert.certNumber).toBe('99999999');
    });

    it('new alert appears in alerts list', () => {
      reportCounterfeit({
        certNumber: '88888888',
        alertType: 'label_anomaly',
        severity: 'medium',
        description: 'Testing',
        reportedDate: '2025-12-01',
        reportCount: 1,
      });
      const alerts = getCounterfeitAlerts();
      const found = alerts.find((a) => a.certNumber === '88888888');
      expect(found).toBeTruthy();
    });
  });

  // ---- getVerificationStats ----
  describe('getVerificationStats', () => {
    it('returns stats with correct shape', () => {
      const stats = getVerificationStats();
      expect(stats.totalScans).toBeGreaterThan(0);
      expect(typeof stats.authenticCount).toBe('number');
      expect(typeof stats.suspectCount).toBe('number');
      expect(typeof stats.counterfeitCount).toBe('number');
      expect(stats.accuracyRate).toBeGreaterThanOrEqual(0);
      expect(stats.accuracyRate).toBeLessThanOrEqual(100);
      expect(Array.isArray(stats.commonFlags)).toBe(true);
    });

    it('counts add up to total scans or less', () => {
      const stats = getVerificationStats();
      expect(stats.authenticCount + stats.suspectCount + stats.counterfeitCount).toBeLessThanOrEqual(stats.totalScans);
    });
  });

  // ---- getRegistryEntry ----
  describe('getRegistryEntry', () => {
    it('returns entry for known cert', () => {
      const entry = getRegistryEntry('12345678');
      expect(entry).not.toBeNull();
      expect(entry!.certNumber).toBe('12345678');
      expect(entry!.company).toBe('PSA');
    });

    it('returns null for unknown cert', () => {
      const entry = getRegistryEntry('00000000');
      expect(entry).toBeNull();
    });
  });

  // ---- checkPopulation ----
  describe('checkPopulation', () => {
    it('returns population data for known cert', () => {
      const pop = checkPopulation('12345678');
      expect(pop).not.toBeNull();
      expect(pop!.populationCount).toBeGreaterThan(0);
      expect(['ultra_rare', 'rare', 'scarce', 'common']).toContain(pop!.rank);
    });

    it('returns null for unknown cert', () => {
      const pop = checkPopulation('00000000');
      expect(pop).toBeNull();
    });

    it('classifies population correctly', () => {
      // Wayne Gretzky has pop 2 -> ultra_rare
      const pop = checkPopulation('01234567');
      expect(pop).not.toBeNull();
      expect(pop!.rank).toBe('ultra_rare');
    });
  });

  // ---- getFlaggedItems ----
  describe('getFlaggedItems', () => {
    it('returns only items with flags', () => {
      const flagged = getFlaggedItems();
      expect(flagged.length).toBeGreaterThan(0);
      for (const item of flagged) {
        expect(item.flags.length).toBeGreaterThan(0);
      }
    });
  });

  // ---- getRecentVerifications ----
  describe('getRecentVerifications', () => {
    it('returns limited number of results', () => {
      const recent = getRecentVerifications(3);
      expect(recent.length).toBeLessThanOrEqual(3);
    });

    it('returns all when limit exceeds total', () => {
      const all = getVerificationHistory();
      const recent = getRecentVerifications(1000);
      expect(recent.length).toBe(all.length);
    });
  });

  // ---- getBatchVerification ----
  describe('getBatchVerification', () => {
    it('returns results for multiple cert numbers', () => {
      const results = getBatchVerification(['12345678', '23456789', '00000000']);
      expect(results.length).toBe(3);
      expect(results[0]).not.toBeNull();
      expect(results[1]).not.toBeNull();
      expect(results[2]).toBeNull();
    });
  });

  // ---- formatCertNumber ----
  describe('formatCertNumber', () => {
    it('strips spaces', () => {
      expect(formatCertNumber('1234 5678')).toBe('12345678');
    });

    it('strips hyphens', () => {
      expect(formatCertNumber('1234-5678')).toBe('12345678');
    });

    it('leaves clean numbers unchanged', () => {
      expect(formatCertNumber('12345678')).toBe('12345678');
    });
  });

  // ---- getStatusColor ----
  describe('getStatusColor', () => {
    it('returns correct colors', () => {
      expect(getStatusColor('authentic')).toContain('green');
      expect(getStatusColor('suspect')).toContain('yellow');
      expect(getStatusColor('counterfeit')).toContain('red');
      expect(getStatusColor('not_found')).toContain('gray');
    });
  });

  // ---- getStatusLabel ----
  describe('getStatusLabel', () => {
    it('returns human readable labels', () => {
      expect(getStatusLabel('authentic')).toBe('Authentic');
      expect(getStatusLabel('suspect')).toBe('Suspect');
      expect(getStatusLabel('counterfeit')).toBe('Counterfeit');
      expect(getStatusLabel('not_found')).toBe('Not Found');
    });
  });

  // ---- getSeverityColor ----
  describe('getSeverityColor', () => {
    it('returns correct colors', () => {
      expect(getSeverityColor('high')).toContain('red');
      expect(getSeverityColor('medium')).toContain('yellow');
      expect(getSeverityColor('low')).toContain('blue');
    });
  });

  // ---- getCompanyColor ----
  describe('getCompanyColor', () => {
    it('returns distinct colors for each company', () => {
      const colors = ['PSA', 'BGS', 'SGC', 'CGC'].map((c) => getCompanyColor(c as any));
      const unique = new Set(colors);
      expect(unique.size).toBe(4);
    });
  });

  // ---- getFlagIcon ----
  describe('getFlagIcon', () => {
    it('returns icon names based on flag content', () => {
      expect(getFlagIcon('cert_number_duplicate')).toBe('copy');
      expect(getFlagIcon('label_font_mismatch')).toBe('tag');
      expect(getFlagIcon('case_seam_irregular')).toBe('box');
      expect(getFlagIcon('hologram_missing')).toBe('shield');
      expect(getFlagIcon('population_anomaly')).toBe('bar-chart');
      expect(getFlagIcon('unknown_flag')).toBe('alert-triangle');
    });
  });
});
