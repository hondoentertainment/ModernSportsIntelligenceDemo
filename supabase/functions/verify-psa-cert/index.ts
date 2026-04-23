/**
 * verify-psa-cert — Supabase Edge Function
 *
 * Looks up a PSA cert number using the PSA Public API.
 * Requires PSA_API_KEY to be set as a Supabase Function secret.
 *
 * Request:  POST { certNumber: string }
 * Response: PSA cert data or { error, not_found: true }
 *
 * Deploy:
 *   supabase functions deploy verify-psa-cert
 *   supabase secrets set PSA_API_KEY=<your_key>
 */

import { corsHeaders } from '../_shared/cors.ts';

const PSA_API_BASE = 'https://api.psacard.com/publicapi';

interface PsaCertResponse {
  PSACert: {
    CertNumber: string;
    SpecNumber: string;
    CardGrade: string;
    GradeDescription: string;
    IsDualCert: boolean;
    ReverseBarCode: boolean;
    Year: string;
    Brand: string;
    Series: string;
    CardNumber: string;
    Subject: string;
    Variety: string;
    TotalPopulation: number;
    TotalPopulationHigher: number;
    // Extended fields present in some certs
    LabelType?: string;
  };
}

function normalizeCertNumber(raw: string): string {
  return raw.replace(/\D/g, '').padStart(8, '0');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('PSA_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'PSA_API_KEY not configured', not_found: true }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  let body: { certNumber?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rawCert = String(body.certNumber ?? '').trim();
  if (!rawCert) {
    return new Response(JSON.stringify({ error: 'certNumber is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const certNumber = normalizeCertNumber(rawCert);

  const psaUrl = `${PSA_API_BASE}/cert/GetByCertNumber/${certNumber}`;

  let psaRes: Response;
  try {
    psaRes = await fetch(psaUrl, {
      method: 'GET',
      headers: {
        Authorization: `bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    console.error('[verify-psa-cert] fetch error:', err);
    return new Response(JSON.stringify({ error: 'PSA API unreachable' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (psaRes.status === 404) {
    return new Response(JSON.stringify({ not_found: true, certNumber }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!psaRes.ok) {
    const text = await psaRes.text().catch(() => '');
    console.error('[verify-psa-cert] PSA error', psaRes.status, text);
    return new Response(
      JSON.stringify({ error: `PSA API error ${psaRes.status}` }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  let data: PsaCertResponse;
  try {
    data = await psaRes.json();
  } catch {
    return new Response(JSON.stringify({ error: 'PSA API returned invalid JSON' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const cert = data.PSACert;

  // Normalise the PSA response into our VerificationResult shape
  const result = {
    certNumber,
    company: 'PSA',
    cardName: [cert.Year, cert.Brand, cert.Series, cert.Subject, cert.CardNumber]
      .filter(Boolean)
      .join(' ')
      .trim(),
    player: cert.Subject ?? '',
    year: parseInt(cert.Year, 10) || 0,
    set: [cert.Brand, cert.Series].filter(Boolean).join(' '),
    grade: `PSA ${cert.CardGrade}`,
    gradeDescription: cert.GradeDescription,
    populationCount: cert.TotalPopulation ?? 0,
    populationHigher: cert.TotalPopulationHigher ?? 0,
    isDualCert: cert.IsDualCert ?? false,
    labelType: cert.LabelType ?? cert.GradeDescription ?? '',
    variety: cert.Variety ?? '',
    verificationStatus: 'authentic' as const,
    verified: true,
    source: 'psa_api',
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
