'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';
import Pagination from '@/components/common/Pagination';
import { TasksStatusChart } from '@/components/charts/TasksStatusChart';
import { ExportButton } from '@/components/common/ExportButton';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  assignedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  dueDate: string;
  completedDate?: string;
  category: 'feeding' | 'health' | 'maintenance' | 'breeding' | 'financial' | 'general';
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  location?: string;
  animalId?: {
    _id: string;
    name: string;
    species: string;
  };
  kpi?: {
    efficiency?: number;
    quality?: number;
    timeliness?: number;
    safety?: number;
  };
  createdAt: string;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  overdue: 'bg-red-100 text-red-800',
};

const categoryColors = {
  feeding: 'bg-purple-100 text-purple-800',
  health: 'bg-pink-100 text-pink-800',
  maintenance: 'bg-indigo-100 text-indigo-800',
  breeding: 'bg-emerald-100 text-emerald-800',
  financial: 'bg-green-100 text-green-800',
  general: 'bg-gray-100 text-gray-800',
};

export default function TasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      // For now, using mock data until we implement tasks API
      const mockTasks: Task[] = [
        {
          _id: '1',
          title: 'Feed cattle in Section A',
          description: 'Provide morning feed to all cattle in Section A',
          assignedTo: {
            _id: 'user2',
            firstName: 'Jane',
            lastName: 'Worker',
          },
          assignedBy: {
            _id: 'user1',
            firstName: 'John',
            lastName: 'Admin',
          },
          priority: 'high',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          category: 'feeding',
          progress: 60,
          estimatedHours: 2,
          actualHours: 1.2,
          location: 'Section A',
          kpi: {
            efficiency: 85,
            quality: 90,
            timeliness: 75,
            safety: 95,
          },
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          title: 'Health check for Bella',
          description: 'Perform routine health examination on Bella (RFID001)',
          assignedTo: {
            _id: 'user3',
            firstName: 'Dr.',
            lastName: 'Smith',
          },
          assignedBy: {
            _id: 'user1',
            firstName: 'John',
            lastName: 'Admin',
          },
          priority: 'medium',
          status: 'pending',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          category: 'health',
          progress: 0,
          estimatedHours: 1,
          location: 'Vet Clinic',
          animalId: {
            _id: 'animal1',
            name: 'Bella',
            species: 'cattle',
          },
          kpi: {
            efficiency: 0,
            quality: 0,
            timeliness: 0,
            safety: 100,
          },
          createdAt: new Date().toISOString(),
        },
        {
          _id: '3',
          title: 'Equipment maintenance',
          description: 'Service and maintain feeding equipment',
          assignedTo: {
            _id: 'user2',
            firstName: 'Jane',
            lastName: 'Worker',
          },
          assignedBy: {
            _id: 'user1',
            firstName: 'John',
            lastName: 'Admin',
          },
          priority: 'medium',
          status: 'completed',
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          completedDate: new Date().toISOString(),
          category: 'maintenance',
          progress: 100,
          estimatedHours: 3,
          actualHours: 2.5,
          location: 'Equipment Shed',
          kpi: {
            efficiency: 92,
            quality: 88,
            timeliness: 95,
            safety: 98,
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Filter tasks based on status
      const filteredTasks = filter === 'all'
        ? mockTasks
        : mockTasks.filter(task => task.status === filter);

      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getKPIAverage = (task: Task) => {
    if (!task.kpi) return 0;
    const values = Object.values(task.kpi).filter(val => val !== undefined);
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout
      title="Task Management"
      subtitle="Track and manage farm tasks with KPI monitoring"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">Total Tasks: {tasks.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="task-filter" className="text-sm text-gray-600">Filter:</label>
              <select
                id="task-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Tasks Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TasksStatusChart
            data={{
              'Completed': 24,
              'In Progress': 12,
              'Pending': 8,
              'Overdue': 3,
            }}
            title="Task Status Distribution"
          />
        </motion.div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{task.category.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status]}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{task.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'overdue' ? 'bg-red-500' :
                      task.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Assigned to:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {task.assignedTo.firstName} {task.assignedTo.lastName}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Due:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* KPI Section */}
              {task.kpi && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-1 mb-2">
                    <TagIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">KPI Performance</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {task.kpi.efficiency && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficiency:</span>
                        <span className={`font-medium ${task.kpi.efficiency >= 80 ? 'text-green-600' : task.kpi.efficiency >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {task.kpi.efficiency}%
                        </span>
                      </div>
                    )}
                    {task.kpi.timeliness && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timeliness:</span>
                        <span className={`font-medium ${task.kpi.timeliness >= 80 ? 'text-green-600' : task.kpi.timeliness >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {task.kpi.timeliness}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-500">Average KPI:</span>
                    <span className={`text-sm font-bold ml-1 ${getKPIAverage(task) >= 80 ? 'text-green-600' : getKPIAverage(task) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {Math.round(getKPIAverage(task))}%
                    </span>
                  </div>
                </div>
              )}

              {/* Time Tracking */}
              {task.estimatedHours && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-700">Time Tracking:</span>
                    <span className="font-medium text-blue-900">
                      {task.actualHours || 0}h / {task.estimatedHours}h
                    </span>
                  </div>
                  {task.actualHours && task.estimatedHours && (
                    <div className="mt-2 text-xs text-blue-600">
                      {task.actualHours <= task.estimatedHours ? 'On track' : 'Overtime'}
                    </div>
                  )}
                </div>
              )}

              {/* Location and Animal */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                {task.location && <span>Location: {task.location}</span>}
                {task.animalId && <span>Animal: {task.animalId.name}</span>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {tasks.length > 0 && (
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
        )}

        {/* Empty State */}
        {tasks.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Get started by creating your first task.'
                : `No ${filter.replace('_', ' ')} tasks found.`
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create First Task</span>
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