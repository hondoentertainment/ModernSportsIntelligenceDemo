/**
 * Placeholder until you run `npm run types:supabase` with the Supabase CLI.
 * The command overwrites this file with generated `Database` types from your project.
 *
 * @see docs/SUPABASE_TYPES.md
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
