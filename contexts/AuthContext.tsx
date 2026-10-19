import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../lib/supabase';
import { beginGoogleSignIn } from '../lib/googleOAuth';
import { logger } from '../lib/logger';
import { store } from '../lib/dal/syncStore';
import {
    GENERIC_SIGN_IN_ERROR,
    USERNAME_CHANGE_UNAVAILABLE,
    USERNAME_TAKEN_ERROR,
    classifyLoginIdentifier,
    interpretUsernameWriteError,
    isCredentialFailure,
    isHiddenAccountError,
    isUsernameTakenError,
    passwordRuleError,
    toAuthError,
    validateAuthUsername,
} from '../lib/authCredentials';
import {
    requestUsernameAvailability,
    requestUsernamePasswordReset,
    requestUsernamePasswordSignIn,
} from '../lib/passwordAuth';

const LS_DEMO_SESSION = 'msi_demo_session';
const LS_USER_PROFILE = 'msi_user_profile';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isDemoMode: boolean;
    recoveryMode: boolean;
    signIn: (_email: string, _password: string) => Promise<{ error: AuthError | null }>;
    signUp: (_email: string, _password: string, _username?: string) => Promise<{ error: AuthError | null }>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPassword: (_identifier: string) => Promise<{ error: AuthError | null }>;
    updatePassword: (_password: string) => Promise<{ error: AuthError | null }>;
    updateUsername: (_username: string) => Promise<{ error: AuthError | null }>;
    changePassword: (_currentPassword: string, _nextPassword: string) => Promise<{ error: AuthError | null }>;
    refreshSession: () => Promise<void>;
    clearRecoveryMode: () => void;
    demoLogin: () => void;
    userTier: 'free' | 'basic' | 'pro' | 'alpha';
    /**
     * Trust-boundary role for Phase 31 operator surfaces (audit-trail admin
     * viewer, etc.). Sourced from `profiles.role`; falls back to `member` for
     * every unauthenticated / unloaded / demo session so callers can render
     * an unconditional "member" UI without null checks.
     */
    operatorRole: 'member' | 'support' | 'admin';
    /**
     * True while the initial `profiles` fetch is in flight for the signed-in
     * user. Trust-boundary UI (e.g. `<AdminRoute>`) must wait for this to
     * clear before evaluating `operatorRole`, otherwise the default `member`
     * value briefly bounces support/admin users off restricted routes.
     */
    profileLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

// Session refresh interval: 4 minutes (tokens typically expire at 5 min)
const SESSION_REFRESH_INTERVAL = 4 * 60 * 1000;
// Maximum time to wait for a session refresh before giving up
const SESSION_REFRESH_TIMEOUT_MS = 8000;
// Hard ceiling on initial auth resolution. If neither onAuthStateChange's
// INITIAL_SESSION event nor getSession() has resolved within this window,
// we drop the loading shell so the user can sign in or use the app instead
// of staring at an indefinite "Secure Uplink…" screen on slow networks or
// upstream Supabase outages.
const INITIAL_AUTH_TIMEOUT_MS = 6000;
// Hard ceiling on the profiles row fetch. A hung `.from('profiles')` must not
// leave `profileLoading` true after the session fail-safe has released `loading`.
const PROFILE_FETCH_TIMEOUT_MS = 6000;

/** Hung refresh must not clobber an already-loaded tier/role. */
export function shouldApplyProfileLoadTimeoutDefaults(
    loadedProfileForUserId: string | null,
    targetUserId: string,
): boolean {
    return loadedProfileForUserId !== targetUserId;
}

/**
 * Wraps supabase.auth.refreshSession() with a hard timeout so a slow or
 * hung network request cannot stall the refresh timer indefinitely.
 */
async function refreshSessionWithTimeout(timeoutMs: number) {
    return new Promise<Awaited<ReturnType<typeof supabase.auth.refreshSession>>>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Session refresh timed out')), timeoutMs);
        supabase.auth.refreshSession().then(result => {
            clearTimeout(timer);
            resolve(result);
        }).catch(err => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [recoveryMode, setRecoveryMode] = useState(false);
    const [userTier, setUserTier] = useState<'free' | 'basic' | 'pro' | 'alpha'>('free');
    const [operatorRole, setOperatorRole] = useState<'member' | 'support' | 'admin'>('member');
    // The user id whose profile row is currently reflected in `operatorRole`
    // and `userTier`. `null` means "no profile loaded" (fresh mount, sign-out,
    // just switched user). We derive `profileLoading` from this so the very
    // first render after a session is adopted correctly says
    // `profileLoading === true` — otherwise `<AdminRoute>` sees
    // `loading=false` + default `operatorRole='member'` on that render and
    // bounces a real support/admin user to `/audit-trail` with no way back.
    const [loadedProfileForUserId, setLoadedProfileForUserId] = useState<string | null>(null);
    // `profileLoading` is true whenever we have a signed-in user whose
    // profile hasn't been loaded yet (or belongs to a different user id
    // because we just switched accounts).
    const profileLoading = !!user && loadedProfileForUserId !== user.id;
    const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const loadedProfileForUserIdRef = useRef<string | null>(null);
    const profileFailsafesRef = useRef(new Set<ReturnType<typeof setTimeout>>());
    loadedProfileForUserIdRef.current = loadedProfileForUserId;

    // Proactive session refresh to prevent token expiry
    const startSessionRefreshTimer = useCallback(() => {
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
        if (isDemoMode) return;

        refreshTimerRef.current = setInterval(async () => {
            try {
                const { data, error } = await refreshSessionWithTimeout(SESSION_REFRESH_TIMEOUT_MS);
                if (error) {
                    logger.warn('Session refresh failed:', error.message);
                } else if (data.session) {
                    setSession(data.session);
                    setUser(data.session.user);
                }
            } catch (e) {
                logger.warn('Session refresh error:', e);
            }
        }, SESSION_REFRESH_INTERVAL);
    }, []);

    const stopSessionRefreshTimer = useCallback(() => {
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    /**
     * Reset every profile-derived piece of state to its safe default. Called
     * from every path that leaves the "authenticated as this user" state
     * (sign-out, profile fetch failure, unknown values, demo login). Keeps
     * future profile-derived fields (tier, role, feature flags…) from being
     * forgotten at some exit sites.
     */
    const resetProfileState = useCallback((tier: 'free' | 'basic' | 'pro' | 'alpha' = 'free') => {
        setUserTier(tier);
        setOperatorRole('member');
        setLoadedProfileForUserId(null);
    }, []);

    useEffect(() => {
        let mounted = true;

        // Check for demo mode session (store + DAL path; legacy raw string still readable via JSON.parse)
        const demoSession = store.get<boolean | string | null>(LS_DEMO_SESSION, null);
        const demoActive = demoSession === true || demoSession === 'true';
        if (isDemoMode && demoActive) {
            setUser({ id: 'demo-user', email: 'demo@sportsintel.io' } as User);
            setLoading(false);
            return;
        }

        // Demo mock client never invokes onAuthStateChange; resolve via getSession only.
        if (isDemoMode) {
            const initDemoSession = async () => {
                try {
                    const { data: { session: initialSession } } = await supabase.auth.getSession();
                    if (mounted) {
                        setSession(initialSession);
                        setUser(initialSession?.user ?? null);
                    }
                } catch (error) {
                    logger.error('Error initializing session:', error);
                } finally {
                    if (mounted) setLoading(false);
                }
            };
            void initDemoSession();
            return () => {
                mounted = false;
            };
        }

        // Real client: end initial load on INITIAL_SESSION so user/session stay aligned (avoids
        // getSession finishing before the first auth callback and briefly showing signed-out UI).
        let initialLoadResolved = false;
        const resolveInitialLoad = () => {
            if (!mounted || initialLoadResolved) return;
            initialLoadResolved = true;
            setLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
            if (mounted) {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (event === 'INITIAL_SESSION') {
                    if (currentSession) startSessionRefreshTimer();
                    resolveInitialLoad();
                }

                switch (event) {
                    case 'PASSWORD_RECOVERY':
                        setRecoveryMode(true);
                        window.location.hash = '/reset-password';
                        break;
                    case 'TOKEN_REFRESHED':
                        if (import.meta.env.DEV) logger.warn('[Auth] Session token refreshed');
                        break;
                    case 'SIGNED_IN':
                        setRecoveryMode(false);
                        startSessionRefreshTimer();
                        resolveInitialLoad();
                        break;
                    case 'SIGNED_OUT':
                        setRecoveryMode(false);
                        stopSessionRefreshTimer();
                        resetProfileState('free');
                        store.remove(LS_USER_PROFILE);
                        resolveInitialLoad();
                        break;
                    case 'USER_UPDATED':
                        setRecoveryMode(false);
                        break;
                }
            }
        });

        // Belt-and-braces: seed initial state via getSession() in case the
        // INITIAL_SESSION event never fires (slow network, blocked websocket,
        // misconfigured anon key). Whichever resolves first wins.
        supabase.auth.getSession()
            .then(({ data, error }) => {
                if (!mounted) return;
                if (error) {
                    logger.warn('[Auth] getSession error during init:', error.message);
                } else if (data.session) {
                    setSession(data.session);
                    setUser(data.session.user);
                    startSessionRefreshTimer();
                }
                resolveInitialLoad();
            })
            .catch((e) => {
                logger.warn('[Auth] getSession threw during init:', e);
                if (mounted) resolveInitialLoad();
            });

        // Hard ceiling so a hung Supabase init can never trap users on the
        // loading shell. Falls through to the unauthenticated UI on timeout.
        const failsafeTimer = setTimeout(() => {
            if (mounted && !initialLoadResolved) {
                logger.warn(`[Auth] Initial auth resolution exceeded ${INITIAL_AUTH_TIMEOUT_MS}ms; releasing loading state.`);
                resolveInitialLoad();
            }
        }, INITIAL_AUTH_TIMEOUT_MS);

        return () => {
            mounted = false;
            clearTimeout(failsafeTimer);
            subscription.unsubscribe();
            stopSessionRefreshTimer();
        };
    }, [startSessionRefreshTimer, stopSessionRefreshTimer, resetProfileState]);

    const signIn = async (identifier: string, password: string) => {
        if (isDemoMode) {
            const { error } = await supabase.auth.signInWithPassword({ email: identifier, password });
            return { error };
        }
        const classified = classifyLoginIdentifier(identifier);
        if (classified.kind === 'email') {
            const { error } = await supabase.auth.signInWithPassword({
                email: classified.email,
                password,
            });
            if (error && isCredentialFailure(error)) {
                return { error: toAuthError(GENERIC_SIGN_IN_ERROR, 'invalid_credentials', 401) as AuthError };
            }
            return { error };
        }
        if (classified.kind !== 'username') {
            return { error: toAuthError(GENERIC_SIGN_IN_ERROR, 'invalid_credentials', 401) as AuthError };
        }
        const result = await requestUsernamePasswordSignIn(classified.username, password);
        if (result.ok) {
            const { error } = await supabase.auth.setSession({
                access_token: result.accessToken,
                refresh_token: result.refreshToken,
            });
            return { error };
        }
        const status = result.code === 'username_signin_unavailable' ? 409 : 401;
        return { error: toAuthError(result.message, result.code, status) as AuthError };
    };

    const signUp = async (email: string, password: string, username?: string) => {
        const parsedName = validateAuthUsername(username ?? '');
        if (!parsedName.ok) {
            return { error: toAuthError(parsedName.error, 'validation_failed') as AuthError };
        }
        const rule = passwordRuleError(password);
        if (rule) return { error: toAuthError(rule, 'weak_password') as AuthError };
        if (isDemoMode) {
            demoLogin();
            return { error: null };
        }
        const availability = await requestUsernameAvailability(parsedName.username);
        if (availability === 'taken') {
            return { error: toAuthError(USERNAME_TAKEN_ERROR, 'username_taken') as AuthError };
        }
        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: { username: parsedName.username },
            },
        });
        if (error && isUsernameTakenError(error)) {
            return { error: toAuthError(USERNAME_TAKEN_ERROR, 'username_taken') as AuthError };
        }
        return { error };
    };

    const signInWithGoogle = async () => {
        // Bare origin matches the Supabase Site URL. HashRouter owns the fragment,
        // and the implicit grant appends tokens there after this redirect.
        const { error } = await beginGoogleSignIn({
            origin: window.location.origin,
            startOAuth: async (redirectTo) => {
                const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo,
                        skipBrowserRedirect: true,
                    },
                });
                return {
                    url: data?.url ?? null,
                    error: oauthError
                        ? { message: oauthError.message, code: oauthError.code, status: oauthError.status }
                        : null,
                };
            },
            probeAuthorize: async (url) => {
                const response = await fetch(url, { redirect: 'manual' });
                const body = response.type === 'opaqueredirect' ? '' : await response.text();
                return { type: response.type, status: response.status, body };
            },
            assign: (url) => {
                window.location.assign(url);
            },
        });
        return { error: error as AuthError | null };
    };

    const signOut = async () => {
        if (isDemoMode) {
            store.remove(LS_DEMO_SESSION);
            setUser(null);
            setSession(null);
            return;
        }
        await supabase.auth.signOut();
    };

    const resetPassword = async (identifier: string) => {
        if (isDemoMode) return { error: null };
        const classified = classifyLoginIdentifier(identifier);
        if (classified.kind === 'invalid') {
            return {
                error: toAuthError('Enter a username or a valid email address.', 'invalid_identifier') as AuthError,
            };
        }
        // Origin only. HashRouter reads the recovery session and opens /reset-password.
        const redirectTo = window.location.origin;
        if (classified.kind === 'email') {
            const { error } = await supabase.auth.resetPasswordForEmail(classified.email, { redirectTo });
            if (error && isHiddenAccountError(error)) return { error: null };
            return { error };
        }
        const result = await requestUsernamePasswordReset(classified.username, redirectTo);
        if (!result.ok) return { error: toAuthError(result.message, result.code) as AuthError };
        return { error: null };
    };

    const updatePassword = async (password: string) => {
        if (isDemoMode) return { error: null };
        const rule = passwordRuleError(password);
        if (rule) return { error: toAuthError(rule, 'weak_password') as AuthError };
        const { error } = await supabase.auth.updateUser({ password });
        if (!error) {
            setRecoveryMode(false);
        }
        return { error };
    };

    const updateUsername = async (nextUsername: string) => {
        const parsed = validateAuthUsername(nextUsername);
        if (!parsed.ok) return { error: toAuthError(parsed.error, 'validation_failed') as AuthError };
        if (isDemoMode) {
            setUser(current => (
                current
                    ? { ...current, user_metadata: { ...current.user_metadata, username: parsed.username } } as User
                    : current
            ));
            return { error: null };
        }
        if (!user) return { error: toAuthError('Please sign in to continue.', 'sign_in_required') as AuthError };

        const { data, error } = await supabase
            .from('profiles')
            .update({ username: parsed.username })
            .eq('id', user.id)
            .select('username')
            .maybeSingle();
        const outcome = interpretUsernameWriteError(error);
        if (outcome === 'taken') return { error: toAuthError(USERNAME_TAKEN_ERROR, 'username_taken') as AuthError };
        if (outcome === 'unavailable') {
            return { error: toAuthError(USERNAME_CHANGE_UNAVAILABLE, 'username_signin_unavailable') as AuthError };
        }
        if (outcome === 'error') {
            return { error: toAuthError('Could not update username. Please try again.', 'username_update_failed') as AuthError };
        }
        if (!data) {
            const inserted = await supabase
                .from('profiles')
                .insert({ id: user.id, username: parsed.username })
                .select('username')
                .maybeSingle();
            const insertOutcome = interpretUsernameWriteError(inserted.error);
            if (insertOutcome === 'taken') return { error: toAuthError(USERNAME_TAKEN_ERROR, 'username_taken') as AuthError };
            if (insertOutcome === 'unavailable') {
                return { error: toAuthError(USERNAME_CHANGE_UNAVAILABLE, 'username_signin_unavailable') as AuthError };
            }
            if (insertOutcome === 'error' || !inserted.data) {
                return { error: toAuthError('Could not update username. Please try again.', 'username_update_failed') as AuthError };
            }
        }

        const { data: updated, error: metaError } = await supabase.auth.updateUser({
            data: { username: parsed.username },
        });
        if (updated.user) setUser(updated.user);
        return { error: metaError };
    };

    const changePassword = async (currentPassword: string, nextPassword: string) => {
        const rule = passwordRuleError(nextPassword);
        if (rule) return { error: toAuthError(rule, 'weak_password') as AuthError };
        if (isDemoMode) return { error: null };
        const email = user?.email;
        if (!email) {
            return {
                error: toAuthError('Add an email to this account before setting a password.', 'validation_failed') as AuthError,
            };
        }
        const { error: currentError } = await supabase.auth.signInWithPassword({
            email,
            password: currentPassword,
        });
        if (currentError) {
            return { error: toAuthError('Current password is incorrect.', 'current_password_incorrect', 401) as AuthError };
        }
        return updatePassword(nextPassword);
    };

    const refreshSession = async () => {
        if (isDemoMode) return;
        try {
            const { data, error } = await refreshSessionWithTimeout(SESSION_REFRESH_TIMEOUT_MS);
            if (error) {
                logger.warn('Manual session refresh failed:', error.message);
            } else if (data.session) {
                setSession(data.session);
                setUser(data.session.user);
            }
        } catch (e) {
            logger.warn('Manual session refresh error:', e);
        }
    };

    const clearRecoveryMode = () => setRecoveryMode(false);

    const fetchUserProfile = useCallback(async () => {
        if (isDemoMode) {
            setUserTier('alpha');
            setOperatorRole('member');
            // Demo mode has a synthetic 'demo-user' — mark it loaded so
            // downstream `<AdminRoute>` doesn't spin.
            setLoadedProfileForUserId('demo-user');
            return;
        }
        if (!user) return;
        const targetUserId = user.id;
        // Background refreshes must not clobber an already-established tier/role
        // if they hang. The failsafe only releases an unresolved *initial* load.
        const alreadyLoaded = !shouldApplyProfileLoadTimeoutDefaults(
            loadedProfileForUserIdRef.current,
            targetUserId,
        );
        let failsafe: ReturnType<typeof setTimeout> | null = null;
        if (!alreadyLoaded) {
            failsafe = setTimeout(() => {
                if (!shouldApplyProfileLoadTimeoutDefaults(loadedProfileForUserIdRef.current, targetUserId)) return;
                logger.warn(`[Auth] Profile fetch exceeded ${PROFILE_FETCH_TIMEOUT_MS}ms; releasing profileLoading.`);
                setUserTier('free');
                setOperatorRole('member');
                setLoadedProfileForUserId(targetUserId);
            }, PROFILE_FETCH_TIMEOUT_MS);
            profileFailsafesRef.current.add(failsafe);
        }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('subscription_tier, subscription_status, ai_valuations_used, card_tracking_limit, billing_cycle_start, role')
                .eq('id', targetUserId)
                .single();
            if (error) {
                logger.warn('Failed to fetch user profile:', error.message);
                setUserTier('free');
                setOperatorRole('member');
                return;
            }
            const validTiers: Array<'free' | 'basic' | 'pro' | 'alpha'> = ['free', 'basic', 'pro', 'alpha'];
            const tier = validTiers.includes(data.subscription_tier) ? data.subscription_tier : 'free';
            setUserTier(tier);
            const validRoles: Array<'member' | 'support' | 'admin'> = ['member', 'support', 'admin'];
            const rawRole = (data as { role?: unknown }).role;
            setOperatorRole(
                typeof rawRole === 'string' && validRoles.includes(rawRole as typeof validRoles[number])
                    ? (rawRole as 'member' | 'support' | 'admin')
                    : 'member',
            );
            store.set(LS_USER_PROFILE, data);
        } catch (e) {
            logger.warn('Error fetching user profile:', e);
            setUserTier('free');
            setOperatorRole('member');
        } finally {
            if (failsafe) {
                clearTimeout(failsafe);
                profileFailsafesRef.current.delete(failsafe);
            }
            // Mark the profile fetch complete FOR THIS USER ID. On the first
            // render after a session is adopted, `user?.id !==
            // loadedProfileForUserId`, so `profileLoading === true`; this
            // clears it and lets AdminRoute make a routing decision.
            setLoadedProfileForUserId(targetUserId);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        fetchUserProfile();
        const interval = setInterval(fetchUserProfile, 5 * 60 * 1000);
        return () => {
            clearInterval(interval);
            for (const timer of profileFailsafesRef.current) clearTimeout(timer);
            profileFailsafesRef.current.clear();
        };
    }, [user, fetchUserProfile]);

    const demoLogin = () => {
        store.set(LS_DEMO_SESSION, true);
        setUser({ id: 'demo-user', email: 'demo@sportsintel.io' } as User);
        setUserTier('alpha');
        setOperatorRole('member');
        // Mark the synthetic demo profile "loaded" so <AdminRoute> doesn't
        // hang on a demo session.
        setLoadedProfileForUserId('demo-user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            isDemoMode,
            recoveryMode,
            signIn,
            signUp,
            signInWithGoogle,
            signOut,
            resetPassword,
            updatePassword,
            updateUsername,
            changePassword,
            refreshSession,
            clearRecoveryMode,
            demoLogin,
            userTier,
            operatorRole,
            profileLoading,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
