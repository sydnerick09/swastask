'use client';

import { useState } from 'react';

const PRESETS = [100, 500, 1000, 2500];

export default function PaymentPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Please enter an amount greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, amount: numericAmount }),
      });
      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        setError(data.error || 'Could not start payment. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to Paystack's secure hosted checkout.
      window.location.href = data.authorization_url;
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="card">
        <div className="brand">
          <div className="dot">₭</div>
          <div>
            <h1>SWAS Pay</h1>
            <p>Secure checkout</p>
          </div>
        </div>

        <div className="lead">
          <h2>Make a payment</h2>
          <span>Enter your details below to pay securely in KES.</span>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}

          <div className="field">
            <label htmlFor="name">Full name (optional)</label>
            <input
              id="name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="amount">Amount</label>
            <div className="amount-wrap">
              <span className="prefix">KES</span>
              <input
                id="amount"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="presets">
            {PRESETS.map((p) => (
              <button type="button" key={p} onClick={() => setAmount(String(p))}>
                {p.toLocaleString()}
              </button>
            ))}
          </div>

          <button className="pay-btn" type="submit" disabled={loading}>
            {loading ? 'Redirecting…' : `Pay ${amount ? 'KES ' + Number(amount).toLocaleString() : 'now'}`}
          </button>
        </form>

        <p className="secure">🔒 Payments are processed securely by Paystack.</p>
      </div>
    </main>
  );
}
