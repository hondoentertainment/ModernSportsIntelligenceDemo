import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductionConfigBanner from '../../components/ProductionConfigBanner';

const envMock = vi.hoisted(() => ({
  schema: [] as string[],
  pairing: [] as string[],
  telemetry: [] as string[],
  prod: true,
}));

vi.mock('../../lib/utils/env', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../lib/utils/env')>();
  return {
    ...mod,
    isClientProductionBuild: () => envMock.prod,
    getEnvSchemaFailureMessages: () => envMock.schema,
    getSupabaseEnvPairingIssues: () => envMock.pairing,
    getProductionTelemetryIssues: () => envMock.telemetry,
  };
});

describe('ProductionConfigBanner', () => {
  beforeEach(() => {
    envMock.prod = true;
    envMock.schema = [];
    envMock.pairing = [];
    envMock.telemetry = [];
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
});
