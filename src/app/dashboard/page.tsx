'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  CloudIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardData } from '@/hooks/useRealTimeData';
import { weatherService } from '@/services/weatherService';
import {
  FinancialOverviewChart,
  AnimalPopulationChart
} from '@/components/charts';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdvancedFilters, FilterOptions } from '@/components/ui/AdvancedFilters';
import { PredictiveAnalytics } from '@/components/ui/PredictiveAnalytics';
import { NotificationBell } from '@/components/ui/NotificationBell';
import {
  aggregateAnimalData,
  aggregateFinancialData
} from '@/utils/dashboard-utils';


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

// Dashboard content component that requires authentication
function DashboardContent() {
  const { user } = useAuthStore();
  const {
    animals,
    health,
    financial,
    feeding,
    loading,
    error,
    refetch
  } = useDashboardData('demo-farm');

  const [mounted, setMounted] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    species: [],
    categories: [],
    status: [],
    search: ''
  });

  const currentUser = user!;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const userLocation = currentUser?.location?.city || 'Johannesburg';
        const data = await weatherService.getWeatherData(userLocation);
        setWeatherData(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Initializing dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Farm Intelligence Dashboard"
        subtitle="Loading your data..."
        className="vibrant-gradient"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Farm Intelligence Dashboard"
        subtitle="Error loading dashboard"
        className="vibrant-gradient"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
        >
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </DashboardLayout>
    );
  }

  const animalsData = (animals.data as unknown[]) || [];
  const healthRecordsData = (health.data as unknown[]) || [];
  const financialRecordsData = (financial.data as unknown[]) || [];
  const feedRecordsData = (feeding.data as unknown[]) || [];

  const animalAggregation = aggregateAnimalData(animalsData);
  const financialAggregation = aggregateFinancialData(financialRecordsData);

  // Process data for charts
  const animalPopulationData = animalsData.reduce((acc: Record<string, number>, animal: unknown) => {
    const animalObj = animal as { species?: string };
    const species = animalObj.species || 'Unknown';
    acc[species] = (acc[species] || 0) + 1;
    return acc;
  }, {});

  const financialChartData = financialRecordsData.reduce((acc: { income: number[]; expenses: number[]; labels: string[] }, record: unknown) => {
    const recordObj = record as { date?: string; recordType?: string; amount?: number };
    const month = new Date(recordObj.date || '').toLocaleDateString('en-US', { month: 'short' });
    if (!acc.labels.includes(month)) {
      acc.labels.push(month);
      acc.income.push(0);
      acc.expenses.push(0);
    }
    const index = acc.labels.indexOf(month);
    if (recordObj.recordType === 'income') {
      acc.income[index] += recordObj.amount || 0;
    } else if (recordObj.recordType === 'expense') {
      acc.expenses[index] += recordObj.amount || 0;
    }
    return acc;
  }, { income: [], expenses: [], labels: [] });

  const totalAnimals = animalAggregation.total;
  const healthyAnimals = Math.round((animalAggregation.healthyPercentage / 100) * totalAnimals);
  const totalIncome = financialAggregation.totalIncome;
  const totalExpenses = financialAggregation.totalExpenses;
  const netProfit = financialAggregation.netProfit;
  const totalRecords = animalsData.length + healthRecordsData.length + financialRecordsData.length;

  return (
    <DashboardLayout
      title="Farm Intelligence Dashboard"
      subtitle={`Welcome back, ${currentUser?.name || 'User'}! Here's your comprehensive farm overview.`}
      className="page-header-consistent"
    >
      <div className="space-y-8">
        {/* Metallic Blue Gradient Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 metallic-blue-gradient"></div>

        {/* Real-time Update Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 via-white to-blue-50 text-gray-900 p-3 rounded-lg shadow-lg flex items-center justify-between relative z-10 border border-blue-200"
        >
          <div className="flex items-center">
            <span className="real-time-indicator mr-2"></span>
            <span className="font-medium">Real-time data updates enabled</span>
            <span className="ml-2 text-sm opacity-80">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2" role="toolbar" aria-label="Dashboard actions">
            <NotificationBell />
            <ThemeToggle />
            <button
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => refetch()}
              aria-label="Refresh dashboard data"
            >
              Refresh Data
            </button>
          </div>
        </motion.div>

        {/* Advanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10"
        >
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </motion.div>

        {/* Enhanced Key Metrics Cards with Micro-interactions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
          {/* Animals Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/dashboard/animals'}
            className="cursor-pointer group"
          >
            <div className="metric-card-enhanced relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-sm"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <span className="text-2xl">🐄</span>
                  </motion.div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-medium">Total Animals</p>
                    <motion.p
                      className="text-3xl font-bold text-green-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                      {animalsData.length}
                    </motion.p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <motion.span
                    className="text-sm text-green-600 font-medium flex items-center gap-1"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.span
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ↗
                    </motion.span>
                    +12% from last month
                  </motion.span>
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Health Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/dashboard/health'}
            className="cursor-pointer group"
          >
            <div className="metric-card-enhanced relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl shadow-sm relative"
                    whileHover={{ rotate: -5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <motion.span
                      className="text-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ❤️
                    </motion.span>
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    ></motion.div>
                  </motion.div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-medium">Health Score</p>
                    <motion.p
                      className="text-3xl font-bold text-emerald-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    >
                      {Math.round((healthyAnimals / Math.max(animalsData.length, 1)) * 100)}%
                    </motion.p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <motion.span
                    className="text-sm text-emerald-600 font-medium flex items-center gap-1"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.span
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    >
                      ↗
                    </motion.span>
                    +5% from last week
                  </motion.span>
                  <motion.div
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Net Profit Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/dashboard/financial'}
            className="cursor-pointer group"
          >
            <div className="metric-card-enhanced relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${netProfit >= 0 ? 'from-blue-500/10 to-indigo-500/10' : 'from-red-500/10 to-pink-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className={`p-3 bg-gradient-to-br rounded-xl shadow-sm ${netProfit >= 0 ? 'from-blue-100 to-indigo-100' : 'from-red-100 to-pink-100'}`}
                    whileHover={{ rotate: netProfit >= 0 ? 5 : -5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <motion.span
                      className="text-2xl"
                      animate={{
                        scale: netProfit >= 0 ? [1, 1.1, 1] : [1, 0.9, 1],
                        rotate: netProfit >= 0 ? [0, 5, -5, 0] : [0, -5, 5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      💰
                    </motion.span>
                    <motion.div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${netProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    ></motion.div>
                  </motion.div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-medium">Net Profit</p>
                    <motion.p
                      className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      R{(totalIncome - totalExpenses).toLocaleString()}
                    </motion.p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <motion.span
                    className={`text-sm font-medium flex items-center gap-1 ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.span
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                    >
                      {netProfit >= 0 ? '↗' : '↘'}
                    </motion.span>
                    {netProfit >= 0 ? '+' : ''}{Math.abs(netProfit / Math.max(totalIncome, 1) * 100).toFixed(1)}% from last month
                  </motion.span>
                  <motion.div
                    className={`w-2 h-2 rounded-full ${netProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feed Efficiency Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/dashboard/feeding'}
            className="cursor-pointer group"
          >
            <div className="metric-card-enhanced relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl shadow-sm"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <motion.span
                      className="text-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      🌾
                    </motion.span>
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    ></motion.div>
                  </motion.div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-medium">Feed Efficiency</p>
                    <motion.p
                      className="text-3xl font-bold text-amber-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    >
                      {Math.round((feedRecordsData.length / Math.max(animalsData.length, 1)) * 100)}%
                    </motion.p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <motion.span
                    className="text-sm text-amber-600 font-medium flex items-center gap-1"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.span
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
                    >
                      ↗
                    </motion.span>
                    +8% from last week
                  </motion.span>
                  <motion.div
                    className="w-2 h-2 bg-amber-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Weather Widget Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="consistent-card p-4 sm:p-6 relative z-10 bg-gradient-to-br from-blue-50 via-white to-blue-50 text-gray-900 overflow-hidden"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
            <motion.div
              className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            ></motion.div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.h3
                className="text-lg font-semibold text-gray-900"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Weather Conditions
              </motion.h3>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                {weatherData?.current.condition.includes('sunny') && (
                  <span className="weather-sunny text-3xl">☀️</span>
                )}
                {weatherData?.current.condition.includes('rain') && (
                  <span className="weather-rainy text-3xl">🌧️</span>
                )}
                {weatherData?.current.condition.includes('cloud') && (
                  <span className="weather-cloudy text-3xl">☁️</span>
                )}
                {weatherData?.current.condition.includes('storm') && (
                  <span className="weather-stormy text-3xl">⛈️</span>
                )}
                {!weatherData && <CloudIcon className="h-8 w-8" />}
              </motion.div>
            </div>

            {weatherLoading ? (
              <div className="flex items-center justify-center h-32">
                <motion.div
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </div>
            ) : weatherData ? (
              <div className="space-y-4">
                <motion.div
                  className="text-4xl sm:text-5xl font-bold text-gray-900 data-pulse"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                >
                  {weatherData.current.temperature}°C
                </motion.div>
                <motion.div
                  className="text-blue-600 capitalize text-base sm:text-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  {weatherData.current.condition}
                </motion.div>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <div className="tooltip-interactive bg-blue-50 rounded-lg p-3" data-tooltip="Current humidity level">
                    <p className="text-blue-600 font-medium">Humidity</p>
                    <p className="text-2xl font-semibold text-gray-900">{weatherData.current.humidity}%</p>
                  </div>
                  <div className="tooltip-interactive bg-blue-50 rounded-lg p-3" data-tooltip="Current wind speed">
                    <p className="text-blue-600 font-medium">Wind Speed</p>
                    <p className="text-2xl font-semibold text-gray-900">{weatherData.current.windSpeed} km/h</p>
                  </div>
                </motion.div>
                <motion.div
                  className="mt-4 p-4 bg-blue-50 rounded-lg text-sm border border-blue-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <p className="font-medium text-gray-900 mb-1">🌡️ Weather Insight:</p>
                  <p className="text-blue-700 leading-relaxed">
                    {weatherData.current.temperature > 30 ? '🔥 Hot conditions - ensure animals have shade and water' :
                     weatherData.current.temperature < 10 ? '❄️ Cold conditions - check animal shelter and heating' :
                     '✅ Moderate conditions - ideal for outdoor activities'}
                  </p>
                </motion.div>
              </div>
            ) : (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <CloudIcon className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                <p className="text-blue-200">Weather data unavailable</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
          {/* Total Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="consistent-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-3xl font-bold text-emerald-600">{totalRecords}</p>
                </div>
              </div>
              <div className="text-sm text-emerald-600 font-medium">All farm data combined</div>
            </div>
          </motion.div>

          {/* Health Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="consistent-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <HeartIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Health Records</p>
                  <p className="text-3xl font-bold text-red-600">{healthRecordsData.length}</p>
                </div>
              </div>
              <div className="text-sm text-red-600 font-medium">Animal health monitoring</div>
            </div>
          </motion.div>

          {/* Financial Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="consistent-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Financial Records</p>
                  <p className="text-3xl font-bold text-green-600">{financialRecordsData.length}</p>
                </div>
              </div>
              <div className="text-sm text-green-600 font-medium">Farm financial tracking</div>
            </div>
          </motion.div>

          {/* Feed Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="consistent-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <BeakerIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Feed Records</p>
                  <p className="text-3xl font-bold text-amber-600">{feedRecordsData.length}</p>
                </div>
              </div>
              <div className="text-sm text-amber-600 font-medium">Nutrition management</div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Interactive Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="consistent-card p-6 relative z-10"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Farm Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{animalAggregation.healthyPercentage}%</div>
              <div className="text-sm text-gray-600">Animal Health</div>
              <div className="text-xs text-green-600">+5% this week</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${netProfit > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {netProfit > 0 ? Math.round((netProfit / totalIncome) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Financial Health</div>
              <div className={`text-xs ${netProfit > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {netProfit > 0 ? '+8%' : '-3%'} this month
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {Math.round((feedRecordsData.length / Math.max(animalsData.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Feed Efficiency</div>
              <div className="text-xs text-amber-600">+12% this week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((healthyAnimals / Math.max(animalsData.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Overall Productivity</div>
              <div className="text-xs text-purple-600">+15% this month</div>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Overall Farm Score</div>
                <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {Math.round(((animalAggregation.healthyPercentage + (netProfit > 0 ? (netProfit / totalIncome) * 100 : 0) + (feedRecordsData.length / Math.max(animalsData.length, 1)) * 100) / 3))}%
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                netProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {netProfit >= 0 ? 'Excellent' : 'Needs Attention'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Animal Population Distribution</h3>
            <AnimalPopulationChart data={animalPopulationData} />
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h3>
            <FinancialOverviewChart data={{ income: financialChartData.income, expenses: financialChartData.expenses }} labels={financialChartData.labels} />
          </div>
        </motion.div>

        {/* Predictive Analytics Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="relative z-10"
        >
          <PredictiveAnalytics />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {

  // For demo purposes, allow access without authentication
  // In production, this should require proper authentication
  return <DashboardContent />;
}

