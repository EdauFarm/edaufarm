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
    template: '%s | Mkulima Bora - Your Agricultural Marketplace',
    default: 'Mkulima Bora - Fresh Farm Products Direct from Farmers',
  },
  description: 'Connect with local farmers. Buy fresh produce, livestock, seeds, and farm equipment. Direct from farm to table with secure payments and fast delivery.',
  keywords: ['agricultural marketplace', 'farm products', 'fresh produce', 'vegetables', 'fruits', 'livestock', 'seeds', 'farm equipment', 'organic farming', 'Mkulima Bora'],
  authors: [{ name: 'Mkulima Bora' }],
  creator: 'Mkulima Bora',
  publisher: 'Mkulima Bora',
  applicationName: 'Mkulima Bora',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mkulima Bora',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mkulimabora.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Mkulima Bora - Fresh Farm Products Direct from Farmers',
    description: 'Connect with local farmers. Buy fresh produce, livestock, seeds, and farm equipment with secure payments.',
    url: 'https://mkulimabora.com',
    siteName: 'Mkulima Bora',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mkulima Bora - Fresh Farm Products Direct from Farmers',
    description: 'Connect with local farmers for fresh produce and agricultural products',
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
