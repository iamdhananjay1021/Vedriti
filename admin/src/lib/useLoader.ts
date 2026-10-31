'use client';

import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from './api';

export function useLoader<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    fetcher().then(
      (result) => {
        if (!active) return;
        setData(result);
        setError(null);
      },
      (e) => {
        if (active) setError(errorMessage(e));
      }
    );
    return () => {
      active = false;
    };
  }, [fetcher, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data, error, reload, setData };
}
