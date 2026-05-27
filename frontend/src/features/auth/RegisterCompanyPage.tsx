import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Alert, 
  InputAdornment
} from '@mui/material';
import { 
  Business as CompanyIcon, 
  Person as FounderIcon, 
  Email as EmailIcon, 
  Lock as LockIcon,
  Language as SlugIcon
} from '@mui/icons-material';
import { axiosClient } from '../../shared/api/axiosClient';
import { AppButton } from '../../components/AppButton';

interface RegisterCompanyPageProps {
  onBackToLogin: (prefilledSlug?: string) => void;
}

export const RegisterCompanyPage: React.FC<RegisterCompanyPageProps> = ({ onBackToLogin }) => {
  const [form, setForm] = useState({
    companyName: '',
    companySlug: '',
    founderName: '',
    founderEmail: '',
    founderPassword: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName || !form.companySlug || !form.founderName || !form.founderEmail || !form.founderPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    // Slug validation
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(form.companySlug)) {
      setError('Workspace slug can only contain lowercase letters, numbers, and hyphens (e.g. acme-cloud).');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axiosClient.post('/api/auth/register', {
        companyName: form.companyName.trim(),
        companySlug: form.companySlug.trim().toLowerCase(),
        founderName: form.founderName.trim(),
        founderEmail: form.founderEmail.trim().toLowerCase(),
        founderPassword: form.founderPassword
      });

      if (response.data && response.data.status) {
        setSuccess(response.data.message || 'Company registration submitted successfully!');
      } else {
        setError(response.data.message || 'Failed to submit registration request.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while submitting your application.');
    } finally {
      setIsLoading(false);
    }
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
          width: 500,
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
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', mb: 1 }}>
              Register Your Company
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
              Launch your corporate SLA support workspace in seconds
            </Typography>
          </Box>

          {/* Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="success" sx={{ mb: 4, borderRadius: 2, textAlign: 'left' }}>
                {success}
              </Alert>
              <AppButton
                variant="contained"
                fullWidth
                onClick={() => onBackToLogin(form.companySlug.trim().toLowerCase())}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700 }}
              >
                Go to Login Page
              </AppButton>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Company Info Section */}
              <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Company Details
              </Typography>

              <TextField
                required
                fullWidth
                label="Company Name"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                disabled={isLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CompanyIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
                      </InputAdornment>
                    ),
                    style: { color: '#ffffff' }
                  }
                }}
                sx={{
                  mb: 2.5,
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                  }
                }}
              />

              <TextField
                required
                fullWidth
                label="Workspace URL Slug"
                name="companySlug"
                placeholder="my-company"
                helperText="Lowercase alphanumeric characters and hyphens only. Used for logging in."
                value={form.companySlug}
                onChange={handleChange}
                disabled={isLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SlugIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
                      </InputAdornment>
                    ),
                    style: { color: '#ffffff' }
                  },
                  formHelperText: {
                    sx: { color: 'rgba(255,255,255,0.4)' }
                  }
                }}
                sx={{
                  mb: 3.5,
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                  }
                }}
              />

              {/* Founder/Admin Info Section */}
              <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Founder / Company Administrator
              </Typography>

              <TextField
                required
                fullWidth
                label="Full Name"
                name="founderName"
                value={form.founderName}
                onChange={handleChange}
                disabled={isLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FounderIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
                      </InputAdornment>
                    ),
                    style: { color: '#ffffff' }
                  }
                }}
                sx={{
                  mb: 2.5,
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                  }
                }}
              />

              <TextField
                required
                fullWidth
                label="Email Address"
                name="founderEmail"
                type="email"
                value={form.founderEmail}
                onChange={handleChange}
                disabled={isLoading}
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
                  mb: 2.5,
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                  }
                }}
              />

              <TextField
                required
                fullWidth
                label="Password"
                name="founderPassword"
                type="password"
                value={form.founderPassword}
                onChange={handleChange}
                disabled={isLoading}
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
                  mb: 4,
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                  }
                }}
              />

              <AppButton
                type="submit"
                fullWidth
                variant="contained"
                isLoading={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  mb: 2
                }}
              >
                Submit Registration
              </AppButton>

              <AppButton
                type="button"
                fullWidth
                variant="text"
                onClick={() => onBackToLogin()}
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Back to Login
              </AppButton>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
