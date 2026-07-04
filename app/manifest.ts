import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Edau Farm - West Pokots Premier Sustainable Farm',
    short_name: 'Edau Farm',
    description: 'Premium honey, fresh fruits, livestock, and poultry from West Pokot.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4CAF50',
    orientation: 'portrait-primary',
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
    categories: ['shopping', 'food'],
  };
}
