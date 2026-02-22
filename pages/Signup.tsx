import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFriendlyAuthMessage } from '../lib/authErrors';
import { Eye, EyeOff, Loader2, TrendingUp, Check, X, Shield } from 'lucide-react';

const Signup: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { signUp, signInWithGoogle, demoLogin, isDemoMode } = useAuth();
    const navigate = useNavigate();

    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };
    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordStrength < 3) {
            setError('Please create a stronger password');
            return;
        }

        if (!acceptTerms) {
            setError('Please accept the terms of service');
            return;
        }

        setLoading(true);

        const { error } = await signUp(email, password, username);

        if (error) {
            setError(getFriendlyAuthMessage(error));
            setLoading(false);
        } else {
            setSuccess(true);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        const { error } = await signInWithGoogle();
        if (error) {
            setError(getFriendlyAuthMessage(error));
        }
    };

    const handleDemoLogin = () => {
        demoLogin();
        navigate('/');
    };

    if (success) {
        return (
            <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-brand-lime/20 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-brand-lime" />
                    </div>
                    <h2 className="font-bebas text-3xl tracking-wide text-white mb-4">CHECK YOUR EMAIL</h2>
                    <p className="text-slate-400 mb-8">
                        We've sent a confirmation link to <span className="text-white font-medium">{email}</span>.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block py-3 px-8 rounded-xl bg-gradient-to-r from-brand-lime to-brand-teal text-brand-charcoal font-bebas text-lg tracking-wider hover:opacity-90 transition-all font-black"
                    >
                        BACK TO LOGIN
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-charcoal flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/3 relative overflow-hidden bg-brand-slate/20">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-charcoal via-slate-900 to-brand-charcoal" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-lime/10 via-transparent to-transparent" />

                <div className="relative z-10 flex flex-col justify-center p-12">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-lime to-brand-teal flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-brand-charcoal" />
                            </div>
                            <span className="font-bebas text-4xl tracking-wider text-white">MSI</span>
                        </div>
                        <h1 className="font-bebas text-5xl tracking-wide text-white mb-4">
                            JOIN THE <span className="text-brand-lime">ALPHA</span>
                        </h1>
                        <p className="text-brand-muted text-sm max-w-md leading-relaxed">
                            Deploy your portfolio to the most advanced sports intelligence hub in the market.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-brand-lime">
                            <Check className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Real-time NAV Tracking</span>
                        </div>
                        <div className="flex items-center gap-3 text-brand-teal">
                            <Check className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">AI Market Insights</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <Check className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Multi-League Intelligence</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-xl">
                    <div className="mb-6">
                        <h2 className="font-bebas text-3xl tracking-wide text-white">CREATE ACCOUNT</h2>
                        <div className="h-1 w-12 bg-brand-lime mt-2"></div>
                    </div>

                    {isDemoMode && (
                        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                            <p className="text-amber-400 text-xs leading-relaxed">
                                <span className="font-bold uppercase tracking-widest text-[10px]">Demo Mode Active</span><br />
                                No database connection required. Initialize locally.
                            </p>
                            <button
                                onClick={handleDemoLogin}
                                className="px-4 py-2 rounded-lg bg-amber-500 text-white font-bebas tracking-wider hover:opacity-90 transition-all text-xs"
                            >
                                QUICK ENTER
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="text-red-400">{error}</p>
                                    {(error.includes('already exists') || error.includes('registered')) && (
                                        <Link to="/login" className="text-brand-lime hover:underline mt-1 block text-xs font-bold uppercase tracking-wider">
                                            Sign In Instead?
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm"
                                placeholder="cardcollector99"
                                required
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm"
                                placeholder="investor@example.com"
                                required
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all pr-12 text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5">Confirm</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all text-sm ${confirmPassword && confirmPassword !== password ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-brand-lime focus:ring-brand-lime'}`}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            {password && (
                                <div className="p-3 bg-brand-charcoal rounded-xl border border-slate-800 space-y-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? (passwordStrength <= 1 ? 'bg-red-500' : passwordStrength <= 2 ? 'bg-amber-500' : 'bg-brand-lime') : 'bg-slate-700'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-4 gap-1 text-[9px] uppercase font-black tracking-tighter">
                                        {Object.entries(passwordChecks).map(([key, valid]) => (
                                            <div key={key} className={`flex items-center gap-1 ${valid ? 'text-brand-lime' : 'text-slate-500'}`}>
                                                {valid ? <Check className="w-2 h-2" /> : <X className="w-2 h-2" />}
                                                {key}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 text-slate-400 cursor-pointer p-1">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-brand-lime focus:ring-brand-lime focus:ring-offset-0"
                                />
                                <span className="text-[11px] font-medium">
                                    I agree to the <a href="#" className="text-brand-lime hover:underline">Terms of Service</a>
                                </span>
                            </label>
                        </div>

                        <div className="md:col-span-2 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-brand-lime to-brand-teal text-brand-charcoal font-bebas text-xl tracking-wider hover:opacity-90 transition-all font-black flex items-center justify-center gap-2"
                            >
                                {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> INITIALIZING...</> : isDemoMode ? 'INITIALIZE LOCAL SESSION' : 'CREATE ACCOUNT'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-8">
                        Already have access?{' '}
                        <Link to="/login" className="text-brand-lime hover:text-brand-lime/80 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
