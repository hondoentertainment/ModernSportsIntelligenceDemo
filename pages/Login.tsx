import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2, TrendingUp, Zap, Shield } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signIn, signInWithGoogle, demoLogin, isDemoMode } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
        }
    };

    const handleDemoLogin = () => {
        demoLogin();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-brand-charcoal flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-charcoal via-slate-900 to-brand-charcoal" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-lime/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand-teal/20 via-transparent to-transparent" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                <div className="relative z-10 flex flex-col justify-center p-12">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-lime to-brand-teal flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-brand-charcoal" />
                            </div>
                            <span className="font-bebas text-4xl tracking-wider text-white">MSI</span>
                        </div>
                        <h1 className="font-bebas text-5xl tracking-wide text-white mb-4">
                            MODERN SPORTS<br />
                            <span className="text-brand-lime">INTELLIGENCE</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md">
                            AI-powered portfolio analytics for the modern sports card investor.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-lime/10 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-5 h-5 text-brand-lime" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Real-Time Valuations</h3>
                                <p className="text-slate-500 text-sm">Track your portfolio with live market data</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-brand-teal" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Cloud Sync</h3>
                                <p className="text-slate-500 text-sm">Access your collection from any device</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-lime to-brand-teal flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-brand-charcoal" />
                        </div>
                        <span className="font-bebas text-3xl tracking-wider text-white">MSI</span>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="font-bebas text-3xl tracking-wide text-white mb-2">WELCOME BACK</h2>
                        <p className="text-slate-400">Sign in to access your portfolio</p>
                    </div>

                    {/* Demo Mode Banner */}
                    {isDemoMode && (
                        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                            <p className="text-amber-400 text-sm text-center">
                                <span className="font-semibold">Demo Mode</span> — Supabase not configured.
                                Use demo login to explore.
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
                            <label className="block text-slate-400 text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                placeholder="investor@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-brand-lime focus:ring-brand-lime focus:ring-offset-0" />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-brand-lime hover:text-brand-lime/80 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isDemoMode}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-lime to-brand-teal text-brand-charcoal font-bebas text-lg tracking-wider hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    SIGNING IN...
                                </>
                            ) : (
                                'SIGN IN'
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-brand-charcoal text-slate-500">or continue with</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {isDemoMode ? (
                            <button
                                onClick={handleDemoLogin}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bebas text-lg tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-3"
                            >
                                <Zap className="w-5 h-5" />
                                ENTER DEMO MODE
                            </button>
                        ) : (
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>
                        )}
                    </div>

                    <p className="text-center text-slate-400 mt-8">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-brand-lime hover:text-brand-lime/80 transition-colors font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
