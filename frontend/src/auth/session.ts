export interface AuthUser {
  name: string;
  email: string;
  sub: string; // Keycloak subject ID
}

interface StoredSession {
  accessToken: string;
  idToken: string;
  user: AuthUser;
  expiresAt: number; // Unix seconds
}

const KEYS = {
  session: 'me_zd_auth_session',
  codeVerifier: 'me_zd_code_verifier',
  oauthState: 'me_zd_oauth_state',
} as const;

/** Decodifica o payload de um JWT sem verificar assinatura */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

export function extractUserFromIdToken(idToken: string): AuthUser {
  const claims = decodeJwtPayload(idToken);
  // Keycloak emite: name > given_name+family_name > preferred_username
  const fullName = [(claims.given_name as string), (claims.family_name as string)]
    .filter(Boolean).join(' ');
  return {
    name: (claims.name as string) || fullName || (claims.preferred_username as string) || 'Usuario',
    email: (claims.email as string) || (claims.preferred_username as string) || '',
    sub: (claims.sub as string) || '',
  };
}

export function extractExpiryFromToken(token: string): number {
  const claims = decodeJwtPayload(token);
  return (claims.exp as number) || 0;
}

// Session storage

export function saveSession(accessToken: string, idToken: string): void {
  const user = extractUserFromIdToken(idToken);
  const expiresAt = extractExpiryFromToken(accessToken);
  const session: StoredSession = { accessToken, idToken, user, expiresAt };
  sessionStorage.setItem(KEYS.session, JSON.stringify(session));
}

export function getSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(KEYS.session);
    if (!raw) return null;
    const session: StoredSession = JSON.parse(raw);
    // Check expiry (with 60s buffer)
    if (session.expiresAt && Date.now() / 1000 > session.expiresAt - 60) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(KEYS.session);
}

// PKCE/state temporary storage

export function saveCodeVerifier(verifier: string): void {
  sessionStorage.setItem(KEYS.codeVerifier, verifier);
}

export function getCodeVerifier(): string | null {
  return sessionStorage.getItem(KEYS.codeVerifier);
}

export function clearCodeVerifier(): void {
  sessionStorage.removeItem(KEYS.codeVerifier);
}

export function saveOAuthState(state: string): void {
  sessionStorage.setItem(KEYS.oauthState, state);
}

export function getOAuthState(): string | null {
  return sessionStorage.getItem(KEYS.oauthState);
}

export function clearOAuthState(): void {
  sessionStorage.removeItem(KEYS.oauthState);
}
