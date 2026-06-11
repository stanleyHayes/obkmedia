import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
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

  const updateImageMeta = async (imageId: string, altText: string) => {
    try {
      await adminApi.updateImage(imageId, { altText });
    } catch {
      setToast('Couldn’t save alt text');
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
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/portfolio')} sx={{ color: palette.ivoryMuted, mb: 2, px: 0 }}>
        All portfolio items
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Typography variant="h3">{isNew ? 'New portfolio item' : 'Edit portfolio item'}</Typography>
        <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 140 }}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 4 }}>
        {/* Details */}
        <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 } }}>
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
          <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isPublished ?? false}
                  disabled={!canPublish}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                />
              }
              label="Published"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isFeatured ?? false}
                  disabled={!canPublish}
                  onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                />
              }
              label="Featured on homepage"
            />
          </Box>
          {!canPublish && (
            <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mt: 1 }}>
              Publishing and featuring require the “portfolio.publish” permission — ask a manager to make it live.
            </Typography>
          )}
        </Box>

        {/* Cover + gallery */}
        <Box>
          <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 }, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Cover image
            </Typography>
            {form.coverImageUrl ? (
              <Box component="img" src={form.coverImageUrl} alt="Cover" sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', mb: 2 }} />
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

          <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 } }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Gallery
            </Typography>
            {isNew ? (
              <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                Save the portfolio item first, then upload gallery images here.
              </Typography>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: palette.ivoryMuted, mb: 2.5 }}>
                  JPEG, PNG, or WebP — up to 20 at a time. Use the arrows to reorder.
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadOutlinedIcon />}
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                  sx={{ mb: 3 }}
                >
                  {uploadingGallery ? 'Uploading…' : 'Upload images'}
                </Button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={uploadGallery}
                />
                {images.length === 0 ? (
                  <Typography variant="body2" sx={{ color: palette.ivoryMuted, textAlign: 'center', py: 3 }}>
                    No gallery images yet.
                  </Typography>
                ) : (
                  images.map((image, index) => (
                    <Box
                      key={image._id}
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'center',
                        py: 1.5,
                        borderTop: index === 0 ? 'none' : `1px solid ${palette.inkBorder}`,
                      }}
                    >
                      <Box component="img" src={image.imageUrl} alt="" sx={{ width: 72, height: 48, objectFit: 'cover', flexShrink: 0 }} />
                      <TextField
                        size="small"
                        placeholder="Alt text"
                        defaultValue={image.altText ?? ''}
                        onBlur={(e) => updateImageMeta(image._id, e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <Tooltip title="Move up">
                        <span>
                          <IconButton size="small" disabled={index === 0} onClick={() => moveImage(index, -1)} sx={{ color: palette.ivory }}>
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
                            sx={{ color: palette.ivory }}
                          >
                            <ArrowDownwardIcon fontSize="inherit" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete image">
                        <IconButton size="small" onClick={() => deleteImage(image._id)} sx={{ color: palette.ivoryMuted }}>
                          <DeleteOutlineIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
