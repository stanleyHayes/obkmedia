import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import type { Permission, Role } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { palette } from '../../theme';

const GROUP_LABELS: Record<string, string> = {
  portfolio: 'Portfolio',
  categories: 'Categories',
  messages: 'Messages',
  users: 'Users',
  roles: 'Roles',
};

interface EditorState {
  open: boolean;
  role: Role | null;
  name: string;
  description: string;
  permissions: Set<Permission>;
}

const CLOSED: EditorState = { open: false, role: null, name: '', description: '', permissions: new Set() };

export default function RolesPage() {
  const { can } = useAuth();
  const manage = can('roles.manage');

  const [items, setItems] = useState<Role[] | null>(null);
  const [catalog, setCatalog] = useState<Record<string, string>>({});
  const [error, setError] = useState(false);
  const [editor, setEditor] = useState<EditorState>(CLOSED);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = () =>
    adminApi
      .listRoles()
      .then((res) => {
        setItems(res.items);
        setCatalog(res.catalog);
      })
      .catch(() => setError(true));

  useEffect(() => {
    load();
  }, []);

  const groups = useMemo(() => {
    const grouped = new Map<string, Array<{ key: Permission; label: string }>>();
    for (const [key, label] of Object.entries(catalog)) {
      const prefix = key.split('.')[0];
      if (!grouped.has(prefix)) grouped.set(prefix, []);
      grouped.get(prefix)!.push({ key: key as Permission, label });
    }
    return [...grouped.entries()];
  }, [catalog]);

  const openEditor = (role: Role | null) => {
    setEditorError(null);
    setEditor({
      open: true,
      role,
      name: role?.name ?? '',
      description: role?.description ?? '',
      permissions: new Set(role?.permissions ?? []),
    });
  };

  const togglePermission = (perm: Permission) =>
    setEditor((prev) => {
      const next = new Set(prev.permissions);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return { ...prev, permissions: next };
    });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setEditorError(null);
    if (editor.name.trim().length < 2) {
      setEditorError('Enter a role name.');
      return;
    }
    if (editor.permissions.size === 0) {
      setEditorError('Select at least one permission.');
      return;
    }
    setSaving(true);
    const payload = {
      name: editor.name,
      description: editor.description,
      permissions: [...editor.permissions],
    };
    try {
      if (editor.role) {
        await adminApi.updateRole(editor.role._id, payload);
        setToast('Role updated');
      } else {
        await adminApi.createRole(payload);
        setToast('Role created');
      }
      setEditor(CLOSED);
      await load();
    } catch (err) {
      setEditorError(err instanceof ApiError ? err.message : 'Save failed — try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await adminApi.deleteRole(pendingDelete._id);
      setToast('Role deleted');
      await load();
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : 'Delete failed');
    } finally {
      setPendingDelete(null);
    }
  };

  if (error) return <Alert severity="error">Couldn’t load roles — refresh to try again.</Alert>;
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
        <Typography variant="h3">Roles</Typography>
        {manage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openEditor(null)}>
            New role
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {items.map((role) => (
          <Box key={role._id} sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ShieldOutlinedIcon sx={{ color: role.isSystem ? palette.rose : palette.ivoryMuted }} />
                <Box>
                  <Typography variant="h5" sx={{ color: palette.ivory }}>
                    {role.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                    {role.isSystem ? 'Built-in role' : 'Custom role'} · {role.userCount ?? 0} user(s)
                  </Typography>
                </Box>
              </Box>
              {manage && !role.isSystem && (
                <Box sx={{ flexShrink: 0 }}>
                  <Tooltip title="Edit role">
                    <IconButton size="small" sx={{ color: palette.ivory }} onClick={() => openEditor(role)}>
                      <EditOutlinedIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={(role.userCount ?? 0) > 0 ? 'In use — reassign users first' : 'Delete role'}>
                    <span>
                      <IconButton
                        size="small"
                        sx={{ color: palette.ivoryMuted }}
                        disabled={(role.userCount ?? 0) > 0}
                        onClick={() => setPendingDelete(role)}
                      >
                        <DeleteOutlineIcon fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Box>
            {role.description && (
              <Typography variant="body2" sx={{ color: palette.ivoryMuted, mt: 1.5 }}>
                {role.description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {role.permissions.map((perm) => (
                <Chip
                  key={perm}
                  label={perm}
                  size="small"
                  sx={{ bgcolor: 'rgba(142, 27, 99, 0.16)', color: palette.rose, textTransform: 'none', letterSpacing: 0 }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Create / edit dialog */}
      <Dialog open={editor.open} onClose={() => setEditor(CLOSED)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={save}>
          <DialogTitle>{editor.role ? `Edit ${editor.role.name}` : 'New role'}</DialogTitle>
          <DialogContent>
            {editorError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {editorError}
              </Alert>
            )}
            <TextField
              label="Role name"
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
              sx={{ mb: 3 }}
            />
            <Typography variant="overline" sx={{ color: palette.rose }}>
              Permissions
            </Typography>
            {groups.map(([prefix, perms]) => (
              <Box key={prefix} sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: palette.ivory, mb: 0.5, fontWeight: 500 }}>
                  {GROUP_LABELS[prefix] ?? prefix}
                </Typography>
                {perms.map((perm) => (
                  <FormControlLabel
                    key={perm.key}
                    sx={{ display: 'flex', alignItems: 'flex-start', ml: 0, mb: 0.5 }}
                    control={
                      <Checkbox
                        size="small"
                        checked={editor.permissions.has(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        sx={{ pt: 0 }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ color: palette.ivory }}>
                          {perm.key}
                        </Typography>
                        <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                          {perm.label}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            ))}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditor(CLOSED)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete role “{pendingDelete?.name}”?</DialogTitle>
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
