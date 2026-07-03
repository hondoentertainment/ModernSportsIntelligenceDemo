/**
 * Dashboard regression-guard test.
 *
 * Dashboard.tsx is ~1100 lines and depends on ~30 hooks, services, modals
 * and chart libraries — a deep behavioural test would be brittle and
 * expensive.  This file exists as a regression guard for the merge-conflict
 * style breakage that has bitten this page before (duplicate React imports,
 * dangling identifiers, etc.).  All we need to assert is "the page renders
 * its two top-level branches without throwing".
 *
 * Mocking strategy: stub the heavy hooks/services and the widget components
 * that would otherwise reach for the network or recharts measurement; toggle
 * `mockState.inventory` between empty and populated to exercise both
 * branches of the `inventory.length === 0 ? ... : ...` ternary.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// ─── Shared mock state ───────────────────────────────────────────────
// `vi.hoisted` lets the test mutate state that the vi.mock factories read,
// so both the empty and populated branches share one set of stubs.
const mockState = vi.hoisted(() => ({
    inventory: [] as Array<Record<string, unknown>>,
}));

const populatedInventory = [
    {
        id: 'card-1',
        player: 'Mike Trout',
        year: 2011,
        manufacturer: 'Topps Update',
        set: 'US175',
        sport: 'Baseball',
        league: 'MLB',
        condition: 'PSA 10',
        grade: '10',
        gradingCompany: 'PSA',
        isGraded: true,
        purchasePrice: 5000,
        currentValue: 8500,
        image: '',
    },
    {
        id: 'card-2',
        player: 'Shohei Ohtani',
        year: 2018,
        manufacturer: 'Topps Chrome',
        set: 'US1',
        sport: 'Baseball',
        league: 'MLB',
        condition: 'PSA 10',
        grade: '10',
        gradingCompany: 'PSA',
        isGraded: true,
        purchasePrice: 1200,
        currentValue: 3400,
        image: '',
    },
];

// ─── Hook mocks ──────────────────────────────────────────────────────
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-user', email: 'test@example.com' },
        session: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
    }),
}));

vi.mock('../../lib/utils/useSupabaseInventory.ts', () => ({
    useSupabaseInventory: () => ({
        inventory: mockState.inventory,
        targets: [],
        setInventory: vi.fn(),
        setSyncMeta: vi.fn(),
        syncMeta: { lastSyncTime: null, totalValue: 0, assetCount: 0 },
        initializeFullInventory: vi.fn(),
        isCloudSynced: false,
        loading: false,
        persistSyncToCloud: vi.fn(async () => {}),
        syncStatus: 'idle',
        lastSyncError: null,
    }),
}));

vi.mock('../../lib/utils/useAlerts.ts', () => ({
    useAlerts: () => ({
        alerts: [],
        unreadCount: 0,
        syncComplete: vi.fn(),
        portfolioMomentum: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        clearAll: vi.fn(),
        addAlert: vi.fn(),
    }),
}));

vi.mock('../../lib/utils/gemini.ts', () => ({
    generatePortfolioSentiment: vi.fn(async () => 'Sentiment unavailable in tests.'),
}));

vi.mock('../../lib/utils/marketSync.ts', () => ({
    syncPortfolio: vi.fn(async () => ({
        inventory: [],
        result: { updatedCount: 0, totalValue: 0, duration: 0 },
    })),
}));

vi.mock('../../lib/analytics/marketHistory.ts', () => ({
    getHistoricalDelta: vi.fn(() => null),
    getCardHistory: vi.fn(() => []),
}));

vi.mock('../../lib/analytics/aggregationService.ts', () => ({
    AggregationService: {
        calculatePortfolioMetrics: vi.fn(() => ({
            totalValue: 11_900,
            totalCostBasis: 6_200,
            totalROI: 5_700,
            totalROIPercent: 92,
            realizedProfit: 0,
            realizedROI: 0,
            totalGain: 5_700,
            soldCount: 0,
            trend7d: 0,
            trend30d: 0,
            assetCount: 2,
            topPerformers: [],
            underPerformers: [],
            avgLiquidity: 0,
            diversificationScore: 0,
        })),
        getComparisonMetrics: vi.fn(() => ({
            pastValue: 0,
            currentValue: 11_900,
            delta: 0,
            deltaPercent: 0,
        })),
        getAggregatedTrendData: vi.fn(() => []),
    },
}));

vi.mock('../../lib/utils/statsService.ts', () => ({
    StatsService: {
        getPlayerPerformance: vi.fn(async () => null),
    },
}));

// ─── Heavy widget stubs ──────────────────────────────────────────────
// We render `null` for widgets whose internal effects would otherwise
// reach for the network, exercise recharts measurement, or pull in the
// undefined lazy widgets that the populated branch of Dashboard.tsx
// references inside LazyErrorBoundary + Suspense — stubbed below.
vi.mock('../../components/HypeFeed.tsx', () => ({ default: () => null }));
vi.mock('../../components/MarketPulseTable.tsx', () => ({ default: () => null }));
vi.mock('../../components/DeepDiverReport.tsx', () => ({ default: () => null }));
vi.mock('../../components/MacroSentinelWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/WarRoomWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/FiscalHealthWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/StrategyMap.tsx', () => ({ default: () => null }));
vi.mock('../../components/ArbitrageSwarmDashboard.tsx', () => ({ default: () => null }));
vi.mock('../../components/DashboardFeatureWidgets.tsx', () => ({ default: () => null }));
vi.mock('../../components/PricingTruthHealthPanel.tsx', () => ({ default: () => null }));
vi.mock('../../components/CorrelationTerminal.tsx', () => ({
    CorrelationTerminal: () => null,
}));
vi.mock('../../components/HedgeAdvisor.tsx', () => ({ HedgeAdvisor: () => null }));
vi.mock('../../components/ArbitrageTerminal.tsx', () => ({ ArbitrageTerminal: () => null }));
vi.mock('../../components/CardImage.tsx', () => ({ default: () => null }));
vi.mock('../../components/NegotiationModal.tsx', () => ({ default: () => null }));
vi.mock('../../components/OCRIngestionModal.tsx', () => ({ default: () => null }));
vi.mock('../../components/MorningBriefingModal.tsx', () => ({ default: () => null }));
vi.mock('../../components/ShareAlphaModal.tsx', () => ({ default: () => null }));
vi.mock('../../components/ReportModal.tsx', () => ({ default: () => null }));

vi.mock('../../components/LazyErrorBoundary.tsx', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../../components/LazyLoadFallback.tsx', () => ({
    WidgetLoadingFallback: () => null,
}));
vi.mock('../../components/BreakoutRadar.tsx', () => ({ default: () => null }));
vi.mock('../../components/AgentInsightsPanel.tsx', () => ({ default: () => null }));
vi.mock('../../components/LiquidityHeatmap.tsx', () => ({ default: () => null }));
vi.mock('../../components/LiquidityPoolWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/TaxSummaryWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/GradeAuditWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/RebalanceWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/AuctionSniperWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/PriceHistoryWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/ConsignmentWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/AchievementWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/AnomalyWidget.tsx', () => ({ default: () => null }));
vi.mock('../../components/dashboard/RecentlyIngested.tsx', () => ({ default: () => null }));

async function loadDashboard() {
    const mod = await import('../../pages/Dashboard.tsx');
    return mod.default;
}

describe('Dashboard (regression guard)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it('renders the empty-state HUD when inventory is empty', { timeout: 30_000 }, async () => {
        mockState.inventory = [];
        const Dashboard = await loadDashboard();

        const { container } = render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>,
        );

        expect(container.firstChild).not.toBeNull();
        // Empty state shows the SYSTEM INITIALIZATION headline split across
        // two spans, so a partial regex is more resilient than an exact match.
        expect(screen.getByText(/system/i)).toBeInTheDocument();
        expect(screen.getByText(/initialization/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /scan your first card/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /add manually/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /interactive demo tour/i })).toBeInTheDocument();
    });

    it('renders the populated hero when inventory is non-empty', { timeout: 30_000 }, async () => {
        mockState.inventory = populatedInventory;
        const Dashboard = await loadDashboard();

        const { container } = render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>,
        );

        expect(container.firstChild).not.toBeNull();
        // Hero copy: "Net Asset <span>Value</span>" — substring assertion.
        expect(screen.getByText(/net asset/i)).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /sync market/i }),
        ).toBeInTheDocument();
    });
});
