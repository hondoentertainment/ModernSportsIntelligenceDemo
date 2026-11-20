import { afterEach, describe, expect, it, vi } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  DEMO_AI_CANNED,
  DEMO_SESSION_KEY,
  DEMO_STRIPE_MESSAGE,
  demoSessionIsActive,
  discardPublicDemoData,
  guardSupabaseClient,
  isActiveDemoSession,
  markPublicDemoData,
  publicDemoDataIsLocal,
  publicDemoDefault,
  runRemoteOrDemo,
} from '../../lib/demoSession';

vi.mock('../../lib/serverApi', () => ({
  serverApiRequestAuthenticated: vi.fn(),
  ServerApiError: class ServerApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

vi.mock('../../lib/supabase', () => ({
  isDemoMode: false,
  supabase: {
    from: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}));

import { createGeminiClient } from '../../lib/utils/geminiClient';
import { createCheckoutSession } from '../../lib/utils/billingService';
import { fetchCards } from '../../lib/supabaseData';
import { serverApiRequestAuthenticated } from '../../lib/serverApi';
import { supabase } from '../../lib/supabase';

afterEach(() => {
  store.remove(DEMO_SESSION_KEY);
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('public demo flag', () => {
  it('defaults on for production and off otherwise', () => {
    expect(publicDemoDefault(undefined, true, 'production')).toBe(true);
    expect(publicDemoDefault('', true, 'production')).toBe(true);
    expect(publicDemoDefault(undefined, true, 'e2e')).toBe(false);
    expect(publicDemoDefault(undefined, false, 'development')).toBe(false);
    expect(publicDemoDefault('false', true, 'production')).toBe(false);
    expect(publicDemoDefault('0', true, 'production')).toBe(false);
    expect(publicDemoDefault('off', true, 'production')).toBe(false);
    expect(publicDemoDefault('true', false, 'test')).toBe(true);
    expect(publicDemoDefault('1', false, 'development')).toBe(true);
  });

  it('does not treat a stray flag as a session when the public demo is off', () => {
    expect(demoSessionIsActive({ flag: true, buildDemo: false, publicDemo: false })).toBe(false);
    expect(demoSessionIsActive({ flag: false, buildDemo: false, publicDemo: true })).toBe(false);
    expect(demoSessionIsActive({ flag: true, buildDemo: false, publicDemo: true })).toBe(true);
    expect(demoSessionIsActive({ flag: true, buildDemo: true, publicDemo: false })).toBe(true);
  });
});

describe('demo session guard', () => {
  function enterProductionDemo(): void {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('VITE_PUBLIC_DEMO', 'true');
    store.set(DEMO_SESSION_KEY, true);
  }

  it('does not call Supabase, Stripe, or AI while a demo session is active', async () => {
    enterProductionDemo();
    expect(isActiveDemoSession()).toBe(true);

    const supabaseCall = vi.fn();
    const stripeCall = vi.fn();
    const aiCall = vi.fn();
    await expect(runRemoteOrDemo('supabase', 'local', supabaseCall)).resolves.toBe('local');
    await expect(runRemoteOrDemo('stripe', 'local', stripeCall)).resolves.toBe('local');
    await expect(runRemoteOrDemo('ai', 'canned', aiCall)).resolves.toBe('canned');
    expect(supabaseCall).not.toHaveBeenCalled();
    expect(stripeCall).not.toHaveBeenCalled();
    expect(aiCall).not.toHaveBeenCalled();

    await expect(fetchCards('user-1')).resolves.toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();

    await expect(createCheckoutSession('user-1', 'pro')).rejects.toThrow(DEMO_STRIPE_MESSAGE);
    expect(supabase.functions.invoke).not.toHaveBeenCalled();

    const client = createGeminiClient();
    await expect(
      client.models.generateContent({ model: 'gemini-pro', contents: 'hi' })
    ).resolves.toEqual({
      text: DEMO_AI_CANNED,
    });
    expect(serverApiRequestAuthenticated).not.toHaveBeenCalled();
  });

  it('still calls Supabase and AI when the visitor is not in a demo session', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('VITE_PUBLIC_DEMO', 'true');
    expect(isActiveDemoSession()).toBe(false);

    const live = vi.fn().mockResolvedValue('account');
    await expect(runRemoteOrDemo('supabase', 'local', live)).resolves.toBe('account');
    expect(live).toHaveBeenCalledOnce();

    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    vi.mocked(supabase.from).mockReturnValue(query as never);
    await fetchCards('user-1');
    expect(supabase.from).toHaveBeenCalledWith('cards');

    vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({ text: 'live' });
    const client = createGeminiClient();
    await expect(
      client.models.generateContent({ model: 'gemini-pro', contents: 'hi' })
    ).resolves.toEqual({
      text: 'live',
    });
    expect(serverApiRequestAuthenticated).toHaveBeenCalled();
  });

  it('blocks from, functions, and channel on the guarded client and leaves auth alone', async () => {
    enterProductionDemo();
    const from = vi.fn(() => ({ select: vi.fn() }));
    const invoke = vi.fn();
    const channel = vi.fn();
    const signIn = vi.fn();
    const guarded = guardSupabaseClient({
      auth: { signInWithPassword: signIn },
      from,
      functions: { invoke },
      channel,
    });

    guarded.from('cards');
    await guarded.functions.invoke('create-checkout-session', {});
    guarded.channel('prices');
    guarded.auth.signInWithPassword({ email: 'a@b.co', password: 'Password1' });

    expect(from).not.toHaveBeenCalled();
    expect(invoke).not.toHaveBeenCalled();
    expect(channel).not.toHaveBeenCalled();
    expect(signIn).toHaveBeenCalledOnce();
  });

  it('discards seeded demo rows before a real account can migrate them', () => {
    store.set('cardx_inventory', [{ id: 'demo' }]);
    store.set('cardx_price_history', { '11': [] });
    markPublicDemoData();
    expect(publicDemoDataIsLocal()).toBe(true);
    discardPublicDemoData();
    expect(publicDemoDataIsLocal()).toBe(false);
    expect(store.get('cardx_inventory', null)).toBeNull();
    expect(store.get('cardx_price_history', null)).toBeNull();
  });
});
