import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
}

function supabaseAnonKey(): string | undefined {
  return process.env.SUPABASE_ANON_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim();
}

function supabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

const authOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
} as const;

/** Anon client for password grants. Never uses the service role to sign in. */
export function createAnonAuthClient(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, authOptions);
}

/**
 * Service role is server-only and used solely to call resolve_username_email.
 * That RPC is not granted to anon.
 */
export function createServiceClient(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseServiceKey();
  if (!url || !key) return null;
  return createClient(url, key, authOptions);
}
