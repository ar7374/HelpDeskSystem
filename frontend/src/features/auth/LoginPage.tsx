import React, { useCallback, useEffect, useRef, useState } from 'react';
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

  const [validationError, setValidationError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const handleGoogleCredential = useCallback(async (credentialToken?: string) => {
    if (!form.tenantSlug) {
      setValidationError('Please enter your Tenant Slug first.');
      return;
    }

    if (!credentialToken) {
      setValidationError('Google did not return a sign-in credential. Please try again.');
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

        // 2. Validate the Google ID token server-side, then issue app tokens.
        const response = await axiosClient.post('/api/auth/google-login', {
          credentialToken,
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
        } else {
          setValidationError(apiResponse.message || 'Google authentication failed.');
        }
      } else {
        setValidationError('Invalid workspace slug. Company verification failed.');
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Google account not registered under this company.';
      setValidationError(errMsg);
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch, form.tenantSlug]);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const renderGoogleButton = () => {
      if (cancelled) {
        return;
      }

      if (!window.google?.accounts?.id) {
        attempts += 1;
        if (attempts < 40) {
          window.setTimeout(renderGoogleButton, 250);
        } else {
          setValidationError('Google sign-in script could not be loaded.');
        }
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          handleGoogleCredential(response.credential);
        },
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          width: 360,
        });
      }
    };

    renderGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [googleClientId, handleGoogleCredential]);

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

            <Box
              sx={{
                mb: 1.5,
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {googleClientId ? (
                <Box
                  ref={googleButtonRef}
                  sx={{
                    width: '100%',
                    minHeight: 40,
                    display: 'flex',
                    justifyContent: 'center',
                    opacity: googleLoading ? 0.6 : 1,
                    pointerEvents: googleLoading ? 'none' : 'auto',
                  }}
                />
              ) : (
                <Alert severity="warning" sx={{ width: '100%', borderRadius: 2 }}>
                  Google sign-in needs VITE_GOOGLE_CLIENT_ID.
                </Alert>
              )}
            </Box>
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

    </Box>
  );
};
