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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Business as TenantIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginThunk } from './authThunks';
import { clearError, loginSuccess } from './authSlice';
import { axiosClient } from '../../shared/api/axiosClient';
import { RegisterCompanyPage } from './RegisterCompanyPage';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [form, setForm] = useState({
    tenantSlug: 'acme-cloud', // Default prefilled matching the database seed Slug
    email: '',
    password: '',
  });

  // Google Login simulated state variables
  const [validationError, setValidationError] = useState<string | null>(null);
  const [googleOpen, setGoogleOpen] = useState<boolean>(false);
  const [googleEmailInput, setGoogleEmailInput] = useState<string>('');
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const handleGoogleSubmit = async (googleEmail: string) => {
    if (!form.tenantSlug) {
      setValidationError('Please enter your Tenant Slug first.');
      setGoogleOpen(false);
      return;
    }

    try {
      setValidationError(null);
      dispatch(clearError());
      setGoogleLoading(true);

      // 1. Resolve Tenant ID by Slug
      const tenantRes = await axiosClient.get(`/api/auth/tenant/${form.tenantSlug.trim()}`);
      if (tenantRes.data && tenantRes.data.status && tenantRes.data.data) {
        const tenantId = tenantRes.data.data.id;

        // 2. Perform Google Login validation against pre-registered corporate email
        const response = await axiosClient.post('/api/auth/google-login', {
          credentialToken: googleEmail.trim().toLowerCase(),
          tenantId
        });

        const apiResponse = response.data;
        if (apiResponse.status && apiResponse.data) {
          const loginData = apiResponse.data;

          // Save credentials in session
          localStorage.setItem('accessToken', loginData.token);
          localStorage.setItem('refreshToken', loginData.refreshToken);
          localStorage.setItem('currentUser', JSON.stringify(loginData.user));

          // Set state
          dispatch(loginSuccess(loginData));
          setGoogleOpen(false);
        } else {
          setValidationError(apiResponse.message || 'Google authentication failed.');
        }
      } else {
        setValidationError('Invalid workspace slug. Company verification failed.');
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Google account not registered under this company.';
      setValidationError(errMsg);
      setGoogleOpen(false);
    } finally {
      setGoogleLoading(false);
    }
  };

  const DEMO_SUPER = {
    email: 'super@support.test',
    password: 'Super@123'
  };

  const DEMO_ADMIN = {
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'nisha@acme.test',
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'Admin@123'
  };

  const DEMO_AGENT = {
    email: import.meta.env.VITE_DEMO_AGENT_EMAIL || 'rahul@acme.test',
    password: import.meta.env.VITE_DEMO_AGENT_PASSWORD || 'Agent@123'
  };

  const DEMO_CUSTOMER_1 = {
    email: import.meta.env.VITE_DEMO_CUSTOMER_1_EMAIL || 'priya@client.test',
    password: import.meta.env.VITE_DEMO_CUSTOMER_1_PASSWORD || 'Customer@123'
  };

  const DEMO_CUSTOMER_2 = {
    email: import.meta.env.VITE_DEMO_CUSTOMER_2_EMAIL || 'arjun@client.test',
    password: import.meta.env.VITE_DEMO_CUSTOMER_2_PASSWORD || 'Customer@123'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (validationError) setValidationError(null);
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.tenantSlug) {
      setValidationError('Please enter a Tenant Slug.');
      return;
    }

    if (!form.email || !form.password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    try {
      setValidationError(null);
      dispatch(clearError());
      
      // Query backend dynamically to resolve the tenantSlug to a TenantId Guid
      const response = await axiosClient.get(`/api/auth/tenant/${form.tenantSlug.trim()}`);
      const apiResponse = response.data;
      
      if (apiResponse.status && apiResponse.data) {
        const resolvedTenantId = apiResponse.data.id;
        
        // Dispatch the login using the resolved dynamic tenant Guid
        dispatch(loginThunk({
          tenantId: resolvedTenantId,
          email: form.email.trim(),
          password: form.password,
        }));
      } else {
        setValidationError('Invalid workspace slug or workspace details not found.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid Tenant Slug. This workspace could not be verified.';
      setValidationError(errMsg);
    }
  };

  // Demo Bypass Accounts Quick-Login
  const handleQuickLogin = async (email: string, pass: string, slug: string = 'acme-cloud') => {
    setValidationError(null);
    dispatch(clearError());
    
    // Fill state
    setForm({
      tenantSlug: slug,
      email,
      password: pass,
    });

    try {
      // Query backend dynamically to resolve the slug
      const response = await axiosClient.get(`/api/auth/tenant/${slug}`);
      const apiResponse = response.data;
      
      if (apiResponse.status && apiResponse.data) {
        const resolvedTenantId = apiResponse.data.id;
        dispatch(loginThunk({
          tenantId: resolvedTenantId,
          email,
          password: pass,
        }));
      }
    } catch (err) {
      setValidationError(`Failed to dynamically resolve demo tenant slug ${slug}.`);
    }
  };

  if (showRegister) {
    return (
      <RegisterCompanyPage 
        onBackToLogin={(prefilledSlug) => {
          if (prefilledSlug) {
            setForm((prev) => ({ ...prev, tenantSlug: prefilledSlug, email: '', password: '' }));
          }
          setShowRegister(false);
        }}
      />
    );
  }

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
          <Box sx={{ mb: 4, textAlign: 'center' }}>
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
                mb: 2,
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={() => {
                if (!form.tenantSlug) {
                  setValidationError('Please enter a Tenant Slug first.');
                  return;
                }
                setGoogleEmailInput('');
                setGoogleOpen(true);
              }}
              startIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              }
              sx={{
                py: 1.25,
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 2,
                mb: 1.5,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Sign In with Google
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', mb: 3 }}>
            Want to register your company?{' '}
            <Box
              component="span"
              onClick={() => setShowRegister(true)}
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Apply here
            </Box>
          </Typography>

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
                onClick={() => handleQuickLogin(DEMO_SUPER.email, DEMO_SUPER.password, 'super-admin')}
                sx={{
                  borderColor: 'rgba(168, 85, 247, 0.3)',
                  color: '#e9d5ff',
                  bgcolor: 'rgba(168, 85, 247, 0.05)',
                  '&:hover': {
                    borderColor: '#a855f7',
                    bgcolor: 'rgba(168, 85, 247, 0.15)',
                  },
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                👑 Super Admin (Super System Admin)
              </Button>
            </Grid>

            <Grid size={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleQuickLogin(DEMO_ADMIN.email, DEMO_ADMIN.password)}
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
                onClick={() => handleQuickLogin(DEMO_AGENT.email, DEMO_AGENT.password)}
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
                onClick={() => handleQuickLogin(DEMO_CUSTOMER_1.email, DEMO_CUSTOMER_1.password)}
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
                onClick={() => handleQuickLogin(DEMO_CUSTOMER_2.email, DEMO_CUSTOMER_2.password)}
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

      {/* Dynamic Google Authentication Simulator */}
      <Dialog
        open={googleOpen}
        onClose={() => !googleLoading && setGoogleOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              bgcolor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, textAlign: 'center' }}>
          Google Account Authentication
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', mb: 1 }}>
            Sign in securely using your corporate Google credentials. The system will verify if your account is pre-registered by your Company Administrator.
          </Typography>

          <TextField
            autoFocus
            required
            fullWidth
            id="googleEmail"
            label="Google Email Address"
            type="email"
            value={googleEmailInput}
            onChange={(e) => setGoogleEmailInput(e.target.value)}
            disabled={googleLoading}
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
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' }
              }
            }}
          />

          <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <Chip 
              label="Or choose quick-demo corporate email" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)', 
                color: 'rgba(255, 255, 255, 0.5)', 
                fontWeight: 600,
                fontSize: '0.7rem'
              }} 
            />
          </Divider>

          <Grid container spacing={1}>
            <Grid size={6}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={() => {
                  setGoogleEmailInput(DEMO_ADMIN.email);
                  handleGoogleSubmit(DEMO_ADMIN.email);
                }}
                sx={{ fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
              >
                Nisha (Admin)
              </Button>
            </Grid>
            <Grid size={6}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={() => {
                  setGoogleEmailInput(DEMO_AGENT.email);
                  handleGoogleSubmit(DEMO_AGENT.email);
                }}
                sx={{ fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
              >
                Rahul (Agent)
              </Button>
            </Grid>
            <Grid size={6}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={() => {
                  setGoogleEmailInput(DEMO_CUSTOMER_1.email);
                  handleGoogleSubmit(DEMO_CUSTOMER_1.email);
                }}
                sx={{ fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
              >
                Priya (Customer)
              </Button>
            </Grid>
            <Grid size={6}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={() => {
                  setGoogleEmailInput(DEMO_CUSTOMER_2.email);
                  handleGoogleSubmit(DEMO_CUSTOMER_2.email);
                }}
                sx={{ fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
              >
                Arjun (Customer)
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button 
            onClick={() => setGoogleOpen(false)} 
            disabled={googleLoading}
            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleGoogleSubmit(googleEmailInput)}
            variant="contained"
            disabled={googleLoading || !googleEmailInput}
            sx={{ fontWeight: 700 }}
          >
            {googleLoading ? <CircularProgress size={20} color="inherit" /> : 'Authenticate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
