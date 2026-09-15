/**
 * Server-side VAPID env reader for the Web Push scaffold.
 * Never invents keys. Private key stays process.env-only (never VITE_).
 */

export const WEB_PUSH_VAPID_UNSET_CODE = 'VAPID_UNSET';
export const WEB_PUSH_VAPID_UNSET_ERROR =
  'Server Web Push is not armed. Set WEB_PUSH_VAPID_PUBLIC and WEB_PUSH_VAPID_PRIVATE on the host (never commit keys). Client Push readiness can still persist a local endpoint.';

export interface VapidEnvSnapshot {
  publicKey: string | null;
  privateKeyPresent: boolean;
  configured: boolean;
}

function trimEnv(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readVapidEnv(
  env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {},
): VapidEnvSnapshot {
  const publicKey = trimEnv(env.WEB_PUSH_VAPID_PUBLIC);
  const privateKey = trimEnv(env.WEB_PUSH_VAPID_PRIVATE);
  return {
    publicKey,
    privateKeyPresent: Boolean(privateKey),
    configured: Boolean(publicKey && privateKey),
  };
}

export function assertVapidConfigured(
  env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {},
): { publicKey: string } {
  const snap = readVapidEnv(env);
  if (!snap.configured || !snap.publicKey) {
    const error = new Error(WEB_PUSH_VAPID_UNSET_ERROR);
    error.name = WEB_PUSH_VAPID_UNSET_CODE;
    throw error;
  }
  return { publicKey: snap.publicKey };
}

export function vapidPublicStatusPayload(snap: VapidEnvSnapshot = readVapidEnv()) {
  return {
    configured: snap.configured,
    publicKey: snap.configured ? snap.publicKey : null,
    code: snap.configured ? 'VAPID_READY' : WEB_PUSH_VAPID_UNSET_CODE,
    error: snap.configured ? null : WEB_PUSH_VAPID_UNSET_ERROR,
  };
}
