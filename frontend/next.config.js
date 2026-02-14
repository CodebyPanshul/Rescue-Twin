/** @type {import('next').NextConfig} */

// For GitHub Pages: set NEXT_PUBLIC_BASE_PATH to your repo name, e.g. '/rescue-twin'
// Leave empty for root (e.g. username.github.io)
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = rawBase && String(rawBase).trim() && rawBase !== 'undefined' ? rawBase : '';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
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
