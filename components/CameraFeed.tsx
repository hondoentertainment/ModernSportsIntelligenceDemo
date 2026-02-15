
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraFeedProps {
    onCapture: (base64: string) => void;
    isActive: boolean;
}

const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture, isActive }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    useEffect(() => {
        if (isActive) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isActive, facingMode]);

    const startCamera = async () => {
        try {
            setError(null);
            const mobile = isMobile();
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mobile ? 'environment' : facingMode,
                    width: { ideal: mobile ? 1280 : 1920 },
                    height: { ideal: mobile ? 720 : 1080 }
                },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Camera access denied or unavailable. Ensure your browser has permission.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleFacingMode = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const captureFrame = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                onCapture(base64);
            }
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-brand-charcoal/50 rounded-[2rem] border border-red-500/20">
                <AlertCircle className="text-red-500" size={48} />
                <p className="text-sm font-medium text-red-400">{error}</p>
                <button
                    onClick={startCamera}
                    className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                    Retry Permission
                </button>
            </div>
        );
    }

    return (
        <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-slate-800 shadow-2xl">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
            />

            {/* HUD Scan Reticle */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-brand-lime/30 rounded-xl">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-lime"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-lime"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-lime"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-lime"></div>
                    <div className="absolute inset-0 bg-brand-lime/5"></div>
                </div>
            </div>

            {/* Controls Overlay - touch-friendly on mobile */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
                {!isMobile() && (
                    <button
                        onClick={toggleFacingMode}
                        className="p-4 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition-all active:scale-90 touch-manipulation"
                        aria-label="Switch camera"
                    >
                        <RefreshCw size={24} />
                    </button>
                )}

                <button
                    onClick={captureFrame}
                    className="w-20 h-20 min-h-[80px] min-w-[80px] bg-brand-lime rounded-full border-[6px] border-white/20 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group touch-manipulation"
                    aria-label="Capture card"
                >
                    <div className="w-16 h-16 rounded-full border-2 border-brand-charcoal/20 flex items-center justify-center">
                        <Camera size={32} className="text-brand-charcoal" />
                    </div>
                </button>

                <div className="w-14" /> {/* Spacer to center the shutter */}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default CameraFeed;
