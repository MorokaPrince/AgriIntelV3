'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  UserIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { HealthTrendsChart } from '@/components/charts/HealthTrendsChart';
import { ExportButton } from '@/components/common/ExportButton';

// Simple type for our health records from MongoDB
interface HealthRecord {
  _id: string;
  animalId: string;
  animalTagId: string;
  date: string;
  type: 'vaccination' | 'treatment' | 'checkup' | 'surgery' | 'emergency' | 'quarantine';
  veterinarian?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: number;
    instructions: string;
  }>;
  vaccinations?: Array<{
    vaccine: string;
    batchNumber: string;
    manufacturer: string;
    nextDueDate: string;
    notes: string;
  }>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'active' | 'resolved' | 'chronic' | 'monitoring';
  cost?: number;
  notes?: string;
  followUp?: {
    required: boolean;
    date?: string;
    instructions: string;
  };
}

interface Animal {
  _id: string;
  rfidTag: string;
  name?: string;
  health?: {
    overallCondition?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  };
}

const getHealthStats = (healthRecords: HealthRecord[], animals: Animal[]) => {
  const totalRecords = healthRecords.length;
  const activeRecords = healthRecords.filter(r => r.status === 'active').length;
  const healthyAnimals = animals.filter(
    a => a.health?.overallCondition === 'excellent' || a.health?.overallCondition === 'good'
  ).length;
  const healthScore = animals.length > 0 ? Math.round((healthyAnimals / animals.length) * 100) : 0;

  return [
    {
      title: 'Total Records',
      value: totalRecords.toString(),
      change: '+18%',
      trend: 'up',
      icon: ClipboardDocumentListIcon,
      color: 'blue'
    },
    {
      title: 'Active Treatments',
      value: activeRecords.toString(),
      change: '-3',
      trend: 'down',
      icon: HeartIcon,
      color: 'red'
    },
    {
      title: 'Scheduled Visits',
      value: healthRecords.filter(r => r.followUp?.required).length.toString(),
      change: '+2',
      trend: 'up',
      icon: CalendarIcon,
      color: 'purple'
    },
    {
      title: 'Health Score',
      value: `${healthScore}%`,
      change: '+2%',
      trend: 'up',
      icon: ShieldCheckIcon,
      color: 'green'
    }
  ];
};

const getUpcomingAppointments = (healthRecords: HealthRecord[]) => {
  const now = new Date();
  return healthRecords
    .filter(r => r.followUp?.required && r.followUp.date && new Date(r.followUp.date) > now)
    .sort((a, b) => new Date(a.followUp?.date || 0).getTime() - new Date(b.followUp?.date || 0).getTime())
    .slice(0, 3)
    .map((record, index) => ({
      id: index + 1,
      animalName: record.animalTagId || `Animal ${index + 1}`,
      animalId: record.animalTagId || `RFID-${index + 1}`,
      type: record.type ? record.type.charAt(0).toUpperCase() + record.type.slice(1) : 'Checkup',
      date: record.followUp?.date ? new Date(record.followUp.date).toISOString().split('T')[0] : '',
      time: record.followUp?.date ? new Date(record.followUp.date).toTimeString().split(' ')[0].substring(0, 5) : '',
      veterinarian: record.veterinarian || 'Dr. Smith',
      status: 'confirmed'
    }));
};

const getHealthAlerts = (healthRecords: HealthRecord[]) => {
  const now = new Date();

  // Critical issues
  const criticalIssues = healthRecords
    .filter(r => r.severity === 'critical' && r.status === 'active')
    .slice(0, 3)
    .map((record, index) => ({
      id: index + 1,
      type: 'error',
      title: 'Critical Health Issue',
      description: `${record.diagnosis} - ${record.animalTagId}`,
      time: 'urgent',
      priority: 'high'
    }));

  // Overdue follow-ups
  const overdueFollowUps = healthRecords
    .filter(r => r.followUp?.required && r.followUp.date && new Date(r.followUp.date) < now && r.status !== 'resolved')
    .slice(0, 3)
    .map((record, index) => ({
      id: criticalIssues.length + index + 1,
      type: 'warning',
      title: 'Follow-up Overdue',
      description: `Follow-up needed for ${record.diagnosis} - ${record.animalTagId}`,
      time: 'overdue',
      priority: 'high'
    }));

  // Upcoming vaccinations
  const upcomingVaccinations = healthRecords
    .filter(r => r.vaccinations?.some(v => v.nextDueDate && new Date(v.nextDueDate) > now))
    .slice(0, 3)
    .map((record, index) => {
      const nextVaccination = record.vaccinations
        ?.filter(v => v.nextDueDate && new Date(v.nextDueDate) > now)
        .sort((a, b) => new Date(a.nextDueDate || 0).getTime() - new Date(b.nextDueDate || 0).getTime())[0];

      return {
        id: criticalIssues.length + overdueFollowUps.length + index + 1,
        type: 'info',
        title: 'Vaccination Due',
        description: `${nextVaccination?.vaccine} due for ${record.animalTagId}`,
        time: nextVaccination?.nextDueDate ? new Date(nextVaccination.nextDueDate).toLocaleDateString() : '',
        priority: 'medium'
      };
    });

  return [...criticalIssues, ...overdueFollowUps, ...upcomingVaccinations].slice(0, 3);
};

const processHealthTrendsData = (healthRecords: HealthRecord[]) => {
  if (!healthRecords || healthRecords.length === 0) {
    return {
      data: {
        'Excellent': [85, 87, 89, 91, 92, 94, 95],
        'Good': [10, 9, 8, 6, 5, 4, 3],
        'Fair': [4, 3, 2, 2, 2, 1, 1],
        'Poor': [1, 1, 1, 1, 1, 1, 1],
      },
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
      title: 'Health Status Trends'
    };
  }

  // Group records by week
  const weeklyData: Record<string, { excellent: number; good: number; fair: number; poor: number }> = {};

  // Get the most recent 7 weeks
  const now = new Date();
  const weeks = Array.from({ length: 7 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (now.getDay() + (6 - i) * 7));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });

  // Initialize weekly data
  weeks.forEach((weekStart, index) => {
    const weekKey = `Week ${index + 1}`;
    weeklyData[weekKey] = { excellent: 0, good: 0, fair: 0, poor: 0 };
  });

  // Process each health record
  healthRecords.forEach(record => {
    const recordDate = new Date(record.date);
    const weekDiff = Math.floor((now.getTime() - recordDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    if (weekDiff >= 0 && weekDiff < 7) {
      const weekKey = `Week ${7 - weekDiff}`;
      const severity = record.severity || 'low';

      // Map severity to health categories
      if (severity === 'low') {
        weeklyData[weekKey].excellent += 1;
      } else if (severity === 'medium') {
        weeklyData[weekKey].good += 1;
      } else if (severity === 'high') {
        weeklyData[weekKey].fair += 1;
      } else if (severity === 'critical') {
        weeklyData[weekKey].poor += 1;
      }
    }
  });

  // Convert to chart format
  const chartData: Record<string, number[]> = {
    'Excellent': [],
    'Good': [],
    'Fair': [],
    'Poor': []
  };

  const labels: string[] = [];

  weeks.forEach((weekStart, index) => {
    const weekKey = `Week ${index + 1}`;
    labels.push(weekKey);

    // Calculate percentages
    const week = weeklyData[weekKey];
    const total = week.excellent + week.good + week.fair + week.poor;

    chartData['Excellent'].push(total > 0 ? Math.round((week.excellent / total) * 100) : 0);
    chartData['Good'].push(total > 0 ? Math.round((week.good / total) * 100) : 0);
    chartData['Fair'].push(total > 0 ? Math.round((week.fair / total) * 100) : 0);
    chartData['Poor'].push(total > 0 ? Math.round((week.poor / total) * 100) : 0);
  });

  return {
    data: chartData,
    labels,
    title: 'Health Status Trends'
  };
};

export default function HealthPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch health records from API with pagination
        const healthResponse = await fetch(`/api/health?page=${currentPage}&limit=${recordsPerPage}`);
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          if (healthData.success && healthData.data) {
            setHealthRecords(healthData.data);
            if (healthData.pagination) {
              setTotalRecords(healthData.pagination.total || 0);
            }
          }
        }

        // Fetch animals for health score calculation
        const animalsResponse = await fetch('/api/animals?limit=100');
        if (animalsResponse.ok) {
          const animalsData = await animalsResponse.json();
          if (animalsData.success && animalsData.data) {
            setAnimals(animalsData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, recordsPerPage]);

  const filteredRecords = healthRecords.filter(record => {
    const matchesSearch = (record.animalTagId?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
                         (record.diagnosis?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
                         (record.veterinarian?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false);
    const matchesType = selectedType === 'all' || record.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'vaccination', label: 'Vaccinations' },
    { value: 'treatment', label: 'Treatments' },
    { value: 'checkup', label: 'Check-ups' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'chronic', label: 'Chronic' },
    { value: 'monitoring', label: 'Monitoring' }
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'chronic': return 'bg-blue-100 text-blue-800';
      case 'monitoring': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return '💉';
      case 'treatment': return '💊';
      case 'checkup': return '🏥';
      case 'surgery': return '🔪';
      case 'emergency': return '🚨';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const upcomingAppointments = getUpcomingAppointments(healthRecords);
  const recentAlerts = getHealthAlerts(healthRecords);
  const { data: chartData, labels: chartLabels, title: chartTitle } = processHealthTrendsData(healthRecords);

  if (!mounted) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  return (
    <DashboardLayout
      title="Health & Welfare"
      subtitle="Monitor animal health and manage veterinary care"
      className="page-header-consistent"
    >
      <div className="space-y-8">
        {/* Consistent Stats Cards */}
        <div className="grid-consistent-4">
          {getHealthStats(healthRecords, animals).map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="metric-card-consistent"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'red' ? 'bg-red-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </span>
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.trend === 'up' ? '↗' : '↘'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="consistent-card"
            >
              {/* Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search health records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Search health records"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Filter by type"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Filter by status"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ExportButton
                      data={filteredRecords.map(r => ({
                        id: r._id,
                        diagnosis: r.diagnosis,
                        type: r.type,
                        status: r.status,
                        date: r.date,
                        veterinarian: r.veterinarian,
                        notes: r.notes
                      }))}
                      filename="health-records-export"
                      title="Health Records"
                    />
                  </div>
                </div>
              </div>

              {/* Health Records */}
              <div className="p-6">
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <motion.div
                      key={record._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getTypeIcon(record.type)}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{record.diagnosis}</h3>
                            <p className="text-sm text-gray-600">
                              {record.animalTagId} • {new Date(record.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.status || 'active')}`}>
                          {record.status || 'active'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Veterinarian</p>
                          <p className="text-sm text-gray-900 flex items-center">
                            <UserIcon className="h-3 w-3 mr-1" />
                            {record.veterinarian}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Treatment</p>
                          <p className="text-sm text-gray-900">{record.treatment}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cost</p>
                          <p className="text-sm font-semibold text-green-600">
                            R{record.cost?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {record.medications && record.medications.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Medications</p>
                          <div className="flex flex-wrap gap-2">
                            {record.medications.map((med, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {med.name} ({med.dosage})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {record.notes}
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
                            title="Edit Record"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Record"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredRecords.length === 0 && (
                  <div className="text-center py-12">
                    <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No health records found matching your criteria</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || isLoading}
                      className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {Math.ceil(totalRecords / recordsPerPage)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalRecords / recordsPerPage), prev + 1))}
                      disabled={currentPage >= Math.ceil(totalRecords / recordsPerPage) || isLoading}
                      className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Records per page:</span>
                    <select
                      value={recordsPerPage}
                      onChange={(e) => {
                        setRecordsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      disabled={isLoading}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      aria-label="Records per page"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Trends Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="consistent-card p-6"
            >
              <HealthTrendsChart
                data={chartData}
                labels={chartLabels}
                title={chartTitle}
              />
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="consistent-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{appointment.type}</p>
                      <p className="text-sm text-gray-600">{appointment.animalName} ({appointment.animalId})</p>
                      <p className="text-xs text-gray-500">{appointment.date} at {appointment.time}</p>
                      <p className="text-xs text-gray-500">Dr. {appointment.veterinarian}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Health Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="consistent-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Alerts</h3>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      alert.priority === 'high' ? 'bg-red-100' :
                      alert.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <ExclamationTriangleIcon className={`h-4 w-4 ${getPriorityColor(alert.priority)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-500">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Health Record Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Health Record"
        size="lg"
      >
        <div className="p-6">
          <p className="text-gray-600">Health record form will be implemented here.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}