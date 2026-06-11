import { describe, it, expect, beforeEach } from 'vitest';
import { sealedStorage, _resetSealedStorageForTests } from '../../lib/dal/sealedStorage';

describe('sealedStorage', () => {
  beforeEach(() => {
    _resetSealedStorageForTests();
  });

  it('round-trips an object through seal/unseal', async () => {
    const value = { player: 'Mike Trout', certNumber: '12345678', notes: ['rookie', 'gem'] };
    const token = await sealedStorage.seal(value);
    expect(token.startsWith('enc:v1:')).toBe(true);
    const recovered = await sealedStorage.unseal(token);
    expect(recovered).toEqual(value);
  });

  it('produces a different ciphertext each call (fresh IV)', async () => {
    const value = { x: 1 };
    const a = await sealedStorage.seal(value);
    const b = await sealedStorage.seal(value);
    expect(a).not.toBe(b);
  });

  it('isSealed identifies sealed tokens and rejects everything else', () => {
    expect(sealedStorage.isSealed('enc:v1:abc:def')).toBe(true);
    expect(sealedStorage.isSealed('plain text')).toBe(false);
    expect(sealedStorage.isSealed(null)).toBe(false);
    expect(sealedStorage.isSealed(42)).toBe(false);
    expect(sealedStorage.isSealed({})).toBe(false);
  });

  it('returns null on unrecognized input rather than throwing', async () => {
    expect(await sealedStorage.unseal('not a token')).toBeNull();
    expect(await sealedStorage.unseal('enc:v1:bad')).toBeNull();
  });

  it('returns null when the key has rotated under the same token', async () => {
    const token = await sealedStorage.seal({ secret: 'abc' });
    _resetSealedStorageForTests(); // simulates user clearing IDB
    expect(await sealedStorage.unseal(token)).toBeNull();
  });

  it('preserves primitive values', async () => {
    expect(await sealedStorage.unseal(await sealedStorage.seal('hello'))).toBe('hello');
    expect(await sealedStorage.unseal(await sealedStorage.seal(42))).toBe(42);
    expect(await sealedStorage.unseal(await sealedStorage.seal(null))).toBeNull();
    expect(await sealedStorage.unseal(await sealedStorage.seal([1, 2, 3]))).toEqual([1, 2, 3]);
  });
});
