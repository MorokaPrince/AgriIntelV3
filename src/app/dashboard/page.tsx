'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  CalendarIcon,
  UserGroupIcon,
  CloudIcon,
  SunIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  WifiIcon,
  Battery50Icon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardData } from '@/hooks/useRealTimeData';
import { weatherService } from '@/services/weatherService';

const statsCards = [
  {
    title: 'Total Animals',
    value: '0',
    icon: ChartBarIcon,
    color: 'emerald',
    href: '/dashboard/animals'
  },
  {
    title: 'Health Records',
    value: '0',
    icon: HeartIcon,
    color: 'blue',
    href: '/dashboard/health'
  },
  {
    title: 'Financial Overview',
    value: 'R0',
    icon: CurrencyDollarIcon,
    color: 'green',
    href: '/dashboard/financial'
  },
  {
    title: 'Feed Inventory',
    value: '0',
    icon: BeakerIcon,
    color: 'purple',
    href: '/dashboard/feeding'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'animal',
    title: 'New animal added',
    description: 'Cattle #001 registered successfully',
    time: '2 hours ago',
    icon: ChartBarIcon
  },
  {
    id: 2,
    type: 'health',
    title: 'Vaccination completed',
    description: 'Annual vaccination program completed',
    time: '4 hours ago',
    icon: HeartIcon
  },
  {
    id: 3,
    type: 'financial',
    title: 'Feed purchase recorded',
    description: 'R2,500 spent on cattle feed',
    time: '1 day ago',
    icon: CurrencyDollarIcon
  }
];

interface WeatherData {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    animals,
    health,
    financial,
    feeding,
    tasks,
    summary,
    loading,
    error,
    refetch
  } = useDashboardData('demo-farm');

  const [mounted, setMounted] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // For demo purposes, allow access without authentication
  const currentUser = user || {
    _id: 'demo-user',
    name: 'Demo User',
    email: 'demo@agriintel.co.za',
    role: 'admin',
    farmName: 'Demo Farm',
    location: {
      country: 'ZA',
      province: 'Gauteng',
      city: 'Johannesburg'
    },
    preferences: {
      language: 'en',
      currency: 'ZAR',
      timezone: 'Africa/Johannesburg',
      notifications: { email: true, sms: true, push: true }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get user's location from their profile or use geolocation
        const userLocation = currentUser?.location?.city || 'Johannesburg';
        const data = await weatherService.getWeatherData(userLocation);
        setWeatherData(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        // Fallback to Johannesburg if location fails
        try {
          const fallbackData = await weatherService.getWeatherData('Johannesburg');
          setWeatherData(fallbackData);
        } catch (fallbackError) {
          console.error('Fallback weather fetch failed:', fallbackError);
        }
      } finally {
        setWeatherLoading(false);
      }
    };

    if (mounted) {
      fetchWeather();
    }
  }, [mounted, currentUser?.location?.city]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Use real data from the hooks with proper error handling
  const animalsData = (animals.data as unknown[]) || [];
  const healthRecordsData = (health.data as unknown[]) || [];
  const financialRecordsData = (financial.data as unknown[]) || [];
  const feedRecordsData = (feeding.data as unknown[]) || [];
  const rfidRecordsData = [];
  const taskRecordsData = (tasks.data as unknown[]) || [];
  const breedingRecordsData = [];

  // Calculate real statistics from database data
  const totalAnimals = animalsData.length;
  const totalHealthRecords = healthRecordsData.length;
  const totalFinancialRecords = financialRecordsData.length;
  const totalFeedRecords = feedRecordsData.length;
  const totalTasks = taskRecordsData.length;

  // Calculate financial summary with proper error handling
  const totalIncome = financialRecordsData
    .filter((record: unknown) => (record as { type?: string })?.type === 'income')
    .reduce((sum: number, record: unknown) => sum + ((record as { amount?: number })?.amount || 0), 0);

  const totalExpenses = financialRecordsData
    .filter((record: unknown) => (record as { type?: string })?.type === 'expense')
    .reduce((sum: number, record: unknown) => sum + ((record as { amount?: number })?.amount || 0), 0);

  const netProfit = totalIncome - totalExpenses;

  // Calculate health statistics with proper error handling
  const healthyAnimals = animalsData.filter((animal: unknown) =>
    (animal as { health?: { overallCondition?: string } })?.health?.overallCondition === 'excellent' ||
    (animal as { health?: { overallCondition?: string } })?.health?.overallCondition === 'good'
  ).length;

  const totalRecords = totalAnimals + totalHealthRecords + totalFinancialRecords;
  const isBetaExpired = false;
  const assets = [];
  const auctions = [];

  // Use calculated statistics from database data

  const recentActivities = [
    ...animalsData.slice(0, 3).map((_: unknown, index: number) => ({
      id: `animal-${index}`,
      type: 'animal' as const,
      title: 'Animal record available',
      description: `Animal data ready for review`,
      time: 'Available',
      icon: ChartBarIcon,
      color: 'emerald' as const
    })),
    ...financialRecordsData.slice(0, 2).map((_: unknown, index: number) => ({
      id: `financial-${index}`,
      type: 'financial' as const,
      title: 'Financial record available',
      description: `Financial data ready for review`,
      time: 'Available',
      icon: CurrencyDollarIcon,
      color: 'green' as const
    }))
  ].slice(0, 5);

  return (
    <DashboardLayout
      title="Farm Intelligence Dashboard"
      subtitle={`Welcome back, ${currentUser?.name || 'User'}! Here's your comprehensive farm overview.`}
    >
      <div className="space-y-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/images/dashboard/main-dashboard.jpg"
            alt="Dashboard background"
            fill
            className="object-cover"
          />
        </div>

        {/* BETA Banner */}
        {false && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">BETA Version Expired</h3>
                  <p className="text-sm opacity-90">Please upgrade to continue using all features</p>
                </div>
              </div>
              <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">
                Upgrade Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => window.location.href = '/dashboard/animals'}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Animals</p>
                <p className="text-3xl font-bold text-emerald-600">{animalsData.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {healthyAnimals} healthy • {animalsData.length} recent
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => window.location.href = '/dashboard/health'}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Records</p>
                <p className="text-3xl font-bold text-blue-600">{healthRecordsData.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {animalsData.length} animals • {animalsData.length} recent
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <HeartIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => window.location.href = '/dashboard/financial'}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Financial Overview</p>
                <p className="text-3xl font-bold text-green-600">R{(totalIncome - totalExpenses).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  +R{totalIncome.toLocaleString()} / -R{totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => window.location.href = '/dashboard/feeding'}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Feed Inventory</p>
                <p className="text-3xl font-bold text-purple-600">{feedRecordsData.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {feedRecordsData.length} total • 0 low stock
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BeakerIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Weather Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weather Conditions</h3>
              <CloudIcon className="h-6 w-6" />
            </div>

            {weatherLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : weatherData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{weatherData.current.temperature}°C</p>
                    <p className="text-blue-100">{weatherData.current.condition}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100">{weatherData.location.name}</p>
                    <p className="text-blue-200 text-sm">{weatherData.current.humidity}% humidity</p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-sm text-blue-100">Livestock Impact</p>
                  <p className="text-sm font-medium">
                    {weatherData.current.temperature > 30 ? 'High heat stress risk' :
                     weatherData.current.temperature < 5 ? 'Cold stress risk' :
                     'Normal conditions'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-blue-100">
                <p>Weather data unavailable</p>
              </div>
            )}
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Database</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Connected</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Battery50Icon className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Record Limit</span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {totalRecords}/48
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-600">RFID Status</span>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {rfidRecordsData.length} devices
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-gray-600">BETA Status</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isBetaExpired
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {isBetaExpired ? 'Expired' : 'Active'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 bg-${activity.color}-100 rounded-lg`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Comprehensive Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Animal Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Animal Analytics</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    {animalsData.filter((a: unknown) => (a as { species?: string }).species === 'cattle').length}
                  </p>
                  <p className="text-xs text-gray-600">Cattle</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {animalsData.filter((a: unknown) => (a as { species?: string }).species === 'sheep').length}
                  </p>
                  <p className="text-xs text-gray-600">Sheep</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {animalsData.filter((a: unknown) => (a as { species?: string }).species === 'goats').length}
                  </p>
                  <p className="text-xs text-gray-600">Goats</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Health Status Distribution</span>
                </div>
                <div className="space-y-2">
                  {['excellent', 'good', 'fair', 'poor'].map(status => {
                    const count = animalsData.filter((a: unknown) => (a as { health?: { overallCondition?: string } }).health?.overallCondition === status).length;
                    const percentage = animalsData.length > 0 ? (count / animalsData.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize text-gray-600">{status}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status === 'excellent' ? 'bg-green-500' :
                                status === 'good' ? 'bg-blue-500' :
                                status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Analytics</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">+R{totalIncome.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Total Income</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">-R{totalExpenses.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Total Expenses</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Available Data</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Assets</span>
                    <span className="text-sm font-medium text-green-600">{assets.length} records</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Auctions</span>
                    <span className="text-sm font-medium text-blue-600">{auctions.length} records</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative z-10"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <button
              onClick={() => window.location.href = '/dashboard/animals'}
              className="flex flex-col items-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group"
            >
              <ChartBarIcon className="h-8 w-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-emerald-700">Animals</span>
              <span className="text-xs text-emerald-600">{animalsData.length}</span>
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/health'}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <HeartIcon className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-blue-700">Health</span>
              <span className="text-xs text-blue-600">{healthRecordsData.length}</span>
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/financial'}
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <CurrencyDollarIcon className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-green-700">Financial</span>
              <span className="text-xs text-green-600">{financialRecordsData.length}</span>
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/feeding'}
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <BeakerIcon className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-purple-700">Feeding</span>
              <span className="text-xs text-purple-600">{feedRecordsData.length}</span>
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/breeding'}
              className="flex flex-col items-center p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group"
            >
              <UserGroupIcon className="h-8 w-8 text-pink-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-pink-700">Breeding</span>
              <span className="text-xs text-pink-600">{breedingRecordsData.length}</span>
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/rfid'}
              className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
            >
              <DevicePhoneMobileIcon className="h-8 w-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-indigo-700">RFID</span>
              <span className="text-xs text-indigo-600">{rfidRecordsData.length}</span>
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/settings'}
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <ArrowTrendingUpIcon className="h-8 w-8 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Settings</span>
              <span className="text-xs text-gray-600">Config</span>
            </button>
          </div>
        </motion.div>

        {/* Farm Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg p-6 relative z-10"
        >
          <h3 className="text-lg font-semibold mb-4">Farm Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold">Herd Management</h4>
              <p className="text-emerald-100 text-sm">Track and manage your livestock efficiently</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold">Health Monitoring</h4>
              <p className="text-emerald-100 text-sm">Comprehensive health record management</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold">Financial Tracking</h4>
              <p className="text-emerald-100 text-sm">Monitor income, expenses, and profitability</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                <BeakerIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold">Feed Management</h4>
              <p className="text-emerald-100 text-sm">Optimize nutrition and inventory control</p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}