'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const { setCurrency } = useCurrency();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }

    // Auto-detect country/currency
    if (!session && typeof window !== 'undefined') {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          // Example: USD, EUR, GBP, KES, etc.
          const countryCurrencyMap: Record<string, any> = {
            KE: { code: 'KES', symbol: 'Ksh', name: 'Kenyan Shilling' },
            US: { code: 'USD', symbol: '$', name: 'US Dollar' },
            GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
            // Add more as needed
          };
          const detectedCurrency = countryCurrencyMap[data.country_code] || { code: 'USD', symbol: '$', name: 'US Dollar' };
          setCurrency(detectedCurrency);
        });
    }
  }, [session, setCurrency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.phone) {
      toast.error('Phone number is required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      // Check if verification is required
      if (response.data.requiresVerification) {
        // Store callback URL in sessionStorage for after verification
        if (callbackUrl && callbackUrl !== '/') {
          sessionStorage.setItem('authCallbackUrl', callbackUrl);
        }
        toast.success('Account created! Check your email for verification link.');
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.success('Account created successfully! Redirecting...');
        router.push('/products');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🌾</span>
            <h1 className="text-3xl font-bold text-primary-700">Edau Farm</h1>
          </div>
          <p className="text-gray-500 text-sm">Create your account</p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white border border-gray-200 rounded p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create Account
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="+254 700 000 000"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="mt-6 text-center bg-white border border-gray-200 rounded p-6">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-gray-900 hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
