'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero with welcome animation */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.15),transparent)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className={`transition-all duration-1000 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-2xl shadow-sky-500/25 mb-8 animate-float">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              Rescue Twin
            </h1>
            <p className="text-xl sm:text-2xl text-sky-200/90 mb-2">
              AI-Powered Disaster Digital Twin
            </p>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
              Simulate floods and earthquakes for Jammu &amp; Kashmir. Plan evacuations, assess risk, and get AI-backed recommendations—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/simulation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-lg shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Launch Simulation
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 font-medium transition-all"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t border-slate-800 bg-slate-900/50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">What you can do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center hover:border-sky-500/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-sky-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl" aria-hidden>🌊</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Flood simulation</h3>
              <p className="text-slate-400 text-sm">Set severity and rainfall. See risk zones, evacuation routes, and resource needs.</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center hover:border-amber-500/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl" aria-hidden>🏔️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Earthquake scenario</h3>
              <p className="text-slate-400 text-sm">Pick magnitude and epicenter. View shaking intensity and affected districts.</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center hover:border-emerald-500/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl" aria-hidden>🧭</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Evacuation &amp; AI</h3>
              <p className="text-slate-400 text-sm">Evacuation routes, shelter capacity, and explainable AI recommendations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
