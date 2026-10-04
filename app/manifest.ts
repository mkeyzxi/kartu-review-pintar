import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kartu Pintar - Kartu NFC dan QR Review Google Maps',
    short_name: 'Kartu Pintar',
    description: 'Kartu Pintar adalah kartu NFC dan QR yang memudahkan pelanggan memberikan review Google Maps. Cocok untuk UMKM, restoran, toko, hotel, dan bisnis lainnya.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4285F4',
    icons: [
      {
        src: '/logo-kartu-pintar.jpg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
  };
}
