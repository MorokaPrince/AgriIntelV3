'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PredictionData {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  insights: string[];
  recommendations: string[];
}

interface PredictiveAnalyticsProps {
  data?: PredictionData[];
  className?: string;
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  data = [
    {
      metric: 'Feed Consumption',
      current: 1250,
      predicted: 1380,
      confidence: 85,
      trend: 'up',
      timeframe: 'Next 30 days',
      insights: [
        'Feed consumption has increased by 12% over the last month',
        'Weather patterns suggest higher activity levels',
        'Growth phase of cattle indicates higher nutritional needs'
      ],
      recommendations: [
        'Increase feed inventory by 15%',
        'Monitor weight gain metrics closely',
        'Consider adjusting feeding schedules'
      ]
    },
    {
      metric: 'Health Incidents',
      current: 3,
      predicted: 2,
      confidence: 78,
      trend: 'down',
      timeframe: 'Next 30 days',
      insights: [
        'Vaccination program showing positive results',
        'Improved quarantine procedures reducing spread',
        'Regular health checkups preventing issues'
      ],
      recommendations: [
        'Continue current vaccination schedule',
        'Maintain strict biosecurity protocols',
        'Schedule preventive veterinary visits'
      ]
    },
    {
      metric: 'Monthly Revenue',
      current: 45000,
      predicted: 48500,
      confidence: 82,
      trend: 'up',
      timeframe: 'Next month',
      insights: [
        'Market prices for livestock products trending upward',
        'Increased demand for organic products',
        'Successful breeding program expanding herd'
      ],
      recommendations: [
        'Prepare for increased sales volume',
        'Consider premium pricing for organic products',
        'Plan for additional labor during peak season'
      ]
    }
  ],
  className = ''
}) => {
  const [selectedMetric, setSelectedMetric] = useState(0);
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);

  useEffect(() => {
    // Animate values on load
    const timer = setTimeout(() => {
      setAnimatedValues(data.map(item => item.predicted));
    }, 500);

    return () => clearTimeout(timer);
  }, [data]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const selectedData = data[selectedMetric];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LightBulbIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Predictive Analytics
          </h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          AI-Powered Insights
        </div>
      </div>

      {/* Metric Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {data.map((item, index) => (
          <motion.button
            key={item.metric}
            onClick={() => setSelectedMetric(index)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedMetric === index
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {item.metric}
              </span>
              {getTrendIcon(item.trend)}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {animatedValues[index]?.toLocaleString() || item.current.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Predicted • {item.timeframe}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-6">
        {/* Current vs Predicted */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {selectedData.metric} Analysis
            </h4>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(selectedData.confidence)}`}>
              {selectedData.confidence}% Confidence
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedData.current.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Predicted</div>
              <motion.div
                className="text-2xl font-bold text-purple-600"
                initial={{ scale: 1 }}
                animate={{ scale: animatedValues[selectedMetric] ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {animatedValues[selectedMetric]?.toLocaleString() || selectedData.predicted.toLocaleString()}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            Key Insights
          </h4>
          <ul className="space-y-2">
            {selectedData.insights.map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                {insight}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {selectedData.recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                {recommendation}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};