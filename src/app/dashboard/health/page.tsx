'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  HeartIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useHealthStore, HealthRecord } from '@/stores/health-store';
import { useAuthStore } from '@/stores/auth-store';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const healthStats = [
  {
    title: 'Total Records',
    value: '247',
    change: '+18%',
    trend: 'up',
    icon: ClipboardDocumentListIcon,
    color: 'blue'
  },
  {
    title: 'Active Treatments',
    value: '12',
    change: '-3',
    trend: 'down',
    icon: HeartIcon,
    color: 'red'
  },
  {
    title: 'Scheduled Visits',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: CalendarIcon,
    color: 'purple'
  },
  {
    title: 'Health Score',
    value: '94%',
    change: '+2%',
    trend: 'up',
    icon: ShieldCheckIcon,
    color: 'green'
  }
];

const upcomingAppointments = [
  {
    id: 1,
    animalName: 'Bella',
    animalId: 'RFID-001',
    type: 'Vaccination',
    date: '2024-01-20',
    time: '10:00 AM',
    veterinarian: 'Dr. Smith',
    status: 'confirmed'
  },
  {
    id: 2,
    animalName: 'Max',
    animalId: 'RFID-002',
    type: 'Check-up',
    date: '2024-01-22',
    time: '2:00 PM',
    veterinarian: 'Dr. Johnson',
    status: 'pending'
  },
  {
    id: 3,
    animalName: 'Luna',
    animalId: 'RFID-003',
    type: 'Treatment',
    date: '2024-01-25',
    time: '11:30 AM',
    veterinarian: 'Dr. Smith',
    status: 'confirmed'
  }
];

const recentAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'Vaccination Due',
    description: 'Annual vaccination required for 5 animals',
    time: '2 hours ago',
    priority: 'high'
  },
  {
    id: 2,
    type: 'info',
    title: 'Health Check Complete',
    description: 'Routine check completed for Bella',
    time: '4 hours ago',
    priority: 'low'
  },
  {
    id: 3,
    type: 'error',
    title: 'Treatment Required',
    description: 'Luna showing signs of respiratory issues',
    time: '1 day ago',
    priority: 'high'
  }
];

export default function HealthPage() {
  const { user } = useAuthStore();
  const { healthRecords, loading, setHealthRecords } = useHealthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Seed data
    const seedHealthRecords: HealthRecord[] = [
      {
        _id: '1',
        animalId: '1',
        animalTagId: 'RFID-001',
        date: new Date('2024-01-15'),
        type: 'vaccination',
        veterinarian: 'Dr. Smith',
        diagnosis: 'Annual vaccination program',
        treatment: 'Administered standard annual vaccines',
        medications: [
          {
            name: 'Vaccine A',
            dosage: '2ml',
            frequency: 'Once',
            duration: '1 day'
          }
        ],
        cost: 450,
        nextVisit: new Date('2024-07-15'),
        notes: 'All vaccines administered successfully',
        status: 'completed',
        createdBy: user?._id || '1'
      },
      {
        _id: '2',
        animalId: '3',
        animalTagId: 'RFID-003',
        date: new Date('2024-01-13'),
        type: 'treatment',
        veterinarian: 'Dr. Johnson',
        diagnosis: 'Respiratory infection',
        treatment: 'Antibiotic treatment course',
        medications: [
          {
            name: 'Antibiotic X',
            dosage: '5ml',
            frequency: 'Twice daily',
            duration: '7 days'
          },
          {
            name: 'Anti-inflammatory',
            dosage: '3ml',
            frequency: 'Once daily',
            duration: '5 days'
          }
        ],
        cost: 1200,
        nextVisit: new Date('2024-01-20'),
        notes: 'Patient responding well to treatment',
        status: 'pending',
        createdBy: user?._id || '1'
      },
      {
        _id: '3',
        animalId: '2',
        animalTagId: 'RFID-002',
        date: new Date('2024-01-14'),
        type: 'checkup',
        veterinarian: 'Dr. Smith',
        diagnosis: 'Routine health examination',
        treatment: 'General health check',
        cost: 300,
        notes: 'Excellent overall health condition',
        status: 'completed',
        createdBy: user?._id || '1'
      },
      {
        _id: '4',
        animalId: '4',
        animalTagId: 'RFID-004',
        date: new Date('2024-01-12'),
        type: 'vaccination',
        veterinarian: 'Dr. Johnson',
        diagnosis: 'Booster vaccination',
        treatment: 'Booster shots administered',
        medications: [
          {
            name: 'Booster Vaccine',
            dosage: '1ml',
            frequency: 'Once',
            duration: '1 day'
          }
        ],
        cost: 250,
        notes: 'All boosters current',
        status: 'completed',
        createdBy: user?._id || '1'
      },
      {
        _id: '5',
        animalId: '5',
        animalTagId: 'RFID-005',
        date: new Date('2024-01-10'),
        type: 'checkup',
        veterinarian: 'Dr. Smith',
        diagnosis: 'Pre-milking health check',
        treatment: 'Mastitis prevention measures',
        cost: 400,
        nextVisit: new Date('2024-02-10'),
        notes: 'Good udder health, milk quality excellent',
        status: 'completed',
        createdBy: user?._id || '1'
      }
    ];

    setHealthRecords(seedHealthRecords);
  }, [setHealthRecords, user]);

  const filteredRecords = healthRecords.filter(record => {
    const matchesSearch = record.animalTagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (record.veterinarian?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
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
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  if (!mounted) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  return (
    <DashboardLayout
      title="Health & Welfare"
      subtitle="Monitor animal health and manage veterinary care"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Record</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthStats.map((stat, index) => (
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
                  <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
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
              className="bg-white rounded-xl shadow-sm border border-gray-200"
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
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                          {record.status}
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
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
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
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
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