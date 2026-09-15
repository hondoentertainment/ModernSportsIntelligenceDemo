import { describe, expect, it } from 'vitest';
import {
  SHOW_FLOOR_PARTNER_DISCLOSURE,
  buildShowBagPartnerPayload,
  mergePartnerSuggestions,
  stubShowFloorPartnerClient,
  syncShowBagWithPartner,
} from '../../lib/integrations/showFloorPartner';
import type { ShowBagDocument } from '../../lib/utils/showBag';

const local: ShowBagDocument = {
  generatedAt: '2026-09-15T12:00:00.000Z',
  items: [
    { id: 'review:1', section: 'review', label: 'Trout', detail: 'decide', packed: true },
  ],
  counts: { review: 1, consign: 0, targets: 0, supplies: 0 },
  disclosure: 'local',
};

describe('showFloorPartner', () => {
  it('keeps the local bag as source of truth and never overwrites packed state', async () => {
    const payload = buildShowBagPartnerPayload(local);
    expect(payload.sourceOfTruth).toBe('local-show-bag');
    const stub = await stubShowFloorPartnerClient(payload);
    expect(stub.ok).toBe(true);
    expect(stub.disclosure).toBe(SHOW_FLOOR_PARTNER_DISCLOSURE);

    const merged = mergePartnerSuggestions(local.items, [
      { id: 'review:1', section: 'review', label: 'Partner overwrite', detail: 'nope', packed: false },
      { id: 'supply:x', section: 'supplies', label: 'Toploaders', detail: 'suggest', packed: true },
    ]);
    expect(merged.find((item) => item.id === 'review:1')?.packed).toBe(true);
    expect(merged.find((item) => item.id === 'supply:x')?.packed).toBe(false);

    const synced = await syncShowBagWithPartner(local);
    expect(synced.sourceOfTruth).toBe('local-show-bag');
    expect(synced.local).toBe(local);
  });

  it('rejects invalid partner payloads and client throws without replacing local', async () => {
    const bad = await stubShowFloorPartnerClient({ generatedAt: 'x', items: [], sourceOfTruth: 'remote' } as never);
    expect(bad.ok).toBe(false);
    const failed = await syncShowBagWithPartner(local, async () => {
      throw new Error('partner down');
    });
    expect(failed.partner.ok).toBe(false);
    expect(failed.local.items[0]?.packed).toBe(true);
  });
});
