import { useMemo } from 'react';

/**
 * Platform-aware keyboard shortcut glyph.
 * On macOS we use the canonical ⌘ symbol; everywhere else we render the
 * spelled-out "Ctrl" modifier. SSR-safe — falls back to non-mac when
 * `navigator` is unavailable.
 */
export type ShortcutGlyph = {
  /** Modifier symbol or word, e.g. "⌘" or "Ctrl". */
  modifier: string;
  /** Compose the modifier with a key, e.g. combo('k') -> "⌘K" or "Ctrl K". */
  combo: (key: string) => string;
  /** True when running on macOS (or iPad/iPhone) UA. */
  isMac: boolean;
};

function detectIsMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = (navigator as Navigator & { platform?: string }).platform || '';
  return /Mac|iPhone|iPad|iPod/i.test(ua) || /Mac|iPhone|iPad|iPod/i.test(platform);
}

export function useShortcutGlyph(): ShortcutGlyph {
  return useMemo<ShortcutGlyph>(() => {
    const isMac = detectIsMac();
    if (isMac) {
      return {
        modifier: '⌘',
        combo: (key: string) => `⌘${key.toUpperCase()}`,
        isMac: true,
      };
    }
    return {
      modifier: 'Ctrl',
      combo: (key: string) => `Ctrl ${key.toUpperCase()}`,
      isMac: false,
    };
  }, []);
}
