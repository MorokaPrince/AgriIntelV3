'use client';

import React, { useState } from 'react';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
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

interface AnimalPopulationChartProps {
  data?: Record<string, number>;
  title?: string;
}

export const AnimalPopulationChart: React.FC<AnimalPopulationChartProps> = ({
  data = {
    Cattle: 24,
    Sheep: 18,
    Goats: 12,
    Poultry: 30,
    Pigs: 8,
  },
  title = 'Animal Population Breakdown',
}) => {
  const [chartType, setChartType] = useState<'doughnut' | 'pie' | 'bar'>('doughnut');
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleExport = async (format: 'csv' | 'png' | 'pdf') => {
    try {
      if (format === 'csv') {
        await exportChartAsCSV(data, 'animal-population.csv');
      } else if (format === 'png') {
        await exportChartAsPNG('animal-chart', 'animal-population.png');
      } else if (format === 'pdf') {
        await exportChartAsPDF('animal-chart', 'animal-population.pdf', title);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoomLevel + 0.2 : Math.max(0.6, zoomLevel - 0.2);
    setZoomLevel(newZoom);
  };

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Count',
        data: Object.values(data),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Count',
        data: Object.values(data),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          {(['doughnut', 'pie', 'bar'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setChartType(type)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === type
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Customizer */}
      <ChartCustomizer
        title="Chart Options"
        onExport={handleExport}
        onZoom={handleZoom}
        showDateRange={false}
        showExport={true}
        showZoom={true}
      />

      <div id="animal-chart" className="relative h-80">
        {chartType === 'doughnut' && <Doughnut data={chartData} options={options} />}
        {chartType === 'pie' && <Pie data={chartData} options={options} />}
        {chartType === 'bar' && <Bar data={barChartData} options={options} />}
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {Object.entries(data).map(([label, value]) => (
          <div key={label} className="text-center p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-600">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

