import { describe, it, expect } from 'vitest';
import {
  MVP_LAUNCH_ROUTES,
  isMvpLaunchRoute,
  isPublicLaunchRoute,
  normalizeRoutePath,
} from '../../lib/productionLaunch';

describe('productionLaunch', () => {
  it('includes core subscriber MVP routes', () => {
    expect(MVP_LAUNCH_ROUTES).toContain('/');
    expect(MVP_LAUNCH_ROUTES).toContain('/collection');
    expect(MVP_LAUNCH_ROUTES).toContain('/billing');
    expect(MVP_LAUNCH_ROUTES).toContain('/settings');
  });

  it('normalizes trailing slashes', () => {
    expect(normalizeRoutePath('/collection/')).toBe('/collection');
    expect(normalizeRoutePath('/')).toBe('/');
  });

  it('identifies MVP and public routes', () => {
    expect(isMvpLaunchRoute('/billing')).toBe(true);
    expect(isMvpLaunchRoute('/war-room')).toBe(true);
    expect(isMvpLaunchRoute('/api-licensing')).toBe(true);
    expect(isMvpLaunchRoute('/card-show-mode')).toBe(true);
    expect(isPublicLaunchRoute('/login')).toBe(true);
    expect(isPublicLaunchRoute('/p/collector1')).toBe(true);
    expect(isPublicLaunchRoute('/collection')).toBe(false);
  });

  it('includes Bloomberg terminal routes in the allowlist', () => {
    expect(MVP_LAUNCH_ROUTES).toContain('/war-room');
    expect(MVP_LAUNCH_ROUTES).toContain('/catalyst-market');
    expect(MVP_LAUNCH_ROUTES).toContain('/audit-dossier');
  });
});
