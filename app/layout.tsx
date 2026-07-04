import './globals.css';
import './no-zoom.css';
import type { Metadata } from 'next';
import TopBar from '@/components/TopBar.jsx';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Analytics } from '@vercel/analytics/react';
import WelcomeTutorialWrapper from '@/components/WelcomeTutorialWrapper';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Edau Farm - West Pokot\'s Premier Sustainable Farm',
    default: 'Edau Farm - Premium Honey, Fruits, Livestock & Poultry',
  },
  description: 'West Pokot\'s premier sustainable farm. Premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry. Tradition meets sustainability.',
  keywords: ['edau farm', 'west pokot', 'acacia honey', 'organic honey', 'dorper sheep', 'free-range poultry', 'sustainable farming', 'kenya farm', 'fresh fruits', 'agricultural products'],
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
    description: 'West Pokot\'s premier sustainable farm. Premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry.',
    url: 'https://edaufarm.com',
    siteName: 'Edau Farm',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edau Farm - West Pokot\'s Premier Sustainable Farm',
    description: 'Premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry from West Pokot, Kenya.',
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <TopBar />
                <main className="flex-1 bg-gray-50">{children}</main>
                <Footer />
                <BottomNav />
              </div>
              <Toaster position="top-right" />
              <WelcomeTutorialWrapper />
              <Analytics />
            </AuthProvider>
          </LanguageProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
