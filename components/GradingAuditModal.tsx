import React, { useState, useRef } from 'react';
import { X, Camera, Upload, AlertCircle, Sparkles, Activity, Search, Target, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { auditCardVisuals } from '../lib/gemini.ts';
import CameraFeed from './CameraFeed.tsx';
import { VisualAuditResult } from '../types.ts';

interface GradingAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (result: VisualAuditResult) => void;
}

const GradingAuditModal: React.FC<GradingAuditModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'camera' | 'upload'>('upload');
    const [result, setResult] = useState<VisualAuditResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
            processImage(reader.result as string, file.type);
        };
        reader.readAsDataURL(file);
    };

    const handleCapture = (base64: string) => {
        setPreviewUrl(base64);
        processImage(base64, 'image/jpeg');
    };

    const processImage = async (base64WithPrefix: string, mimeType: string) => {
        setIsScanning(true);
        setError(null);
        setResult(null);

        try {
            const base64 = base64WithPrefix.includes(',') ? base64WithPrefix.split(',')[1] : base64WithPrefix;
            const auditData = await auditCardVisuals(base64, mimeType);

            if (auditData) {
                setTimeout(() => {
                    setIsScanning(false);
                    setResult(auditData);
                }, 2500);
            } else {
                setError("Visual Audit engine could not resolve card defects. Please try a clearer photo.");
                setIsScanning(false);
            }
        } catch (err) {
            setError("Vision system offline or parsing failed. Check network connectivity.");
            setIsScanning(false);
        }
    };

    const renderSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'Severe':
                return <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-black uppercase">CRITICAL</span>;
            case 'Moderate':
                return <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase">MODERATE</span>;
            default:
                return <span className="px-2 py-0.5 rounded-md bg-brand-lime/20 text-brand-lime text-[10px] font-black uppercase">MINOR</span>;
        }
    };

    const handleAccept = () => {
        if (result) {
            onComplete(result);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-brand-slate border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500 flex flex-col max-h-[90vh]">

                {/* Scanning Overlay */}
                {isScanning && (
                    <div className="absolute inset-0 z-[70] pointer-events-none overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-lime shadow-[0_0_25px_#BEF264] animate-scan z-[80]"></div>
                        <div className="absolute inset-0 bg-brand-lime/5 animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md">
                            <div className="text-center space-y-4">
                                <Search size={64} className="text-brand-lime animate-spin mx-auto" />
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bebas text-white tracking-widest">High-Fidelity Visual Audit</h3>
                                    <p className="text-[10px] text-brand-lime font-black uppercase tracking-[0.4em]">Resolving Topography & Edge Integrity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-8 flex-shrink-0 border-b border-slate-800">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-lime/10 rounded-2xl text-brand-lime shadow-inner shadow-brand-lime/20">
                                <Search size={24} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bebas tracking-wide text-white leading-none">Visual <span className="text-brand-lime">Audit Simulation</span></h2>
                                <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">Powered by Gemini 1.5 Pro Vision</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!result && !previewUrl && (
                                <div className="flex bg-brand-charcoal rounded-xl p-1 border border-slate-800 mr-2">
                                    <button
                                        onClick={() => setMode('camera')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'camera' ? 'bg-brand-lime text-brand-charcoal shadow-lg' : 'text-brand-muted hover:text-white'}`}
                                    >
                                        Live Lens
                                    </button>
                                    <button
                                        onClick={() => setMode('upload')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'upload' ? 'bg-brand-lime text-brand-charcoal shadow-lg' : 'text-brand-muted hover:text-white'}`}
                                    >
                                        Upload
                                    </button>
                                </div>
                            )}
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {!previewUrl ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                            {mode === 'camera' ? (
                                <CameraFeed isActive={isOpen} onCapture={handleCapture} facingMode="environment" />
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-video border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center space-y-4 hover:border-brand-lime/50 hover:bg-brand-lime/5 transition-all cursor-pointer group bg-brand-charcoal/30"
                                >
                                    <div className="w-20 h-20 bg-brand-charcoal rounded-[2rem] flex items-center justify-center text-brand-muted group-hover:text-brand-lime transition-all group-hover:scale-110 shadow-2xl">
                                        <Upload size={40} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-lg">Upload High-Res Asset</p>
                                        <p className="text-xs text-brand-muted">Provide a clear, well-lit photo for accurate topography analysis.</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border border-slate-800 relative bg-brand-charcoal group">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />

                                    {/* Artificial Defect Overlay Scanlines */}
                                    {result && (
                                        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
                                    )}

                                    {/* Visual Markers for defects if result exists */}
                                    {result?.defects.map((defect, idx) => (
                                        <div
                                            key={idx}
                                            className="absolute w-12 h-12 border border-red-500/50 bg-red-500/10 rounded-full animate-ping pointer-events-none"
                                            style={{
                                                top: defect.location.toLowerCase().includes('top') ? '15%' : defect.location.toLowerCase().includes('bottom') ? '85%' : '50%',
                                                left: defect.location.toLowerCase().includes('left') ? '15%' : defect.location.toLowerCase().includes('right') ? '85%' : '50%',
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500">
                                        <AlertCircle size={24} />
                                        <div className="flex-1">
                                            <p className="text-xs font-black uppercase tracking-widest mb-1">Audit Failed</p>
                                            <p className="text-xs font-medium text-red-400/80">{error}</p>
                                        </div>
                                        <button
                                            onClick={() => { setPreviewUrl(null); setError(null); }}
                                            className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Analysis Results Panel */}
                            {result && (
                                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                                    <div className="p-6 bg-brand-lime text-brand-charcoal rounded-[2rem] flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-widest opacity-70 mb-1">Predicted Grade</p>
                                            <h3 className="text-5xl font-bebas tracking-wide leading-none">{result.predictedGrade}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Confidence</p>
                                            <p className="text-xl font-bold">{(result.confidenceScore * 100).toFixed(0)}%</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Centering', value: result.subgrades.centering, icon: <LayoutGrid size={16} /> },
                                            { label: 'Corners', value: result.subgrades.corners, icon: <Target size={16} /> },
                                            { label: 'Edges', value: result.subgrades.edges, icon: <LayoutGrid size={16} /> },
                                            { label: 'Surface', value: result.subgrades.surface, icon: <Sparkles size={16} /> },
                                        ].map(sub => (
                                            <div key={sub.label} className="p-4 bg-brand-charcoal/50 border border-slate-800 rounded-2xl flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-brand-muted">
                                                    {sub.icon}
                                                    <span className="text-xs font-black uppercase tracking-widest">{sub.label}</span>
                                                </div>
                                                <span className={`font-bold ${sub.value >= 9.5 ? 'text-brand-lime' : sub.value >= 9 ? 'text-white' : 'text-red-400'}`}>
                                                    {sub.value.toFixed(1)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={16} className="text-brand-lime" />
                                            Defect Log
                                        </h4>

                                        {result.defects.length === 0 ? (
                                            <div className="p-4 bg-brand-charcoal/30 border border-slate-800 rounded-2xl text-center text-sm text-brand-muted">
                                                No significant defects detected.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {result.defects.map((defect, i) => (
                                                    <div key={i} className="p-4 bg-brand-charcoal border border-slate-800 rounded-2xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-white">{defect.type}</span>
                                                                <span className="text-[10px] text-brand-muted">@ {defect.location}</span>
                                                            </div>
                                                            {renderSeverityBadge(defect.severity)}
                                                        </div>
                                                        <p className="text-xs text-slate-400">{defect.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-brand-charcoal border border-slate-800 rounded-2xl">
                                        <p className="text-sm text-slate-300 italic">"{result.summary}"</p>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            onClick={() => { setPreviewUrl(null); setResult(null); }}
                                            className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-slate-800 hover:bg-slate-700 transition"
                                        >
                                            Reset Scan
                                        </button>
                                        <button
                                            onClick={handleAccept}
                                            className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-brand-charcoal bg-brand-lime hover:bg-brand-teal transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:shadow-[0_0_30px_rgba(190,242,100,0.5)]"
                                        >
                                            <CheckCircle2 size={16} />
                                            Save Audit Report
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GradingAuditModal;
