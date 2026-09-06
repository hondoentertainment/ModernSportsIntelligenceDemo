import type { CardInventory, CollaborativeThesis } from '../../types';
import { logger } from '../logger';
import {
  DEFAULT_AGENT_PREFERENCES,
  type AgentUserPreferences,
} from './agentPreferences';

/** Bump when committee prompt or schema expectations change (traceability). */
export const WAR_ROOM_PROMPT_VERSION = 'war-room-committee-2026-09-v4';

/** Model id passed to Gemini for this flow (audit / support). */
export const WAR_ROOM_COMMITTEE_MODEL_ID = 'gemini-1.5-flash';

export type NormalizedWarRoomCard = {
  id: string;
  player: string;
  year: number;
  set: string;
  league: string;
  currentValue: number;
  purchasePrice: number;
  status: string;
  valuationSource: string;
};

/**
 * Stable ordering and fields so identical portfolios yield the same hash
 * regardless of array order from the store.
 */
export function normalizeInventoryForWarRoomHash(inventory: CardInventory[]): NormalizedWarRoomCard[] {
  if (!Array.isArray(inventory)) return [];
  return [...inventory]
    .filter(c => c.status !== 'sold')
    .map(c => ({
      id: String(c.id),
      player: String(c.player ?? '').trim(),
      year: Number(c.year) || 0,
      set: String(c.set ?? '').trim(),
      league: String(c.league ?? '').trim(),
      currentValue: Math.round((Number(c.currentValue) || 0) * 100) / 100,
      purchasePrice: Math.round((Number(c.purchasePrice) || 0) * 100) / 100,
      status: String(c.status ?? 'active'),
      valuationSource: String(c.valuationSource ?? 'fallback'),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function fnv1a32(str: string, seed = 0x811c9dc5): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Deterministic fingerprint of normalized active inventory + strategist flag.
 * Same logical portfolio => same value (order-independent). LLM output remains non-deterministic.
 * (FNV-style digest — suitable for audit correlation, not a cryptographic hash.)
 */
export function computeWarRoomInputFingerprint(
  inventory: CardInventory[],
  includeStrategist: boolean,
  prefs: Pick<AgentUserPreferences, 'riskTolerance' | 'timeHorizon' | 'leagueStyle' | 'maxPositionPct'> = DEFAULT_AGENT_PREFERENCES,
): string {
  const cards = normalizeInventoryForWarRoomHash(inventory);
  const payload = JSON.stringify({
    v: 3,
    includeStrategist,
    prefs: {
      riskTolerance: prefs.riskTolerance,
      timeHorizon: prefs.timeHorizon,
      leagueStyle: prefs.leagueStyle,
      maxPositionPct: prefs.maxPositionPct,
    },
    cards,
  });
  const h1 = fnv1a32(payload);
  const h2 = fnv1a32(payload, 0x01000193);
  const h3 = fnv1a32(`${payload}|msi-war-room`, 0x9e3779b9);
  const h4 = fnv1a32([...payload].reverse().join(''), 0xcbf29ce4);
  return [h1, h2, h3, h4].map(x => x.toString(16).padStart(8, '0')).join('');
}

/** JSON-serializable audit package for export / support. */
export function buildWarRoomThesisExportPayload(thesis: CollaborativeThesis): Record<string, unknown> {
  return {
    exportedAt: new Date().toISOString(),
    format: 'msi-war-room-thesis-v1',
    thesis: {
      id: thesis.id,
      recommendationId: thesis.recommendationId,
      createdAt: thesis.createdAt,
      summary: thesis.summary,
      keyTakeaways: thesis.keyTakeaways,
      riskAssessment: thesis.riskAssessment,
      recommendedAction: thesis.recommendedAction,
      agents: thesis.agents,
      executionPlan: thesis.executionPlan,
      runMetadata: thesis.runMetadata,
    },
  };
}

export function thesisExportToJsonString(thesis: CollaborativeThesis, pretty = true): string {
  const payload = buildWarRoomThesisExportPayload(thesis);
  return pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
}

function safeThesisFilenameSuffix(thesis: CollaborativeThesis): string {
  const raw = thesis.id != null && thesis.id !== '' ? String(thesis.id) : 'thesis';
  const cleaned = raw.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 40);
  const suffix = cleaned.length >= 8 ? cleaned.slice(0, 8) : (cleaned || 'thesis');
  return suffix;
}

/** Browser: trigger download of current thesis audit JSON. Returns false if serialization or download fails. */
export function downloadWarRoomThesisJson(thesis: CollaborativeThesis, filenameBase = 'msi-war-room-thesis'): boolean {
  let url: string | null = null;
  try {
    const json = thesisExportToJsonString(thesis, true);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenameBase}-${safeThesisFilenameSuffix(thesis)}.json`;
    a.click();
    return true;
  } catch (err) {
    logger.warn('[warRoomThesisAudit] Export download failed', err);
    return false;
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}
