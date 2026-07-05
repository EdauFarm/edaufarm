'use client';

import { useState } from 'react';
import { FiMail, FiCheck, FiLoader } from 'react-icons/fi';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setEmail('');
        setName('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Newsletter error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl p-8 sm:p-12 text-center border border-primary-100">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re subscribed!</h3>
        <p className="text-gray-600">Thank you for joining the Edau Farm community. Check your inbox for a welcome email.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl p-8 sm:p-12 text-center border border-primary-100">
      <div className="text-4xl mb-4">📬</div>
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Stay Updated</h3>
      <p className="text-gray-600 mb-6 max-w-xl mx-auto">
        Get notified about seasonal harvests, special offers, and farm updates. Be the first to know when fresh products are available!
      </p>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}
