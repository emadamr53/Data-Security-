'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/classical', label: 'Classical Ciphers' },
  { href: '/modern', label: 'Block Ciphers' },
  { href: '/hash', label: 'Hash Functions' },
  { href: '/number-theory', label: 'Number Theory' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="bg-white border-b border-sand-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-5 flex items-center justify-between gap-3" style={{ minHeight: '52px' }}>
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 py-3">
          <span className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white font-black text-xs tracking-tight select-none">
            CV
          </span>
          <span className="font-semibold text-sand-900 group-hover:text-accent transition-colors text-sm">
            CipherVault
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                  ${active
                    ? 'bg-accent/10 text-accent'
                    : 'text-sand-600 hover:text-sand-900 hover:bg-sand-100'
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="md:hidden flex flex-col justify-center gap-1.5 w-10 h-10 rounded-lg hover:bg-sand-100 transition-colors"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-0.5 w-5 bg-sand-800 rounded transition-transform origin-center mx-auto ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`block h-0.5 w-5 bg-sand-800 rounded mx-auto transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span
            className={`block h-0.5 w-5 bg-sand-800 rounded transition-transform origin-center mx-auto ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </div>

      {open && (
        <button
          type="button"
          className="md:hidden fixed inset-0 top-[53px] bg-sand-950/20 z-30"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        id="mobile-nav"
        className={`md:hidden border-t border-sand-200 bg-white transition-all duration-200 overflow-hidden
          ${open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 border-t-0'}`}
        aria-label="Mobile"
      >
        <ul className="px-4 py-2 space-y-0.5">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block px-3 py-3 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'bg-accent/10 text-accent'
                      : 'text-sand-700 hover:bg-sand-100'
                    }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
