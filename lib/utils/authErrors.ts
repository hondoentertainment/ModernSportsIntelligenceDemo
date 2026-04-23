// @ts-nocheck
/**
 * Maps Supabase AuthError codes and messages to user-friendly messages
 */

import type { AuthError } from '@supabase/supabase-js';

const FRIENDLY_MESSAGES: Record<string, string> = {
    invalid_credentials: 'Invalid email or password. Please check your credentials.',
    over_email_send_rate_limit: 'Too many emails sent to this address. Please wait an hour before trying again.',
    over_request_rate_limit: 'Too many sign-in attempts. Please try again in a few minutes.',
    email_not_confirmed: 'Please check your email and confirm your account before signing in.',
    user_already_exists: 'An account with this email already exists. Try signing in instead.',
    email_exists: 'An account with this email already exists. Try signing in instead.',
    signup_disabled: 'New account creation is temporarily disabled. Please try again later.',
    weak_password: 'Password does not meet security requirements. Use 8+ characters with uppercase, lowercase, and numbers.',
    validation_failed: 'Invalid input. Please check your details and try again.',
    provider_disabled: 'Sign in with this provider is currently unavailable. Try email/password instead.',
    otp_expired: 'Your sign-in link has expired. Please request a new one.',
    session_expired: 'Your session has expired. Please sign in again.',
    // Password reset
    email_rate_limit_exceeded: 'Too many password reset emails sent. Please wait an hour before trying again.',
    email_not_found: 'No account found with this email address.',
    // Supabase-specific codes
    sign_in_required: 'Please sign in to continue.',
    mfa_challenge_required: 'Additional verification is required.',
    password_too_short: 'Password must be at least 8 characters long.',
    password_no_upper: 'Password must contain at least one uppercase letter.',
    password_no_lower: 'Password must contain at least one lowercase letter.',
    password_no_number: 'Password must contain at least one numeric character.',
    network_error: 'Network error. Check your connection and try again.',
    server_error: 'Our servers are not responding. Please try again shortly.',
    flow_state_expired: 'This sign-in link expired. Start the flow again from the login page.',
    same_password: 'New password must be different from your current password.',
};

export function getFriendlyAuthMessage(error: AuthError | null): string {
    if (!error) return '';

    const code = (error as { code?: string }).code;
    const message = error.message?.toLowerCase() ?? '';

    if (code && FRIENDLY_MESSAGES[code]) {
        return FRIENDLY_MESSAGES[code];
    }

    if (message.includes('invalid login') || message.includes('invalid credentials')) {
        return FRIENDLY_MESSAGES.invalid_credentials;
    }
    if (message.includes('rate limit') || message.includes('too many')) {
        return FRIENDLY_MESSAGES.over_request_rate_limit;
    }
    if (message.includes('email not confirmed') || message.includes('confirm')) {
        return FRIENDLY_MESSAGES.email_not_confirmed;
    }
    if (message.includes('already registered') || message.includes('already exists')) {
        return FRIENDLY_MESSAGES.email_exists;
    }
    if (message.includes('password')) {
        return FRIENDLY_MESSAGES.weak_password;
    }
    if ((message.includes('email') && message.includes('rate')) || message.includes('rate limit')) {
        return FRIENDLY_MESSAGES.over_email_send_rate_limit;
    }
    if (message.includes('user not found') || message.includes('no user')) {
        return FRIENDLY_MESSAGES.email_not_found;
    }
    if (
        message.includes('failed to fetch') ||
        message.includes('network') ||
        message.includes('load failed') ||
        message.includes('networkerror')
    ) {
        return FRIENDLY_MESSAGES.network_error;
    }
    if (message.includes('gateway') || message.includes('502') || message.includes('503') || message.includes('504')) {
        return FRIENDLY_MESSAGES.server_error;
    }
    if (message.includes('flow state') || message.includes('flow_state')) {
        return FRIENDLY_MESSAGES.flow_state_expired;
    }
    if (message.includes('same password') || message.includes('reauthentication')) {
        return FRIENDLY_MESSAGES.same_password;
    }

    return error.message;
}
