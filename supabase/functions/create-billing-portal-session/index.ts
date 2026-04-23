// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@17.4.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { assertBodyUserMatchesJwt, getUserFromRequest } from '../_shared/auth.ts';
import { corsHeaders } from '../_shared/cors.ts';

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })
  : null;

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

  const auth = await getUserFromRequest(req);
  if ('error' in auth) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const { user } = auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const match = assertBodyUserMatchesJwt(body.userId, user.id);
  if ('error' in match) {
    return new Response(JSON.stringify({ error: match.error, code: 'user_mismatch' }), {
      status: match.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!stripe) {
    return new Response(JSON.stringify({ error: 'Billing not configured', code: 'stripe_missing' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const returnUrl = typeof body.returnUrl === 'string' ? body.returnUrl.trim() : '';
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';

  if (!returnUrl) {
    return new Response(JSON.stringify({ error: 'returnUrl is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anon) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[create-billing-portal-session] profile', profileError);
    return new Response(JSON.stringify({ error: 'Failed to load billing profile' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const customerId =
    profile && typeof profile.stripe_customer_id === 'string' && profile.stripe_customer_id.length > 0
      ? profile.stripe_customer_id
      : null;

  if (!customerId) {
    return new Response(
      JSON.stringify({ error: 'No Stripe customer on file. Complete checkout first.', code: 'no_customer' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const portal = await stripe.billingPortal.sessions.create(
      {
        customer: customerId,
        return_url: returnUrl,
      },
      { idempotencyKey: idempotencyKey || undefined },
    );

    return new Response(JSON.stringify({ url: portal.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[create-billing-portal-session]', e);
    return new Response(JSON.stringify({ error: 'Portal session failed', code: 'stripe_error' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
