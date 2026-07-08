import './globals.css';
import './no-zoom.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import TopBar from '@/components/TopBar.jsx';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Analytics } from '@vercel/analytics/react';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Edau Farm - West Pokot\'s Premier Sustainable Farm',
    default: 'Edau Farm - Premium Honey, Fruits, Livestock & Poultry',
  },
  description: 'West Pokot\'s premier sustainable farm since 2015. Premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry. Order online with M-Pesa delivery across Kenya.',
  keywords: ['edau farm', 'west pokot', 'acacia honey', 'organic honey kenya', 'dorper sheep', 'free-range poultry', 'sustainable farming', 'kenya farm', 'fresh fruits kenya', 'agricultural products', 'kitale farm', 'organic produce'],
  authors: [{ name: 'Edau Farm' }],
  creator: 'Edau Farm',
  publisher: 'Edau Farm',
  applicationName: 'Edau Farm',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Edau Farm',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://edaufarm.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Edau Farm - Premium Honey, Fruits, Livestock & Poultry',
    description: 'West Pokot\'s premier sustainable farm since 2015. Premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry. Order online with M-Pesa.',
    url: 'https://edaufarm.com',
    siteName: 'Edau Farm',
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=1200',
        width: 1200,
        height: 630,
        alt: 'Edau Farm - Sustainable Agriculture in West Pokot, Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edau Farm - West Pokot\'s Premier Sustainable Farm',
    description: 'Premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry from West Pokot, Kenya. Order online.',
    images: ['https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=1200'],
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
  other: {
    'mobile-web-app-capable': 'yes',
    'geo.region': 'KE-42',
    'geo.placename': 'West Pokot County',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <CurrencyProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <TopBar />
                <main className="flex-1 bg-white">{children}</main>
                <Footer />
                <BottomNav />
              </div>
              <Toaster position="top-right" />
              <Analytics />
            </AuthProvider>
          </LanguageProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
