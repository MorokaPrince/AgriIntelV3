'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ChartCustomizerProps {
  onDateRangeChange?: (range: DateRange) => void;
  onExport?: (format: 'csv' | 'png' | 'pdf') => void;
  onZoom?: (direction: 'in' | 'out') => void;
  showDateRange?: boolean;
  showExport?: boolean;
  showZoom?: boolean;
  title?: string;
}

export const ChartCustomizer: React.FC<ChartCustomizerProps> = ({
  onDateRangeChange,
  onExport,
  onZoom,
  showDateRange = true,
  showExport = true,
  showZoom = true,
  title = 'Chart',
}) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [zoomLevel, setZoomLevel] = useState(1);

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
    onDateRangeChange?.(newRange);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoomLevel + 0.2 : Math.max(0.6, zoomLevel - 0.2);
    setZoomLevel(newZoom);
    onZoom?.(direction);
  };

  const handleExport = (format: 'csv' | 'png' | 'pdf') => {
    onExport?.(format);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-4 p-4 glassmorphism-agricultural-secondary rounded-lg border border-wheat/20 mb-4 hover-agricultural"
    >
      {/* Title */}
      <h3 className="text-sm font-semibold text-wheat mr-auto">{title}</h3>

      {/* Date Range Selector */}
      {showDateRange && (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-wheat/70" />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-wheat/70">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Zoom Controls */}
      {showZoom && (
        <div className="flex items-center gap-1 border border-wheat/30 rounded-lg p-1 bg-glass-forest">
          <button
            onClick={() => handleZoom('out')}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Zoom out"
            type="button"
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4 text-wheat/70" />
          </button>
          <span className="text-xs text-wheat/80 px-2 min-w-[40px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom('in')}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Zoom in"
            type="button"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4 text-wheat/70" />
          </button>
        </div>
      )}

      {/* Export Options */}
      {showExport && (
        <div className="flex items-center gap-2">
          <ArrowDownTrayIcon className="h-4 w-4 text-wheat/70" />
          <select
            onChange={(e) => handleExport(e.target.value as 'csv' | 'png' | 'pdf')}
            defaultValue=""
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Export as...</option>
            <option value="csv">CSV</option>
            <option value="png">PNG</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      )}
    </motion.div>
  );
};

