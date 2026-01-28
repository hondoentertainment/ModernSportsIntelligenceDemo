import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Demo mode flag for when Supabase isn't configured
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

if (isDemoMode) {
    console.warn('⚠️ Supabase credentials not configured. Auth will run in demo mode.');
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
    };
    return { auth: mockAuth } as unknown as SupabaseClient;
};

export const supabase: SupabaseClient = isDemoMode
    ? createMockClient()
    : createClient(supabaseUrl, supabaseAnonKey);

