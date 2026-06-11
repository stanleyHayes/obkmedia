import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import MarkChatReadOutlinedIcon from '@mui/icons-material/MarkChatReadOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link as RouterLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../admin/NotificationsContext';
import type { Permission } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import NotificationBell from '../components/admin/NotificationBell';
import SplashScreen from '../components/SplashScreen';
import ThemeToggle from '../components/ThemeToggle';
import ForcePasswordReset from '../pages/admin/ForcePasswordReset';
import { palette } from '../theme';

const DRAWER_WIDTH = 256;
const RAIL_WIDTH = 76;
const COLLAPSED_KEY = 'obk-admin-nav-collapsed';
const GROUPS_KEY = 'obk-admin-nav-groups';

interface NavChild {
  label: string;
  to: string;
  icon: ReactNode;
  exact?: boolean;
  permission?: Permission;
}

interface NavGroup {
  key: string;
  label: string;
  icon: ReactNode;
  children: NavChild[];
}

const GROUPS: NavGroup[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <SpaceDashboardOutlinedIcon />,
    children: [{ label: 'Dashboard', to: '/admin', icon: <SpaceDashboardOutlinedIcon />, exact: true }],
  },
  {
    key: 'content',
    label: 'Content',
    icon: <PhotoLibraryOutlinedIcon />,
    children: [
      { label: 'Portfolio', to: '/admin/portfolio', icon: <CollectionsOutlinedIcon />, permission: 'portfolio.view' },
      { label: 'Categories', to: '/admin/categories', icon: <CategoryOutlinedIcon />, permission: 'categories.view' },
    ],
  },
  {
    key: 'inbox',
    label: 'Inbox',
    icon: <MailOutlineIcon />,
    children: [{ label: 'Messages', to: '/admin/messages', icon: <InboxOutlinedIcon />, permission: 'messages.view' }],
  },
  {
    key: 'administration',
    label: 'Administration',
    icon: <AdminPanelSettingsOutlinedIcon />,
    children: [
      { label: 'Users', to: '/admin/users', icon: <PeopleOutlinedIcon />, permission: 'users.view' },
      { label: 'Roles', to: '/admin/roles', icon: <ShieldOutlinedIcon />, permission: 'roles.view' },
    ],
  },
  {
    key: 'account',
    label: 'Account',
    icon: <AccountCircleOutlinedIcon />,
    children: [{ label: 'My profile', to: '/admin/profile', icon: <ManageAccountsOutlinedIcon /> }],
  },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode etc. — non-fatal
  }
}

function isChildActive(child: NavChild, pathname: string): boolean {
  return child.exact ? pathname === child.to : pathname.startsWith(child.to);
}

export default function AdminLayout() {
  const { admin, loading, logout, can } = useAuth();
  const { count: unread, latest, clearLatest } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => readStorage(COLLAPSED_KEY, false));
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => readStorage(GROUPS_KEY, {}));

  // Only groups with at least one permitted child are shown.
  const visibleGroups = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        children: group.children.filter((child) => !child.permission || can(child.permission)),
      })).filter((group) => group.children.length > 0),
    [can],
  );

  // A group is open unless explicitly closed; the group holding the active
  // route is forced open so the current page is always visible.
  const isGroupOpen = (group: NavGroup): boolean => {
    if (group.children.some((child) => isChildActive(child, location.pathname))) return true;
    return openGroups[group.key] ?? true;
  };

  useEffect(() => {
    writeStorage(GROUPS_KEY, openGroups);
  }, [openGroups]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      writeStorage(COLLAPSED_KEY, !prev);
      return !prev;
    });
  };

  const toggleGroup = (group: NavGroup) =>
    setOpenGroups((prev) => ({ ...prev, [group.key]: !isGroupOpen(group) }));

  if (loading) return <SplashScreen />;

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  // A generated/admin-set password must be changed before reaching the dashboard.
  if (admin.mustResetPassword) {
    return <ForcePasswordReset />;
  }

  // Show the unread count as a badge on the Messages nav item.
  const navIcon = (child: NavChild) =>
    child.to === '/admin/messages' && unread > 0 ? (
      <Badge
        badgeContent={unread}
        max={99}
        sx={{ '& .MuiBadge-badge': { bgcolor: palette.wineBright, color: palette.ivory, fontSize: '0.6rem', minWidth: 16, height: 16 } }}
      >
        {child.icon}
      </Badge>
    ) : (
      child.icon
    );

  /** Full sidebar: groups with icon headers, children threaded below. */
  const expandedNav = (
    <List sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}>
      {visibleGroups.map((group) => {
        const open = isGroupOpen(group);
        const groupActive = group.children.some((child) => isChildActive(child, location.pathname));
        return (
          <Box key={group.key} sx={{ mb: 0.5 }}>
            <ListItemButton onClick={() => toggleGroup(group)} sx={{ py: 0.75 }}>
              <ListItemIcon sx={{ color: groupActive ? palette.rose : palette.ivoryMuted, minWidth: 38 }}>
                {group.icon}
              </ListItemIcon>
              <ListItemText
                primary={group.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '0.72rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: groupActive ? palette.ivory : palette.ivoryMuted,
                    },
                  },
                }}
              />
              {open ? (
                <ExpandLessIcon sx={{ fontSize: '1rem', color: palette.ivoryMuted }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: '1rem', color: palette.ivoryMuted }} />
              )}
            </ListItemButton>
            <Collapse in={open} timeout={240} unmountOnExit>
              {/* Thread: vertical guide line under the group icon, ticks into each child. */}
              <Box
                sx={{
                  position: 'relative',
                  ml: '29px',
                  mr: 0.5,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 17,
                    width: '1px',
                    bgcolor: palette.inkBorder,
                  },
                }}
              >
                {group.children.map((child) => {
                  const selected = isChildActive(child, location.pathname);
                  return (
                    <ListItemButton
                      key={child.to}
                      component={RouterLink}
                      to={child.to}
                      selected={selected}
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        py: 0.6,
                        pl: '20px',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          width: '13px',
                          height: '1px',
                          bgcolor: selected ? palette.wineBright : palette.inkBorder,
                        },
                        '&.Mui-selected': { bgcolor: 'rgba(142, 27, 99, 0.2)' },
                        '&.Mui-selected:hover': { bgcolor: 'rgba(142, 27, 99, 0.3)' },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 30,
                          color: selected ? palette.rose : palette.ivoryMuted,
                          '& svg': { fontSize: '1.05rem' },
                        }}
                      >
                        {navIcon(child)}
                      </ListItemIcon>
                      <ListItemText
                        primary={child.label}
                        slotProps={{
                          primary: {
                            sx: { fontSize: '0.9rem', color: selected ? palette.ivory : palette.ivoryMuted },
                          },
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </List>
  );

  /** Icon rail: every permitted page as an icon button, groups separated by dividers. */
  const railNav = (
    <List sx={{ px: 0, flex: 1, overflowY: 'auto' }}>
      {visibleGroups.map((group, groupIndex) => (
        <Box key={group.key}>
          {groupIndex > 0 && <Divider sx={{ my: 0.75, mx: 2, borderColor: palette.inkBorder }} />}
          {group.children.map((child) => {
            const selected = isChildActive(child, location.pathname);
            return (
              <Tooltip key={child.to} title={`${group.label} — ${child.label}`} placement="right">
                <ListItemButton
                  component={RouterLink}
                  to={child.to}
                  selected={selected}
                  sx={{
                    justifyContent: 'center',
                    py: 1.1,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(142, 27, 99, 0.2)',
                      borderLeft: `2px solid ${palette.wineBright}`,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 0, color: selected ? palette.rose : palette.ivoryMuted, justifyContent: 'center' }}
                  >
                    {navIcon(child)}
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            );
          })}
        </Box>
      ))}
    </List>
  );

  const drawerContent = (isRail: boolean) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: isRail ? 1 : 3, justifyContent: isRail ? 'center' : 'space-between', gap: 1 }}>
        {isRail ? (
          <Typography variant="h6" sx={{ letterSpacing: '0.1em', color: palette.rose, fontStyle: 'italic' }}>
            O
          </Typography>
        ) : (
          <Typography variant="h6" sx={{ letterSpacing: '0.14em', whiteSpace: 'nowrap' }}>
            OBK{' '}
            <Box component="span" sx={{ color: palette.rose, fontStyle: 'italic' }}>
              ADMIN
            </Box>
          </Typography>
        )}
        <Tooltip title={isRail ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <IconButton
            aria-label={isRail ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleCollapsed}
            size="small"
            sx={{
              color: palette.ivoryMuted,
              display: { xs: 'none', md: 'inline-flex' },
              ...(isRail && { position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)' }),
            }}
          >
            {isRail ? <KeyboardDoubleArrowRightIcon fontSize="small" /> : <KeyboardDoubleArrowLeftIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      {isRail ? railNav : expandedNav}

      <List sx={{ px: isRail ? 0 : 1.5, pb: isRail ? 6 : 2 }}>
        <Tooltip title={isRail ? 'View website' : ''} placement="right">
          <ListItemButton component="a" href="/" target="_blank" rel="noopener" sx={{ justifyContent: isRail ? 'center' : 'flex-start' }}>
            <ListItemIcon sx={{ color: palette.ivoryMuted, minWidth: isRail ? 0 : 38, justifyContent: isRail ? 'center' : 'flex-start' }}>
              <OpenInNewIcon fontSize="small" />
            </ListItemIcon>
            {!isRail && <ListItemText primary="View website" slotProps={{ primary: { sx: { fontSize: '0.9rem' } } }} />}
          </ListItemButton>
        </Tooltip>
        <Tooltip title={isRail ? 'Log out' : ''} placement="right">
          <ListItemButton
            onClick={async () => {
              await logout();
              navigate('/admin/login');
            }}
            sx={{ justifyContent: isRail ? 'center' : 'flex-start' }}
          >
            <ListItemIcon sx={{ color: palette.ivoryMuted, minWidth: isRail ? 0 : 38, justifyContent: isRail ? 'center' : 'flex-start' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {!isRail && <ListItemText primary="Log out" slotProps={{ primary: { sx: { fontSize: '0.9rem' } } }} />}
          </ListItemButton>
        </Tooltip>
      </List>
    </Box>
  );

  const desktopWidth = collapsed ? RAIL_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { md: 'none' },
          bgcolor: palette.inkRaised,
          borderBottom: `1px solid ${palette.inkBorder}`,
        }}
      >
        <Toolbar>
          <IconButton aria-label="Open admin menu" onClick={() => setMobileOpen(true)} sx={{ color: palette.ivory, mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1 }}>OBK Admin</Typography>
          <ThemeToggle />
          {can('messages.view') && <NotificationBell />}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer always shows the full grouped navigation. */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
        slotProps={{ paper: { sx: { width: DRAWER_WIDTH, bgcolor: palette.inkRaised } } }}
      >
        {drawerContent(false)}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: desktopWidth,
          flexShrink: 0,
          transition: 'width 240ms ease',
          '& .MuiDrawer-paper': {
            width: desktopWidth,
            overflowX: 'hidden',
            transition: 'width 240ms ease',
            bgcolor: palette.inkRaised,
            borderRight: `1px solid ${palette.inkBorder}`,
          },
        }}
        open
      >
        {drawerContent(collapsed)}
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: { xs: 2.5, md: 4 }, mt: { xs: 8, md: 0 }, minWidth: 0 }}>
        <Toolbar sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', gap: 1.5, px: '0 !important' }}>
          <Tooltip title={`${admin.email} · ${admin.role?.name ?? 'No role'}`}>
            <Typography
              component={RouterLink}
              to="/admin/profile"
              variant="body2"
              sx={{ color: palette.ivoryMuted, textDecoration: 'none', '&:hover': { color: palette.rose } }}
            >
              Signed in as <Box component="span" sx={{ color: palette.ivory }}>{admin.fullName}</Box>
            </Typography>
          </Tooltip>
          <ThemeToggle />
          {can('messages.view') && <NotificationBell />}
        </Toolbar>
        <Outlet />
      </Box>

      {/* WhatsApp-style toast when a new inquiry arrives. */}
      <Snackbar
        open={Boolean(latest)}
        autoHideDuration={7000}
        onClose={clearLatest}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          icon={<MarkChatReadOutlinedIcon fontSize="small" />}
          severity="success"
          variant="filled"
          onClose={clearLatest}
          action={
            <Box
              component="button"
              onClick={() => {
                clearLatest();
                navigate('/admin/messages');
              }}
              sx={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', mr: 1 }}
            >
              View
            </Box>
          }
          sx={{ bgcolor: '#1faf57', color: '#fff', '& .MuiAlert-icon': { color: '#fff' }, alignItems: 'center' }}
        >
          New inquiry from {latest?.fullName}
          {latest?.shootType ? ` · ${latest.shootType}` : ''}
        </Alert>
      </Snackbar>
    </Box>
  );
}
