import { describe, it, expect } from 'vitest';
import { pageTitleForPath } from '../../lib/documentTitle';

describe('pageTitleForPath', () => {
  it('uses auth route labels', () => {
    expect(pageTitleForPath('/login')).toContain('Sign in');
    expect(pageTitleForPath('/signup')).toContain('Create account');
  });

  it('uses nav label for dashboard', () => {
    expect(pageTitleForPath('/')).toContain('Dashboard');
  });

  it('uses feature catalog when path matches', () => {
    expect(pageTitleForPath('/agent-outcome-memory')).toContain('Agent Outcome Memory');
  });

  it('humanizes unknown paths', () => {
    expect(pageTitleForPath('/foo-bar-baz')).toContain('Foo Bar Baz');
  });

  it('handles public portfolio', () => {
    expect(pageTitleForPath('/p/demo_user')).toContain('Public portfolio');
  });
});
