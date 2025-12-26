'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { ThemeService, type ThemeName } from '@/services/themeService';

interface ThemeSelectorProps {
  onThemeChange?: (theme: ThemeName) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');
  const [isOpen, setIsOpen] = useState(false);
  const themes = ThemeService.getAllThemes();

  useEffect(() => {
    const saved = ThemeService.loadTheme();
    setCurrentTheme(saved);
    ThemeService.applyTheme(saved);
  }, []);

  const handleThemeChange = (themeName: ThemeName) => {
    setCurrentTheme(themeName);
    ThemeService.saveTheme(themeName);
    onThemeChange?.(themeName);
    setIsOpen(false);
  };

  const currentThemeObj = ThemeService.getTheme(currentTheme);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        title="Change theme"
      >
        <Palette size={18} />
        <span className="text-sm font-medium hidden sm:inline">{currentThemeObj.label}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Theme</h3>
          <div className="space-y-2">
            {themes.map((theme) => (
              <button
                key={theme.name}
                type="button"
                onClick={() => handleThemeChange(theme.name)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  currentTheme === theme.name
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: ThemeService.getThemeGradient(theme.name),
                        }}
                      />
                      <span className="font-medium text-sm text-gray-900">{theme.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{theme.description}</p>
                  </div>
                  {currentTheme === theme.name && (
                    <Check size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

