import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Alert, 
  CircularProgress,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { createTicketThunk } from './ticketsThunks';
import { TicketPriority } from '../../shared/types';

interface CreateTicketDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTicketDrawer: React.FC<CreateTicketDrawerProps> = ({ open, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading, error } = useAppSelector((state) => state.tickets);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: TicketPriority.Medium as TicketPriority, // Default
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (validationError) setValidationError(null);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      priority: Number(e.target.value) as TicketPriority,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setValidationError('Please complete all fields.');
      return;
    }

    if (!user) {
      setValidationError('User session missing.');
      return;
    }

    try {
      const result = await dispatch(createTicketThunk({
        tenantId: user.tenantId,
        customerId: user.id, // Current logged-in user is customer
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      })).unwrap();

      if (result) {
        // Reset form
        setForm({
          title: '',
          description: '',
          priority: TicketPriority.Medium as TicketPriority,
        });
        onSuccess();
        onClose();
      }
    } catch {
      // Handled by Redux thunk slice error
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          style: { backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)' }
        }
      }}
    >
      <Box sx={{ width: { xs: '100vw', sm: 460 }, p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Drawer Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Create Support Ticket
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Open a new incident record in queue.
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Validation / Core errors */}
        {(error || validationError) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {validationError || error}
          </Alert>
        )}

        {/* Create Incident form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Stack spacing={3} sx={{ flexGrow: 1 }}>
            <TextField
              required
              fullWidth
              name="title"
              label="Incident Title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Can't access the user management console"
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />

            <TextField
              required
              fullWidth
              multiline
              rows={6}
              name="description"
              label="Incident Description Details"
              value={form.description}
              onChange={handleChange}
              placeholder="Please provide full logs, stack trace, or screenshot steps."
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />

            <TextField
              select
              fullWidth
              name="priority"
              label="Urgency Level"
              value={form.priority}
              onChange={handleSelectChange}
              slotProps={{
                inputLabel: { shrink: true }
              }}
            >
              <MenuItem value={TicketPriority.Low}>Low (Routine check / slow operations)</MenuItem>
              <MenuItem value={TicketPriority.Medium}>Medium (General glitch / minor bug)</MenuItem>
              <MenuItem value={TicketPriority.High}>High (Service bottleneck / blocks flow)</MenuItem>
              <MenuItem value={TicketPriority.Urgent}>Urgent (Complete service crash / data breach risk)</MenuItem>
            </TextField>
          </Stack>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 'auto', pt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{ py: 1.25 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              sx={{ py: 1.25 }}
            >
              {isLoading ? 'Creating Record...' : 'Create Ticket'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
