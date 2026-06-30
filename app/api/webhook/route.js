import crypto from 'crypto';
import { NextResponse } from 'next/server';

// Paystack webhook receiver. Configure the URL in your Paystack dashboard:
//   Settings → API Keys & Webhooks → Webhook URL = https://<your-app>.vercel.app/api/webhook
// This is the most reliable way to confirm payments (independent of the browser
// redirect, which a user could close before it completes).
export async function POST(request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'Server not configured.' }, { status: 500 });
  }

  // Read the raw body — signature is computed over the exact bytes Paystack sent.
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature') || '';

  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  switch (event.event) {
    case 'charge.success':
      // TODO: fulfil the order here — mark paid in your database, send a receipt, etc.
      console.log('✅ Payment success:', event.data?.reference, event.data?.amount);
      break;
    default:
      console.log('ℹ️ Paystack event:', event.event);
  }

  // Always 200 quickly so Paystack stops retrying.
  return NextResponse.json({ received: true });
}
