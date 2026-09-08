/**
 * Local card-show packing list from swipe-triage review, consignment
 * candidates, watchlist targets, and Card Show Mode supplies. No partner APIs.
 */
import type { CardInventory, TargetWatchlist } from '../../types';
import { store } from '../dal/syncStore';
import { getTriageReviewIds } from './collectionTriage';
import { getShowChecklist, type ShowChecklist } from './cardShowModeService';

export const SHOW_BAG_PACKED_KEY = 'msi_show_bag_packed_v1';

export const SHOW_BAG_DISCLOSURE =
  'Local packing list only — swipe-triage review, consignment candidates, active watchlist targets, and Card Show supplies. Not a partner API or live marketplace.';

export type ShowBagSectionId = 'review' | 'consign' | 'targets' | 'supplies';

export interface ShowBagItem {
  id: string;
  section: ShowBagSectionId;
  label: string;
  detail: string;
  packed: boolean;
}

export interface ShowBagDocument {
  generatedAt: string;
  items: ShowBagItem[];
  counts: Record<ShowBagSectionId, number>;
  disclosure: string;
}

function packedSet(): Set<string> {
  const raw = store.get<string[]>(SHOW_BAG_PACKED_KEY, []);
  return new Set(Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : []);
}

export function getPackedShowBagIds(): string[] {
  return [...packedSet()];
}

export function toggleShowBagPacked(itemId: string): string[] {
  const id = itemId.trim();
  if (!id) return getPackedShowBagIds();
  const next = packedSet();
  if (next.has(id)) next.delete(id);
  else next.add(id);
  const ids = [...next];
  store.set(SHOW_BAG_PACKED_KEY, ids);
  return ids;
}

function cardLabel(card: CardInventory): string {
  return `${card.year} ${card.player} · ${card.set || card.manufacturer}`.trim();
}

export function buildShowBag(input: {
  inventory: CardInventory[];
  targets?: TargetWatchlist[];
  reviewIds?: string[];
  checklist?: ShowChecklist[];
  now?: Date;
}): ShowBagDocument {
  const packed = packedSet();
  const inventory = input.inventory ?? [];
  const reviewIds = new Set(input.reviewIds ?? getTriageReviewIds());
  const items: ShowBagItem[] = [];

  for (const card of inventory) {
    if (card.status === 'sold') continue;
    if (reviewIds.has(card.id)) {
      items.push({
        id: `review:${card.id}`,
        section: 'review',
        label: cardLabel(card),
        detail: 'Swipe-triage review — decide keep / sell / consign on the floor',
        packed: packed.has(`review:${card.id}`),
      });
    }
    if (card.status === 'consignment') {
      const house = card.consignment?.houseName ? ` · ${card.consignment.houseName}` : '';
      const reserve = card.consignment?.reservePrice
        ? ` · reserve $${card.consignment.reservePrice.toLocaleString()}`
        : '';
      items.push({
        id: `consign:${card.id}`,
        section: 'consign',
        label: cardLabel(card),
        detail: `Consignment candidate${house}${reserve}`,
        packed: packed.has(`consign:${card.id}`),
      });
    }
  }

  for (const target of input.targets ?? []) {
    if (target.status !== 'active') continue;
    items.push({
      id: `target:${target.id}`,
      section: 'targets',
      label: `${target.player} · ${target.cardDescription || 'watchlist'}`.trim(),
      detail: `Buy target ≤ $${(target.targetPrice || 0).toLocaleString()}`,
      packed: packed.has(`target:${target.id}`),
    });
  }

  const checklist = input.checklist ?? getShowChecklist();
  for (const row of checklist) {
    if (row.category !== 'supplies' && row.category !== 'prep') continue;
    items.push({
      id: `supply:${row.id}`,
      section: 'supplies',
      label: row.item,
      detail: row.category === 'prep' ? 'Prep checklist' : 'Show supplies',
      packed: packed.has(`supply:${row.id}`) || Boolean(row.checked),
    });
  }

  const counts: Record<ShowBagSectionId, number> = {
    review: items.filter((item) => item.section === 'review').length,
    consign: items.filter((item) => item.section === 'consign').length,
    targets: items.filter((item) => item.section === 'targets').length,
    supplies: items.filter((item) => item.section === 'supplies').length,
  };

  return {
    generatedAt: (input.now ?? new Date()).toISOString(),
    items,
    counts,
    disclosure: SHOW_BAG_DISCLOSURE,
  };
}

export function formatShowBagText(doc: ShowBagDocument): string {
  const lines = [
    'MSI Show Bag',
    doc.disclosure,
    `Generated ${doc.generatedAt}`,
    '',
  ];
  const titles: Record<ShowBagSectionId, string> = {
    review: 'Review / decide',
    consign: 'Consignment',
    targets: 'Buy targets',
    supplies: 'Supplies & prep',
  };
  (['review', 'consign', 'targets', 'supplies'] as const).forEach((section) => {
    const rows = doc.items.filter((item) => item.section === section);
    lines.push(`${titles[section]} (${rows.length})`);
    if (rows.length === 0) {
      lines.push('  — none');
    } else {
      for (const row of rows) {
        lines.push(`  [${row.packed ? 'x' : ' '}] ${row.label} — ${row.detail}`);
      }
    }
    lines.push('');
  });
  return lines.join('\n');
}

export function formatShowBagHtml(doc: ShowBagDocument): string {
  const escape = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sections = (['review', 'consign', 'targets', 'supplies'] as const)
    .map((section) => {
      const rows = doc.items.filter((item) => item.section === section);
      const lis = rows.length
        ? rows
            .map(
              (row) =>
                `<li>${row.packed ? '☑' : '☐'} ${escape(row.label)} — ${escape(row.detail)}</li>`,
            )
            .join('')
        : '<li>None</li>';
      return `<h2>${section}</h2><ul>${lis}</ul>`;
    })
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>MSI Show Bag</title></head><body><h1>MSI Show Bag</h1><p>${escape(doc.disclosure)}</p>${sections}</body></html>`;
}

export function downloadShowBagHtml(
  doc: ShowBagDocument,
  host: Document | null = typeof document !== 'undefined' ? document : null,
): void {
  if (!host) return;
  const blob = new Blob([formatShowBagHtml(doc)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = host.createElement('a');
  anchor.href = url;
  anchor.download = 'msi-show-bag.html';
  host.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
