import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../../lib/htmlEscape';

describe('escapeHtml', () => {
  it('escapes ampersands and angle brackets', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    );
  });

  it('escapes quotes for attribute safety', () => {
    expect(escapeHtml(`a"b'c`)).toBe('a&quot;b&#39;c');
  });

  it('handles nullish', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});
