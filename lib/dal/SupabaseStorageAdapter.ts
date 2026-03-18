/**
 * Supabase-backed StorageAdapter
 *
 * Reads/writes user data to Supabase tables while keeping a local
 * cache in localStorage for offline resilience and fast first-paint.
 */

import { logger } from '../logger';
import { supabase, isDemoMode } from '../supabase';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import type { StorageAdapter } from './StorageAdapter';

export class SupabaseStorageAdapter implements StorageAdapter {
  private fallback: LocalStorageAdapter;
  private userId: string | null;

  constructor(userId: string | null) {
    this.fallback = new LocalStorageAdapter('msi_cache_');
    this.userId = userId;
  }

  setUserId(id: string | null): void {
    this.userId = id;
  }

  async get<T>(key: string): Promise<T | null> {
    // Always try cloud first when authenticated
    if (this.userId && !isDemoMode) {
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('value')
          .eq('user_id', this.userId)
          .eq('key', key)
          .maybeSingle();

        if (error) {
          logger.warn(`[DAL:supabase] Read error for "${key}"`, error.message);
        } else if (data) {
          // Update local cache
          await this.fallback.set(key, data.value);
          return data.value as T;
        }
      } catch (err) {
        logger.warn(`[DAL:supabase] Network error reading "${key}", falling back to cache`, err);
      }
    }

    // Fallback to local cache
    return this.fallback.get<T>(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    // Always write to local cache first (optimistic)
    await this.fallback.set(key, value);

    if (this.userId && !isDemoMode) {
      try {
        const { error } = await supabase
          .from('user_data')
          .upsert(
            { user_id: this.userId, key, value, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,key' }
          );

        if (error) {
          logger.warn(`[DAL:supabase] Write error for "${key}"`, error.message);
        }
      } catch (err) {
        logger.warn(`[DAL:supabase] Network error writing "${key}", data saved locally`, err);
      }
    }
  }

  async remove(key: string): Promise<void> {
    await this.fallback.remove(key);

    if (this.userId && !isDemoMode) {
      try {
        const { error } = await supabase
          .from('user_data')
          .delete()
          .eq('user_id', this.userId)
          .eq('key', key);

        if (error) {
          logger.warn(`[DAL:supabase] Delete error for "${key}"`, error.message);
        }
      } catch (err) {
        logger.warn(`[DAL:supabase] Network error deleting "${key}"`, err);
      }
    }
  }

  async keys(): Promise<string[]> {
    if (this.userId && !isDemoMode) {
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('key')
          .eq('user_id', this.userId);

        if (!error && data) {
          return data.map((row) => row.key);
        }
      } catch {
        // fall through to cache
      }
    }

    return this.fallback.keys();
  }
}
