/**
 * sealedStorage — opt-in encrypt-at-rest helper for DAL values that CodeQL's
 * `js/clear-text-storage-of-sensitive-information` heuristic flags.
 *
 * The DAL's generic K/V store (`lib/dal/syncStore`) is synchronous and writes
 * plaintext JSON to `localStorage`. Most values flowing through it are
 * non-sensitive (UI prefs, demo data, masked API keys, public PSA cert IDs),
 * but a few user-provided fields (e.g. the `certNumber` typed into the
 * provenance Register tab) are flagged by CodeQL because the heuristic
 * matches `cert*`. Those values aren't true credentials — PSA cert numbers
 * are printed on the slab — but a defense-in-depth seal still helps if the
 * device is shared or a backup is copied.
 *
 * ## Threat model
 *
 * In a browser there is no hardware-backed key store. We CANNOT protect
 * against an attacker with JS code execution in the page (they can call
 * `unseal()` themselves). We CAN raise the bar against:
 * - Someone reading a raw `localStorage` dump from a backup or sync file.
 * - Cross-origin XSS that scrapes `localStorage` keys without IndexedDB
 *   access.
 * - A shared device's other accounts opening DevTools and reading values.
 *
 * The key is generated once with `extractable: false` and stored in
 * IndexedDB (structured-cloneable). Subsequent sessions reuse it. Cleared
 * IndexedDB → ciphertext becomes unrecoverable and any sealed values are
 * silently dropped on next read (treated as "no data").
 *
 * ## API
 *
 * - `sealedStorage.seal(value)` → `enc:v1:<base64-iv>:<base64-ct>`
 * - `sealedStorage.unseal(token)` → original value, or `null` if the key
 *   has rotated / the token is unrecognized.
 * - `sealedStorage.isSealed(token)` → cheap synchronous check.
 *
 * Backed by `globalThis.crypto.subtle` (Node 20+ and every supported
 * browser). In environments without `indexedDB` (Node tests, SSR), a
 * module-scope in-memory key is used — tests get encrypt/decrypt
 * round-trip without IDB polyfills, but sealed values do not persist
 * across module reloads (which is fine for unit tests).
 */

const SEAL_PREFIX = 'enc:v1:';
const KEY_DB_NAME = 'msi_sealed_keys_v1';
const KEY_STORE = 'keys';
const KEY_ID = 'default-aesgcm-256';

interface KeyHolder {
  getKey(): Promise<CryptoKey>;
}

// ─── Browser IDB key holder ───────────────────────────────────────────

class IDBKeyHolder implements KeyHolder {
  private cached: CryptoKey | null = null;
  private inflight: Promise<CryptoKey> | null = null;

  async getKey(): Promise<CryptoKey> {
    if (this.cached) return this.cached;
    if (this.inflight) return this.inflight;
    this.inflight = (async () => {
      const existing = await idbGetKey();
      if (existing) {
        this.cached = existing;
        return existing;
      }
      const fresh = await globalThis.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false, // non-extractable — cannot be read back out as raw bytes
        ['encrypt', 'decrypt'],
      );
      await idbPutKey(fresh);
      this.cached = fresh;
      return fresh;
    })();
    try {
      return await this.inflight;
    } finally {
      this.inflight = null;
    }
  }
}

function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(KEY_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KEY_STORE)) db.createObjectStore(KEY_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetKey(): Promise<CryptoKey | null> {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEY_STORE, 'readonly');
    const req = tx.objectStore(KEY_STORE).get(KEY_ID);
    req.onsuccess = () => resolve((req.result as CryptoKey | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPutKey(key: CryptoKey): Promise<void> {
  const db = await idbOpen();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KEY_STORE, 'readwrite');
    tx.objectStore(KEY_STORE).put(key, KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Memory key holder (tests / SSR) ──────────────────────────────────

class MemoryKeyHolder implements KeyHolder {
  private cached: CryptoKey | null = null;

  async getKey(): Promise<CryptoKey> {
    if (this.cached) return this.cached;
    // Use extractable: true here only because non-extractable structured
    // cloning into IDB isn't available; this code path never persists.
    this.cached = await globalThis.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
    return this.cached;
  }
}

// ─── Module singleton ────────────────────────────────────────────────

function pickKeyHolder(): KeyHolder {
  const hasIDB = typeof globalThis !== 'undefined' && typeof globalThis.indexedDB !== 'undefined';
  return hasIDB ? new IDBKeyHolder() : new MemoryKeyHolder();
}

let _holder: KeyHolder = pickKeyHolder();

/** Reset the module's key holder. **Test-only.** */
export function _resetSealedStorageForTests(): void {
  _holder = new MemoryKeyHolder();
}

// ─── Base64 helpers (browser-safe) ───────────────────────────────────

function b64Encode(bytes: Uint8Array): string {
  let s = '';
  for (const byte of bytes) s += String.fromCharCode(byte);
  return btoa(s);
}

function b64Decode(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ─── Public API ──────────────────────────────────────────────────────

export const sealedStorage = {
  /** True iff `token` is a string this module produced. */
  isSealed(token: unknown): token is string {
    return typeof token === 'string' && token.startsWith(SEAL_PREFIX);
  },

  /**
   * Encrypt `value` (any JSON-serializable structure) with the per-install
   * AES-GCM key. Returns a token of the form `enc:v1:<b64-iv>:<b64-ct>`.
   */
  async seal(value: unknown): Promise<string> {
    const key = await _holder.getKey();
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(value));
    const ctBuf = await globalThis.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext,
    );
    return `${SEAL_PREFIX}${b64Encode(iv)}:${b64Encode(new Uint8Array(ctBuf))}`;
  },

  /**
   * Decrypt a token produced by `seal()`. Returns `null` for unrecognized
   * input or when the key has rotated. Throws on shape errors so callers
   * can distinguish "no data" from "corrupt token".
   */
  async unseal<T = unknown>(token: string): Promise<T | null> {
    if (!this.isSealed(token)) return null;
    const [ivB64, ctB64] = token.slice(SEAL_PREFIX.length).split(':', 2);
    if (!ivB64 || !ctB64) return null;
    const iv = b64Decode(ivB64);
    const ct = b64Decode(ctB64);
    const key = await _holder.getKey();
    try {
      const pt = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
      return JSON.parse(new TextDecoder().decode(pt)) as T;
    } catch {
      // OperationError = key rotated or tampered; treat as no-data so caller
      // falls back to the empty state instead of crashing.
      return null;
    }
  },
};
