import Link from 'next/link';
import { verifyTransaction } from '@/lib/paystack';

// Always verify fresh on each visit; never cache a payment result.
export const dynamic = 'force-dynamic';

function formatAmount(subunit, currency) {
  const value = (Number(subunit) || 0) / 100;
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency || 'KES',
    }).format(value);
  } catch {
    return `${currency || 'KES'} ${value.toLocaleString()}`;
  }
}

export default async function CallbackPage({ searchParams }) {
  // Paystack returns the reference as ?reference= (and sometimes ?trxref=).
  const reference = searchParams?.reference || searchParams?.trxref;

  let success = false;
  let data = null;
  let message = 'We could not find a payment reference.';

  if (reference) {
    try {
      const result = await verifyTransaction(reference);
      data = result?.data || null;
      success = result?.status === true && data?.status === 'success';
      message = success
        ? 'Your payment was received successfully.'
        : data?.gateway_response || result?.message || 'This payment was not completed.';
    } catch (err) {
      console.error('verify error:', err);
      message = 'We could not verify this payment. Please contact support.';
    }
  }

  return (
    <main className="page">
      <div className="card result">
        <div className={`icon ${success ? 'ok' : 'bad'}`}>{success ? '✓' : '!'}</div>
        <h2>{success ? 'Payment successful' : 'Payment not completed'}</h2>
        <p>{message}</p>

        {data && (
          <div className="receipt">
            <div className="row">
              <span>Reference</span>
              <span>{data.reference}</span>
            </div>
            <div className="row">
              <span>Amount</span>
              <span>{formatAmount(data.amount, data.currency)}</span>
            </div>
            {data.customer?.email && (
              <div className="row">
                <span>Email</span>
                <span>{data.customer.email}</span>
              </div>
            )}
            <div className="row">
              <span>Status</span>
              <span>{data.status}</span>
            </div>
          </div>
        )}

        <Link className="link-btn" href="/">
          {success ? 'Make another payment' : 'Try again'}
        </Link>
      </div>
    </main>
  );
}
