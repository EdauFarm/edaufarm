'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else if (email) {
      setIsLoading(false);
    } else {
      router.push('/auth/signup');
    }
  }, [token, email, router]);

  const verifyEmail = async () => {
    try {
      setIsLoading(true);
      setError('');

      const callbackUrl = sessionStorage.getItem('authCallbackUrl') || '/';
      
      const response = await fetch(`/api/auth/verify-email?token=${token}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        sessionStorage.removeItem('authCallbackUrl');
        router.push(`/auth/signin?verified=true&email=${encodeURIComponent(data.user.email)}&callbackUrl=${encodeURIComponent(data.callbackUrl)}`);
      }, 2000);

    } catch (error) {
      setError('An error occurred during verification');
      setIsLoading(false);
    }
  };

  if (isLoading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-800 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Your Email</h2>
          <p className="text-slate-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 transition-colors"
            >
              Create New Account
            </button>
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
          <p className="text-slate-600 mb-4">
            Your email has been successfully verified. Redirecting to sign in...
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <FiLoader className="animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h2>
        <p className="text-slate-600 mb-6">
          We've sent a verification link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Click the link in the email to verify your account. The link will expire in 24 hours.
        </p>
        <button
          onClick={() => router.push('/auth/signin')}
          className="w-full border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
