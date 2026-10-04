import type { Metadata } from 'next';
import { Inter, Archivo_Black, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const archivoBlack = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--font-archivo' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Kartu Pintar | Kartu NFC dan QR Review Google Maps',
  description: 'Kartu Pintar adalah kartu NFC dan QR yang memudahkan pelanggan memberikan review Google Maps. Cocok untuk UMKM, restoran, toko, hotel, dan bisnis lainnya.',
  keywords: [
    'kartu review Google Maps',
    'kartu NFC Google Maps',
    'kartu QR Google Maps',
    'kartu review NFC',
    'kartu review QR',
    'kartu Google Maps',
    'NFC review card',
    'QR review card',
    'smart review card',
    'kartu digital bisnis',
    'kartu review pelanggan',
  ],
  authors: [{ name: 'Kartu Pintar' }],
  creator: 'Kartu Pintar',
  publisher: 'Kartu Pintar',
  metadataBase: new URL('https://kartupintar.my.id'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Kartu Pintar | Kartu NFC dan QR Review Google Maps',
    description: 'Kartu Pintar adalah kartu NFC dan QR yang memudahkan pelanggan memberikan review Google Maps. Cocok untuk UMKM, restoran, toko, hotel, dan bisnis lainnya.',
    url: 'https://kartupintar.my.id',
    siteName: 'Kartu Pintar',
    images: [
      {
        url: '/logo-kartu-pintar.jpg',
        width: 1200,
        height: 630,
        alt: 'Kartu Pintar - Kartu NFC dan QR Review Google Maps',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kartu Pintar | Kartu NFC dan QR Review Google Maps',
    description: 'Kartu Pintar adalah kartu NFC dan QR yang memudahkan pelanggan memberikan review Google Maps. Cocok untuk UMKM, restoran, toko, hotel, dan bisnis lainnya.',
    images: ['/logo-kartu-pintar.jpg'],
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
  icons: {
    icon: '/logo-kartu-pintar.jpg',
    shortcut: '/favicon.ico',
    apple: '/logo-kartu-pintar.jpg',
  },
  verification: {
    google: 'google459064beba0f0550',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kartu Pintar',
    description: 'Kartu Pintar adalah kartu NFC dan QR yang memudahkan pelanggan memberikan review Google Maps. Cocok untuk UMKM, restoran, toko, hotel, dan bisnis lainnya.',
    url: 'https://kartupintar.my.id',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://kartupintar.my.id/{slug}',
      },
      'query-input': 'required name=slug',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kartu Pintar',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kartupintar.my.id/logo-kartu-pintar.jpg',
      },
    },
  };

  return (
    <html lang="id" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${archivoBlack.variable} ${jetbrainsMono.variable} min-h-full font-sans antialiased text-google-text`}>
        {children}
      </body>
    </html>
  );
}
