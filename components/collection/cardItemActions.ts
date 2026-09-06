import {
  AlertTriangle,
  Award,
  BarChart3,
  BriefcaseBusiness,
  DollarSign,
  Edit3,
  Eye,
  FileText,
  LineChart,
  Package,
  Search,
  Sparkles,
  Star,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { CardInventory } from '../../types';

export interface CardItemActionHandlers {
  isFavorite: (_id: string) => boolean;
  toggleFavorite: (_c: CardInventory) => void;
  deleteCard: (_id: string) => void;
  setEditingAsset: (_c: CardInventory | null) => void;
  setIsAssetModalOpen: (_v: boolean) => void;
  handleAddToWatchlist: (_c: CardInventory) => void;
  handleUpdatePrice: (_c: CardInventory) => void;
  isPricing: string | null;
  onOpenExitStrategy?: (_card: CardInventory) => void;
  onOpenGradingCalc?: (_card: CardInventory) => void;
  onOpenBreakEven?: (_card: CardInventory) => void;
  onInstantBuy?: (_card: CardInventory) => void;
  onOpenPredictive?: (_card: CardInventory) => void;
  onOpenThesis?: (_card: CardInventory) => void;
  onOpenMarketDepth?: (_card: CardInventory) => void;
  onOpenTaxLot?: (_card: CardInventory) => void;
  onOpenGradePrediction?: (_card: CardInventory) => void;
  onOpenPriceHistory?: (_card: CardInventory) => void;
  onOpenConsignment?: (_card: CardInventory) => void;
  onOpenAnomaly?: (_card: CardInventory) => void;
  onOpenDossier?: (_card: CardInventory) => void;
}

export type CardItemActionId =
  | 'favorite'
  | 'edit'
  | 'delete'
  | 'watchlist'
  | 'sold'
  | 'updatePrice'
  | 'exitStrategy'
  | 'predictive'
  | 'thesis'
  | 'marketDepth'
  | 'gradingCalc'
  | 'gradePrediction'
  | 'breakEven'
  | 'taxLot'
  | 'priceHistory'
  | 'consignment'
  | 'anomaly'
  | 'instantBuy'
  | 'dossier'
  | 'ebay';

export type CardItemActionSurface = 'overlay' | 'body' | 'list';

export type CardItemActionTone = 'default' | 'danger' | 'favorite' | 'lime' | 'accent';

export interface CardItemAction {
  id: CardItemActionId;
  label: string;
  icon: LucideIcon;
  surfaces: CardItemActionSurface[];
  onClick?: () => void;
  href?: string;
  busy?: boolean;
  persistVisible?: boolean;
  tone: CardItemActionTone;
  iconClassName?: string;
}

/** Single source of truth for per-card actions shared by grid and list. */
export function getCardItemActions(
  card: CardInventory,
  handlers: CardItemActionHandlers,
): CardItemAction[] {
  const favorited = handlers.isFavorite(card.id);
  const pricing = handlers.isPricing === card.id;
  const notSold = card.status !== 'sold';
  const canConsign = notSold && card.status !== 'consignment';

  const actions: CardItemAction[] = [
    {
      id: 'favorite',
      label: favorited ? 'Remove from favorites' : 'Add to favorites',
      icon: Star,
      surfaces: ['overlay', 'list'],
      onClick: () => handlers.toggleFavorite(card),
      persistVisible: favorited,
      tone: 'favorite',
    },
    {
      id: 'edit',
      label: 'Edit asset',
      icon: Edit3,
      surfaces: ['overlay', 'list'],
      onClick: () => {
        handlers.setEditingAsset(card);
        handlers.setIsAssetModalOpen(true);
      },
      tone: 'default',
    },
    {
      id: 'delete',
      label: 'Delete asset',
      icon: Trash2,
      surfaces: ['overlay', 'list'],
      onClick: () => handlers.deleteCard(card.id),
      tone: 'danger',
    },
    {
      id: 'watchlist',
      label: 'Add to Watchlist',
      icon: Target,
      surfaces: ['overlay', 'list'],
      onClick: () => handlers.handleAddToWatchlist(card),
      tone: 'accent',
    },
    {
      id: 'sold',
      label: 'Mark as Sold',
      icon: Tag,
      surfaces: ['overlay', 'list'],
      onClick: () => {
        handlers.setEditingAsset({ ...card, status: 'sold' });
        handlers.setIsAssetModalOpen(true);
      },
      tone: 'danger',
    },
    {
      id: 'updatePrice',
      label: 'Intelligence Check',
      icon: Sparkles,
      surfaces: ['body', 'list'],
      onClick: () => handlers.handleUpdatePrice(card),
      busy: pricing,
      tone: 'default',
      iconClassName: 'text-brand-lime',
    },
    {
      id: 'exitStrategy',
      label: 'Exit strategy',
      icon: TrendingUp,
      surfaces: ['list'],
      onClick: () => handlers.onOpenExitStrategy?.(card),
      tone: 'default',
      iconClassName: 'text-brand-green',
    },
    {
      id: 'predictive',
      label: 'Price Trajectory',
      icon: Target,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenPredictive?.(card),
      tone: 'default',
      iconClassName: 'text-brand-teal',
    },
    {
      id: 'thesis',
      label: 'Agent Thesis',
      icon: Users,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenThesis?.(card),
      tone: 'default',
      iconClassName: 'text-brand-blue',
    },
    {
      id: 'marketDepth',
      label: 'Market Depth',
      icon: BarChart3,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenMarketDepth?.(card),
      tone: 'default',
      iconClassName: 'text-brand-green',
    },
    {
      id: 'gradingCalc',
      label: 'Grade Premium Calc',
      icon: Award,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenGradingCalc?.(card),
      tone: 'default',
      iconClassName: 'text-brand-lime',
    },
    {
      id: 'gradePrediction',
      label: 'Grade Prediction',
      icon: Eye,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenGradePrediction?.(card),
      tone: 'default',
      iconClassName: 'text-purple-400',
    },
    {
      id: 'breakEven',
      label: 'Break-Even Calc',
      icon: DollarSign,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenBreakEven?.(card),
      tone: 'default',
      iconClassName: 'text-brand-orange',
    },
    {
      id: 'taxLot',
      label: 'Tax Lot Analysis',
      icon: FileText,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenTaxLot?.(card),
      tone: 'default',
      iconClassName: 'text-brand-orange',
    },
    {
      id: 'priceHistory',
      label: 'Price History',
      icon: LineChart,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenPriceHistory?.(card),
      tone: 'default',
      iconClassName: 'text-cyan-400',
    },
    {
      id: 'consignment',
      label: 'Consignment',
      icon: Package,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenConsignment?.(card),
      tone: 'default',
      iconClassName: 'text-amber-400',
    },
    {
      id: 'anomaly',
      label: 'Anomaly Check',
      icon: AlertTriangle,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenAnomaly?.(card),
      tone: 'default',
      iconClassName: 'text-rose-400',
    },
    {
      id: 'instantBuy',
      label: 'Instant Sell to MSI House',
      icon: Zap,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onInstantBuy?.(card),
      tone: 'lime',
    },
    {
      id: 'dossier',
      label: 'Audit Dossier',
      icon: BriefcaseBusiness,
      surfaces: ['body', 'list'],
      onClick: () => handlers.onOpenDossier?.(card),
      tone: 'default',
      iconClassName: 'text-cyan-300',
    },
    {
      id: 'ebay',
      label: 'Verify on eBay',
      icon: Search,
      surfaces: ['body', 'list'],
      href: card.searchUrl,
      tone: 'lime',
    },
  ];

  return actions.filter(action => {
    switch (action.id) {
      case 'sold':
        return notSold;
      case 'exitStrategy':
        return !!handlers.onOpenExitStrategy;
      case 'predictive':
        return !!handlers.onOpenPredictive;
      case 'thesis':
        return !!handlers.onOpenThesis;
      case 'marketDepth':
        return !!handlers.onOpenMarketDepth;
      case 'gradingCalc':
        return !card.isGraded && !!handlers.onOpenGradingCalc;
      case 'gradePrediction':
        return !card.isGraded && !!handlers.onOpenGradePrediction;
      case 'breakEven':
        return !!handlers.onOpenBreakEven;
      case 'taxLot':
        return !!handlers.onOpenTaxLot;
      case 'priceHistory':
        return !!handlers.onOpenPriceHistory;
      case 'consignment':
        return canConsign && !!handlers.onOpenConsignment;
      case 'anomaly':
        return !!handlers.onOpenAnomaly;
      case 'instantBuy':
        return notSold && !!handlers.onInstantBuy;
      case 'dossier':
        return !!handlers.onOpenDossier;
      case 'ebay':
        return !!card.searchUrl;
      default:
        return true;
    }
  });
}

export function getCardItemActionsForSurface(
  card: CardInventory,
  handlers: CardItemActionHandlers,
  surface: CardItemActionSurface,
): CardItemAction[] {
  return getCardItemActions(card, handlers).filter(action => action.surfaces.includes(surface));
}
