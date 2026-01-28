
import { CardInventory } from '../types.ts';

export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Grail' | 'OneOfOne';

export const getRarityTier = (card: CardInventory): RarityTier => {
    // Check for 1/1 explicitly in notes or parallel info (simple check for now)
    const isOneOfOne = card.set?.toLowerCase().includes('1/1') ||
        card.set?.toLowerCase().includes('one of one') ||
        card.cardNumber === '1/1';

    if (isOneOfOne) return 'OneOfOne';

    const value = card.currentValue || card.purchasePrice || 0;

    if (value >= 10000) return 'Grail';
    if (value >= 1000) return 'Ultra Rare';
    if (value >= 500) return 'Rare';
    if (value >= 100) return 'Uncommon';
    return 'Common';
};

export const getTierStyles = (tier: RarityTier) => {
    switch (tier) {
        case 'OneOfOne':
            return {
                border: 'border-brand-lime shadow-[0_0_30px_rgba(217,249,157,0.3)]',
                badge: 'bg-brand-lime text-brand-charcoal animate-pulse',
                glow: 'from-brand-lime/20 via-white/10 to-brand-lime/20 animate-text-shimmer',
                text: 'text-brand-lime'
            };
        case 'Grail':
            return {
                border: 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]',
                badge: 'bg-purple-500 text-white',
                glow: 'from-purple-500/20 via-fuchsia-500/20 to-purple-500/20 animate-pulse',
                text: 'text-purple-400'
            };
        case 'Ultra Rare':
            return {
                border: 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]',
                badge: 'bg-amber-400 text-brand-charcoal',
                glow: 'from-amber-400/20 via-yellow-200/10 to-amber-400/20',
                text: 'text-amber-400'
            };
        case 'Rare':
            return {
                border: 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)]',
                badge: 'bg-blue-400 text-brand-charcoal',
                glow: 'bg-blue-400/10',
                text: 'text-blue-400'
            };
        case 'Uncommon':
            return {
                border: 'border-brand-green/60',
                badge: 'bg-brand-green text-brand-charcoal',
                glow: 'bg-brand-green/10',
                text: 'text-brand-green'
            };
        default:
            return {
                border: 'border-slate-800 hover:border-brand-lime/40',
                badge: 'bg-slate-700 text-slate-300',
                glow: '',
                text: 'text-white'
            };
    }
};
