import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShortcutGlyph } from '../../lib/utils/useShortcutGlyph';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useShortcutGlyph', () => {
  it('returns ⌘ glyph on macOS user agents', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36',
      platform: 'MacIntel',
    });

    const { result } = renderHook(() => useShortcutGlyph());

    expect(result.current.modifier).toBe('⌘');
    expect(result.current.isMac).toBe(true);
    expect(result.current.combo('k')).toBe('⌘K');
    expect(result.current.combo('K')).toBe('⌘K');
  });

  it('returns "Ctrl" glyph on non-mac user agents', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      platform: 'Win32',
    });

    const { result } = renderHook(() => useShortcutGlyph());

    expect(result.current.modifier).toBe('Ctrl');
    expect(result.current.isMac).toBe(false);
    expect(result.current.combo('k')).toBe('Ctrl K');
  });

  it('returns "Ctrl" glyph on Linux', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      platform: 'Linux x86_64',
    });

    const { result } = renderHook(() => useShortcutGlyph());

    expect(result.current.modifier).toBe('Ctrl');
    expect(result.current.combo('p')).toBe('Ctrl P');
  });
});
