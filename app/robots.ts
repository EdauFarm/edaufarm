import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/cart/', '/account/', '/dashboard/', '/auth/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/cart/', '/account/', '/dashboard/', '/auth/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/cart/', '/account/', '/dashboard/', '/auth/'],
      },
    ],
    sitemap: 'https://edaufarm.com/sitemap.xml',
  };
}
