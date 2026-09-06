import React, { useMemo, useState } from 'react';
import { Share2, Globe, Lock, Copy, CheckCircle2, Trophy, Eye, Zap, ShieldCheck, Code2 } from 'lucide-react';
import { CardInventory, UserProfile } from '../types';
import { generateShareLink } from '../lib/social/socialService';
import { buildShareableCollectionPreview, generateEmbedCode } from '../lib/social/collectionShare';
import {
  buildForumShareSnippet,
  buildIframeEmbedSnippet,
  PORTFOLIO_EMBED_DISCLOSURE,
} from '../lib/social/portfolioEmbed';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
    onToggleVisibility: (isPublic: boolean) => void;
    inventory?: CardInventory[];
}

const ShareAlphaModal: React.FC<Props> = ({ isOpen, onClose, profile, onToggleVisibility, inventory }) => {
    const [copied, setCopied] = useState<'link' | 'iframe' | 'forum' | null>(null);

    const handleCopy = async (text: string, kind: 'link' | 'iframe' | 'forum') => {
        await navigator.clipboard.writeText(text);
        setCopied(kind);
        setTimeout(() => setCopied(null), 2000);
    };

    const preview = useMemo(() => {
        if (!inventory || inventory.length === 0) return null;
        return buildShareableCollectionPreview(inventory, {
            ownerName: profile.displayName || profile.username,
            title: `${profile.displayName || profile.username} collection`,
            description: profile.bio || 'Public collection snapshot',
        });
    }, [inventory, profile.bio, profile.displayName, profile.username]);

    if (!isOpen || !profile?.username) return null;

    const shareUrl = generateShareLink(profile.username);
    const iframeSnippet = buildIframeEmbedSnippet(profile.username);
    const staticWidget = preview ? generateEmbedCode(preview) : '';
    const forumSnippet = preview
        ? buildForumShareSnippet(profile.username, staticWidget)
        : iframeSnippet;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-brand-charcoal border border-slate-800 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
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

                    {profile.isPublic && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="text-brand-lime" size={16} />
                                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Direct Access Link</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-6 font-mono text-xs text-slate-400 truncate">
                                        {shareUrl}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void handleCopy(shareUrl, 'link')}
                                        className="px-6 bg-brand-lime text-brand-charcoal font-black rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95"
                                        aria-label="Copy share link"
                                    >
                                        {copied === 'link' ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Code2 className="text-brand-lime" size={16} />
                                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Embed widget</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                    {PORTFOLIO_EMBED_DISCLOSURE}
                                </p>
                                <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap font-mono">
                                    {iframeSnippet}
                                </pre>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void handleCopy(iframeSnippet, 'iframe')}
                                        className="px-4 py-2 bg-brand-lime/15 text-brand-lime border border-brand-lime/30 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                        {copied === 'iframe' ? 'Copied iframe' : 'Copy iframe snippet'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleCopy(forumSnippet, 'forum')}
                                        className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                        {copied === 'forum' ? 'Copied forum pack' : 'Copy forum pack'}
                                    </button>
                                </div>
                                {staticWidget && (
                                    <div>
                                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Live preview</p>
                                        <iframe
                                            title="Collection widget preview"
                                            srcDoc={staticWidget}
                                            className="w-full h-72 border border-slate-800 rounded-2xl bg-brand-charcoal"
                                            sandbox=""
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                            <span>Public vanity page</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RotateCw size={12} className="animate-spin-slow" />
                            <span>Estimate snapshot</span>
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
