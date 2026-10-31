'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import type { ThemeMode } from '../lib/types';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'vedrit-admin-theme';
const EVENT = 'vedrit-theme-change';

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });

const readSaved = (): ThemeMode | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' || saved === 'light' ? saved : null;
  } catch {
    return null;
  }
};

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  window.dispatchEvent(new Event(EVENT));
};

const subscribe = (callback: () => void) => {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
};

const getSnapshot = (): ThemeMode => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
const getServerSnapshot = (): ThemeMode => 'light';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const initial = readSaved() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
