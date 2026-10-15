import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
    beginGoogleSignIn,
    classifyAuthorizeProbe,
    getOAuthRedirectTo,
    parseGoTrueAuthorizeError,
} from '../../lib/googleOAuth';

const PROVIDER_DISABLED_BODY =
    '{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}';

describe('getOAuthRedirectTo', () => {
    it('keeps a bare origin so it matches the Supabase Site URL', () => {
        expect(getOAuthRedirectTo('https://modern-sports-intelligence-demo.vercel.app')).toBe(
            'https://modern-sports-intelligence-demo.vercel.app',
        );
    });

    it('drops a HashRouter fragment and query from a full href', () => {
        expect(
            getOAuthRedirectTo('https://modern-sports-intelligence-demo.vercel.app/?code=abc#/login'),
        ).toBe('https://modern-sports-intelligence-demo.vercel.app');
    });

    it('returns an unparseable value unchanged', () => {
        expect(getOAuthRedirectTo('not a url')).toBe('not a url');
    });
});

describe('classifyAuthorizeProbe', () => {
    it('treats the live GoTrue provider-disabled body as an in-app error', () => {
        const decision = classifyAuthorizeProbe({
            type: 'cors',
            status: 400,
            body: PROVIDER_DISABLED_BODY,
        });
        expect(decision).toEqual({
            kind: 'error',
            code: 'provider_disabled',
            message: 'Unsupported provider: provider is not enabled',
        });
    });

    it('follows an opaque redirect instead of reading a body', () => {
        expect(classifyAuthorizeProbe({ type: 'opaqueredirect', status: 0, body: '' })).toEqual({
            kind: 'redirect',
        });
    });

    it('follows a 302', () => {
        expect(classifyAuthorizeProbe({ type: 'cors', status: 302, body: '' })).toEqual({
            kind: 'redirect',
        });
    });

    it('follows an unexpected 200 rather than trapping the user', () => {
        expect(classifyAuthorizeProbe({ type: 'cors', status: 200, body: '<html></html>' })).toEqual({
            kind: 'redirect',
        });
    });
});

describe('parseGoTrueAuthorizeError', () => {
    it('maps a non-JSON body to a generic failure', () => {
        expect(parseGoTrueAuthorizeError('nope')).toEqual({
            code: 'server_error',
            message: 'Google sign-in failed.',
        });
    });

    it('keeps other GoTrue error codes', () => {
        expect(
            parseGoTrueAuthorizeError('{"error_code":"unexpected_failure","msg":"server unavailable"}'),
        ).toEqual({ code: 'unexpected_failure', message: 'server unavailable' });
    });
});

describe('beginGoogleSignIn', () => {
    it('does not navigate when Google is disabled', async () => {
        const assign = vi.fn();
        const probeAuthorize = vi.fn(async () => ({
            type: 'cors',
            status: 400,
            body: PROVIDER_DISABLED_BODY,
        }));
        const result = await beginGoogleSignIn({
            origin: 'https://modern-sports-intelligence-demo.vercel.app/#/login',
            startOAuth: async (redirectTo) => {
                expect(redirectTo).toBe('https://modern-sports-intelligence-demo.vercel.app');
                return {
                    url: `https://vhbsokjqchaafluimgjh.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`,
                    error: null,
                };
            },
            probeAuthorize,
            assign,
        });
        expect(assign).not.toHaveBeenCalled();
        expect(result.error?.code).toBe('provider_disabled');
        expect(result.error?.message).toMatch(/provider is not enabled/);
    });

    it('navigates when the authorize endpoint redirects', async () => {
        const assign = vi.fn();
        const result = await beginGoogleSignIn({
            origin: 'https://preview.example',
            startOAuth: async () => ({ url: 'https://project.supabase.co/auth/v1/authorize?provider=google', error: null }),
            probeAuthorize: async () => ({ type: 'opaqueredirect', status: 0, body: '' }),
            assign,
        });
        expect(result.error).toBeNull();
        expect(assign).toHaveBeenCalledWith('https://project.supabase.co/auth/v1/authorize?provider=google');
    });

    it('still navigates when the probe throws', async () => {
        const assign = vi.fn();
        const result = await beginGoogleSignIn({
            origin: 'https://modern-sports-intelligence-demo.vercel.app',
            startOAuth: async () => ({ url: 'https://project.supabase.co/auth/v1/authorize', error: null }),
            probeAuthorize: async () => {
                throw new Error('Failed to fetch');
            },
            assign,
        });
        expect(result.error).toBeNull();
        expect(assign).toHaveBeenCalledOnce();
    });

    it('returns the client error without probing', async () => {
        const probeAuthorize = vi.fn();
        const assign = vi.fn();
        const result = await beginGoogleSignIn({
            origin: 'https://modern-sports-intelligence-demo.vercel.app',
            startOAuth: async () => ({ url: null, error: { message: 'Demo mode - OAuth not available' } }),
            probeAuthorize,
            assign,
        });
        expect(probeAuthorize).not.toHaveBeenCalled();
        expect(assign).not.toHaveBeenCalled();
        expect(result.error?.message).toMatch(/Demo mode/);
        expect(result.error?.code).toBe('oauth_start_failed');
    });

    it('returns a failure when OAuth yields no url and no error', async () => {
        const result = await beginGoogleSignIn({
            origin: 'https://modern-sports-intelligence-demo.vercel.app',
            startOAuth: async () => ({ url: null, error: null }),
            probeAuthorize: async () => ({ type: 'cors', status: 400, body: '' }),
            assign: vi.fn(),
        });
        expect(result.error?.message).toBe('Google sign-in failed.');
    });
});

describe('supabase redirect allow list', () => {
    const toml = readFileSync('supabase/config.toml', 'utf8');

    it('lists the production origin the client sends as redirectTo', () => {
        expect(toml).toContain('site_url = "https://modern-sports-intelligence-demo.vercel.app"');
        expect(toml).toContain('"https://modern-sports-intelligence-demo.vercel.app"');
        expect(toml).toContain('"https://modern-sports-intelligence-demo.vercel.app/**"');
    });

    it('lists branch aliases and unique deployment hosts without a path', () => {
        expect(toml).toContain('"https://*-hondo4185-5820s-projects.vercel.app"');
        expect(toml).toContain('"https://modern-sports-intelligence-demo-*.vercel.app"');
    });
});
