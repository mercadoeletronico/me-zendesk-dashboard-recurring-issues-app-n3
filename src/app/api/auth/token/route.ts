/**
 * Proxy server-side para a troca de token OAuth com o Keycloak.
 *
 * Por que existe essa rota?
 *  - O navegador não pode chamar o endpoint do Keycloak diretamente por CORS.
 *  - O client_secret NUNCA deve estar no bundle do browser.
 *  - Esta rota é chamada pelo auth/index.ts (TOKEN_URL = '/api/auth/token').
 *  - No servidor, injetamos SSO_CLIENT_SECRET antes de repassar ao Keycloak.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  // Inject server-side secret — nunca exposto ao browser
  const clientSecret = process.env.SSO_CLIENT_SECRET ?? '';
  if (clientSecret) {
    params.set('client_secret', clientSecret);
  }

  const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL ?? 'https://trunk.sso.mercadoe.com';
  const realm  = process.env.NEXT_PUBLIC_SSO_REALM  ?? 'zerotrust';
  const tokenUrl = `${ssoUrl}/realms/${realm}/protocol/openid-connect/token`;

  try {
    const upstream = await fetch(tokenUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    });

    const data        = await upstream.text();
    const contentType = upstream.headers.get('Content-Type') ?? 'application/json';

    return new NextResponse(data, {
      status:  upstream.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    const error = err as Error;
    console.error('[api/auth/token] Proxy error:', error.message);
    return NextResponse.json(
      { error: 'Token exchange failed', detail: error.message },
      { status: 502 }
    );
  }
}
