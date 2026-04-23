// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CreditCard, Check, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserSubscription,
  getSubscriptionPricing,
  createCheckoutSession,
  redirectToCheckout,
  createBillingPortalSession,
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
} from '../lib/utils/billingService';

const Billing: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<{
    subscription_tier: string;
    subscription_status: string;
    ai_valuations_used: number;
    card_tracking_limit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [subscriptionRefreshToken, setSubscriptionRefreshToken] = useState(0);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success === 'true') {
      setMessage({
        type: 'success',
        text: 'Payment received. Your plan will update momentarily once the server confirms the subscription.',
      });
      setSubscriptionRefreshToken((t) => t + 1);
      setSearchParams({}, { replace: true });
    }
    if (canceled === 'true') {
      setMessage({ type: 'info', text: 'Checkout was canceled.' });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getUserSubscription(user.id)
      .then((data) => setSubscription(data as typeof subscription))
      .catch(() =>
        setMessage((prev) =>
          prev?.type === 'success' || prev?.type === 'info'
            ? prev
            : { type: 'error', text: 'Failed to load subscription.' },
        ),
      )
      .finally(() => setLoading(false));
  }, [user?.id, subscriptionRefreshToken]);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!user?.id || isDemoMode) return;
    const tierKey = tier as 'basic' | 'pro' | 'alpha';
    if ((tierKey as string) === 'free') return;
    setActionLoading(tier);
    try {
      const base = window.location.href.split('#')[0];
      const sessionId = await createCheckoutSession(
        user.id,
        tierKey,
        `${base}#/billing?success=true`,
        `${base}#/billing?canceled=true`
      );
      await redirectToCheckout(sessionId);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Checkout failed.' });
      setActionLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.id || isDemoMode) return;
    setActionLoading('manage');
    try {
      const base = window.location.href.split('#')[0];
      const url = await createBillingPortalSession(user.id, `${base}#/billing`);
      if (url) {
        window.location.href = url;
      } else {
        setMessage({ type: 'error', text: 'Billing portal did not return a URL. Try again or contact support.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to open billing portal.' });
    }
    setActionLoading(null);
  };

  const pricing = getSubscriptionPricing();
  const currentTier = (subscription?.subscription_tier || 'free') as SubscriptionTier;
  const tierConfig = SUBSCRIPTION_TIERS[currentTier];
  const aiLimit = tierConfig?.limits.aiValuations ?? 10;
  const aiUsed = subscription?.ai_valuations_used ?? 0;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center">
        <h1 className="text-3xl font-black text-white">Billing requires an authenticated account</h1>
        <p className="text-sm text-slate-400">
          Sign in with a live account to manage subscriptions, create checkout sessions, and access the customer portal.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-lime px-5 py-3 font-bold text-brand-charcoal transition-all hover:bg-brand-green"
        >
          Go to Login <ChevronRight size={18} />
        </Link>
      </div>
    );
  }

  if (loading && !message) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-brand-lime" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Subscription & Billing</h1>
        <p className="text-brand-muted font-bold uppercase tracking-[0.2em] text-sm">
          Manage your plan and usage
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border font-bold ${
            message.type === 'success'
              ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime'
              : message.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Current plan & usage */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <CreditCard className="text-brand-teal" size={20} />
            Current Plan
          </h2>
          <span
            className={`px-4 py-2 rounded-xl font-bold text-sm uppercase ${
              currentTier === 'alpha'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : currentTier === 'pro'
                ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30'
                : currentTier === 'basic'
                ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {tierConfig?.name ?? 'Free'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">
              AI Valuations This Month
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">{aiUsed}</span>
              <span className="text-brand-muted text-sm">
                / {aiLimit === -1 ? '∞' : aiLimit}
              </span>
            </div>
            {aiLimit !== -1 && (
              <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-lime rounded-full transition-all"
                  style={{ width: `${Math.min(100, (aiUsed / aiLimit) * 100)}%` }}
                />
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">
              Card Tracking
            </p>
            <p className="text-lg font-bold text-white">
              {tierConfig?.limits.cards === -1 ? 'Unlimited' : `Up to ${tierConfig?.limits.cards}`}
            </p>
          </div>
        </div>

        {!isDemoMode && subscription?.subscription_status === 'active' && currentTier !== 'free' && (
          <button
            onClick={handleManageSubscription}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
          >
            {actionLoading === 'manage' ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Manage Subscription <ChevronRight size={18} />
              </>
            )}
          </button>
        )}

        {isDemoMode && (
          <p className="text-sm text-amber-400">Subscription management is disabled in Demo Mode.</p>
        )}
      </section>

      {/* Plans */}
      <section>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Zap className="text-brand-teal" size={20} />
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricing.map((plan) => {
            const isCurrent = plan.id === currentTier;
            const isUpgrade =
              !plan.isFree &&
              (currentTier === 'free' || ['basic', 'pro', 'alpha'].indexOf(currentTier) < ['basic', 'pro', 'alpha'].indexOf(plan.id));
            return (
              <div
                key={plan.id}
                className={`rounded-3xl border p-6 flex flex-col ${
                  isCurrent
                    ? 'bg-brand-lime/10 border-brand-lime/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="mb-4">
                  <h3 className="font-black text-lg">{plan.name}</h3>
                  <p className="text-2xl font-black text-white mt-1">
                    {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
                  </p>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check size={16} className="text-brand-lime shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <span className="block py-3 text-center font-bold text-brand-lime text-sm uppercase">
                    Current Plan
                  </span>
                ) : isUpgrade && !isDemoMode ? (
                  <button
                    onClick={() => handleUpgrade(plan.id as SubscriptionTier)}
                    disabled={!!actionLoading}
                    className="w-full py-3 rounded-xl font-bold bg-brand-lime text-brand-charcoal hover:bg-brand-green transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === plan.id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      'Upgrade'
                    )}
                  </button>
                ) : (
                  <Link
                    to="/settings"
                    className="block py-3 text-center font-bold text-brand-muted hover:text-brand-lime text-sm transition-colors"
                  >
                    Manage in Settings
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Billing;
