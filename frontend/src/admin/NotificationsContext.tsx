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
  // Watermark of the newest createdAt we've seen. Using a monotonic timestamp
  // (not just the newest id) prevents a false toast when marking a message read
  // re-exposes an OLDER unread item as items[0]; only genuinely newer arrivals
  // (createdAt beyond the watermark) trigger the toast.
  const seenNewestAt = useRef<number>(0);
  const primed = useRef(false);

  const refresh = useCallback(() => {
    if (!enabled) return;
    adminApi
      .notifications()
      .then((res) => {
        setCount(res.count);
        setItems(res.items);
        const maxAt = res.items.reduce((m, i) => Math.max(m, Date.parse(i.createdAt) || 0), 0);
        if (!primed.current) {
          // First load: record the watermark without toasting historical messages.
          seenNewestAt.current = maxAt;
          primed.current = true;
          return;
        }
        if (maxAt > seenNewestAt.current) {
          const newest = res.items.find((i) => (Date.parse(i.createdAt) || 0) === maxAt) ?? res.items[0];
          setLatest(newest);
          seenNewestAt.current = maxAt;
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
