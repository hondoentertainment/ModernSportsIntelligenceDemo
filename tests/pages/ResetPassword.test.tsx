import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const authState = vi.hoisted(() => ({
  updatePassword: vi.fn(),
  isDemoMode: false,
  recoveryMode: true,
  session: { user: { id: 'user-1' } } as { user: { id: string } } | null,
  clearRecoveryMode: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

import ResetPassword from '../../pages/ResetPassword';

describe('Reset password form', () => {
  beforeEach(() => {
    authState.updatePassword.mockReset();
    authState.isDemoMode = false;
    authState.recoveryMode = true;
    authState.session = { user: { id: 'user-1' } };
  });
  it('does not save a password that misses the strength rules', async () => {
    authState.updatePassword.mockClear();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/new security key/i), 'password');
    expect(screen.getByRole('button', { name: /refresh security key/i })).toBeDisabled();
    expect(authState.updatePassword).not.toHaveBeenCalled();
    expect(screen.getByText(/8\+ characters with an uppercase letter/i)).toBeInTheDocument();
  });

  it('rejects a confirmation that does not match', async () => {
    authState.updatePassword.mockClear();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/new security key/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm security key/i), 'Password2');
    await user.click(screen.getByRole('button', { name: /refresh security key/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match/i);
    expect(authState.updatePassword).not.toHaveBeenCalled();
  });

  it('saves a strong password from the recovery session', async () => {
    authState.updatePassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/new security key/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm security key/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /refresh security key/i }));

    expect(authState.updatePassword).toHaveBeenCalledWith('Password1');
    expect(await screen.findByRole('heading', { name: /password updated/i })).toBeInTheDocument();
  });

  it('shows and hides the new password', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    const input = screen.getByLabelText(/new security key/i);
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(input).toHaveAttribute('type', 'text');
  });

  it('sends a stale recovery link back to the request form', async () => {
    authState.updatePassword.mockResolvedValue({
      error: {
        name: 'AuthError',
        message: 'Email link is invalid or has expired',
        code: 'otp_expired',
        status: 400,
      },
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/new security key/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm security key/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /refresh security key/i }));
    expect(await screen.findByRole('heading', { name: /reset link expired/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /request reset link/i })).toHaveAttribute('href', '/forgot-password');
  });

  it('explains a reset page opened without a recovery session', () => {
    authState.recoveryMode = false;
    authState.session = null;
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /no active recovery session/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /request reset link/i })).toBeInTheDocument();
  });
});
