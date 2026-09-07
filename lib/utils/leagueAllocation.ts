import type { CardInventory } from '../../types';

export interface LeagueAllocationSlice {
  league: string;
  value: number;
  count: number;
  pct: number;
}

/** Tailwind fill classes for in-app allocation bars (no canvas / PDF). */
export const LEAGUE_BAR_CLASS: Record<string, string> = {
  MLB: 'bg-green-500',
  MiLB: 'bg-lime-400',
  NBA: 'bg-orange-500',
  NFL: 'bg-blue-500',
  Other: 'bg-slate-400',
};

export function buildLeagueAllocation(inventory: CardInventory[]): LeagueAllocationSlice[] {
  const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
  const leagueMap = new Map<string, { value: number; count: number }>();
  inventory.forEach((card) => {
    const league = card.league || 'Other';
    const current = leagueMap.get(league) || { value: 0, count: 0 };
    leagueMap.set(league, {
      value: current.value + (card.currentValue || 0),
      count: current.count + 1,
    });
  });
  return Array.from(leagueMap.entries())
    .map(([league, data]) => ({
      league,
      value: data.value,
      count: data.count,
      pct: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function buildBriefingText(
  inventory: CardInventory[],
  insight?: string,
): string {
  const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
  const slices = buildLeagueAllocation(inventory);
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const lines = [
    'MODERN SPORTS INTELLIGENCE — MORNING BRIEFING',
    date,
    '',
    `Portfolio NAV: $${Math.round(totalValue).toLocaleString()}`,
    `Holdings: ${inventory.length}`,
    '',
    'LEAGUE ALLOCATION',
    ...slices.map(
      (s) =>
        `${s.league}: ${s.pct.toFixed(1)}%  $${Math.round(s.value).toLocaleString()}  (${s.count} cards)`,
    ),
  ];
  if (insight) {
    lines.push('', 'MARKET INSIGHT', insight);
  }
  lines.push('', 'Heuristic briefing — not a live tape or licensed appraisal.');
  return lines.join('\n');
}

export function buildBriefingHtml(
  inventory: CardInventory[],
  insight?: string,
): string {
  const text = buildBriefingText(inventory, insight);
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>MSI Morning Briefing</title></head><body><pre>${escaped}</pre></body></html>`;
}

export function downloadBriefingDocument(
  inventory: CardInventory[],
  insight?: string,
  format: 'text' | 'html' = 'html',
): void {
  const content = format === 'html' ? buildBriefingHtml(inventory, insight) : buildBriefingText(inventory, insight);
  const mime = format === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8';
  const ext = format === 'html' ? 'html' : 'txt';
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MSI_Morning_Briefing_${new Date().toISOString().split('T')[0]}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
