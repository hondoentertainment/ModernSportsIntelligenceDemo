import { describe, it, expect } from 'vitest';
import {
  stripConsignmentFromNotes,
  mergeConsignmentIntoNotes,
  parseConsignmentFromNotes,
} from '../../lib/utils/cardConsignmentCodec';
import type { CardConsignmentSnapshot } from '../../types';

const sample: CardConsignmentSnapshot = {
  houseId: 'pwcc',
  houseName: 'PWCC',
  entryId: 'ent-1',
  submittedAt: '2026-01-01T00:00:00.000Z',
  reservePrice: 500,
  sellerFeePercent: 8,
  trackingNumber: '1Z999',
};

describe('cardConsignmentCodec', () => {
  it('mergeConsignmentIntoNotes appends marker JSON', () => {
    const out = mergeConsignmentIntoNotes('User note', sample);
    expect(out).toContain('User note');
    expect(out).toContain('[[MSI:CONSIGNMENT:v1]]');
    expect(out).toContain('"houseId":"pwcc"');
  });

  it('parseConsignmentFromNotes splits user notes and snapshot', () => {
    const merged = mergeConsignmentIntoNotes('Keep this', sample);
    const { userNotes, consignment } = parseConsignmentFromNotes(merged);
    expect(userNotes).toBe('Keep this');
    expect(consignment?.houseId).toBe('pwcc');
    expect(consignment?.entryId).toBe('ent-1');
  });

  it('stripConsignmentFromNotes removes marker block', () => {
    const merged = mergeConsignmentIntoNotes('A', sample);
    expect(stripConsignmentFromNotes(merged)).toBe('A');
  });

  it('returns user notes only when marker missing', () => {
    expect(parseConsignmentFromNotes('plain')).toEqual({ userNotes: 'plain' });
  });

  it('ignores corrupt JSON after marker', () => {
    const bad = 'x[[MSI:CONSIGNMENT:v1]]{not json';
    const { userNotes } = parseConsignmentFromNotes(bad);
    expect(userNotes).toBeTruthy();
    expect(parseConsignmentFromNotes(bad).consignment).toBeUndefined();
  });
});
