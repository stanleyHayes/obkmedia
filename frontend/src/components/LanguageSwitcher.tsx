import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';

/** Compact EN | FR toggle. `color` controls the text colour for placement over the hero. */
export default function LanguageSwitcher({ color = 'inherit', sx }: { color?: string; sx?: SxProps<Theme> }) {
  const { i18n } = useTranslation();
  const active = i18n.resolvedLanguage ?? 'en';

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, ...sx }}>
      {LANGUAGES.map((lng, i) => (
        <Box key={lng.code} sx={{ display: 'inline-flex', alignItems: 'center' }}>
          {i > 0 && <Box component="span" sx={{ color, opacity: 0.4, mx: 0.5, fontSize: '0.7rem' }}>/</Box>}
          <Box
            component="button"
            onClick={() => i18n.changeLanguage(lng.code)}
            aria-label={`Switch to ${lng.name}`}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              p: 0,
              color: active.startsWith(lng.code) ? 'var(--obk-rose)' : color,
              fontFamily: '"Outfit", sans-serif',
              fontSize: '0.72rem',
              fontWeight: active.startsWith(lng.code) ? 600 : 400,
              letterSpacing: '0.12em',
              opacity: active.startsWith(lng.code) ? 1 : 0.75,
              transition: 'color 200ms ease, opacity 200ms ease',
              '&:hover': { opacity: 1, color: 'var(--obk-rose)' },
            }}
          >
            {lng.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
