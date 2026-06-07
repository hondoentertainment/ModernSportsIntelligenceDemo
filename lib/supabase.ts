import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Demo mode flag for when Supabase isn't configured
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

if (isDemoMode) {
    logger.warn('⚠️ Supabase credentials not configured. Auth will run in demo mode.');
}

// Create a mock client for demo mode to prevent crashes
const createMockClient = (): SupabaseClient => {
    const mockAuth = {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Demo mode - use Enter Demo Mode button' } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Demo mode - use Enter Demo Mode button' } }),
        signInWithOAuth: () => Promise.resolve({ data: { url: null, provider: 'google' }, error: { message: 'Demo mode - OAuth not available' } }),
        signOut: () => Promise.resolve({ error: null }),
        resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
        updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
        refreshSession: () => Promise.resolve({ data: { session: null, user: null }, error: null }),
    };

    const createQueryBuilder = () => {
        const builder: Record<string, unknown> = {};
        const chain = () => builder;
        builder.select = chain;
        builder.insert = chain;
        builder.update = chain;
        builder.delete = chain;
        builder.eq = chain;
        builder.neq = chain;
        builder.order = chain;
        builder.limit = chain;
        builder.single = () => Promise.resolve({ data: null, error: { message: 'Demo mode' } });
        builder.maybeSingle = () => Promise.resolve({ data: null, error: null });
        builder.then = (
            onFulfilled?: ((value: { data: unknown[]; error: null }) => unknown) | null,
            onRejected?: ((reason: unknown) => unknown) | null,
        ) => Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
        return builder;
    };

    return {
        auth: mockAuth,
        from: () => createQueryBuilder(),
    } as unknown as SupabaseClient;
};

export const supabase: SupabaseClient = isDemoMode
    ? createMockClient()
    : createClient(supabaseUrl, supabaseAnonKey);

