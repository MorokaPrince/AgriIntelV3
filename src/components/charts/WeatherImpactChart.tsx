'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { CloudIcon, SunIcon } from '@heroicons/react/24/outline';

// Register Chart.js components
Chart.register(...registerables);

interface WeatherImpactChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      type: 'line' | 'bar';
      backgroundColor: string;
      borderColor: string;
      tension: number;
      yAxisID: string;
    }[];
  };
  title: string;
  subtitle?: string;
  className?: string;
  currentWeather?: {
    condition: string;
    temperature: number;
    icon: string;
  };
}

export const WeatherImpactChart: React.FC<WeatherImpactChartProps> = ({
  data,
  title,
  subtitle,
  className = '',
  currentWeather
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
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                grid: {
                  color: 'rgba(43, 108, 176, 0.05)'
                },
                ticks: {
                  font: {
                    family: 'Inter, sans-serif',
                    size: 11
                  }
                }
              },
              y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: {
                  drawOnChartArea: false
                },
                ticks: {
                  font: {
                    family: 'Inter, sans-serif',
                    size: 11
                  }
                }
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

  const getWeatherIcon = () => {
    if (!currentWeather) return <CloudIcon className="h-8 w-8 text-blue-500" />;

    switch (currentWeather.condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <SunIcon className="h-8 w-8 text-yellow-500" />;
      case 'rainy':
      case 'rain':
        return <CloudIcon className="h-8 w-8 text-blue-600" />;
      case 'cloudy':
        return <CloudIcon className="h-8 w-8 text-gray-500" />;
      case 'stormy':
      case 'thunderstorm':
        return <CloudIcon className="h-8 w-8 text-purple-600" />;
      default:
        return <CloudIcon className="h-8 w-8 text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`chart-container card-enhanced ${className}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CloudIcon className="h-5 w-5 mr-2 text-blue-600" />
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {currentWeather && (
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                {getWeatherIcon()}
              </div>
              <div className="text-sm font-medium text-blue-800">
                {currentWeather.condition}
              </div>
              <div className="text-lg font-bold text-blue-900">
                {currentWeather.temperature}°C
              </div>
            </div>
          )}
        </div>

        <div className="relative h-64 mb-4">
          <canvas ref={chartRef} />
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <span>Temperature (°C)</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span>Productivity Impact</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};