import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Loader2, Check, TrendingUp, Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const { updatePassword, isDemoMode } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { error } = await updatePassword(password);

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-brand-lime/20 flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <Check className="w-10 h-10 text-brand-lime" />
                    </div>
                    <h2 className="font-bebas text-4xl tracking-wide text-white mb-4">PASSWORD UPDATED</h2>
                    <p className="text-slate-400 mb-8">
                        Your security credentials have been successfully refreshed. Redirecting to terminal initialization...
                    </p>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-lime animate-progress"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-lime to-brand-teal flex items-center justify-center shadow-[0_0_20px_rgba(190,242,100,0.3)]">
                        <TrendingUp className="w-7 h-7 text-brand-charcoal" />
                    </div>
                    <span className="font-bebas text-4xl tracking-wider text-white">MSI</span>
                </div>

                <div className="text-center mb-10">
                    <h2 className="font-bebas text-3xl tracking-wide text-white mb-2">UPDATE CREDENTIALS</h2>
                    <p className="text-slate-400">Establish a new secure access key for your account</p>
                </div>

                {isDemoMode && (
                    <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
                        <p className="text-amber-400 text-sm text-center leading-relaxed">
                            <span className="font-black uppercase tracking-widest text-[10px] block mb-1">Demo Mode Active</span>
                            Key rotation will be simulated. Security protocols remain in trial state.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 animate-in fade-in slide-in-from-top-2">
                        <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2.5 ml-1">New Security Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 pl-12 pr-12 rounded-2xl bg-slate-800/40 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime/50 transition-all backdrop-blur-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2.5 ml-1">Confirm Security Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 pl-12 rounded-2xl bg-slate-800/40 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime/50 transition-all backdrop-blur-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-lime to-brand-teal text-brand-charcoal font-bebas text-xl tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(190,242,100,0.2)]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                INITIALIZING UPDATE...
                            </>
                        ) : (
                            'REFRESH SECURITY KEY'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
