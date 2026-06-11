import { generateCodeVerifier, generateCodeChallenge, generateState } from './pkce';
import {
  saveCodeVerifier, getCodeVerifier, clearCodeVerifier,
  saveOAuthState, getOAuthState, clearOAuthState,
  saveSession, clearSession,
} from './session';
export { getSession, clearSession } from './session';
export type { AuthUser } from './session';

// Variáveis públicas (seguro no browser)
const SSO_URL   = process.env.NEXT_PUBLIC_SSO_URL   ?? 'https://trunk.sso.mercadoe.com';
const REALM     = process.env.NEXT_PUBLIC_SSO_REALM  ?? 'zerotrust';
const CLIENT_ID = process.env.NEXT_PUBLIC_SSO_CLIENT_ID ?? '';
const SCOPES    = 'openid profile email';

const AUTHORIZE_URL = `${SSO_URL}/realms/${REALM}/protocol/openid-connect/auth`;

/**
 * Token URL aponta sempre para a rota Next.js /api/auth/token.
 * Essa rota injeta o client_secret server-side — o segredo nunca chega ao browser.
 */
const TOKEN_URL = '/api/auth/token';

function getRedirectUri(): string {
  return window.location.origin;
}

export async function initiateLogin(): Promise<void> {
  const verifier  = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state     = generateState();

  saveCodeVerifier(verifier);
  saveOAuthState(state);

  const params = new URLSearchParams({
    client_id:             CLIENT_ID,
    response_type:         'code',
    redirect_uri:          getRedirectUri(),
    scope:                 SCOPES,
    state,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    response_mode:         'query',
  });

  window.location.href = `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function handleCallback(code: string, returnedState: string): Promise<boolean> {
  const storedState  = getOAuthState();
  const codeVerifier = getCodeVerifier();

  clearOAuthState();
  clearCodeVerifier();

  if (!storedState || storedState !== returnedState) {
    console.error('[Auth] State mismatch');
    return false;
  }
  if (!codeVerifier) {
    console.error('[Auth] Code verifier não encontrado');
    return false;
  }

  try {
    const body = new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     CLIENT_ID,
      // client_secret NÃO vai aqui — é injetado pela rota /api/auth/token no servidor
      code,
      redirect_uri:  getRedirectUri(),
      code_verifier: codeVerifier,
    });

    const response = await fetch(TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Auth] Falha na troca do token:', err);
      return false;
    }

    const tokens = await response.json();
    if (!tokens.access_token || !tokens.id_token) {
      console.error('[Auth] Tokens ausentes na resposta');
      return false;
    }

    saveSession(tokens.access_token, tokens.id_token);
    return true;
  } catch (err) {
    console.error('[Auth] Erro na troca do token:', err);
    return false;
  }
}

/**
 * Logout local: limpa a sessão no browser.
 * O AuthContext detecta user=null e exibe a tela de login.
 */
export function logout(): void {
  clearSession();
}
