import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const signUp = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signUp,
    signInWithGoogle: vi.fn(),
    demoLogin: vi.fn(),
    isDemoMode: false,
  }),
}));

import Signup from '../../pages/Signup';

describe('Signup form', () => {
  it('blocks a short username before creating an account', async () => {
    signUp.mockClear();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/^username$/i), 'ab');
    await user.type(screen.getByLabelText(/^email$/i), 'fan@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(screen.getByLabelText(/^confirm$/i), 'Password1');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/3-20/);
    expect(signUp).not.toHaveBeenCalled();
  });

  it('requires the password rules and a matching confirmation', async () => {
    signUp.mockClear();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/^username$/i), 'Card_Fan');
    await user.type(screen.getByLabelText(/^email$/i), 'fan@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password');
    await user.type(screen.getByLabelText(/^confirm$/i), 'password');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/uppercase/i);
    expect(signUp).not.toHaveBeenCalled();
  });

  it('shows and hides the password', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    const input = screen.getByLabelText(/^password$/i);
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('submits a valid username, email, and password', async () => {
    signUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/^username$/i), 'Card_Fan');
    await user.type(screen.getByLabelText(/^email$/i), 'fan@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(screen.getByLabelText(/^confirm$/i), 'Password1');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(signUp).toHaveBeenCalledWith('fan@example.com', 'Password1', 'Card_Fan');
    expect(await screen.findByRole('heading', { name: /check your email/i })).toBeInTheDocument();
  });
});
