import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { Portfolio } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { ListSkeleton } from '../../components/admin/Skeletons';
import { onDark, palette } from '../../theme';

export default function PortfolioListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can('portfolio.manage');
  const canPublish = can('portfolio.publish');
  const [items, setItems] = useState<Portfolio[] | null>(null);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Portfolio | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    adminApi
      .listPortfolio()
      .then((res) => setItems(res.items))
      .catch(() => setError(true));
  }, []);

  const patchItem = (updated: Portfolio) =>
    setItems((prev) => prev?.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)) ?? prev);

  const togglePublish = async (item: Portfolio) => {
    try {
      const res = await adminApi.setPublished(item._id, !item.isPublished);
      patchItem(res.item);
      setToast(res.item.isPublished ? 'Published' : 'Unpublished');
    } catch {
      setToast('Failed to update — try again');
    }
  };

  const toggleFeature = async (item: Portfolio) => {
    try {
      const res = await adminApi.setFeatured(item._id, !item.isFeatured);
      patchItem(res.item);
      setToast(res.item.isFeatured ? 'Added to featured' : 'Removed from featured');
    } catch {
      setToast('Failed to update — try again');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminApi.deletePortfolio(pendingDelete._id);
      setItems((prev) => prev?.filter((p) => p._id !== pendingDelete._id) ?? prev);
      setToast('Portfolio deleted');
    } catch {
      setToast('Delete failed — try again');
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  if (error) return <Alert severity="error">Couldn’t load portfolio items — refresh to try again.</Alert>;
  if (items === null) return <ListSkeleton rows={5} thumb />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Typography variant="h3">Portfolio</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/admin/portfolio/new">
            New portfolio
          </Button>
        )}
      </Box>

      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, border: `1px dashed ${palette.inkBorder}` }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            No portfolio items yet
          </Typography>
          <Typography variant="body2" sx={{ color: palette.ivoryMuted, mb: 3 }}>
            Create your first project to start showcasing your work.
          </Typography>
          {canManage && (
            <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/admin/portfolio/new">
              Create portfolio item
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ border: `1px solid ${palette.inkBorder}` }}>
          {items.map((item, index) => (
            <Box
              key={item._id}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderTop: index === 0 ? 'none' : `1px solid ${palette.inkBorder}`,
              }}
            >
              <Box
                component="img"
                src={item.coverImageUrl}
                alt=""
                loading="lazy"
                sx={{ width: 84, height: 56, objectFit: 'cover', flexShrink: 0, bgcolor: palette.ink }}
              />
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography sx={{ color: palette.ivory }}>{item.title}</Typography>
                <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                  {[
                    typeof item.categoryId === 'object' && item.categoryId ? item.categoryId.name : null,
                    `${item.imageCount ?? 0} images`,
                    `/portfolio/${item.slug}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              </Box>
              <Tooltip title={item.isPublished ? 'Published — visible on the site' : 'Draft — hidden from the site'}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Switch checked={item.isPublished} onChange={() => togglePublish(item)} size="small" disabled={!canPublish} />
                  <Typography variant="caption" sx={{ color: palette.ivoryMuted, width: 64 }}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Show on the homepage featured carousel">
                <Chip
                  label="Featured"
                  size="small"
                  clickable={canPublish}
                  disabled={!canPublish}
                  onClick={canPublish ? () => toggleFeature(item) : undefined}
                  sx={{
                    bgcolor: item.isFeatured ? palette.wine : 'transparent',
                    border: `1px solid ${item.isFeatured ? palette.wine : palette.inkBorder}`,
                    color: item.isFeatured ? onDark.ivory : palette.ivoryMuted,
                  }}
                />
              </Tooltip>
              {canManage && (
                <Box>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => navigate(`/admin/portfolio/${item._id}`)} sx={{ color: palette.ivory }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => setPendingDelete(item)} sx={{ color: palette.ivoryMuted }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete “{pendingDelete?.title}”?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
            This permanently removes the portfolio item and all of its gallery images. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
