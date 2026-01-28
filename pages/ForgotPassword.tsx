import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isDemoMode } from '../lib/supabase';
import { Mail, ArrowLeft, Loader2, Check, TrendingUp } from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isDemoMode) {
            // Simulate success in demo mode
            setTimeout(() => {
                setSuccess(true);
                setLoading(false);
            }, 1000);
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/#/reset-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-lime/20 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-brand-lime" />
                    </div>
                    <h2 className="font-bebas text-3xl tracking-wide text-white mb-4">CHECK YOUR EMAIL</h2>
                    <p className="text-slate-400 mb-8">
                        {isDemoMode ? (
                            <>Demo mode: Password reset would be sent to <span className="text-white font-medium">{email}</span></>
                        ) : (
                            <>We've sent a password reset link to <span className="text-white font-medium">{email}</span></>
                        )}
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium hover:bg-slate-700 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-lime to-brand-teal flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-brand-charcoal" />
                    </div>
                    <span className="font-bebas text-3xl tracking-wider text-white">MSI</span>
                </div>

                <div className="text-center mb-8">
                    <h2 className="font-bebas text-3xl tracking-wide text-white mb-2">RESET PASSWORD</h2>
                    <p className="text-slate-400">Enter your email and we'll send you a reset link</p>
                </div>

                {/* Demo Mode Banner */}
                {isDemoMode && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                        <p className="text-amber-400 text-sm text-center">
                            <span className="font-semibold">Demo Mode</span> — Reset will be simulated
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 pl-12 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                placeholder="investor@example.com"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-lime to-brand-teal text-brand-charcoal font-bebas text-lg tracking-wider hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                SENDING...
                            </>
                        ) : (
                            'SEND RESET LINK'
                        )}
                    </button>
                </form>

                <p className="text-center text-slate-400 mt-8">
                    Remember your password?{' '}
                    <Link to="/login" className="text-brand-lime hover:text-brand-lime/80 transition-colors font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
