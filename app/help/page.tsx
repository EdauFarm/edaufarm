'use client';

import { useState } from 'react';
import { FiMail, FiPhone, FiMessageCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t } = useLanguage();

  const faqs = [
    {
      question: t('help.faq.trackOrder.q'),
      answer: t('help.faq.trackOrder.a')
    },
    {
      question: t('help.faq.payment.q'),
      answer: t('help.faq.payment.a')
    },
    {
      question: t('help.faq.delivery.q'),
      answer: t('help.faq.delivery.a')
    },
    {
      question: t('help.faq.return.q'),
      answer: t('help.faq.return.a')
    },
    {
      question: t('help.faq.damaged.q'),
      answer: t('help.faq.damaged.a')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('help.hero.title')}
            </h1>
            <p className="text-xl text-orange-100">
              {t('help.hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
          {t('help.contact.title')}
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPhone className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('help.contact.phone')}</h3>
            <p className="text-gray-600 mb-4">
              {t('help.contact.phoneDesc')}
            </p>
            <a href={`tel:${t('help.contact.phoneNumber')}`} className="text-orange-600 font-semibold hover:text-orange-700">
              {t('help.contact.phoneNumber')}
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('help.contact.email')}</h3>
            <p className="text-gray-600 mb-4">
              {t('help.contact.emailDesc')}
            </p>
            <a href={`mailto:${t('help.contact.emailAddress')}`} className="text-orange-600 font-semibold hover:text-orange-700">
              {t('help.contact.emailAddress')}
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('help.contact.chat')}</h3>
            <p className="text-gray-600 mb-4">
              {t('help.contact.chatDesc')}
            </p>
            <button className="text-orange-600 font-semibold hover:text-orange-700">
              {t('help.contact.chatButton')}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
            {t('help.faq.title')}
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <FiChevronUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            {t('help.support.title')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('help.support.desc')}
          </p>
          <a
            href={`mailto:${t('help.contact.emailAddress')}`}
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            {t('help.support.button')}
          </a>
        </div>
      </div>
    </div>
  );
}
