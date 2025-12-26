'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useFinancialStore, FinancialRecord } from '@/stores/financial-store';
import { useAuthStore } from '@/stores/auth-store';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import { FinancialOverviewChart } from '@/components/charts/FinancialOverviewChart';
import { ExportButton } from '@/components/common/ExportButton';

// Dynamic stats calculation from actual data
const getFinancialStats = (records: FinancialRecord[]) => {
  // Handle empty or undefined records
  if (!records || records.length === 0) {
    return [
      {
        title: 'Total Revenue',
        value: 'R0',
        change: '0%',
        trend: 'stable',
        icon: ArrowTrendingUpIcon,
        color: 'green'
      },
      {
        title: 'Total Expenses',
        value: 'R0',
        change: '0%',
        trend: 'stable',
        icon: ArrowTrendingDownIcon,
        color: 'red'
      },
      {
        title: 'Net Profit',
        value: 'R0',
        change: '0%',
        trend: 'stable',
        icon: ChartPieIcon,
        color: 'blue'
      },
      {
        title: 'This Month',
        value: 'R0',
        change: '0%',
        trend: 'stable',
        icon: CalendarIcon,
        color: 'purple'
      }
    ];
  }

  const totalIncome = records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalExpense = records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const thisMonth = records
    .filter(r => {
      try {
        const recordDate = new Date(r.date);
        const now = new Date();
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
      } catch (error) {
        return false;
      }
    })
    .reduce((sum, r) => sum + (r.type === 'income' ? r.amount : -r.amount), 0);

  const stats = [
    {
      title: 'Total Revenue',
      value: `R${totalIncome.toLocaleString()}`,
      change: '+18%',
      trend: 'up',
      icon: ArrowTrendingUpIcon,
      color: 'green'
    },
    {
      title: 'Total Expenses',
      value: `R${totalExpense.toLocaleString()}`,
      change: '+12%',
      trend: 'up',
      icon: ArrowTrendingDownIcon,
      color: 'red'
    },
    {
      title: 'Net Profit',
      value: `R${netProfit.toLocaleString()}`,
      change: '+24%',
      trend: 'up',
      icon: ChartPieIcon,
      color: 'blue'
    },
    {
      title: 'This Month',
      value: `R${thisMonth.toLocaleString()}`,
      change: '+8%',
      trend: 'up',
      icon: CalendarIcon,
      color: 'purple'
    }
  ];

  return stats;
};

const recentTransactions = [
  {
    id: 1,
    type: 'income',
    category: 'sales',
    description: 'Cattle sale - Premium Angus',
    amount: 25000,
    date: '2024-01-18',
    reference: 'SALE-2024-001'
  },
  {
    id: 2,
    type: 'expense',
    category: 'feed',
    description: 'Bulk feed purchase',
    amount: -8500,
    date: '2024-01-17',
    reference: 'EXP-2024-045'
  },
  {
    id: 3,
    type: 'expense',
    category: 'veterinary',
    description: 'Vaccination program',
    amount: -2400,
    date: '2024-01-16',
    reference: 'VET-2024-023'
  },
  {
    id: 4,
    type: 'income',
    category: 'sales',
    description: 'Milk sales - January',
    amount: 15600,
    date: '2024-01-15',
    reference: 'MILK-2024-001'
  },
  {
    id: 5,
    type: 'expense',
    category: 'equipment',
    description: 'RFID reader maintenance',
    amount: -1200,
    date: '2024-01-14',
    reference: 'MAINT-2024-012'
  }
];

const expenseBreakdown = [
  { category: 'Feed', amount: 45230, percentage: 51, color: 'bg-blue-500' },
  { category: 'Veterinary', amount: 18900, percentage: 21, color: 'bg-red-500' },
  { category: 'Equipment', amount: 12300, percentage: 14, color: 'bg-green-500' },
  { category: 'Labor', amount: 6800, percentage: 8, color: 'bg-yellow-500' },
  { category: 'Other', amount: 5000, percentage: 6, color: 'bg-purple-500' }
];

const monthlyTrends = [
  { month: 'Jul', income: 45000, expenses: 32000, profit: 13000 },
  { month: 'Aug', income: 52000, expenses: 35000, profit: 17000 },
  { month: 'Sep', income: 48000, expenses: 33000, profit: 15000 },
  { month: 'Oct', income: 61000, expenses: 38000, profit: 23000 },
  { month: 'Nov', income: 58000, expenses: 36000, profit: 22000 },
  { month: 'Dec', income: 72000, expenses: 42000, profit: 30000 },
  { month: 'Jan', income: 68000, expenses: 39000, profit: 29000 }
];

export default function FinancialPage() {
  const { user } = useAuthStore();
  const { financialRecords, loading, setFinancialRecords } = useFinancialStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fetch financial records from API with pagination
    const fetchFinancialRecords = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/financial?page=${currentPage}&limit=${recordsPerPage}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setFinancialRecords(data.data);
            if (data.pagination) {
              setTotalRecords(data.pagination.total || 0);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching financial records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialRecords();
  }, [currentPage, recordsPerPage, setFinancialRecords]);

  // Fallback seed data if API fails
  useEffect(() => {
    const seedFinancialRecords: FinancialRecord[] = [
      {
        _id: '1',
        type: 'income',
        category: 'sales',
        subcategory: 'cattle',
        amount: 25000,
        currency: 'ZAR',
        description: 'Sale of premium Angus cattle',
        date: new Date('2024-01-18'),
        paymentMethod: 'bank_transfer',
        receiptNumber: 'SALE-2024-001',
        tags: ['cattle', 'premium', 'angus'],
        isRecurring: false,
        createdBy: user?._id || '1'
      },
      {
        _id: '2',
        type: 'expense',
        category: 'feed',
        subcategory: 'bulk_purchase',
        amount: 8500,
        currency: 'ZAR',
        description: 'Monthly bulk feed purchase for cattle',
        date: new Date('2024-01-17'),
        paymentMethod: 'bank_transfer',
        receiptNumber: 'FEED-2024-045',
        vendor: 'AgriFeed Suppliers',
        tags: ['feed', 'bulk', 'monthly'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdBy: user?._id || '1'
      },
      {
        _id: '3',
        type: 'expense',
        category: 'veterinary',
        subcategory: 'vaccination',
        amount: 2400,
        currency: 'ZAR',
        description: 'Annual vaccination program for herd',
        date: new Date('2024-01-16'),
        paymentMethod: 'bank_transfer',
        receiptNumber: 'VET-2024-023',
        vendor: 'Veterinary Services Co.',
        tags: ['vaccination', 'annual', 'health'],
        isRecurring: true,
        recurringFrequency: 'yearly',
        createdBy: user?._id || '1'
      },
      {
        _id: '4',
        type: 'income',
        category: 'sales',
        subcategory: 'milk',
        amount: 15600,
        currency: 'ZAR',
        description: 'January milk production sales',
        date: new Date('2024-01-15'),
        paymentMethod: 'bank_transfer',
        receiptNumber: 'MILK-2024-001',
        tags: ['milk', 'dairy', 'monthly'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdBy: user?._id || '1'
      },
      {
        _id: '5',
        type: 'expense',
        category: 'equipment',
        subcategory: 'maintenance',
        amount: 1200,
        currency: 'ZAR',
        description: 'RFID system maintenance and calibration',
        date: new Date('2024-01-14'),
        paymentMethod: 'bank_transfer',
        receiptNumber: 'MAINT-2024-012',
        vendor: 'TechFarm Solutions',
        tags: ['rfid', 'maintenance', 'technology'],
        isRecurring: false,
        createdBy: user?._id || '1'
      },
      {
        _id: '6',
        type: 'expense',
        category: 'labor',
        subcategory: 'wages',
        amount: 15000,
        currency: 'ZAR',
        description: 'Monthly farm labor wages',
        date: new Date('2024-01-13'),
        paymentMethod: 'bank_transfer',
        receiptNumber: 'LABOR-2024-013',
        tags: ['labor', 'wages', 'monthly'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdBy: user?._id || '1'
      },
      {
        _id: '7',
        type: 'income',
        category: 'sales',
        subcategory: 'wool',
        amount: 3200,
        currency: 'ZAR',
        description: 'Sheep wool sales - December batch',
        date: new Date('2024-01-12'),
        paymentMethod: 'bank_transfer',
        receiptNumber: 'WOOL-2024-002',
        tags: ['wool', 'sheep', 'seasonal'],
        isRecurring: false,
        createdBy: user?._id || '1'
      },
      {
        _id: '8',
        type: 'expense',
        category: 'feed',
        subcategory: 'supplements',
        amount: 1800,
        currency: 'ZAR',
        description: 'Vitamin and mineral supplements',
        date: new Date('2024-01-11'),
        paymentMethod: 'bank_transfer',
        receiptNumber: 'SUPP-2024-008',
        vendor: 'AgriHealth Products',
        tags: ['supplements', 'health', 'vitamins'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdBy: user?._id || '1'
      }
    ];

    if (financialRecords.length === 0) {
      setFinancialRecords(seedFinancialRecords);
    }
  }, [setFinancialRecords, user, financialRecords.length]);

  const filteredRecords = financialRecords.filter((record: FinancialRecord) => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (record.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = selectedType === 'all' || record.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expenses' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'sales', label: 'Sales' },
    { value: 'feed', label: 'Feed' },
    { value: 'veterinary', label: 'Veterinary' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'labor', label: 'Labor' },
    { value: 'other', label: 'Other' }
  ];

  const getTypeIcon = (type: string) => {
    return type === 'income' ? '💰' : '💸';
  };

  const getTypeBadgeColor = (type: string) => {
    return type === 'income'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sales: 'bg-green-100 text-green-800',
      feed: 'bg-blue-100 text-blue-800',
      veterinary: 'bg-red-100 text-red-800',
      equipment: 'bg-purple-100 text-purple-800',
      labor: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Safe calculations with fallback values
  const totalIncome = financialRecords?.length > 0
    ? financialRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + (r.amount || 0), 0)
    : 0;

  const totalExpenses = financialRecords?.length > 0
    ? Math.abs(financialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + (r.amount || 0), 0))
    : 0;

  const netProfit = totalIncome - totalExpenses;

  if (!mounted) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  return (
    <DashboardLayout
      title="Financial Management"
      subtitle="Track income, expenses, and analyze farm profitability"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getFinancialStats(financialRecords).map((stat, index) => (
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
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      title="Filter by transaction type"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      title="Filter by category"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ExportButton
                      data={filteredRecords.map(r => ({
                        id: r._id,
                        description: r.description,
                        type: r.type,
                        category: r.category,
                        amount: r.amount,
                        date: r.date,
                        receiptNumber: r.receiptNumber
                      }))}
                      filename="financial-records-export"
                      title="Financial Records"
                    />
                  </div>
                </div>
              </div>

              {/* Transactions */}
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
                            <h3 className="font-semibold text-gray-900">{record.description}</h3>
                            <p className="text-sm text-gray-600">
                              {record.receiptNumber} • {new Date(record.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(record.type)}`}>
                            {record.type}
                          </span>
                          <p className={`text-lg font-bold mt-1 ${
                            record.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {record.type === 'income' ? '+' : '-'}R{record.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(record.category)}`}>
                            {record.category}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment Method</p>
                          <p className="text-sm text-gray-900 capitalize">{record.paymentMethod.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Vendor</p>
                          <p className="text-sm text-gray-900">{record.vendor || 'N/A'}</p>
                        </div>
                      </div>

                      {record.tags && record.tags.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {record.tags.map((tag, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {record.isRecurring && (
                            <span className="inline-flex items-center">
                              <ReceiptRefundIcon className="h-3 w-3 mr-1" />
                              Recurring {record.recurringFrequency}
                            </span>
                          )}
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
                            title="Edit Transaction"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Transaction"
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
                    <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found matching your criteria</p>
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
            {/* Financial Overview Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <FinancialOverviewChart
                data={{
                  income: [45000, 52000, 48000, 61000, 55000, 67000],
                  expenses: [32000, 38000, 35000, 42000, 40000, 45000]
                }}
                title="Financial Overview"
              />
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Income</span>
                  <span className="font-semibold text-green-600">
                    R{totalIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Expenses</span>
                  <span className="font-semibold text-red-600">
                    R{totalExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Net Profit</span>
                    <span className="text-lg font-bold text-blue-600">
                      R{netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Expense Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                {expenseBreakdown.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                      <span className="text-sm text-gray-600">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        R{item.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Monthly Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              <div className="space-y-2">
                {monthlyTrends.slice(-6).map((month) => (
                  <div key={month.month} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{month.month}</span>
                    <div className="flex space-x-4">
                      <span className="text-green-600">+R{month.income.toLocaleString()}</span>
                      <span className="text-red-600">-R{month.expenses.toLocaleString()}</span>
                      <span className="font-semibold text-blue-600">R{month.profit.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transaction"
        size="lg"
      >
        <div className="p-6">
          <p className="text-gray-600">Transaction form will be implemented here.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}