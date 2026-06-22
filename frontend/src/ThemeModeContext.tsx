import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { cssVarsFor, makeTheme, type ThemeMode } from './theme';

interface ThemeModeState {
  mode: ThemeMode;
  toggle: () => void;
  /** Toggle with a circular reveal animation originating at the given viewport
   *  coordinates (typically the toggle button). Falls back to an instant swap
   *  when the View Transitions API is unavailable or reduced motion is set. */
  toggleWithReveal: (x?: number, y?: number) => void;
  setMode: (mode: ThemeMode) => void;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

const ThemeModeContext = createContext<ThemeModeState | null>(null);

const STORAGE_KEY = 'obk-theme';

function readInitialMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  } catch {
    /* ignore */
  }
  return 'dark';
}

/** Writes the token set as CSS variables on <html> and updates the theme-color meta. */
function applyMode(mode: ThemeMode): void {
  const root = document.documentElement;
  root.dataset.theme = mode;
  const vars = cssVarsFor(mode);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', vars['--obk-ink']);
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readInitialMode);

  useEffect(() => {
    applyMode(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);
  const toggle = useCallback(() => setModeState((m) => (m === 'dark' ? 'light' : 'dark')), []);

  const toggleWithReveal = useCallback(
    (x?: number, y?: number) => {
      const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
      const doc = document as ViewTransitionDocument;
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!doc.startViewTransition || reduceMotion || x === undefined || y === undefined) {
        setModeState(next);
        return;
      }
      const transition = doc.startViewTransition(() => {
        // Commit synchronously and apply the CSS variables now so the View
        // Transition snapshots the new theme (the effect below repeats this).
        flushSync(() => setModeState(next));
        applyMode(next);
      });
      transition.ready
        .then(() => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const endRadius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
            { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
          );
        })
        .catch(() => {
          /* a skipped/failed transition still leaves the new theme applied */
        });
    },
    [mode],
  );

  const muiTheme = useMemo(() => makeTheme(mode), [mode]);
  const value = useMemo(
    () => ({ mode, toggle, toggleWithReveal, setMode }),
    [mode, toggle, toggleWithReveal, setMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        {/* enableColorScheme sets `color-scheme` on :root so native widgets
            (date-picker icon, scrollbars) follow the active theme. */}
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeState {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}

/** Small reusable light/dark toggle button. */
export function useThemeToggle() {
  const { mode, toggle } = useThemeMode();
  return { mode, toggle };
}
