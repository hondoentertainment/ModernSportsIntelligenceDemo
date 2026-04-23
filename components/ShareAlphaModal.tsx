// @ts-nocheck
import React, { useState } from 'react';
import { Share2, Globe, Lock, Copy, CheckCircle2, Trophy, Eye, Zap, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { generateShareLink } from '../lib/social/socialService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
    onToggleVisibility: (isPublic: boolean) => void;
}

const ShareAlphaModal: React.FC<Props> = ({ isOpen, onClose, profile, onToggleVisibility }) => {
    const [copied, setCopied] = useState(false);
    const shareUrl = generateShareLink(profile.username);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-brand-charcoal border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Section */}
                <div className="p-8 bg-gradient-to-br from-brand-lime/10 to-transparent border-b border-slate-800">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 bg-brand-lime/20 rounded-2xl flex items-center justify-center text-brand-lime border border-brand-lime/30">
                            <Share2 size={32} />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                        >
                            <Lock size={20} className="rotate-45" />
                        </button>
                    </div>

                    <h2 className="text-4xl font-bebas tracking-wide text-white leading-none">
                        Social <span className="text-brand-lime">Alpha</span> HUD
                    </h2>
                    <p className="text-sm text-brand-muted mt-2 font-medium">Broadcast your collector intelligence to the global market.</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Visibility Toggle */}
                    <div className="bg-brand-slate/50 border border-slate-800 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {profile.isPublic ? <Globe className="text-brand-lime" size={20} /> : <Lock className="text-slate-500" size={20} />}
                                <span className="text-sm font-black uppercase tracking-widest text-white">
                                    Privacy Status: {profile.isPublic ? 'PUBLIC ALPHA' : 'PRIVATE VAULT'}
                                </span>
                            </div>
                            <button
                                onClick={() => onToggleVisibility(!profile.isPublic)}
                                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${profile.isPublic ? 'bg-brand-lime' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${profile.isPublic ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <p className="text-[10px] text-brand-muted uppercase leading-relaxed font-bold">
                            {profile.isPublic
                                ? "Anyone with your link can view your portfolio, alpha score, and current holdings. Financial transactions remain private."
                                : "Your portfolio is locked. Only you can view your intelligence data and asset values."}
                        </p>
                    </div>

                    {/* Share Link Section */}
                    {profile.isPublic && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="text-brand-lime" size={16} />
                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest font-black">Direct Access Link</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-6 font-mono text-xs text-slate-400 truncate">
                                    {shareUrl}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="px-6 bg-brand-lime text-brand-charcoal font-black rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95"
                                >
                                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Alpha Stats Preview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-brand-slate/30 border border-slate-800 rounded-2xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy size={14} className="text-brand-lime" />
                                <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Alpha Score</span>
                            </div>
                            <p className="text-2xl font-bebas text-white tracking-widest">{profile.alphaScore}</p>
                        </div>
                        <div className="p-4 bg-brand-slate/30 border border-slate-800 rounded-2xl">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={14} className="text-brand-lime" />
                                <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Global Tier</span>
                            </div>
                            <p className="text-2xl font-bebas text-white tracking-widest">{profile.tier}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <div className="flex items-center gap-2">
                            <Eye size={12} />
                            <span>143 Profile Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RotateCw size={12} className="animate-spin-slow" />
                            <span>Live Pulse Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RotateCw = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
    </svg>
);

export default ShareAlphaModal;
