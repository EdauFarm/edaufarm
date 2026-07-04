'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiTrendingUp, FiPackage, FiDollarSign, FiUsers, FiBarChart } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SellPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('sell.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              {t('sell.hero.subtitle')}
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-50 transition-colors shadow-lg"
            >
              {t('sell.hero.cta')}
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          {t('sell.why.title')}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FiUsers className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('sell.benefit.customers.title')}</h3>
            <p className="text-gray-600">
              {t('sell.benefit.customers.desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FiPackage className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('sell.benefit.listing.title')}</h3>
            <p className="text-gray-600">
              {t('sell.benefit.listing.desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FiDollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('sell.benefit.fees.title')}</h3>
            <p className="text-gray-600">
              {t('sell.benefit.fees.desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FiBarChart className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('sell.benefit.analytics.title')}</h3>
            <p className="text-gray-600">
              {t('sell.benefit.analytics.desc')}
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('sell.howItWorks.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('sell.step1.title')}</h3>
              <p className="text-gray-600">
                {t('sell.step1.desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('sell.step2.title')}</h3>
              <p className="text-gray-600">
                {t('sell.step2.desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('sell.step3.title')}</h3>
              <p className="text-gray-600">
                {t('sell.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('sell.ready.title')}
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            {t('sell.ready.desc')}
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-50 transition-colors shadow-lg"
          >
            {t('sell.ready.cta')}
          </button>
        </div>
      </div>
    </div>
  );
}
