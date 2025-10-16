'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';

interface VaccinationRecord {
  _id: string;
  animalId: string;
  animalName: string;
  vaccine: string;
  date: string;
  nextDue: string;
  veterinarian: string;
  batchNumber?: string;
  dosage?: string;
  notes?: string;
  status: 'completed' | 'overdue' | 'upcoming';
}

export default function VaccinationsPage() {
  const { user } = useAuthStore();
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'overdue' | 'upcoming'>('all');

  useEffect(() => {
    fetchVaccinations();
  }, [filter]);

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      // For now, using mock data until we implement vaccinations API
      const mockVaccinations: VaccinationRecord[] = [
        {
          _id: '1',
          animalId: 'animal1',
          animalName: 'Bella',
          vaccine: 'Brucellosis',
          date: '2024-01-15',
          nextDue: '2025-01-15',
          veterinarian: 'Dr. Smith',
          batchNumber: 'BATCH-2024-001',
          dosage: '2ml',
          status: 'completed',
        },
        {
          _id: '2',
          animalId: 'animal2',
          animalName: 'Max',
          vaccine: 'IBR/BVD',
          date: '2024-02-01',
          nextDue: '2025-02-01',
          veterinarian: 'Dr. Smith',
          batchNumber: 'BATCH-2024-002',
          dosage: '3ml',
          status: 'completed',
        },
        {
          _id: '3',
          animalId: 'animal1',
          animalName: 'Bella',
          vaccine: 'Foot and Mouth',
          date: '2023-06-01',
          nextDue: '2024-06-01',
          veterinarian: 'Dr. Johnson',
          batchNumber: 'BATCH-2023-045',
          dosage: '2ml',
          status: 'overdue',
        },
        {
          _id: '4',
          animalId: 'animal3',
          animalName: 'Daisy',
          vaccine: 'Clostridial',
          date: '2024-03-15',
          nextDue: '2024-09-15',
          veterinarian: 'Dr. Smith',
          batchNumber: 'BATCH-2024-015',
          dosage: '2ml',
          status: 'upcoming',
        },
      ];

      // Filter based on status
      const filteredVaccinations = filter === 'all'
        ? mockVaccinations
        : mockVaccinations.filter(vac => vac.status === filter);

      setVaccinations(filteredVaccinations);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'upcoming':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <ShieldCheckIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDue = (nextDue: string) => {
    const today = new Date();
    const dueDate = new Date(nextDue);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  return (
    <DashboardLayout
      title="Vaccinations"
      subtitle="Track and manage animal vaccinations"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vaccinations</p>
                <p className="text-3xl font-bold text-gray-900">{vaccinations.length}</p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {vaccinations.filter(v => v.status === 'completed').length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">
                  {vaccinations.filter(v => v.status === 'overdue').length}
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600">
                  {vaccinations.filter(v => v.status === 'upcoming').length}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label htmlFor="vaccination-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="vaccination-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Vaccinations</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Next 30 days: {vaccinations.filter(v => {
                const daysUntilDue = Math.ceil((new Date(v.nextDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilDue >= 0 && daysUntilDue <= 30;
              }).length} due</span>
            </div>
          </div>
        </div>

        {/* Vaccinations List */}
        <div className="space-y-4">
          {vaccinations.map((vaccination, index) => (
            <motion.div
              key={vaccination._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(vaccination.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{vaccination.vaccine}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vaccination.status)}`}>
                        {vaccination.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Animal:</span>
                        <span className="ml-2 font-medium text-gray-900">{vaccination.animalName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(vaccination.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Due:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(vaccination.nextDue).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Veterinarian:</span>
                        <span className="ml-2 font-medium text-gray-900">{vaccination.veterinarian}</span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      {getDaysUntilDue(vaccination.nextDue)}
                    </div>

                    {vaccination.batchNumber && (
                      <div className="mt-2 text-xs text-gray-500">
                        Batch: {vaccination.batchNumber} • Dosage: {vaccination.dosage}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Add vaccination record"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {vaccinations.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vaccinations found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Start tracking vaccinations by adding your first record.'
                : `No ${filter} vaccinations found.`
              }
            </p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors">
              <PlusIcon className="h-5 w-5" />
              <span>Add Vaccination</span>
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}