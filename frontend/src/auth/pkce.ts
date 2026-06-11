/** Generates a cryptographically random base64url-encoded string */
function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Generates a random PKCE code_verifier (43–128 chars per RFC 7636) */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

/** Derives the code_challenge from a verifier using SHA-256 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return base64UrlEncode(digest);
}

/** Generates a random state string for CSRF protection */
export function generateState(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}
