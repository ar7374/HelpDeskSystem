import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Grid, 
  CircularProgress,
  InputAdornment,
  Divider,
  Chip
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Business as TenantIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginThunk } from './authThunks';
import { clearError } from './authSlice';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({
    tenantSlug: 'acme-cloud', // Default prefilled matching the database seed Slug
    email: '',
    password: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Default hardcoded tenant ID from seeds
  const SEED_TENANT_ID = '2f39f1f7-8895-4ad2-95f7-8f70e5f02571';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (validationError) setValidationError(null);
    dispatch(clearError());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    dispatch(loginThunk({
      tenantId: SEED_TENANT_ID, // Use the seeded Acme tenant ID
      email: form.email.trim(),
      password: form.password,
    }));
  };

  // Demo Bypass Accounts Quick-Login
  const handleQuickLogin = (email: string, pass: string) => {
    setValidationError(null);
    dispatch(clearError());
    
    // Fill state
    setForm({
      tenantSlug: 'acme-cloud',
      email,
      password: pass,
    });

    // Execute immediately for testing speed
    dispatch(loginThunk({
      tenantId: SEED_TENANT_ID,
      email,
      password: pass,
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0f172a 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: 440,
          maxWidth: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
          backdropFilter: 'blur(20px)',
          bgcolor: 'rgba(30, 41, 59, 0.75)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header Branding */}
          <Box sx={{ textAlignment: 'center', mb: 4, textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', mb: 1 }}>
              Helpdesk Portal
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
              SaaS Multi-Tenant Operations Console
            </Typography>
          </Box>

          {/* Validation/API error alerts */}
          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {validationError || error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="tenantSlug"
              label="Tenant Slug"
              name="tenantSlug"
              value={form.tenantSlug}
              onChange={handleChange}
              disabled // Locked to seeded tenant for demo simplicity
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TenantIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
                    </InputAdornment>
                  ),
                  style: { color: '#ffffff' }
                }
              }}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
                    </InputAdornment>
                  ),
                  style: { color: '#ffffff' }
                }
              }}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
                    </InputAdornment>
                  ),
                  style: { color: '#ffffff' }
                }
              }}
              sx={{
                mb: 3,
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 2,
                mb: 4,
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Chip 
              label="Quick Demo Logins" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)', 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontWeight: 600,
                fontSize: '0.75rem'
              }} 
            />
          </Divider>

          {/* Quick Demo Credentials bypass grid */}
          <Grid container spacing={1.5}>
            <Grid size={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleQuickLogin('nisha@acme.test', 'Admin@123')}
                sx={{
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  bgcolor: 'rgba(239, 68, 68, 0.05)',
                  '&:hover': {
                    borderColor: '#ef4444',
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                  },
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                🔑 Nisha (System Admin)
              </Button>
            </Grid>

            <Grid size={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleQuickLogin('rahul@acme.test', 'Agent@123')}
                sx={{
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                  color: '#c7d2fe',
                  bgcolor: 'rgba(99, 102, 241, 0.05)',
                  '&:hover': {
                    borderColor: '#6366f1',
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                  },
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                ⚡ Rahul (Support Agent)
              </Button>
            </Grid>

            <Grid size={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleQuickLogin('priya@client.test', 'Customer@123')}
                sx={{
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: '#a7f3d0',
                  bgcolor: 'rgba(16, 185, 129, 0.05)',
                  '&:hover': {
                    borderColor: '#10b981',
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                  },
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                👤 Priya (Customer)
              </Button>
            </Grid>

            <Grid size={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleQuickLogin('arjun@client.test', 'Customer@123')}
                sx={{
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: '#a7f3d0',
                  bgcolor: 'rgba(16, 185, 129, 0.05)',
                  '&:hover': {
                    borderColor: '#10b981',
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                  },
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                👤 Arjun (Customer)
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
