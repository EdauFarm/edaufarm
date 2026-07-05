'use client';

import { cn } from '@/lib/utils';
import { FiPackage } from 'react-icons/fi';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  text?: string;
  branded?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  className,
  fullScreen = false,
  text = 'Loading...',
  branded = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className={cn('relative', sizeClasses[size].split(' ').slice(0, 2).join(' '), className)}>
      <div className={cn(
        'absolute inset-0 border-primary-200 rounded-full',
        sizeClasses[size].split(' ')[2]
      )} />
      <div className={cn(
        'absolute inset-0 border-primary-600 rounded-full border-t-transparent animate-spin',
        sizeClasses[size].split(' ')[2]
      )} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="relative flex items-center justify-center">
              {branded ? (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl animate-pulse">
                  <span className="text-4xl">🌾</span>
                </div>
              ) : (
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin" />
                </div>
              )}
            </div>
          </div>
          {branded && (
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent mb-2">
              EDAU FARM
            </h2>
          )}
          <div className="flex gap-2 justify-center mt-4">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12">
      {spinner}
      {text && <span className="ml-3 text-primary-600">{text}</span>}
    </div>
  );
}
