import React, { useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress, 
  Alert, 
  CircularProgress,
  Paper,
  Chip
} from '@mui/material';
import {
  AssignmentTurnedIn as ResolvedIcon,
  PlayCircleFilled as InProgressIcon,
  WarningAmber as BreachedIcon,
  FiberNew as OpenIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loadDashboardThunk } from './dashboardThunks';
import { createDashboardConnection } from '../../shared/api/signalrService';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { summary, isLoading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    if (user?.tenantId) {
      dispatch(loadDashboardThunk(user.tenantId));

      const connection = createDashboardConnection();

      const startConnection = async () => {
        try {
          await connection.start();
          console.log('Connected to DashboardHub');
          
          await connection.invoke('JoinTenantGroup', user.tenantId);

          connection.on('TicketCreated', () => {
            console.log('Realtime Event: Ticket Created. Reloading Dashboard...');
            dispatch(loadDashboardThunk(user.tenantId));
          });

          connection.on('TicketUpdated', () => {
            console.log('Realtime Event: Ticket Updated. Reloading Dashboard...');
            dispatch(loadDashboardThunk(user.tenantId));
          });
        } catch (err) {
          console.error('Error starting DashboardHub connection:', err);
        }
      };

      startConnection();

      return () => {
        connection.invoke('LeaveTenantGroup', user.tenantId)
          .catch((err) => console.error('Error leaving tenant group:', err))
          .finally(() => {
            connection.stop()
              .then(() => console.log('Disconnected from DashboardHub'))
              .catch((err) => console.error('Error stopping DashboardHub connection:', err));
          });
      };
    }
  }, [dispatch, user?.tenantId]);

  if (isLoading && !summary) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 3, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  // Fallbacks if dashboard response hasn't loaded yet
  const openCount = summary?.openTickets ?? 0;
  const inProgressCount = summary?.inProgressTickets ?? 0;
  const resolvedCount = summary?.resolvedTickets ?? 0;
  const breachedCount = summary?.slaBreachedTickets ?? 0;
  const avgResolution = summary?.averageResolutionHours ?? 0;

  // Priority aggregations
  const priorityData = summary?.ticketsByPriority || {};
  const lowCount = priorityData[0] || priorityData['Low'] || priorityData['low'] || 0;     // Low
  const mediumCount = priorityData[1] || priorityData['Medium'] || priorityData['medium'] || 0;  // Medium
  const highCount = priorityData[2] || priorityData['High'] || priorityData['high'] || 0;    // High
  const urgentCount = priorityData[3] || priorityData['Urgent'] || priorityData['urgent'] || 0;  // Urgent
  const totalPriorityCount = lowCount + mediumCount + highCount + urgentCount || 1;

  const priorityBars = [
    { label: 'Urgent', count: urgentCount, color: 'error.main', value: (urgentCount / totalPriorityCount) * 100 },
    { label: 'High', count: highCount, color: 'warning.main', value: (highCount / totalPriorityCount) * 100 },
    { label: 'Medium', count: mediumCount, color: 'primary.main', value: (mediumCount / totalPriorityCount) * 100 },
    { label: 'Low', count: lowCount, color: 'success.main', value: (lowCount / totalPriorityCount) * 100 },
  ];

  // Helper card config
  const statCards = [
    {
      title: 'Open Queue',
      count: openCount,
      icon: <OpenIcon sx={{ fontSize: 36, color: 'info.main' }} />,
      bgColor: 'info.light',
    },
    {
      title: 'Active Work',
      count: inProgressCount,
      icon: <InProgressIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
      bgColor: 'primary.light',
    },
    {
      title: 'Resolved Items',
      count: resolvedCount,
      icon: <ResolvedIcon sx={{ fontSize: 36, color: 'success.main' }} />,
      bgColor: 'success.light',
    },
    {
      title: 'SLA Breach Alarms',
      count: breachedCount,
      icon: <BreachedIcon sx={{ fontSize: 36, color: 'error.main' }} />,
      bgColor: 'error.light',
      isAlarm: breachedCount > 0,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome banner */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontSize: '1.85rem', fontWeight: 800 }}>
          Welcome back, {user?.fullName}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here is what's happening with support operations in Acme Cloud Support.
        </Typography>
      </Box>

      {/* Grid count cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
            <Card 
              sx={{ 
                position: 'relative',
                overflow: 'hidden',
                animation: card.isAlarm ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0px rgba(239, 68, 68, 0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
                  '100%': { boxShadow: '0 0 0 0px rgba(239, 68, 68, 0)' }
                },
                ...(card.isAlarm && {
                  borderColor: 'error.main',
                  bgcolor: 'rgba(239, 68, 68, 0.03)'
                })
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h1" sx={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1 }}>
                    {card.count}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: card.isAlarm ? 'rgba(239, 68, 68, 0.1)' : 'action.hover'
                  }}
                >
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Metrics breakdown details row */}
      <Grid container spacing={4}>
        {/* Priority charts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Ticket Loads by Priority
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {priorityBars.map((bar) => (
                <Box key={bar.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {bar.label} Priority
                    </Typography>
                    <Chip 
                      label={`${bar.count} tickets`} 
                      size="small" 
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={bar.value} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: bar.color,
                        borderRadius: 4
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* SLA and Resolution Performance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
              Service Level Agreement (SLA) Health
            </Typography>
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 900, color: avgResolution > 0 ? 'success.main' : 'text.secondary' }}>
                {avgResolution > 0 ? `${avgResolution.toFixed(1)}h` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 1 }}>
                Average Resolution Duration
              </Typography>
            </Box>
            <Alert severity={breachedCount > 0 ? 'warning' : 'success'} sx={{ mt: 3, borderRadius: 2 }}>
              {breachedCount > 0 
                ? `Attention: There are currently ${breachedCount} tickets violating Active SLAs. Urgent operational reassignment is recommended.`
                : 'All ticket pipelines are solid! Active SLAs are fully respected.'}
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
