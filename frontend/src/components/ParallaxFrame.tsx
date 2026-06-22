import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

interface ParallaxFrameProps extends BoxProps {
  children: ReactNode;
  maxOffset?: number;
  scale?: number;
  speed?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Lightweight scroll-depth layer that writes a CSS variable outside React renders. */
export default function ParallaxFrame({ children, maxOffset = 80, scale = 1, speed = 0.1, sx, ...props }: ParallaxFrameProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!node || reduceMotion.matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const layerCenter = rect.top + rect.height / 2;
      const offset = clamp((viewportCenter - layerCenter) * speed, -maxOffset, maxOffset);
      node.style.setProperty('--obk-parallax-y', `${offset.toFixed(2)}px`);
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [maxOffset, speed]);

  return (
    <Box
      ref={ref}
      sx={{
        '--obk-parallax-y': '0px',
        transform: `translate3d(0, var(--obk-parallax-y), 0) scale(${scale})`,
        transformOrigin: 'center',
        willChange: 'transform',
        ...sx,
      }}
      style={{ '--obk-parallax-y': '0px' } as CSSProperties}
      {...props}
    >
      {children}
    </Box>
  );
}
