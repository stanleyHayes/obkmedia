import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import { publicApi } from '../../api/public';
import { BUDGET_RANGES, SHOOT_TYPES } from '../../content';
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
      <Box sx={{ border: `1px solid ${palette.wineBright}`, p: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: palette.ivory, mb: 2 }}>
          Thank you.
        </Typography>
        <Typography variant="body1" sx={{ color: palette.ivoryMuted, mb: 4 }}>
          {success}
        </Typography>
        <Button variant="outlined" onClick={() => setSuccess(null)}>
          Send another message
        </Button>
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
        startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
      >
        {submitting ? 'Sending…' : 'Send inquiry'}
      </Button>
    </Box>
  );
}
