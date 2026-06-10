import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductionConfigBanner from '../../components/ProductionConfigBanner';

const envMock = vi.hoisted(() => ({
  schema: [] as string[],
  pairing: [] as string[],
  telemetry: [] as string[],
  serverAuth: [] as string[],
  demo: false,
  prod: true,
}));

vi.mock('../../lib/utils/env', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../lib/utils/env')>();
  return {
    ...mod,
    isClientProductionBuild: () => envMock.prod,
    isClientDemoMode: () => envMock.demo,
    getEnvSchemaFailureMessages: () => envMock.schema,
    getSupabaseEnvPairingIssues: () => envMock.pairing,
    getProductionTelemetryIssues: () => envMock.telemetry,
    getProductionServerAuthIssues: () => envMock.serverAuth,
  };
});

describe('ProductionConfigBanner', () => {
  beforeEach(() => {
    envMock.prod = true;
    envMock.demo = false;
    envMock.schema = [];
    envMock.pairing = [];
    envMock.telemetry = [];
    envMock.serverAuth = [];
  });

  it('renders alert when production build has configuration issues', () => {
    envMock.schema = ['VITE_SUPABASE_URL: invalid'];
    render(<ProductionConfigBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Production configuration error/i)).toBeInTheDocument();
    expect(screen.getByText(/VITE_SUPABASE_URL/)).toBeInTheDocument();
  });

  it('renders pairing-only issues', () => {
    envMock.pairing = ['VITE_SUPABASE_URL is missing while VITE_SUPABASE_ANON_KEY is set.'];
    render(<ProductionConfigBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/VITE_SUPABASE_URL is missing/i)).toBeInTheDocument();
  });

  it('renders nothing when not a production build', () => {
    envMock.prod = false;
    envMock.schema = ['should be ignored'];
    const { container } = render(<ProductionConfigBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there are no issues in production', () => {
    const { container } = render(<ProductionConfigBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders telemetry issues in production', () => {
    envMock.telemetry = ['No error telemetry configured — set VITE_SENTRY_DSN or VITE_ERROR_REPORTING_URL.'];
    render(<ProductionConfigBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/No error telemetry configured/i)).toBeInTheDocument();
  });

  it('renders server auth issues from health check', async () => {
    envMock.serverAuth = [
      'Server API auth is not configured on Vercel. Set SUPABASE_URL and SUPABASE_ANON_KEY.',
    ];
    render(<ProductionConfigBanner />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Server API auth is not configured/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin fix \(server API auth\)/i)).toBeInTheDocument();
    expect(screen.getByText(/vercel env add SUPABASE_URL production/i)).toBeInTheDocument();
  });

  it('renders nothing in demo mode even with server auth issues', () => {
    envMock.demo = true;
    envMock.serverAuth = ['should be ignored'];
    const { container } = render(<ProductionConfigBanner />);
    expect(container.firstChild).toBeNull();
  });
});
