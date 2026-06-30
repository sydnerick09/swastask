import { NextResponse } from 'next/server';
import { initializeTransaction } from '@/lib/paystack';

const CURRENCY = process.env.PAYSTACK_CURRENCY || 'KES';

export async function POST(request) {
  try {
    const { email, amount, name } = await request.json();

    // Validate on the server — never trust the client.
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Enter a valid amount greater than 0.' },
        { status: 400 }
      );
    }

    const origin =
      request.headers.get('origin') || new URL(request.url).origin;

    const data = await initializeTransaction({
      email,
      // Paystack expects the smallest unit. For KES that is cents (KES * 100).
      amount: Math.round(numericAmount * 100),
      currency: CURRENCY,
      callbackUrl: `${origin}/payment/callback`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: name || 'N/A',
          },
        ],
      },
    });

    if (!data.status || !data.data?.authorization_url) {
      return NextResponse.json(
        { error: data.message || 'Could not start payment.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error('initialize error:', err);
    return NextResponse.json(
      { error: 'Server error. Is PAYSTACK_SECRET_KEY configured?' },
      { status: 500 }
    );
  }
}
