'use client';

import React, { useEffect } from 'react';
import { ThemeService } from '@/services/themeService';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => {
    // Load and apply saved theme on mount
    const savedTheme = ThemeService.loadTheme();
    ThemeService.applyTheme(savedTheme);

    // Add CSS variables to root
    const root = document.documentElement;
    const theme = ThemeService.getTheme(savedTheme);

    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-info', theme.colors.info);
    root.style.setProperty('--gradient-from', theme.colors.gradient.from);
    root.style.setProperty('--gradient-to', theme.colors.gradient.to);
  }, []);

  return <>{children}</>;
};

