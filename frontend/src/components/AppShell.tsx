import React from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  Chip,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  ReceiptLong as AuditIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  AddCircle as CreateIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../features/auth/authSlice';

const drawerWidth = 260;

interface AppShellProps {
  currentView: string;
  onViewChange: (view: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  onViewChange,
  darkMode,
  onToggleDarkMode,
  children,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const roleName = user?.role || 'Customer';

  // Define menu items with role gates
  const menuItems = [
    { 
      text: 'Dashboard', 
      view: 'dashboard', 
      icon: <DashboardIcon />, 
      allowedRoles: ['Admin', 'Agent'] 
    },
    { 
      text: roleName === 'Customer' ? 'My Tickets' : 'Tickets Queue', 
      view: 'tickets', 
      icon: <TicketIcon />, 
      allowedRoles: ['Admin', 'Agent', 'Customer'] 
    },
    { 
      text: 'Create Ticket', 
      view: 'create-ticket', 
      icon: <CreateIcon />, 
      allowedRoles: ['Customer'] 
    },
    { 
      text: 'Audit Trail', 
      view: 'audit-logs', 
      icon: <AuditIcon />, 
      allowedRoles: ['Admin'] 
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 1. Header Topbar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 600 }}>
            {currentView === 'dashboard' && 'Dashboard Overview'}
            {currentView === 'tickets' && 'Support Tickets Command Center'}
            {currentView === 'create-ticket' && 'New Service Request'}
            {currentView === 'audit-logs' && 'Administrative Audit Logs'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme Toggle */}
            <Tooltip title="Toggle dark/light mode">
              <IconButton onClick={onToggleDarkMode} color="inherit">
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            {/* Profile Avatar Card */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                {user?.fullName?.charAt(0) || <ProfileIcon />}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.fullName}
                </Typography>
                <Chip 
                  label={roleName} 
                  size="small" 
                  color={roleName === 'Admin' ? 'error' : roleName === 'Agent' ? 'primary' : 'success'}
                  sx={{ height: 16, fontSize: '0.65rem', mt: 0.2, fontWeight: 700 }}
                />
              </Box>
            </Box>

            {/* Logout Button */}
            <Tooltip title="Log out session">
              <IconButton onClick={handleLogout} color="error" sx={{ ml: 1 }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 2. Responsive Persistent Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
          open
        >
          <Box>
            {/* Branding Logo Area */}
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" sx={{ letterSpacing: '0.15em', textTransform: 'uppercase', color: 'primary.main', fontWeight: 800 }}>
                Helpdesk SaaS
              </Typography>
              <Typography variant="h2" component="h1" sx={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Acme Cloud Portal
              </Typography>
            </Box>
            <Divider />

            {/* Navigation Lists */}
            <List sx={{ px: 2, py: 2 }}>
              {menuItems
                .filter((item) => item.allowedRoles.includes(roleName))
                .map((item) => {
                  const isActive = currentView === item.view;
                  return (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        onClick={() => onViewChange(item.view)}
                        selected={isActive}
                        sx={{
                          borderRadius: '8px',
                          bgcolor: isActive ? 'primary.light' : 'transparent',
                          color: isActive ? '#ffffff' : 'text.primary',
                          '&:hover': {
                            bgcolor: isActive ? 'primary.main' : 'action.hover',
                            color: isActive ? '#ffffff' : 'text.primary',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: '#ffffff',
                            '& .MuiListItemIcon-root': {
                              color: '#ffffff',
                            },
                          },
                          '& .MuiListItemIcon-root': {
                            color: isActive ? '#ffffff' : 'text.secondary',
                            minWidth: 40,
                          },
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }}>
                              {item.text}
                            </Typography>
                          } 
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
            </List>
          </Box>

          {/* Footer Sidebar Context */}
          <Box sx={{ mt: 'auto', p: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              v1.0.0 Stable Build
            </Typography>
          </Box>
        </Drawer>
      </Box>

      {/* 3. Main Workspace Context Rendering */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Offset header toolbar height
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
