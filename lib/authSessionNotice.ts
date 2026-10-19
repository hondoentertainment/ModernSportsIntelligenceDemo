/**
 * One-shot notice so the login page can explain a refresh that died.
 * Sign-out from the menu does not set this. It lives in memory because the
 * app stays mounted across the redirect to /login. A full reload drops it.
 */
let expired = false;

export function rememberSessionExpired(): void {
  expired = true;
}

export function consumeSessionExpiredNotice(): boolean {
  if (!expired) return false;
  expired = false;
  return true;
}
