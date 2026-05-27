import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material';

interface AppButtonProps extends ButtonProps {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  isLoading = false,
  icon,
  sx,
  ...rest
}) => {
  return (
    <Button
      {...rest}
      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : icon || rest.startIcon}
      disabled={isLoading || rest.disabled}
      sx={{
        fontWeight: 700,
        borderRadius: 2,
        textTransform: 'none',
        ...sx,
      }}
    >
      {children}
    </Button>
  );
};
