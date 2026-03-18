/**
 * usePersistedState
 *
 * A drop-in replacement for React useState that transparently persists
 * values to localStorage with debounced writes. Handles quota errors,
 * SSR safety, and cross-tab synchronization via the storage event.
 *
 * Usage:
 *   const [count, setCount] = usePersistedState('my-count', 0);
 *   setCount(prev => prev + 1);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../lib/logger';

const LS_HOOK_PREFIX = 'msi_ps_';
const DEFAULT_DEBOUNCE_MS = 300;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readFromStorage<T>(fullKey: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(fullKey);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function writeToStorage(fullKey: string, value: unknown): boolean {
  try {
    localStorage.setItem(fullKey, JSON.stringify(value));
    return true;
  } catch (err: unknown) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      logger.warn(`[usePersistedState] Quota exceeded writing key "${fullKey}". Value not persisted.`);
    } else {
      logger.error(`[usePersistedState] Error writing key "${fullKey}":`, err);
    }
    return false;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UsePersistedStateOptions {
  /** Debounce interval in ms before flushing to localStorage. Default 300. */
  debounceMs?: number;
  /** Custom key prefix. Default 'msi_ps_'. */
  prefix?: string;
}

/**
 * Like useState, but persists to localStorage with debounced writes.
 *
 * @param key   Unique persistence key (prefixed automatically)
 * @param defaultValue  Value used when nothing is stored
 * @param options  Optional config for debounce interval and prefix
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options?: UsePersistedStateOptions,
): [T, (value: T | ((prev: T) => T)) => void] {
  const prefix = options?.prefix ?? LS_HOOK_PREFIX;
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const fullKey = `${prefix}${key}`;

  // Lazy initializer reads from storage once
  const [value, setValueInternal] = useState<T>(() => readFromStorage(fullKey, defaultValue));

  // Keep a ref to the latest value for the debounced writer
  const valueRef = useRef(value);
  valueRef.current = value;

  // Debounced write timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Schedule a debounced write whenever value changes
  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      writeToStorage(fullKey, valueRef.current);
      timerRef.current = null;
    }, debounceMs);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, fullKey, debounceMs]);

  // Flush on unmount so we never lose pending writes
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        writeToStorage(fullKey, valueRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey]);

  // Cross-tab synchronization via the storage event
  useEffect(() => {
    function handleStorageEvent(e: StorageEvent) {
      if (e.key === fullKey && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue) as T;
          setValueInternal(parsed);
        } catch {
          // ignore malformed cross-tab data
        }
      }
    }
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [fullKey]);

  // Setter that matches the React setState signature
  const setValue = useCallback(
    (action: T | ((prev: T) => T)) => {
      setValueInternal((prev) => {
        const next = typeof action === 'function' ? (action as (prev: T) => T)(prev) : action;
        return next;
      });
    },
    [],
  );

  return [value, setValue];
}

export default usePersistedState;
