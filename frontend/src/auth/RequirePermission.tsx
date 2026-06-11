import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import type { Permission } from '../api/types';
import { useAuth } from './AuthContext';

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
}

/** Route-level guard: renders children only when the user holds the permission. */
export default function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { can } = useAuth();
  if (!can(permission)) {
    return (
      <Box sx={{ maxWidth: 560 }}>
        <Alert severity="warning">
          You don’t have access to this page. Ask an owner to update your role if you believe
          this is a mistake.
        </Alert>
      </Box>
    );
  }
  return <>{children}</>;
}
