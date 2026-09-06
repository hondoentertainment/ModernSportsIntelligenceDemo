import { describe, expect, it, vi } from 'vitest';
import type { CardInventory, CollaborativeThesis } from '../../types';
import {
  buildWarRoomThesisExportPayload,
  computeWarRoomInputFingerprint,
  normalizeInventoryForWarRoomHash,
  thesisExportToJsonString,
  downloadWarRoomThesisJson,
  WAR_ROOM_PROMPT_VERSION,
} from '../../lib/utils/warRoomThesisAudit';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'a',
    player: 'P',
    year: 2024,
    set: 'S',
    league: 'MLB',
    purchasePrice: 10,
    currentValue: 20,
    isGraded: false,
    isAutographed: false,
    status: 'active',
    ...overrides,
  } as CardInventory;
}

function minimalThesis(overrides: Partial<CollaborativeThesis> = {}): CollaborativeThesis {
  return {
    id: 'thesis-uuid-full-run',
    summary: 'S',
    keyTakeaways: ['a'],
    riskAssessment: 'low',
    recommendedAction: 'hold',
    agents: [
      {
        agentId: '1',
        agentName: 'Atlas',
        persona: 'value',
        insight: 'ok',
        sentiment: 'neutral',
        confidence: 0.5,
      },
    ],
    createdAt: '2026-04-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('warRoomThesisAudit', () => {
  describe('normalizeInventoryForWarRoomHash', () => {
    it('returns empty array when inventory is not an array', () => {
      expect(normalizeInventoryForWarRoomHash(null as unknown as CardInventory[])).toEqual([]);
      expect(normalizeInventoryForWarRoomHash(undefined as unknown as CardInventory[])).toEqual([]);
    });

    it('drops sold cards and sorts by id', () => {
      const out = normalizeInventoryForWarRoomHash([
        card({ id: 'z', status: 'sold' }),
        card({ id: 'b' }),
        card({ id: 'a' }),
      ]);
      expect(out.map(c => c.id)).toEqual(['a', 'b']);
    });

    it('normalizes numeric and string fields', () => {
      const [one] = normalizeInventoryForWarRoomHash([
        card({
          player: '  x  ',
          year: NaN,
          set: '',
          league: '',
          currentValue: 1.234,
          purchasePrice: 2.999,
          status: 'active',
        }),
      ]);
      expect(one).toMatchObject({
        player: 'x',
        year: 0,
        currentValue: 1.23,
        purchasePrice: 3,
        status: 'active',
        valuationSource: 'fallback',
      });
    });

    it('includes valuationSource in normalized cards', () => {
      const [one] = normalizeInventoryForWarRoomHash([
        card({ valuationSource: 'ebay-api' }),
      ]);
      expect(one.valuationSource).toBe('ebay-api');
    });
  });

  describe('computeWarRoomInputFingerprint', () => {
    it('changes when valuationSource changes (v2 payload)', () => {
      const a = [card({ id: '1', valuationSource: 'fallback' })];
      const b = [card({ id: '1', valuationSource: 'ebay-api' })];
      expect(computeWarRoomInputFingerprint(a, false)).not.toBe(
        computeWarRoomInputFingerprint(b, false),
      );
    });

    it('exports current prompt version', () => {
      expect(WAR_ROOM_PROMPT_VERSION).toBe('war-room-committee-2026-09-v3');
    });

    it('treats non-array inventory like empty portfolio', () => {
      expect(computeWarRoomInputFingerprint(null as unknown as CardInventory[], false)).toBe(
        computeWarRoomInputFingerprint([], false),
      );
    });

    it('is stable when card order changes', () => {
      const a = [card({ id: '1' }), card({ id: '2' })];
      const b = [card({ id: '2' }), card({ id: '1' })];
      expect(computeWarRoomInputFingerprint(a, true)).toBe(computeWarRoomInputFingerprint(b, true));
    });

    it('changes when strategist flag changes', () => {
      const inv = [card({ id: '1' })];
      expect(computeWarRoomInputFingerprint(inv, false)).not.toBe(computeWarRoomInputFingerprint(inv, true));
    });

    it('excludes sold cards from fingerprint', () => {
      const activeOnly = [card({ id: '1', status: 'active' })];
      const withSold = [card({ id: '1', status: 'active' }), card({ id: '2', status: 'sold' })];
      expect(computeWarRoomInputFingerprint(activeOnly, false)).toBe(
        computeWarRoomInputFingerprint(withSold, false)
      );
    });

    it('produces 32 hex chars', () => {
      const h = computeWarRoomInputFingerprint([card()], true);
      expect(h).toMatch(/^[0-9a-f]{32}$/);
    });
  });

  describe('buildWarRoomThesisExportPayload', () => {
    it('includes format, thesis snapshot, and runMetadata when present', () => {
      const thesis = minimalThesis({
        runMetadata: {
          inputHash: 'abc',
          promptVersion: WAR_ROOM_PROMPT_VERSION,
          modelId: 'gemini-test',
          includeStrategist: true,
        },
      });
      const payload = buildWarRoomThesisExportPayload(thesis);
      expect(payload.format).toBe('msi-war-room-thesis-v1');
      expect((payload.thesis as Record<string, unknown>).summary).toBe('S');
      expect((payload.thesis as { runMetadata: unknown }).runMetadata).toEqual(thesis.runMetadata);
      expect(typeof payload.exportedAt).toBe('string');
    });
  });

  describe('thesisExportToJsonString', () => {
    it('pretty mode includes newlines', () => {
      const s = thesisExportToJsonString(minimalThesis(), true);
      expect(s).toContain('\n');
      expect(() => JSON.parse(s)).not.toThrow();
    });

    it('compact mode is single-line JSON', () => {
      const s = thesisExportToJsonString(minimalThesis(), false);
      expect(s).not.toContain('\n');
      expect(JSON.parse(s).format).toBe('msi-war-room-thesis-v1');
    });
  });

  describe('downloadWarRoomThesisJson', () => {
    it('creates blob URL, clicks anchor, revokes URL', () => {
      const click = vi.fn();
      const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');

      const anchor = {
        href: '',
        download: '',
        click,
      } as unknown as HTMLAnchorElement;

      const realCreate = document.createElement.bind(document);
      const createElSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') return anchor;
        return realCreate(tag as keyof HTMLElementTagNameMap);
      });

      const ok = downloadWarRoomThesisJson(
        minimalThesis({ id: 'abcdef12-0000-0000-0000-000000000000' }),
        'custom',
      );
      expect(ok).toBe(true);

      expect(createUrl).toHaveBeenCalled();
      expect(anchor.download).toMatch(/^custom-abcdef12\.json$/);
      expect(click).toHaveBeenCalled();
      expect(revoke).toHaveBeenCalledWith('blob:mock');

      createElSpy.mockRestore();
      revoke.mockRestore();
      createUrl.mockRestore();
    });

    it('returns false when JSON serialization throws (no blob allocated)', () => {
      const stringifySpy = vi.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
        throw new Error('serialize');
      });

      const ok = downloadWarRoomThesisJson(minimalThesis());
      expect(ok).toBe(false);

      stringifySpy.mockRestore();
    });

    it('uses thesis filename fallback when id sanitizes to empty', () => {
      const click = vi.fn();
      const anchor = { href: '', download: '', click } as unknown as HTMLAnchorElement;
      const realCreate = document.createElement.bind(document);
      const createElSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') return anchor;
        return realCreate(tag as keyof HTMLElementTagNameMap);
      });
      const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
      const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      downloadWarRoomThesisJson(minimalThesis({ id: '@@@' }));
      expect(anchor.download).toBe('msi-war-room-thesis-thesis.json');

      createElSpy.mockRestore();
      createUrl.mockRestore();
      revoke.mockRestore();
    });
  });
});
