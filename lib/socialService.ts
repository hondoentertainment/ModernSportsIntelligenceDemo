import { supabase } from './supabase';
import { CardInventory, LeaderboardEntry, UserProfile } from '../types';
import { MOCK_CARDS } from '../constants';

// Mock data for demo purposes since we don't have a backend filled with users yet
const MOCK_USERS: UserProfile[] = [
    {
        id: 'user-1',
        username: 'sportsking',
        displayName: 'Sports King',
        bio: 'Collecting only the finest 90s inserts.',
        isPublic: true,
        joinedAt: '2023-01-15',
        alphaScore: 92,
        portfolioValue: 145000,
        roi: 24.5,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        tier: 'Whale'
    },
    {
        id: 'user-2',
        username: 'gem_mint_jay',
        displayName: 'Jay The Grader',
        bio: 'PSA 10 or bust.',
        isPublic: true,
        joinedAt: '2023-03-22',
        alphaScore: 88,
        portfolioValue: 89000,
        roi: 18.2,
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
        tier: 'Shark'
    },
    {
        id: 'user-3',
        username: 'bitcoin_baseball',
        displayName: 'Crypto Slugger',
        bio: 'Diversifying into cardboard.',
        isPublic: true,
        joinedAt: '2023-06-10',
        alphaScore: 75,
        portfolioValue: 210000,
        roi: -2.4,
        avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
        tier: 'Collector'
    }
];

export async function fetchPublicProfile(username: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        username: data.username,
        displayName: data.display_name,
        bio: data.bio,
        isPublic: data.is_public,
        joinedAt: data.created_at,
        alphaScore: data.alpha_score || 0,
        portfolioValue: data.total_portfolio_value || 0,
        roi: data.total_roi || 0,
        avatarUrl: data.avatar_url,
        tier: data.tier || 'Collector'
    };
}

export async function fetchPublicInventory(userId: string): Promise<CardInventory[]> {
    const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active'); // Only show active holdings publicly

    if (error) return [];

    // Use the dbToCard helper if available, or manual map
    return (data || []).map(row => ({
        id: row.id,
        player: row.player,
        year: row.year,
        manufacturer: row.manufacturer,
        cardNumber: row.card_number,
        set: row.set_name,
        sport: row.sport,
        league: row.league,
        isAutographed: row.is_autographed,
        condition: row.condition,
        isGraded: row.is_graded,
        gradingCompany: row.grading_company,
        grade: row.grade,
        purchasePrice: row.purchase_price,
        purchaseDate: row.purchase_date,
        currentValue: row.current_value,
        lastValuationDate: row.last_valuation_date,
        image: row.image_url,
        notes: row.notes,
        searchUrl: row.search_url,
        taxBasis: row.tax_basis,
        gradingFees: row.grading_fees,
        shippingFees: row.shipping_fees,
        group: row.card_group,
        groupOrder: row.group_order,
        pricingRationale: row.pricing_rationale,
    }));
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('alpha_score', { ascending: false })
        .limit(20);

    if (error) return [];

    return (data || []).map((row, index) => ({
        rank: index + 1,
        user: {
            id: row.id,
            username: row.username,
            displayName: row.display_name,
            bio: row.bio,
            isPublic: row.is_public,
            joinedAt: row.created_at,
            alphaScore: row.alpha_score || 0,
            portfolioValue: row.total_portfolio_value || 0,
            roi: row.total_roi || 0,
            avatarUrl: row.avatar_url,
            tier: row.tier || 'Collector'
        },
        alphaScore: row.alpha_score || 0,
        change24h: 0 // In a real app this would come from a separate trend table
    }));
}

export function generateShareLink(username: string): string {
    return `${window.location.origin}/#/p/${username}`;
}
