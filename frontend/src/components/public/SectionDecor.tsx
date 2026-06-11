import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface SectionDecorProps {
  /** An MUI icon element; give it its own large `fontSize` via sx. */
  children: ReactNode;
  /** Placement / sizing overrides. */
  sx?: SxProps<Theme>;
}

/**
 * Oversized, very faint background glyph that anchors a section (e.g. the
 * trophy on Recognition, the envelope on Contact). Purely decorative.
 */
export default function SectionDecor({ children, sx }: SectionDecorProps) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        color: 'rgba(244, 237, 231, 0.04)',
        pointerEvents: 'none',
        lineHeight: 0,
        zIndex: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
