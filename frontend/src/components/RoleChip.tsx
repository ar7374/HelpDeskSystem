import React from 'react';
import { Chip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  SupportAgent as AgentIcon,
  Person as CustomerIcon
} from '@mui/icons-material';

interface RoleChipProps {
  role: string;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

export const RoleChip: React.FC<RoleChipProps> = ({ role, size = 'small', sx }) => {
  switch (role) {
    case 'Admin':
      return (
        <Chip
          icon={<AdminIcon style={{ fontSize: size === 'small' ? 14 : 16 }} />}
          label="Admin"
          size={size}
          color="error"
          variant="outlined"
          sx={{ fontWeight: 700, borderRadius: 2, ...sx }}
        />
      );
    case 'Agent':
      return (
        <Chip
          icon={<AgentIcon style={{ fontSize: size === 'small' ? 14 : 16 }} />}
          label="Support Agent"
          size={size}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700, borderRadius: 2, ...sx }}
        />
      );
    case 'Customer':
      return (
        <Chip
          icon={<CustomerIcon style={{ fontSize: size === 'small' ? 14 : 16 }} />}
          label="Customer Client"
          size={size}
          color="success"
          variant="outlined"
          sx={{ fontWeight: 700, borderRadius: 2, ...sx }}
        />
      );
    default:
      return (
        <Chip
          label={role}
          size={size}
          sx={{ ...sx }}
        />
      );
  }
};
