import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { toUiKit, toUiPuja } from '../utils/catalog';
import type { Puja, PujaKit } from '../data/mockData';
import type { HomeContent, PublicSettings } from '../types/api';

const DEFAULT_HOME: HomeContent = {
  banners: [],
  announcement: null,
  panchang: null,
  sections: { popularPujas: true, kits: true, kundli: true, pandit: true, japa: true },
};

interface AppDataContextType {
  settings: PublicSettings | null;
  home: HomeContent;
  pujas: Puja[];
  kits: PujaKit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [home, setHome] = useState<HomeContent>(DEFAULT_HOME);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [kits, setKits] = useState<PujaKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [s, p, k, h] = await Promise.allSettled([api.settings(), api.pujas(), api.products(), api.home()]);
    if (s.status === 'fulfilled') setSettings(s.value);
    if (p.status === 'fulfilled') setPujas(p.value.map(toUiPuja));
    if (k.status === 'fulfilled') setKits(k.value.map(toUiKit));
    if (h.status === 'fulfilled') setHome({ ...DEFAULT_HOME, ...h.value, sections: { ...DEFAULT_HOME.sections, ...h.value.sections } });
    const failed = [s, p, k].find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
    if (failed) setError(failed.reason?.message || 'Could not load data');
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ settings, home, pujas, kits, loading, error, refresh }),
    [settings, home, pujas, kits, loading, error, refresh]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
};
