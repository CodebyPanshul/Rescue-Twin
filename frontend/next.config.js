/** @type {import('next').NextConfig} */

// For GitHub Pages: set NEXT_PUBLIC_BASE_PATH to your repo name, e.g. '/rescue-twin'
// Leave empty for root (e.g. username.github.io)
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = rawBase && String(rawBase).trim() && rawBase !== 'undefined' ? rawBase : '';

// Use static export only for production build (npm run build). Dev server runs normally.
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  reactStrictMode: true,
  ...(isDev ? {} : { output: 'export' }),
  basePath: isDev ? '' : basePath,
  assetPrefix: basePath && !isDev ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  // In dev, proxy /api to backend so the browser makes same-origin requests (no CORS)
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://127.0.0.1:8000/:path*' },
    ];
  },
};

module.exports = nextConfig;
