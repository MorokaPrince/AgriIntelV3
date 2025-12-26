'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { BeakerIcon } from '@heroicons/react/24/outline';

// Register Chart.js components
Chart.register(...registerables);

interface FeedEfficiencyChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  title: string;
  subtitle?: string;
  className?: string;
  efficiencyScore?: number;
}

export const FeedEfficiencyChart: React.FC<FeedEfficiencyChartProps> = ({
  data,
  title,
  subtitle,
  className = '',
  efficiencyScore = 0
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart instance
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right' as const,
                labels: {
                  usePointStyle: true,
                  padding: 16,
                  font: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    weight: 500
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(26, 32, 44, 0.95)',
                titleFont: {
                  family: 'Inter, sans-serif',
                  size: 14,
                  weight: 600
                },
                bodyFont: {
                  family: 'Inter, sans-serif',
                  size: 12
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                borderColor: 'rgba(43, 108, 176, 0.2)',
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${percentage}%`;
                  }
                }
              }
            },
            cutout: '70%',
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 1500,
              easing: 'easeInOutQuart' as const
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  const getEfficiencyColor = () => {
    if (efficiencyScore >= 80) return 'text-green-600';
    if (efficiencyScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyText = () => {
    if (efficiencyScore >= 80) return 'Excellent';
    if (efficiencyScore >= 60) return 'Good';
    if (efficiencyScore >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`chart-container card-enhanced ${className}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BeakerIcon className="h-5 w-5 mr-2 text-green-600" />
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getEfficiencyColor()}`}>
              {efficiencyScore}%
            </div>
            <div className={`text-sm ${getEfficiencyColor()}`}>
              {getEfficiencyText()}
            </div>
          </div>
        </div>

        <div className="relative h-64 mb-4 flex items-center justify-center">
          <div className="relative w-full h-full">
            <canvas ref={chartRef} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Overall Efficiency
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {efficiencyScore}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              <span>Optimal Usage</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Efficient</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              <span>Moderate</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              <span>Waste</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};