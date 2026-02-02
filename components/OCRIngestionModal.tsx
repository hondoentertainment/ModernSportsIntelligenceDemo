
import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Loader2, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { parseCardImage } from '../lib/gemini.ts';
import { CardInventory } from '../types.ts';

interface OCRIngestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (card: Partial<CardInventory>) => void;
}

const OCRIngestionModal: React.FC<OCRIngestionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
            processImage(reader.result as string, file.type);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (base64WithPrefix: string, mimeType: string) => {
        setIsScanning(true);
        setError(null);

        try {
            const base64 = base64WithPrefix.split(',')[1];
            const result = await parseCardImage(base64, mimeType);

            if (result) {
                // Delay for "Scanning" effect
                setTimeout(() => {
                    setIsScanning(false);
                    onSuccess(result);
                    onClose();
                    // Reset
                    setPreviewUrl(null);
                }, 2000);
            } else {
                setError("Alpha engine could not resolve card metadata. Please try a clearer photo.");
                setIsScanning(false);
            }
        } catch (err) {
            setError("Vision system offline. Check network connectivity.");
            setIsScanning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-brand-slate border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500">
                {/* HUD Scanning Overlay */}
                {isScanning && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-lime shadow-[0_0_15px_#BEF264] animate-scan"></div>
                        <div className="absolute inset-0 bg-brand-lime/5 animate-pulse"></div>
                    </div>
                )}

                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-lime/10 rounded-2xl text-brand-lime">
                                <Camera size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bebas tracking-wide text-white leading-none">AI Vision Ingestion</h2>
                                <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">Automated Asset Cataloging</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    {!previewUrl ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-video border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center space-y-4 hover:border-brand-lime/50 hover:bg-brand-lime/5 transition-all cursor-pointer group"
                        >
                            <div className="w-16 h-16 bg-brand-charcoal rounded-full flex items-center justify-center text-brand-muted group-hover:text-brand-lime transition-colors">
                                <Upload size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold">Drop Asset Photo</p>
                                <p className="text-xs text-brand-muted">Select a clear image of the card front</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="aspect-video rounded-[2rem] overflow-hidden border border-slate-800 relative bg-brand-charcoal">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                {isScanning && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                                        <Activity size={48} className="text-brand-lime animate-spin mb-4" />
                                        <p className="text-xs font-black text-brand-lime uppercase tracking-[0.3em] animate-pulse">Running Neural OCR...</p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
                                    <AlertCircle size={20} />
                                    <p className="text-xs font-medium">{error}</p>
                                </div>
                            )}

                            {!isScanning && !error && (
                                <div className="p-4 bg-brand-lime/10 border border-brand-lime/20 rounded-2xl flex items-center gap-3 text-brand-lime">
                                    <CheckCircle2 size={20} />
                                    <p className="text-xs font-medium">Image captured. Extracting metadata...</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-brand-charcoal/50 border border-slate-800 rounded-2xl space-y-2">
                            <Sparkles size={18} className="text-brand-lime" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-tighter">Model: Flash 1.5</h4>
                            <p className="text-[10px] text-brand-muted">Multimodal recognition for cards, stamps, and signatures.</p>
                        </div>
                        <div className="p-4 bg-brand-charcoal/50 border border-slate-800 rounded-2xl space-y-2">
                            <ChevronRight size={18} className="text-brand-lime" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-tighter">Instant NAV</h4>
                            <p className="text-[10px] text-brand-muted">Assets are valued immediately upon successful ingestion.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OCRIngestionModal;
