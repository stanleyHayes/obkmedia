import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { palette } from '../../theme';

interface SectionProps {
  icon: ReactNode;
  title: string;
  /** One-line explanation rendered under the title. */
  subtitle?: string;
  children: ReactNode;
}

/** Bordered card used across the account pages (Profile / Preferences / Security). */
export function Section({ icon, title, subtitle, children }: SectionProps) {
  return (
    <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 } }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ color: palette.rose, display: 'flex', mt: 0.25 }}>{icon}</Box>
        <Box>
          <Typography variant="h5">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: palette.ivoryMuted, mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {children}
    </Box>
  );
}

/** Label/value pair for read-only account metadata. */
export function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: '0.62rem',
          fontWeight: 500,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: palette.ivoryMuted,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: palette.ivory }}>
        {value}
      </Typography>
    </Box>
  );
}

/** Page heading shared by the account pages. */
export function PageHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 4 }}>
      <Box>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="body2" sx={{ color: palette.ivoryMuted, mt: 1, maxWidth: 560 }}>
          {subtitle}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}
