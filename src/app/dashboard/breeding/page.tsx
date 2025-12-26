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
  HeartIcon,
  UserGroupIcon,
  ChartBarIcon,
  BeakerIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import { BreedingProgramsChart } from '@/components/charts/BreedingProgramsChart';
import { ExportButton } from '@/components/common/ExportButton';

const breedingStats = [
  {
    title: 'Active Breeding Programs',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: HeartIcon,
    color: 'red'
  },
  {
    title: 'Expected Births',
    value: '28',
    change: '+15%',
    trend: 'up',
    icon: SparklesIcon,
    color: 'purple'
  },
  {
    title: 'Success Rate',
    value: '87%',
    change: '+5%',
    trend: 'up',
    icon: ChartBarIcon,
    color: 'green'
  },
  {
    title: 'Genetic Diversity',
    value: '94%',
    change: '+2%',
    trend: 'up',
    icon: BeakerIcon,
    color: 'blue'
  }
];

const breedingPrograms = [
  {
    id: 1,
    name: 'Angus Elite Program',
    species: 'Cattle',
    breed: 'Angus',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    totalAnimals: 45,
    breedingFemales: 30,
    breedingMales: 3,
    expectedOffspring: 25,
    actualOffspring: 18,
    successRate: 85,
    goals: ['Improve meat quality', 'Increase growth rate', 'Enhance disease resistance'],
    manager: 'Dr. Sarah Johnson',
    budget: 150000,
    currency: 'ZAR'
  },
  {
    id: 2,
    name: 'Merino Wool Program',
    species: 'Sheep',
    breed: 'Merino',
    startDate: '2024-02-15',
    endDate: '2024-11-30',
    status: 'active',
    totalAnimals: 120,
    breedingFemales: 80,
    breedingMales: 6,
    expectedOffspring: 85,
    actualOffspring: 62,
    successRate: 92,
    goals: ['Premium wool quality', 'Increase fleece weight', 'Better fiber diameter'],
    manager: 'Mr. Michael Brown',
    budget: 95000,
    currency: 'ZAR'
  },
  {
    id: 3,
    name: 'Boer Goat Program',
    species: 'Goats',
    breed: 'Boer',
    startDate: '2024-03-01',
    endDate: '2024-10-31',
    status: 'active',
    totalAnimals: 60,
    breedingFemales: 40,
    breedingMales: 4,
    expectedOffspring: 35,
    actualOffspring: 28,
    successRate: 88,
    goals: ['Meat production', 'Growth efficiency', 'Adaptability'],
    manager: 'Dr. Emily Davis',
    budget: 75000,
    currency: 'ZAR'
  },
  {
    id: 4,
    name: 'Dairy Crossbreeding',
    species: 'Cattle',
    breed: 'Holstein-Friesian x Jersey',
    startDate: '2024-01-15',
    endDate: '2024-12-15',
    status: 'active',
    totalAnimals: 35,
    breedingFemales: 25,
    breedingMales: 2,
    expectedOffspring: 22,
    actualOffspring: 15,
    successRate: 83,
    goals: ['Milk production', 'Fat content', 'Feed efficiency'],
    manager: 'Dr. Robert Wilson',
    budget: 120000,
    currency: 'ZAR'
  }
];

const breedingCycles = [
  {
    id: 1,
    animalId: 'ANG-001',
    animalName: 'Premium Angus Bull',
    species: 'Cattle',
    breed: 'Angus',
    currentCycle: 'Breeding Season 2024',
    cycleStart: '2024-01-01',
    cycleEnd: '2024-03-31',
    status: 'active',
    matedWith: ['ANG-F-001', 'ANG-F-002', 'ANG-F-003'],
    expectedBirths: 3,
    actualBirths: 0,
    healthStatus: 'excellent',
    fertilityScore: 95,
    notes: 'High fertility bull, excellent semen quality'
  },
  {
    id: 2,
    animalId: 'MER-001',
    animalName: 'Elite Merino Ram',
    species: 'Sheep',
    breed: 'Merino',
    currentCycle: 'Autumn Breeding 2024',
    cycleStart: '2024-02-15',
    cycleEnd: '2024-04-15',
    status: 'active',
    matedWith: ['MER-E-001', 'MER-E-002', 'MER-E-003', 'MER-E-004'],
    expectedBirths: 4,
    actualBirths: 0,
    healthStatus: 'good',
    fertilityScore: 88,
    notes: 'Consistent performer, good genetic traits'
  },
  {
    id: 3,
    animalId: 'BOER-001',
    animalName: 'Champion Boer Buck',
    species: 'Goats',
    breed: 'Boer',
    currentCycle: 'Spring Breeding 2024',
    cycleStart: '2024-03-01',
    cycleEnd: '2024-05-01',
    status: 'active',
    matedWith: ['BOER-D-001', 'BOER-D-002', 'BOER-D-003'],
    expectedBirths: 3,
    actualBirths: 0,
    healthStatus: 'excellent',
    fertilityScore: 92,
    notes: 'Superior meat conformation, excellent libido'
  }
];

const geneticAnalysis = [
  {
    trait: 'Milk Production',
    currentAverage: 28.5,
    targetAverage: 30.0,
    improvement: 5.2,
    status: 'on_track'
  },
  {
    trait: 'Growth Rate',
    currentAverage: 1.2,
    targetAverage: 1.4,
    improvement: 16.7,
    status: 'exceeding'
  },
  {
    trait: 'Disease Resistance',
    currentAverage: 87,
    targetAverage: 90,
    improvement: 3.4,
    status: 'on_track'
  },
  {
    trait: 'Fertility Rate',
    currentAverage: 89,
    targetAverage: 92,
    improvement: 3.4,
    status: 'needs_attention'
  },
  {
    trait: 'Meat Quality',
    currentAverage: 4.2,
    targetAverage: 4.5,
    improvement: 7.1,
    status: 'on_track'
  }
];

const upcomingEvents = [
  {
    id: 1,
    type: 'birth',
    title: 'Expected calf birth - ANG-F-001',
    date: '2024-01-25',
    priority: 'high',
    description: 'First calf expected from premium breeding program'
  },
  {
    id: 2,
    type: 'health_check',
    title: 'Fertility check - MER-001',
    date: '2024-01-28',
    priority: 'medium',
    description: 'Routine fertility assessment for breeding ram'
  },
  {
    id: 3,
    type: 'breeding',
    title: 'Breeding season start - Boer goats',
    date: '2024-02-01',
    priority: 'high',
    description: 'Begin spring breeding program for Boer goats'
  },
  {
    id: 4,
    type: 'genetic_test',
    title: 'DNA analysis results',
    date: '2024-01-30',
    priority: 'medium',
    description: 'Genetic analysis results for new breeding stock'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'breeding',
    description: 'Successful mating recorded - ANG-001 with ANG-F-001',
    time: '2024-01-18T08:30:00Z',
    status: 'completed'
  },
  {
    id: 2,
    type: 'birth',
    description: 'Healthy calf born - 42kg, excellent condition',
    time: '2024-01-17T14:20:00Z',
    status: 'completed'
  },
  {
    id: 3,
    type: 'health',
    description: 'Fertility treatment completed for MER-E-002',
    time: '2024-01-16T10:15:00Z',
    status: 'completed'
  },
  {
    id: 4,
    type: 'genetic',
    description: 'New genetic markers identified in breeding program',
    time: '2024-01-15T16:45:00Z',
    status: 'completed'
  }
];

export default function BreedingPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('programs');
  const [mounted, setMounted] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is on BETA tier
  const isBetaTier = user?.tier === 'beta';

  useEffect(() => {
    setMounted(true);

    // Fetch breeding records from API with pagination
    const fetchBreedingRecords = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/breeding?page=${currentPage}&limit=${recordsPerPage}`);
        if (response.ok) {
          const data = await response.json();
          if (data.pagination) {
            setTotalRecords(data.pagination.total || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching breeding records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreedingRecords();
  }, [currentPage, recordsPerPage]);

  const filteredPrograms = breedingPrograms.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === 'all' || program.species === selectedSpecies;

    return matchesSearch && matchesSpecies;
  });

  const speciesOptions = [
    { value: 'all', label: 'All Species' },
    { value: 'Cattle', label: 'Cattle' },
    { value: 'Sheep', label: 'Sheep' },
    { value: 'Goats', label: 'Goats' }
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      planned: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getHealthBadge = (status: string) => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getAnalysisStatus = (status: string) => {
    const colors: Record<string, string> = {
      on_track: 'bg-green-100 text-green-800',
      exceeding: 'bg-blue-100 text-blue-800',
      needs_attention: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!mounted) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  return (
    <DashboardLayout
      title="Breeding Management"
      subtitle="Manage breeding programs, track genetic progress, and optimize livestock reproduction"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Program</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {breedingStats.map((stat, index) => (
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

        {/* Breeding Programs Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BreedingProgramsChart
            data={{
              successful: [8, 10, 12, 11, 13, 14, 15],
              pending: [3, 2, 2, 3, 2, 1, 2],
              failed: [1, 1, 0, 1, 0, 0, 1],
            }}
            labels={['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']}
            title="Breeding Programs Overview"
          />
        </motion.div>

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
                    { id: 'programs', label: 'Breeding Programs', icon: HeartIcon },
                    { id: 'cycles', label: 'Breeding Cycles', icon: ArrowPathIcon },
                    { id: 'genetics', label: 'Genetic Analysis', icon: BeakerIcon }
                  ].map((tab) => {
                    const isLocked = isBetaTier && tab.id !== 'programs';
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            setShowUpgradeModal(true);
                          } else {
                            setActiveTab(tab.id);
                          }
                        }}
                        disabled={isLocked}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                          activeTab === tab.id
                            ? 'border-red-500 text-red-600'
                            : isLocked
                            ? 'border-transparent text-gray-400 cursor-not-allowed opacity-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        {isLocked && <span className="text-xs ml-1">🔒</span>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'programs' && (
                  <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search breeding programs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedSpecies}
                          onChange={(e) => setSelectedSpecies(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Filter by species"
                        >
                          {speciesOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ExportButton
                          data={filteredPrograms.map(program => ({
                            id: program.id,
                            name: program.name,
                            species: program.species,
                            breed: program.breed,
                            status: program.status,
                            successRate: program.successRate,
                            totalAnimals: program.totalAnimals,
                            expectedOffspring: program.expectedOffspring
                          }))}
                          filename="breeding-programs-export"
                          title="Breeding Programs"
                        />
                      </div>
                    </div>

                    {/* Programs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredPrograms.map((program) => (
                        <motion.div
                          key={program.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                              <p className="text-sm text-gray-600">{program.species} • {program.breed}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(program.status)}`}>
                              {program.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Success Rate</p>
                              <p className="text-sm font-semibold text-gray-900">{program.successRate}%</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Females</p>
                              <p className="text-lg font-semibold text-gray-900">{program.breedingFemales}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Males</p>
                              <p className="text-lg font-semibold text-gray-900">{program.breedingMales}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Expected</p>
                              <p className="text-lg font-semibold text-gray-900">{program.expectedOffspring}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Goals</p>
                            <div className="flex flex-wrap gap-2">
                              {program.goals.slice(0, 2).map((goal, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                  {goal}
                                </span>
                              ))}
                              {program.goals.length > 2 && (
                                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                  +{program.goals.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Manager: {program.manager}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Program"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Edit Program"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination for Programs */}
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
                  </div>
                )}

                {activeTab === 'cycles' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {breedingCycles.map((cycle) => (
                        <motion.div
                          key={cycle.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{cycle.animalName}</h3>
                              <p className="text-sm text-gray-600">{cycle.animalId} • {cycle.breed}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthBadge(cycle.healthStatus)}`}>
                              {cycle.healthStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Fertility Score</p>
                              <p className="text-lg font-semibold text-gray-900">{cycle.fertilityScore}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Expected Births</p>
                              <p className="text-lg font-semibold text-gray-900">{cycle.expectedBirths}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Mated With</p>
                            <div className="flex flex-wrap gap-2">
                              {cycle.matedWith.map((mate, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                  {mate}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Cycle Period</p>
                            <p className="text-sm text-gray-900">
                              {new Date(cycle.cycleStart).toLocaleDateString()} - {new Date(cycle.cycleEnd).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {cycle.notes}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Cycle"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Edit Cycle"
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

                {activeTab === 'genetics' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {geneticAnalysis.map((analysis) => (
                        <motion.div
                          key={analysis.trait}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{analysis.trait}</h3>
                              <p className="text-sm text-gray-600">Genetic Analysis</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAnalysisStatus(analysis.status)}`}>
                              {analysis.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Current Average</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {analysis.currentAverage}{analysis.trait === 'Growth Rate' ? ' kg/day' : analysis.trait === 'Milk Production' ? ' L/day' : '%'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Target Average</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {analysis.targetAverage}{analysis.trait === 'Growth Rate' ? ' kg/day' : analysis.trait === 'Milk Production' ? ' L/day' : '%'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Improvement</span>
                              <span className="text-sm font-semibold text-green-600">
                                +{analysis.improvement}%
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  analysis.status === 'exceeding' ? 'bg-blue-600' :
                                  analysis.status === 'on_track' ? 'bg-green-600' :
                                  analysis.status === 'needs_attention' ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${Math.min((analysis.currentAverage / analysis.targetAverage) * 100, 100)}%` }}
                              ></div>
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
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      event.type === 'birth' ? 'bg-purple-100' :
                      event.type === 'health_check' ? 'bg-blue-100' :
                      event.type === 'breeding' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {event.type === 'birth' && <SparklesIcon className="h-4 w-4 text-purple-600" />}
                      {event.type === 'health_check' && <HeartIcon className="h-4 w-4 text-blue-600" />}
                      {event.type === 'breeding' && <ArrowPathIcon className="h-4 w-4 text-red-600" />}
                      {event.type === 'genetic_test' && <BeakerIcon className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(event.priority)}`}>
                      {event.priority}
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
                      activity.type === 'breeding' ? 'bg-red-100' :
                      activity.type === 'birth' ? 'bg-purple-100' :
                      activity.type === 'health' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {activity.type === 'breeding' && <HeartIcon className="h-4 w-4 text-red-600" />}
                      {activity.type === 'birth' && <SparklesIcon className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'health' && <CheckCircleIcon className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'genetic' && <BeakerIcon className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
                  <PlusIcon className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">New Program</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowPathIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Start Cycle</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <BeakerIcon className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Run Analysis</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChartBarIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">View Reports</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Program Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Breeding Program"
        size="lg"
      >
        <div className="p-6">
          <p className="text-gray-600">Breeding program form will be implemented here.</p>
        </div>
      </Modal>

      {/* Upgrade Modal for BETA Tier */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Access Premium Features"
        size="md"
      >
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              This feature is only available in Professional and Enterprise tiers.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Upgrade Benefits:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Access to Breeding Cycles tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Advanced Genetic Analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Unlimited records per module
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Multi-user access
              </li>
            </ul>
          </div>
          <button
            type="button"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            Upgrade Now
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}