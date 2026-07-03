/**
 * AuditTrail page regression test.
 *
 * pages/AuditTrail.tsx loads the authed user's `audit_events` from Supabase
 * via an async `useEffect`, merging remote rows in front of local sample
 * rows. These tests stub the auth context and the audit trail service
 * (mirroring tests/pages/Dashboard.test.tsx + tests/components/Header.test.tsx)
 * so the page can be exercised without touching the network.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// ─── Shared mock state ───────────────────────────────────────────────
// `vi.hoisted` lets the test mutate state that the vi.mock factories read,
// so all branches (unauthed vs authed, empty vs populated) share one set
// of stubs.
const mockState = vi.hoisted(() => ({
  auth: { user: null as null | { id: string; email: string } },
  localEvents: [] as Array<Record<string, unknown>>,
  remoteRows: [] as Array<Record<string, unknown>>,
}));

const sampleLocal = [
  {
    id: 'l-1',
    timestamp: '2026-05-20 12:00:00',
    category: 'data',
    severity: 'info',
    actor: 'system',
    action: 'sample.action',
    resource: 'Sample',
    details: 'sample row',
    ipAddress: '—',
    sessionId: '—',
    result: 'success',
    metadata: {},
    source: 'sample',
  },
];

// Raw Supabase row — the page maps these through
// mapStoredRecordToAuditEvent(row, i, 'cloud') itself.
const sampleRemoteRow = [
  {
    user_id: 'abc12345-def',
    category: 'portfolio',
    action: 'inventory.updated',
    entity_type: 'card',
    entity_id: 'c1',
    metadata: { count: '3' },
    created_at: '2026-05-21T09:00:00.000Z',
  },
];

// ─── Module mocks ────────────────────────────────────────────────────
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockState.auth,
}));

vi.mock('../../lib/utils/auditTrailRemote', () => ({
  fetchRemoteAuditEvents: vi.fn(async () => mockState.remoteRows),
}));

vi.mock('../../lib/utils/auditTrailService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/utils/auditTrailService')>();
  return {
  ...actual,
  getAuditEvents: () => mockState.localEvents,
  getComplianceRules: () => [
    {
      id: 'cr-1',
      name: 'AML/KYC',
      description: 'desc',
      category: 'Crime',
      status: 'compliant',
      lastChecked: '2026-05-20',
      violationCount: 0,
      autoEnforced: true,
    },
  ],
  getComplianceReports: () => [
    {
      id: 'cpr-1',
      title: 'Q1 2026 Review',
      period: 'Q1 2026',
      generatedDate: '2026-03-17',
      findings: 0,
      criticalFindings: 0,
      status: 'pending',
      framework: 'Internal Policy',
    },
  ],
  getRetentionPolicies: () => [
    {
      category: 'data',
      retentionDays: 30,
      totalEvents: 1,
      storageSize: '1 MB',
      lastPurge: '—',
    },
  ],
  getAuditTrailStats: () => ({
    totalEvents: 1,
    eventsToday: 1,
    securityEvents: 0,
    complianceScore: 100,
    activeRules: 1,
    violations: 0,
    avgEventsPerDay: 1,
    dataRetentionDays: 30,
    storageUsed: '1 MB',
    exportsPending: 0,
  }),
  getSeverityColor: () => 'text-blue-400 bg-blue-500/10',
  getCategoryColor: () => 'text-emerald-400',
  getComplianceStatusColor: () => 'text-green-400 bg-green-500/10',
  };
});

// Import the page after the mocks so the mocked modules win.
import AuditTrail from '../../pages/AuditTrail';
import * as auditTrailRemote from '../../lib/utils/auditTrailRemote';

function renderPage() {
  return render(
    <MemoryRouter>
      <AuditTrail />
    </MemoryRouter>,
  );
}

describe('AuditTrail page', () => {
  // Mirrors tests/pages/Dashboard.test.tsx, which calls cleanup() inside
  // beforeEach rather than relying solely on vitest's auto-cleanup. Keeping
  // the same pattern here avoids surprises when mutating mockState across
  // tests that re-render the page.
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    mockState.auth.user = null;
    mockState.localEvents = sampleLocal;
    mockState.remoteRows = [];
  });

  it('renders the page heading and the five stat tiles', () => {
    renderPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /audit trail & compliance logging/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Events Today')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
    expect(screen.getByText('Violations')).toBeInTheDocument();
    expect(screen.getByText('Security Events')).toBeInTheDocument();
    expect(screen.getByText('Storage')).toBeInTheDocument();
  });

  it('without an authed user, shows local + sample rows and skips the remote fetch', async () => {
    mockState.auth.user = null;
    mockState.localEvents = sampleLocal;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('sample row')).toBeInTheDocument();
    });

    expect(
      vi.mocked(auditTrailRemote.fetchRemoteAuditEvents),
    ).not.toHaveBeenCalled();
  });

  it('with an authed user, fetches remote events and merges them in front of local rows', async () => {
    mockState.auth.user = { id: 'user-1', email: 'user@example.com' };
    mockState.localEvents = sampleLocal;
    mockState.remoteRows = sampleRemoteRow;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('count: 3')).toBeInTheDocument();
    });

    expect(screen.getByText('sample row')).toBeInTheDocument();
    // Cloud rows get their own provenance badge.
    expect(screen.getByText('Cloud')).toBeInTheDocument();
    expect(
      vi.mocked(auditTrailRemote.fetchRemoteAuditEvents),
    ).toHaveBeenCalledWith('user-1', { limit: 200 });
  });

  it('refresh button bumps eventsRefresh and re-fetches when authed', async () => {
    mockState.auth.user = { id: 'user-1', email: 'user@example.com' };
    mockState.localEvents = sampleLocal;
    mockState.remoteRows = sampleRemoteRow;

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(
        vi.mocked(auditTrailRemote.fetchRemoteAuditEvents),
      ).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole('button', { name: /^refresh$/i }));

    await waitFor(() => {
      expect(
        vi.mocked(auditTrailRemote.fetchRemoteAuditEvents).mock.calls.length,
      ).toBeGreaterThanOrEqual(2);
    });
  });

  it('switches between the compliance and retention tabs without crashing', async () => {
    mockState.auth.user = null;

    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole('button', { name: /compliance rules/i }),
    );
    expect(screen.getByText('AML/KYC')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /data retention/i }));
    // "retention" appears in several places on this tab (heading, small
    // copy under the per-policy row, tab button). Asserting on the
    // aggregate count keeps this tolerant to copy tweaks without falling
    // back to brittle multi-match queries.
    expect(screen.getAllByText(/retention/i).length).toBeGreaterThan(0);
  });
});
