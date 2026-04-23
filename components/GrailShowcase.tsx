// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Box, Info, Shield, Target } from 'lucide-react';

interface GrailShowcaseProps {
    card: {
        name: string;
        player: string;
        year: string;
        set: string;
        grade: string;
        image: string;
        marketValue: string;
        scarcity?: string;
    };
    isOpen: boolean;
    onClose: () => void;
}

const GrailShowcase: React.FC<GrailShowcaseProps> = ({ card, isOpen, onClose }) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isRotating, setIsRotating] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let frame: number;
        const animate = () => {
            if (isRotating) {
                setRotation(prev => ({
                    x: Math.sin(Date.now() / 2000) * 10,
                    y: prev.y + 0.5
                }));
            }
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [isRotating]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        setIsRotating(false);
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
        const y = ((e.clientX - rect.left) / rect.width - 0.5) * -40;
        setRotation({ x, y });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-lime/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[100px]" />
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all z-[110]"
            >
                <X size={24} />
            </button>

            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl w-full px-8 relative z-10">

                {/* 3D Transform Container */}
                <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setIsRotating(true)}
                    className="relative w-[320px] h-[450px] perspective-[1500px] cursor-none group"
                >
                    <div
                        className="w-full h-full preserve-3d transition-transform duration-200 ease-out"
                        style={{
                            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        }}
                    >
                        {/* Card Case (Acrylic Effect) */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-[2.5rem] border-[4px] border-white/20 shadow-[0_0_100px_rgba(255,255,255,0.1)] overflow-hidden">
                            {/* Internal Bevel */}
                            <div className="absolute inset-[10px] border border-white/10 rounded-[2rem]" />

                            {/* Holographic Reflection */}
                            <div
                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"
                                style={{
                                    transform: `translateX(${rotation.y * 2}px) translateY(${rotation.x * 2}px)`,
                                }}
                            />

                            {/* Card Image */}
                            <div className="absolute inset-[20px] rounded-[1.5rem] overflow-hidden bg-brand-charcoal">
                                <img
                                    src={card.image}
                                    alt={card.name}
                                    className="w-full h-full object-cover"
                                />

                                {/* PSA Layer Overlay */}
                                <div className="absolute top-0 left-0 right-0 h-16 bg-white/90 flex items-center justify-center border-b border-black/10">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-black tracking-tighter leading-tight">{card.year} {card.set}</span>
                                        <span className="text-[14px] font-black text-black tracking-widest">{card.name}</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 font-black text-sm skewed-item shadow-xl border border-white/20">
                                    {card.grade}
                                </div>
                            </div>
                        </div>

                        {/* Float Shadow */}
                        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/60 rounded-full blur-2xl transform scale-x-150" />
                    </div>

                    {/* AR Labels (Side of the card) */}
                    <div className="absolute -right-24 top-1/4 space-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-brand-lime/10 backdrop-blur-md border border-brand-lime/20 p-3 rounded-xl flex items-center gap-3 animate-slide-in-right">
                            <Shield size={16} className="text-brand-lime" />
                            <div className="text-[10px] font-bold text-brand-lime uppercase tracking-widest leading-none">Scarcity: {card.scarcity || 'High'}</div>
                        </div>
                        <div className="bg-brand-blue/10 backdrop-blur-md border border-brand-blue/20 p-3 rounded-xl flex items-center gap-3 animate-slide-in-right delay-100">
                            <Target size={16} className="text-brand-blue" />
                            <div className="text-[10px] font-bold text-brand-blue uppercase tracking-widest leading-none">NAV Target: {card.marketValue}</div>
                        </div>
                    </div>
                </div>

                {/* Info Column */}
                <div className="flex-1 space-y-8 animate-in slide-in-from-bottom-12 duration-700">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-brand-lime/10 text-brand-lime text-[10px] font-black tracking-widest uppercase rounded-full border border-brand-lime/20">Institutional Grade</span>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Vaulted Since 2024</span>
                        </div>
                        <h1 className="text-6xl font-bebas text-white tracking-widest leading-none">
                            {card.name}
                            <span className="block text-brand-lime">{card.player}</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-1">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Market Valuation</div>
                            <div className="text-3xl font-mono text-white">{card.marketValue}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-1">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Pop Report</div>
                            <div className="text-3xl font-mono text-brand-lime">1 of 12</div>
                        </div>
                    </div>

                    <p className="text-lg text-white/60 leading-relaxed font-light italic">
                        "A cornerstone asset for high-liquidity portfolios. This specific specimen exhibits perfect centering and zero surface abrasions, placing it in the top 0.1% of all verified examples."
                    </p>

                    <div className="flex items-center gap-4 pt-4">
                        <button className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-lime transition-colors flex items-center justify-center gap-3">
                            <Box size={16} />
                            Enter AR View
                        </button>
                        <button className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
                            <Info size={16} />
                            Verify Authenticity
                        </button>
                    </div>
                </div>
            </div>

            {/* AR Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="w-full h-[2px] bg-brand-lime shadow-[0_0_20px_rgba(101,255,0,0.8)] animate-scan-vertical" />
            </div>
        </div>
    );
};

export default GrailShowcase;
