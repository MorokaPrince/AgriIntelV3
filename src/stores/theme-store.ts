import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  gradients: {
    background: string;
    surface: string;
    primary: string;
  };
}

const themes: Theme[] = [
  {
    id: 'emerald',
    name: 'Emerald',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#d1fae5',
    },
    gradients: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
      surface: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
      primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      background: '#eff6ff',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#dbeafe',
    },
    gradients: {
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
      surface: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
      primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
    },
    gradients: {
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)',
      surface: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
      primary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#fed7aa',
    },
    gradients: {
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fdba74 100%)',
      surface: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
      primary: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
    },
    gradients: {
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
      surface: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  },
];

interface ThemeState {
  theme: Theme;
  availableThemes: Theme[];

  // Actions
  setTheme: (themeId: string) => void;
  setThemeById: (themeId: string) => void;
  getThemeById: (themeId: string) => Theme | undefined;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: themes[0], // Default to emerald theme
        availableThemes: themes,

        setTheme: (themeId: string) => {
          const theme = get().getThemeById(themeId);
          if (theme) {
            set({ theme });
          }
        },

        setThemeById: (themeId: string) => {
          const theme = get().getThemeById(themeId);
          if (theme) {
            set({ theme });
          }
        },

        getThemeById: (themeId: string) => {
          return get().availableThemes.find(t => t.id === themeId);
        },
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'theme-store',
    }
  )
);