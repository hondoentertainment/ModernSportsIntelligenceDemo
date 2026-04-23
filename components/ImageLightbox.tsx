// @ts-nocheck
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string | undefined;
  alt?: string;
  caption?: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, onClose, src, alt = '', caption }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-brand-lime"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {src ? (
          <>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {caption && (
              <p className="mt-4 text-center text-white font-medium max-w-xl px-4">
                {caption}
              </p>
            )}
          </>
        ) : (
          <div className="w-64 h-80 rounded-2xl bg-slate-800 flex items-center justify-center">
            <p className="text-slate-500 text-sm">No image available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
