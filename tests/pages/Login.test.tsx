import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const signInWithGoogle = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        signIn: vi.fn(),
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
});
