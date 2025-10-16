'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAnimalStore, Animal } from '@/stores/animal-store';
import { useAuthStore } from '@/stores/auth-store';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const animalStats = [
  {
    title: 'Total Animals',
    value: '156',
    change: '+12%',
    trend: 'up',
    icon: ChartBarIcon,
    color: 'emerald'
  },
  {
    title: 'Active Groups',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: UserGroupIcon,
    color: 'blue'
  },
  {
    title: 'Avg Weight',
    value: '245kg',
    change: '+5kg',
    trend: 'up',
    icon: ScaleIcon,
    color: 'purple'
  },
  {
    title: 'Health Score',
    value: '94%',
    change: '+2%',
    trend: 'up',
    icon: DocumentTextIcon,
    color: 'green'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'birth',
    title: 'New calf born',
    description: 'Angus calf born in North Pasture',
    time: '2 hours ago',
    icon: '🍼',
    color: 'green'
  },
  {
    id: 2,
    type: 'weight',
    title: 'Weight recorded',
    description: 'Monthly weight check completed',
    time: '4 hours ago',
    icon: '⚖️',
    color: 'blue'
  },
  {
    id: 3,
    type: 'health',
    title: 'Vaccination given',
    description: 'Annual vaccination program',
    time: '1 day ago',
    icon: '💉',
    color: 'purple'
  },
  {
    id: 4,
    type: 'movement',
    title: 'Animal moved',
    description: 'Cattle moved to new grazing area',
    time: '2 days ago',
    icon: '🚶',
    color: 'orange'
  }
];

export default function AnimalsPage() {
  const { user } = useAuthStore();
  const { animals, loading, setAnimals } = useAnimalStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Seed data with proper database structure
    const seedAnimals: Animal[] = [
      {
        _id: '1',
        tenantId: 'demo-farm',
        rfidTag: 'RFID-001',
        name: 'Bella',
        species: 'cattle',
        breed: 'Angus',
        dateOfBirth: new Date('2021-03-15'),
        gender: 'female',
        color: 'Black',
        weight: 450,
        status: 'active',
        createdBy: user?._id || '507f1f77bcf86cd799439011',
        updatedBy: user?._id || '507f1f77bcf86cd799439011',
        location: {
          latitude: -26.2041,
          longitude: 28.0473,
          address: 'North Pasture, Johannesburg',
          farmSection: 'North Pasture'
        },
        health: {
          overallCondition: 'excellent',
          lastCheckup: new Date(),
          nextCheckup: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          vaccinations: [],
          diseases: []
        },
        breeding: {
          isBreedingStock: true,
          fertilityStatus: 'fertile',
          offspring: []
        },
        nutrition: {
          dailyFeedIntake: 12,
          feedType: 'Grass Hay',
          supplements: ['Mineral Mix'],
          feedingSchedule: 'Twice daily'
        },
        productivity: {
          milkProduction: 25,
          weightGain: 1.2,
          lastMeasurement: new Date()
        },
        images: [],
        notes: 'Excellent milk producer, calm temperament',
        alerts: []
      },
      {
        _id: '2',
        tenantId: 'demo-farm',
        rfidTag: 'RFID-002',
        name: 'Max',
        species: 'cattle',
        breed: 'Hereford',
        dateOfBirth: new Date('2020-08-22'),
        gender: 'male',
        color: 'Red with white face',
        weight: 680,
        status: 'breeding',
        createdBy: user?._id || '507f1f77bcf86cd799439011',
        updatedBy: user?._id || '507f1f77bcf86cd799439011',
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
          latitude: -26.2041,
          longitude: 28.0473,
          address: 'South Barn, Johannesburg',
          farmSection: 'South Barn'
        },
        health: {
          overallCondition: 'good',
          lastCheckup: new Date(),
          nextCheckup: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          vaccinations: [],
          diseases: []
        },
        breeding: {
          isBreedingStock: true,
          fertilityStatus: 'fertile',
          offspring: []
        },
        nutrition: {
          dailyFeedIntake: 15,
          feedType: 'Alfalfa Hay',
          supplements: ['Mineral Mix'],
          feedingSchedule: 'Three times daily'
        },
        productivity: {
          weightGain: 1.5,
          lastMeasurement: new Date()
        },
        images: [],
        notes: 'Prime breeding bull, excellent genetics',
        alerts: []
      }
    ];

    setAnimals(seedAnimals);
  }, [setAnimals, user]);

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = (animal.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies;
    const matchesStatus = selectedStatus === 'all' || animal.health?.overallCondition === selectedStatus;

    return matchesSearch && matchesSpecies && matchesStatus;
  });

  const speciesOptions = [
    { value: 'all', label: 'All Species' },
    { value: 'cattle', label: 'Cattle' },
    { value: 'sheep', label: 'Sheep' },
    { value: 'goats', label: 'Goats' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'sick', label: 'Sick' },
    { value: 'quarantine', label: 'Quarantine' }
  ];

  const getAge = (dateOfBirth: Date) => {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  };

  const getHealthBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'quarantine': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!mounted) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  return (
    <DashboardLayout
      title="Animal Management"
      subtitle="Manage your livestock inventory and track performance"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Animal</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {animalStats.map((stat, index) => (
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
                        placeholder="Search animals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedSpecies}
                      onChange={(e) => setSelectedSpecies(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {speciesOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

              {/* Animals Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAnimals.map((animal) => (
                    <motion.div
                      key={animal._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-200 rounded-lg flex items-center justify-center">
                            <span className="text-emerald-700 font-bold text-lg">
                              {animal.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{animal.name}</h3>
                            <p className="text-sm text-gray-600">{animal.breed} • {animal.species}</p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthBadgeColor(animal.health?.overallCondition || 'good')}`}>
                          {animal.health?.overallCondition || 'good'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">RFID Tag</p>
                          <p className="font-mono text-sm text-gray-900">{animal.rfidTag}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Age</p>
                          <p className="text-sm text-gray-900">{getAge(animal.dateOfBirth)} years</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="text-sm text-gray-900">{animal.weight}kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Value</p>
                          <p className="text-sm font-semibold text-green-600">
                            R{animal.purchaseInfo?.purchasePrice?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {animal.location.address}
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
                            title="Edit Animal"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Animal"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredAnimals.length === 0 && (
                  <div className="text-center py-12">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No animals found matching your criteria</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Value</span>
                  <span className="font-semibold text-green-600">
                    R{animals.reduce((sum, animal) => sum + (animal.purchaseInfo?.purchasePrice || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Age</span>
                  <span className="font-semibold text-blue-600">
                    {animals.length > 0
                      ? Math.round(animals.reduce((sum, animal) => {
                          const age = new Date().getFullYear() - new Date(animal.dateOfBirth).getFullYear();
                          return sum + age;
                        }, 0) / animals.length)
                      : 0} years
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Healthy Animals</span>
                  <span className="font-semibold text-emerald-600">
                    {animals.filter(a => a.health?.overallCondition === 'excellent' || a.health?.overallCondition === 'good').length}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Animal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Animal"
        size="lg"
      >
        <div className="p-6">
          <p className="text-gray-600">Animal registration form will be implemented here.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}