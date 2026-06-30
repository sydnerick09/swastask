# SWAS Pay — Paystack payment site (Next.js, Vercel-ready)

A clean single-page payment site. Customers enter their email and an amount in
**KES**, get redirected to Paystack's secure hosted checkout, and return to a
verified success/failure page. Built with the Next.js App Router so it deploys
to Vercel with zero config.

## How it works

```
Browser (form)  ──POST /api/initialize──►  Server (secret key) ──►  Paystack
      ▲                                                                 │
      │                                              redirect to hosted checkout
      │                                                                 ▼
  /payment/callback  ◄──verify with secret key──  Server  ◄── Paystack redirect
```

- The **secret key never touches the browser** — it's only used in server route
  handlers (`app/api/*`) and `app/payment/callback`.
- The amount is set **server-side** during initialization, so it can't be tampered
  with in the browser.
- `app/api/webhook` receives Paystack webhooks (HMAC-verified) for reliable
  confirmation even if the customer closes the tab.

## 1. Get your Paystack keys

Dashboard → **Settings → API Keys & Webhooks**. You'll need:

- **Public key** (`pk_test_…` / `pk_live_…`)
- **Secret key** (`sk_test_…` / `sk_live_…`) — keep private

Start with the **test** keys.

## 2. Run locally

```bash
npm install
# Put your TEST keys in .env.local (already git-ignored):
#   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
#   PAYSTACK_SECRET_KEY=sk_test_...
#   PAYSTACK_CURRENCY=KES
npm run dev
```

Open http://localhost:3000 and pay with a
[Paystack test card](https://paystack.com/docs/payments/test-payments/)
(e.g. card `4084 0840 8408 4081`, any future expiry, CVV `408`, OTP `123456`).

## 3. Deploy to Vercel

1. Push this folder to GitHub (secrets are git-ignored — see the security note).
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Add **Environment Variables** (Project → Settings → Environment Variables):

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | your `pk_...` key |
   | `PAYSTACK_SECRET_KEY` | your `sk_...` key |
   | `PAYSTACK_CURRENCY` | `KES` |

4. **Deploy.** Vercel auto-detects Next.js — no extra config needed.
5. (Optional) In Paystack → **Webhooks**, set the URL to
   `https://<your-app>.vercel.app/api/webhook`.

When you're ready for real money, swap the test keys for **live** keys in Vercel
and redeploy.

## 🔐 Security — read this

- **Never commit secret keys.** `.env`, `.env.local`, etc. are git-ignored here.
  Real keys live only in Vercel's Environment Variables.
- **If a secret key was ever pushed to GitHub, treat it as compromised** and
  **regenerate it** in the Paystack dashboard (Settings → API Keys → Roll key),
  then update the value in Vercel.
- The `NEXT_PUBLIC_` public key is *meant* to be visible in the browser — that's
  fine. Only the `sk_...` secret key must stay private.

## Project structure

```
app/
  page.js                  # payment form (client)
  layout.js
  globals.css
  api/
    initialize/route.js    # creates the transaction (secret key)
    webhook/route.js       # HMAC-verified webhook receiver
  payment/
    callback/page.js       # verifies & shows the result
lib/
  paystack.js              # server-side Paystack helpers
```
