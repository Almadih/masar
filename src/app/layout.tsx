import type { Metadata } from 'next';
import '@/index.css';
import '@/App.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: 'MASAR - Sudan Displacement Archival & Mapping Platform',
  description: "Map Your Path. Share Your Story. Honor the Journey. Sudan Displacement Archival & Mapping Platform.",
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
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
    </html>
  );
}
