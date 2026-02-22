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
    // In a real app:
    // const { data } = await supabase.from('profiles').select('*').eq('username', username).single();
    // return data;

    // For demo:
    return MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function fetchPublicInventory(userId: string): Promise<CardInventory[]> {
    // In a real app:
    // const { data } = await supabase.from('cards').select('*').eq('user_id', userId);

    // For demo, return a random subset of MOCK_CARDS to simulate different portfolios
    const seed = userId.charCodeAt(userId.length - 1);
    const start = seed % 5;
    return MOCK_CARDS.slice(start, start + 10);
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    // In a real app:
    // supabase.rpc('get_leaderboard')

    return MOCK_USERS.map((user, index) => ({
        rank: index + 1,
        user,
        alphaScore: user.alphaScore,
        change24h: (Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1)
    })).sort((a, b) => b.alphaScore - a.alphaScore).map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export function generateShareLink(username: string): string {
    return `${window.location.origin}/#/p/${username}`;
}
