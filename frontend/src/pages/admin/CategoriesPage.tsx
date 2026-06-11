import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import type { Category } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { palette } from '../../theme';

interface EditorState {
  open: boolean;
  category: Category | null;
  name: string;
  description: string;
}

const CLOSED: EditorState = { open: false, category: null, name: '', description: '' };

export default function CategoriesPage() {
  const { can } = useAuth();
  const canManage = can('categories.manage');
  const [items, setItems] = useState<Category[] | null>(null);
  const [error, setError] = useState(false);
  const [editor, setEditor] = useState<EditorState>(CLOSED);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  useEffect(() => {
    adminApi
      .listCategories()
      .then((res) => setItems(res.items))
      .catch(() => setError(true));
  }, []);

  const reload = () =>
    adminApi
      .listCategories()
      .then((res) => setItems(res.items))
      .catch(() => {});

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (editor.name.trim().length < 2) {
      setEditorError('Please enter a category name');
      return;
    }
    setSaving(true);
    setEditorError(null);
    try {
      if (editor.category) {
        await adminApi.updateCategory(editor.category._id, { name: editor.name, description: editor.description });
        setToast('Category updated');
      } else {
        await adminApi.createCategory({ name: editor.name, description: editor.description });
        setToast('Category created');
      }
      setEditor(CLOSED);
      await reload();
    } catch (err) {
      setEditorError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await adminApi.deleteCategory(pendingDelete._id);
      setItems((prev) => prev?.filter((c) => c._id !== pendingDelete._id) ?? prev);
      setToast('Category deleted');
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : 'Delete failed');
    } finally {
      setPendingDelete(null);
    }
  };

  if (error) return <Alert severity="error">Couldn’t load categories — refresh to try again.</Alert>;
  if (items === null) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Typography variant="h3">Categories</Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditorError(null);
              setEditor({ open: true, category: null, name: '', description: '' });
            }}
          >
            New category
          </Button>
        )}
      </Box>

      {items.length === 0 ? (
        <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
          No categories yet — create one to organise your portfolio.
        </Typography>
      ) : (
        <Box sx={{ border: `1px solid ${palette.inkBorder}` }}>
          {items.map((category, index) => (
            <Box
              key={category._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2.5,
                borderTop: index === 0 ? 'none' : `1px solid ${palette.inkBorder}`,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: palette.ivory }}>{category.name}</Typography>
                <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                  /{category.slug} · {category.portfolioCount ?? 0} portfolio item(s)
                  {category.description ? ` — ${category.description}` : ''}
                </Typography>
              </Box>
              {canManage && (
                <>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => {
                        setEditorError(null);
                        setEditor({ open: true, category, name: category.name, description: category.description ?? '' });
                      }}
                      sx={{ color: palette.ivory }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={(category.portfolioCount ?? 0) > 0 ? 'In use — reassign portfolios first' : 'Delete'}>
                    <span>
                      <IconButton
                        disabled={(category.portfolioCount ?? 0) > 0}
                        onClick={() => setPendingDelete(category)}
                        sx={{ color: palette.ivoryMuted }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={editor.open} onClose={() => setEditor(CLOSED)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={save}>
          <DialogTitle>{editor.category ? 'Edit category' : 'New category'}</DialogTitle>
          <DialogContent>
            {editorError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {editorError}
              </Alert>
            )}
            <TextField
              label="Name"
              fullWidth
              required
              autoFocus
              value={editor.name}
              onChange={(e) => setEditor((prev) => ({ ...prev, name: e.target.value }))}
              sx={{ mt: 1, mb: 2.5 }}
            />
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              minRows={2}
              value={editor.description}
              onChange={(e) => setEditor((prev) => ({ ...prev, description: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditor(CLOSED)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete “{pendingDelete?.name}”?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
