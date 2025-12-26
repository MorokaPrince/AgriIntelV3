'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ScaleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAnimalStore, Animal } from '@/stores/animal-store';
import { useAuthStore } from '@/stores/auth-store';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import { ExportButton } from '@/components/common/ExportButton';
import { AnimalPopulationChart } from '@/components/charts/AnimalPopulationChart';
import AnimalForm from '@/components/forms/AnimalForm';
import { toast } from 'react-hot-toast';

// Stats will be calculated dynamically from actual data
const getAnimalStats = (animals: Animal[]) => {
  const totalAnimals = animals.length;
  const activeAnimals = animals.filter(a => a.status === 'active').length;
  const avgWeight = animals.length > 0
    ? Math.round(animals.reduce((sum, a) => sum + (a.weight || 0), 0) / animals.length)
    : 0;
  const healthyAnimals = animals.filter(a => a.health?.overallCondition === 'excellent' || a.health?.overallCondition === 'good').length;
  const healthScore = animals.length > 0 ? Math.round((healthyAnimals / animals.length) * 100) : 0;

  return [
    {
      title: 'Total Animals',
      value: totalAnimals.toString(),
      change: '+12%',
      trend: 'up',
      icon: ChartBarIcon,
      color: 'emerald'
    },
    {
      title: 'Active Groups',
      value: activeAnimals.toString(),
      change: '+2',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      title: 'Avg Weight',
      value: `${avgWeight}kg`,
      change: '+5kg',
      trend: 'up',
      icon: ScaleIcon,
      color: 'purple'
    },
    {
      title: 'Health Score',
      value: `${healthScore}%`,
      change: '+2%',
      trend: 'up',
      icon: DocumentTextIcon,
      color: 'green'
    }
  ];
};

// Recent activities will be fetched from API or calculated from real data
const getRecentActivities = (animals: Animal[]) => {
  // Get recently added animals
  const recentAnimals = animals
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(animal => ({
      id: `added-${animal._id}`,
      type: 'addition',
      title: `${animal.species} added`,
      description: `${animal.name || animal.rfidTag} was added to the system`,
      time: `${Math.floor((Date.now() - new Date(animal.createdAt).getTime()) / (1000 * 60 * 60))} hours ago`,
      icon: '➕',
      color: 'green'
    }));

  // Get recently updated animals
  const recentlyUpdated = animals
    .filter(a => a.updatedAt && (Date.now() - new Date(a.updatedAt).getTime()) < (24 * 60 * 60 * 1000)) // Last 24 hours
    .slice(0, 2)
    .map(animal => ({
      id: `updated-${animal._id}`,
      type: 'update',
      title: `${animal.species} updated`,
      description: `${animal.name || animal.rfidTag} information was updated`,
      time: `${Math.floor((Date.now() - new Date(animal.updatedAt).getTime()) / (1000 * 60 * 60))} minutes ago`,
      icon: '✏️',
      color: 'blue'
    }));

  return [...recentAnimals, ...recentlyUpdated].slice(0, 4);
};

export default function AnimalsPage() {
  const { user } = useAuthStore();
  const { animals, setAnimals } = useAnimalStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fetch animals from API with pagination
    const fetchAnimals = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/animals?page=${currentPage}&limit=${recordsPerPage}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAnimals(data.data);
            if (data.pagination) {
              setTotalRecords(data.pagination.total || 0);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching animals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimals();
  }, [currentPage, recordsPerPage, setAnimals]);

  // Form data type (matches AnimalForm's interface)
  interface AnimalFormData {
    name: string;
    species: string;
    breed: string;
    dateOfBirth: string;
    gender: string;
    rfidTag: string;
    weight: string;
    status: string;
    location: {
      address: string;
      latitude: number;
      longitude: number;
      farmSection: string;
    };
    purchaseInfo: {
      purchasePrice: string;
      purchaseDate: string;
      supplier: string;
    };
    health: {
      overallCondition: string;
      vaccinations: string[];
      lastCheckup: string;
    };
    color: string;
    height: number;
    breeding: {
      isBreedingStock: boolean;
      fertilityStatus: string;
    };
    nutrition: {
      dailyFeedIntake: number;
      feedType: string;
      supplements: string[];
      feedingSchedule: string;
    };
    productivity: {
      weightGain: number;
      lastMeasurement: string;
    };
  }

  // CRUD Operations with Optimistic Updates
  const handleCreateAnimal = async (formData: AnimalFormData) => {
    setIsSubmitting(true);
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticAnimal: Animal = {
        _id: tempId,
        tenantId: 'demo-farm',
        rfidTag: formData.rfidTag,
        name: formData.name || undefined,
        species: formData.species as Animal['species'],
        breed: formData.breed,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender as Animal['gender'],
        color: formData.color,
        weight: parseFloat(formData.weight) || 0,
        height: formData.height,
        status: formData.status as Animal['status'],
        location: {
          latitude: formData.location.latitude || -26.2041,
          longitude: formData.location.longitude || 28.0473,
          address: formData.location.address,
          farmSection: formData.location.farmSection || 'Main Pasture',
        },
        purchaseInfo: formData.purchaseInfo.purchasePrice ? {
          purchaseDate: new Date(formData.purchaseInfo.purchaseDate),
          purchasePrice: parseFloat(formData.purchaseInfo.purchasePrice) || 0,
          currency: 'ZAR',
          supplier: formData.purchaseInfo.supplier,
        } : undefined,
        health: {
          overallCondition: formData.health.overallCondition as Animal['health']['overallCondition'],
          lastCheckup: new Date(formData.health.lastCheckup || Date.now()),
          nextCheckup: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          vaccinations: formData.health.vaccinations.map(v => ({
            vaccine: v,
            date: new Date(),
            nextDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            veterinarian: 'Unknown',
          })),
          diseases: [],
        },
        breeding: {
          ...formData.breeding,
          fertilityStatus: formData.breeding.fertilityStatus as 'fertile' | 'subfertile' | 'infertile',
          offspring: []
        },
        nutrition: formData.nutrition,
        productivity: {
          ...formData.productivity,
          lastMeasurement: new Date(formData.productivity.lastMeasurement),
        },
        images: [],
        notes: '',
        alerts: [],
        createdBy: user?._id || 'system',
        updatedBy: user?._id || 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Prepare full data for API
      const fullFormData = {
        ...formData,
        location: {
          ...formData.location,
          farmSection: formData.location.farmSection || 'Main Pasture'
        },
        health: {
          ...formData.health,
          nextCheckup: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          vaccinations: formData.health.vaccinations.map(v => ({
            vaccine: v,
            date: new Date(),
            nextDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            veterinarian: 'Unknown',
          })),
          diseases: [],
        },
        breeding: {
          isBreedingStock: formData.breeding.isBreedingStock,
          fertilityStatus: formData.breeding.fertilityStatus as 'fertile' | 'subfertile' | 'infertile',
          offspring: []
        },
        nutrition: formData.nutrition,
        productivity: {
          ...formData.productivity,
          lastMeasurement: new Date(formData.productivity.lastMeasurement),
        },
        color: formData.color,
        height: formData.height,
        images: [],
        notes: '',
        alerts: [],
      };

      // Add to local state immediately
      setAnimals([optimisticAnimal, ...animals]);

      const response = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullFormData),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setAnimals(animals.filter(a => a._id !== tempId));

        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.upgradeRequired) {
            setShowUpgradeModal(true);
            return;
          }
        }

        throw new Error('Failed to create animal');
      }

      const result = await response.json();

      // Replace optimistic item with real data
      setAnimals(animals.map(a => a._id === tempId ? result.data : a));

      setShowAddModal(false);
      toast.success('Animal created successfully!');
    } catch (error) {
      console.error('Error creating animal:', error);
      toast.error('Failed to create animal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAnimal = async (formData: AnimalFormData) => {
    if (!selectedAnimal) return;

    setIsSubmitting(true);
    try {
      // Optimistic update
      const updatedAnimal: Animal = {
        ...selectedAnimal,
        rfidTag: formData.rfidTag,
        name: formData.name || undefined,
        species: formData.species as Animal['species'],
        breed: formData.breed,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender as Animal['gender'],
        weight: parseFloat(formData.weight) || 0,
        status: formData.status as Animal['status'],
        location: {
          ...selectedAnimal.location,
          address: formData.location.address,
          latitude: formData.location.latitude || selectedAnimal.location.latitude,
          longitude: formData.location.longitude || selectedAnimal.location.longitude,
        },
        purchaseInfo: formData.purchaseInfo.purchasePrice ? {
          purchaseDate: new Date(formData.purchaseInfo.purchaseDate),
          purchasePrice: parseFloat(formData.purchaseInfo.purchasePrice) || 0,
          currency: selectedAnimal.purchaseInfo?.currency || 'ZAR',
          supplier: formData.purchaseInfo.supplier,
        } : selectedAnimal.purchaseInfo,
        health: {
          ...selectedAnimal.health,
          overallCondition: formData.health.overallCondition as Animal['health']['overallCondition'],
          lastCheckup: formData.health.lastCheckup ? new Date(formData.health.lastCheckup) : selectedAnimal.health.lastCheckup,
        },
        updatedAt: new Date(),
        updatedBy: user?._id || 'system',
      };
      setAnimals(animals.map(a => a._id === selectedAnimal._id ? updatedAnimal : a));

      const response = await fetch(`/api/animals/${selectedAnimal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setAnimals(animals.map(a => a._id === selectedAnimal._id ? selectedAnimal : a));
        throw new Error('Failed to update animal');
      }

      const result = await response.json();
      setAnimals(animals.map(a => a._id === selectedAnimal._id ? result.data : a));

      setShowEditModal(false);
      setSelectedAnimal(null);
      toast.success('Animal updated successfully!');
    } catch (error) {
      console.error('Error updating animal:', error);
      toast.error('Failed to update animal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnimal = async () => {
    if (!selectedAnimal) return;

    setIsSubmitting(true);
    try {
      // Optimistic update
      const animalToDelete = selectedAnimal;
      setAnimals(animals.filter(a => a._id !== selectedAnimal._id));

      const response = await fetch(`/api/animals/${selectedAnimal._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setAnimals([...animals, animalToDelete].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        throw new Error('Failed to delete animal');
      }

      setShowDeleteModal(false);
      setSelectedAnimal(null);
      toast.success('Animal deleted successfully!');
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Failed to delete animal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowViewModal(true);
  };

  const handleEditAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowEditModal(true);
  };

  const handleDeleteClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowDeleteModal(true);
  };

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
    >
      <div className="space-y-8">
        {/* Add Animal Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="font-medium">Add Animal</span>
          </button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getAnimalStats(animals).map((stat, index) => (
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
                      aria-label="Filter by species"
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
                      aria-label="Filter by health status"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ExportButton
                    data={filteredAnimals.map(a => ({
                      id: a._id,
                      name: a.name,
                      species: a.species,
                      breed: a.breed,
                      status: a.status,
                      weight: a.weight,
                      age: a.age,
                      location: a.location?.address,
                      health: a.health?.overallCondition,
                      dateAdded: a.dateAdded
                    }))}
                    filename="animals-export"
                    title="Animals Data"
                  />
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
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewAnimal(animal)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditAnimal(animal)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Edit Animal"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(animal)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Animal"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </motion.button>
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

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalRecords / recordsPerPage)}
                totalRecords={totalRecords}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage}
                onRecordsPerPageChange={(limit) => {
                  setRecordsPerPage(limit);
                  setCurrentPage(1);
                }}
                isLoading={isLoading}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Animal Population Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <AnimalPopulationChart
                data={{
                  Cattle: animals.filter(a => a.species === 'cattle').length,
                  Sheep: animals.filter(a => a.species === 'sheep').length,
                  Goats: animals.filter(a => a.species === 'goats').length,
                  Poultry: animals.filter(a => a.species === 'poultry').length,
                  Pigs: animals.filter(a => a.species === 'pigs').length,
                }}
                title="Animal Population Breakdown"
              />
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {getRecentActivities(animals).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
                {getRecentActivities(animals).length === 0 && (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
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
        size="xl"
      >
        <AnimalForm
          onSubmit={handleCreateAnimal}
          onCancel={() => setShowAddModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Animal Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAnimal(null);
        }}
        title="Edit Animal"
        size="xl"
      >
        <AnimalForm
          animal={selectedAnimal || undefined}
          onSubmit={handleUpdateAnimal}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedAnimal(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* View Animal Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAnimal(null);
        }}
        title="Animal Details"
        size="lg"
      >
        {selectedAnimal && (
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-xl">
                  {selectedAnimal.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedAnimal.name}</h3>
                <p className="text-gray-600">{selectedAnimal.breed} • {selectedAnimal.species}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Basic Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">RFID Tag:</span>
                    <span className="font-mono text-gray-900">{selectedAnimal.rfidTag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="text-gray-900">{getAge(selectedAnimal.dateOfBirth)} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="text-gray-900 capitalize">{selectedAnimal.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthBadgeColor(selectedAnimal.health?.overallCondition || 'good')}`}>
                      {selectedAnimal.health?.overallCondition || 'good'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Physical & Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="text-gray-900">{selectedAnimal.weight}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health Score:</span>
                    <span className="text-gray-900">{selectedAnimal.health?.overallCondition || 'Not assessed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Checkup:</span>
                    <span className="text-gray-900">
                      {selectedAnimal.health?.lastCheckup ? new Date(selectedAnimal.health.lastCheckup).toLocaleDateString() : 'Not recorded'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h4 className="font-semibold text-gray-900">Location & Purchase</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="text-gray-900">{selectedAnimal.location?.address || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Purchase Price:</span>
                    <p className="text-gray-900">
                      {selectedAnimal.purchaseInfo?.purchasePrice ? `R${selectedAnimal.purchaseInfo.purchasePrice.toLocaleString()}` : 'Not recorded'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAnimal(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditAnimal(selectedAnimal);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Edit Animal
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAnimal(null);
        }}
        title="Delete Animal"
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Animal</h3>
              <p className="text-gray-600">This action cannot be undone.</p>
            </div>
          </div>

          {selectedAnimal && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>{selectedAnimal.name}</strong> ({selectedAnimal.rfidTag})?
                This will permanently remove all associated data.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedAnimal(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAnimal}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{isSubmitting ? 'Deleting...' : 'Delete Animal'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade Required"
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⭐</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Animal Limit Reached</h3>
              <p className="text-gray-600">You&apos;ve reached the 50 animal limit for the free tier.</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Upgrade to Pro Tier</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Unlimited animal records</li>
              <li>• Advanced analytics and reporting</li>
              <li>• Priority support</li>
              <li>• Export capabilities</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // TODO: Implement upgrade flow
                toast.success('Upgrade feature coming soon!');
                setShowUpgradeModal(false);
              }}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}