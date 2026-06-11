import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { onDark as onDarkColors, palette } from '../theme';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  align?: 'left' | 'center';
  /** Set when the section keeps a dark background in both themes (e.g. the wine awards band). */
  onDark?: boolean;
}

export default function SectionHeading({ eyebrow, title, align = 'left', onDark = false }: SectionHeadingProps) {
  return (
    <Box sx={{ mb: { xs: 5, md: 7 }, textAlign: align }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ width: 40, height: '1px', bgcolor: onDark ? onDarkColors.rose : palette.wineBright }} />
        <Typography variant="overline" sx={{ color: onDark ? onDarkColors.rose : palette.rose }}>
          {eyebrow}
        </Typography>
        {align === 'center' && (
          <Box sx={{ width: 40, height: '1px', bgcolor: onDark ? onDarkColors.rose : palette.wineBright }} />
        )}
      </Box>
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '2.2rem', md: '3.2rem' },
          maxWidth: 720,
          mx: align === 'center' ? 'auto' : 0,
          color: onDark ? onDarkColors.ivory : undefined,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}
