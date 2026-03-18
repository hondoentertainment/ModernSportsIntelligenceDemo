import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;                  // e.g., 'k', '/', 'Escape'
  ctrl?: boolean;
  meta?: boolean;               // Cmd on Mac
  shift?: boolean;
  description: string;
  action: () => void;
  global?: boolean;             // Works even when input is focused
}

/**
 * Registers keyboard shortcuts with modifier key support.
 * Shortcuts are suppressed when typing in input/textarea unless marked global.
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handler = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    for (const shortcut of shortcuts) {
      if (!shortcut.global && isInput) continue;

      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

      if (e.key === shortcut.key && ctrlMatch && shiftMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}

/** Standard shortcuts used across the app */
export const APP_SHORTCUTS = {
  SEARCH: { key: '/', description: 'Focus search' },
  COMMAND_PALETTE: { key: 'k', ctrl: true, description: 'Open command palette' },
  ESCAPE: { key: 'Escape', description: 'Close modal / Clear', global: true },
  NEW_CARD: { key: 'n', description: 'Add new card' },
  HELP: { key: '?', shift: true, description: 'Show keyboard shortcuts' },
} as const;
