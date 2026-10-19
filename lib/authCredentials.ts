/**
 * Username + password rules shared by the auth forms and the Vercel auth routes.
 * Username uniqueness is case-insensitive and enforced in the database; this
 * module only checks shape. It never looks up a profile.
 */
import { z } from 'zod';

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

export const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;

export const GENERIC_SIGN_IN_ERROR = 'Invalid username or password. Please check your credentials.';
export const USERNAME_SIGN_IN_UNAVAILABLE =
  'Username sign-in is not available yet. Sign in with your email.';
export const USERNAME_CHANGE_UNAVAILABLE =
  'Username changes are not available yet. You can still sign in with your email.';
export const USERNAME_TAKEN_ERROR = 'That username is taken. Choose another.';
export const EMAIL_NOT_CONFIRMED_ERROR =
  'Please check your email and confirm your account before signing in.';
export const AUTH_RATE_LIMIT_ERROR = 'Too many sign-in attempts. Please try again in a few minutes.';
export const RESET_RATE_LIMIT_ERROR =
  'Too many password reset emails sent. Please wait an hour before trying again.';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
}

export type UsernameValidation =
  | { ok: true; username: string }
  | { ok: false; error: string };

export type LoginIdentifier =
  | { kind: 'email'; email: string }
  | { kind: 'username'; username: string }
  | { kind: 'invalid' };

export type LookupOutcome =
  | { status: 'found'; email: string }
  | { status: 'missing' }
  | { status: 'unavailable' }
  | { status: 'error' };

export type ResolvedLogin =
  | { status: 'ready'; email: string; via: 'email' | 'username' }
  | { status: 'unknown' }
  | { status: 'unavailable' }
  | { status: 'invalid' }
  | { status: 'error' };

export type UsernameWriteOutcome = 'ok' | 'taken' | 'unavailable' | 'error';

type ErrorLike = { code?: string | null; message?: string | null } | null | undefined;

export const passwordSignInBodySchema = z
  .object({
    identifier: z.string().trim().min(1).max(320),
    password: z.string().min(1).max(128),
  })
  .strict();

export const passwordResetBodySchema = z
  .object({
    identifier: z.string().trim().min(1).max(320),
    redirectTo: z.string().trim().min(1).max(200),
  })
  .strict();

export const usernameAvailabilityBodySchema = z
  .object({
    username: z.string().trim().min(1).max(64),
  })
  .strict();

export type PasswordSignInBody = z.infer<typeof passwordSignInBodySchema>;
export type PasswordResetBody = z.infer<typeof passwordResetBodySchema>;
export type UsernameAvailabilityBody = z.infer<typeof usernameAvailabilityBodySchema>;

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
}

/** All four rules are required. Returns the first failing rule, or null. */
export function passwordRuleError(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length > PASSWORD_MAX) return `Password must be at most ${PASSWORD_MAX} characters.`;
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`;
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include a number.';
  return null;
}

export function passwordIsStrong(password: string): boolean {
  return passwordRuleError(password) === null;
}

export function validateAuthUsername(raw: string): UsernameValidation {
  const username = raw.trim();
  if (!username) return { ok: false, error: 'Username is required.' };
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return { ok: false, error: `Username must be ${USERNAME_MIN}-${USERNAME_MAX} characters.` };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return { ok: false, error: 'Username can use letters, numbers, and underscores only.' };
  }
  return { ok: true, username };
}

export function classifyLoginIdentifier(raw: string): LoginIdentifier {
  const value = raw.trim();
  if (!value || value.length > 320) return { kind: 'invalid' };
  if (value.includes('@')) {
    if (!EMAIL_PATTERN.test(value)) return { kind: 'invalid' };
    return { kind: 'email', email: value.toLowerCase() };
  }
  const username = validateAuthUsername(value);
  if (!username.ok) return { kind: 'invalid' };
  return { kind: 'username', username: username.username };
}

/**
 * True when the username column or the lookup RPC is missing. Other database
 * errors must not be treated as "fall back to email" — callers surface those
 * as a generic failure.
 */
export function isUsernameLookupUnavailable(error: ErrorLike): boolean {
  if (!error) return false;
  const code = (error.code ?? '').toUpperCase();
  const message = (error.message ?? '').toLowerCase();
  if (
    code === 'PGRST202' ||
    code === 'PGRST204' ||
    code === '42883' ||
    code === '42703' ||
    code === '42P01'
  ) {
    return true;
  }
  if (message.includes('could not find the function')) return true;
  if (message.includes('schema cache')) return true;
  if (
    message.includes('does not exist') &&
    (message.includes('function') ||
      message.includes('username') ||
      message.includes('resolve_username_email') ||
      message.includes('username_available') ||
      message.includes('column'))
  ) {
    return true;
  }
  return false;
}

export function isUsernameTakenError(error: ErrorLike): boolean {
  if (!error) return false;
  const code = error.code ?? '';
  const message = (error.message ?? '').toLowerCase();
  if (message.includes('profiles_username_lower_idx') || message.includes('profiles_username_key')) {
    return true;
  }
  // A primary-key conflict is a different duplicate and must not look like a taken handle.
  return code === '23505' && message.includes('username');
}

export function isCredentialFailure(error: ErrorLike): boolean {
  if (!error) return false;
  const code = (error.code ?? '').toLowerCase();
  const message = (error.message ?? '').toLowerCase();
  return (
    code === 'invalid_credentials' ||
    message.includes('invalid login') ||
    message.includes('invalid credentials')
  );
}

export function isEmailNotConfirmed(error: ErrorLike): boolean {
  if (!error) return false;
  const code = (error.code ?? '').toLowerCase();
  const message = (error.message ?? '').toLowerCase();
  return code === 'email_not_confirmed' || message.includes('email not confirmed');
}

export function isAuthRateLimited(error: ErrorLike): boolean {
  if (!error) return false;
  const code = (error.code ?? '').toLowerCase();
  const message = (error.message ?? '').toLowerCase();
  return (
    code === 'over_request_rate_limit' ||
    code === 'over_email_send_rate_limit' ||
    code === 'email_rate_limit_exceeded' ||
    message.includes('rate limit') ||
    message.includes('too many')
  );
}

/** Reset and sign-in must not tell the caller whether the account exists. */
export function isHiddenAccountError(error: ErrorLike): boolean {
  if (!error) return false;
  const code = (error.code ?? '').toLowerCase();
  const message = (error.message ?? '').toLowerCase();
  return (
    code === 'user_not_found' ||
    code === 'email_not_found' ||
    message.includes('user not found') ||
    message.includes('no user found') ||
    message.includes('email not found')
  );
}

export function lookupOutcomeFromRpc(error: ErrorLike, data: unknown): LookupOutcome {
  if (error) {
    if (isUsernameLookupUnavailable(error)) return { status: 'unavailable' };
    return { status: 'error' };
  }
  if (typeof data === 'string' && data.includes('@')) {
    return { status: 'found', email: data.trim().toLowerCase() };
  }
  return { status: 'missing' };
}

export async function resolveLoginEmail(
  identifier: string,
  lookup: (username: string) => Promise<LookupOutcome>,
): Promise<ResolvedLogin> {
  const classified = classifyLoginIdentifier(identifier);
  if (classified.kind === 'invalid') return { status: 'invalid' };
  if (classified.kind === 'email') {
    return { status: 'ready', email: classified.email, via: 'email' };
  }
  const found = await lookup(classified.username);
  if (found.status === 'unavailable') return { status: 'unavailable' };
  if (found.status === 'error') return { status: 'error' };
  if (found.status === 'missing') return { status: 'unknown' };
  return { status: 'ready', email: found.email, via: 'username' };
}

export function interpretUsernameWriteError(error: ErrorLike): UsernameWriteOutcome {
  if (!error) return 'ok';
  if (isUsernameTakenError(error)) return 'taken';
  if (isUsernameLookupUnavailable(error)) return 'unavailable';
  return 'error';
}

/** Only an origin is accepted. Supabase still has to allow it in the dashboard. */
export function safeRedirectOrigin(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function toAuthError(message: string, code: string, status = 400): {
  name: 'AuthError';
  message: string;
  code: string;
  status: number;
} {
  return { name: 'AuthError', message, code, status };
}
