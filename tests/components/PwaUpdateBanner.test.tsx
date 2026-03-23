import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PwaUpdateBanner from '../../components/PwaUpdateBanner';

describe('PwaUpdateBanner', () => {
  it('shows after sw-update-available and offers reload', async () => {
    const user = userEvent.setup();
    render(<PwaUpdateBanner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new CustomEvent('sw-update-available'));
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /dismiss update notice/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
