import { describe, expect, it } from 'vitest';
import {
  buildIframeEmbedSnippet,
  buildPublicPortfolioUrl,
  isPortfolioEmbedView,
  PORTFOLIO_EMBED_DISCLOSURE,
} from '../../lib/social/portfolioEmbed';

describe('portfolioEmbed', () => {
  it('detects embed query on public portfolio URLs', () => {
    expect(isPortfolioEmbedView('embed=1')).toBe(true);
    expect(isPortfolioEmbedView('?embed=1&x=2')).toBe(true);
    expect(isPortfolioEmbedView('tab=grid')).toBe(false);
  });

  it('builds vanity and iframe-friendly hash URLs', () => {
    expect(buildPublicPortfolioUrl('alpha', { origin: 'https://msi.app' })).toBe('https://msi.app/#/p/alpha');
    expect(buildPublicPortfolioUrl('alpha', { origin: 'https://msi.app', embed: true })).toBe(
      'https://msi.app/#/p/alpha?embed=1'
    );
  });

  it('emits a copy-ready iframe snippet with disclosure', () => {
    const snippet = buildIframeEmbedSnippet('alpha', { origin: 'https://msi.app' });
    expect(snippet).toContain('src="https://msi.app/#/p/alpha?embed=1"');
    expect(snippet).toContain('<iframe');
    expect(snippet).toContain(PORTFOLIO_EMBED_DISCLOSURE);
  });
});
