import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_TAX_LOT_PREFERENCES,
  getTaxLotPreferences,
  normalizeTaxLotPreferences,
  setTaxLotMethod,
  setTaxLotPreferences,
  toggleSpecificLotId,
  LOT_METHOD_TO_REPORT,
  taxLotMethodDisclaimer,
} from '../../lib/utils/taxLotPreferences';

describe('taxLotPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('normalizes junk and persists method + specific IDs', () => {
    expect(normalizeTaxLotPreferences(null)).toEqual(DEFAULT_TAX_LOT_PREFERENCES);
    expect(normalizeTaxLotPreferences({ method: 'LIFO', specificLotIds: ['a', '', 'a', 1] }).specificLotIds).toEqual(['a']);
    expect(normalizeTaxLotPreferences({ costBasisMethod: 'SpecificID' }).method).toBe('SpecificID');

    const saved = setTaxLotMethod('LIFO');
    expect(saved.method).toBe('LIFO');
    expect(getTaxLotPreferences().method).toBe('LIFO');
    expect(LOT_METHOD_TO_REPORT.SpecificID).toBe('specific_id');
    expect(taxLotMethodDisclaimer()).toMatch(/not IRS/);
  });

  it('toggles Specific ID lot picks on the persisted preference', () => {
    toggleSpecificLotId('lot-1');
    toggleSpecificLotId('lot-2');
    expect(getTaxLotPreferences().specificLotIds).toEqual(['lot-1', 'lot-2']);
    expect(getTaxLotPreferences().method).toBe('SpecificID');
    toggleSpecificLotId('lot-1');
    expect(getTaxLotPreferences().specificLotIds).toEqual(['lot-2']);
    expect(toggleSpecificLotId('  ').specificLotIds).toEqual(['lot-2']);
  });

  it('replaces a partial update without dropping known fields', () => {
    setTaxLotPreferences({ method: 'AvgCost', specificLotIds: ['keep'] });
    const next = setTaxLotPreferences({ method: 'FIFO' });
    expect(next).toEqual({ method: 'FIFO', specificLotIds: ['keep'] });
  });
});
