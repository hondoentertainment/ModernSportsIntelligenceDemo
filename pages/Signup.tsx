import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2, TrendingUp, Check, X } from 'lucide-react';

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

    // Password strength checks
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
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
        }
    };

    const handleGoogleSignup = async () => {
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
                        Click the link to activate your account.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block py-3 px-8 rounded-xl bg-gradient-to-r from-brand-lime to-brand-teal text-brand-charcoal font-bebas text-lg tracking-wider hover:opacity-90 transition-all"
                    >
                        BACK TO LOGIN
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
                    <h2 className="font-bebas text-3xl tracking-wide text-white mb-2">CREATE ACCOUNT</h2>
                    <p className="text-slate-400">Start tracking your portfolio today</p>
                </div>

                {/* Demo Mode Banner */}
                {isDemoMode && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                        <p className="text-amber-400 text-sm text-center">
                            <span className="font-semibold">Demo Mode</span> — Supabase not configured.
                        </p>
                        <button
                            onClick={handleDemoLogin}
                            className="w-full mt-3 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bebas tracking-wider hover:opacity-90 transition-all"
                        >
                            ENTER DEMO MODE
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                            placeholder="cardcollector99"
                            required
                        />
                    </div>

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

                        {/* Password Strength */}
                        {password && (
                            <div className="mt-3 space-y-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength
                                                    ? passwordStrength <= 1
                                                        ? 'bg-red-500'
                                                        : passwordStrength <= 2
                                                            ? 'bg-amber-500'
                                                            : passwordStrength <= 3
                                                                ? 'bg-brand-lime'
                                                                : 'bg-brand-teal'
                                                    : 'bg-slate-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    {Object.entries(passwordChecks).map(([key, valid]) => (
                                        <div key={key} className={`flex items-center gap-1 ${valid ? 'text-brand-lime' : 'text-slate-500'}`}>
                                            {valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            {key === 'length' ? '8+ characters' : key === 'uppercase' ? 'Uppercase' : key === 'lowercase' ? 'Lowercase' : 'Number'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${confirmPassword && confirmPassword !== password
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-slate-700 focus:border-brand-lime focus:ring-brand-lime'
                                }`}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <label className="flex items-start gap-3 text-slate-400 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded bg-slate-800 border-slate-600 text-brand-lime focus:ring-brand-lime focus:ring-offset-0"
                        />
                        <span className="text-sm">
                            I agree to the{' '}
                            <a href="#" className="text-brand-lime hover:underline">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-brand-lime hover:underline">Privacy Policy</a>
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading || isDemoMode}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-lime to-brand-teal text-brand-charcoal font-bebas text-lg tracking-wider hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                CREATING ACCOUNT...
                            </>
                        ) : (
                            'CREATE ACCOUNT'
                        )}
                    </button>
                </form>

                {!isDemoMode && (
                    <>
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-brand-charcoal text-slate-500">or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleSignup}
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
                    </>
                )}

                <p className="text-center text-slate-400 mt-8">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-lime hover:text-brand-lime/80 transition-colors font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
