'use client';

import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-slate-800 bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-300">Rescue Twin</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link href="/simulation" className="hover:text-slate-300 transition-colors">Simulation</Link>
            <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>Rescue Twin v1.0 · AI-powered disaster response for Jammu &amp; Kashmir, India</p>
          <p className="mt-1">Demo only — not for actual emergency use</p>
        </div>
      </div>
    </footer>
  );
}
