import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not configured. Auth will run in demo mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Demo mode flag for when Supabase isn't configured
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;
