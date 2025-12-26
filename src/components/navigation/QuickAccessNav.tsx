'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HomeIcon,
  ChartBarIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  CloudIcon,
  CogIcon,
  DocumentTextIcon,
  BellIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface QuickAccessItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  notificationCount?: number;
  isActive?: boolean;
}

interface QuickAccessNavProps {
  items: QuickAccessItem[];
  className?: string;
  onItemClick?: (item: QuickAccessItem) => void;
}

export const QuickAccessNav: React.FC<QuickAccessNavProps> = ({
  items,
  className = '',
  onItemClick
}) => {
  // Default quick access items if none provided
  const defaultItems: QuickAccessItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      href: '/dashboard',
      isActive: true
    },
    {
      id: 'animals',
      title: 'Animals',
      icon: <HeartIcon className="h-5 w-5" />,
      href: '/dashboard/animals',
      notificationCount: 2
    },
    {
      id: 'health',
      title: 'Health',
      icon: <HeartIcon className="h-5 w-5" />,
      href: '/dashboard/health'
    },
    {
      id: 'financial',
      title: 'Financial',
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
      href: '/dashboard/financial',
      notificationCount: 1
    },
    {
      id: 'feeding',
      title: 'Feeding',
      icon: <BeakerIcon className="h-5 w-5" />,
      href: '/dashboard/feeding'
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <CloudIcon className="h-5 w-5" />,
      href: '/dashboard/weather'
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: <DocumentTextIcon className="h-5 w-5" />,
      href: '/dashboard/reports'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <CogIcon className="h-5 w-5" />,
      href: '/dashboard/settings'
    }
  ];

  const navItems = items.length > 0 ? items : defaultItems;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`quick-access-nav bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg ${className}`}
    >
      <div className="p-4">
        <h3 className="text-sm font-semibold text-blue-100 uppercase tracking-wide mb-3 flex items-center">
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Quick Access
        </h3>

        <div className="space-y-1">
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <Link
                href={item.href}
                className={`quick-access-item group ${item.isActive ? 'bg-white/10 border-l-2 border-white' : 'hover:bg-white/5'}`}
                onClick={() => onItemClick?.(item)}
              >
                <span className="quick-access-icon group-hover:translate-x-1 transition-transform">
                  {item.icon}
                </span>
                <span className="flex-1 text-sm font-medium">{item.title}</span>
                {item.notificationCount && (
                  <span className="notification-badge" data-count={item.notificationCount}>
                    {item.notificationCount}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <Link
            href="/notifications"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center">
              <BellIcon className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            <span className="badge-enhanced badge-info">3 new</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};