import { describe, it, expect } from 'vitest';
import { pageTitleForPath } from '../../lib/documentTitle';

describe('pageTitleForPath', () => {
  it('uses auth route labels', () => {
    expect(pageTitleForPath('/login')).toContain('Sign in');
    expect(pageTitleForPath('/signup')).toContain('Create account');
    expect(pageTitleForPath('/forgot-password')).toContain('Reset password');
    expect(pageTitleForPath('/reset-password')).toContain('Set new password');
  });

  it('handles trailing slashes', () => {
    expect(pageTitleForPath('/login/')).toContain('Sign in');
    expect(pageTitleForPath('/')).toContain('Dashboard');
  });

  it('uses nav label for dashboard', () => {
    expect(pageTitleForPath('/')).toContain('Dashboard');
  });

  it('uses feature catalog when path matches', () => {
    expect(pageTitleForPath('/agent-outcome-memory')).toContain('Agent Outcome Memory');
  });

  it('humanizes unknown paths', () => {
    expect(pageTitleForPath('/foo-bar-baz')).toContain('Foo Bar Baz');
    expect(pageTitleForPath('/test-path')).toContain('Test Path');
  });

  it('handles public portfolio', () => {
    expect(pageTitleForPath('/p/demo_user')).toContain('Public portfolio');
    expect(pageTitleForPath('/p/username')).toContain('Public portfolio');
  });

  it('handles nested nav paths', () => {
    const result = pageTitleForPath('/collection/123');
    expect(result).toBeDefined();
    expect(result).toContain('MSI');
  });

  it('returns base title for empty path segments', () => {
    const result = pageTitleForPath('/');
    expect(result).toBeDefined();
  });

  it('returns base title when no nav/feature segment (e.g. ///)', () => {
    expect(pageTitleForPath('///')).toBe('MSI | Modern Sports Intelligence');
  });

  it('handles paths with multiple segments', () => {
    const result = pageTitleForPath('/deep-search/advanced');
    expect(result).toBeDefined();
  });
});
