'use client';

/** Sleek “Coming Soon” expansion banner with gradient and subtle animation. */
export default function ComingSoonBanner() {
  return (
    <div className="relative rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-violet-950/40 overflow-hidden animate-gradient-shift bg-[length:200%_200%]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(251,191,36,0.08),transparent)]" />
      <div className="relative px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-4">
        <span className="text-3xl sm:text-4xl shrink-0" aria-hidden>🚧</span>
        <div>
          <p className="text-sm sm:text-base font-semibold text-amber-200/95">
            Real-time adaptive support for Earthquakes, Cyclones & Multi-Disaster Intelligence — Coming Soon
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Extended hazard types and cross-disaster correlation will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
