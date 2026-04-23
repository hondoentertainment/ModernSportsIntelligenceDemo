// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { sanitizeString, MAX_BODY_BYTES } from '../../api/lib/sanitize';

describe('sanitizeString', () => {
  it('strips control characters', () => {
    expect(sanitizeString('hello\x00world\x1F!')).toBe('helloworld!');
  });

  it('strips DEL character (0x7F)', () => {
    expect(sanitizeString('foo\x7Fbar')).toBe('foobar');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeString('  hello world  ')).toBe('hello world');
  });

  it('truncates at default maxLength of 500', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeString(long)).toHaveLength(500);
  });

  it('returns empty string for non-string input (number)', () => {
    expect(sanitizeString(42)).toBe('');
  });

  it('returns empty string for non-string input (null)', () => {
    expect(sanitizeString(null)).toBe('');
  });

  it('returns empty string for non-string input (undefined)', () => {
    expect(sanitizeString(undefined)).toBe('');
  });

  it('returns empty string for non-string input (object)', () => {
    expect(sanitizeString({ foo: 'bar' })).toBe('');
  });

  it('custom maxLength works', () => {
    expect(sanitizeString('abcdef', 3)).toBe('abc');
  });

  it('custom maxLength of 0 returns empty string', () => {
    expect(sanitizeString('hello', 0)).toBe('');
  });
});

describe('MAX_BODY_BYTES', () => {
  it('equals 64 KB', () => {
    expect(MAX_BODY_BYTES).toBe(64 * 1024);
  });
});
