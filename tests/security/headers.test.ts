import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Production HTTP security headers (vercel.json)', () => {
  const cfg = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as {
    headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
  };
  const allRoutes = cfg.headers.find((h) => h.source === '/(.*)');
  const headerMap = new Map<string, string>(
    (allRoutes?.headers ?? []).map((h) => [h.key, h.value])
  );

  it('serves all-routes headers on /(.*)', () => {
    expect(allRoutes, 'No catch-all /(.*) header block found').toBeDefined();
  });

  it('sets X-Frame-Options to SAMEORIGIN', () => {
    expect(headerMap.get('X-Frame-Options')).toBe('SAMEORIGIN');
  });

  it('sets X-Content-Type-Options to nosniff', () => {
    expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('sets a Referrer-Policy', () => {
    expect(headerMap.get('Referrer-Policy')).toMatch(/strict-origin/);
  });

  it('enforces CSP (not Report-Only)', () => {
    expect(headerMap.has('Content-Security-Policy')).toBe(true);
    expect(headerMap.has('Content-Security-Policy-Report-Only')).toBe(false);
    const csp = headerMap.get('Content-Security-Policy')!;
    expect(csp).toMatch(/default-src\s+'self'/);
    expect(csp).toMatch(/frame-ancestors\s+'self'/);
    expect(csp).toMatch(/base-uri\s+'self'/);
  });

  it('sets HSTS with 2-year max-age, includeSubDomains, and preload', () => {
    const hsts = headerMap.get('Strict-Transport-Security');
    expect(hsts, 'HSTS header is required for production HTTPS enforcement').toBeDefined();
    expect(hsts).toMatch(/max-age=63072000/);
    expect(hsts).toMatch(/includeSubDomains/);
    expect(hsts).toMatch(/preload/);
  });

  it('sets Permissions-Policy denying microphone and geolocation by default', () => {
    const pp = headerMap.get('Permissions-Policy');
    expect(pp, 'Permissions-Policy is required').toBeDefined();
    expect(pp).toMatch(/microphone=\(\)/);
    expect(pp).toMatch(/geolocation=\(\)/);
    expect(pp).toMatch(/interest-cohort=\(\)/);
  });

  it('permits camera for in-app scanner and payment for Stripe', () => {
    const pp = headerMap.get('Permissions-Policy')!;
    expect(pp).toMatch(/camera=\(self\)/);
    expect(pp).toMatch(/payment=\(self\s+"https:\/\/js\.stripe\.com"\)/);
  });
});
