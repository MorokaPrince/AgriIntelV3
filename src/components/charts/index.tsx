import React from 'react';
import { motion } from 'framer-motion';

// Export all chart components
export { AnimalPopulationChart } from './AnimalPopulationChart';
export { HealthTrendsChart } from './HealthTrendsChart';
export { FinancialOverviewChart } from './FinancialOverviewChart';
export { FeedingTrendsChart } from './FeedingTrendsChart';
export { TasksStatusChart } from './TasksStatusChart';
export { BreedingProgramsChart } from './BreedingProgramsChart';
export { RFIDStatusChart } from './RFIDStatusChart';
export { ChartCustomizer } from './ChartCustomizer';

interface MetricCardProps {
  data: {
    title: string;
    value: string | number;
    icon?: string;
    color?: 'primary' | 'success' | 'warning' | 'danger';
    change?: {
      type: 'increase' | 'decrease';
      value: number;
      period: string;
    };
    format?: 'number' | 'currency' | 'percentage';
  };
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showTrend?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  data,
  size = 'md',
  animate = false,
  showTrend = false,
  onClick,
  className = ''
}: MetricCardProps) {
  const formatValue = (value: string | number) => {
    if (data.format === 'currency') {
      return `R${Number(value).toLocaleString()}`;
    }
    if (data.format === 'percentage') {
      return `${Number(value)}%`;
    }
    return value.toString();
  };

  return (
    <motion.div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer relative overflow-hidden ${className}`}
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <motion.p
              className="text-sm font-medium text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {data.title}
            </motion.p>
            <motion.p
              className={`text-2xl font-bold ${data.color === 'success' ? 'text-green-600' :
                data.color === 'warning' ? 'text-yellow-600' :
                data.color === 'danger' ? 'text-red-600' : 'text-blue-600'}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              {formatValue(data.value)}
            </motion.p>
            {data.change && showTrend && (
              <motion.div
                className="flex items-center space-x-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.span
                  className={`text-xs ${data.change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}
                  animate={{
                    scale: [1, 1.2, 1],
                    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }}
                >
                  {data.change.type === 'increase' ? '↗' : '↘'} {data.change.value}%
                </motion.span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{data.change.period}</span>
              </motion.div>
            )}
          </div>
          {data.icon && (
            <motion.div
              className={`text-3xl ${data.color === 'success' ? 'text-green-600' :
                data.color === 'warning' ? 'text-yellow-600' :
                data.color === 'danger' ? 'text-red-600' : 'text-blue-600'}`}
              whileHover={{
                scale: 1.1,
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.3 }
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              {data.icon}
            </motion.div>
          )}
        </div>

        {/* Subtle pulse effect for animated cards */}
        {animate && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-purple-500/20"
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </div>
    </motion.div>
  );
}