import DoneAllIcon from '@mui/icons-material/DoneAll';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import { publicApi } from '../../api/public';
import { BRAND, BUDGET_RANGES, SHOOT_TYPES } from '../../content';
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
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.fullName.trim().length < 2) next.fullName = 'Please enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email address';
    if (form.message.trim().length < 10) next.message = 'Tell us a little more about your project';
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
      setSuccess(res.message);
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : 'Something went wrong — please try again or reach us on WhatsApp.',
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
              Typically replies within minutes
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
            <Typography variant="body2">Hi OBK MEDIA, I’d love to book a shoot.</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.25 }}>
              <Typography variant="caption" sx={{ color: 'rgba(233,237,239,0.6)', fontSize: '0.65rem' }}>sent</Typography>
              <DoneAllIcon sx={{ fontSize: '0.95rem', color: '#53bdeb' }} />
            </Box>
          </Box>
          <Box sx={{ alignSelf: 'flex-start', bgcolor: '#202c33', color: '#e9edef', px: 1.75, py: 1, borderRadius: '8px 8px 8px 0', maxWidth: '85%' }}>
            <Typography variant="body2">{success}</Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ bgcolor: palette.inkRaised, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            component="a"
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener"
            variant="contained"
            startIcon={<WhatsAppIcon />}
            sx={{ bgcolor: '#1faf57', '&:hover': { bgcolor: '#178a45' } }}
          >
            Continue on WhatsApp
          </Button>
          <Button variant="text" onClick={() => setSuccess(null)} sx={{ color: palette.ivoryMuted }}>
            Send another message
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
          label="Full name"
          required
          value={form.fullName}
          onChange={set('fullName')}
          error={Boolean(errors.fullName)}
          helperText={errors.fullName}
        />
        <TextField
          label="Email address"
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
        <TextField label="Phone / WhatsApp" value={form.phone} onChange={set('phone')} />
        <TextField label="Company / Organisation" value={form.company} onChange={set('company')} />
        <TextField select label="Shoot type" value={form.shootType} onChange={set('shootType')}>
          {SHOOT_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Preferred date"
          type="date"
          value={form.preferredDate}
          onChange={set('preferredDate')}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField label="Location" value={form.location} onChange={set('location')} />
        <TextField select label="Budget range (optional)" value={form.budgetRange} onChange={set('budgetRange')}>
          {BUDGET_RANGES.map((range) => (
            <MenuItem key={range} value={range}>
              {range}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <TextField
        label="Your message / project details"
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
        label="Website"
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
        {submitting ? 'Sending…' : 'Send inquiry'}
      </Button>
    </Box>
  );
}
