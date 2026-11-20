// Primary navigation configuration. Extracted from constants.tsx so the
// icon-heavy nav table has its own home.
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
  Activity,
  GitCompare,
  Bell,
  Kanban,
  ScanEye,
  Landmark,
  Link2,
  Tv,
  Users,
  Share2,
  BookHeart,
  KeyRound,
  MapPin,
  Sparkles,
  Shield,
  Play,
  Zap,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'collection', label: 'Collection', icon: <Layers size={20} />, path: '/collection' },
  { id: 'builder', label: 'Portfolio Builder', icon: <Kanban size={20} />, path: '/builder' },
  { id: 'deepsearch', label: 'Deep Intelligence', icon: <Search size={20} />, path: '/deep-search' },
  { id: 'audit', label: 'Portfolio Audit', icon: <GitCompare size={20} />, path: '/audit' },
  { id: 'mlbstats', label: 'PressBox Hub', icon: <Trophy size={20} />, path: '/mlb-stats' },
  { id: 'prospects', label: 'Prospect Trends', icon: <TrendingUp size={20} />, path: '/prospects' },
  { id: 'favorites', label: 'Watchlist', icon: <Star size={20} />, path: '/favorites' },
  { id: 'players', label: 'Players', icon: <Search size={20} />, path: '/players' },
  { id: 'teams', label: 'Teams', icon: <Target size={20} />, path: '/teams' },
  { id: 'games', label: 'Games', icon: <Activity size={20} />, path: '/games' },
  { id: 'trends', label: 'Trends', icon: <TrendingUp size={20} />, path: '/trends' },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} />, path: '/leaderboard' },
  { id: 'compare', label: 'Compare', icon: <GitCompare size={20} />, path: '/compare' },
  { id: 'warroom', label: 'Analyst War Room', icon: <Activity size={20} />, path: '/war-room' },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={20} />, path: '/alerts' },
  { id: 'visiongrading', label: 'Vision Grading Lab', icon: <ScanEye size={20} />, path: '/grading-vision-engine' },
  { id: 'fractionalvault', label: 'Fractional Vault', icon: <Landmark size={20} />, path: '/fractional-vault' },
  { id: 'provenance', label: 'Provenance Chain', icon: <Link2 size={20} />, path: '/provenance' },
  { id: 'livebreaks', label: 'Live Breaks', icon: <Tv size={20} />, path: '/live-breaks' },
  // Phases 104-113: Industry-First
  { id: 'copy-trading', label: 'Copy Trading', icon: <Users size={20} />, path: '/copy-trading' },
  { id: 'liquidity-twin', label: 'Liquidity Twin', icon: <Zap size={20} />, path: '/liquidity-twin' },
  { id: 'counterparty-trust-graph', label: 'Trust Graph', icon: <Share2 size={20} />, path: '/counterparty-trust-graph' },
  { id: 'portfolio-scenario-theater', label: 'Scenario Theater', icon: <Activity size={20} />, path: '/portfolio-scenario-theater' },
  { id: 'private-deal-room-agent', label: 'Private Deal Room', icon: <Shield size={20} />, path: '/private-deal-room-agent' },
  { id: 'catalyst-market', label: 'Catalyst Market', icon: <TrendingUp size={20} />, path: '/catalyst-market' },
  { id: 'collection-narrative', label: 'Heritage Story', icon: <BookHeart size={20} />, path: '/collection-narrative' },
  // Phases 114-128: Next-Gen
  { id: 'api-licensing', label: 'API & Licensing', icon: <KeyRound size={20} />, path: '/api-licensing' },
  { id: 'card-show-mode', label: 'Card Show Mode', icon: <MapPin size={20} />, path: '/card-show-mode' },
  { id: 'local-card-shows', label: 'Local Shows', icon: <MapPin size={20} />, path: '/local-card-shows' },
  // Phases 129-138: Competitive Differentiators
  // Phases 139-148: Production-Grade Expansion
  // Phases 149-158: Advanced Platform Features
  { id: 'frontier-lab', label: 'Frontier Lab', icon: <Sparkles size={20} />, path: '/frontier-lab' },
  // Phases 159-168: Competitive Feature Suite
  { id: 'billing', label: 'Billing', icon: <CreditCard size={20} />, path: '/billing' },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  // v4.0: Multi-Sport League Hubs
  // v4.0: Multi-Sport & Infrastructure
  { id: 'grading-vision-engine', label: 'Vision Grading', icon: <ScanEye size={20} />, path: '/grading-vision-engine' },
  // v4.0: Industry-First Features
  // v5.0: Next-Gen Investment Intelligence (Batch 1)
  { id: 'fractional-vault', label: 'Fractional Vault', icon: <Landmark size={20} />, path: '/fractional-vault' },
  // v5.0: Next-Gen Investment Intelligence (Batch 2)
  // v5.1: Beyond-Competition Intelligence (Batch 3)
  // v6.0: Industry-Absent Innovation Suite
  // Advanced Trading & Analysis — Wired
  // Institutional & Operations
  // Trading & Marketplace
  // Analytics & Intelligence
  // Portfolio & Financial
  // Showcase & Labs
  // Interactive Demo Flow
  { id: 'demo-flow', label: 'Demo Flow', icon: <Play size={20} />, path: '/demo-flow' },
  // v6.1: Industry-Absent Innovation — Round 2 (Analytics & Intelligence)
  // v6.1: Industry-Absent Innovation — Round 2 (Trading & Marketplace)
  // v6.1: Industry-Absent Innovation — Round 2 (Portfolio & Financial)
  // v6.1: Industry-Absent Innovation — Round 2 (Showcase & Labs)
  // v7.0: Industry-Absent Innovation — Round 3 (Compliance & Regulation)
  // v7.0: Industry-Absent Innovation — Round 3 (Authentication & Material Science)
  // v7.0: Industry-Absent Innovation — Round 3 (Market Intelligence)
  // v7.0: Industry-Absent Innovation — Round 3 (Trading & Strategy)
  // v7.1: Industry-Absent Innovation — Round 4 (Authentication & Grading)
  // v7.1: Industry-Absent Innovation — Round 4 (Market Intelligence)
  // v7.1: Industry-Absent Innovation — Round 4 (Trading & Financial)
  // v7.1: Industry-Absent Innovation — Round 4 (Tools & Experience)
  // Formerly coming-soon features — now live
];
