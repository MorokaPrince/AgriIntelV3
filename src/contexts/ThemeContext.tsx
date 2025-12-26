'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemePalette = 'ocean-blue' | 'royal-purple' | 'midnight-blue' | 'electric-purple' | 'sky-gradient' | 'cosmic-purple';

interface ThemeContextType {
  themeMode: ThemeMode;
  themePalette: ThemePalette;
  actualTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  setThemePalette: (palette: ThemePalette) => void;
  toggleThemeMode: () => void;
  resetToDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
   const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
   const [themePalette, setThemePaletteState] = useState<ThemePalette>('ocean-blue');
   const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Load theme settings from localStorage on mount
  useEffect(() => {
    const savedThemeMode = localStorage.getItem('agri-intel-theme-mode') as ThemeMode;
    const savedThemePalette = localStorage.getItem('agri-intel-theme-palette') as ThemePalette;
    if (savedThemeMode) setThemeModeState(savedThemeMode);
    if (savedThemePalette) setThemePaletteState(savedThemePalette);
  }, []);

  // Update actual theme based on theme mode
  useEffect(() => {
    setActualTheme(themeMode);
  }, [themeMode]);

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'theme-ocean-blue', 'theme-royal-purple', 'theme-midnight-blue', 'theme-electric-purple', 'theme-sky-gradient', 'theme-cosmic-purple');

    // Add current theme classes
    root.classList.add(actualTheme, `theme-${themePalette}`);

    root.style.colorScheme = actualTheme;
  }, [actualTheme, themePalette]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('agri-intel-theme-mode', mode);
  };

  const setThemePalette = (palette: ThemePalette) => {
    setThemePaletteState(palette);
    localStorage.setItem('agri-intel-theme-palette', palette);
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const resetToDefaults = () => {
    setThemeMode('light');
    setThemePalette('ocean-blue');
  };

  const value: ThemeContextType = {
    themeMode,
    themePalette,
    actualTheme,
    setThemeMode,
    setThemePalette,
    toggleThemeMode,
    resetToDefaults,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};