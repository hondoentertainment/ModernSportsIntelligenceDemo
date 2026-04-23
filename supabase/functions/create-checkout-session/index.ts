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

  const priceId = typeof body.priceId === 'string' ? body.priceId.trim() : '';
  const successUrl = typeof body.successUrl === 'string' ? body.successUrl.trim() : '';
  const cancelUrl = typeof body.cancelUrl === 'string' ? body.cancelUrl.trim() : '';
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';

  if (!priceId || !successUrl || !cancelUrl) {
    return new Response(JSON.stringify({ error: 'priceId, successUrl, and cancelUrl are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!stripe) {
    return new Response(JSON.stringify({ error: 'Billing not configured', code: 'stripe_missing' }), {
      status: 503,
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

  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();

  const customerId =
    profile && typeof profile.stripe_customer_id === 'string' && profile.stripe_customer_id.length > 0
      ? profile.stripe_customer_id
      : undefined;

  try {
    const sessionParams: Record<string, unknown> = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id, user_id: user.id },
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (user.email) {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams as never, {
      idempotencyKey: idempotencyKey || undefined,
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[create-checkout-session]', e);
    return new Response(JSON.stringify({ error: 'Checkout failed', code: 'stripe_error' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
