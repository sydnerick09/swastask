import './globals.css';

export const metadata = {
  title: 'Pay Securely · Paystack',
  description: 'Make a secure payment powered by Paystack.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
