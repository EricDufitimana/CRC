"use client";

import { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DashboardError } from './DashboardError';
import { DashboardLoading } from './DashboardLoading';

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
}

export function DashboardErrorBoundary({ 
  children, 
  loadingFallback = <DashboardLoading /> 
}: DashboardErrorBoundaryProps) {
  const handleReset = () => {
    // Only access window on the client side
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <ErrorBoundary 
      fallback={<DashboardError />}
      onReset={handleReset}
    >
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

