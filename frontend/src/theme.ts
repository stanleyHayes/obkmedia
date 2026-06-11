import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/**
 * OBK MEDIA — dark cinematic luxury.
 * Wine (#5f053a brand) lifted to #8e1b63 for interactive elements on black;
 * rose (#dfa9c9) carries small accent text where wine would fail contrast.
 */
export const palette = {
  ink: '#0b0709',
  inkRaised: '#150d12',
  inkBorder: 'rgba(223, 169, 201, 0.14)',
  wine: '#5f053a',
  wineBright: '#8e1b63',
  rose: '#dfa9c9',
  ivory: '#f4ede7',
  ivoryMuted: '#b9aab3',
} as const;

const displayFont = '"Cormorant Garamond", Georgia, serif';
const bodyFont = '"Outfit", "Helvetica Neue", Arial, sans-serif';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: palette.wineBright, dark: palette.wine, contrastText: palette.ivory },
    secondary: { main: palette.rose, contrastText: palette.ink },
    background: { default: palette.ink, paper: palette.inkRaised },
    text: { primary: palette.ivory, secondary: palette.ivoryMuted },
    divider: palette.inkBorder,
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
            backgroundColor: palette.wine,
            '&:hover': { backgroundColor: palette.wineBright },
          },
        },
        outlined: {
          borderColor: 'rgba(244, 237, 231, 0.4)',
          color: palette.ivory,
          '&:hover': { borderColor: palette.rose, backgroundColor: 'rgba(223, 169, 201, 0.06)' },
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
          backgroundColor: 'rgba(244, 237, 231, 0.02)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(223, 169, 201, 0.2)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(223, 169, 201, 0.45)' },
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

theme = responsiveFontSizes(theme, { factor: 2.2 });

export default theme;
