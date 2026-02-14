'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/simulation', label: 'Simulation' },
  { href: '/about', label: 'About' },
];

export default function SiteHeader() {
  const pathname = (usePathname() || '/').replace(/\/$/, '') || '/';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm safe-area-inset-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/30 transition-shadow shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-lg font-bold text-white tracking-tight block truncate">Rescue Twin</span>
              <span className="hidden sm:inline block text-xs text-slate-500">AI-powered disaster digital twin</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {navItems.map(({ href, label }) => {
              const norm = (p) => (p || '/').replace(/\/$/, '') || '/';
              const isActive = norm(pathname) === norm(href) || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2.5 -mr-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-over menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="fixed top-0 right-0 bottom-0 w-full max-w-[280px] bg-slate-900 border-l border-slate-800 z-50 flex flex-col pt-20 px-4 pb-6 md:hidden animate-slide-in-right"
            aria-label="Main menu"
          >
            <div className="flex flex-col gap-1">
              {navItems.map(({ href, label }) => {
                const norm = (p) => (p || '/').replace(/\/$/, '') || '/';
                const isActive = norm(pathname) === norm(href) || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3.5 rounded-xl text-base font-medium transition-colors touch-manipulation min-h-[48px] flex items-center ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
