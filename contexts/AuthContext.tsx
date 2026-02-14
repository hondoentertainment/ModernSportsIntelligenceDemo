import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../lib/supabase';
import { migrateToSupabase, needsMigration } from '../lib/migration';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isDemoMode: boolean;
    recoveryMode: boolean;
    isMigrating: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, username?: string) => Promise<{ error: AuthError | null }>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
    updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
    refreshSession: () => Promise<void>;
    clearRecoveryMode: () => void;
    demoLogin: () => void;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [recoveryMode, setRecoveryMode] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Proactive session refresh to prevent token expiry
    const startSessionRefreshTimer = useCallback(() => {
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
        if (isDemoMode) return;

        refreshTimerRef.current = setInterval(async () => {
            try {
                const { data, error } = await supabase.auth.refreshSession();
                if (error) {
                    console.warn('Session refresh failed:', error.message);
                } else if (data.session) {
                    setSession(data.session);
                    setUser(data.session.user);
                }
            } catch (e) {
                console.warn('Session refresh error:', e);
            }
        }, SESSION_REFRESH_INTERVAL);
    }, []);

    const stopSessionRefreshTimer = useCallback(() => {
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        // Check for demo mode session
        const demoSession = localStorage.getItem('msi_demo_session');
        if (isDemoMode && demoSession) {
            setUser({ id: 'demo-user', email: 'demo@sportsintel.io' } as User);
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Start refresh timer if we have a session
            if (session) {
                startSessionRefreshTimer();
            }
        });

        // Listen for auth state changes with event-specific handling
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            switch (event) {
                case 'PASSWORD_RECOVERY':
                    // User clicked the password reset link in their email.
                    // Set recovery mode so ResetPassword page knows it has a valid session.
                    setRecoveryMode(true);
                    // Navigate to the reset-password page (using hash router)
                    window.location.hash = '/reset-password';
                    break;

                case 'TOKEN_REFRESHED':
                    console.log('[Auth] Session token refreshed');
                    break;

                case 'SIGNED_IN':
                    setRecoveryMode(false);
                    startSessionRefreshTimer();

                    // Handle data migration if needed
                    if (session?.user && needsMigration()) {
                        setIsMigrating(true);
                        migrateToSupabase(session.user.id).then((result) => {
                            if (result.success) {
                                console.log('[Auth] Migration successful:', result);
                            } else {
                                console.error('[Auth] Migration failed:', result.errors);
                            }
                            setIsMigrating(false);
                        });
                    }
                    break;

                case 'SIGNED_OUT':
                    setRecoveryMode(false);
                    stopSessionRefreshTimer();
                    break;

                case 'USER_UPDATED':
                    // Password was successfully changed or profile updated
                    setRecoveryMode(false);
                    break;
            }
        });

        return () => {
            subscription.unsubscribe();
            stopSessionRefreshTimer();
        };
    }, [startSessionRefreshTimer, stopSessionRefreshTimer]);

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
            localStorage.removeItem('msi_demo_session');
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
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
                console.warn('Manual session refresh failed:', error.message);
            } else if (data.session) {
                setSession(data.session);
                setUser(data.session.user);
            }
        } catch (e) {
            console.warn('Manual session refresh error:', e);
        }
    };

    const clearRecoveryMode = () => setRecoveryMode(false);

    const demoLogin = () => {
        localStorage.setItem('msi_demo_session', 'true');
        setUser({ id: 'demo-user', email: 'demo@sportsintel.io' } as User);
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
            isMigrating
        }}>
            {children}
        </AuthContext.Provider>
    );
};
