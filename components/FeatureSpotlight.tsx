import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  X,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Shield,
  Target,
  Globe,
  Zap,
  Flame,
  Camera,
  Scale,
  LineChart,
  Lock,
  Heart,
  Share2,
  Timer,
  Rocket,
  Gift,
  Scan,
  Layers,
  Calculator,
  Database,
  Crown,
  Tv,
} from 'lucide-react';

interface FeatureSpotlightProps {
  onFeatureClick?: (featureId: string) => void;
}

interface SpotlightFeature {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  route: string;
}

const FEATURE_POOL: SpotlightFeature[] = [
  { id: 'phase-44', name: 'AI Price Predictions', description: 'Let machine learning forecast your next big find', icon: Sparkles, route: '/analytics/predictions' },
  { id: 'phase-45', name: 'Market Heatmap', description: 'See the entire market at a glance with thermal vision', icon: Flame, route: '/analytics/heatmap' },
  { id: 'phase-46', name: 'Grade Estimator', description: 'Snap a photo and get an instant grade prediction', icon: Camera, route: '/grading/estimator' },
  { id: 'phase-47', name: 'Card Comparisons', description: 'Put any two cards head-to-head in seconds', icon: Scale, route: '/analytics/comparisons' },
  { id: 'phase-48', name: 'Portfolio Analytics', description: 'Deep-dive into your collection performance metrics', icon: LineChart, route: '/analytics/portfolio' },
  { id: 'phase-49', name: 'Vault Storage', description: 'Military-grade tracking for your most prized cards', icon: Lock, route: '/collection/vault' },
  { id: 'phase-50', name: 'Wishlist Manager', description: 'Never lose track of your grail cards again', icon: Heart, route: '/collection/wishlist' },
  { id: 'phase-51', name: 'Social Sharing', description: 'Show off your collection to the world', icon: Share2, route: '/social/share' },
  { id: 'phase-52', name: 'Live Auctions', description: 'Real-time bidding with live price updates', icon: Timer, route: '/trading/auctions' },
  { id: 'phase-53', name: 'Value Projections', description: 'See where your collection is headed financially', icon: Rocket, route: '/finance/projections' },
  { id: 'phase-54', name: 'Giveaways Hub', description: 'Enter daily giveaways and win rare cards', icon: Gift, route: '/social/giveaways' },
  { id: 'phase-55', name: 'Arbitrage Scanner', description: 'Spot cross-platform price gaps before anyone else', icon: Scan, route: '/trading/arbitrage' },
  { id: 'phase-56', name: 'Batch Listing', description: 'List your entire trade binder in one sweep', icon: Layers, route: '/trading/batch' },
  { id: 'phase-57', name: 'ROI Calculator', description: 'Know your exact return on every card investment', icon: Calculator, route: '/analytics/roi' },
  { id: 'phase-58', name: 'Population Reports', description: 'Explore rarity data across every grading company', icon: Database, route: '/grading/population' },
  { id: 'phase-59', name: 'Leaderboard', description: 'Compete with top collectors for the crown', icon: Crown, route: '/leaderboard' },
  { id: 'phase-60', name: 'Live Breaks', description: 'Watch cards get ripped in real time', icon: Tv, route: '/social/live' },
  { id: 'phase-61', name: 'Smart Pricing', description: 'AI sets the perfect price so you never undersell', icon: Zap, route: '/trading/smart-pricing' },
  { id: 'phase-62', name: 'Market Sentiment', description: 'Gauge the community mood before making moves', icon: BarChart3, route: '/analytics/sentiment' },
  { id: 'phase-63', name: 'Insurance Valuation', description: 'Protect your collection with certified valuations', icon: Shield, route: '/finance/insurance' },
  { id: 'phase-64', name: 'Collecting Challenges', description: 'Complete challenges and earn exclusive badges', icon: Target, route: '/social/challenges' },
  { id: 'phase-65', name: 'Events Calendar', description: 'Never miss a card show or convention again', icon: Globe, route: '/social/events' },
  { id: 'phase-66', name: 'Volume Analysis', description: 'Decode trading patterns with volume data', icon: TrendingUp, route: '/analytics/volume' },
  { id: 'phase-67', name: 'Crossover Calculator', description: 'Know your odds before crossing over slabs', icon: Scale, route: '/grading/crossover' },
  { id: 'phase-68', name: 'Set Registry', description: 'Track and showcase your graded set progress', icon: Database, route: '/grading/registry' },
];

const STORAGE_KEY = 'msi_dismissed_spotlights';

function getDismissedIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function dismissSpotlight(id: string): void {
  try {
    const dismissed = getDismissedIds();
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
    }
  } catch {
    // Silently fail on storage errors
  }
}

const FeatureSpotlight: React.FC<FeatureSpotlightProps> = ({ onFeatureClick }) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => getDismissedIds());

  const selectedFeatures = useMemo(() => {
    const available = FEATURE_POOL.filter((f) => !dismissedIds.includes(f.id));
    if (available.length === 0) return [];

    const dayIndex = Math.floor(Date.now() / 86400000);
    const picks: SpotlightFeature[] = [];

    for (let i = 0; i < 3 && i < available.length; i++) {
      const idx = (dayIndex + i) % available.length;
      const pick = available[idx];
      if (!picks.find((p) => p.id === pick.id)) {
        picks.push(pick);
      } else {
        const fallback = available.find((f) => !picks.find((p) => p.id === f.id));
        if (fallback) picks.push(fallback);
      }
    }

    return picks;
  }, [dismissedIds]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissSpotlight(id);
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleClick = (feature: SpotlightFeature) => {
    if (onFeatureClick) {
      onFeatureClick(feature.id);
    }
  };

  if (selectedFeatures.length === 0) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-lime" />
        <h2 className="text-xl tracking-wide text-white font-bebas">Discover</h2>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {selectedFeatures.map((feature, index) => {
          const IconComp = feature.icon;
          const isFeatureOfDay = index === 0;

          return (
            <div
              key={feature.id}
              onClick={() => handleClick(feature)}
              className={`relative group cursor-pointer rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                isFeatureOfDay
                  ? 'bg-gradient-to-br from-brand-lime/10 to-cyan-500/10 border border-transparent'
                  : 'bg-brand-slate/50 border border-slate-700/30 hover:border-slate-600/50'
              }`}
              style={
                isFeatureOfDay
                  ? {
                      borderImage: 'linear-gradient(135deg, #84cc16, #06b6d4) 1',
                      borderImageSlice: 1,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }
                  : undefined
              }
            >
              {/* Dismiss Button */}
              <button
                onClick={(e) => handleDismiss(feature.id, e)}
                className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-all"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Feature of the Day Badge */}
              {isFeatureOfDay && (
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-lime/20 text-brand-lime border border-brand-lime/30">
                    Feature of the Day
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  isFeatureOfDay
                    ? 'bg-brand-lime/20 text-brand-lime'
                    : 'bg-slate-800/80 text-slate-400 group-hover:text-brand-lime group-hover:bg-brand-lime/10'
                } transition-colors`}
              >
                <IconComp className="w-5 h-5" />
              </div>

              {/* Content */}
              <h3 className="font-bold text-sm text-white mb-1">{feature.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{feature.description}</p>

              {/* CTA */}
              <div className="flex items-center gap-1 text-xs text-brand-lime font-medium group-hover:gap-2 transition-all">
                <span>Try it</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureSpotlight;
