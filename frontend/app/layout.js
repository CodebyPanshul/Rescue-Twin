import './globals.css';
import ClientApp from '../src/components/ClientApp';

export const metadata = {
  title: 'Rescue Twin - Autonomous Disaster Intelligence Platform',
  description: 'Real-time disaster digital twin, AI resource optimization, and decision support for Jammu & Kashmir, India',
  icons: { icon: '/rescue-twin-icon.svg', apple: '/rescue-twin-icon.svg' },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Rescue Twin', statusBarStyle: 'black-translucent' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
