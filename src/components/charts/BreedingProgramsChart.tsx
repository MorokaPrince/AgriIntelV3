'use client';

import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { ChartCustomizer } from './ChartCustomizer';
import { exportChartAsCSV, exportChartAsPNG, exportChartAsPDF } from '@/utils/chartExport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface BreedingProgramsChartProps {
  data?: {
    successful: number[];
    pending: number[];
    failed: number[];
  };
  labels?: string[];
  title?: string;
}

export const BreedingProgramsChart: React.FC<BreedingProgramsChartProps> = ({
  data = {
    successful: [8, 10, 12, 11, 13, 14, 15],
    pending: [3, 2, 2, 3, 2, 1, 2],
    failed: [1, 1, 0, 1, 0, 0, 1],
  },
  labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
  title = 'Breeding Programs Overview',
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleExport = async (format: 'csv' | 'png' | 'pdf') => {
    try {
      if (format === 'csv') {
        await exportChartAsCSV(
          {
            ...Object.fromEntries(labels.map((l, i) => [l, data.successful[i]])),
          },
          'breeding-programs.csv'
        );
      } else if (format === 'png') {
        await exportChartAsPNG('breeding-chart', 'breeding-programs.png');
      } else if (format === 'pdf') {
        await exportChartAsPDF('breeding-chart', 'breeding-programs.pdf', title);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel((prev) => (direction === 'in' ? prev + 0.1 : Math.max(0.5, prev - 0.1)));
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Successful',
        data: data.successful,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pending',
        data: data.pending,
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 1,
      },
      {
        label: 'Failed',
        data: data.failed,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
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
      },
    },
  };

  const totalSuccessful = data.successful.reduce((a, b) => a + b, 0);
  const totalPending = data.pending.reduce((a, b) => a + b, 0);
  const totalFailed = data.failed.reduce((a, b) => a + b, 0);
  const successRate = totalSuccessful + totalFailed > 0 
    ? Math.round((totalSuccessful / (totalSuccessful + totalFailed)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'bar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Line
          </button>
        </div>
      </div>

      <ChartCustomizer
        title="Chart Options"
        onExport={handleExport}
        onZoom={handleZoom}
        showDateRange={false}
        showExport={true}
        showZoom={true}
      />

      <div id="breeding-chart" className="relative h-80">
        {chartType === 'bar' && <Bar data={chartData} options={options} />}
        {chartType === 'line' && <Line data={chartData} options={options} />}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Successful Programs</p>
          <p className="text-2xl font-bold text-green-600">{totalSuccessful}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Pending Programs</p>
          <p className="text-2xl font-bold text-orange-600">{totalPending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-blue-600">{successRate}%</p>
        </div>
      </div>
    </motion.div>
  );
};

