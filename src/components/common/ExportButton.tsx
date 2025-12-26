'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { exportAsCSV, exportAsExcel, exportAsPDF } from '@/utils/dataExport';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename?: string;
  title?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename = 'export',
  title = 'Data Export',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setIsExporting(true);

      if (format === 'csv') {
        exportAsCSV(data, `${filename}.csv`);
      } else if (format === 'excel') {
        exportAsExcel(data, `${filename}.xlsx`);
      } else if (format === 'pdf') {
        exportAsPDF(data, `${filename}.pdf`, title);
      }

      setExportedFormat(format);
      setTimeout(() => {
        setExportedFormat(null);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || data.length === 0}
        className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        type="button"
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        <span>Export</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {[
                  { format: 'csv' as const, label: 'Export as CSV', icon: '📄' },
                  { format: 'excel' as const, label: 'Export as Excel', icon: '📊' },
                  { format: 'pdf' as const, label: 'Export as PDF', icon: '📋' },
                ].map(({ format, label, icon }) => (
                  <button
                    key={format}
                    onClick={() => handleExport(format)}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <span>{icon}</span>
                    <span className="flex-1">{label}</span>
                    {exportedFormat === format && (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

