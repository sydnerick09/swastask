// Server-side Paystack helpers. These run only on the server because they use
// the secret key. Never import getSecretKey() into a client component.

const PAYSTACK_BASE = 'https://api.paystack.co';

export function getSecretKey() {
  // Trim defensively: env values pasted or piped in can carry a trailing
  // newline/whitespace, which would corrupt the Authorization header.
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      'PAYSTACK_SECRET_KEY is not set. Add it to .env.local (local) or Vercel env vars (production).'
    );
  }
  return key;
}

/**
 * Initialize a transaction. Paystack returns a hosted-checkout URL we redirect to.
 * @param {{email: string, amount: number, currency: string, callbackUrl: string, metadata?: object}} params
 *  - amount must already be in the smallest currency unit (e.g. KES cents = KES * 100)
 */
export async function initializeTransaction({ email, amount, currency, callbackUrl, metadata }) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, amount, currency, callback_url: callbackUrl, metadata }),
    cache: 'no-store',
  });
  return res.json();
}

/**
 * Verify a transaction by reference. This is the source of truth for whether a
 * payment actually succeeded — never trust the client's word for it.
 * @param {string} reference
 */
export async function verifyTransaction(reference) {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
      cache: 'no-store',
    }
  );
  return res.json();
}
