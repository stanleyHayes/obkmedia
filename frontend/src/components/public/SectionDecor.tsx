import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import ParallaxFrame from '../ParallaxFrame';

interface SectionDecorProps {
  /** An MUI icon element; give it its own large `fontSize` via sx. */
  children: ReactNode;
  /** Scroll parallax strength. Negative values drift the opposite direction. */
  speed?: number;
  /** Maximum vertical parallax offset in px. */
  maxOffset?: number;
  /** Placement / sizing overrides. */
  sx?: SxProps<Theme>;
}

/**
 * Oversized, very faint background glyph that anchors a section (e.g. the
 * trophy on Recognition, the envelope on Contact). Purely decorative.
 */
export default function SectionDecor({ children, maxOffset = 56, speed = 0.08, sx }: SectionDecorProps) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        color: 'var(--obk-decor)',
        pointerEvents: 'none',
        lineHeight: 0,
        zIndex: 0,
        ...sx,
      }}
    >
      <ParallaxFrame speed={speed} maxOffset={maxOffset}>
        {children}
      </ParallaxFrame>
    </Box>
  );
}
