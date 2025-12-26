'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThemeService, type ThemeName, type Theme } from '@/services/themeService';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');
  const [theme, setTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load theme from localStorage
    const saved = ThemeService.loadTheme();
    setCurrentTheme(saved);
    setTheme(ThemeService.getTheme(saved));
    ThemeService.applyTheme(saved);
    setIsLoading(false);
  }, []);

  const changeTheme = useCallback((themeName: ThemeName) => {
    setCurrentTheme(themeName);
    setTheme(ThemeService.getTheme(themeName));
    ThemeService.saveTheme(themeName);
  }, []);

  const getThemeColor = useCallback((colorKey: keyof Theme['colors']) => {
    if (!theme) return '';
    return theme.colors[colorKey] as string;
  }, [theme]);

  return {
    currentTheme,
    theme,
    isLoading,
    changeTheme,
    getThemeColor,
    allThemes: ThemeService.getAllThemes(),
  };
};

