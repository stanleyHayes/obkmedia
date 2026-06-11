import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { palette } from '../theme';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ eyebrow, title, align = 'left' }: SectionHeadingProps) {
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
        <Box sx={{ width: 40, height: '1px', bgcolor: palette.wineBright }} />
        <Typography variant="overline" sx={{ color: palette.rose }}>
          {eyebrow}
        </Typography>
        {align === 'center' && <Box sx={{ width: 40, height: '1px', bgcolor: palette.wineBright }} />}
      </Box>
      <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.2rem' }, maxWidth: 720, mx: align === 'center' ? 'auto' : 0 }}>
        {title}
      </Typography>
    </Box>
  );
}
