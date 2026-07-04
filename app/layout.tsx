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
    template: '%s | Gadget World - Your Premier Electronics Marketplace',
    default: 'Gadget World - Your Premier Electronics Marketplace',
  },
  description: 'Shop quality products at unbeatable prices. Fast delivery, secure payments, and easy returns. Electronics, Fashion, Home & More.',
  keywords: ['online shopping', 'ecommerce', 'electronics', 'gadgets', 'mobile phones', 'computers', 'Gadget World'],
  authors: [{ name: 'Gadget World' }],
  creator: 'Gadget World',
  publisher: 'Gadget World',
  applicationName: 'Gadget World',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gadget World',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gadgetworld.loopnet.tech'),
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Gadget World - Your Premier Electronics Marketplace',
    description: 'Shop quality electronics and gadgets at unbeatable prices with fast delivery and secure payments.',
    url: 'https://gadgetworld.loopnet.tech',
    siteName: 'Gadget World',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gadget World - Your Premier Electronics Marketplace',
    description: 'Shop quality electronics and gadgets at unbeatable prices',
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
