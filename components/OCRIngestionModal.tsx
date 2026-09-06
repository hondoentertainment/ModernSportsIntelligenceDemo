
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  Upload,
  AlertCircle,
  Sparkles,
  Activity,
  ScanBarcode,
  Keyboard,
} from 'lucide-react';
import { parseCardImage } from '../lib/utils/gemini.ts';
import { CardInventory } from '../types.ts';
import CameraFeed from './CameraFeed.tsx';
import { isBarcodeDetectionSupported } from '../lib/utils/barcodeDetection.ts';
import {
  resolveScanIdentifier,
  toAddAssetPrefill,
  type ResolvedScanCard,
} from '../lib/utils/certScanResolver.ts';

interface OCRIngestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (_card: Partial<CardInventory>) => void;
}

type ScanMode = 'camera' | 'upload' | 'cert';

const OCRIngestionModal: React.FC<OCRIngestionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<ScanMode>('camera');
    const [manualId, setManualId] = useState('');
    const [resolved, setResolved] = useState<ResolvedScanCard | null>(null);
    const [lookupBusy, setLookupBusy] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const liveDecode = isBarcodeDetectionSupported();

    const resetSession = useCallback(() => {
        setIsScanning(false);
        setPreviewUrl(null);
        setError(null);
        setManualId('');
        setResolved(null);
        setLookupBusy(false);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            resetSession();
            setMode('camera');
        }
    }, [isOpen, resetSession]);

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

    const runResolve = useCallback(async (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            setResolved(null);
            setError('Enter a PSA cert or UPC / barcode-like identifier.');
            return;
        }
        setLookupBusy(true);
        setError(null);
        try {
            const next = await resolveScanIdentifier(trimmed);
            setResolved(next);
            if (next.error) setError(next.error);
        } catch {
            setResolved(null);
            setError('Lookup failed. Check the identifier and try again.');
        } finally {
            setLookupBusy(false);
        }
    }, []);

    const handleBarcodeDetected = useCallback((value: string) => {
        setMode('cert');
        setManualId(value);
        void runResolve(value);
    }, [runResolve]);

    const handlePrefillAdd = () => {
        const card = resolved ? toAddAssetPrefill(resolved) : null;
        if (!card) return;
        onSuccess(card);
        onClose();
        resetSession();
    };

    const processImage = async (base64WithPrefix: string, mimeType: string) => {
        setIsScanning(true);
        setError(null);

        try {
            const base64 = base64WithPrefix.includes(',') ? base64WithPrefix.split(',')[1] : base64WithPrefix;
            const result = await parseCardImage(base64, mimeType);

            if (result) {
                // Professional scanning delay for UX impact
                setTimeout(() => {
                    setIsScanning(false);
                    onSuccess(result);
                    // We keep modal open briefy to show success then auto-close is done by parent or onSuccess
                    // but here we just follow the original logic which was closing internally
                    onClose();
                    setPreviewUrl(null);
                }, 2500);
            } else {
                setError("Alpha engine could not resolve card metadata. Please try a clearer photo or manual entry.");
                setIsScanning(false);
            }
        } catch  {
            setError("Vision system offline or parsing failed. Check network connectivity.");
            setIsScanning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-brand-slate border border-slate-800 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 fade-in duration-500">
                {/* Global HUD Scanning Overlay - Only active when results are coming back */}
                {isScanning && (
                    <div className="absolute inset-0 z-[70] pointer-events-none overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-lime shadow-[0_0_25px_#BEF264] animate-scan z-[80]"></div>
                        <div className="absolute inset-0 bg-brand-lime/5 animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md">
                            <div className="text-center space-y-4">
                                <Activity size={64} className="text-brand-lime animate-spin mx-auto" />
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bebas text-white tracking-widest">Neural Analysis In Progress</h3>
                                    <p className="text-[10px] text-brand-lime font-black uppercase tracking-[0.4em]">Resolving Serial & Metadata</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-3 bg-brand-lime/10 rounded-2xl text-brand-lime shadow-inner shadow-brand-lime/20 shrink-0">
                                <Sparkles size={24} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-3xl font-bebas tracking-wide text-white leading-none">Alpha <span className="text-brand-lime">Scanner</span></h2>
                                <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">Card-show floor loop · cert / UPC / vision</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex flex-wrap bg-brand-charcoal rounded-xl p-1 border border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setMode('camera')}
                                    className={`px-3 py-2 min-h-[40px] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'camera' ? 'bg-brand-lime text-brand-charcoal shadow-lg' : 'text-brand-muted hover:text-white'}`}
                                >
                                    Live Lens
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('cert')}
                                    className={`px-3 py-2 min-h-[40px] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'cert' ? 'bg-brand-lime text-brand-charcoal shadow-lg' : 'text-brand-muted hover:text-white'}`}
                                >
                                    Cert / UPC
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('upload')}
                                    className={`px-3 py-2 min-h-[40px] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'upload' ? 'bg-brand-lime text-brand-charcoal shadow-lg' : 'text-brand-muted hover:text-white'}`}
                                >
                                    Upload
                                </button>
                            </div>
                            <button type="button" onClick={onClose} className="p-2 min-h-[40px] min-w-[40px] hover:bg-slate-800 rounded-full transition-colors text-slate-400" aria-label="Close scanner">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {mode === 'cert' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="rounded-2xl border border-slate-800 bg-brand-charcoal/40 p-4 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                    Phone as scanner gun
                                </p>
                                <p className="text-sm text-slate-300">
                                    Scan a slab barcode or type a PSA cert / UPC. Matches prefill Add Asset — demo catalog first, then the existing PSA adapter.
                                </p>
                                {!liveDecode && (
                                    <p className="text-xs text-amber-300/90">
                                        Live barcode decode needs Chromium (desktop or Android). Type the cert or UPC below.
                                    </p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <label className="sr-only" htmlFor="cert-upc-input">PSA cert or UPC</label>
                                    <input
                                        id="cert-upc-input"
                                        value={manualId}
                                        onChange={(e) => setManualId(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && void runResolve(manualId)}
                                        inputMode="numeric"
                                        autoComplete="off"
                                        placeholder="PSA cert or UPC — e.g. 12345678"
                                        className="flex-1 min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl px-4 text-white font-mono text-sm focus:outline-none focus:border-brand-lime"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void runResolve(manualId)}
                                        disabled={lookupBusy}
                                        className="min-h-[48px] px-5 rounded-xl bg-brand-lime text-brand-charcoal text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {lookupBusy ? 'Looking up…' : 'Lookup'}
                                    </button>
                                </div>
                            </div>

                            {liveDecode && (
                                <CameraFeed
                                    isActive={isOpen && mode === 'cert'}
                                    onCapture={handleCapture}
                                    onBarcodeDetected={handleBarcodeDetected}
                                />
                            )}

                            {!resolved && !error && !lookupBusy && (
                                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center border border-dashed border-slate-800 rounded-[2rem] bg-brand-charcoal/20">
                                    <ScanBarcode className="text-brand-lime" size={36} />
                                    <p className="text-white font-bold">No identifier yet</p>
                                    <p className="text-xs text-brand-muted max-w-sm">
                                        Point the camera at a PSA label / UPC, or type a demo cert (12345678, 85012345) to prefill inventory.
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">Lookup failed</p>
                                        <p className="text-xs">{error}</p>
                                    </div>
                                </div>
                            )}

                            {resolved?.card && (
                                <div className="rounded-2xl border border-brand-lime/20 bg-brand-lime/5 p-4 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-lime">
                                        {resolved.kind === 'upc' ? 'UPC match' : 'Cert match'} · {resolved.identifier}
                                    </p>
                                    <h3 className="text-xl font-bebas text-white tracking-wide">
                                        {resolved.card.player}{' '}
                                        <span className="text-brand-lime">{resolved.card.year} {resolved.card.set}</span>
                                    </h3>
                                    <p className="text-sm text-slate-300">
                                        {resolved.card.manufacturer} #{resolved.card.cardNumber}
                                        {resolved.card.isGraded ? ` · ${resolved.card.gradingCompany} ${resolved.card.grade}` : ''}
                                    </p>
                                    <p className="text-[11px] text-slate-400">{resolved.honestyLabel}</p>
                                    <button
                                        type="button"
                                        onClick={handlePrefillAdd}
                                        className="w-full min-h-[48px] rounded-xl bg-brand-lime text-brand-charcoal text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <Keyboard size={14} /> Open add-asset with these fields
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {mode !== 'cert' && !previewUrl && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {mode === 'camera' ? (
                                <CameraFeed
                                    isActive={isOpen}
                                    onCapture={handleCapture}
                                    onBarcodeDetected={handleBarcodeDetected}
                                />
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-video border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center space-y-4 hover:border-brand-lime/50 hover:bg-brand-lime/5 transition-all cursor-pointer group bg-brand-charcoal/30"
                                >
                                    <div className="w-20 h-20 bg-brand-charcoal rounded-[2rem] flex items-center justify-center text-brand-muted group-hover:text-brand-lime transition-all group-hover:scale-110 shadow-2xl">
                                        <Upload size={40} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-lg">Select Asset Evidence</p>
                                        <p className="text-xs text-brand-muted">Upload a clear photo for high-confidence cataloging</p>
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
                    )}

                    {mode !== 'cert' && previewUrl && (
                        <div className="space-y-6">
                            <div className="aspect-video rounded-[2rem] overflow-hidden border border-slate-800 relative bg-brand-charcoal">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                            </div>

                            {error && (
                                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500 animate-in shake-1 duration-300">
                                    <AlertCircle size={24} />
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase tracking-widest mb-1">Resolution Failed</p>
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
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="p-6 bg-brand-charcoal/50 border border-slate-800 rounded-[2rem] space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-lime/5 blur-2xl rounded-full" />
                            <Sparkles size={24} className="text-brand-lime" />
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tighter mb-1 font-bebas">Model: Vision Flash 1.5</h4>
                                <p className="text-[10px] text-brand-muted leading-relaxed">Multimodal recognition for cards, stamps, and signatures. Resolved with low latency.</p>
                            </div>
                        </div>
                        <div className="p-6 bg-brand-charcoal/50 border border-slate-800 rounded-[2rem] space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-teal/5 blur-2xl rounded-full" />
                            <Activity size={24} className="text-brand-teal" />
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tighter mb-1 font-bebas">Autonomous Valuation</h4>
                                <p className="text-[10px] text-brand-muted leading-relaxed">Assets are benchmarked against live market auctions immediately upon ingestion.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OCRIngestionModal;
