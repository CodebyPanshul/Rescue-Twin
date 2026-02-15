'use client';

/**
 * Reusable loading spinner. Size: 'sm' | 'md' | 'lg'
 */
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-10 w-10 border-2' : 'h-5 w-5 border-2';
  return (
    <span
      className={`inline-block rounded-full border-sky-500/30 border-t-sky-400 animate-spin ${sizeClass} ${className}`}
      aria-hidden
    />
  );
}

/**
 * Full-width loading state for cards/sections.
 */
export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 text-slate-400 py-6">
      <LoadingSpinner size="md" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
