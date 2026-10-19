import { describe, expect, it } from 'vitest';
import { consumeSessionExpiredNotice, rememberSessionExpired } from '../../lib/authSessionNotice';

describe('auth session notice', () => {
  it('remembers an expired session once', () => {
    expect(consumeSessionExpiredNotice()).toBe(false);
    rememberSessionExpired();
    expect(consumeSessionExpiredNotice()).toBe(true);
    expect(consumeSessionExpiredNotice()).toBe(false);
  });
});
