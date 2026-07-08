import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Edau Farm - West Pokots Premier Sustainable Farm',
    short_name: 'Edau Farm',
    description: 'Premium honey, fresh fruits, livestock, and poultry from West Pokot, Kenya. Order online with M-Pesa payment.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2e7d32',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
    categories: ['shopping', 'food', 'lifestyle'],
    shortcuts: [
      {
        name: 'Shop Products',
        short_name: 'Shop',
        url: '/products',
        icons: [{ src: '/icon.svg', sizes: '96x96' }],
      },
      {
        name: 'Farm Visits',
        short_name: 'Visits',
        url: '/farm-visits',
        icons: [{ src: '/icon.svg', sizes: '96x96' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
