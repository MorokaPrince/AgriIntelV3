'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/components/auth/LoginPage';

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <LoginPage />;
  }

  return <MainLayout />;
}
