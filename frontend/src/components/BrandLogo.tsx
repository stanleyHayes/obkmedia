import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { useId } from 'react';
import { BRAND } from '../content';
import { palette } from '../theme';

interface BrandLogoProps {
  variant?: 'lockup' | 'mark';
  suffix?: string;
  subtitle?: string;
  animated?: boolean;
  title?: string;
  /** When set, an uploaded logo image is rendered instead of the SVG mark. */
  imageUrl?: string;
  textColor?: string;
  accentColor?: string;
  mutedColor?: string;
  markTextColor?: string;
  coreColor?: string;
  ringColor?: string;
  haloColor?: string;
  sx?: SxProps<Theme>;
}

export default function BrandLogo({
  variant = 'lockup',
  suffix = 'MEDIA',
  subtitle,
  animated = false,
  title,
  imageUrl,
  textColor = palette.ivory,
  accentColor = palette.rose,
  mutedColor = palette.ivoryMuted,
  markTextColor = '#f4ede7',
  coreColor = '#10080d',
  ringColor = 'rgba(244, 237, 231, 0.72)',
  haloColor = 'rgba(244, 237, 231, 0.12)',
  sx,
}: BrandLogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gradientId = `obk-logo-gradient-${uid}`;
  const viewBox = variant === 'mark' ? '0 0 72 72' : '0 0 326 78';
  const label = title ?? (suffix === 'ADMIN' ? 'OBK Admin' : BRAND.name);
  const sxList = Array.isArray(sx) ? sx : sx ? [sx] : [];

  // A custom uploaded logo takes precedence over the built-in SVG lockup.
  if (imageUrl?.trim()) {
    return (
      <Box
        component="img"
        src={imageUrl}
        alt={label}
        sx={[
          {
            display: 'inline-block',
            height: variant === 'mark' ? 46 : 52,
            width: 'auto',
            maxWidth: variant === 'mark' ? 46 : 240,
            objectFit: 'contain',
          } as SxProps<Theme>,
          ...sxList,
        ]}
      />
    );
  }

  const mark = (
    <g className="obk-logo__mark">
      <circle cx="36" cy="36" r="33" fill="var(--obk-logo-halo)" />
      <circle cx="36" cy="36" r="31" fill="var(--obk-logo-core)" opacity="0.96" />
      <circle className="obk-logo__draw" cx="36" cy="36" r="31" stroke="var(--obk-logo-ring)" strokeWidth="1.45" />
      <circle cx="36" cy="36" r="24" stroke="var(--obk-logo-accent)" strokeOpacity="0.86" strokeWidth="1.25" />
      <g className="obk-logo__iris" opacity="0.86">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <path
            key={angle}
            d="M36 12.5 49.5 20.4 42.5 36.5 31 31.8Z"
            fill={`url(#${gradientId})`}
            opacity="0.4"
            transform={`rotate(${angle} 36 36)`}
          />
        ))}
      </g>
      <circle cx="36" cy="36" r="15.5" fill="var(--obk-logo-core)" opacity="0.98" />
      <circle cx="36" cy="36" r="13.2" stroke="var(--obk-logo-accent)" strokeOpacity="0.72" strokeWidth="1" />
      <text
        x="36"
        y="40.7"
        textAnchor="middle"
        fontFamily='"Cormorant Garamond", Georgia, serif'
        fontSize="13.6"
        fontWeight="700"
        fill="var(--obk-logo-mark-text)"
      >
        OBK
      </text>
      <path className="obk-logo__glint" d="M19 24.5C24.5 18.8 30.2 16 38 16" stroke="var(--obk-logo-mark-text)" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M51.5 49.5 59 57" stroke="var(--obk-logo-ring)" strokeWidth="2" strokeLinecap="round" opacity="0.78" />
    </g>
  );

  return (
    <Box
      component="span"
      role="img"
      aria-label={label}
      sx={[
        {
          '--obk-logo-text': textColor,
          '--obk-logo-accent': accentColor,
          '--obk-logo-muted': mutedColor,
          '--obk-logo-mark-text': markTextColor,
          '--obk-logo-core': coreColor,
          '--obk-logo-ring': ringColor,
          '--obk-logo-halo': haloColor,
          display: 'inline-flex',
          width: variant === 'mark' ? 46 : 260,
          lineHeight: 0,
          color: textColor,
        } as SxProps<Theme>,
        ...sxList,
      ]}
    >
      <Box
        component="svg"
        viewBox={viewBox}
        aria-hidden
        className={animated ? 'obk-brand-logo is-animated' : 'obk-brand-logo'}
        sx={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="18" x2="54" y1="14" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--obk-logo-accent)" />
            <stop offset="1" stopColor="var(--obk-logo-mark-text)" stopOpacity="0.82" />
          </linearGradient>
        </defs>
        <style>
          {`
            @media (prefers-reduced-motion: no-preference) {
              .obk-brand-logo.is-animated .obk-logo__iris {
                animation: obkLogoIris${uid} 5.8s ease-in-out infinite;
                transform-origin: 36px 36px;
              }
              .obk-brand-logo.is-animated .obk-logo__draw {
                stroke-dasharray: 210;
                animation: obkLogoDraw${uid} 1.4s cubic-bezier(.16, 1, .3, 1) both;
              }
              .obk-brand-logo.is-animated .obk-logo__glint {
                stroke-dasharray: 28;
                animation: obkLogoGlint${uid} 3.2s ease-in-out infinite;
              }
              @keyframes obkLogoIris${uid} {
                0%, 100% { transform: rotate(0deg) scale(1); opacity: .82; }
                45% { transform: rotate(8deg) scale(1.03); opacity: 1; }
              }
              @keyframes obkLogoDraw${uid} {
                from { stroke-dashoffset: 210; opacity: .2; }
                to { stroke-dashoffset: 0; opacity: 1; }
              }
              @keyframes obkLogoGlint${uid} {
                0%, 58%, 100% { stroke-dashoffset: 28; opacity: .15; }
                72% { stroke-dashoffset: 0; opacity: .95; }
              }
            }
          `}
        </style>

        {mark}

        {variant === 'lockup' && (
          <g>
            <text
              x="92"
              y="38"
              fontFamily='"Cormorant Garamond", Georgia, serif'
              fontSize="36"
              fontWeight="700"
              fill="var(--obk-logo-text)"
            >
              OBK
            </text>
            <text
              x="171"
              y="38"
              fontFamily='"Cormorant Garamond", Georgia, serif'
              fontSize="35"
              fontStyle="italic"
              fontWeight="700"
              fill="var(--obk-logo-accent)"
            >
              {suffix}
            </text>
            <path d="M93 49.5H303" stroke="var(--obk-logo-muted)" strokeOpacity="0.42" strokeWidth="1" />
            {subtitle && (
              <text
                x="94"
                y="64"
                fontFamily='"Outfit", "Helvetica Neue", Arial, sans-serif'
                fontSize="8.2"
                fontWeight="500"
                fill="var(--obk-logo-muted)"
              >
                {subtitle}
              </text>
            )}
          </g>
        )}
      </Box>
    </Box>
  );
}
