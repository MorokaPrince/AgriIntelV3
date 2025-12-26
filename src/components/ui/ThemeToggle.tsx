'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { themeMode, toggleThemeMode } = useTheme();

  const getModeIcon = () => {
    return themeMode === 'light' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />;
  };

  const getModeLabel = () => {
    return themeMode === 'light' ? 'Light mode' : 'Dark mode';
  };

  return (
    <motion.button
      onClick={toggleThemeMode}
      className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      aria-label={getModeLabel()}
      title={getModeLabel()}
    >
      <motion.div
        key={themeMode}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {getModeIcon()}
      </motion.div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-md -z-10" />
      <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
};