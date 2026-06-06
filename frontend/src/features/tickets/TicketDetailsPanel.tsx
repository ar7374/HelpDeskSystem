import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  Typography, 
  Chip, 
  Divider, 
  Button, 
  TextField, 
  CircularProgress, 
  Alert,
  Stack,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Paper
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { 
  Close as CloseIcon, 
  Send as SendIcon, 
  Warning as BreachIcon, 
  AccessTime as SlaIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loadTicketDetailsThunk, updateTicketThunk, addCommentThunk } from './ticketsThunks';
import { TicketPriority, TicketStatus } from '../../shared/types';
import { createCommentConnection } from '../../shared/api/signalrService';
import { realtimeCommentAdded } from './ticketsSlice';
import type { TicketComment } from '../../shared/types';

interface TicketDetailsPanelProps {
  open: boolean;
  ticketId: string | null;
  onClose: () => void;
}

export const TicketDetailsPanel: React.FC<TicketDetailsPanelProps> = ({ open, ticketId, onClose }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedTicket, isLoading } = useAppSelector((state) => state.tickets);

  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Default hardcoded lists of support staff matching seeded DB
  const seededAgents = [
    { id: 'e965cda4-3cc5-42c5-95ea-75199be881c4', name: 'Rahul Agent (Agent)' },
    { id: 'b19f7d89-51f8-42fc-a75e-9966cbca25ef', name: 'Nisha Admin (Admin)' }
  ];

  useEffect(() => {
    if (open && ticketId && user?.tenantId) {
      dispatch(loadTicketDetailsThunk({ tenantId: user.tenantId, ticketId }));
    }
  }, [dispatch, open, ticketId, user?.tenantId]);

  useEffect(() => {
    if (open && ticketId && user?.tenantId) {
      const connection = createCommentConnection();

      const startConnection = async () => {
        try {
          await connection.start();
          console.log(`Connected to CommentHub for ticket ${ticketId}`);
          
          await connection.invoke('JoinTicketGroup', ticketId);

          connection.on('CommentAdded', (comment: TicketComment) => {
            console.log('Realtime Event: Comment Added', comment);
            dispatch(realtimeCommentAdded(comment));
          });
        } catch (err) {
          console.error('Error starting CommentHub connection:', err);
        }
      };

      startConnection();

      return () => {
        connection.invoke('LeaveTicketGroup', ticketId)
          .catch((err) => console.error('Error leaving ticket group:', err))
          .finally(() => {
            connection.stop()
              .then(() => console.log('Disconnected from CommentHub'))
              .catch((err) => console.error('Error stopping CommentHub connection:', err));
          });
      };
    }
  }, [dispatch, open, ticketId, user?.tenantId]);

  if (!open) return null;

  if (isLoading && !selectedTicket) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ backdrop: { style: { backgroundColor: 'rgba(15, 23, 42, 0.15)' } } }}
      >
        <Box sx={{ width: { xs: '100vw', sm: 500 }, display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      </Drawer>
    );
  }

  if (!selectedTicket) return null;

  // Role namespace
  const roleName = user?.role || 'Customer';
  const isAdmin = roleName === 'Admin';
  const isAgent = roleName === 'Agent';
  const isAssignedAgent = isAgent && selectedTicket.agent?.id === user?.id;
  const canChangeStatus = isAdmin || isAssignedAgent;

  // Calculate SLA countdown and breach alerts
  const isResolvedOrClosed = selectedTicket.status === TicketStatus.Resolved || selectedTicket.status === TicketStatus.Closed;
  const isSlaBreached = !isResolvedOrClosed && new Date(selectedTicket.slaDueAtUtc) < new Date();
  
  const calculateSlaHours = () => {
    const hours = Math.round((new Date(selectedTicket.slaDueAtUtc).getTime() - Date.now()) / 36e5);
    if (hours < 0) {
      return `${Math.abs(hours)}h overdue`;
    }
    return `${hours}h remaining`;
  };

  // Handlers
  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    if (!user?.tenantId) return;
    const newStatus = Number(e.target.value) as TicketStatus;
    dispatch(updateTicketThunk({
      tenantId: user.tenantId,
      ticketId: selectedTicket.id,
      request: {
        status: newStatus,
        agentId: selectedTicket.agent?.id || null, // Keep existing agent
      }
    }));
  };

  const handleAgentChange = (e: SelectChangeEvent<string>) => {
    if (!user?.tenantId) return;
    const agentIdVal = e.target.value;
    const newAgentId = agentIdVal === 'unassigned' ? null : agentIdVal;
    dispatch(updateTicketThunk({
      tenantId: user.tenantId,
      ticketId: selectedTicket.id,
      request: {
        status: selectedTicket.status,
        agentId: newAgentId,
      }
    }));
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user?.tenantId) return;

    setIsPostingComment(true);
    try {
      await dispatch(addCommentThunk({
        tenantId: user.tenantId,
        ticketId: selectedTicket.id,
        request: {
          body: commentText.trim(),
        }
      })).unwrap();
      setCommentText('');
    } catch {
      // Ignored
    } finally {
      setIsPostingComment(false);
    }
  };

  // Helper colors
  const priorityColors: Record<number, "success" | "primary" | "warning" | "error"> = {
    [TicketPriority.Low]: 'success',
    [TicketPriority.Medium]: 'primary',
    [TicketPriority.High]: 'warning',
    [TicketPriority.Urgent]: 'error',
  };

  const priorityLabels: Record<number, string> = {
    [TicketPriority.Low]: 'Low',
    [TicketPriority.Medium]: 'Medium',
    [TicketPriority.High]: 'High',
    [TicketPriority.Urgent]: 'Urgent',
  };

  const statusLabels = {
    [TicketStatus.Open]: 'Open Queue',
    [TicketStatus.InProgress]: 'In Progress',
    [TicketStatus.Resolved]: 'Resolved',
    [TicketStatus.Closed]: 'Closed Archive',
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
      <Box sx={{ width: { xs: '100vw', sm: 550 }, p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.1em', fontWeight: 700 }}>
              TICKET #{selectedTicket.ticketNumber}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, pr: 2 }}>
              {selectedTicket.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ mt: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Badges row */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <Chip 
            label={priorityLabels[selectedTicket.priority]} 
            color={priorityColors[selectedTicket.priority]}
            size="small" 
            sx={{ fontWeight: 700 }}
          />
          <Chip 
            label={statusLabels[selectedTicket.status]} 
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* SLA Emergency Alerts */}
          {isSlaBreached ? (
            <Alert 
              severity="error" 
              icon={<BreachIcon />} 
              sx={{ 
                borderRadius: 2.5, 
                border: '1px solid',
                borderColor: 'error.main',
                animation: 'pulseAlert 1.5s infinite',
                '@keyframes pulseAlert': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.02)', boxShadow: '0 0 10px rgba(239,68,68,0.15)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                🚨 SLA TIME BREACH WARNING!
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                This unresolved ticket has exceeded its target resolution deadline ({calculateSlaHours()}). Emergency triage is required.
              </Typography>
            </Alert>
          ) : (
            !isResolvedOrClosed && (
              <Alert severity="info" icon={<SlaIcon />} sx={{ borderRadius: 2.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Active SLA Window
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Support targets require resolution within {calculateSlaHours()}.
                </Typography>
              </Alert>
            )
          )}

          {/* Description Section */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Incident Details
            </Typography>
            <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Context Details Row */}
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Customer Reporter
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {selectedTicket.customer.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedTicket.customer.email}
              </Typography>
            </Grid>

            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Assigned Owner
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {selectedTicket.agent?.fullName || 'Unassigned Queue'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedTicket.agent?.email || 'Awaiting agent takeover'}
              </Typography>
            </Grid>
          </Grid>

          {/* Support Actions */}
          {canChangeStatus && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Agent Operations Desk
              </Typography>
              <Stack spacing={2} direction="row">
                {/* Status Dropdown */}
                <FormControl fullWidth size="small">
                  <InputLabel id="status-select-label">Pipeline Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={selectedTicket.status.toString()}
                    label="Pipeline Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value={TicketStatus.Open.toString()}>Open Queue</MenuItem>
                    <MenuItem value={TicketStatus.InProgress.toString()}>In Progress</MenuItem>
                    <MenuItem value={TicketStatus.Resolved.toString()}>Resolved</MenuItem>
                    <MenuItem value={TicketStatus.Closed.toString()}>Closed Archive</MenuItem>
                  </Select>
                </FormControl>

                {isAdmin && (
                  <FormControl fullWidth size="small">
                    <InputLabel id="agent-select-label">Assign Agent</InputLabel>
                    <Select
                      labelId="agent-select-label"
                      value={selectedTicket.agent?.id || 'unassigned'}
                      label="Assign Agent"
                      onChange={handleAgentChange}
                    >
                      <MenuItem value="unassigned">-- Unassigned Queue --</MenuItem>
                      {seededAgents.map((ag) => (
                        <MenuItem key={ag.id} value={ag.id}>
                          {ag.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Box>
          )}

          <Divider />

          {/* Comment Timeline Logs */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Comment Logs & Activity
            </Typography>

            {/* Render comments */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              {selectedTicket.comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlignment: 'center', py: 2, textAlign: 'center' }}>
                  No messages logged. Post a response below to initiate conversation.
                </Typography>
              ) : (
                selectedTicket.comments.map((comment) => {
                  const isAgentComment = seededAgents.some((a) => a.id === comment.authorId);
                  return (
                    <Box 
                      key={comment.id} 
                      sx={{ 
                        alignSelf: comment.authorId === user?.id ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                      }}
                    >
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 1.75,
                          borderRadius: 2.5,
                          bgcolor: comment.authorId === user?.id 
                            ? 'primary.main' 
                            : isAgentComment 
                              ? 'secondary.main' 
                              : 'action.hover',
                          color: comment.authorId === user?.id || isAgentComment ? '#ffffff' : 'text.primary',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.9 }}>
                            {comment.authorId === user?.id 
                              ? 'You' 
                              : isAgentComment 
                                ? 'Support Agent' 
                                : 'Customer Reporter'}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                            {new Date(comment.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {comment.body}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })
              )}
            </Stack>

            {/* Comment input form */}
            <Box component="form" onSubmit={handleSendComment} sx={{ mt: 'auto', display: 'flex', gap: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message reply..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isPostingComment}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isPostingComment || !commentText.trim()}
                sx={{ minWidth: 46, p: 0 }}
              >
                {isPostingComment ? <CircularProgress size={20} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
