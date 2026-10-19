import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const updatePassword = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    updatePassword,
    isDemoMode: false,
    recoveryMode: true,
    session: { user: { id: 'user-1' } },
    clearRecoveryMode: vi.fn(),
  }),
}));

import ResetPassword from '../../pages/ResetPassword';

describe('Reset password form', () => {
  it('does not save a password that misses the strength rules', async () => {
    updatePassword.mockClear();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/new security key/i), 'password');
    expect(screen.getByRole('button', { name: /refresh security key/i })).toBeDisabled();
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('rejects a confirmation that does not match', async () => {
    updatePassword.mockClear();
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
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('saves a strong password from the recovery session', async () => {
    updatePassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/new security key/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm security key/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /refresh security key/i }));

    expect(updatePassword).toHaveBeenCalledWith('Password1');
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
});
