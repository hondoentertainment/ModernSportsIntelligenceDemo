/**
 * Public demo session.
 *
 * Local builds with no Supabase credentials already run as a demo. Production
 * keeps the real client so a signed-in account is unchanged. A visitor who
 * chooses "Try the demo" gets a local flag. While that flag is set, user-data
 * reads and writes, Stripe, and paid AI stay on the device.
 *
 * `VITE_PUBLIC_DEMO` is not a secret. Unset means on for production builds and
 * off for dev, test, and e2e. `false` / `0` / `off` disables it.
 */
import { store } from './dal/syncStore';

export const DEMO_SESSION_KEY = 'msi_demo_session';
export const DEMO_USER_ID = 'demo-user';
export const DEMO_USER_EMAIL = 'demo@sportsintel.io';
export const DEMO_DATA_MARK = 'msi_public_demo_data';
/** Collector cache parked while a public demo uses the shared local keys. */
export const PRE_DEMO_STASH_KEY = 'msi_pre_demo_cache';

/** Keys the public demo shares with a signed-in collector's on-device cache. */
export const DEMO_CACHE_KEYS = [
  'cardx_inventory',
  'cardx_targets',
  'cardx_favorites',
  'cardx_price_history',
  'cardx_sync_meta',
  'msi_card_favorites',
  'msi_demo_tape_version',
] as const;

export const DEMO_AI_CANNED =
  'Demo mode keeps AI offline. This is a canned note, not a model reply. Sign up to run live analysis.';

export const DEMO_STRIPE_MESSAGE =
  'Demo mode does not start checkout or open the billing portal. Sign up to subscribe.';

export const DEMO_REMOTE_MESSAGE = 'Demo mode does not read or write Supabase, Stripe, or paid AI.';

export type RemoteKind = 'supabase' | 'stripe' | 'ai';

export class DemoSessionBlockedError extends Error {
  readonly kind: RemoteKind;

  constructor(kind: RemoteKind) {
    super(
      kind === 'stripe' ? DEMO_STRIPE_MESSAGE : kind === 'ai' ? DEMO_AI_CANNED : DEMO_REMOTE_MESSAGE
    );
    this.name = 'DemoSessionBlockedError';
    this.kind = kind;
  }
}

export function publicDemoDefault(raw: string | undefined, prod: boolean, mode: string): boolean {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return prod && mode === 'production';
}

/** Supabase URL and anon key are both missing, so the build has no real client. */
export function isBuildDemoMode(): boolean {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
  const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  return !url || !key;
}

export function isPublicDemoEnabled(): boolean {
  return publicDemoDefault(
    typeof import.meta === 'undefined' ? undefined : import.meta.env.VITE_PUBLIC_DEMO,
    typeof import.meta !== 'undefined' && import.meta.env.PROD === true,
    typeof import.meta === 'undefined' ? '' : String(import.meta.env.MODE ?? '')
  );
}

export function readDemoSessionFlag(): boolean {
  const value = store.get<boolean | string | null>(DEMO_SESSION_KEY, null);
  return value === true || value === 'true';
}

export function demoSessionIsActive(input: {
  flag: boolean;
  buildDemo: boolean;
  publicDemo: boolean;
}): boolean {
  if (!input.flag) return false;
  return input.buildDemo || input.publicDemo;
}

/** The visitor entered the seeded demo. A real sign-in clears the flag. */
export function isActiveDemoSession(): boolean {
  return demoSessionIsActive({
    flag: readDemoSessionFlag(),
    buildDemo: isBuildDemoMode(),
    publicDemo: isPublicDemoEnabled(),
  });
}

/**
 * Production demo: Supabase is configured, the public flag is on, and the
 * visitor chose the demo. Labs routes stay off. The book is read-only.
 */
export function isPublicDemoSession(): boolean {
  return isActiveDemoSession() && !isBuildDemoMode() && isPublicDemoEnabled();
}

export function publicDemoDataIsLocal(): boolean {
  return store.get<boolean>(DEMO_DATA_MARK, false) === true;
}

export function markPublicDemoData(): void {
  store.set(DEMO_DATA_MARK, true);
}

/**
 * Move a signed-out collector's on-device book aside before the public demo
 * writes into the same keys. A second entry does not overwrite that stash
 * with demo rows. Local builds without Supabase are left alone.
 */
export function parkCollectorCacheForPublicDemo(): void {
  if (isBuildDemoMode() || !isPublicDemoEnabled()) return;
  if (publicDemoDataIsLocal()) return;
  if (!store.has(PRE_DEMO_STASH_KEY)) {
    const stash: Record<string, unknown> = {};
    for (const key of DEMO_CACHE_KEYS) {
      if (!store.has(key)) continue;
      stash[key] = store.get(key, null);
    }
    if (Object.keys(stash).length > 0) store.set(PRE_DEMO_STASH_KEY, stash);
  }
  for (const key of DEMO_CACHE_KEYS) store.remove(key);
}

/** Drop seeded demo rows before a real account reads or migrates local data. */
export function discardPublicDemoData(): void {
  if (!publicDemoDataIsLocal()) return;
  for (const key of [...DEMO_CACHE_KEYS, DEMO_DATA_MARK]) {
    store.remove(key);
  }
}

/**
 * Put the parked collector cache back and drop the demo book. Safe when
 * there was no previous cache: the demo keys are removed and nothing is restored.
 */
export function restoreCollectorCacheAfterDemo(): void {
  const stash = store.get<Record<string, unknown> | null>(PRE_DEMO_STASH_KEY, null);
  discardPublicDemoData();
  if (!stash || typeof stash !== 'object') return;
  for (const key of DEMO_CACHE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(stash, key)) store.set(key, stash[key]);
  }
  store.remove(PRE_DEMO_STASH_KEY);
}

/**
 * Run a Supabase, Stripe, or paid-AI call only when this is not a demo session.
 * The demo value is returned and `call` is not invoked.
 */
export async function runRemoteOrDemo<T>(
  _kind: RemoteKind,
  demoValue: T,
  call: () => Promise<T>
): Promise<T> {
  if (isActiveDemoSession()) return demoValue;
  return call();
}

type GuardedClient = {
  auth?: unknown;
  from?: (...args: unknown[]) => unknown;
  rpc?: (...args: unknown[]) => unknown;
  schema?: (...args: unknown[]) => unknown;
  channel?: (...args: unknown[]) => unknown;
  functions?: { invoke?: (...args: unknown[]) => unknown };
  storage?: unknown;
};

function blockedQuery(): Record<string, unknown> {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = chain;
  builder.insert = chain;
  builder.update = chain;
  builder.upsert = chain;
  builder.delete = chain;
  builder.eq = chain;
  builder.neq = chain;
  builder.in = chain;
  builder.order = chain;
  builder.limit = chain;
  builder.single = () => Promise.resolve({ data: null, error: { message: DEMO_REMOTE_MESSAGE } });
  builder.maybeSingle = () => Promise.resolve({ data: null, error: null });
  builder.then = (
    onFulfilled?: ((value: { data: unknown[]; error: null }) => unknown) | null,
    onRejected?: ((reason: unknown) => unknown) | null
  ) => Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
  return builder;
}

function blockedChannel(): Record<string, unknown> {
  const channel: Record<string, unknown> = {};
  channel.on = () => channel;
  channel.subscribe = () => channel;
  channel.unsubscribe = () => undefined;
  return channel;
}

/**
 * Wrap a Supabase client so a public demo session cannot reach user tables,
 * RPCs, edge functions, storage, or realtime. Auth stays on the real client
 * so signing in is unchanged.
 */
export function guardSupabaseClient<T extends object>(client: T): T {
  const raw = client as GuardedClient;
  return new Proxy(raw, {
    get(target, prop, receiver) {
      if (prop === 'auth') return Reflect.get(target, prop, receiver);
      if (prop === 'from' || prop === 'rpc' || prop === 'schema') {
        return (...args: unknown[]) => {
          if (isPublicDemoSession()) return blockedQuery();
          const fn = Reflect.get(target, prop, receiver) as (...inner: unknown[]) => unknown;
          return fn.apply(target, args);
        };
      }
      if (prop === 'channel') {
        return (...args: unknown[]) => {
          if (isPublicDemoSession()) return blockedChannel();
          const fn = Reflect.get(target, prop, receiver) as (...inner: unknown[]) => unknown;
          return fn.apply(target, args);
        };
      }
      if (prop === 'storage') {
        if (isPublicDemoSession()) return { from: () => blockedQuery() };
        return Reflect.get(target, prop, receiver);
      }
      if (prop === 'functions') {
        const functions = Reflect.get(target, prop, receiver);
        if (functions == null || typeof functions !== 'object') return functions;
        return new Proxy(functions as object, {
          get(fnTarget, fnProp, fnReceiver) {
            if (fnProp === 'invoke') {
              return (...args: unknown[]) => {
                if (isPublicDemoSession()) {
                  return Promise.resolve({ data: null, error: { message: DEMO_REMOTE_MESSAGE } });
                }
                const invoke = Reflect.get(fnTarget, fnProp, fnReceiver) as (
                  ...inner: unknown[]
                ) => unknown;
                return invoke.apply(fnTarget, args);
              };
            }
            const value = Reflect.get(fnTarget, fnProp, fnReceiver);
            return typeof value === 'function' ? value.bind(fnTarget) : value;
          },
        });
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as T;
}
