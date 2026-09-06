import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyCert = vi.fn();

vi.mock('../../lib/integrations/psaAdapter', () => ({
  psaAdapter: {
    verifyCert: (...args: unknown[]) => verifyCert(...args),
    isLive: () => false,
  },
}));

import {
  classifyScanIdentifier,
  extractIdentifier,
  resolveScanIdentifier,
  toAddAssetPrefill,
  certLookupToCard,
} from '../../lib/utils/certScanResolver';

describe('certScanResolver', () => {
  beforeEach(() => {
    verifyCert.mockReset();
  });

  it('extracts certs from PSA URLs and query strings', () => {
    expect(extractIdentifier('https://www.psacard.com/cert/12345678')).toBe('12345678');
    expect(extractIdentifier('https://www.psacard.com/certification/85012345')).toBe('85012345');
    expect(extractIdentifier('https://example.com/lookup?certNumber=45892341')).toBe('45892341');
    expect(extractIdentifier(' 12-345-678 ')).toBe('12345678');
  });

  it('classifies PSA certs, UPCs, and unknown input', () => {
    expect(classifyScanIdentifier('12345678').kind).toBe('psa_cert');
    expect(classifyScanIdentifier('887521123456').kind).toBe('upc');
    expect(classifyScanIdentifier('').kind).toBe('unknown');
    expect(classifyScanIdentifier('not-a-code').kind).toBe('unknown');
  });

  it('resolves demo catalog certs without calling the PSA adapter', async () => {
    const result = await resolveScanIdentifier('12345678');
    expect(verifyCert).not.toHaveBeenCalled();
    expect(result.source).toBe('demo_catalog');
    expect(result.card?.player).toBe('Shohei Ohtani');
    expect(result.card?.certNumber).toBe('12345678');
    expect(result.honestyLabel).toMatch(/not a live PSA/i);
    expect(toAddAssetPrefill(result)?.player).toBe('Shohei Ohtani');
  });

  it('resolves demo UPCs with sealed-product metadata', async () => {
    const result = await resolveScanIdentifier('887521123456');
    expect(result.source).toBe('demo_catalog');
    expect(result.kind).toBe('upc');
    expect(result.card?.set).toMatch(/Hobby/i);
    expect(result.honestyLabel).toMatch(/not a live product/i);
  });

  it('falls back to the PSA adapter for unknown certs and labels mock vs live', async () => {
    verifyCert.mockResolvedValue({
      certNumber: '77777777',
      verified: true,
      source: 'mock',
      player: 'Aaron Judge',
      year: '2022',
      brand: 'Topps',
      set: 'Chrome',
      cardNumber: '99',
      grade: '10',
      lookupDate: '2026-09-06T00:00:00.000Z',
    });

    const result = await resolveScanIdentifier('77777777');
    expect(verifyCert).toHaveBeenCalledWith('77777777');
    expect(result.source).toBe('psa_adapter');
    expect(result.card?.player).toBe('Aaron Judge');
    expect(result.honestyLabel).toMatch(/demo/i);
  });

  it('maps live adapter results with an honest live label', () => {
    const card = certLookupToCard({
      certNumber: '11111111',
      verified: true,
      source: 'live',
      player: 'Luka Doncic',
      year: '2018',
      brand: 'Panini',
      set: 'Prizm',
      cardNumber: '280',
      grade: '10',
      lookupDate: '2026-09-06T00:00:00.000Z',
    }, 'psa_cert');
    expect(card.sport).toBe('Basketball');
    expect(card.league).toBe('NBA');
    expect(card.certNumber).toBe('11111111');
  });

  it('returns a clear error for unrecognized identifiers', async () => {
    const result = await resolveScanIdentifier('???');
    expect(result.source).toBe('unresolved');
    expect(result.card).toBeNull();
    expect(result.error).toMatch(/could not recognize/i);
  });

  it('returns an unresolved UPC when it is not in the demo catalog', async () => {
    const result = await resolveScanIdentifier('000000000000');
    expect(result.kind).toBe('upc');
    expect(result.source).toBe('unresolved');
    expect(result.card).toBeNull();
  });
});
