'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  PlusIcon,
  CalendarIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';

interface GrowthRecord {
  _id: string;
  animalId: string;
  animalName: string;
  date: string;
  weight: number;
  height?: number;
  age: number;
  notes?: string;
}

export default function GrowthTrackingPage() {
  const { user } = useAuthStore();
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState('');

  const fetchGrowthRecords = useCallback(async () => {
    try {
      setLoading(true);
      // For now, using mock data until we implement growth tracking API
      const mockRecords: GrowthRecord[] = [
        {
          _id: '1',
          animalId: 'animal1',
          animalName: 'Bella',
          date: '2024-01-15',
          weight: 380,
          height: 135,
          age: 8,
          notes: 'Good weight gain',
        },
        {
          _id: '2',
          animalId: 'animal1',
          animalName: 'Bella',
          date: '2024-02-15',
          weight: 410,
          height: 137,
          age: 9,
          notes: 'Steady growth',
        },
        {
          _id: '3',
          animalId: 'animal1',
          animalName: 'Bella',
          date: '2024-03-15',
          weight: 440,
          height: 139,
          age: 10,
          notes: 'Excellent progress',
        },
        {
          _id: '4',
          animalId: 'animal2',
          animalName: 'Max',
          date: '2024-01-15',
          weight: 620,
          height: 145,
          age: 12,
          notes: 'Maintaining weight',
        },
        {
          _id: '5',
          animalId: 'animal2',
          animalName: 'Max',
          date: '2024-02-15',
          weight: 635,
          height: 147,
          age: 13,
          notes: 'Good condition',
        },
      ];

      // Filter by selected animal if specified
      const filteredRecords = selectedAnimal
        ? mockRecords.filter(record => record.animalId === selectedAnimal)
        : mockRecords;

      setGrowthRecords(filteredRecords);
    } catch (error) {
      console.error('Error fetching growth records:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedAnimal]);

  useEffect(() => {
    fetchGrowthRecords();
  }, [fetchGrowthRecords]);

  const animals = [
    { id: 'animal1', name: 'Bella (Cattle)' },
    { id: 'animal2', name: 'Max (Cattle)' },
  ];

  return (
    <DashboardLayout
      title="Growth Tracking"
      subtitle="Monitor animal growth and development"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label htmlFor="animal-select" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Animal
              </label>
              <select
                id="animal-select"
                value={selectedAnimal}
                onChange={(e) => setSelectedAnimal(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Animals</option>
                {animals.map(animal => (
                  <option key={animal.id} value={animal.id}>{animal.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ChartBarIcon className="h-5 w-5" />
              <span>Total Records: {growthRecords.length}</span>
            </div>
          </div>
        </div>

        {/* Growth Records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {growthRecords.map((record, index) => (
            <motion.div
              key={record._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{record.animalName}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(record.date).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ScaleIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Weight:</span>
                  </div>
                  <span className="font-medium text-gray-900">{record.weight} kg</span>
                </div>

                {record.height && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ScaleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Height:</span>
                    </div>
                    <span className="font-medium text-gray-900">{record.height} cm</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Age:</span>
                  </div>
                  <span className="font-medium text-gray-900">{record.age} months</span>
                </div>

                {record.notes && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {growthRecords.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No growth records found</h3>
            <p className="text-gray-600 mb-4">
              {selectedAnimal
                ? 'No growth records found for the selected animal.'
                : 'Start tracking animal growth by adding measurement records.'
              }
            </p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors">
              <PlusIcon className="h-5 w-5" />
              <span>Add Growth Record</span>
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