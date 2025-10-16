'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChartBarIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  HomeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
  ChartPieIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { useLanguageStore } from '@/stores/language-store';

interface NavigationItem {
  id: string;
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  badge?: string;
  requiredTier?: 'beta' | 'professional' | 'enterprise';
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    id: 'animals',
    name: 'Animal Management',
    icon: ChartBarIcon,
    children: [
      { id: 'animals-overview', name: 'Overview', href: '/dashboard/animals', icon: ChartBarIcon },
      { id: 'animals-add', name: 'Add Animal', href: '/dashboard/animals/add', icon: ChartBarIcon },
      { id: 'animals-groups', name: 'Groups & Herds', href: '/dashboard/animals/groups', icon: UserGroupIcon },
      { id: 'animals-growth', name: 'Growth Tracking', href: '/dashboard/animals/growth', icon: ArrowTrendingUpIcon },
      { id: 'animals-genetics', name: 'Genetics', href: '/dashboard/animals/genetics', icon: DocumentTextIcon },
    ],
  },
  {
    id: 'health',
    name: 'Health & Welfare',
    icon: HeartIcon,
    children: [
      { id: 'health-overview', name: 'Overview', href: '/dashboard/health', icon: HeartIcon },
      { id: 'health-vaccinations', name: 'Vaccinations', href: '/dashboard/health/vaccinations', icon: ShieldCheckIcon },
      { id: 'health-diseases', name: 'Disease Monitoring', href: '/dashboard/health/diseases', icon: HeartIcon },
      { id: 'health-treatments', name: 'Treatments', href: '/dashboard/health/treatments', icon: ClipboardDocumentListIcon },
      { id: 'health-appointments', name: 'Appointments', href: '/dashboard/health/appointments', icon: CalendarIcon },
    ],
  },
  {
    id: 'feeding',
    name: 'Feed & Nutrition',
    icon: BeakerIcon,
    children: [
      { id: 'feeding-overview', name: 'Overview', href: '/dashboard/feeding', icon: BeakerIcon },
      { id: 'feeding-inventory', name: 'Inventory', href: '/dashboard/feeding/inventory', icon: ClipboardDocumentListIcon },
      { id: 'feeding-rations', name: 'Rations', href: '/dashboard/feeding/rations', icon: CalculatorIcon },
      { id: 'feeding-schedules', name: 'Schedules', href: '/dashboard/feeding/schedules', icon: CalendarIcon },
    ],
  },
  {
    id: 'financial',
    name: 'Financial Management',
    icon: CurrencyDollarIcon,
    children: [
      { id: 'financial-overview', name: 'Overview', href: '/dashboard/financial', icon: CurrencyDollarIcon },
      { id: 'financial-transactions', name: 'Transactions', href: '/dashboard/financial/transactions', icon: BanknotesIcon },
      { id: 'financial-budgets', name: 'Budgets', href: '/dashboard/financial/budgets', icon: ChartPieIcon },
      { id: 'financial-analysis', name: 'Analysis', href: '/dashboard/financial/analysis', icon: ArrowTrendingUpIcon },
    ],
  },
  {
    id: 'breeding',
    name: 'Breeding Program',
    href: '/dashboard/breeding',
    icon: HeartIcon,
  },
  {
    id: 'rfid',
    name: 'RFID Technology',
    href: '/dashboard/rfid',
    icon: CpuChipIcon,
  },
  {
    id: 'settings',
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon,
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const { translate } = useLanguageStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['animals', 'health', 'feeding', 'financial']);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set CSS custom properties for theming
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-gradient-background', theme.gradients.background);
    root.style.setProperty('--theme-surface-alpha', `${theme.colors.surface}f0`);
    root.style.setProperty('--theme-border', theme.colors.border);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-background', theme.colors.background);
  }, [theme]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newExpanded = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      return newExpanded;
    });
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return window.location.pathname === href || (href !== '/dashboard' && window.location.pathname.startsWith(href));
  };

  const hasActiveChild = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some(child => isActive(child.href));
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className={`flex flex-col h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'}`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${sidebarCollapsed ? 'px-3' : ''}`}>
            {(!sidebarCollapsed) && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">AgriIntel</h1>
                  <p className="text-xs text-gray-500">Smart Farm</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4" role="navigation" aria-label="Main navigation">
            <div className="space-y-1 px-3">
              {navigationItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.id);
                const itemIsActive = isActive(item.href) || hasActiveChild(item.children);

                return (
                  <div key={item.id}>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            toggleExpanded(item.id);
                          } else if (item.href) {
                            handleNavigation(item.href);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          itemIsActive
                            ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        {...(hasChildren && { 'aria-expanded': isExpanded })}
                      >
                        <div className="flex items-center min-w-0">
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${itemIsActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                          {(!sidebarCollapsed) && (
                            <span className="ml-3 truncate">{item.name}</span>
                          )}
                        </div>
                        {hasChildren && (!sidebarCollapsed) && (
                          <ChevronDownIcon
                            className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        )}
                      </button>

                      {/* Sub-navigation */}
                      <AnimatePresence>
                        {hasChildren && isExpanded && (!sidebarCollapsed) && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-1 ml-8 space-y-1 overflow-hidden"
                          >
                            {item.children?.map((child) => (
                              <div key={child.id}>
                                <button
                                  type="button"
                                  onClick={() => child.href && handleNavigation(child.href)}
                                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                    isActive(child.href)
                                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                  }`}
                                >
                                  <child.icon className={`h-4 w-4 mr-3 ${isActive(child.href) ? 'text-emerald-600' : 'text-gray-400'}`} />
                                  {child.name}
                                </button>
                              </div>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* User Info */}
          {(!sidebarCollapsed) && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-emerald-700">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.tier || 'Beta'} Plan</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center">
                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open navigation menu"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Page Title */}
                <div className="ml-4">
                  {title && (
                    <h1 className="text-xl font-semibold text-gray-900">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm mt-0.5 text-gray-600">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="hidden md:block relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Notifications */}
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-5 w-5" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-sm font-medium text-emerald-700">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.tier || 'Beta'} Plan</p>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />

                      {/* Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
                        style={{ top: '100%', transformOrigin: 'top right' }}
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-lg font-medium text-emerald-700">
                                {user?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                              <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                              <p className="text-xs text-emerald-600 font-medium">{user?.tier || 'Beta'} Plan</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/dashboard/settings');
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <UserCircleIcon className="h-4 w-4 mr-3" />
                            Profile Settings
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowUserMenu(false);
                              // Handle upgrade
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Upgrade Plan
                          </button>

                          <div className="border-t border-gray-200 my-2" />

                          <button
                            type="button"
                            onClick={() => {
                              setShowUserMenu(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Custom Actions */}
                {actions && (
                  <div className="flex items-center space-x-2">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}