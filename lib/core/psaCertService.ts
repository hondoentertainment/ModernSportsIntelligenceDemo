/**
 * PSA cert verification client service.
 *
 * Calls the `verify-psa-cert` Supabase Edge Function which proxies PSA's
 * public cert API server-side (no API key on the client).
 *
 * Falls back gracefully when:
 *   - Supabase is in demo mode
 *   - The Edge Function is not deployed (returns null)
 *   - PSA_API_KEY secret is not configured on the function (returns null)
 */

import { z } from 'zod';
import { supabase, isDemoMode } from '../supabase';
import { logger } from '../logger';
import { safeParseJson } from '../utils/safeParseJson';
import type { GradingCompany, VerificationResult, VerificationStatus } from './slabVerificationService';

export interface PsaLookupResult {
  certNumber: string;
  company: GradingCompany;
  cardName: string;
  player: string;
  year: number;
  set: string;
  grade: string;
  gradeDescription: string;
  populationCount: number;
  populationHigher: number;
  isDualCert: boolean;
  labelType: string;
  variety: string;
  verificationStatus: VerificationStatus;
  verified: boolean;
  source: 'psa_api';
}

export interface PsaLookupResponse {
  result: PsaLookupResult | null;
  /** True when the cert number is valid format but not found in PSA's database. */
  notFound: boolean;
  /** Human-readable error message when the lookup failed entirely. */
  error: string | null;
}

/** Zod schema for the raw PSA Edge Function payload. */
const PsaEdgeFunctionSchema = z.object({
  certNumber: z.string(),
  cardName: z.string(),
  player: z.string(),
  year: z.number(),
  set: z.string(),
  grade: z.string(),
  gradeDescription: z.string().optional().default(''),
  populationCount: z.number().optional().default(0),
  populationHigher: z.number().optional().default(0),
  isDualCert: z.boolean().optional().default(false),
  labelType: z.string().optional().default(''),
  variety: z.string().optional().default(''),
  verified: z.boolean(),
  // Passthrough unknown fields so we can still read company/verificationStatus/source
}).passthrough();

/**
 * Look up a PSA cert number via the Edge Function.
 * Returns null fields on demo mode, missing configuration, or network failure.
 */
export async function lookupPsaCert(certNumber: string): Promise<PsaLookupResponse> {
  if (isDemoMode) {
    logger.info('[psaCertService] Demo mode — skipping real PSA lookup');
    return { result: null, notFound: false, error: null };
  }

  try {
    const { data, error } = await supabase.functions.invoke<unknown>(
      'verify-psa-cert',
      { body: { certNumber } },
    );

    if (error) {
      logger.warn('[psaCertService] Edge Function error:', error.message);
      return { result: null, notFound: false, error: error.message };
    }

    if (!data) {
      return { result: null, notFound: false, error: 'Empty response from Edge Function' };
    }

    // Handle sentinel flags before full schema validation
    const raw = data as Record<string, unknown>;
    if (raw['not_found'] === true) {
      return { result: null, notFound: true, error: null };
    }
    if (typeof raw['error'] === 'string') {
      return { result: null, notFound: false, error: raw['error'] };
    }

    // Validate the successful result shape
    const validated = safeParseJson(
      JSON.stringify(data),
      PsaEdgeFunctionSchema,
      'psa_cert',
    );

    if (!validated) {
      logger.warn('[psaCertService] Edge Function returned unexpected shape', data);
      return { result: null, notFound: false, error: 'Unexpected response shape from PSA API' };
    }

    return { result: validated as PsaLookupResult, notFound: false, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn('[psaCertService] Unexpected error:', msg);
    return { result: null, notFound: false, error: msg };
  }
}

/**
 * Convert a PsaLookupResult into the VerificationResult shape used by
 * slabVerificationService, so the UI can render it without modification.
 */
export function psaLookupToVerificationResult(
  lookup: PsaLookupResult,
): VerificationResult {
  return {
    id: `psa-live-${lookup.certNumber}`,
    certNumber: lookup.certNumber,
    company: lookup.company,
    cardName: lookup.cardName,
    player: lookup.player,
    year: lookup.year,
    set: lookup.set,
    grade: lookup.grade,
    verified: lookup.verified,
    verificationStatus: lookup.verificationStatus,
    flags: [],
    populationCount: lookup.populationCount,
    labelType: lookup.labelType || lookup.gradeDescription,
    scanDate: new Date().toISOString().split('T')[0] ?? '',
  };
}
