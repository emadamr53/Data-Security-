import './globals.css';

export const metadata = {
  title: 'CipherVault — Encryption & Security Toolkit',
  description: 'Interactive educational toolkit for ECE 4304 Data Security at AAST. Covers classical ciphers, DES/AES, hash functions, and number theory.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
