import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const resetPassword = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    resetPassword,
    isDemoMode: false,
  }),
}));

import ForgotPassword from '../../pages/ForgotPassword';

describe('Forgot password form', () => {
  it('accepts a username and does not claim the account exists', async () => {
    resetPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/username or email/i), 'Card_Fan');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(resetPassword).toHaveBeenCalledWith('Card_Fan');
    expect(await screen.findByRole('heading', { name: /check your email/i })).toBeInTheDocument();
    expect(screen.getByText(/if an account matches/i)).toBeInTheDocument();
    expect(screen.queryByText(/card_fan/i)).not.toBeInTheDocument();
  });

  it('shows the email-only fallback when username reset is not deployed', async () => {
    resetPassword.mockResolvedValue({
      error: {
        name: 'AuthError',
        message: 'Username sign-in is not available yet. Sign in with your email.',
        code: 'username_signin_unavailable',
        status: 409,
      },
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/username or email/i), 'Card_Fan');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/sign in with your email/i);
  });
});
