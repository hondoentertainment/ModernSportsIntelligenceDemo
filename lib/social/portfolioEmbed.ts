import { escapeHtml } from '../htmlEscape';
import { generateShareLink } from './socialService';

export const PORTFOLIO_EMBED_DISCLOSURE =
  'Demo-honest MSI widget. Values are collector estimates, not a live marketplace feed.';

export function isPortfolioEmbedView(search: string): boolean {
  const query = search.startsWith('?') ? search.slice(1) : search;
  return new URLSearchParams(query).get('embed') === '1';
}

export function buildPublicPortfolioUrl(
  username: string,
  options?: { origin?: string; embed?: boolean }
): string {
  const origin = options?.origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const base = origin ? `${origin}/#/p/${encodeURIComponent(username)}` : generateShareLink(username);
  return options?.embed ? `${base}?embed=1` : base;
}

export function buildIframeEmbedSnippet(
  username: string,
  options?: { origin?: string; width?: number; height?: number }
): string {
  const src = escapeHtml(buildPublicPortfolioUrl(username, { origin: options?.origin, embed: true }));
  const width = options?.width ?? 400;
  const height = options?.height ?? 520;
  const title = escapeHtml(`MSI collection — @${username}`);
  return `<!-- MSI Collection Embed (iframe) -->
<iframe src="${src}" title="${title}" width="${width}" height="${height}" style="border:0;border-radius:16px;max-width:100%;background:#0f172a;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
<p style="font-family:Arial,sans-serif;font-size:10px;color:#64748b;margin:8px 0 0;">${escapeHtml(PORTFOLIO_EMBED_DISCLOSURE)}</p>`;
}

export function buildForumShareSnippet(username: string, staticWidgetHtml: string, origin?: string): string {
  return `${buildIframeEmbedSnippet(username, { origin })}

<!-- Static fallback if iframes are blocked -->
${staticWidgetHtml}`;
}
