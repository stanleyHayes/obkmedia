import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { adminApi } from '../api/admin';
import type { NotificationItem } from '../api/types';
import { useAuth } from '../auth/AuthContext';

interface NotificationsState {
  count: number;
  items: NotificationItem[];
  /** Set when a poll detects newly-arrived messages — drives the toast. */
  latest: NotificationItem | null;
  clearLatest: () => void;
  refresh: () => void;
}

const NotificationsContext = createContext<NotificationsState | null>(null);

const POLL_MS = 20000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { can } = useAuth();
  const enabled = can('messages.view');

  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [latest, setLatest] = useState<NotificationItem | null>(null);
  // Track the newest id we've already seen so we only toast genuinely new ones.
  const seenNewestId = useRef<string | null>(null);
  const primed = useRef(false);

  const refresh = useCallback(() => {
    if (!enabled) return;
    adminApi
      .notifications()
      .then((res) => {
        setCount(res.count);
        setItems(res.items);
        const newest = res.items[0];
        if (!primed.current) {
          // First load: remember state without toasting historical messages.
          seenNewestId.current = newest?.id ?? null;
          primed.current = true;
          return;
        }
        if (newest && newest.id !== seenNewestId.current) {
          setLatest(newest);
          seenNewestId.current = newest.id;
        }
      })
      .catch(() => {});
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const interval = window.setInterval(refresh, POLL_MS);
    // Allow other parts of the app (e.g. the messages inbox) to force a refresh.
    const onUpdate = () => refresh();
    window.addEventListener('obk:messages-updated', onUpdate);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('obk:messages-updated', onUpdate);
    };
  }, [enabled, refresh]);

  const clearLatest = useCallback(() => setLatest(null), []);

  return (
    <NotificationsContext.Provider value={{ count, items, latest, clearLatest, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsState {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}

/** Fire-and-forget signal that the message list changed, so the bell re-polls. */
export function notifyMessagesUpdated(): void {
  window.dispatchEvent(new Event('obk:messages-updated'));
}
