/**
 * Read-only want-list link. The list is in the URL. No server copy.
 */
import { store } from '../dal/syncStore';

export const WANT_SHARE_DISCLOSURE =
  'Read-only link encoded in the URL. Local demo. No server copy. Not a live list.';

export interface WantShareItem {
  player: string;
  year: number;
  maxUsd: number;
}

interface TargetRow {
  player?: string;
  cardDescription?: string;
  targetPrice?: number;
  status?: string;
}

function yearOf(text: string): number {
  const match = text.match(/\b(?:19|20)\d{2}\b/);
  return match ? Number(match[0]) : new Date().getFullYear();
}

export function wantItemsFromTargets(rows: TargetRow[]): WantShareItem[] {
  const items: WantShareItem[] = [];
  for (const row of rows) {
    if (row.status !== 'active') continue;
    const player = `${row.player ?? ''} ${row.cardDescription ?? ''}`.trim().replace(/[|\n\r]/g, ' ').slice(0, 40);
    const maxUsd = Number(row.targetPrice);
    if (!player || !Number.isFinite(maxUsd) || maxUsd < 0) continue;
    items.push({ player, year: yearOf(`${row.cardDescription ?? ''} ${row.player ?? ''}`), maxUsd: Math.round(maxUsd) });
    if (items.length === 12) break;
  }
  return items;
}

export function readActiveWants(): WantShareItem[] {
  const rows = store.get<TargetRow[]>('cardx_targets', []);
  return wantItemsFromTargets(Array.isArray(rows) ? rows : []);
}

function bytesToB64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((byte) => {
    bin += String.fromCharCode(byte);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64ToText(token: string): string {
  const pad = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = pad + '='.repeat((4 - (pad.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeWantShare(items: WantShareItem[]): string {
  const lines = items.slice(0, 12).map((item) => `${item.player.replace(/[|\n\r]/g, ' ').slice(0, 40)}|${item.year}|${Math.round(item.maxUsd)}`);
  return lines.length ? bytesToB64(lines.join('\n')) : '';
}

export function decodeWantShare(token: string): WantShareItem[] | null {
  if (!token || token.length > 1800 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
  let text = '';
  try {
    text = b64ToText(token);
  } catch {
    return null;
  }
  if (text.length > 2000) return null;
  const items: WantShareItem[] = [];
  for (const line of text.split('\n')) {
    if (!line) continue;
    const [playerRaw, yearRaw, maxRaw] = line.split('|');
    const player = (playerRaw ?? '').trim().slice(0, 40);
    const year = Number(yearRaw);
    const maxUsd = Number(maxRaw);
    if (!player || !Number.isInteger(year) || year < 1900 || year > 2100) return null;
    if (!Number.isFinite(maxUsd) || maxUsd < 0 || maxUsd > 10_000_000) return null;
    items.push({ player, year, maxUsd: Math.round(maxUsd) });
    if (items.length > 12) return null;
  }
  return items.length ? items : null;
}

export function wantShareHref(pageUrl: string, token: string): string {
  const base = pageUrl.split('#')[0];
  return `${base}#/alerts?want=${encodeURIComponent(token)}`;
}
