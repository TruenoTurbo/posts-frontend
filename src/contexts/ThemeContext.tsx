import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 
  | 'light' | 'green' | 'brown' | 'red-light' 
  | 'blue' | 'grey' | 'dark' | 'violet';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEMES: Theme[] = ['light', 'green', 'brown', 'red-light', 'blue', 'grey', 'dark', 'violet'];

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    try {
      const saved = window.localStorage.getItem('theme');
      return saved && THEMES.includes(saved as Theme) ? (saved as Theme) : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);

    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // Ignore storage access failures so the app still renders.
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
