export interface AuthUser {
  name: string;
  email: string;
  sub: string;
}

interface StoredSession {
  accessToken: string;
  idToken: string;
  user: AuthUser;
  expiresAt: number;
}

const KEYS = {
  session:      'me_zd_auth_session',
  codeVerifier: 'me_zd_code_verifier',
  oauthState:   'me_zd_oauth_state',
} as const;

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return {}; }
}

export function extractUserFromIdToken(idToken: string): AuthUser {
  const claims  = decodeJwtPayload(idToken);
  const fullName = [(claims.given_name as string), (claims.family_name as string)]
    .filter(Boolean).join(' ');
  return {
    name:  (claims.name as string) || fullName || (claims.preferred_username as string) || 'Usuario',
    email: (claims.email as string) || (claims.preferred_username as string) || '',
    sub:   (claims.sub as string)   || '',
  };
}

export function extractExpiryFromToken(token: string): number {
  const claims = decodeJwtPayload(token);
  return (claims.exp as number) || 0;
}

export function saveSession(accessToken: string, idToken: string): void {
  const user      = extractUserFromIdToken(idToken);
  const expiresAt = extractExpiryFromToken(accessToken);
  sessionStorage.setItem(KEYS.session, JSON.stringify({ accessToken, idToken, user, expiresAt }));
}

export function getSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(KEYS.session);
    if (!raw) return null;
    const session: StoredSession = JSON.parse(raw);
    if (session.expiresAt && Date.now() / 1000 > session.expiresAt - 60) {
      clearSession();
      return null;
    }
    return session;
  } catch { return null; }
}

export function clearSession():      void { sessionStorage.removeItem(KEYS.session); }
export function saveCodeVerifier(v: string): void { sessionStorage.setItem(KEYS.codeVerifier, v); }
export function getCodeVerifier():   string | null { return sessionStorage.getItem(KEYS.codeVerifier); }
export function clearCodeVerifier(): void { sessionStorage.removeItem(KEYS.codeVerifier); }
export function saveOAuthState(s: string): void { sessionStorage.setItem(KEYS.oauthState, s); }
export function getOAuthState():     string | null { return sessionStorage.getItem(KEYS.oauthState); }
export function clearOAuthState():   void { sessionStorage.removeItem(KEYS.oauthState); }
