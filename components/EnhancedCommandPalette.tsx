import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Clock,
  ArrowRight,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  CreditCard,
  Receipt,
  Users,
  Library,
  Zap,
  Star,
  Shield,
  Trophy,
  Target,
  Wallet,
  Globe,
  Bell,
  Settings,
  FileText,
  PieChart,
  Layers,
  Activity,
  BookOpen,
  Briefcase,
  Calculator,
  Camera,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Crown,
  Database,
  Flame,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  History,
  Home,
  Image,
  Inbox,
  LineChart,
  ListChecks,
  Lock,
  Map,
  MessageSquare,
  Mic,
  Package,
  Percent,
  Play,
  RefreshCw,
  Rocket,
  Scale,
  Scan,
  Share2,
  ShoppingCart,
  Sparkles,
  Tag,
  ThumbsUp,
  Timer,
  Tv,
  Upload,
  UserPlus,
  Vote,
  Wrench,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  action: 'navigate' | 'open-modal';
  route?: string;
}

interface EnhancedCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  CreditCard,
  Receipt,
  Users,
  Library,
  Zap,
  Star,
  Shield,
  Trophy,
  Target,
  Wallet,
  Globe,
  Bell,
  Settings,
  FileText,
  PieChart,
  Layers,
  Activity,
  BookOpen,
  Briefcase,
  Calculator,
  Camera,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Crown,
  Database,
  Flame,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  History,
  Home,
  Image,
  Inbox,
  LineChart,
  ListChecks,
  Lock,
  Map,
  MessageSquare,
  Mic,
  Package,
  Percent,
  Play,
  RefreshCw,
  Rocket,
  Scale,
  Scan,
  Share2,
  ShoppingCart,
  Sparkles,
  Tag,
  ThumbsUp,
  Timer,
  Tv,
  Upload,
  UserPlus,
  Vote,
  Wrench,
  Search,
  Clock,
  ArrowRight,
  X,
};

const CATEGORY_COLORS: Record<string, string> = {
  Navigation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Analytics: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Trading: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  Grading: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Tax & Finance': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Social: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Collection: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Quick Actions': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const FEATURE_INDEX: CommandItem[] = [
  // Navigation
  { id: 'nav-dashboard', label: 'Dashboard', description: 'Go to main dashboard overview', category: 'Navigation', icon: 'Home', action: 'navigate', route: '/' },
  { id: 'nav-portfolio', label: 'Portfolio', description: 'View your card portfolio', category: 'Navigation', icon: 'Briefcase', action: 'navigate', route: '/portfolio' },
  { id: 'nav-marketplace', label: 'Marketplace', description: 'Browse the card marketplace', category: 'Navigation', icon: 'ShoppingCart', action: 'navigate', route: '/marketplace' },
  { id: 'nav-watchlist', label: 'Watchlist', description: 'View your watched cards and players', category: 'Navigation', icon: 'Star', action: 'navigate', route: '/watchlist' },
  { id: 'nav-settings', label: 'Settings', description: 'Manage your account settings', category: 'Navigation', icon: 'Settings', action: 'navigate', route: '/settings' },
  { id: 'nav-profile', label: 'Profile', description: 'View and edit your profile', category: 'Navigation', icon: 'Users', action: 'navigate', route: '/profile' },
  { id: 'nav-notifications', label: 'Notifications', description: 'Check your notifications', category: 'Navigation', icon: 'Bell', action: 'navigate', route: '/notifications' },
  { id: 'nav-help', label: 'Help Center', description: 'Get help and documentation', category: 'Navigation', icon: 'BookOpen', action: 'navigate', route: '/help' },
  { id: 'nav-leaderboard', label: 'Leaderboard', description: 'View top collectors and traders', category: 'Navigation', icon: 'Crown', action: 'navigate', route: '/leaderboard' },

  // Analytics
  { id: 'analytics-market', label: 'Market Analytics', description: 'Deep market trend analysis and insights', category: 'Analytics', icon: 'BarChart3', action: 'navigate', route: '/analytics/market' },
  { id: 'analytics-portfolio-perf', label: 'Portfolio Performance', description: 'Track portfolio returns and metrics', category: 'Analytics', icon: 'LineChart', action: 'navigate', route: '/analytics/portfolio' },
  { id: 'analytics-price-history', label: 'Price History', description: 'Historical price charts for any card', category: 'Analytics', icon: 'Activity', action: 'navigate', route: '/analytics/price-history' },
  { id: 'analytics-heatmap', label: 'Market Heatmap', description: 'Visual heatmap of market activity', category: 'Analytics', icon: 'Flame', action: 'navigate', route: '/analytics/heatmap' },
  { id: 'analytics-predictions', label: 'AI Predictions', description: 'Machine learning price predictions', category: 'Analytics', icon: 'Sparkles', action: 'navigate', route: '/analytics/predictions' },
  { id: 'analytics-volume', label: 'Volume Analysis', description: 'Trading volume trends and patterns', category: 'Analytics', icon: 'BarChart3', action: 'navigate', route: '/analytics/volume' },
  { id: 'analytics-comparisons', label: 'Card Comparisons', description: 'Compare cards side by side', category: 'Analytics', icon: 'Scale', action: 'navigate', route: '/analytics/comparisons' },
  { id: 'analytics-roi', label: 'ROI Calculator', description: 'Calculate return on investment', category: 'Analytics', icon: 'Calculator', action: 'navigate', route: '/analytics/roi' },
  { id: 'analytics-sentiment', label: 'Market Sentiment', description: 'Social sentiment analysis dashboard', category: 'Analytics', icon: 'ThumbsUp', action: 'navigate', route: '/analytics/sentiment' },

  // Trading
  { id: 'trading-live', label: 'Live Trading', description: 'Real-time trading floor', category: 'Trading', icon: 'TrendingUp', action: 'navigate', route: '/trading' },
  { id: 'trading-orders', label: 'Open Orders', description: 'View and manage open orders', category: 'Trading', icon: 'ListChecks', action: 'navigate', route: '/trading/orders' },
  { id: 'trading-history', label: 'Trade History', description: 'Past transactions and trades', category: 'Trading', icon: 'History', action: 'navigate', route: '/trading/history' },
  { id: 'trading-alerts', label: 'Price Alerts', description: 'Set and manage price alerts', category: 'Trading', icon: 'Bell', action: 'navigate', route: '/trading/alerts' },
  { id: 'trading-offers', label: 'Trade Offers', description: 'Incoming and outgoing trade offers', category: 'Trading', icon: 'ArrowRight', action: 'navigate', route: '/trading/offers' },
  { id: 'trading-arbitrage', label: 'Arbitrage Scanner', description: 'Find cross-platform price differences', category: 'Trading', icon: 'Scan', action: 'navigate', route: '/trading/arbitrage' },
  { id: 'trading-batch', label: 'Batch Listing', description: 'List multiple cards at once', category: 'Trading', icon: 'Layers', action: 'navigate', route: '/trading/batch' },
  { id: 'trading-smart-pricing', label: 'Smart Pricing', description: 'AI-powered pricing suggestions', category: 'Trading', icon: 'Zap', action: 'navigate', route: '/trading/smart-pricing' },
  { id: 'trading-auctions', label: 'Auctions', description: 'Browse and create auctions', category: 'Trading', icon: 'Timer', action: 'navigate', route: '/trading/auctions' },

  // Grading
  { id: 'grading-submit', label: 'Submit for Grading', description: 'Submit cards to grading services', category: 'Grading', icon: 'Upload', action: 'navigate', route: '/grading/submit' },
  { id: 'grading-tracker', label: 'Grading Tracker', description: 'Track grading submission status', category: 'Grading', icon: 'Package', action: 'navigate', route: '/grading/tracker' },
  { id: 'grading-estimator', label: 'Grade Estimator', description: 'AI-powered grade prediction from photos', category: 'Grading', icon: 'Camera', action: 'navigate', route: '/grading/estimator' },
  { id: 'grading-population', label: 'Population Report', description: 'View PSA/BGS population data', category: 'Grading', icon: 'Database', action: 'navigate', route: '/grading/population' },
  { id: 'grading-crossover', label: 'Crossover Calculator', description: 'Estimate crossover grade success', category: 'Grading', icon: 'RefreshCw', action: 'navigate', route: '/grading/crossover' },
  { id: 'grading-compare', label: 'Grade Comparison', description: 'Compare grades across services', category: 'Grading', icon: 'Scale', action: 'navigate', route: '/grading/compare' },
  { id: 'grading-value-impact', label: 'Grade Value Impact', description: 'See how grades affect card value', category: 'Grading', icon: 'TrendingUp', action: 'navigate', route: '/grading/value-impact' },
  { id: 'grading-registry', label: 'Set Registry', description: 'Track graded set completion', category: 'Grading', icon: 'Trophy', action: 'navigate', route: '/grading/registry' },

  // Tax & Finance
  { id: 'tax-dashboard', label: 'Tax Dashboard', description: 'Overview of tax obligations', category: 'Tax & Finance', icon: 'Receipt', action: 'navigate', route: '/tax' },
  { id: 'tax-gains', label: 'Capital Gains Report', description: 'Calculate realized capital gains', category: 'Tax & Finance', icon: 'CircleDollarSign', action: 'navigate', route: '/tax/gains' },
  { id: 'tax-export', label: 'Export Tax Documents', description: 'Export 1099 and tax forms', category: 'Tax & Finance', icon: 'FileText', action: 'navigate', route: '/tax/export' },
  { id: 'tax-lot-tracking', label: 'Tax Lot Tracking', description: 'FIFO/LIFO cost basis tracking', category: 'Tax & Finance', icon: 'Layers', action: 'navigate', route: '/tax/lots' },
  { id: 'finance-budget', label: 'Budget Planner', description: 'Set and track collecting budgets', category: 'Tax & Finance', icon: 'Wallet', action: 'navigate', route: '/finance/budget' },
  { id: 'finance-insurance', label: 'Insurance Valuation', description: 'Generate insurance valuations', category: 'Tax & Finance', icon: 'Shield', action: 'navigate', route: '/finance/insurance' },
  { id: 'finance-expenses', label: 'Expense Tracker', description: 'Track all collecting expenses', category: 'Tax & Finance', icon: 'Coins', action: 'navigate', route: '/finance/expenses' },
  { id: 'finance-projections', label: 'Value Projections', description: 'Forecast future collection value', category: 'Tax & Finance', icon: 'Rocket', action: 'navigate', route: '/finance/projections' },

  // Social
  { id: 'social-feed', label: 'Social Feed', description: 'Community posts and updates', category: 'Social', icon: 'MessageSquare', action: 'navigate', route: '/social' },
  { id: 'social-groups', label: 'Groups', description: 'Join collector communities', category: 'Social', icon: 'Users', action: 'navigate', route: '/social/groups' },
  { id: 'social-share', label: 'Share Collection', description: 'Share your collection publicly', category: 'Social', icon: 'Share2', action: 'navigate', route: '/social/share' },
  { id: 'social-challenges', label: 'Challenges', description: 'Participate in collecting challenges', category: 'Social', icon: 'Target', action: 'navigate', route: '/social/challenges' },
  { id: 'social-live', label: 'Live Breaks', description: 'Watch and join live card breaks', category: 'Social', icon: 'Tv', action: 'navigate', route: '/social/live' },
  { id: 'social-events', label: 'Events Calendar', description: 'Upcoming shows and events', category: 'Social', icon: 'Globe', action: 'navigate', route: '/social/events' },
  { id: 'social-reviews', label: 'Seller Reviews', description: 'Rate and review sellers', category: 'Social', icon: 'ThumbsUp', action: 'navigate', route: '/social/reviews' },
  { id: 'social-podcasts', label: 'Podcasts & Media', description: 'Collecting podcasts and videos', category: 'Social', icon: 'Mic', action: 'navigate', route: '/social/podcasts' },
  { id: 'social-giveaways', label: 'Giveaways', description: 'Enter and host giveaways', category: 'Social', icon: 'Gift', action: 'navigate', route: '/social/giveaways' },

  // Collection
  { id: 'collection-browse', label: 'Browse Collection', description: 'View all cards in your collection', category: 'Collection', icon: 'Library', action: 'navigate', route: '/collection' },
  { id: 'collection-add', label: 'Add Cards', description: 'Add new cards to collection', category: 'Collection', icon: 'UserPlus', action: 'navigate', route: '/collection/add' },
  { id: 'collection-scan', label: 'Scan Card', description: 'Use camera to scan and identify cards', category: 'Collection', icon: 'Scan', action: 'navigate', route: '/collection/scan' },
  { id: 'collection-sets', label: 'Set Tracker', description: 'Track set completion progress', category: 'Collection', icon: 'ListChecks', action: 'navigate', route: '/collection/sets' },
  { id: 'collection-vault', label: 'Vault', description: 'High-security storage tracking', category: 'Collection', icon: 'Lock', action: 'navigate', route: '/collection/vault' },
  { id: 'collection-wishlist', label: 'Wishlist', description: 'Cards you want to acquire', category: 'Collection', icon: 'Heart', action: 'navigate', route: '/collection/wishlist' },
  { id: 'collection-duplicates', label: 'Duplicate Finder', description: 'Find duplicate cards in collection', category: 'Collection', icon: 'Layers', action: 'navigate', route: '/collection/duplicates' },
  { id: 'collection-gallery', label: 'Photo Gallery', description: 'High-res images of your cards', category: 'Collection', icon: 'Image', action: 'navigate', route: '/collection/gallery' },
  { id: 'collection-import', label: 'Import Collection', description: 'Import from CSV or other platforms', category: 'Collection', icon: 'Inbox', action: 'navigate', route: '/collection/import' },

  // Quick Actions
  { id: 'action-quick-add', label: 'Quick Add Card', description: 'Rapidly add a card by name or number', category: 'Quick Actions', icon: 'Zap', action: 'open-modal' },
  { id: 'action-quick-search', label: 'Quick Price Check', description: 'Instantly check a card price', category: 'Quick Actions', icon: 'Search', action: 'open-modal' },
  { id: 'action-quick-trade', label: 'Quick Trade', description: 'Start a quick trade with another user', category: 'Quick Actions', icon: 'ArrowRight', action: 'open-modal' },
  { id: 'action-refresh-prices', label: 'Refresh All Prices', description: 'Update all card prices to latest', category: 'Quick Actions', icon: 'RefreshCw', action: 'open-modal' },
  { id: 'action-export-csv', label: 'Export to CSV', description: 'Export your collection data', category: 'Quick Actions', icon: 'FileText', action: 'open-modal' },
  { id: 'action-snapshot', label: 'Portfolio Snapshot', description: 'Save current portfolio state', category: 'Quick Actions', icon: 'Camera', action: 'open-modal' },
  { id: 'action-random-card', label: 'Random Card', description: 'View a random card from your collection', category: 'Quick Actions', icon: 'Play', action: 'open-modal' },
  { id: 'action-learning', label: 'Learning Center', description: 'Tips and tutorials for new collectors', category: 'Quick Actions', icon: 'GraduationCap', action: 'navigate', route: '/learn' },
  { id: 'action-vote', label: 'Community Polls', description: 'Vote on community topics', category: 'Quick Actions', icon: 'Vote', action: 'navigate', route: '/community/polls' },
];

const STORAGE_KEY = 'msi_recent_commands';

function getRecentCommands(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentCommand(commandId: string): void {
  try {
    const recent = getRecentCommands();
    const updated = [commandId, ...recent.filter((id) => id !== commandId)].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail on storage errors
  }
}

function renderIcon(iconName: string, className?: string): React.ReactNode {
  const IconComponent = ICON_MAP[iconName];
  if (!IconComponent) return <Zap className={className} />;
  return <IconComponent className={className} />;
}

const EnhancedCommandPalette: React.FC<EnhancedCommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const recentCommandIds = useMemo(() => getRecentCommands(), [isOpen]);

  const recentItems = useMemo(() => {
    return recentCommandIds
      .map((id) => FEATURE_INDEX.find((item) => item.id === id))
      .filter(Boolean) as CommandItem[];
  }, [recentCommandIds]);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return FEATURE_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

  const groupedResults = useMemo(() => {
    const items = query.trim() ? filteredResults : recentItems;
    const groups: Record<string, CommandItem[]> = {};
    items.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [query, filteredResults, recentItems]);

  const flatItems = useMemo(() => {
    const items: CommandItem[] = [];
    Object.values(groupedResults).forEach((group) => {
      items.push(...group);
    });
    return items;
  }, [groupedResults]);

  const executeCommand = useCallback(
    (item: CommandItem) => {
      saveRecentCommand(item.id);
      if (item.action === 'navigate' && item.route) {
        navigate(item.route);
      }
      onClose();
    },
    [navigate, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setHighlightIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  useEffect(() => {
    const el = itemRefs.current.get(highlightIndex);
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[highlightIndex]) {
          executeCommand(flatItems[highlightIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [flatItems, highlightIndex, executeCommand, onClose]
  );

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-2xl bg-slate-900/98 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features, commands, cards..."
            className="flex-1 bg-transparent text-white text-lg placeholder-slate-500 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {!query.trim() && recentItems.length === 0 && (
            <div className="px-5 py-10 text-center">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                Start typing to search across all features and commands
              </p>
            </div>
          )}

          {!query.trim() && recentItems.length > 0 && (
            <div className="px-3 pt-3 pb-1">
              <div className="flex items-center gap-2 px-2 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Recent Commands
              </div>
            </div>
          )}

          {query.trim() && flatItems.length === 0 && (
            <div className="px-5 py-10 text-center">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No matching features found</p>
              <p className="text-slate-600 text-xs mt-1">Try a different search term</p>
            </div>
          )}

          {Object.entries(groupedResults).map(([category, items]) => (
            <div key={category} className="px-3 pb-1">
              {query.trim() && (
                <div className="flex items-center gap-2 px-2 py-2 mt-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {category}
                </div>
              )}
              {items.map((item) => {
                flatIndex++;
                const currentIdx = flatIndex;
                const isHighlighted = currentIdx === highlightIndex;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(currentIdx, el);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-brand-lime/10 border border-brand-lime/20'
                        : 'hover:bg-slate-800/60 border border-transparent'
                    }`}
                    onClick={() => executeCommand(item)}
                    onMouseEnter={() => setHighlightIndex(currentIdx)}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isHighlighted ? 'bg-brand-lime/20 text-brand-lime' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {renderIcon(item.icon, 'w-4 h-4')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium text-sm ${
                            isHighlighted ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                            CATEGORY_COLORS[item.category] || 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isHighlighted ? 'text-brand-lime' : 'text-slate-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px] font-mono">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px] font-mono">
                Enter
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px] font-mono">
                Esc
              </kbd>
              Close
            </span>
          </div>
          <div className="text-xs text-slate-600">
            {flatItems.length > 0 ? `${flatItems.length} result${flatItems.length !== 1 ? 's' : ''}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCommandPalette;
