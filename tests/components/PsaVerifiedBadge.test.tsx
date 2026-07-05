import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PsaVerifiedBadge from '../../components/PsaVerifiedBadge';

const { verifyCert } = vi.hoisted(() => ({ verifyCert: vi.fn() }));
vi.mock('../../lib/integrations/psaAdapter', () => ({
  psaAdapter: { verifyCert },
}));

describe('PsaVerifiedBadge', () => {
  beforeEach(() => {
    verifyCert.mockReset();
  });

  afterEach(() => {
    verifyCert.mockReset();
  });

  it('renders nothing when no cert number is provided', () => {
    const { container } = render(<PsaVerifiedBadge certNumber={undefined} />);
    expect(container).toBeEmptyDOMElement();
    expect(verifyCert).not.toHaveBeenCalled();
  });

  it('surfaces a live "PSA verified" badge when the adapter confirms via live', async () => {
    verifyCert.mockResolvedValue({
      certNumber: '12345678',
      verified: true,
      source: 'live',
      lookupDate: new Date().toISOString(),
    });
    render(<PsaVerifiedBadge certNumber="12345678" />);
    await waitFor(() => {
      expect(screen.getByLabelText(/PSA verified/i)).toBeInTheDocument();
    });
    // The "(demo)" suffix must not appear on a live result.
    expect(screen.queryByText(/demo/i)).not.toBeInTheDocument();
  });

  it('surfaces a "PSA verified (demo)" badge when the adapter returns a mock result — the source label keeps the demo state honest', async () => {
    verifyCert.mockResolvedValue({
      certNumber: '12345678',
      verified: true,
      source: 'mock',
      lookupDate: new Date().toISOString(),
    });
    render(<PsaVerifiedBadge certNumber="12345678" />);
    await waitFor(() => {
      expect(screen.getByLabelText(/PSA verified \(demo\)/i)).toBeInTheDocument();
    });
  });

  it('surfaces a "Cert unverified" badge when verify returns verified:false', async () => {
    verifyCert.mockResolvedValue({
      certNumber: 'bogus',
      verified: false,
      source: 'live',
      lookupDate: new Date().toISOString(),
    });
    render(<PsaVerifiedBadge certNumber="bogus" />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Cert unverified/i)).toBeInTheDocument();
    });
  });

  it('surfaces a "Cert unverified" badge when verify rejects (never claims a false confirmation)', async () => {
    verifyCert.mockRejectedValue(new Error('psa 500'));
    render(<PsaVerifiedBadge certNumber="12345678" />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Cert unverified/i)).toBeInTheDocument();
    });
  });
});
