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
import { logger } from '../lib/logger';
import { store } from '../lib/dal/syncStore';

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
    resetPassword: (_email: string) => Promise<{ error: AuthError | null }>;
    updatePassword: (_password: string) => Promise<{ error: AuthError | null }>;
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
    const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string, username?: string) => {
        if (isDemoMode) {
            demoLogin();
            return { error: null };
        }
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });
        return { error };
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        return { error };
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

    const resetPassword = async (email: string) => {
        if (isDemoMode) return { error: null };
        // Use origin as redirect base — Supabase appends tokens as hash fragments.
        // The onAuthStateChange PASSWORD_RECOVERY handler navigates to /reset-password.
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        return { error };
    };

    const updatePassword = async (password: string) => {
        if (isDemoMode) return { error: null };
        const { error } = await supabase.auth.updateUser({ password });
        if (!error) {
            setRecoveryMode(false);
        }
        return { error };
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
            resetProfileState('alpha');
            return;
        }
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('subscription_tier, subscription_status, ai_valuations_used, card_tracking_limit, billing_cycle_start, role')
                .eq('id', user.id)
                .single();
            if (error) {
                logger.warn('Failed to fetch user profile:', error.message);
                resetProfileState('free');
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
            resetProfileState('free');
        }
    }, [user, resetProfileState]);

    useEffect(() => {
        if (!user) return;
        fetchUserProfile();
        const interval = setInterval(fetchUserProfile, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user, fetchUserProfile]);

    const demoLogin = () => {
        store.set(LS_DEMO_SESSION, true);
        setUser({ id: 'demo-user', email: 'demo@sportsintel.io' } as User);
        resetProfileState('alpha');
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
            refreshSession,
            clearRecoveryMode,
            demoLogin,
            userTier,
            operatorRole,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
