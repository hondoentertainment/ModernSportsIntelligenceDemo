// @ts-nocheck
import { supabase } from './supabase';

/**
 * Headers for same-origin server routes that require a Supabase session or shared secret.
 */
export async function getServerApiAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}
