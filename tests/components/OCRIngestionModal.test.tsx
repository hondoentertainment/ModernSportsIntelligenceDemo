import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

vi.mock('../../components/CameraFeed.tsx', () => ({
  default: () => <div data-testid="camera-feed">camera</div>,
}));

vi.mock('../../lib/utils/barcodeDetection.ts', () => ({
  isBarcodeDetectionSupported: () => false,
}));

vi.mock('../../lib/utils/certScanResolver.ts', () => ({
  resolveScanIdentifier: vi.fn(async (raw: string) => {
    if (String(raw).includes('12345678')) {
      return {
        identifier: '12345678',
        kind: 'psa_cert',
        source: 'demo_catalog',
        honestyLabel: 'Demo cert catalog — not a live PSA verification.',
        card: {
          player: 'Shohei Ohtani',
          year: 2018,
          manufacturer: 'Topps',
          set: 'Update',
          cardNumber: '150',
          isGraded: true,
          gradingCompany: 'PSA',
          grade: '10',
          certNumber: '12345678',
        },
        error: null,
      };
    }
    return {
      identifier: String(raw),
      kind: 'unknown',
      source: 'unresolved',
      honestyLabel: 'Enter a PSA cert.',
      card: null,
      error: 'Could not recognize that identifier.',
    };
  }),
  toAddAssetPrefill: (resolved: { card: Record<string, unknown> | null }) => resolved.card,
}));

import OCRIngestionModal from '../../components/OCRIngestionModal';

describe('OCRIngestionModal cert / UPC floor loop', () => {
  it('looks up a typed cert and prefills add-asset', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(<OCRIngestionModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await user.click(screen.getByRole('button', { name: /cert \/ upc/i }));
    expect(screen.getByText(/no identifier yet/i)).toBeInTheDocument();
    expect(screen.getByText(/live barcode decode needs chromium/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/psa cert or upc/i), '12345678');
    await user.click(screen.getByRole('button', { name: /lookup/i }));

    await waitFor(() => {
      expect(screen.getByText('Shohei Ohtani')).toBeInTheDocument();
    });
    expect(screen.getByText(/not a live PSA/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /open add-asset with these fields/i }));
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
      player: 'Shohei Ohtani',
      certNumber: '12345678',
    }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows an error empty-state for unrecognized identifiers', async () => {
    const user = userEvent.setup();
    render(<OCRIngestionModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /cert \/ upc/i }));
    await user.type(screen.getByLabelText(/psa cert or upc/i), '???');
    await user.click(screen.getByRole('button', { name: /lookup/i }));
    await waitFor(() => {
      expect(screen.getByText(/could not recognize/i)).toBeInTheDocument();
    });
  });
});
