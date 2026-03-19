import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  publicPortfolioUsernameSchema,
} from '../../lib/apiValidation';

describe('apiValidation', () => {
  describe('validateUsername', () => {
    it('returns valid_user for "valid_user"', () => {
      expect(validateUsername('valid_user')).toBe('valid_user');
    });

    it('throws for username with space', () => {
      expect(() => validateUsername('invalid space')).toThrow();
    });

    it('throws for empty string', () => {
      expect(() => validateUsername('')).toThrow();
    });

    it('returns single character "a"', () => {
      expect(validateUsername('a')).toBe('a');
    });

    it('returns 64-char valid string', () => {
      const valid64 = 'a'.repeat(64);
      expect(validateUsername(valid64)).toBe(valid64);
    });

    it('throws for 65-char string', () => {
      expect(() => validateUsername('a'.repeat(65))).toThrow();
    });

    it('throws for invalid characters', () => {
      expect(() => validateUsername('user@name')).toThrow();
      expect(() => validateUsername('user.name')).toThrow();
    });

    it('accepts hyphen and underscore', () => {
      expect(validateUsername('user_name')).toBe('user_name');
      expect(validateUsername('user-name')).toBe('user-name');
      expect(validateUsername('user_name-99')).toBe('user_name-99');
    });
  });

  describe('publicPortfolioUsernameSchema', () => {
    it('parses valid usernames', () => {
      expect(publicPortfolioUsernameSchema.parse('abc')).toBe('abc');
      expect(publicPortfolioUsernameSchema.parse('U123')).toBe('U123');
    });

    it('rejects empty string', () => {
      expect(() => publicPortfolioUsernameSchema.parse('')).toThrow();
    });

    it('rejects strings over 64 chars', () => {
      expect(() => publicPortfolioUsernameSchema.parse('x'.repeat(65))).toThrow();
    });
  });
});
