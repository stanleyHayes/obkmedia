import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../../api/admin';
import type {
  SettingsService,
  SettingsSocial,
  SettingsStat,
  SettingsWeddingPackage,
  SiteSettings,
} from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { PageHeading, Section } from '../../components/admin/SettingsSection';
import { SOCIAL_PLATFORMS } from '../../components/public/SocialLinks';
import { BRAND, SOCIALS } from '../../content';
import { en } from '../../i18n/resources';
import { IMAGE_SPECS, type ImageSpecKey, validateImageFile } from '../../lib/imageSpecs';
import { palette } from '../../theme';

// English defaults shown as placeholders / starting points for list editors.
const DEFAULT_SERVICES: SettingsService[] = en.services.items.map((s) => ({ ...s }));
const DEFAULT_STATS: SettingsStat[] = [
  { value: `${BRAND.yearsExperience}+`, label: en.about.statYears },
  { value: en.about.nationwide, label: en.about.statAreas },
  { value: en.about.hours, label: en.about.statHours },
];
const DEFAULT_ABOUT_PARAS = [en.about.p1, en.about.p2, en.about.p3];
const DEFAULT_OUTDOOR = en.pricing.outdoor.map((o) => ({ label: o.label, price: o.price }));
const DEFAULT_WEDDING: SettingsWeddingPackage[] = en.pricing.wedding.map((w, i) => ({
  name: w.name,
  features: [...w.features],
  oneDay: w.oneDay,
  twoDays: w.twoDays,
  popular: i === en.pricing.wedding.length - 1,
}));
const DEFAULT_SOCIALS: SettingsSocial[] = SOCIALS.map((s) => ({ name: s.name, url: s.url }));

interface FormState {
  brandName: string;
  tagline: string;
  logoLightUrl: string;
  logoLightPublicId: string;
  logoDarkUrl: string;
  logoDarkPublicId: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  heroImagePublicId: string;
  aboutImageUrl: string;
  aboutImagePublicId: string;
  aboutParagraphs: string[];
  aboutDifference: string;
  mission: string;
  vision: string;
  stats: SettingsStat[];
  services: SettingsService[];
  pricingIntro: string;
  pricingCurrency: string;
  outdoorTitle: string;
  outdoorNote: string;
  outdoor: { label: string; price: string }[];
  weddingTitle: string;
  wedding: SettingsWeddingPackage[];
  email: string;
  phone: string;
  phoneIntl: string;
  whatsappUrl: string;
  location: string;
  mapsUrl: string;
  hours: string;
  areasServed: string;
  socials: SettingsSocial[];
}

function fromSettings(s: SiteSettings): FormState {
  return {
    brandName: s.brandName ?? '',
    tagline: s.tagline ?? '',
    logoLightUrl: s.logoLightUrl ?? '',
    logoLightPublicId: s.logoLightPublicId ?? '',
    logoDarkUrl: s.logoDarkUrl ?? '',
    logoDarkPublicId: s.logoDarkPublicId ?? '',
    heroHeadline: s.heroHeadline ?? '',
    heroSubheadline: s.heroSubheadline ?? '',
    heroImageUrl: s.heroImageUrl ?? '',
    heroImagePublicId: s.heroImagePublicId ?? '',
    aboutImageUrl: s.aboutImageUrl ?? '',
    aboutImagePublicId: s.aboutImagePublicId ?? '',
    aboutParagraphs: s.aboutParagraphs?.length ? s.aboutParagraphs : DEFAULT_ABOUT_PARAS,
    aboutDifference: s.aboutDifference ?? '',
    mission: s.mission ?? '',
    vision: s.vision ?? '',
    stats: s.stats?.length ? s.stats : DEFAULT_STATS,
    services: s.services?.length ? s.services : DEFAULT_SERVICES,
    pricingIntro: s.pricing?.intro ?? '',
    pricingCurrency: s.pricing?.currency ?? '',
    outdoorTitle: s.pricing?.outdoorTitle ?? '',
    outdoorNote: s.pricing?.outdoorNote ?? '',
    outdoor: s.pricing?.outdoor?.length ? s.pricing.outdoor : DEFAULT_OUTDOOR,
    weddingTitle: s.pricing?.weddingTitle ?? '',
    wedding: s.pricing?.wedding?.length ? s.pricing.wedding : DEFAULT_WEDDING,
    email: s.email ?? '',
    phone: s.phone ?? '',
    phoneIntl: s.phoneIntl ?? '',
    whatsappUrl: s.whatsappUrl ?? '',
    location: s.location ?? '',
    mapsUrl: s.mapsUrl ?? '',
    hours: s.hours ?? '',
    areasServed: s.areasServed ?? '',
    socials: s.socials?.length ? s.socials : DEFAULT_SOCIALS,
  };
}

function toPayload(f: FormState): Partial<SiteSettings> {
  return {
    brandName: f.brandName,
    tagline: f.tagline,
    logoLightUrl: f.logoLightUrl,
    logoLightPublicId: f.logoLightPublicId,
    logoDarkUrl: f.logoDarkUrl,
    logoDarkPublicId: f.logoDarkPublicId,
    heroHeadline: f.heroHeadline,
    heroSubheadline: f.heroSubheadline,
    heroImageUrl: f.heroImageUrl,
    heroImagePublicId: f.heroImagePublicId,
    aboutImageUrl: f.aboutImageUrl,
    aboutImagePublicId: f.aboutImagePublicId,
    aboutParagraphs: f.aboutParagraphs.map((p) => p.trim()).filter(Boolean),
    aboutDifference: f.aboutDifference,
    mission: f.mission,
    vision: f.vision,
    stats: f.stats.filter((s) => s.value.trim() || s.label.trim()),
    services: f.services.filter((s) => s.title.trim()),
    pricing: {
      intro: f.pricingIntro,
      currency: f.pricingCurrency,
      outdoorTitle: f.outdoorTitle,
      outdoorNote: f.outdoorNote,
      outdoor: f.outdoor.filter((o) => o.label.trim() || o.price.trim()),
      weddingTitle: f.weddingTitle,
      wedding: f.wedding
        .filter((w) => w.name.trim())
        .map((w) => ({ ...w, features: w.features.map((x) => x.trim()).filter(Boolean) })),
    },
    email: f.email,
    phone: f.phone,
    phoneIntl: f.phoneIntl,
    whatsappUrl: f.whatsappUrl,
    location: f.location,
    mapsUrl: f.mapsUrl,
    hours: f.hours,
    areasServed: f.areasServed,
    socials: f.socials.filter((s) => s.url.trim()),
  };
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list];
  const target = index + dir;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Validated image upload with live preview + recommended-size hint. */
function ImageField({
  specKey,
  url,
  onUploaded,
  disabled,
  previewDark,
}: {
  specKey: ImageSpecKey;
  url: string;
  onUploaded: (url: string, publicId: string) => void;
  disabled?: boolean;
  previewDark?: boolean;
}) {
  const spec = IMAGE_SPECS[specKey];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const result = await validateImageFile(file, spec);
    if (!result.ok) {
      setError(result.error ?? 'Invalid image');
      return;
    }
    setBusy(true);
    try {
      const res = await adminApi.uploadImage(file);
      onUploaded(res.url, res.publicId);
    } catch {
      setError('Upload failed — please try again.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 2 }}>
        <Box
          sx={{
            width: 132,
            height: 88,
            flexShrink: 0,
            border: `1px solid ${palette.inkBorder}`,
            borderRadius: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: previewDark ? '#0b0709' : '#f6f1ec',
          }}
        >
          {url ? (
            <Box component="img" src={url} alt="" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <ImageOutlinedIcon sx={{ color: palette.ivoryMuted, opacity: 0.5 }} />
          )}
        </Box>
        <Stack spacing={1}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              disabled={disabled || busy}
              onClick={() => inputRef.current?.click()}
              startIcon={busy ? <CircularProgress size={15} /> : <ImageOutlinedIcon />}
            >
              {url ? 'Replace' : 'Upload'}
            </Button>
            {url && (
              <Button size="small" color="inherit" disabled={disabled || busy} onClick={() => onUploaded('', '')}>
                Remove
              </Button>
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
            Recommended: {spec.recommended}
          </Typography>
        </Stack>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

const RowTools = ({
  onUp,
  onDown,
  onRemove,
  disabled,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  disabled?: boolean;
}) => (
  <Stack direction="row" sx={{ alignItems: 'center' }}>
    <IconButton size="small" disabled={disabled} onClick={onUp} aria-label="Move up">
      <ArrowUpwardIcon fontSize="small" />
    </IconButton>
    <IconButton size="small" disabled={disabled} onClick={onDown} aria-label="Move down">
      <ArrowDownwardIcon fontSize="small" />
    </IconButton>
    <IconButton size="small" color="error" disabled={disabled} onClick={onRemove} aria-label="Remove">
      <DeleteOutlineIcon fontSize="small" />
    </IconButton>
  </Stack>
);

export default function SettingsPage() {
  const { can } = useAuth();
  const editable = can('settings.manage');
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((res) => setForm(fromSettings(res.settings)))
      .catch(() => setLoadError(true));
  }, []);

  if (!can('settings.view')) {
    return <Alert severity="warning">You don’t have access to site content settings.</Alert>;
  }
  if (loadError) return <Alert severity="error">Couldn’t load site settings. Please refresh.</Alert>;
  if (!form) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async () => {
    setSaving(true);
    try {
      const res = await adminApi.updateSettings(toPayload(form));
      setForm(fromSettings(res.settings));
      setToast('Site content saved — it’s live on the public site.');
    } catch {
      setToast('Couldn’t save — please try again.');
    } finally {
      setSaving(false);
    }
  };

  const textField = (key: keyof FormState, label: string, placeholder?: string, multiline = false) => (
    <TextField
      label={label}
      value={form[key] as string}
      placeholder={placeholder}
      disabled={!editable}
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      onChange={(e) => set(key, e.target.value as FormState[typeof key])}
      fullWidth
      slotProps={placeholder ? { inputLabel: { shrink: true } } : undefined}
    />
  );

  return (
    <Box sx={{ pb: 12 }}>
      <PageHeading
        title="Site content"
        subtitle="Edit the public website — branding, hero, about, services, pricing, contact, and socials. Blank text fields fall back to the built-in defaults; saving publishes immediately."
      />

      <Stack spacing={4} sx={{ maxWidth: 880 }}>
        {/* Branding */}
        <Section icon={<BadgeOutlinedIcon />} title="Branding & logos" subtitle="Brand name, tagline, and theme-specific logos.">
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {textField('brandName', 'Brand name', BRAND.name)}
              {textField('tagline', 'Tagline', BRAND.tagline)}
            </Stack>
            <Box>
              <Typography variant="subtitle2" sx={{ color: palette.ivory, mb: 1 }}>
                Logo — light theme
              </Typography>
              <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mb: 1.5 }}>
                Shown when the site is in light mode (use a dark-coloured logo). Falls back to the built-in mark if empty.
              </Typography>
              <ImageField
                specKey="logo"
                url={form.logoLightUrl}
                disabled={!editable}
                onUploaded={(url, publicId) => setForm((f) => (f ? { ...f, logoLightUrl: url, logoLightPublicId: publicId } : f))}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: palette.ivory, mb: 1 }}>
                Logo — dark theme
              </Typography>
              <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mb: 1.5 }}>
                Shown when the site is in dark mode (use a light-coloured logo).
              </Typography>
              <ImageField
                specKey="logo"
                url={form.logoDarkUrl}
                disabled={!editable}
                previewDark
                onUploaded={(url, publicId) => setForm((f) => (f ? { ...f, logoDarkUrl: url, logoDarkPublicId: publicId } : f))}
              />
            </Box>
          </Stack>
        </Section>

        {/* Hero */}
        <Section icon={<ImageOutlinedIcon />} title="Hero section" subtitle="The headline, intro, and background image at the top of the homepage.">
          <Stack spacing={3}>
            {textField('heroHeadline', 'Headline', BRAND.heroHeadline)}
            {textField('heroSubheadline', 'Sub-headline', BRAND.heroSubheadline, true)}
            <ImageField
              specKey="hero"
              url={form.heroImageUrl}
              disabled={!editable}
              previewDark
              onUploaded={(url, publicId) => setForm((f) => (f ? { ...f, heroImageUrl: url, heroImagePublicId: publicId } : f))}
            />
          </Stack>
        </Section>

        {/* About */}
        <Section icon={<InfoOutlinedIcon />} title="About" subtitle="The story, portrait image, and signature quote.">
          <Stack spacing={3}>
            <ImageField
              specKey="about"
              url={form.aboutImageUrl}
              disabled={!editable}
              onUploaded={(url, publicId) => setForm((f) => (f ? { ...f, aboutImageUrl: url, aboutImagePublicId: publicId } : f))}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ color: palette.ivory, mb: 1.5 }}>
                Paragraphs
              </Typography>
              <Stack spacing={2}>
                {form.aboutParagraphs.map((para, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <TextField
                      label={`Paragraph ${i + 1}`}
                      value={para}
                      disabled={!editable}
                      multiline
                      minRows={2}
                      fullWidth
                      onChange={(e) => set('aboutParagraphs', form.aboutParagraphs.map((p, j) => (j === i ? e.target.value : p)))}
                    />
                    <IconButton
                      color="error"
                      disabled={!editable}
                      onClick={() => set('aboutParagraphs', form.aboutParagraphs.filter((_, j) => j !== i))}
                      aria-label="Remove paragraph"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button startIcon={<AddIcon />} disabled={!editable} onClick={() => set('aboutParagraphs', [...form.aboutParagraphs, ''])} sx={{ alignSelf: 'flex-start' }}>
                  Add paragraph
                </Button>
              </Stack>
            </Box>
            {textField('aboutDifference', 'Signature quote', en.about.difference, true)}
          </Stack>
        </Section>

        {/* Mission & Vision */}
        <Section icon={<DesignServicesOutlinedIcon />} title="Mission & vision">
          <Stack spacing={3}>
            {textField('mission', 'Mission', en.about.mission, true)}
            {textField('vision', 'Vision', en.about.vision, true)}
          </Stack>
        </Section>

        {/* Stats */}
        <Section icon={<QueryStatsOutlinedIcon />} title="Stats" subtitle="The three figures shown in the About section.">
          <Stack spacing={2}>
            {form.stats.map((stat, i) => (
              <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
                <TextField label="Value" value={stat.value} disabled={!editable} onChange={(e) => set('stats', form.stats.map((s, j) => (j === i ? { ...s, value: e.target.value } : s)))} sx={{ maxWidth: { sm: 160 } }} />
                <TextField label="Label" value={stat.label} disabled={!editable} fullWidth onChange={(e) => set('stats', form.stats.map((s, j) => (j === i ? { ...s, label: e.target.value } : s)))} />
                <RowTools disabled={!editable} onUp={() => set('stats', moveItem(form.stats, i, -1))} onDown={() => set('stats', moveItem(form.stats, i, 1))} onRemove={() => set('stats', form.stats.filter((_, j) => j !== i))} />
              </Stack>
            ))}
            <Button startIcon={<AddIcon />} disabled={!editable} onClick={() => set('stats', [...form.stats, { value: '', label: '' }])} sx={{ alignSelf: 'flex-start' }}>
              Add stat
            </Button>
          </Stack>
        </Section>

        {/* Services */}
        <Section icon={<DesignServicesOutlinedIcon />} title="Services (what we do)">
          <Stack spacing={2.5}>
            {form.services.map((svc, i) => (
              <Box key={i} sx={{ border: `1px solid ${palette.inkBorder}`, borderRadius: 1, p: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                  <TextField label="Title" value={svc.title} disabled={!editable} fullWidth onChange={(e) => set('services', form.services.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)))} />
                  <RowTools disabled={!editable} onUp={() => set('services', moveItem(form.services, i, -1))} onDown={() => set('services', moveItem(form.services, i, 1))} onRemove={() => set('services', form.services.filter((_, j) => j !== i))} />
                </Stack>
                <TextField label="Description" value={svc.description} disabled={!editable} fullWidth multiline minRows={2} onChange={(e) => set('services', form.services.map((s, j) => (j === i ? { ...s, description: e.target.value } : s)))} />
              </Box>
            ))}
            <Button startIcon={<AddIcon />} disabled={!editable} onClick={() => set('services', [...form.services, { title: '', description: '' }])} sx={{ alignSelf: 'flex-start' }}>
              Add service
            </Button>
          </Stack>
        </Section>

        {/* Pricing */}
        <Section icon={<LocalOfferOutlinedIcon />} title="Pricing & packages">
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {textField('pricingCurrency', 'Currency symbol', en.pricing.currency)}
              {textField('outdoorTitle', 'Outdoor section title', en.pricing.outdoorTitle)}
            </Stack>
            {textField('pricingIntro', 'Pricing intro', en.pricing.intro, true)}
            {textField('outdoorNote', 'Outdoor note', en.pricing.outdoorNote)}

            <Box>
              <Typography variant="subtitle2" sx={{ color: palette.ivory, mb: 1.5 }}>
                Outdoor photoshoot tiers
              </Typography>
              <Stack spacing={1.5}>
                {form.outdoor.map((tier, i) => (
                  <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <TextField label="Label" value={tier.label} disabled={!editable} fullWidth onChange={(e) => set('outdoor', form.outdoor.map((o, j) => (j === i ? { ...o, label: e.target.value } : o)))} />
                    <TextField label="Price" value={tier.price} disabled={!editable} onChange={(e) => set('outdoor', form.outdoor.map((o, j) => (j === i ? { ...o, price: e.target.value } : o)))} sx={{ maxWidth: 140 }} />
                    <RowTools disabled={!editable} onUp={() => set('outdoor', moveItem(form.outdoor, i, -1))} onDown={() => set('outdoor', moveItem(form.outdoor, i, 1))} onRemove={() => set('outdoor', form.outdoor.filter((_, j) => j !== i))} />
                  </Stack>
                ))}
                <Button startIcon={<AddIcon />} disabled={!editable} onClick={() => set('outdoor', [...form.outdoor, { label: '', price: '' }])} sx={{ alignSelf: 'flex-start' }}>
                  Add tier
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: palette.inkBorder }} />
            {textField('weddingTitle', 'Wedding section title', en.pricing.weddingTitle)}

            <Box>
              <Typography variant="subtitle2" sx={{ color: palette.ivory, mb: 1.5 }}>
                Wedding packages
              </Typography>
              <Stack spacing={2.5}>
                {form.wedding.map((pkg, i) => (
                  <Box key={i} sx={{ border: `1px solid ${palette.inkBorder}`, borderRadius: 1, p: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <TextField label="Package name" value={pkg.name} disabled={!editable} fullWidth onChange={(e) => set('wedding', form.wedding.map((w, j) => (j === i ? { ...w, name: e.target.value } : w)))} />
                      <RowTools disabled={!editable} onUp={() => set('wedding', moveItem(form.wedding, i, -1))} onDown={() => set('wedding', moveItem(form.wedding, i, 1))} onRemove={() => set('wedding', form.wedding.filter((_, j) => j !== i))} />
                    </Stack>
                    <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                      <TextField label="1 day price" value={pkg.oneDay} disabled={!editable} fullWidth onChange={(e) => set('wedding', form.wedding.map((w, j) => (j === i ? { ...w, oneDay: e.target.value } : w)))} />
                      <TextField label="2 days price" value={pkg.twoDays} disabled={!editable} fullWidth onChange={(e) => set('wedding', form.wedding.map((w, j) => (j === i ? { ...w, twoDays: e.target.value } : w)))} />
                    </Stack>
                    <TextField
                      label="Features (one per line)"
                      value={pkg.features.join('\n')}
                      disabled={!editable}
                      fullWidth
                      multiline
                      minRows={3}
                      onChange={(e) => set('wedding', form.wedding.map((w, j) => (j === i ? { ...w, features: e.target.value.split('\n') } : w)))}
                    />
                    <FormControlLabel
                      sx={{ mt: 1 }}
                      control={<Switch checked={Boolean(pkg.popular)} disabled={!editable} onChange={(e) => set('wedding', form.wedding.map((w, j) => (j === i ? { ...w, popular: e.target.checked } : w)))} />}
                      label={<Typography variant="body2" sx={{ color: palette.ivoryMuted }}>Mark as “Most popular”</Typography>}
                    />
                  </Box>
                ))}
                <Button startIcon={<AddIcon />} disabled={!editable} onClick={() => set('wedding', [...form.wedding, { name: '', features: [''], oneDay: '', twoDays: '', popular: false }])} sx={{ alignSelf: 'flex-start' }}>
                  Add package
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Section>

        {/* Contact */}
        <Section icon={<ContactMailOutlinedIcon />} title="Contact">
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {textField('email', 'Email', BRAND.email)}
              {textField('whatsappUrl', 'WhatsApp link', BRAND.whatsappUrl)}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {textField('phone', 'Phone (local)', BRAND.phone)}
              {textField('phoneIntl', 'Phone (international)', BRAND.phoneIntl)}
            </Stack>
          </Stack>
        </Section>

        {/* Location */}
        <Section icon={<PlaceOutlinedIcon />} title="Location & studio">
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {textField('location', 'Studio location', BRAND.location)}
              {textField('areasServed', 'Areas served', BRAND.areasServed)}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {textField('hours', 'Availability / hours', BRAND.hours)}
              {textField('mapsUrl', 'Google Maps link', BRAND.mapsUrl)}
            </Stack>
          </Stack>
        </Section>

        {/* Socials */}
        <Section icon={<ShareOutlinedIcon />} title="Social links">
          <Stack spacing={1.5}>
            {form.socials.map((social, i) => (
              <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <TextField
                  select
                  label="Platform"
                  value={social.name}
                  disabled={!editable}
                  onChange={(e) => set('socials', form.socials.map((s, j) => (j === i ? { ...s, name: e.target.value } : s)))}
                  sx={{ minWidth: 150 }}
                >
                  {SOCIAL_PLATFORMS.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="URL" value={social.url} disabled={!editable} fullWidth onChange={(e) => set('socials', form.socials.map((s, j) => (j === i ? { ...s, url: e.target.value } : s)))} />
                <IconButton color="error" disabled={!editable} onClick={() => set('socials', form.socials.filter((_, j) => j !== i))} aria-label="Remove social">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<AddIcon />} disabled={!editable} onClick={() => set('socials', [...form.socials, { name: SOCIAL_PLATFORMS[0], url: '' }])} sx={{ alignSelf: 'flex-start' }}>
              Add social link
            </Button>
          </Stack>
        </Section>
      </Stack>

      {editable && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            mt: 4,
            py: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            bgcolor: palette.ink,
            borderTop: `1px solid ${palette.inkBorder}`,
            zIndex: 2,
          }}
        >
          <Button variant="contained" size="large" disabled={saving} onClick={save} startIcon={saving ? <CircularProgress size={16} /> : undefined}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Box>
      )}

      <Snackbar open={Boolean(toast)} autoHideDuration={3200} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
