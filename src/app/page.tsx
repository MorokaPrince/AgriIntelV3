'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect authenticated users to dashboard
        router.push('/dashboard');
      } else {
        // Redirect unauthenticated users to login
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
