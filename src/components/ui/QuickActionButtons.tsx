'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  DocumentPlusIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface QuickActionButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tooltip: string;
  color?: string;
}

interface QuickActionButtonsProps {
  buttons?: QuickActionButton[];
  className?: string;
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  buttons,
  className = ''
}) => {
  // Default quick action buttons with enhanced UI/UX
  const defaultButtons: QuickActionButton[] = [
    {
      id: 'add-record',
      icon: <PlusIcon className="h-5 w-5" />,
      label: 'Add',
      tooltip: 'Add new record',
      onClick: () => console.log('Add record clicked'),
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'generate-report',
      icon: <DocumentPlusIcon className="h-5 w-5" />,
      label: 'Report',
      tooltip: 'Generate report',
      onClick: () => console.log('Generate report clicked'),
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'analytics',
      icon: <ChartBarIcon className="h-5 w-5" />,
      label: 'Analytics',
      tooltip: 'View analytics',
      onClick: () => console.log('Analytics clicked'),
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'settings',
      icon: <CogIcon className="h-5 w-5" />,
      label: 'Settings',
      tooltip: 'Open settings',
      onClick: () => console.log('Settings clicked'),
      color: 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
    },
    {
      id: 'notifications',
      icon: <BellIcon className="h-5 w-5" />,
      label: 'Notify',
      tooltip: 'View notifications',
      onClick: () => console.log('Notifications clicked'),
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
    }
  ];

  const actionButtons = buttons || defaultButtons;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex space-x-4 ${className}`}
    >
      {actionButtons.map((button) => (
        <motion.div
          key={button.id}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <button
            onClick={button.onClick}
            className={`quick-action-btn ${button.color || 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} p-3 rounded-lg shadow-md transition-all duration-300`}
            aria-label={button.tooltip}
            title={button.tooltip}
          >
            {button.icon}
            <span className="sr-only">{button.label}</span>
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
};