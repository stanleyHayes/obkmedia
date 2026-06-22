import DoneAllIcon from '@mui/icons-material/DoneAll';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../api/client';
import { publicApi } from '../../api/public';
import { useBrand } from '../../SiteSettingsContext';
import { palette } from '../../theme';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  shootType: '',
  preferredDate: '',
  location: '',
  budgetRange: '',
  message: '',
  website: '', // honeypot — hidden from real users
};

type FormState = typeof EMPTY_FORM;

export default function ContactForm() {
  const { t } = useTranslation();
  const brand = useBrand();
  const shootTypes = t('shootTypes', { returnObjects: true }) as string[];
  const budgetRanges = t('budgetRanges', { returnObjects: true }) as string[];
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setShootType = (value: string | null) => {
    setForm((prev) => ({ ...prev, shootType: value ?? '' }));
    setErrors((prev) => ({ ...prev, shootType: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.fullName.trim().length < 2) next.fullName = t('contact.errors.fullName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t('contact.errors.email');
    if (form.message.trim().length < 10) next.message = t('contact.errors.message');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await publicApi.submitContact(form);
      void res;
      setSuccess('ok');
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : t('contact.errors.server'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          border: `1px solid ${palette.inkBorder}`,
          overflow: 'hidden',
          maxWidth: 460,
          mx: 'auto',
          animation: 'obk-fade-up 500ms ease',
        }}
      >
        {/* WhatsApp-style chat header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#075E54', px: 2.5, py: 1.75 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#1faf57', display: 'grid', placeItems: 'center', color: '#fff' }}>
            <WhatsAppIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: '#fff', fontWeight: 500, lineHeight: 1.2 }}>OBK MEDIA</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {t('contact.success.replyFast')}
            </Typography>
          </Box>
        </Box>

        {/* Chat body */}
        <Box
          sx={{
            bgcolor: '#0b141a',
            p: 2.5,
            minHeight: 150,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        >
          <Box sx={{ alignSelf: 'flex-end', bgcolor: '#005c4b', color: '#e9edef', px: 1.75, py: 1, borderRadius: '8px 8px 0 8px', maxWidth: '85%' }}>
            <Typography variant="body2">{t('contact.success.outgoing')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.25 }}>
              <Typography variant="caption" sx={{ color: 'rgba(233,237,239,0.6)', fontSize: '0.65rem' }}>{t('contact.success.sent')}</Typography>
              <DoneAllIcon sx={{ fontSize: '0.95rem', color: '#53bdeb' }} />
            </Box>
          </Box>
          <Box sx={{ alignSelf: 'flex-start', bgcolor: '#202c33', color: '#e9edef', px: 1.75, py: 1, borderRadius: '8px 8px 8px 0', maxWidth: '85%' }}>
            <Typography variant="body2">{t('contact.success.reply')}</Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ bgcolor: palette.inkRaised, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            component="a"
            href={brand.whatsappUrl}
            target="_blank"
            rel="noopener"
            variant="contained"
            startIcon={<WhatsAppIcon />}
            sx={{ bgcolor: '#1faf57', '&:hover': { bgcolor: '#178a45' } }}
          >
            {t('contact.success.continue')}
          </Button>
          <Button variant="text" onClick={() => setSuccess(null)} sx={{ color: palette.ivoryMuted }}>
            {t('contact.success.another')}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      {serverError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <TextField
          label={t('contact.form.fullName')}
          required
          value={form.fullName}
          onChange={set('fullName')}
          error={Boolean(errors.fullName)}
          helperText={errors.fullName}
        />
        <TextField
          label={t('contact.form.email')}
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
        <TextField label={t('contact.form.phone')} value={form.phone} onChange={set('phone')} />
        <TextField label={t('contact.form.company')} value={form.company} onChange={set('company')} />
        <Autocomplete
          freeSolo
          autoHighlight
          selectOnFocus
          clearOnBlur={false}
          handleHomeEndKeys
          options={shootTypes}
          value={form.shootType}
          inputValue={form.shootType}
          onChange={(_, value) => setShootType(value)}
          onInputChange={(_, value) => setShootType(value)}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                bgcolor: palette.inkRaised,
                border: `1px solid ${palette.inkBorder}`,
                boxShadow: '0 18px 48px rgba(11, 7, 9, 0.2)',
              },
            },
            listbox: {
              sx: {
                maxHeight: 280,
                py: 0.75,
                '& .MuiAutocomplete-option': {
                  minHeight: 44,
                  px: 2,
                  py: 1.25,
                  color: palette.ivory,
                  borderBottom: `1px solid ${palette.inkBorder}`,
                  '&:last-of-type': { borderBottom: 0 },
                  '&.Mui-focused': { bgcolor: 'rgba(142, 27, 99, 0.1)' },
                  '&[aria-selected="true"]': { bgcolor: 'rgba(142, 27, 99, 0.14)' },
                },
              },
            },
            clearIndicator: { sx: { color: palette.ivoryMuted } },
            popupIndicator: { sx: { color: palette.ivoryMuted } },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('contact.form.shootType')}
              placeholder={t('contact.form.shootTypePlaceholder')}
            />
          )}
        />
        <TextField
          label={t('contact.form.preferredDate')}
          type="date"
          value={form.preferredDate}
          onChange={set('preferredDate')}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField label={t('contact.form.location')} value={form.location} onChange={set('location')} />
        <TextField select label={t('contact.form.budget')} value={form.budgetRange} onChange={set('budgetRange')}>
          {budgetRanges.map((range) => (
            <MenuItem key={range} value={range}>
              {range}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <TextField
        label={t('contact.form.message')}
        required
        multiline
        minRows={5}
        fullWidth
        sx={{ mt: 2.5 }}
        value={form.message}
        onChange={set('message')}
        error={Boolean(errors.message)}
        helperText={errors.message}
      />
      {/* Honeypot field — invisible to humans, bots fill it and get rejected. */}
      <TextField
        label={t('contact.form.website')}
        value={form.website}
        onChange={set('website')}
        tabIndex={-1}
        autoComplete="off"
        sx={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}
        aria-hidden
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        sx={{ mt: 4, minWidth: 220 }}
      >
        {submitting ? t('contact.form.sending') : t('contact.form.send')}
      </Button>
    </Box>
  );
}
