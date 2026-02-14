import React, { useState } from 'react';
import { Shield, Target, User } from 'lucide-react';

interface CardImageProps {
    src?: string;
    playerName: string;
    year?: number;
    manufacturer?: string;
    className?: string;
}

const CardImage: React.FC<CardImageProps> = ({ src, playerName, year, manufacturer, className = "" }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isPlaceholder = !src || src.includes('unsplash.com') || hasError;

    return (
        <div className={`relative overflow-hidden bg-slate-950 group ${className}`}>
            {/* Premium Shimmer Loading State */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
                    style={{ backgroundSize: '200% 100%' }} />
            )}

            {isPlaceholder ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 to-slate-950">
                    {/* Glassmorphic Card Decoration */}
                    <div className="absolute inset-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-xl">
                            <Shield className="text-brand-blue" size={32} />
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-black text-brand-blue uppercase tracking-[0.2em]">{manufacturer || 'BASESET'}</p>
                            <h3 className="text-lg font-bebas tracking-wider text-white leading-tight">{playerName}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{year ? `${year} PROSPECT` : 'AUTHENTIC ASSET'}</p>
                        </div>

                        <div className="pt-4 flex justify-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                                <Target size={12} className="text-slate-500" />
                            </div>
                            <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                                <User size={12} className="text-slate-500" />
                            </div>
                        </div>
                    </div>

                    {/* Holographic Edge Glow */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-blue/10 blur-[60px] rounded-full" />
                </div>
            ) : (
                <img
                    src={src}
                    alt={playerName}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setHasError(true);
                        setIsLoading(false);
                    }}
                />
            )}
        </div>
    );
};

export default CardImage;
