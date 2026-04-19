
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

/**
 * Phase 70: App Shell Hardening — 404 Not Found page.
 * Full-page dark-themed 404 with brand styling and animated background element.
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] text-center px-6 overflow-hidden">
      {/* Animated floating card silhouette */}
      <div
        className="absolute pointer-events-none select-none opacity-[0.04]"
        aria-hidden="true"
      >
        <div className="w-64 h-96 rounded-2xl border-2 border-slate-400 animate-float-slow">
          <div className="absolute inset-4 rounded-xl border border-slate-500" />
          <div className="absolute top-8 left-8 right-8 h-32 rounded-lg bg-slate-400/20" />
          <div className="absolute bottom-12 left-8 right-8 space-y-2">
            <div className="h-2 rounded bg-slate-400/30 w-3/4" />
            <div className="h-2 rounded bg-slate-400/30 w-1/2" />
            <div className="h-2 rounded bg-slate-400/30 w-2/3" />
          </div>
        </div>
      </div>

      {/* 404 number */}
      <h1
        className="font-bebas text-[10rem] md:text-[14rem] leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-500 to-slate-800 select-none"
        aria-hidden="true"
      >
        404
      </h1>

      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-bold text-white -mt-6 mb-3">
        Page not found
      </h2>

      {/* Description */}
      <p className="text-sm md:text-base text-brand-muted max-w-md mb-10 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-lime text-brand-charcoal text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors shadow-lg shadow-brand-lime/20"
        >
          <Home size={16} />
          Return to Dashboard
        </Link>
        <Link
          to="/features"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-slate text-slate-300 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Compass size={16} />
          Browse Features
        </Link>
      </div>

      {/* Inline keyframes for the floating animation */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-24px) rotate(-2deg); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
