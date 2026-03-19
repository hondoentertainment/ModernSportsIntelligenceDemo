import { describe, it, expect } from 'vitest';
import { supabase, isDemoMode } from '../../lib/supabase';

describe('supabase', () => {
  it('exports isDemoMode as boolean', () => {
    expect(typeof isDemoMode).toBe('boolean');
  });

  it('exports supabase client with auth API', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.auth.getSession).toBe('function');
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.auth.signUp).toBe('function');
    expect(typeof supabase.auth.signOut).toBe('function');
    expect(typeof supabase.auth.onAuthStateChange).toBe('function');
  });

  it('getSession returns promise resolving to session shape', async () => {
    const result = await supabase.auth.getSession();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('error');
  });

  it('onAuthStateChange returns subscription with unsubscribe', () => {
    const sub = supabase.auth.onAuthStateChange(() => {});
    expect(sub).toBeDefined();
    expect(sub.data?.subscription?.unsubscribe).toBeDefined();
    expect(typeof sub.data?.subscription?.unsubscribe).toBe('function');
  });

  it('signInWithPassword returns error in demo mode when credentials missing', async () => {
    const result = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test',
    });
    if (isDemoMode) {
      expect(result.error).toBeDefined();
      expect(result.error?.message).toMatch(/demo|Demo/i);
    }
  });
});
