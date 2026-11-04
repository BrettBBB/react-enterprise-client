const tokenKey = 'enterprise.accessToken';

export function readAccessToken() {
  return sessionStorage.getItem(tokenKey);
}

export function storeAccessToken(token: string | null) {
  if (token) {
    sessionStorage.setItem(tokenKey, token);
    return;
  }
  sessionStorage.removeItem(tokenKey);
}
