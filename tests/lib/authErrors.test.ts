import { describe, it, expect } from 'vitest';
import { getFriendlyAuthMessage } from '../../lib/utils/authErrors';

describe('getFriendlyAuthMessage', () => {
    it('returns empty string for null', () => {
        expect(getFriendlyAuthMessage(null)).toBe('');
    });

    it('maps invalid_credentials code', () => {
        const error = { code: 'invalid_credentials', message: 'Invalid login credentials' } as any;
        expect(getFriendlyAuthMessage(error)).toContain('Invalid email or password');
    });

    it('maps over_request_rate_limit code', () => {
        const error = { code: 'over_request_rate_limit', message: 'Too many requests' } as any;
        expect(getFriendlyAuthMessage(error)).toContain('few minutes');
    });

    it('maps email_not_confirmed code', () => {
        const error = { code: 'email_not_confirmed', message: 'Email not confirmed' } as any;
        expect(getFriendlyAuthMessage(error)).toContain('confirm your account');
    });

    it('maps user_already_exists code', () => {
        const error = { code: 'user_already_exists', message: 'User already registered' } as any;
        expect(getFriendlyAuthMessage(error)).toContain('already exists');
    });

    it('maps weak_password code', () => {
        const error = { code: 'weak_password', message: 'Password too weak' } as any;
        expect(getFriendlyAuthMessage(error)).toContain('security requirements');
    });

    it('falls back to message match for invalid login', () => {
        const error = { code: 'unknown', message: 'Invalid login credentials' } as any;
        expect(getFriendlyAuthMessage(error)).toContain('Invalid email or password');
    });

    it('falls back to raw message for unknown errors', () => {
        const error = { code: 'unknown', message: 'Something went wrong' } as any;
        expect(getFriendlyAuthMessage(error)).toBe('Something went wrong');
    });
});
