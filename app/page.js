import Link from 'next/link';
import Navigation from '../components/Navigation';

const modules = [
  {
    href: '/classical',
    label: 'Classical Ciphers',
    lecture: 'Lecture 2',
    desc: 'Substitution and transposition techniques from pre-computer cryptography.',
    items: ['Caesar Cipher', 'Vigenère Cipher', 'Playfair Cipher', 'Rail Fence', 'Columnar Transposition'],
  },
  {
    href: '/modern',
    label: 'Block Ciphers',
    lecture: 'Lectures 3 & 4',
    desc: 'Symmetric encryption algorithms designed for modern computers.',
    items: ['DES — Feistel, 16 rounds, 56-bit', 'AES — SPN, 128/192/256-bit', 'CBC / ECB modes'],
  },
  {
    href: '/hash',
    label: 'Hash Functions',
    lecture: 'Lecture 6',
    desc: 'One-way functions for data integrity and password storage.',
    items: ['MD5, SHA-1, SHA-256, SHA-512', 'Avalanche effect demo', 'Birthday Attack visualizer'],
  },
  {
    href: '/number-theory',
    label: 'Number Theory',
    lecture: 'Lectures 7 & 8',
    desc: 'Mathematical foundations underlying public-key cryptography.',
    items: ['GCD — Euclidean Algorithm', 'Modular Arithmetic', 'Prime Checker & Sieve', 'Prime Factorization'],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-sand-100">
      <Navigation />

      <main className="max-w-4xl mx-auto px-5 py-14">
        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            ECE 4304 · Data Security · AAST
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-sand-950 tracking-tight mb-3">
            CipherVault
          </h1>
          <p className="text-lg text-sand-600 max-w-xl leading-relaxed">
            An interactive toolkit covering every algorithm from the Data Security course —
            encrypt, decrypt, and step through each computation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/classical" className="btn-primary">Start with Classical →</Link>
            <Link href="/number-theory" className="btn-outline">Number Theory</Link>
          </div>
        </div>

        {/* Module grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {modules.map((m) => (
            <Link key={m.href} href={m.href}
              className="card group hover:border-accent/40 hover:shadow-card-md transition-all duration-200 block">
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-bold text-sand-900 group-hover:text-accent transition-colors">
                  {m.label}
                </h2>
                <span className="badge badge-gray ml-2 shrink-0">{m.lecture}</span>
              </div>
              <p className="text-sm text-sand-500 mb-4 leading-relaxed">{m.desc}</p>
              <ul className="space-y-1">
                {m.items.map((item) => (
                  <li key={item} className="text-xs text-sand-500 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-sand-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* Info strip */}
        <div className="mt-10 card-sm flex flex-wrap gap-8 items-center">
          {[
            ['9+', 'Algorithms'],
            ['28 / 28', 'Tests passing'],
            ['Lecture-accurate', 'Step-by-step'],
            ['crypto-js', 'DES · AES · MD5 · SHA'],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="text-sm font-bold text-sand-900">{v}</div>
              <div className="text-xs text-sand-500">{l}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-sand-200 bg-white mt-10">
        <div className="max-w-4xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-sand-400">
          <span>CipherVault · ECE 4304 Data Security</span>
          <span>Adham Mohamed (231007979) · Amr Emad (231007784) · Dr. Amina El Hawary</span>
        </div>
      </footer>
    </div>
  );
}
