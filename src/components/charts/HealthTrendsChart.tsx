'use client';

import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface HealthTrendsChartProps {
  data?: Record<string, number[]>;
  labels?: string[];
  title?: string;
}

export const HealthTrendsChart: React.FC<HealthTrendsChartProps> = ({
  data = {
    'Excellent': [85, 87, 89, 91, 92, 94, 95],
    'Good': [10, 9, 8, 6, 5, 4, 3],
    'Fair': [4, 3, 2, 2, 2, 1, 1],
    'Poor': [1, 1, 1, 1, 1, 1, 1],
  },
  labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
  title = 'Health Status Trends',
}) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  const colors = [
    { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 1)' },
    { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 1)' },
    { bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 1)' },
    { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 1)' },
  ];

  const chartData = {
    labels,
    datasets: Object.entries(data).map(([label, values], index) => {
      // Safely get color with fallback for additional datasets
      const colorIndex = index % colors.length;
      const color = colors[colorIndex];

      return {
        label,
        data: values,
        borderColor: color.border,
        backgroundColor: chartType === 'area' ? color.bg : 'transparent',
        fill: chartType === 'area',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: color.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          {(['line', 'area'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setChartType(type)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-80">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

