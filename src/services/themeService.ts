export type ThemeName = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradient: {
    from: string;
    to: string;
  };
}

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  colors: ThemeColors;
  isDark: boolean;
}

export const THEMES: Record<ThemeName, Theme> = {
  default: {
    name: 'default',
    label: 'Default Green',
    description: 'Fresh green theme perfect for agriculture',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      gradient: {
        from: '#10b981',
        to: '#34d399',
      },
    },
    isDark: false,
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean Blue',
    description: 'Cool blue theme inspired by water',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      gradient: {
        from: '#0ea5e9',
        to: '#06b6d4',
      },
    },
    isDark: false,
  },
  forest: {
    name: 'forest',
    label: 'Forest Green',
    description: 'Deep green theme for nature lovers',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      gradient: {
        from: '#059669',
        to: '#10b981',
      },
    },
    isDark: false,
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset Orange',
    description: 'Warm orange and red theme',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      gradient: {
        from: '#f97316',
        to: '#fb923c',
      },
    },
    isDark: false,
  },
  midnight: {
    name: 'midnight',
    label: 'Midnight Purple',
    description: 'Dark purple theme for night mode',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#d8b4fe',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#60a5fa',
      gradient: {
        from: '#a855f7',
        to: '#d8b4fe',
      },
    },
    isDark: true,
  },
};

export class ThemeService {
  private static readonly STORAGE_KEY = 'agriintel-theme';

  static getTheme(name: ThemeName): Theme {
    return THEMES[name] || THEMES.default;
  }

  static getAllThemes(): Theme[] {
    return Object.values(THEMES);
  }

  static saveTheme(name: ThemeName): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, name);
      this.applyTheme(name);
    }
  }

  static loadTheme(): ThemeName {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeName;
      if (saved && THEMES[saved]) {
        return saved;
      }
    }
    return 'default';
  }

  static applyTheme(name: ThemeName): void {
    const theme = this.getTheme(name);
    const root = document.documentElement;

    // Apply CSS variables
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-info', theme.colors.info);
    root.style.setProperty('--gradient-from', theme.colors.gradient.from);
    root.style.setProperty('--gradient-to', theme.colors.gradient.to);

    // Apply dark mode if needed
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  static getThemeGradient(name: ThemeName): string {
    const theme = this.getTheme(name);
    return `linear-gradient(135deg, ${theme.colors.gradient.from} 0%, ${theme.colors.gradient.to} 100%)`;
  }
}

