'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ChartBarIcon,
  BeakerIcon,
  ScaleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const feedingStats = [
  {
    title: 'Total Feed Stock',
    value: '2,450 kg',
    change: '+5%',
    trend: 'up',
    icon: ScaleIcon,
    color: 'blue'
  },
  {
    title: 'Daily Consumption',
    value: '180 kg',
    change: '+12%',
    trend: 'up',
    icon: ChartBarIcon,
    color: 'green'
  },
  {
    title: 'Feed Efficiency',
    value: '92%',
    change: '+3%',
    trend: 'up',
    icon: BeakerIcon,
    color: 'purple'
  },
  {
    title: 'Days Until Reorder',
    value: '8 days',
    change: 'Low stock alert',
    trend: 'warning',
    icon: ExclamationTriangleIcon,
    color: 'yellow'
  }
];

const feedInventory = [
  {
    id: 1,
    name: 'Premium Cattle Feed',
    type: 'concentrate',
    currentStock: 850,
    unit: 'kg',
    minStock: 200,
    maxStock: 1000,
    costPerKg: 12.50,
    supplier: 'AgriFeed Suppliers',
    expiryDate: '2024-06-15',
    quality: 'premium',
    nutritionalValue: {
      protein: 18,
      energy: 12.5,
      fiber: 8.2,
      fat: 4.1
    }
  },
  {
    id: 2,
    name: 'Grass Hay',
    type: 'roughage',
    currentStock: 1200,
    unit: 'kg',
    minStock: 300,
    maxStock: 1500,
    costPerKg: 3.20,
    supplier: 'Local Farmers Co-op',
    expiryDate: '2024-08-20',
    quality: 'standard',
    nutritionalValue: {
      protein: 8,
      energy: 8.1,
      fiber: 32.5,
      fat: 2.1
    }
  },
  {
    id: 3,
    name: 'Mineral Mix',
    type: 'supplement',
    currentStock: 45,
    unit: 'kg',
    minStock: 20,
    maxStock: 100,
    costPerKg: 25.00,
    supplier: 'AgriHealth Products',
    expiryDate: '2024-12-01',
    quality: 'premium',
    nutritionalValue: {
      protein: 0,
      energy: 0,
      fiber: 0,
      fat: 0,
      minerals: 'Complete vitamin & mineral mix'
    }
  },
  {
    id: 4,
    name: 'Maize Silage',
    type: 'silage',
    currentStock: 280,
    unit: 'kg',
    minStock: 100,
    maxStock: 500,
    costPerKg: 4.80,
    supplier: 'Farm Fresh Silage',
    expiryDate: '2024-04-30',
    quality: 'standard',
    nutritionalValue: {
      protein: 7,
      energy: 10.2,
      fiber: 25.8,
      fat: 3.2
    }
  },
  {
    id: 5,
    name: 'Protein Supplement',
    type: 'supplement',
    currentStock: 75,
    unit: 'kg',
    minStock: 25,
    maxStock: 150,
    costPerKg: 18.75,
    supplier: 'AgriHealth Products',
    expiryDate: '2024-09-15',
    quality: 'premium',
    nutritionalValue: {
      protein: 45,
      energy: 15.8,
      fiber: 2.1,
      fat: 1.8
    }
  }
];

const feedingSchedules = [
  {
    id: 1,
    animalGroup: 'Dairy Cows',
    feedType: 'Premium Cattle Feed',
    amount: 8,
    unit: 'kg',
    frequency: 'twice_daily',
    times: ['06:00', '18:00'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    specialInstructions: 'Increase by 1kg during lactation period',
    status: 'active'
  },
  {
    id: 2,
    animalGroup: 'Beef Cattle',
    feedType: 'Grass Hay',
    amount: 12,
    unit: 'kg',
    frequency: 'daily',
    times: ['07:00'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    specialInstructions: 'Supplement with minerals during dry season',
    status: 'active'
  },
  {
    id: 3,
    animalGroup: 'Sheep',
    feedType: 'Grass Hay',
    amount: 2.5,
    unit: 'kg',
    frequency: 'twice_daily',
    times: ['06:30', '17:30'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    specialInstructions: 'Monitor for bloat, reduce if necessary',
    status: 'active'
  },
  {
    id: 4,
    animalGroup: 'Calves',
    feedType: 'Premium Cattle Feed',
    amount: 3,
    unit: 'kg',
    frequency: 'twice_daily',
    times: ['07:00', '19:00'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    specialInstructions: 'Gradually increase as calves grow',
    status: 'active'
  }
];

const nutritionAnalysis = [
  {
    animalGroup: 'Dairy Cows',
    current: {
      protein: 16.2,
      energy: 11.8,
      fiber: 18.5,
      fat: 3.8
    },
    target: {
      protein: 17.0,
      energy: 12.0,
      fiber: 19.0,
      fat: 4.0
    },
    status: 'needs_adjustment'
  },
  {
    animalGroup: 'Beef Cattle',
    current: {
      protein: 12.1,
      energy: 9.5,
      fiber: 28.2,
      fat: 2.9
    },
    target: {
      protein: 12.0,
      energy: 9.5,
      fiber: 28.0,
      fat: 3.0
    },
    status: 'optimal'
  },
  {
    animalGroup: 'Sheep',
    current: {
      protein: 14.8,
      energy: 10.2,
      fiber: 22.1,
      fat: 3.2
    },
    target: {
      protein: 15.0,
      energy: 10.5,
      fiber: 22.0,
      fat: 3.5
    },
    status: 'good'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'feeding',
    description: 'Fed Dairy Cows - 8kg Premium Feed',
    time: '2024-01-18T06:00:00Z',
    status: 'completed'
  },
  {
    id: 2,
    type: 'inventory',
    description: 'Added 200kg Grass Hay to inventory',
    time: '2024-01-18T08:30:00Z',
    status: 'completed'
  },
  {
    id: 3,
    type: 'analysis',
    description: 'Nutrition analysis completed for Beef Cattle',
    time: '2024-01-17T14:20:00Z',
    status: 'completed'
  },
  {
    id: 4,
    type: 'alert',
    description: 'Low stock alert: Mineral Mix (45kg remaining)',
    time: '2024-01-17T09:15:00Z',
    status: 'warning'
  }
];

export default function FeedingPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredInventory = feedInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;

    return matchesSearch && matchesType;
  });

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'concentrate', label: 'Concentrate' },
    { value: 'roughage', label: 'Roughage' },
    { value: 'supplement', label: 'Supplement' },
    { value: 'silage', label: 'Silage' }
  ];

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return { status: 'critical', color: 'red', icon: ExclamationCircleIcon };
    if (current <= min * 1.5) return { status: 'low', color: 'yellow', icon: ExclamationTriangleIcon };
    return { status: 'good', color: 'green', icon: CheckCircleIcon };
  };

  const getQualityBadge = (quality: string) => {
    return quality === 'premium'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAnalysisStatus = (status: string) => {
    const colors: Record<string, string> = {
      optimal: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      needs_adjustment: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!mounted) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  return (
    <DashboardLayout
      title="Feed & Nutrition Management"
      subtitle="Monitor feed inventory, optimize nutrition, and manage feeding schedules"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Feed Item</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feedingStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-600`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm ${
                    stat.trend === 'up' ? 'text-green-600' :
                    stat.trend === 'warning' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'inventory', label: 'Feed Inventory', icon: ScaleIcon },
                    { id: 'schedules', label: 'Feeding Schedules', icon: ClockIcon },
                    { id: 'analysis', label: 'Nutrition Analysis', icon: BeakerIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'inventory' && (
                  <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search feed inventory..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Filter by feed type"
                        >
                          {typeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Inventory Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredInventory.map((item) => {
                        const stockStatus = getStockStatus(item.currentStock, item.minStock);
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-600">{item.type} • {item.supplier}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <stockStatus.icon className={`h-5 w-5 text-${stockStatus.color}-600`} />
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityBadge(item.quality)}`}>
                                  {item.quality}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500">Current Stock</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {item.currentStock} {item.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Cost per {item.unit}</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  R{item.costPerKg}
                                </p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Stock Level</span>
                                <span>{item.currentStock}/{item.maxStock} {item.unit}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    stockStatus.status === 'critical' ? 'bg-red-600' :
                                    stockStatus.status === 'low' ? 'bg-yellow-600' : 'bg-green-600'
                                  }`}
                                  style={{ width: `${(item.currentStock / item.maxStock) * 100}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500">Protein</p>
                                <p className="text-sm font-semibold">{item.nutritionalValue.protein}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Energy</p>
                                <p className="text-sm font-semibold">{item.nutritionalValue.energy} MJ/kg</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                Expires: {new Date(item.expiryDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="View Details"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                  title="Edit Item"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete Item"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'schedules' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {feedingSchedules.map((schedule) => (
                        <motion.div
                          key={schedule.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{schedule.animalGroup}</h3>
                              <p className="text-sm text-gray-600">{schedule.feedType}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(schedule.status)}`}>
                              {schedule.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {schedule.amount} {schedule.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Frequency</p>
                              <p className="text-sm font-semibold text-gray-900 capitalize">
                                {schedule.frequency.replace('_', ' ')}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Feeding Times</p>
                            <div className="flex flex-wrap gap-2">
                              {schedule.times.map((time, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {time}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Special Instructions</p>
                            <p className="text-sm text-gray-700">{schedule.specialInstructions}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Active on: {schedule.days.length} days/week
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Schedule"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Edit Schedule"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {nutritionAnalysis.map((analysis) => (
                        <motion.div
                          key={analysis.animalGroup}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{analysis.animalGroup}</h3>
                              <p className="text-sm text-gray-600">Nutrition Analysis</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAnalysisStatus(analysis.status)}`}>
                              {analysis.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {Object.entries(analysis.current).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 capitalize">{key}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {value}{key === 'energy' ? ' MJ/kg' : '%'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    (Target: {analysis.target[key as keyof typeof analysis.target]}{key === 'energy' ? ' MJ/kg' : '%'})
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Overall Status</span>
                              <div className="flex items-center space-x-2">
                                {analysis.status === 'optimal' && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                                {analysis.status === 'good' && <CheckCircleIcon className="h-4 w-4 text-blue-600" />}
                                {analysis.status === 'needs_adjustment' && <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />}
                                <span className="text-sm font-semibold capitalize">
                                  {analysis.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'feeding' ? 'bg-green-100' :
                      activity.type === 'inventory' ? 'bg-blue-100' :
                      activity.type === 'analysis' ? 'bg-purple-100' : 'bg-yellow-100'
                    }`}>
                      {activity.type === 'feeding' && <TruckIcon className="h-4 w-4 text-green-600" />}
                      {activity.type === 'inventory' && <ScaleIcon className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'analysis' && <BeakerIcon className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'alert' && <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <PlusIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Add Feed Item</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Create Schedule</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <BeakerIcon className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Run Analysis</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChartBarIcon className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">View Reports</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Feed Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Feed Item"
        size="lg"
      >
        <div className="p-6">
          <p className="text-gray-600">Feed item form will be implemented here.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}