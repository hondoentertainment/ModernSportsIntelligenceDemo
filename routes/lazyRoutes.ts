// ─── Lazy-loaded Page Components ──────────────────────────────────────
// Extracted from App.tsx so the router file stays focused on layout and
// route wiring. Critical path: Dashboard loads first, everything else is
// code-split via React.lazy() and resolved on first navigation.
import { lazy } from 'react';

// Core pages (most frequently accessed)
export const Dashboard = lazy(() => import('../pages/Dashboard.tsx'));
export const Collection = lazy(() => import('../pages/Collection.tsx'));
export const Favorites = lazy(() => import('../pages/Favorites.tsx'));
export const Profile = lazy(() => import('../pages/Profile.tsx'));

// Search & analysis pages
export const DeepSearch = lazy(() => import('../pages/DeepSearch.tsx'));
export const PortfolioAudit = lazy(() => import('../pages/PortfolioAudit.tsx'));
export const MLBStats = lazy(() => import('../pages/MLBStats.tsx'));
export const ProspectTrends = lazy(() => import('../pages/ProspectTrends.tsx'));

// Player & team pages
export const Players = lazy(() => import('../pages/Players.tsx'));
export const PlayerDetail = lazy(() => import('../pages/PlayerDetail.tsx'));
export const Teams = lazy(() => import('../pages/Teams.tsx'));
export const Games = lazy(() => import('../pages/Games.tsx'));
export const Trends = lazy(() => import('../pages/Trends.tsx'));
export const Compare = lazy(() => import('../pages/Compare.tsx'));

// Portfolio & financial pages
export const PortfolioBuilder = lazy(() => import('../pages/PortfolioBuilder.tsx'));
export const Billing = lazy(() => import('../pages/Billing.tsx'));
export const Leaderboard = lazy(() => import('../pages/Leaderboard.tsx'));

// Alerts & tools
export const Alerts = lazy(() => import('../pages/Alerts.tsx'));
export const AnalystWarRoom = lazy(() => import('../components/AnalystWarRoom.tsx'));
export const GuildDashboard = lazy(() => import('../pages/GuildDashboard.tsx'));

// Feature discovery and release-ready advanced features
export const FeatureDirectory = lazy(() => import('../pages/FeatureDirectory.tsx'));
export const CollectionNarrative = lazy(() => import('../pages/CollectionNarrative.tsx'));
export const LiquidityTwin = lazy(() => import('../pages/LiquidityTwin.tsx'));
export const CatalystMarket = lazy(() => import('../pages/CatalystMarket.tsx'));
export const CounterpartyTrustGraph = lazy(() => import('../pages/CounterpartyTrustGraph.tsx'));
export const PortfolioScenarioTheater = lazy(() => import('../pages/PortfolioScenarioTheater.tsx'));
export const PrivateDealRoomAgent = lazy(() => import('../pages/PrivateDealRoomAgent.tsx'));
export const CollectorAuditDossier = lazy(() => import('../pages/CollectorAuditDossier.tsx'));

// Phases 114-128: Next-gen features
export const ApiLicensing = lazy(() => import('../pages/ApiLicensing.tsx'));
export const CardShowModePage = lazy(() => import('../pages/CardShowModePage.tsx'));

// Phases 129-138: Competitive differentiators

// Phases 139-148: Production-grade expansion

// Phases 149-158: Advanced platform features

// Phases 159-168: Competitive Feature Suite

// Phases 169-178: Next-gen platform features
export const SetCompletionPage = lazy(() => import('../pages/SetCompletion.tsx'));

// Phases 179-188: Engagement & monetization features
export const SlabVerification = lazy(() => import('../pages/SlabVerification.tsx'));

// v4.0: Multi-Sport League Hubs

// v4.0: Multi-Sport & Infrastructure
export const GradingVisionEngine = lazy(() => import('../pages/GradingVisionEngine.tsx'));

// v4.0: Industry-First Features

// v5.0: Next-Gen Investment Intelligence (Batch 1)
export const FractionalVault = lazy(() => import('../pages/FractionalVault.tsx'));

// v5.0: Next-Gen Investment Intelligence (Batch 2)

// v5.1: Beyond-Competition Intelligence (Batch 3)

// v5.0: Industry-First Features — Round 3 (Phases 134-143)

// v6.0: Industry-Absent Innovation Suite (10 features)

// v6.1: Industry-Absent Innovation — Round 2

// v7.0: Industry-Absent Innovation — Round 3 (Phases 224-233)

// v7.1: Industry-Absent Innovation — Round 4 (Phases 234-253)

// v8.0: Industry-Absent Innovation — Frontier Phase (Phases 254-263)

// v9.0: Industry Phases — Group & Enterprise Scale (Phases 264-273)
export const AuditTrail = lazy(() => import('../pages/AuditTrail.tsx'));

// v10.0: Group Scale Phase 2 — Community Infrastructure (Phases 274-283)

// v5.1+: PRD 4.11 — Next set of features not in the industry (Frontier)

// v5.2: Next 10 industry-absent features (PRD 4.12)

// Formerly coming-soon features — now live

// Industry-first new features (v11)

// Previously unrouted pages — Advanced Trading & Analysis
export const CopyTrading = lazy(() => import('../pages/CopyTrading.tsx'));

// Previously unrouted pages — Institutional & Operations

// Previously unrouted pages — Trading & Marketplace
export const LiveBreaks = lazy(() => import('../pages/LiveBreaks.tsx'));

// Previously unrouted pages — Analytics & Intelligence
export const ProvenanceChain = lazy(() => import('../pages/ProvenanceChain.tsx'));

// Previously unrouted pages — Portfolio & Financial

// Previously unrouted pages — Showcase & Labs
export const FrontierLab = lazy(() => import('../pages/FrontierLab.tsx'));

// Interactive Demo Flow
export const DemoFlowPage = lazy(() => import('../pages/DemoFlow.tsx'));

// Auth pages (public routes, also lazy since not needed after login)
export const Login = lazy(() => import('../pages/Login.tsx'));
export const Signup = lazy(() => import('../pages/Signup.tsx'));
export const ForgotPassword = lazy(() => import('../pages/ForgotPassword.tsx'));
export const ResetPassword = lazy(() => import('../pages/ResetPassword.tsx'));
export const PublicPortfolio = lazy(() => import('../pages/PublicPortfolio.tsx'));
