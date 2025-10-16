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
  QrCodeIcon,
  SignalIcon,
  WifiIcon,
  Battery50Icon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const rfidStats = [
  {
    title: 'Active RFID Tags',
    value: '1,247',
    change: '+23',
    trend: 'up',
    icon: QrCodeIcon,
    color: 'blue'
  },
  {
    title: 'Online Readers',
    value: '18',
    change: '98%',
    trend: 'up',
    icon: SignalIcon,
    color: 'green'
  },
  {
    title: 'Data Accuracy',
    value: '99.7%',
    change: '+0.3%',
    trend: 'up',
    icon: ChartBarIcon,
    color: 'purple'
  },
  {
    title: 'System Uptime',
    value: '99.9%',
    change: 'Last 30 days',
    trend: 'stable',
    icon: WifiIcon,
    color: 'emerald'
  }
];

const rfidTags = [
  {
    id: 'RFID-001',
    animalId: 'ANG-001',
    animalName: 'Premium Angus Bull',
    species: 'Cattle',
    breed: 'Angus',
    tagType: 'ear_tag',
    frequency: '134.2 kHz',
    installationDate: '2023-06-15',
    lastScan: '2024-01-18T08:30:00Z',
    batteryLevel: 85,
    signalStrength: 'excellent',
    location: 'Main Barn - Section A',
    status: 'active',
    temperature: 38.2,
    healthAlerts: 0,
    notes: 'Primary identification tag, excellent signal'
  },
  {
    id: 'RFID-002',
    animalId: 'MER-001',
    animalName: 'Elite Merino Ram',
    species: 'Sheep',
    breed: 'Merino',
    tagType: 'ear_tag',
    frequency: '134.2 kHz',
    installationDate: '2023-07-20',
    lastScan: '2024-01-18T07:45:00Z',
    batteryLevel: 92,
    signalStrength: 'excellent',
    location: 'Sheep Barn - Pen 3',
    status: 'active',
    temperature: 39.1,
    healthAlerts: 0,
    notes: 'High-performance tag, consistent readings'
  },
  {
    id: 'RFID-003',
    animalId: 'BOER-001',
    animalName: 'Champion Boer Buck',
    species: 'Goats',
    breed: 'Boer',
    tagType: 'ear_tag',
    frequency: '134.2 kHz',
    installationDate: '2023-08-10',
    lastScan: '2024-01-18T06:20:00Z',
    batteryLevel: 78,
    signalStrength: 'good',
    location: 'Goat Enclosure - East Field',
    status: 'active',
    temperature: 38.8,
    healthAlerts: 1,
    notes: 'Temperature monitoring active, recent alert resolved'
  },
  {
    id: 'RFID-004',
    animalId: 'ANG-F-001',
    animalName: 'Angus Female 001',
    species: 'Cattle',
    breed: 'Angus',
    tagType: 'ear_tag',
    frequency: '134.2 kHz',
    installationDate: '2023-09-05',
    lastScan: '2024-01-18T09:15:00Z',
    batteryLevel: 45,
    signalStrength: 'fair',
    location: 'Maternity Barn - Stall 2',
    status: 'maintenance',
    temperature: 38.5,
    healthAlerts: 0,
    notes: 'Low battery, scheduled for replacement'
  },
  {
    id: 'RFID-005',
    animalId: 'MER-E-001',
    animalName: 'Merino Ewe 001',
    species: 'Sheep',
    breed: 'Merino',
    tagType: 'ear_tag',
    frequency: '134.2 kHz',
    installationDate: '2023-10-12',
    lastScan: '2024-01-17T16:30:00Z',
    batteryLevel: 15,
    signalStrength: 'poor',
    location: 'Sheep Barn - Pen 1',
    status: 'offline',
    temperature: null,
    healthAlerts: 2,
    notes: 'Critical battery, not responding to scans'
  }
];

const rfidReaders = [
  {
    id: 'RDR-001',
    name: 'Main Barn Reader A1',
    type: 'fixed',
    location: 'Main Barn Entrance',
    status: 'online',
    lastActivity: '2024-01-18T08:30:00Z',
    tagsDetected: 45,
    uptime: 99.8,
    signalRange: '15m',
    powerSource: 'mains',
    ipAddress: '192.168.1.101',
    firmware: 'v2.1.4',
    maintenanceDue: '2024-04-15'
  },
  {
    id: 'RDR-002',
    name: 'Mobile Reader M1',
    type: 'mobile',
    location: 'Field Operations',
    status: 'online',
    lastActivity: '2024-01-18T07:45:00Z',
    tagsDetected: 23,
    uptime: 98.5,
    signalRange: '5m',
    powerSource: 'battery',
    batteryLevel: 67,
    firmware: 'v2.1.4',
    maintenanceDue: '2024-03-20'
  },
  {
    id: 'RDR-003',
    name: 'Sheep Barn Reader S1',
    type: 'fixed',
    location: 'Sheep Barn Exit',
    status: 'online',
    lastActivity: '2024-01-18T06:20:00Z',
    tagsDetected: 67,
    uptime: 99.2,
    signalRange: '12m',
    powerSource: 'mains',
    ipAddress: '192.168.1.102',
    firmware: 'v2.1.3',
    maintenanceDue: '2024-05-10'
  },
  {
    id: 'RDR-004',
    name: 'Goat Enclosure Reader G1',
    type: 'fixed',
    location: 'Goat Enclosure Gate',
    status: 'maintenance',
    lastActivity: '2024-01-17T18:15:00Z',
    tagsDetected: 34,
    uptime: 95.1,
    signalRange: '10m',
    powerSource: 'mains',
    ipAddress: '192.168.1.103',
    firmware: 'v2.1.2',
    maintenanceDue: '2024-01-25'
  }
];

const scanHistory = [
  {
    id: 1,
    tagId: 'RFID-001',
    animalName: 'Premium Angus Bull',
    readerId: 'RDR-001',
    readerName: 'Main Barn Reader A1',
    timestamp: '2024-01-18T08:30:00Z',
    location: 'Main Barn Entrance',
    signalStrength: 'excellent',
    temperature: 38.2,
    activity: 'feeding',
    notes: 'Entered feeding area'
  },
  {
    id: 2,
    tagId: 'RFID-002',
    animalName: 'Elite Merino Ram',
    readerId: 'RDR-003',
    readerName: 'Sheep Barn Reader S1',
    timestamp: '2024-01-18T07:45:00Z',
    location: 'Sheep Barn Exit',
    signalStrength: 'excellent',
    temperature: 39.1,
    activity: 'movement',
    notes: 'Moved to grazing area'
  },
  {
    id: 3,
    tagId: 'RFID-003',
    animalName: 'Champion Boer Buck',
    readerId: 'RDR-004',
    readerName: 'Goat Enclosure Reader G1',
    timestamp: '2024-01-18T06:20:00Z',
    location: 'Goat Enclosure Gate',
    signalStrength: 'good',
    temperature: 38.8,
    activity: 'health_check',
    notes: 'Temperature alert resolved'
  },
  {
    id: 4,
    tagId: 'RFID-004',
    animalName: 'Angus Female 001',
    readerId: 'RDR-001',
    readerName: 'Main Barn Reader A1',
    timestamp: '2024-01-18T09:15:00Z',
    location: 'Main Barn Entrance',
    signalStrength: 'fair',
    temperature: 38.5,
    activity: 'feeding',
    notes: 'Low battery detected'
  }
];

const systemAlerts = [
  {
    id: 1,
    type: 'tag_offline',
    severity: 'critical',
    title: 'RFID Tag Offline',
    description: 'Tag RFID-005 (Merino Ewe 001) has been offline for 24+ hours',
    timestamp: '2024-01-18T10:00:00Z',
    acknowledged: false
  },
  {
    id: 2,
    type: 'low_battery',
    severity: 'warning',
    title: 'Low Battery Warning',
    description: 'Tag RFID-004 battery level below 50%',
    timestamp: '2024-01-18T09:15:00Z',
    acknowledged: false
  },
  {
    id: 3,
    type: 'reader_maintenance',
    severity: 'info',
    title: 'Scheduled Maintenance',
    description: 'Reader RDR-004 due for maintenance',
    timestamp: '2024-01-18T08:00:00Z',
    acknowledged: true
  },
  {
    id: 4,
    type: 'temperature_alert',
    severity: 'warning',
    title: 'Temperature Alert',
    description: 'Tag RFID-003 reported elevated temperature (39.2°C)',
    timestamp: '2024-01-18T06:20:00Z',
    acknowledged: true
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'scan',
    description: 'Tag RFID-001 scanned at Main Barn Reader A1',
    time: '2024-01-18T08:30:00Z',
    status: 'success'
  },
  {
    id: 2,
    type: 'alert',
    description: 'Temperature alert resolved for RFID-003',
    time: '2024-01-18T06:25:00Z',
    status: 'resolved'
  },
  {
    id: 3,
    type: 'maintenance',
    description: 'Reader RDR-004 maintenance completed',
    time: '2024-01-17T15:30:00Z',
    status: 'completed'
  },
  {
    id: 4,
    type: 'tag_replacement',
    description: 'Tag RFID-004 scheduled for battery replacement',
    time: '2024-01-18T09:15:00Z',
    status: 'pending'
  }
];

export default function RFIDPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tags');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTags = rfidTags.filter(tag => {
    const matchesSearch = tag.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.animalId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || tag.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'offline', label: 'Offline' }
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      offline: 'bg-red-100 text-red-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSignalBadge = (signal: string) => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return colors[signal] || 'bg-gray-100 text-gray-800';
  };

  const getBatteryIcon = (level: number) => {
    if (level >= 75) return <Battery50Icon className="h-4 w-4 text-green-600" />;
    if (level >= 50) return <Battery50Icon className="h-4 w-4 text-yellow-600" />;
    if (level >= 25) return <Battery50Icon className="h-4 w-4 text-orange-600" />;
    return <Battery50Icon className="h-4 w-4 text-red-600" />;
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  if (!mounted) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  return (
    <DashboardLayout
      title="RFID Technology"
      subtitle="Monitor RFID tags, readers, and real-time livestock tracking"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Tag</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rfidStats.map((stat, index) => (
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
                  <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
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
                    { id: 'tags', label: 'RFID Tags', icon: QrCodeIcon },
                    { id: 'readers', label: 'Readers', icon: SignalIcon },
                    { id: 'scans', label: 'Scan History', icon: ClockIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
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
                {activeTab === 'tags' && (
                  <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search RFID tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Filter by status"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Tags Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredTags.map((tag) => (
                        <motion.div
                          key={tag.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{tag.animalName}</h3>
                              <p className="text-sm text-gray-600">{tag.id} • {tag.animalId}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tag.status)}`}>
                              {tag.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Signal Strength</p>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSignalBadge(tag.signalStrength)}`}>
                                  {tag.signalStrength}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Battery Level</p>
                              <div className="flex items-center space-x-2">
                                {getBatteryIcon(tag.batteryLevel)}
                                <span className="text-sm font-semibold">{tag.batteryLevel}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Temperature</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {tag.temperature ? `${tag.temperature}°C` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Last Scan</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(tag.lastScan).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Location</p>
                            <div className="flex items-center space-x-2">
                              <MapPinIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{tag.location}</span>
                            </div>
                          </div>

                          {tag.healthAlerts > 0 && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-semibold text-red-800">
                                  {tag.healthAlerts} Health Alert{tag.healthAlerts > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {tag.notes}
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
                                title="Edit Tag"
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

                {activeTab === 'readers' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {rfidReaders.map((reader) => (
                        <motion.div
                          key={reader.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{reader.name}</h3>
                              <p className="text-sm text-gray-600">{reader.id} • {reader.type}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(reader.status)}`}>
                              {reader.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Uptime</p>
                              <p className="text-lg font-semibold text-gray-900">{reader.uptime}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Tags Detected</p>
                              <p className="text-lg font-semibold text-gray-900">{reader.tagsDetected}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Location</p>
                            <div className="flex items-center space-x-2">
                              <MapPinIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{reader.location}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Signal Range</p>
                              <p className="text-sm font-semibold text-gray-900">{reader.signalRange}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Power Source</p>
                              <p className="text-sm font-semibold text-gray-900 capitalize">{reader.powerSource}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Last activity: {new Date(reader.lastActivity).toLocaleString()}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Reader"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Edit Reader"
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

                {activeTab === 'scans' && (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tag ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Animal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reader
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Signal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Activity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {scanHistory.map((scan) => (
                            <tr key={scan.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {scan.tagId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {scan.animalName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {scan.readerName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(scan.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSignalBadge(scan.signalStrength)}`}>
                                  {scan.signalStrength}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {scan.activity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900">View</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* System Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {alert.severity === 'critical' && <ExclamationCircleIcon className="h-4 w-4 text-red-600" />}
                          {alert.severity === 'warning' && <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />}
                          {alert.severity === 'info' && <ExclamationTriangleIcon className="h-4 w-4 text-blue-600" />}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!alert.acknowledged && (
                        <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'scan' ? 'bg-blue-100' :
                      activity.type === 'alert' ? 'bg-yellow-100' :
                      activity.type === 'maintenance' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {activity.type === 'scan' && <QrCodeIcon className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'alert' && <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />}
                      {activity.type === 'maintenance' && <ArrowPathIcon className="h-4 w-4 text-green-600" />}
                      {activity.type === 'tag_replacement' && <Battery50Icon className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === 'success' ? 'bg-green-100 text-green-800' :
                      activity.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
              transition={{ delay: 1.0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <PlusIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Add Tag</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <SignalIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Test Reader</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Battery50Icon className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Replace Battery</span>
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

      {/* Add Tag Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add RFID Tag"
        size="lg"
      >
        <div className="p-6">
          <p className="text-gray-600">RFID tag form will be implemented here.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}