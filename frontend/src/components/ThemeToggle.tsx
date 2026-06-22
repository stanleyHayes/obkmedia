import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { SxProps, Theme } from '@mui/material/styles';
import { useThemeMode } from '../ThemeModeContext';

const ICON_TRANSITION = 'opacity 420ms ease, transform 560ms cubic-bezier(0.34, 1.56, 0.64, 1)';

export default function ThemeToggle({ sx }: { sx?: SxProps<Theme> }) {
  const { mode, toggleWithReveal } = useThemeMode();
  const next = mode === 'dark' ? 'light' : 'dark';
  const isDark = mode === 'dark';

  return (
    <Tooltip title={`Switch to ${next} mode`}>
      <IconButton
        onClick={(e) => toggleWithReveal(e.clientX, e.clientY)}
        aria-label={`Switch to ${next} mode`}
        sx={{ color: 'var(--obk-ivory)', overflow: 'hidden', ...sx }}
      >
        {/* Both icons stay mounted and crossfade/rotate so the swap animates
            even when the View Transitions reveal is unavailable. */}
        <Box sx={{ position: 'relative', width: 20, height: 20 }}>
          <LightModeOutlinedIcon
            fontSize="small"
            sx={{
              position: 'absolute',
              inset: 0,
              transition: ICON_TRANSITION,
              opacity: isDark ? 1 : 0,
              transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.3)',
            }}
          />
          <DarkModeOutlinedIcon
            fontSize="small"
            sx={{
              position: 'absolute',
              inset: 0,
              transition: ICON_TRANSITION,
              opacity: isDark ? 0 : 1,
              transform: isDark ? 'rotate(90deg) scale(0.3)' : 'rotate(0deg) scale(1)',
            }}
          />
        </Box>
      </IconButton>
    </Tooltip>
  );
}
