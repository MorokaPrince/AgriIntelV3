'use client';

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ChartBarIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  CalendarIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/auth-store';

interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  color: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    href: '/dashboard',
    color: 'emerald'
  },
  {
    id: 'animals',
    label: 'Animals',
    icon: ChartBarIcon,
    href: '/dashboard/animals',
    color: 'emerald'
  },
  {
    id: 'health',
    label: 'Health',
    icon: HeartIcon,
    href: '/dashboard/health',
    color: 'blue'
  },
  {
    id: 'financial',
    label: 'Financial',
    icon: CurrencyDollarIcon,
    href: '/dashboard/financial',
    color: 'green'
  },
  {
    id: 'feeding',
    label: 'Feeding',
    icon: BeakerIcon,
    href: '/dashboard/feeding',
    color: 'purple'
  },
  {
    id: 'breeding',
    label: 'Breeding',
    icon: UserGroupIcon,
    href: '/dashboard/breeding',
    color: 'pink'
  },
  {
    id: 'rfid',
    label: 'RFID',
    icon: DevicePhoneMobileIcon,
    href: '/dashboard/rfid',
    color: 'indigo'
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CalendarIcon,
    href: '/dashboard/tasks',
    color: 'orange'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: CogIcon,
    href: '/dashboard/settings',
    color: 'gray'
  }
];

export default function DashboardLayout({
  title,
  subtitle,
  children,
  className = ''
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const { user } = useAuthStore();

  const currentUser = user || {
    name: 'Demo User',
    email: 'demo@agriintel.co.za',
    role: 'admin'
  };

  const handleNavigation = (itemId: string, href: string) => {
    setActiveItem(itemId);
    setSidebarOpen(false);
    window.location.href = href;
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">AgriIntel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id, item.href)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? `bg-${item.color}-100 text-${item.color}-700 dark:bg-${item.color}-900 dark:text-${item.color}-300`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? `text-${item.color}-500` : ''}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`ml-3 inline-block py-0.5 px-2 text-xs rounded-full bg-${item.color}-200 text-${item.color}-800`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              AgriIntel Dashboard v3.0
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Open sidebar menu"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div className="lg:hidden ml-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                {(title || subtitle) && (
                  <div className="ml-4 lg:ml-0">
                    {title && (
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-label="View notifications">
                  <BellIcon className="h-6 w-6" />
                </button>
                <div className="relative">
                  <button className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="hidden md:block">{currentUser.name}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}