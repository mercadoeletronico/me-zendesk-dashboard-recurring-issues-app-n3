import { generateCodeVerifier, generateCodeChallenge, generateState } from './pkce';
import {
  saveCodeVerifier, getCodeVerifier, clearCodeVerifier,
  saveOAuthState, getOAuthState, clearOAuthState,
  saveSession, clearSession,
} from './session';
export { getSession, clearSession } from './session';
export type { AuthUser } from './session';

// Configuracao por ambiente (.env.development / .env.production)
const SSO_URL       = (import.meta.env.VITE_SSO_URL as string)           ?? 'https://trunk.sso.mercadoe.com';
const REALM         = (import.meta.env.VITE_SSO_REALM as string)         ?? 'zerotrust';
const CLIENT_ID     = (import.meta.env.VITE_SSO_CLIENT_ID as string)     ?? '';
const CLIENT_SECRET = (import.meta.env.VITE_SSO_CLIENT_SECRET as string) ?? '';
const SCOPES        = 'openid profile email';

const AUTHORIZE_URL = `${SSO_URL}/realms/${REALM}/protocol/openid-connect/auth`;

// Em desenvolvimento: token passa pelo proxy do Vite (evita CORS no browser).
// Em producao: vai direto para o SSO — configurar Web Origins no Keycloak ou reverse proxy.
const TOKEN_URL = import.meta.env.DEV
  ? '/__sso/token'
  : `${SSO_URL}/realms/${REALM}/protocol/openid-connect/token`;

function getRedirectUri(): string {
  return window.location.origin;
}

/** Inicia o fluxo Authorization Code + PKCE no Keycloak da ME */
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

/** Troca o auth code por tokens. Retorna true se bem-sucedido. */
export async function handleCallback(code: string, returnedState: string): Promise<boolean> {
  const storedState  = getOAuthState();
  const codeVerifier = getCodeVerifier();

  clearOAuthState();
  clearCodeVerifier();

  if (!storedState || storedState !== returnedState) {
    console.error('[Auth] State mismatch - possivel ataque CSRF');
    return false;
  }
  if (!codeVerifier) {
    console.error('[Auth] Code verifier nao encontrado');
    return false;
  }

  try {
    const body = new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
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
 * Logout local: limpa a sessao no browser e retorna ao estado nao-autenticado.
 * O AuthContext detecta user=null e exibe a tela de login imediatamente.
 *
 * Nota: isso nao encerra a sessao SSO no servidor Keycloak. Se precisar de
 * logout SSO completo (encerrar sessao em todos os apps ME), pedir ao time
 * de TI para adicionar a URL do app em "Valid Post Logout Redirect URIs"
 * no client do Keycloak, e reativar o redirecionamento para o endpoint
 * /protocol/openid-connect/logout.
 */
export function logout(): void {
  clearSession();
  // Sem redirecionamento — o AuthContext ja exibe a tela de login via React state
}
