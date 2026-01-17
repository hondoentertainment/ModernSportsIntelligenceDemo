
import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Target, 
  TrendingUp, 
  Trophy, 
  Star, 
  Search,
  Settings,
  CreditCard,
  History,
  Activity,
  Zap,
  GitCompare,
  Bell
} from 'lucide-react';
import { CardInventory, Sport } from './types.ts';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'collection', label: 'Collection', icon: <Layers size={20} />, path: '/collection' },
  { id: 'mlbstats', label: 'MLB Stats', icon: <Trophy size={20} />, path: '/mlb-stats' },
  { id: 'prospects', label: 'Prospect Trends', icon: <TrendingUp size={20} />, path: '/prospects' },
  { id: 'favorites', label: 'Watchlist', icon: <Star size={20} />, path: '/favorites' },
  { id: 'players', label: 'Players', icon: <Search size={20} />, path: '/players' },
  { id: 'teams', label: 'Teams', icon: <Target size={20} />, path: '/teams' },
  { id: 'games', label: 'Games', icon: <Activity size={20} />, path: '/games' },
  { id: 'trends', label: 'Trends', icon: <TrendingUp size={20} />, path: '/trends' },
  { id: 'compare', label: 'Compare', icon: <GitCompare size={20} />, path: '/compare' },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={20} />, path: '/alerts' },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
];

export const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

export const GRADING_COMPANIES = ['PSA', 'BGS', 'SGC', 'CSG', 'HGA', 'Other'];

export const MOCK_CARDS: CardInventory[] = [
  {
    id: '1',
    player: 'Adley Rutschman',
    year: 2022,
    manufacturer: 'Topps',
    cardNumber: '660',
    set: 'Series 2',
    sport: 'Baseball',
    isAutographed: false,
    condition: 'Near Mint',
    isGraded: true,
    gradingCompany: 'PSA',
    grade: '10',
    purchasePrice: 125,
    purchaseDate: '2023-10-15',
    currentValue: 185,
    lastValuationDate: '2024-02-10',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '2',
    player: 'Elly De La Cruz',
    year: 2023,
    manufacturer: 'Bowman',
    cardNumber: 'BCP-50',
    set: 'Chrome',
    sport: 'Baseball',
    isAutographed: true,
    condition: 'Mint',
    isGraded: false,
    purchasePrice: 450,
    purchaseDate: '2023-11-20',
    currentValue: 520,
    lastValuationDate: '2024-02-12',
    image: 'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?auto=format&fit=crop&q=80&w=300'
  }
];

export const MOCK_PLAYERS = [
  {
    id: '1',
    name: 'Victor Wembanyama',
    team: 'San Antonio Spurs',
    position: 'Center',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=300',
    breakoutScore: 94,
    trend: 12,
    intelligenceScore: 98,
    stats: [
      { label: 'PPG', value: '21.4', change: '+3.2' },
      { label: 'RPG', value: '10.6', change: '+1.5' },
      { label: 'BPG', value: '3.6', change: '+0.8' }
    ],
    summary: 'Generational defensive talent with rapidly evolving offensive bag.',
    marketContext: 'Market is pricing in superstardom; current prices reflect long-term potential.'
  },
  {
    id: '2',
    name: 'Tyrese Haliburton',
    team: 'Indiana Pacers',
    position: 'Guard',
    image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?auto=format&fit=crop&q=80&w=300',
    breakoutScore: 82,
    trend: 5,
    intelligenceScore: 95,
    stats: [
      { label: 'APG', value: '11.7', change: '+2.1' },
      { label: 'PPG', value: '20.1', change: '-1.2' },
      { label: 'TS%', value: '60.5%', change: '+0.5' }
    ],
    summary: 'Elite playmaker whose usage patterns suggest high performance stability.',
    marketContext: 'Strong buy signal for long-term hold collectors.'
  }
];

export const MOCK_TEAMS = [
  {
    id: '1',
    name: 'Oklahoma City Thunder',
    logo: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=100',
    league: 'NBA',
    conference: 'Western',
    division: 'Northwest',
    form: 'hot',
    score: 92,
    summary: 'League-leading defensive rotation speed paired with elite spacing.',
    offense: 88,
    defense: 94,
    momentum: 'up'
  },
  {
    id: '2',
    name: 'Boston Celtics',
    logo: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=100',
    league: 'NBA',
    conference: 'Eastern',
    division: 'Atlantic',
    form: 'hot',
    score: 95,
    summary: 'Historic efficiency metrics across both starting and bench units.',
    offense: 98,
    defense: 92,
    momentum: 'stable'
  }
];

export const MOCK_GAMES = [
  {
    id: '1',
    homeTeam: 'NY Knicks',
    awayTeam: 'PHI 76ers',
    homeLogo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=100',
    awayLogo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?auto=format&fit=crop&q=80&w=100',
    time: '7:30 PM EST',
    impactScore: 88,
    preview: 'High-intensity matchup focusing on interior defensive patterns.',
    keyMatchup: 'Brunson vs. Maxey: A battle of high-speed floor generals.',
    swingFactor: 'Bench depth efficiency in the second quarter.'
  }
];

export const MOCK_INVENTORY_SUMMARY = {
  totalCost: 4500.00,
  marketValue: 7890.50,
  roi: 75.3,
  totalGain: 3390.50,
  realizedProfit: 1250.00,
  realizedSold: 3500.00,
  realizedCogs: 2250.00
};

export const MOCK_INVENTORY_ITEMS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=300',
    cardName: '2023 Bowman Chrome Elly De La Cruz',
    status: 'Graded',
    quantity: 1,
    marketValue: 520,
    purchasePrice: 450
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?auto=format&fit=crop&q=80&w=300',
    cardName: '2022 Topps Adley Rutschman',
    status: 'Graded',
    quantity: 1,
    marketValue: 185,
    purchasePrice: 125
  }
];

export const MOCK_ACQUISITION_TARGETS = [
  {
    id: '1',
    name: 'Jackson Holliday',
    team: 'BAL',
    focus: 'Prospect',
    marketTrend: 'rising',
    confidence: 92,
    reason: 'Underlying contact metrics suggest elite MLB transition floor.',
    targetPrice: 250
  }
];
