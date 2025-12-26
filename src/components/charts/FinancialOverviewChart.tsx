'use client';

import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface FinancialOverviewChartProps {
  data?: {
    income: number[];
    expenses: number[];
  };
  labels?: string[];
  title?: string;
}

export const FinancialOverviewChart: React.FC<FinancialOverviewChartProps> = ({
  data = {
    income: [12000, 15000, 18000, 16000, 19000, 21000, 23000],
    expenses: [8000, 9000, 10000, 9500, 11000, 12000, 13000],
  },
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  title = 'Financial Overview',
}) => {
  const [showStacked, setShowStacked] = useState(false);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: data.income,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: data.expenses,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'x' as const,
    scales: {
      x: {
        stacked: showStacked,
      },
      y: {
        stacked: showStacked,
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  // Calculate totals with safety checks
  const totalIncome = data.income?.reduce((a, b) => a + b, 0) || 0;
  const totalExpenses = data.expenses?.reduce((a, b) => a + b, 0) || 0;
  const profit = totalIncome - totalExpenses;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showStacked}
            onChange={(e) => setShowStacked(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Stacked View</span>
        </label>
      </div>

      <div className="relative h-80 mb-6">
        <Bar data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Income</p>
          <p className="text-2xl font-bold text-green-600">ZAR {totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">ZAR {totalExpenses.toLocaleString()}</p>
        </div>
        <div className={`${profit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-4`}>
          <p className="text-sm text-gray-600">Net Profit</p>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            ZAR {profit.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

