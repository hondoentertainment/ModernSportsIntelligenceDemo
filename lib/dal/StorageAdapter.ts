/**
 * Data Access Layer — Storage Adapter Interface
 *
 * Abstracts data persistence so services can work with either
 * localStorage (demo/offline) or Supabase (production) transparently.
 */

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

/** Feature flag controlling which adapter is active */
export type AdapterType = 'local' | 'supabase';

let _activeAdapter: StorageAdapter | null = null;
let _activeType: AdapterType = 'local';

export function getAdapter(): StorageAdapter {
  if (!_activeAdapter) {
    throw new Error('StorageAdapter not initialized. Call initAdapter() first.');
  }
  return _activeAdapter;
}

export function getAdapterType(): AdapterType {
  return _activeType;
}

export function setAdapter(adapter: StorageAdapter, type: AdapterType): void {
  _activeAdapter = adapter;
  _activeType = type;
}
