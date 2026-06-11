import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { LANDING_PAGES } from '../../admin/landingPages';
import { adminApi } from '../../api/admin';
import type { AdminPreferences } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { PageHeading, Section } from '../../components/admin/SettingsSection';
import { palette } from '../../theme';
import { useThemeMode } from '../../ThemeModeContext';

export default function PreferencesPage() {
  const { admin, setAdmin, can } = useAuth();
  const { mode, setMode } = useThemeMode();
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Local mirror of the saved preferences so controls respond instantly;
  // rolled back if the save fails.
  const [prefs, setPrefs] = useState<AdminPreferences>(
    admin?.preferences ?? { notifyOnContact: false, defaultLandingPage: '/admin' },
  );

  if (!admin) return null;

  const landingOptions = LANDING_PAGES.filter((page) => !page.permission || can(page.permission));
  // A saved page can fall out of the permitted set if the role changed since —
  // clamp so the select never holds an out-of-range value.
  const landingValue = landingOptions.some((page) => page.value === prefs.defaultLandingPage)
    ? prefs.defaultLandingPage
    : '/admin';

  const savePreference = async (payload: Partial<AdminPreferences>) => {
    const previous = prefs;
    setPrefs({ ...prefs, ...payload });
    setSaving(true);
    try {
      const res = await adminApi.updatePreferences(payload);
      setAdmin(res.admin);
      setPrefs(res.admin.preferences);
      setToast('Preferences saved');
    } catch {
      setPrefs(previous);
      setToast('Couldn’t save preferences — try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeading
        title="Preferences"
        subtitle="Tune how the admin looks and behaves for you. Notification and workspace preferences are saved to your account; appearance is per device."
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, alignItems: 'start' }}>
        <Stack spacing={4}>
          <Section
            icon={<PaletteOutlinedIcon />}
            title="Appearance"
            subtitle="Switch between the dark studio look and the light editorial look."
          >
            <ToggleButtonGroup
              exclusive
              value={mode}
              onChange={(_, next) => {
                if (next === 'dark' || next === 'light') setMode(next);
              }}
              aria-label="Theme mode"
            >
              <ToggleButton value="dark" sx={{ px: 3, gap: 1 }}>
                <DarkModeOutlinedIcon sx={{ fontSize: 18 }} /> Dark
              </ToggleButton>
              <ToggleButton value="light" sx={{ px: 3, gap: 1 }}>
                <LightModeOutlinedIcon sx={{ fontSize: 18 }} /> Light
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mt: 2 }}>
              Applies immediately and is remembered on this device. The public site follows the same setting.
            </Typography>
          </Section>

          <Section
            icon={<SpaceDashboardOutlinedIcon />}
            title="Workspace"
            subtitle="Where the admin takes you when you sign in."
          >
            <TextField
              select
              label="After sign-in, take me to"
              value={landingValue}
              disabled={saving}
              onChange={(e) => savePreference({ defaultLandingPage: e.target.value })}
              sx={{ maxWidth: 320 }}
              helperText="Only pages your role can access are listed."
            >
              {landingOptions.map((page) => (
                <MenuItem key={page.value} value={page.value}>
                  {page.label}
                </MenuItem>
              ))}
            </TextField>
          </Section>
        </Stack>

        <Section
          icon={<NotificationsActiveOutlinedIcon />}
          title="Notifications"
          subtitle="How you hear about new booking inquiries."
        >
          <Stack spacing={2.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.notifyOnContact}
                  disabled={saving}
                  onChange={(e) => savePreference({ notifyOnContact: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ color: palette.ivory }}>
                    Email me about new inquiries
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                    Get a copy of every contact form submission at {admin.email}
                  </Typography>
                </Box>
              }
            />
            {can('messages.view') && (
              <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                Independent of email, new inquiries always appear in the bell menu and the Messages
                page while you’re signed in.
              </Typography>
            )}
          </Stack>
        </Section>
      </Box>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
