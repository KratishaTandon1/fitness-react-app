import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme } from '../types';
import { getTheme, saveTheme } from '../lib/storage';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = getTheme() as Theme;
    console.log('Initial theme from storage:', savedTheme);
    return savedTheme;
  });

  // Apply theme immediately on mount and whenever theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('light', 'dark');
    
    console.log('Applying theme:', theme);

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      console.log('Applied system theme:', systemTheme);
    } else {
      root.classList.add(theme);
      console.log('Applied theme class:', theme);
    }
    
    // Log current classes for debugging
    console.log('Root element classes:', root.className);
    
    // Force a style recalculation
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    console.log('Theme changing from', theme, 'to', newTheme);
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};