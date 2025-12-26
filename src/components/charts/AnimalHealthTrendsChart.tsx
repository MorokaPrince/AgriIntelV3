'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { HeartIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

// Register Chart.js components
Chart.register(...registerables);

interface AnimalHealthTrendsChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
      fill: boolean;
    }[];
  };
  title: string;
  subtitle?: string;
  className?: string;
  showTrend?: boolean;
  trendValue?: number;
  trendDirection?: 'up' | 'down' | 'stable';
}

export const AnimalHealthTrendsChart: React.FC<AnimalHealthTrendsChartProps> = ({
  data,
  title,
  subtitle,
  className = '',
  showTrend = true,
  trendValue = 0,
  trendDirection = 'stable'
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
          type: 'line',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
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
                displayColors: true,
                borderColor: 'rgba(43, 108, 176, 0.2)',
                borderWidth: 1
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  font: {
                    family: 'Inter, sans-serif',
                    size: 11
                  }
                }
              },
              y: {
                grid: {
                  color: 'rgba(43, 108, 176, 0.05)'
                },
                ticks: {
                  font: {
                    family: 'Inter, sans-serif',
                    size: 11
                  }
                }
              }
            },
            elements: {
              point: {
                radius: 4,
                hoverRadius: 6,
                hitRadius: 8
              },
              line: {
                borderWidth: 2,
                borderJoinStyle: 'round' as const
              }
            },
            animation: {
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

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`chart-container card-enhanced ${className}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <HeartIcon className="h-5 w-5 mr-2 text-blue-600" />
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {showTrend && (
            <div className={`flex items-center space-x-2 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-medium">
                {trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : ''}
                {trendValue}%
              </span>
            </div>
          )}
        </div>

        <div className="relative h-64 mb-4">
          <canvas ref={chartRef} />
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <span>Health Score</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span>Recovery Rate</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};