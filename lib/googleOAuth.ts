/**
 * Google sign-in goes through Supabase `signInWithOAuth` (implicit grant).
 * The client navigates to `{SUPABASE_URL}/auth/v1/authorize?provider=google`.
 * When the Google provider is off, GoTrue answers that navigation with a JSON
 * 400 and the user is stranded on supabase.co. Probe the authorize URL first
 * and only leave the app when GoTrue actually redirects.
 *
 * `redirectTo` is the bare origin. This app uses HashRouter, so a fragment in
 * `redirectTo` would be the route, and implicit-grant tokens are appended as
 * a fragment after `redirectTo`.
 */

export interface AuthorizeProbe {
    type: string;
    status: number;
    body: string;
}

export interface GoogleSignInFailure {
    name: 'AuthError';
    message: string;
    status: number;
    code: string;
}

export function isProviderDisabledMessage(message: string): boolean {
    const normalized = message.toLowerCase();
    return normalized.includes('provider is not enabled') || normalized.includes('unsupported provider');
}

/** Origin only: no path, query, or hash. Matches the Supabase Site URL. */
export function getOAuthRedirectTo(origin: string): string {
    try {
        return new URL(origin).origin;
    } catch {
        return origin;
    }
}

export function parseGoTrueAuthorizeError(body: string): { code: string; message: string } {
    try {
        const json = JSON.parse(body) as {
            error_code?: string;
            msg?: string;
            message?: string;
            error_description?: string;
        };
        const message = json.msg || json.error_description || json.message || 'Google sign-in failed.';
        const rawCode = json.error_code || 'server_error';
        const code = isProviderDisabledMessage(message) ? 'provider_disabled' : rawCode;
        return { code, message };
    } catch {
        return { code: 'server_error', message: 'Google sign-in failed.' };
    }
}

/**
 * A real authorize response is a redirect (302, or an opaque redirect when
 * `fetch` is not allowed to follow it). Anything else with an error status
 * is a configuration failure and must stay on the login page.
 */
export function classifyAuthorizeProbe(
    probe: AuthorizeProbe,
): { kind: 'redirect' } | { kind: 'error'; code: string; message: string } {
    if (probe.type === 'opaqueredirect' || (probe.status >= 300 && probe.status < 400)) {
        return { kind: 'redirect' };
    }
    if (probe.status >= 400) {
        const parsed = parseGoTrueAuthorizeError(probe.body);
        return { kind: 'error', code: parsed.code, message: parsed.message };
    }
    return { kind: 'redirect' };
}

function failure(message: string, code: string, status = 400): GoogleSignInFailure {
    return { name: 'AuthError', message, status, code };
}

export async function beginGoogleSignIn(options: {
    origin: string;
    startOAuth: (_redirectTo: string) => Promise<{
        url: string | null;
        error: { message: string; code?: string; status?: number } | null;
    }>;
    probeAuthorize: (_url: string) => Promise<AuthorizeProbe>;
    assign: (_url: string) => void;
}): Promise<{ error: GoogleSignInFailure | null }> {
    const redirectTo = getOAuthRedirectTo(options.origin);
    const started = await options.startOAuth(redirectTo);
    if (started.error || !started.url) {
        return {
            error: failure(
                started.error?.message || 'Google sign-in failed.',
                started.error?.code || 'oauth_start_failed',
                started.error?.status || 400,
            ),
        };
    }

    try {
        const probe = await options.probeAuthorize(started.url);
        const decision = classifyAuthorizeProbe(probe);
        if (decision.kind === 'error') {
            return { error: failure(decision.message, decision.code) };
        }
    } catch {
        // The probe is best-effort. If it throws, still navigate so a live
        // redirect is not blocked by a CORS or network quirk.
    }

    options.assign(started.url);
    return { error: null };
}
