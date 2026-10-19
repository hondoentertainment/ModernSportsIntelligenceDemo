import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const signInWithGoogle = vi.fn();
const signIn = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        signIn,
        signInWithGoogle,
        demoLogin: vi.fn(),
        isDemoMode: false,
    }),
}));

import Login from '../../pages/Login';

describe('Login Google auth', () => {
    it('shows the disabled-provider message and stays on the page', async () => {
        signInWithGoogle.mockResolvedValue({
            error: {
                name: 'AuthError',
                message: 'Unsupported provider: provider is not enabled',
                status: 400,
                code: 'provider_disabled',
            },
        });
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>,
        );

        await user.click(screen.getByRole('button', { name: /google auth/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/currently unavailable/i);
        expect(signInWithGoogle).toHaveBeenCalledOnce();
    });

    it('submits a username or an email with the password', async () => {
        signIn.mockResolvedValue({ error: null });
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>,
        );

        await user.type(screen.getByLabelText(/username or email/i), 'Card_Fan');
        await user.type(screen.getByLabelText(/^password$/i), 'Password1');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));

        expect(signIn).toHaveBeenCalledWith('Card_Fan', 'Password1');
    });

    it('shows and hides the password', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>,
        );
        const input = screen.getByLabelText(/^password$/i);
        expect(input).toHaveAttribute('type', 'password');
        await user.click(screen.getByRole('button', { name: /show password/i }));
        expect(input).toHaveAttribute('type', 'text');
    });

    it('tells the user to sign in with email when username lookup is not deployed', async () => {
        signIn.mockResolvedValue({
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
                <Login />
            </MemoryRouter>,
        );

        await user.type(screen.getByLabelText(/username or email/i), 'Card_Fan');
        await user.type(screen.getByLabelText(/^password$/i), 'Password1');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/sign in with your email/i);
        expect(screen.getByRole('button', { name: /google auth/i })).toBeInTheDocument();
    });
});
