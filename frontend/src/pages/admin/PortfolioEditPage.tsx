import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { FormSkeleton } from '../../components/admin/Skeletons';
import type { Category, PortfolioImage, PortfolioPayload } from '../../api/types';
import { palette } from '../../theme';

const EMPTY: PortfolioPayload = {
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  categoryId: '',
  coverImageUrl: '',
  coverImagePublicId: '',
  shootDate: '',
  location: '',
  clientName: '',
  isFeatured: false,
  isPublished: false,
};

const panelSx = {
  border: `1px solid ${palette.inkBorder}`,
  bgcolor: palette.inkRaised,
};

const actionIconSx = {
  width: 34,
  height: 34,
  border: `1px solid ${palette.inkBorder}`,
  color: palette.ivory,
  '&.Mui-disabled': {
    color: palette.ivoryMuted,
    opacity: 0.35,
  },
};

export default function PortfolioEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { can } = useAuth();
  const canPublish = can('portfolio.publish');

  const [form, setForm] = useState<PortfolioPayload>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi
      .listCategories()
      .then((res) => setCategories(res.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    adminApi
      .getPortfolio(id)
      .then((res) => {
        if (cancelled) return;
        const item = res.item;
        setForm({
          title: item.title,
          slug: item.slug,
          shortDescription: item.shortDescription,
          fullDescription: item.fullDescription ?? '',
          categoryId:
            typeof item.categoryId === 'object' && item.categoryId ? item.categoryId._id : (item.categoryId ?? ''),
          coverImageUrl: item.coverImageUrl,
          coverImagePublicId: item.coverImagePublicId ?? '',
          shootDate: item.shootDate ? item.shootDate.slice(0, 10) : '',
          location: item.location ?? '',
          clientName: item.clientName ?? '',
          isFeatured: item.isFeatured,
          isPublished: item.isPublished,
        });
        setImages(res.images);
      })
      .catch(() => {
        if (!cancelled) setError('Couldn’t load this portfolio item.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const set =
    (key: keyof PortfolioPayload) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const uploadCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const stored = await adminApi.uploadImage(file);
      setForm((prev) => ({ ...prev, coverImageUrl: stored.url, coverImagePublicId: stored.publicId }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cover upload failed');
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const uploadGallery = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || isNew || !id) return;
    setUploadingGallery(true);
    setError(null);
    try {
      const res = await adminApi.uploadGalleryImages(id, files);
      setImages((prev) => [...prev, ...res.images]);
      setToast(`${res.images.length} image(s) uploaded`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gallery upload failed');
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length || !id) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    try {
      await adminApi.reorderImages(
        id,
        next.map((image) => image._id),
      );
    } catch {
      setToast('Reorder failed — refresh and try again');
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      await adminApi.deleteImage(imageId);
      setImages((prev) => prev.filter((image) => image._id !== imageId));
      setToast('Image deleted');
    } catch {
      setToast('Delete failed — try again');
    }
  };

  const updateImageMeta = async (imageId: string, payload: Partial<Pick<PortfolioImage, 'altText' | 'caption'>>) => {
    try {
      await adminApi.updateImage(imageId, payload);
      setImages((prev) => prev.map((image) => (image._id === imageId ? { ...image, ...payload } : image)));
    } catch {
      setToast('Couldn’t save image details');
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.shortDescription.trim()) {
      setError('Title and short description are required.');
      return;
    }
    if (!form.coverImageUrl) {
      setError('Please upload a cover image.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const res = await adminApi.createPortfolio(form);
        setToast('Portfolio created — you can now add gallery images');
        navigate(`/admin/portfolio/${res.item._id}`, { replace: true });
      } else if (id) {
        await adminApi.updatePortfolio(id, form);
        setToast('Saved');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed — please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Box sx={{ ...panelSx, p: { xs: 2.5, md: 4 }, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/portfolio')}
          sx={{ color: palette.ivoryMuted, mb: 2, px: 0 }}
        >
          All portfolio items
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'flex-end' }, flexWrap: 'wrap', gap: 2.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: palette.rose }}>
              Portfolio studio
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5 }}>
              {isNew ? 'New portfolio item' : form.title || 'Edit portfolio item'}
            </Typography>
            <Typography variant="body2" sx={{ color: palette.ivoryMuted, maxWidth: 680, mt: 1.5 }}>
              Shape the story, choose the cover, and arrange the image set visitors will browse.
            </Typography>
          </Box>
          <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 150 }}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.45fr) minmax(320px, 0.55fr)' },
          gap: 3,
          alignItems: 'start',
          mb: 3,
        }}
      >
        <Box sx={{ ...panelSx, p: { xs: 2.5, md: 4 } }}>
          <Typography variant="overline" sx={{ color: palette.ivoryMuted }}>
            Project story
          </Typography>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
            <TextField label="Title" required value={form.title} onChange={set('title')} />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={set('slug')}
              helperText="Leave blank to generate from the title"
            />
            <TextField select label="Category" value={form.categoryId ?? ''} onChange={set('categoryId')}>
              <MenuItem value="">No category</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Shoot date"
              type="date"
              value={form.shootDate ?? ''}
              onChange={set('shootDate')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField label="Location" value={form.location} onChange={set('location')} />
            <TextField label="Client name" value={form.clientName} onChange={set('clientName')} />
          </Box>
          <TextField
            label="Short description"
            required
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 2.5 }}
            value={form.shortDescription}
            onChange={set('shortDescription')}
            helperText="Shown on portfolio cards and listings"
          />
          <TextField
            label="Full description"
            fullWidth
            multiline
            minRows={5}
            sx={{ mt: 2.5 }}
            value={form.fullDescription}
            onChange={set('fullDescription')}
            helperText="Shown on the project detail page"
          />
        </Box>

        <Stack spacing={3}>
          <Box sx={{ ...panelSx, p: { xs: 2.5, md: 3 } }}>
            <Typography variant="overline" sx={{ color: palette.ivoryMuted }}>
              Lead image
            </Typography>
            <Typography variant="h5" sx={{ mb: 2.5 }}>
              Cover
            </Typography>
            {form.coverImageUrl ? (
              <Box
                component="img"
                src={form.coverImageUrl}
                alt="Cover"
                sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', mb: 2, display: 'block' }}
              />
            ) : (
              <Box
                sx={{
                  aspectRatio: '4 / 3',
                  border: `1px dashed ${palette.inkBorder}`,
                  display: 'grid',
                  placeItems: 'center',
                  mb: 2,
                  color: palette.ivoryMuted,
                }}
              >
                <Typography variant="body2">No cover yet</Typography>
              </Box>
            )}
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
            >
              {uploadingCover ? 'Uploading…' : form.coverImageUrl ? 'Replace cover' : 'Upload cover'}
            </Button>
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadCover} />
          </Box>

          <Box sx={{ ...panelSx, p: { xs: 2.5, md: 3 } }}>
            <Typography variant="overline" sx={{ color: palette.ivoryMuted }}>
              Visibility
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Publishing
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ border: `1px solid ${palette.inkBorder}`, p: 1.5 }}>
                <FormControlLabel
                  sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
                  control={
                    <Switch
                      checked={form.isPublished ?? false}
                      disabled={!canPublish}
                      onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                    />
                  }
                  label="Published"
                  labelPlacement="start"
                />
              </Box>
              <Box sx={{ border: `1px solid ${palette.inkBorder}`, p: 1.5 }}>
                <FormControlLabel
                  sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
                  control={
                    <Switch
                      checked={form.isFeatured ?? false}
                      disabled={!canPublish}
                      onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    />
                  }
                  label="Featured on homepage"
                  labelPlacement="start"
                />
              </Box>
            </Stack>
            {!canPublish && (
              <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mt: 1.5 }}>
                Publishing and featuring require the “portfolio.publish” permission.
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      <Box sx={{ ...panelSx, p: { xs: 2.5, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ color: palette.ivoryMuted }}>
              Image set
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography variant="h5">Gallery</Typography>
              <Chip label={`${images.length} image${images.length === 1 ? '' : 's'}`} size="small" />
            </Box>
            <Typography variant="body2" sx={{ color: palette.ivoryMuted, mt: 1 }}>
              Upload in batches, then use the controls on each card to tune order and metadata.
            </Typography>
          </Box>
          {!isNew && (
            <Button
              variant="outlined"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
            >
              {uploadingGallery ? 'Uploading…' : 'Upload images'}
            </Button>
          )}
        </Box>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={uploadGallery}
        />

        {isNew ? (
          <Box sx={{ border: `1px dashed ${palette.inkBorder}`, p: 4, textAlign: 'center', color: palette.ivoryMuted }}>
            <Typography variant="body2">Save the portfolio item first, then upload gallery images here.</Typography>
          </Box>
        ) : images.length === 0 ? (
          <Box sx={{ border: `1px dashed ${palette.inkBorder}`, p: 5, textAlign: 'center', color: palette.ivoryMuted }}>
            <Typography variant="body2">No gallery images yet.</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
              gap: 2.5,
            }}
          >
            {images.map((image, index) => {
              const isCoverImage = Boolean(form.coverImageUrl && image.imageUrl === form.coverImageUrl);

              return (
                <Box
                  key={image._id}
                  sx={{
                    border: `1px solid ${palette.inkBorder}`,
                    bgcolor: palette.ink,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', bgcolor: palette.inkRaised }}>
                    <Box
                      component="img"
                      src={image.imageUrl}
                      alt={image.altText || `Gallery image ${index + 1}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        bgcolor: 'rgba(11, 7, 9, 0.72)',
                        color: '#f4ede7',
                        border: '1px solid rgba(244, 237, 231, 0.22)',
                      }}
                    />
                    {isCoverImage && (
                      <Chip
                        label="Cover"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          bgcolor: 'rgba(95, 5, 58, 0.82)',
                          color: '#f4ede7',
                        }}
                      />
                    )}
                  </Box>

                  <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
                    <TextField
                      size="small"
                      label="Alt text"
                      defaultValue={image.altText ?? ''}
                      onBlur={(e) => updateImageMeta(image._id, { altText: e.target.value })}
                    />
                    <TextField
                      size="small"
                      label="Caption"
                      defaultValue={image.caption ?? ''}
                      onBlur={(e) => updateImageMeta(image._id, { caption: e.target.value })}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 'auto' }}>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Move up">
                          <span>
                            <IconButton size="small" disabled={index === 0} onClick={() => moveImage(index, -1)} sx={actionIconSx}>
                              <ArrowUpwardIcon fontSize="inherit" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Move down">
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === images.length - 1}
                              onClick={() => moveImage(index, 1)}
                              sx={actionIconSx}
                            >
                              <ArrowDownwardIcon fontSize="inherit" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                      <Tooltip title="Delete image">
                        <IconButton size="small" onClick={() => deleteImage(image._id)} sx={{ ...actionIconSx, color: palette.ivoryMuted }}>
                          <DeleteOutlineIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
