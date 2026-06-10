/**
 * PSA cert verification proxy — server-side only.
 * Uses PSA_API_KEY (never VITE_*). Requires Supabase JWT or MSI_SERVER_API_SECRET.
 */

import { z } from 'zod';
import { apiLogger } from '../../lib/logger';
import { respondInternalError, setApiCorsHeaders } from '../../lib/httpProduction';
import { isServerApiAuthConfigured, verifyServerApiAuth } from '../../lib/verifyServerApiAuth';

const ALLOWED_METHODS = 'POST, OPTIONS';

const bodySchema = z.object({
  certNumber: z.string().min(1).max(32),
}).strict();

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: object) => unknown };
};

const PSA_API_BASE = 'https://api.psacard.com/publicapi';

function normalizeCertNumber(raw: string): string {
  return raw.replace(/\D/g, '').padStart(8, '0');
}

async function lookupPsaCert(certNumber: string): Promise<object> {
  const apiKey = process.env.PSA_API_KEY?.trim();
  if (!apiKey) {
    return { error: 'PSA_API_KEY not configured', code: 'psa_not_configured' };
  }

  const normalized = normalizeCertNumber(certNumber);
  const url = `${PSA_API_BASE}/cert/GetByCertNumber/${normalized}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 404) {
    return { not_found: true, certNumber: normalized };
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    apiLogger.warn('PSA API error', { status: res.status, detail: detail.slice(0, 200) });
    throw new Error(`PSA API error ${res.status}`);
  }

  const data = (await res.json()) as {
    PSACert?: {
      CertNumber: string;
      CardGrade: string;
      GradeDescription: string;
      Year: string;
      Brand: string;
      Series: string;
      CardNumber: string;
      Subject: string;
      Variety: string;
      TotalPopulation: number;
      TotalPopulationHigher: number;
      IsDualCert?: boolean;
      LabelType?: string;
    };
  };

  const cert = data.PSACert;
  if (!cert) {
    throw new Error('PSA API returned empty cert payload');
  }

  return {
    certNumber: normalized,
    verified: true,
    year: cert.Year,
    brand: cert.Brand,
    set: [cert.Brand, cert.Series].filter(Boolean).join(' '),
    cardNumber: cert.CardNumber,
    player: cert.Subject,
    grade: cert.CardGrade,
    gradeDescription: cert.GradeDescription,
    variety: cert.Variety ?? '',
    labelType: cert.LabelType ?? cert.GradeDescription ?? '',
    populationCount: cert.TotalPopulation ?? 0,
    populationHigher: cert.TotalPopulationHigher ?? 0,
    isDualCert: cert.IsDualCert ?? false,
    lookupDate: new Date().toISOString(),
    source: 'psa_api',
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<unknown> {
  setApiCorsHeaders(res, { allowMethods: ALLOWED_METHODS });

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isServerApiAuthConfigured()) {
    return res.status(503).json({ error: 'API auth not configured', code: 'api_auth_misconfigured' });
  }

  const authorized = await verifyServerApiAuth(req);
  if (!authorized) {
    return res.status(401).json({ error: 'Unauthorized', code: 'api_auth_required' });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  try {
    const result = await lookupPsaCert(parsed.data.certNumber);
    if ('code' in result && result.code === 'psa_not_configured') {
      return res.status(503).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return respondInternalError(res, err, 'PSA cert lookup failed', 'psa_lookup_failed');
  }
}
