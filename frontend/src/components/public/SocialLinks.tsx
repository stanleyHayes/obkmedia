import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import type { ComponentType } from 'react';
import { SOCIALS } from '../../content';

function TikTokIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.02-2.82h-3.3v12.93a2.59 2.59 0 0 1-2.59 2.4 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 3.3-2.49v-3.36A5.92 5.92 0 0 0 4 15.74a5.92 5.92 0 0 0 5.92 5.92 5.92 5.92 0 0 0 5.92-5.92V9.4a7.55 7.55 0 0 0 4.36 1.39V7.46a4.28 4.28 0 0 1-3.6-1.64Z" />
    </SvgIcon>
  );
}

const ICONS: Record<string, ComponentType<SvgIconProps>> = {
  TikTok: TikTokIcon,
  YouTube: YouTubeIcon,
  Facebook: FacebookIcon,
};

interface SocialLinksProps {
  color?: string;
  size?: number;
  gap?: number;
}

/** Renders the configured socials as icon links. */
export default function SocialLinks({ color = 'inherit', size = 19, gap = 1.5 }: SocialLinksProps) {
  return (
    <Stack direction="row" spacing={gap} sx={{ alignItems: 'center' }}>
      {SOCIALS.map((social) => {
        const Icon = ICONS[social.name] ?? YouTubeIcon;
        return (
          <Tooltip key={social.name} title={social.name}>
            <Link
              href={social.url}
              target="_blank"
              rel="noopener"
              aria-label={social.name}
              sx={{ color, display: 'inline-flex', transition: 'color 200ms ease', '&:hover': { color: 'var(--obk-rose)' } }}
            >
              <Icon sx={{ fontSize: size }} />
            </Link>
          </Tooltip>
        );
      })}
    </Stack>
  );
}
