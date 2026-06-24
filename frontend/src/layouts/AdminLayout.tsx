import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import MarkChatReadOutlinedIcon from '@mui/icons-material/MarkChatReadOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import Snackbar from '@mui/material/Snackbar';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { Link as RouterLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../admin/NotificationsContext';
import type { Permission } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import ObkLogo from '../components/ObkLogo';
import NotificationBell from '../components/admin/NotificationBell';
import SplashScreen from '../components/SplashScreen';
import ThemeToggle from '../components/ThemeToggle';
import ForcePasswordReset from '../pages/admin/ForcePasswordReset';
import { onDark, palette } from '../theme';

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

interface AccountMenuItem {
  title: string;
  description: string;
  icon: ReactNode;
  to?: string;
  href?: string;
  external?: boolean;
  danger?: boolean;
  permission?: Permission;
  onSelect?: () => void | Promise<void>;
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
      { label: 'Site content', to: '/admin/settings', icon: <WebOutlinedIcon />, permission: 'settings.view' },
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
    children: [
      { label: 'Profile', to: '/admin/profile', icon: <ManageAccountsOutlinedIcon /> },
      { label: 'Update password', to: '/admin/security', icon: <KeyOutlinedIcon /> },
      { label: 'Settings', to: '/admin/preferences', icon: <TuneOutlinedIcon /> },
    ],
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
  const [accountAnchorEl, setAccountAnchorEl] = useState<HTMLElement | null>(null);
  const [tourOpen, setTourOpen] = useState(false);

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

  const closeAccountMenu = () => setAccountAnchorEl(null);
  const openAccountMenu = (event: MouseEvent<HTMLElement>) => setAccountAnchorEl(event.currentTarget);
  const accountMenuOpen = Boolean(accountAnchorEl);
  const accountInitials = admin.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const startTour = () => {
    closeAccountMenu();
    setTourOpen(true);
  };

  const handleLogout = async () => {
    closeAccountMenu();
    await logout();
    navigate('/admin/login');
  };

  const accountMenuItems = ([
    {
      title: 'Show me around',
      description: 'A quick guide to the dashboard, content tools, inbox, and account controls.',
      icon: <TravelExploreOutlinedIcon />,
      onSelect: startTour,
    },
    {
      title: 'Help',
      description: 'Email a support note or handoff question for this workspace.',
      icon: <HelpOutlineOutlinedIcon />,
      href: 'mailto:Obkmedia30@gmail.com?subject=OBK%20MEDIA%20admin%20help',
    },
    {
      title: 'View website',
      description: 'Open the public OBK MEDIA website in a new tab.',
      icon: <OpenInNewIcon />,
      href: '/',
      external: true,
    },
    {
      title: 'Log out',
      description: 'End this admin session safely.',
      icon: <LogoutIcon />,
      danger: true,
      onSelect: handleLogout,
    },
  ] as AccountMenuItem[]).filter((item) => !item.permission || can(item.permission));

  const accountMenuItemSx = (danger = false) => ({
    alignItems: 'flex-start',
    gap: 1.4,
    px: 2,
    py: 1.35,
    color: danger ? '#ffc3d9' : palette.ivory,
    borderTop: `1px solid ${palette.inkBorder}`,
    textDecoration: 'none',
    '&:hover': {
      bgcolor: danger ? 'rgba(178, 40, 93, 0.2)' : 'rgba(255, 255, 255, 0.06)',
      color: danger ? '#ffd9e7' : palette.rose,
    },
  });

  const accountMenuIconSx = (danger = false) => ({
    minWidth: 0,
    width: 38,
    height: 38,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    color: danger ? '#ffc3d9' : palette.rose,
    bgcolor: danger ? 'rgba(178, 40, 93, 0.22)' : 'rgba(142, 27, 99, 0.18)',
    border: `1px solid ${danger ? 'rgba(255, 195, 217, 0.3)' : palette.inkBorder}`,
    '& svg': { fontSize: '1.18rem' },
  });

  const renderAccountMenuItem = (item: AccountMenuItem) => {
    const content = (
      <>
        <ListItemIcon sx={accountMenuIconSx(item.danger)}>{item.icon}</ListItemIcon>
        <ListItemText
          primary={item.title}
          secondary={item.description}
          slotProps={{
            primary: {
              sx: {
                color: item.danger ? '#ffc3d9' : palette.ivory,
                fontSize: '0.94rem',
                fontWeight: 600,
                letterSpacing: 0,
              },
            },
            secondary: {
              sx: {
                color: palette.ivoryMuted,
                fontSize: '0.78rem',
                lineHeight: 1.45,
                mt: 0.25,
              },
            },
          }}
        />
      </>
    );

    if (item.to) {
      return (
        <ListItemButton key={item.title} component={RouterLink} to={item.to} onClick={closeAccountMenu} sx={accountMenuItemSx(item.danger)}>
          {content}
        </ListItemButton>
      );
    }

    if (item.href) {
      return (
        <ListItemButton
          key={item.title}
          component="a"
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener' : undefined}
          onClick={closeAccountMenu}
          sx={accountMenuItemSx(item.danger)}
        >
          {content}
        </ListItemButton>
      );
    }

    return (
      <ListItemButton
        key={item.title}
        component="button"
        type="button"
        onClick={() => void item.onSelect?.()}
        sx={{
          ...accountMenuItemSx(item.danger),
          width: '100%',
          borderRight: 0,
          borderBottom: 0,
          borderLeft: 0,
          font: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        {content}
      </ListItemButton>
    );
  };

  // Show the unread count as a badge on the Messages nav item.
  const navIcon = (child: NavChild) =>
    child.to === '/admin/messages' && unread > 0 ? (
      <Badge
        badgeContent={unread}
        max={99}
        sx={{ '& .MuiBadge-badge': { bgcolor: palette.wineBright, color: onDark.ivory, fontSize: '0.6rem', minWidth: 16, height: 16 } }}
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
      <Toolbar
        sx={{
          px: isRail ? 1 : 3,
          minHeight: isRail ? '118px !important' : undefined,
          justifyContent: isRail ? 'center' : 'space-between',
          alignItems: 'center',
          flexDirection: isRail ? 'column' : 'row',
          gap: isRail ? 1.1 : 1,
        }}
      >
        {isRail ? (
          <ObkLogo sx={{ height: 26 }} />
        ) : (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <ObkLogo sx={{ height: 30 }} />
            <Typography
              component="span"
              sx={{ color: palette.ivoryMuted, fontWeight: 600, letterSpacing: '0.26em', fontSize: '0.64rem' }}
            >
              ADMIN
            </Typography>
          </Box>
        )}
        <Tooltip title={isRail ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <IconButton
            aria-label={isRail ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleCollapsed}
            size="small"
            sx={{
              color: palette.ivoryMuted,
              display: { xs: 'none', md: 'inline-flex' },
              ...(isRail && {
                width: 34,
                height: 34,
                border: `1px solid ${palette.inkBorder}`,
                bgcolor: palette.ink,
                '&:hover': { bgcolor: 'rgba(142, 27, 99, 0.14)', color: palette.rose },
              }),
            }}
          >
            {isRail ? <KeyboardDoubleArrowRightIcon fontSize="small" /> : <KeyboardDoubleArrowLeftIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      {isRail ? railNav : expandedNav}

      {!isRail && (
        <Box sx={{ px: 3, pb: 2.5, color: palette.ivoryMuted, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Workspace tools
        </Box>
      )}
    </Box>
  );

  const desktopWidth = collapsed ? RAIL_WIDTH : DRAWER_WIDTH;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: palette.ink,
        backgroundImage: `radial-gradient(ellipse at 12% 0%, rgba(142, 27, 99, 0.16), transparent 34%), radial-gradient(ellipse at 92% 12%, ${palette.decor}, transparent 32%)`,
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { md: 'none' },
          bgcolor: palette.inkRaised,
          // AppBar's default text color is primary.contrastText (fixed light) —
          // pin it to the flipping token so it stays legible in light mode.
          color: palette.ivory,
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
          <Tooltip title="Admin menu">
            <IconButton aria-label="Open admin account menu" onClick={openAccountMenu} sx={{ color: palette.ivory, ml: 0.5 }}>
              <AccountCircleOutlinedIcon />
            </IconButton>
          </Tooltip>
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
            backgroundImage: `linear-gradient(180deg, ${palette.decor}, transparent 42%)`,
            borderRight: `1px solid ${palette.inkBorder}`,
          },
        }}
        open
      >
        {drawerContent(collapsed)}
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: { xs: 2.5, md: 4 }, mt: { xs: 8, md: 0 }, minWidth: 0 }}>
        <Box sx={{ maxWidth: 1540, mx: 'auto' }}>
          <Toolbar sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', gap: 1.5, px: '0 !important' }}>
            <Box>
              <Typography variant="caption" sx={{ color: palette.rose, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                OBK MEDIA
              </Typography>
              <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                Admin workspace
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ThemeToggle />
              {can('messages.view') && <NotificationBell />}
              <Tooltip title={`${admin.email} · ${admin.role?.name ?? 'No role'}`}>
                <Button
                  type="button"
                  onClick={openAccountMenu}
                  endIcon={<ExpandMoreIcon sx={{ fontSize: '1rem !important' }} />}
                  sx={{
                    minHeight: 44,
                    borderRadius: 999,
                    border: `1px solid ${palette.inkBorder}`,
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                    color: palette.ivory,
                    textTransform: 'none',
                    px: 1.2,
                    py: 0.65,
                    gap: 1,
                    '&:hover': { bgcolor: 'rgba(142, 27, 99, 0.16)', borderColor: palette.wineBright },
                    '& .MuiButton-endIcon': { ml: 0.2, color: palette.ivoryMuted },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: palette.wine,
                      color: onDark.ivory,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {accountInitials || 'A'}
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'left', minWidth: 0 }}>
                    <Typography component="span" sx={{ display: 'block', color: palette.rose, fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', lineHeight: 1.1 }}>
                      Admin menu
                    </Typography>
                    <Typography component="span" sx={{ display: 'block', color: palette.ivory, fontSize: '0.86rem', maxWidth: 154, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25 }}>
                      {admin.fullName}
                    </Typography>
                  </Box>
                </Button>
              </Tooltip>
            </Box>
          </Toolbar>
          <Outlet />
        </Box>
      </Box>

      <Menu
        anchorEl={accountAnchorEl}
        open={accountMenuOpen}
        onClose={closeAccountMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.2,
              width: 382,
              maxWidth: 'calc(100vw - 24px)',
              bgcolor: palette.inkRaised,
              color: palette.ivory,
              border: `1px solid ${palette.inkBorder}`,
              backgroundImage: `radial-gradient(circle at 0% 0%, ${palette.decor}, transparent 48%)`,
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.38)',
              overflow: 'hidden',
            },
          },
          list: { sx: { py: 0 } },
        }}
      >
        <Box sx={{ px: 2, py: 1.8 }}>
          <Typography sx={{ color: palette.rose, fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Signed in
          </Typography>
          <Typography sx={{ color: palette.ivory, fontWeight: 700, mt: 0.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {admin.fullName}
          </Typography>
          <Typography sx={{ color: palette.ivoryMuted, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {admin.email} · {admin.role?.name ?? 'No role'}
          </Typography>
        </Box>
        {accountMenuItems.map(renderAccountMenuItem)}
      </Menu>

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

      <Snackbar
        open={tourOpen}
        autoHideDuration={9000}
        onClose={() => setTourOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          icon={<TravelExploreOutlinedIcon fontSize="small" />}
          severity="info"
          variant="filled"
          onClose={() => setTourOpen(false)}
          sx={{
            bgcolor: palette.wine,
            color: onDark.ivory,
            maxWidth: 430,
            '& .MuiAlert-icon, & .MuiAlert-action': { color: onDark.ivory },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>Show me around</Typography>
          <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
            Start at Dashboard for the pulse, Portfolio for galleries, Messages for inquiries, and this admin menu for profile, password, settings, help, website access, and logout.
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}
