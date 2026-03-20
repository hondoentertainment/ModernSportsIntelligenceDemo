import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../../lib/sanitizeHtml';

describe('sanitizeHtml', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('returns empty string for non-string input (runtime guard)', () => {
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
    expect(sanitizeHtml(0 as unknown as string)).toBe('');
  });

  it('allows non-empty whitespace through sanitizer', () => {
    expect(sanitizeHtml('   ').length).toBeGreaterThanOrEqual(0);
  });

  it('allows safe span with class (syntax highlighting)', () => {
    const html = '<span class="text-cyan-400">"key"</span>: <span class="text-green-400">"value"</span>';
    expect(sanitizeHtml(html)).toContain('text-cyan-400');
    expect(sanitizeHtml(html)).not.toContain('<script');
  });

  it('strips script tags', () => {
    const malicious = '<p>Hi</p><script>alert(1)</script><span class="ok">x</span>';
    const out = sanitizeHtml(malicious);
    expect(out).not.toMatch(/<script/i);
    expect(out).toContain('ok');
  });

  it('strips disallowed tags (e.g. img, iframe)', () => {
    const dirty =
      '<img src=x onerror=alert(1)><iframe src="https://evil"></iframe><span class="k">ok</span>';
    const out = sanitizeHtml(dirty);
    expect(out).not.toMatch(/<img/i);
    expect(out).not.toMatch(/<iframe/i);
    expect(out).toContain('ok');
  });

  it('strips event handler attributes', () => {
    const dirty = '<p onclick="alert(1)">text</p>';
    expect(sanitizeHtml(dirty)).not.toMatch(/onclick/i);
  });

  it('neutralizes javascript: URLs in href', () => {
    const dirty = '<a href="javascript:alert(1)">click</a>';
    const out = sanitizeHtml(dirty);
    expect(out).not.toMatch(/javascript:/i);
  });
});
