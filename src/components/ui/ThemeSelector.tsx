'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

type ThemePalette = 'ocean-blue' | 'royal-purple' | 'midnight-blue' | 'electric-purple' | 'sky-gradient' | 'cosmic-purple';

const themePalettes: Array<{
  id: ThemePalette;
  name: string;
  gradient: string;
  preview: string;
}> = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0891b2 100%)',
    preview: '🌊'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
    preview: '👑'
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    preview: '🌙'
  },
  {
    id: 'electric-purple',
    name: 'Electric Purple',
    gradient: 'linear-gradient(135deg, #9333ea 0%, #c084fc 50%, #e879f9 100%)',
    preview: '⚡'
  },
  {
    id: 'sky-gradient',
    name: 'Sky Gradient',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #7dd3fc 100%)',
    preview: '☁️'
  },
  {
    id: 'cosmic-purple',
    name: 'Cosmic Purple',
    gradient: 'linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%)',
    preview: '🌌'
  }
];

export const ThemeSelector: React.FC = () => {
  const { themePalette, setThemePalette } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Theme Palette</h3>
        <span className="text-sm text-gray-600">Choose your style</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {themePalettes.map((palette) => (
          <motion.button
            key={palette.id}
            onClick={() => setThemePalette(palette.id)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
              themePalette === palette.id
                ? 'border-gray-900 shadow-lg shadow-gray-900/20'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: `linear-gradient(135deg, ${palette.gradient.split(',')[1].trim()} 0%, ${palette.gradient.split(',')[2].trim()} 100%)`
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">{palette.preview}</span>
              <span className={`text-sm font-medium ${
                themePalette === palette.id ? 'text-white' : 'text-gray-700'
              }`}>
                {palette.name}
              </span>
            </div>

            {themePalette === palette.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"
              >
                <svg className="w-2.5 h-2.5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="text-xs text-gray-600 text-center">
        Changes apply instantly across the entire application
      </div>
    </div>
  );
};