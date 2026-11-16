import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { api } from '../services/api';
import { NotificationsModal } from '../components/modals/NotificationsModal';
import type { InboxNotification } from '../types/api';

interface InboxValue {
  unreadCount: number;
  open: () => void;
}

const InboxContext = createContext<InboxValue>({ unreadCount: 0, open: () => undefined });

export const useInbox = () => useContext(InboxContext);

const POLL_MS = 120000;

export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.notifications();
      if (!alive.current) return;
      setItems(data.items);
      setUnreadCount(data.unreadCount);
      setFailed(false);
    } catch {
      if (alive.current) setFailed(true);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      alive.current = false;
      clearInterval(timer);
      sub.remove();
    };
  }, [refresh]);

  const open = useCallback(() => {
    setVisible(true);
    setLoading(true);
    refresh().finally(() => alive.current && setLoading(false));
  }, [refresh]);

  const close = useCallback(() => {
    setVisible(false);
    if (unreadCount > 0) {
      setUnreadCount(0);
      setItems((list) => list.map((n) => ({ ...n, read: true })));
      api.markNotificationsRead().catch(() => undefined);
    }
  }, [unreadCount]);

  const value = useMemo(() => ({ unreadCount, open }), [unreadCount, open]);

  return (
    <InboxContext.Provider value={value}>
      {children}
      <NotificationsModal visible={visible} items={items} loading={loading} failed={failed} onClose={close} onRetry={open} />
    </InboxContext.Provider>
  );
};
