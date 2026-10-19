import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const updateUsername = vi.fn();
const changePassword = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'fan@example.com', user_metadata: { username: 'Card_Fan' } },
    isDemoMode: true,
    updateUsername,
    changePassword,
  }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: { from: vi.fn() },
  isDemoMode: true,
}));

import AccountCredentialsForm from '../../components/AccountCredentialsForm';

function renderForm() {
  return render(
    <MemoryRouter>
      <AccountCredentialsForm />
    </MemoryRouter>,
  );
}

describe('Account credentials form', () => {
  it('shows the password rules before a new password is typed', () => {
    renderForm();
    expect(screen.getByText(/8\+ characters with an uppercase letter, a lowercase letter, and a number/i)).toBeInTheDocument();
  });

  it('saves a new username', async () => {
    updateUsername.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderForm();

    const field = screen.getByLabelText(/^username$/i);
    await user.clear(field);
    await user.type(field, 'New_Fan');
    await user.click(screen.getByRole('button', { name: /save username/i }));

    expect(updateUsername).toHaveBeenCalledWith('New_Fan');
    expect(await screen.findByText(/username saved/i)).toBeInTheDocument();
  });

  it('shows a username validation error', async () => {
    updateUsername.mockClear();
    const user = userEvent.setup();
    renderForm();

    const field = screen.getByLabelText(/^username$/i);
    await user.clear(field);
    await user.type(field, 'no');
    await user.click(screen.getByRole('button', { name: /save username/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/3-20/);
    expect(updateUsername).not.toHaveBeenCalled();
  });

  it('updates the password and can reveal it', async () => {
    changePassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderForm();

    expect(screen.getByLabelText(/^current password$/i)).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(screen.getByLabelText(/^current password$/i)).toHaveAttribute('type', 'text');

    await user.type(screen.getByLabelText(/^current password$/i), 'OldPassword1');
    await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'NewPassword1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(changePassword).toHaveBeenCalledWith('OldPassword1', 'NewPassword1');
    expect(await screen.findByText(/password change simulated/i)).toBeInTheDocument();
  });

  it('shows the current-password error from the auth context', async () => {
    changePassword.mockResolvedValue({
      error: {
        name: 'AuthError',
        message: 'Current password is incorrect.',
        code: 'current_password_incorrect',
        status: 401,
      },
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^current password$/i), 'nope');
    await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'NewPassword1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/current password is incorrect/i);
  });

  it('offers sign-in when the session expired during a password change', async () => {
    changePassword.mockResolvedValue({
      error: {
        name: 'AuthError',
        message: 'Your session has expired. Please sign in again.',
        code: 'session_expired',
        status: 401,
      },
    });
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/^current password$/i), 'OldPassword1');
    await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'NewPassword1');
    await user.click(screen.getByRole('button', { name: /update password/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/session has expired/i);
    expect(alert).toHaveTextContent(/sign in/i);
  });
});
