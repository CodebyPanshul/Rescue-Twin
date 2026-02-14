'use client';

// Re-export so dynamic() in page.js imports from same route — avoids ChunkLoadError / _next/undefined
export { default } from '../../src/components/MapComponent';
