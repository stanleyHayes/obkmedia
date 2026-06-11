import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import type { AdminUser, Role } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { ListSkeleton } from '../../components/admin/Skeletons';
import { palette } from '../../theme';

interface UserFormState {
  open: boolean;
  user: AdminUser | null; // null = create
  fullName: string;
  email: string;
  password: string;
  roleId: string;
}

const FORM_CLOSED: UserFormState = { open: false, user: null, fullName: '', email: '', password: '', roleId: '' };

export default function UsersPage() {
  const { admin: me, can, setAdmin } = useAuth();
  const manage = can('users.manage');

  const [items, setItems] = useState<AdminUser[] | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState<UserFormState>(FORM_CLOSED);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    adminApi
      .listUsers()
      .then((res) => setItems(res.items))
      .catch(() => setError(true));
    // user managers also need the role list to assign roles, even without roles.view
    if (can('roles.view') || can('users.manage')) {
      adminApi
        .listRoles()
        .then((res) => setRoles(res.items))
        .catch(() => {});
    }
  }, [can]);

  const openCreate = () => {
    setFormError(null);
    setForm({ ...FORM_CLOSED, open: true });
  };

  const openEdit = (user: AdminUser) => {
    setFormError(null);
    setForm({
      open: true,
      user,
      fullName: user.fullName,
      email: user.email,
      password: '',
      roleId: user.role?.id ?? '',
    });
  };

  const openReset = (user: AdminUser) => {
    setResetError(null);
    setResetPassword('');
    setResetUser(user);
  };

  const patchItem = (updated: AdminUser) =>
    setItems((prev) => prev?.map((u) => (u.id === updated.id ? updated : u)) ?? prev);

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.roleId) {
      setFormError('Select a role for this user.');
      return;
    }
    setSaving(true);
    try {
      if (form.user) {
        const res = await adminApi.updateUser(form.user.id, {
          fullName: form.fullName,
          email: form.email,
          roleId: form.roleId,
        });
        patchItem(res.item);
        // Editing your own row must refresh the cached identity/permissions,
        // or the nav, route guards, and "signed in as" label go stale.
        if (form.user.id === me?.id) setAdmin(res.item);
        setToast('User updated');
      } else {
        if (form.password.length < 8) {
          setFormError('Password must be at least 8 characters.');
          setSaving(false);
          return;
        }
        const res = await adminApi.createUser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          roleId: form.roleId,
        });
        setItems((prev) => (prev ? [...prev, res.item] : prev));
        setToast('User created');
      }
      setForm(FORM_CLOSED);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Save failed — try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    try {
      const res = await adminApi.updateUser(user.id, { isActive: !user.isActive });
      patchItem(res.item);
      setToast(res.item.isActive ? 'User activated' : 'User deactivated');
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  const submitReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setResetError(null);
    if (resetPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    try {
      await adminApi.setUserPassword(resetUser.id, resetPassword);
      setResetUser(null);
      setResetPassword('');
      setToast('Password reset');
    } catch (err) {
      setResetError(err instanceof ApiError ? err.message : 'Reset failed — try again.');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(pendingDelete.id);
      setItems((prev) => prev?.filter((u) => u.id !== pendingDelete.id) ?? prev);
      setToast('User deleted');
      setPendingDelete(null);
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : 'Delete failed');
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <Alert severity="error">Couldn’t load users — refresh to try again.</Alert>;
  if (items === null) return <ListSkeleton rows={3} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Typography variant="h3">Users</Typography>
        {manage && (
          <Button variant="contained" startIcon={<PersonAddAltOutlinedIcon />} onClick={openCreate}>
            New user
          </Button>
        )}
      </Box>

      <Box sx={{ border: `1px solid ${palette.inkBorder}` }}>
        {items.map((user, index) => {
          const isSelf = user.id === me?.id;
          return (
            <Box
              key={user.id}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                p: 2.5,
                borderTop: index === 0 ? 'none' : `1px solid ${palette.inkBorder}`,
                opacity: user.isActive ? 1 : 0.55,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: palette.wine,
                  color: palette.ivory,
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                }}
              >
                {user.fullName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join('')}
              </Box>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: palette.ivory }}>{user.fullName}</Typography>
                  {isSelf && <Chip label="You" size="small" sx={{ bgcolor: 'transparent', border: `1px solid ${palette.rose}`, color: palette.rose }} />}
                </Box>
                <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                  {user.email}
                  {user.lastLoginAt ? ` · last sign-in ${new Date(user.lastLoginAt).toLocaleDateString()}` : ' · never signed in'}
                </Typography>
              </Box>
              <Chip
                label={user.role?.name ?? 'No role'}
                size="small"
                sx={{ bgcolor: user.role?.isSystem ? palette.wine : 'transparent', border: `1px solid ${palette.wine}`, color: palette.ivory }}
              />
              {manage && (
                <>
                  <Tooltip title={isSelf ? 'You cannot deactivate yourself' : user.isActive ? 'Active — can sign in' : 'Deactivated'}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Switch checked={user.isActive ?? true} size="small" disabled={isSelf} onChange={() => toggleActive(user)} />
                      <Typography variant="caption" sx={{ color: palette.ivoryMuted, width: 58 }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Box>
                    <Tooltip title="Edit user">
                      <IconButton sx={{ color: palette.ivory }} onClick={() => openEdit(user)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset password">
                      <IconButton sx={{ color: palette.ivory }} onClick={() => openReset(user)}>
                        <LockResetOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isSelf ? 'You cannot delete yourself' : 'Delete user'}>
                      <span>
                        <IconButton sx={{ color: palette.ivoryMuted }} disabled={isSelf} onClick={() => setPendingDelete(user)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Create / edit dialog */}
      <Dialog open={form.open} onClose={() => setForm(FORM_CLOSED)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={submitForm}>
          <DialogTitle>{form.user ? `Edit ${form.user.fullName}` : 'New user'}</DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <TextField
              label="Full name"
              fullWidth
              required
              autoFocus
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              sx={{ mt: 1, mb: 2.5 }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 2.5 }}
            />
            {!form.user && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                autoComplete="new-password"
                helperText="At least 8 characters — share it securely with the new user"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                sx={{ mb: 2.5 }}
              />
            )}
            <TextField
              select
              label="Role"
              fullWidth
              required
              value={form.roleId}
              onChange={(e) => setForm((prev) => ({ ...prev, roleId: e.target.value }))}
              helperText={form.user?.id === me?.id ? 'Careful — changing your own role takes effect immediately' : undefined}
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setForm(FORM_CLOSED)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog open={Boolean(resetUser)} onClose={() => setResetUser(null)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={submitReset}>
          <DialogTitle>Reset password — {resetUser?.fullName}</DialogTitle>
          <DialogContent>
            {resetError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {resetError}
              </Alert>
            )}
            <TextField
              label="New password"
              type="password"
              fullWidth
              required
              autoFocus
              autoComplete="new-password"
              helperText="At least 8 characters"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setResetUser(null)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Reset password
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete {pendingDelete?.fullName}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
            They will lose access immediately. This cannot be undone — consider deactivating instead.
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
