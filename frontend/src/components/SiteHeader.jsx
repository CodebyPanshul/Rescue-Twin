'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/simulation', label: 'Simulation' },
  { href: '/about', label: 'About' },
];

export default function SiteHeader() {
  const pathname = (usePathname() || '/').replace(/\/$/, '') || '/';

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/30 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Rescue Twin</span>
              <span className="hidden sm:inline block text-xs text-slate-500">AI-powered disaster digital twin</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1" aria-label="Main">
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
        </div>
      </div>
    </header>
  );
}
