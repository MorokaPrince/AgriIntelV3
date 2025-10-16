'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';
import { apiService } from '@/services/apiService';

interface AnimalGroup {
  _id: string;
  name: string;
  description: string;
  species: string;
  breed?: string;
  animalCount: number;
  location: string;
  manager: string;
  purpose: string;
  createdAt: string;
}

export default function AnimalGroupsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<AnimalGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      // For now, using mock data until we implement groups API
      const mockGroups: AnimalGroup[] = [
        {
          _id: '1',
          name: 'Premium Angus Herd',
          description: 'High-quality Angus cattle for breeding',
          species: 'cattle',
          breed: 'Angus',
          animalCount: 25,
          location: 'Section A',
          manager: 'John Admin',
          purpose: 'Breeding',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          name: 'Sheep Flock Alpha',
          description: 'Merino sheep for wool production',
          species: 'sheep',
          breed: 'Merino',
          animalCount: 45,
          location: 'Section B',
          manager: 'Jane Manager',
          purpose: 'Wool Production',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '3',
          name: 'Goat Herd Delta',
          description: 'Boer goats for meat production',
          species: 'goats',
          breed: 'Boer',
          animalCount: 30,
          location: 'Section C',
          manager: 'John Admin',
          purpose: 'Meat Production',
          createdAt: new Date().toISOString(),
        },
      ];
      setGroups(mockGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      try {
        // await apiService.deleteGroup(groupId);
        setGroups(groups.filter(group => group._id !== groupId));
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  return (
    <DashboardLayout
      title="Animal Groups & Herds"
      subtitle="Manage your livestock groups and herds"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UsersIcon className="h-5 w-5" />
              <span>Total Groups: {groups.length}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total Animals: {groups.reduce((sum, group) => sum + group.animalCount, 0)}</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Group</span>
          </button>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <motion.div
              key={group._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    group.species === 'cattle' ? 'bg-blue-100' :
                    group.species === 'sheep' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    <UsersIcon className={`h-6 w-6 ${
                      group.species === 'cattle' ? 'text-blue-600' :
                      group.species === 'sheep' ? 'text-green-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{group.species}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View group details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit group"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group._id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete group"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">{group.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Animals:</span>
                    <span className="ml-2 font-medium text-gray-900">{group.animalCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Breed:</span>
                    <span className="ml-2 font-medium text-gray-900">{group.breed || 'Mixed'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium text-gray-900">{group.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Purpose:</span>
                    <span className="ml-2 font-medium text-gray-900">{group.purpose}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Manager: {group.manager}</span>
                    <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {groups.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first animal group.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create First Group</span>
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