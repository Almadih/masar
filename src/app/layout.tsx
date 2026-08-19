import type { Metadata, Viewport } from 'next';
import '@/index.css';
import '@/App.css';
import 'leaflet/dist/leaflet.css';
import { Analytics } from "@vercel/analytics/next"

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://masar-sudan.org');

export const viewport: Viewport = {
  themeColor: '#0B0F19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'مسار - منصة أرشفة وخريطة رحلات النزوح السودانية | MASAR',
    template: '%s | MASAR (مسار)',
  },
  description:
    'منصة تفاعلية توثق مسارات وذكريات النزوح الإنساني في السودان عبر الخرائط التفاعلية والصور المؤرخة لحفظ الذاكرة الوطنية والتكاتف المجتمعي.',
  applicationName: 'MASAR (مسار)',
  authors: [{ name: 'MASAR Platform Team' }],
  generator: 'Next.js',
  keywords: [
    'مسار',
    'السودان',
    'نزوح السودان',
    'توثيق النزوح',
    'خريطة النزوح السوداني',
    'حرب السودان',
    'MASAR',
    'Sudan Displacement',
    'Sudan Photo Archive',
    'Sudan Mapping Platform',
    'Sudan War Stories',
    'Sudanese Resilience',
  ],
  creator: 'MASAR',
  publisher: 'MASAR Archive',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo.jpg', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/logo.jpg' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'ar_SD',
    alternateLocale: ['en_US'],
    url: '/',
    siteName: 'MASAR (مسار)',
    title: 'مسار - منصة أرشفة وخريطة رحلات النزوح السودانية | MASAR',
    description:
      'منصة تفاعلية توثق مسارات وذكريات النزوح الإنساني في السودان عبر الخرائط التفاعلية والصور المؤرخة لحفظ الذاكرة الوطنية.',
    images: [
      {
        url: '/og-image.jpg',
        secureUrl: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MASAR (مسار) - Sudan Displacement Archival & Mapping Platform',
        type: 'image/jpeg',
      },
      {
        url: '/logo.jpg',
        secureUrl: '/logo.jpg',
        width: 1024,
        height: 1024,
        alt: 'MASAR Logo',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مسار - منصة أرشفة وخريطة رحلات النزوح السودانية | MASAR',
    description:
      'منصة تفاعلية توثق مسارات وذكريات النزوح الإنساني في السودان عبر الخرائط التفاعلية والصور المؤرخة لحفظ الذاكرة الوطنية.',
    images: ['/og-image.jpg'],
    creator: '@masar_sudan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />
        <meta property="og:image:secure_url" content={`${siteUrl}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="twitter:image" content={`${siteUrl}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var loc = localStorage.getItem('masar_locale') || 'ar';
                document.documentElement.lang = loc;
                document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
              } catch (e) {}
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var i = 0; i < registrations.length; i++) {
                    registrations[i].unregister();
                  }
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var i = 0; i < names.length; i++) {
                      caches.delete(names[i]);
                    }
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
