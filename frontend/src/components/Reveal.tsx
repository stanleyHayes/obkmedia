import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  sx?: SxProps<Theme>;
  variant?: 'lift' | 'tilt-left' | 'tilt-right' | 'soft';
}

const hiddenTransforms: Record<NonNullable<RevealProps['variant']>, string> = {
  lift: 'perspective(1100px) translate3d(0, 42px, -40px) rotateX(9deg) scale(0.97)',
  'tilt-left': 'perspective(1100px) translate3d(-24px, 42px, -44px) rotateX(8deg) rotateY(-5deg) scale(0.96)',
  'tilt-right': 'perspective(1100px) translate3d(24px, 42px, -44px) rotateX(8deg) rotateY(5deg) scale(0.96)',
  soft: 'translate3d(0, 24px, 0)',
};

/** Reveals content once it enters the viewport with a restrained 3D lift. */
export default function Reveal({ children, delay = 0, sx, variant = 'lift' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={[
        {
          opacity: visible ? 1 : 0,
          transform: visible ? 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)' : hiddenTransforms[variant],
          transformOrigin: '50% 80%',
          transformStyle: 'preserve-3d',
          willChange: visible ? 'auto' : 'opacity, transform, filter',
          filter: visible ? 'blur(0)' : 'blur(8px)',
          transition: `opacity 900ms ease ${delay}ms, filter 900ms ease ${delay}ms, transform 980ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}
