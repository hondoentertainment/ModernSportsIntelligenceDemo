
import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Shield, ExternalLink, Sparkles } from 'lucide-react';

interface ShareAlphaModalProps {
    isOpen: boolean;
    onClose: () => void;
    portfolioName: string;
    alphaScore: number;
    roi: number;
}

const ShareAlphaModal: React.FC<ShareAlphaModalProps> = ({ isOpen, onClose, portfolioName, alphaScore, roi }) => {
    const [copied, setCopied] = useState(false);
    const mockUrl = `https://modern-sports-intel.com/@${portfolioName.toLowerCase().replace(/\s+/g, '-')}-alpha`;

    const handleCopy = () => {
        navigator.clipboard.writeText(mockUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-brand-slate border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500">
                {/* Decorative Pattern */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-brand-blue/10 to-transparent"></div>

                <div className="p-8 space-y-8 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-blue/10 rounded-2xl text-brand-blue">
                                <Share2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bebas tracking-wide text-white leading-none">Share Your Alpha</h2>
                                <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">Generate Public HUD Link</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="bg-brand-charcoal/50 border border-slate-800 rounded-3xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Share Preview</p>
                                <h3 className="text-xl font-bold text-white">{portfolioName} <span className="text-brand-lime font-bebas text-2xl ml-1">v.{alphaScore}</span></h3>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${roi >= 0 ? 'bg-brand-green/10 text-brand-green' : 'bg-red-500/10 text-red-500'}`}>
                                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}% ROI
                            </div>
                        </div>

                        <div className="p-4 bg-brand-slate border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <Globe size={16} className="text-brand-muted shrink-0" />
                                <span className="text-xs text-brand-muted truncate font-mono">{mockUrl}</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`shrink-0 p-2 rounded-xl transition-all ${copied ? 'bg-brand-lime text-brand-charcoal' : 'bg-brand-charcoal hover:bg-slate-700 text-white'}`}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-brand-slate/40 border border-slate-800 rounded-2xl space-y-2">
                            <Shield size={18} className="text-brand-blue" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-tighter">Privacy Mode</h4>
                            <p className="text-[10px] text-brand-muted leading-tight">Financial values are relative. Net figures are obscured.</p>
                        </div>
                        <div className="p-4 bg-brand-slate/40 border border-slate-800 rounded-2xl space-y-2">
                            <Sparkles size={18} className="text-brand-lime" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-tighter">Live HUD</h4>
                            <p className="text-[10px] text-brand-muted leading-tight">Link reflects real-time sync data across all leagues.</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-brand-blue hover:bg-white text-white hover:text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        Publish Public Alpha <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareAlphaModal;
