'use client';

import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { ChartCustomizer } from './ChartCustomizer';
import { exportChartAsCSV, exportChartAsPNG, exportChartAsPDF } from '@/utils/chartExport';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface RFIDStatusChartProps {
  data?: Record<string, number>;
  title?: string;
}

export const RFIDStatusChart: React.FC<RFIDStatusChartProps> = ({
  data = {
    'Active': 42,
    'Inactive': 5,
    'Low Battery': 3,
    'Maintenance': 2,
  },
  title = 'RFID Device Status',
}) => {
  const [chartType, setChartType] = useState<'doughnut' | 'bar'>('doughnut');
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleExport = async (format: 'csv' | 'png' | 'pdf') => {
    try {
      if (format === 'csv') {
        await exportChartAsCSV(data, 'rfid-status.csv');
      } else if (format === 'png') {
        await exportChartAsPNG('rfid-chart', 'rfid-status.png');
      } else if (format === 'pdf') {
        await exportChartAsPDF('rfid-chart', 'rfid-status.pdf', title);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel((prev) => (direction === 'in' ? prev + 0.1 : Math.max(0.5, prev - 0.1)));
  };

  const colors = ['rgba(34, 197, 94, 0.8)', 'rgba(107, 114, 128, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(251, 146, 60, 0.8)'];
  const borderColors = ['rgba(34, 197, 94, 1)', 'rgba(107, 114, 128, 1)', 'rgba(239, 68, 68, 1)', 'rgba(251, 146, 60, 1)'];

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Number of Devices',
        data: Object.values(data),
        backgroundColor: colors,
        borderColor: borderColors,
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
  };

  const totalDevices = Object.values(data).reduce((a, b) => a + b, 0);
  const activeDevices = data['Active'] || 0;
  const activeRate = totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 0;
  const lowBatteryDevices = data['Low Battery'] || 0;

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
            onClick={() => setChartType('doughnut')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'doughnut'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Doughnut
          </button>
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

      <div id="rfid-chart" className="relative h-80">
        {chartType === 'doughnut' && <Doughnut data={chartData} options={options} />}
        {chartType === 'bar' && <Bar data={barChartData} options={options} />}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active Devices</p>
          <p className="text-2xl font-bold text-green-600">{activeDevices}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active Rate</p>
          <p className="text-2xl font-bold text-blue-600">{activeRate}%</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Low Battery Alert</p>
          <p className="text-2xl font-bold text-red-600">{lowBatteryDevices}</p>
        </div>
      </div>
    </motion.div>
  );
};

