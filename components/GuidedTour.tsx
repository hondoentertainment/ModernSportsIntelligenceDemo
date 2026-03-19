
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Sparkles, Zap, Radio, ScanEye, Landmark, BarChart3, Layers } from 'lucide-react';
import { store } from '../lib/dal/syncStore';

const TOUR_STORAGE_KEY = 'msi-guided-tour-completed';

interface TourStep {
  id: string;
  title: string;
  description: string;
  tier: string;
  tierColor: string;
  icon: React.ReactNode;
  path: string;
  highlight: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: 'League Intelligence Dashboard',
    description: 'Your command center. See portfolio NAV, P/L, market signals, and AI agent insights all in one view. This is where your sports card intelligence journey begins.',
    tier: 'Core',
    tierColor: 'text-slate-300',
    icon: <BarChart3 size={24} className="text-brand-lime" />,
    path: '/',
    highlight: 'Core Platform',
  },
  {
    id: 'collection',
    title: 'Collection & Inventory',
    description: 'Add, manage, and track every card in your portfolio. Supports grading, pricing, scarcity badges, and 40+ analytical tools accessible from each card.',
    tier: 'Core',
    tierColor: 'text-slate-300',
    icon: <Layers size={24} className="text-brand-lime" />,
    path: '/collection',
    highlight: 'Core Platform',
  },
  {
    id: 'deep-search',
    title: 'Deep Search Intelligence',
    description: 'Search by "vibe" — find cards by trajectory, era, or similarity using AI. Ask questions like "rising rookies under $50" and get institutional-grade results.',
    tier: 'Core',
    tierColor: 'text-slate-300',
    icon: <Sparkles size={24} className="text-brand-lime" />,
    path: '/deep-search',
    highlight: 'AI-Powered',
  },
  {
    id: 'stress-test',
    title: 'Monte Carlo Stress Testing',
    description: 'Run 1,000+ simulated portfolio paths to understand risk. See Value-at-Risk, drawdown analysis, and scenario impacts like market crashes or grading scandals.',
    tier: 'Differentiated',
    tierColor: 'text-brand-lime',
    icon: <Zap size={24} className="text-brand-lime" />,
    path: '/',
    highlight: 'Differentiated',
  },
  {
    id: 'live-impact',
    title: 'Live Game Impact Engine',
    description: 'The industry first: see card values shift in real-time during live games. When a player hits a walk-off HR, instantly see your portfolio impact.',
    tier: 'Industry-First',
    tierColor: 'text-red-400',
    icon: <Radio size={24} className="text-red-400" />,
    path: '/live-impact',
    highlight: 'Industry-First',
  },
  {
    id: 'vision-grading',
    title: 'AI Vision Grading Lab',
    description: 'Upload card images for AI-powered grade prediction. Get sub-grade analysis, defect mapping, and submission ROI calculation before spending on grading fees.',
    tier: 'Industry-First',
    tierColor: 'text-red-400',
    icon: <ScanEye size={24} className="text-red-400" />,
    path: '/',
    highlight: 'Industry-First',
  },
  {
    id: 'fractional-vault',
    title: 'Fractional Vault & Copy-Trading',
    description: 'Buy fractional shares of grail cards starting from $1, and copy top collectors\' portfolio moves. Think eToro meets the sports card hobby.',
    tier: 'Industry-First',
    tierColor: 'text-red-400',
    icon: <Landmark size={24} className="text-red-400" />,
    path: '/fractional-vault',
    highlight: 'Industry-First',
  },
];

const GuidedTour: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const completed = store.get<string>(TOUR_STORAGE_KEY, '');
    if (!completed) {
      // Show after a brief delay so the page loads first
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = useCallback(() => {
    store.set(TOUR_STORAGE_KEY, 'true');
    setIsVisible(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (TOUR_STEPS[nextStep].path !== TOUR_STEPS[currentStep].path) {
        navigate(TOUR_STEPS[nextStep].path);
      }
    } else {
      completeTour();
    }
  }, [currentStep, navigate, completeTour]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (TOUR_STEPS[prevStep].path !== TOUR_STEPS[currentStep].path) {
        navigate(TOUR_STEPS[prevStep].path);
      }
    }
  }, [currentStep, navigate]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[250] pointer-events-none">
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" />

      {/* Tour card — centered at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg pointer-events-auto">
        <div className="bg-brand-slate border border-slate-700 rounded-2xl shadow-2xl overflow-hidden mx-4">
          {/* Progress bar */}
          <div className="h-1 bg-brand-charcoal">
            <div
              className="h-full bg-brand-lime transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-lime">
                Platform Tour
              </span>
              <span className="text-[9px] font-mono text-brand-muted">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
            </div>
            <button
              onClick={completeTour}
              className="text-brand-muted hover:text-white transition-colors p-1"
              aria-label="Skip tour"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-charcoal border border-slate-800 flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    step.highlight === 'Industry-First' ? 'bg-red-500/10 text-red-400' :
                    step.highlight === 'Differentiated' ? 'bg-brand-lime/10 text-brand-lime' :
                    step.highlight === 'AI-Powered' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-slate-700/50 text-slate-400'
                  }`}>
                    {step.highlight}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1.5 pb-3">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  navigate(TOUR_STEPS[i].path);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? 'bg-brand-lime w-6' :
                  i < currentStep ? 'bg-brand-lime/40' : 'bg-slate-700'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <button
              onClick={completeTour}
              className="text-[10px] font-bold text-brand-muted hover:text-white uppercase tracking-widest transition-colors"
            >
              Skip Tour
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white hover:bg-brand-charcoal uppercase tracking-widest transition-all"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-brand-lime text-brand-charcoal text-[10px] font-black uppercase tracking-widest hover:bg-brand-lime/90 transition-all"
              >
                {isLast ? 'Done' : 'Next'}
                {!isLast && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
