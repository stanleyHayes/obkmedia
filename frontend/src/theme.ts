import { createTheme, responsiveFontSizes, type Theme } from '@mui/material/styles';

export type ThemeMode = 'dark' | 'light';

/**
 * OBK MEDIA brand tokens. Two concrete sets (used by MUI's createTheme, which
 * needs real colors for contrast/alpha math) plus a CSS-variable mirror exported
 * as `palette` for component `sx` — so flipping `data-theme` on <html> re-themes
 * everything without prop drilling.
 */
export const TOKENS: Record<ThemeMode, Record<string, string>> = {
  dark: {
    ink: '#0b0709',
    inkRaised: '#150d12',
    inkBorder: 'rgba(223, 169, 201, 0.14)',
    wine: '#5f053a',
    wineBright: '#8e1b63',
    rose: '#dfa9c9',
    ivory: '#f4ede7',
    ivoryMuted: '#b9aab3',
    decor: 'rgba(244, 237, 231, 0.05)',
    scrim: 'rgba(11, 7, 9, 0.9)',
    inputBg: 'rgba(244, 237, 231, 0.02)',
    outlineBorder: 'rgba(244, 237, 231, 0.4)',
  },
  light: {
    ink: '#f6f1ec',
    inkRaised: '#fffaf6',
    inkBorder: 'rgba(95, 5, 58, 0.16)',
    wine: '#5f053a',
    wineBright: '#8e1b63',
    rose: '#8e1b63',
    ivory: '#221319',
    ivoryMuted: '#7a6670',
    decor: 'rgba(95, 5, 58, 0.05)',
    scrim: 'rgba(246, 241, 236, 0.88)',
    inputBg: 'rgba(95, 5, 58, 0.02)',
    outlineBorder: 'rgba(34, 19, 25, 0.3)',
  },
};

/**
 * Fixed colors for content rendered over permanently dark surfaces (hero
 * photos, wine bands, image scrims, the lightbox backdrop). These match the
 * dark-mode tokens and must NOT flip with the theme — `palette.*` would go
 * dark-on-dark in light mode.
 */
export const onDark = {
  ivory: '#f4ede7',
  ivoryMuted: '#b9aab3',
  rose: '#dfa9c9',
} as const;

/** CSS-variable references — stable across theme switches. */
export const palette = {
  ink: 'var(--obk-ink)',
  inkRaised: 'var(--obk-ink-raised)',
  inkBorder: 'var(--obk-ink-border)',
  wine: 'var(--obk-wine)',
  wineBright: 'var(--obk-wine-bright)',
  rose: 'var(--obk-rose)',
  ivory: 'var(--obk-ivory)',
  ivoryMuted: 'var(--obk-ivory-muted)',
  decor: 'var(--obk-decor)',
  scrim: 'var(--obk-scrim)',
} as const;

/** Emit the token set for a mode as CSS custom properties. */
export function cssVarsFor(mode: ThemeMode): Record<string, string> {
  const t = TOKENS[mode];
  return {
    '--obk-ink': t.ink,
    '--obk-ink-raised': t.inkRaised,
    '--obk-ink-border': t.inkBorder,
    '--obk-wine': t.wine,
    '--obk-wine-bright': t.wineBright,
    '--obk-rose': t.rose,
    '--obk-ivory': t.ivory,
    '--obk-ivory-muted': t.ivoryMuted,
    '--obk-decor': t.decor,
    '--obk-scrim': t.scrim,
  };
}

const displayFont = '"Cormorant Garamond", Georgia, serif';
const bodyFont = '"Outfit", "Helvetica Neue", Arial, sans-serif';

export function makeTheme(mode: ThemeMode): Theme {
  const t = TOKENS[mode];
  const theme = createTheme({
    palette: {
      mode,
      primary: { main: t.wineBright, dark: t.wine, contrastText: '#f4ede7' },
      secondary: { main: t.rose, contrastText: t.ink },
      background: { default: t.ink, paper: t.inkRaised },
      text: { primary: t.ivory, secondary: t.ivoryMuted },
      divider: t.inkBorder,
    },
    shape: { borderRadius: 0 },
    typography: {
      fontFamily: bodyFont,
      h1: { fontFamily: displayFont, fontWeight: 500, letterSpacing: '0.01em', lineHeight: 1.05 },
      h2: { fontFamily: displayFont, fontWeight: 500, letterSpacing: '0.01em', lineHeight: 1.1 },
      h3: { fontFamily: displayFont, fontWeight: 500, lineHeight: 1.15 },
      h4: { fontFamily: displayFont, fontWeight: 500 },
      h5: { fontFamily: displayFont, fontWeight: 600 },
      h6: { fontFamily: displayFont, fontWeight: 600 },
      overline: { fontFamily: bodyFont, fontWeight: 500, letterSpacing: '0.32em', fontSize: '0.72rem' },
      button: { fontFamily: bodyFont, fontWeight: 500, letterSpacing: '0.18em' },
      body1: { fontWeight: 300, lineHeight: 1.75 },
      body2: { fontWeight: 300, lineHeight: 1.7 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'uppercase',
            fontSize: '0.78rem',
            padding: '12px 32px',
            transition: 'all 240ms ease',
            '&.MuiButton-containedPrimary': {
              backgroundColor: 'var(--obk-wine)',
              color: '#f4ede7',
              '&:hover': { backgroundColor: 'var(--obk-wine-bright)' },
            },
          },
          outlined: {
            borderColor: t.outlineBorder,
            color: 'var(--obk-ivory)',
            '&:hover': { borderColor: 'var(--obk-wine-bright)', backgroundColor: 'rgba(142, 27, 99, 0.08)' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: t.inputBg,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--obk-ink-border)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--obk-wine-bright)' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 0, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.66rem' },
        },
      },
      MuiLink: {
        defaultProps: { underline: 'hover' },
      },
    },
  });
  return responsiveFontSizes(theme, { factor: 2.2 });
}

/** Default (dark) theme for any non-provider consumer. */
const theme = makeTheme('dark');
export default theme;
