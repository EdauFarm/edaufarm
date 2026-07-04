'use client';

import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import DashboardContent from './DashboardContent';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
