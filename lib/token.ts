const TOKEN_KEY = 'macra_token';
const USER_KEY = 'macra_user';

/**
 * Get the auth token from cookies.
 * Works on client-side only.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Set the auth token as a cookie.
 * Path=/ ensures it's available on all routes including in the proxy (middleware).
 * SameSite=Lax for CSRF protection.
 * Max-Age = 7 days.
 */
export function setToken(token: string): void {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Remove the auth token cookie and user data from localStorage.
 */
export function removeToken(): void {
  // Delete cookie by setting max-age to 0
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  // Also clean up any lingering localStorage data
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
