'use client';

import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { ChartCustomizer } from './ChartCustomizer';
import { exportChartAsCSV, exportChartAsPNG, exportChartAsPDF } from '@/utils/chartExport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

interface FeedingTrendsChartProps {
  data?: {
    consumption: number[];
    efficiency: number[];
  };
  labels?: string[];
  title?: string;
}

export const FeedingTrendsChart: React.FC<FeedingTrendsChartProps> = ({
  data = {
    consumption: [180, 185, 190, 188, 192, 195, 200],
    efficiency: [92, 91, 93, 94, 92, 95, 96],
  },
  labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  title = 'Feeding Trends',
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleExport = async (format: 'csv' | 'png' | 'pdf') => {
    try {
      if (format === 'csv') {
        await exportChartAsCSV(
          {
            ...Object.fromEntries(labels.map((l, i) => [l, data.consumption[i]])),
          },
          'feeding-trends.csv'
        );
      } else if (format === 'png') {
        await exportChartAsPNG('feeding-chart', 'feeding-trends.png');
      } else if (format === 'pdf') {
        await exportChartAsPDF('feeding-chart', 'feeding-trends.pdf', title);
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
        label: 'Daily Consumption (kg)',
        data: data.consumption,
        borderColor: 'rgba(251, 146, 60, 1)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        fill: chartType === 'line',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(251, 146, 60, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Feed Efficiency (%)',
        data: data.efficiency,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: chartType === 'line',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
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
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Line
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

      <div id="feeding-chart" className="relative h-80">
        {chartType === 'line' && <Line data={chartData} options={options} />}
        {chartType === 'bar' && <Bar data={chartData} options={options} />}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Avg Daily Consumption</p>
          <p className="text-2xl font-bold text-orange-600">
            {Math.round(data.consumption.reduce((a, b) => a + b, 0) / data.consumption.length)} kg
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Avg Efficiency</p>
          <p className="text-2xl font-bold text-green-600">
            {Math.round(data.efficiency.reduce((a, b) => a + b, 0) / data.efficiency.length)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
};

