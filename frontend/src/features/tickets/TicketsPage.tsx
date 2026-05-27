import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid, 
  TextField, 
  MenuItem, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Pagination, 
  Stack, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Launch as ViewIcon,
  Warning as BreachIcon,
  Schedule as NormalSlaIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loadTicketsThunk } from './ticketsThunks';
import { setFilters, setCriteria, clearSelectedTicket } from './ticketsSlice';
import { TicketPriority, TicketStatus } from '../../shared/types';
import type { TicketListItem } from '../../shared/types';
import { CreateTicketDrawer } from './CreateTicketDrawer';
import { TicketDetailsPanel } from './TicketDetailsPanel';

export const TicketsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { ticketsList, filters, isLoading, error } = useAppSelector((state) => state.tickets);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Sync tickets list on filter changes
  useEffect(() => {
    if (user?.tenantId) {
      dispatch(loadTicketsThunk({ tenantId: user.tenantId, request: filters }));
    }
  }, [dispatch, user?.tenantId, filters]);

  const handleRefresh = () => {
    if (user?.tenantId) {
      dispatch(loadTicketsThunk({ tenantId: user.tenantId, request: filters }));
    }
  };

  // Filters mapping
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCriteria({ search: e.target.value || null }));
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    dispatch(setCriteria({ status: val === 'all' ? null : Number(val) as TicketStatus }));
  };

  const handlePriorityFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    dispatch(setCriteria({ priority: val === 'all' ? null : Number(val) as TicketPriority }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ sortBy: e.target.value }));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setFilters({ pageNumber: page }));
  };

  // Helpers
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

  const statusChips: Record<number, { label: string; color: "default" | "primary" | "success" | "warning" }> = {
    [TicketStatus.Open]: { label: 'Open', color: 'default' },
    [TicketStatus.InProgress]: { label: 'Working', color: 'primary' },
    [TicketStatus.Resolved]: { label: 'Resolved', color: 'success' },
    [TicketStatus.Closed]: { label: 'Closed', color: 'warning' },
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  const renderSlaBadge = (slaDue: string, statusVal: number) => {
    const isOverdue = new Date(slaDue) < new Date();
    const isResolved = statusVal === TicketStatus.Resolved || statusVal === TicketStatus.Closed;

    if (isResolved) {
      return <Chip label="SLA Met" size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />;
    }

    if (isOverdue) {
      return (
        <Chip 
          icon={<BreachIcon sx={{ fontSize: '0.9rem !important' }} />}
          label="SLA BREACHED" 
          size="small" 
          color="error" 
          sx={{ 
            fontWeight: 800, 
            animation: 'blinkSla 1.5s infinite',
            '@keyframes blinkSla': {
              '0%': { opacity: 0.7 },
              '50%': { opacity: 1, backgroundColor: '#b91c1c' },
              '100%': { opacity: 0.7 }
            }
          }} 
        />
      );
    }

    const hours = Math.round((new Date(slaDue).getTime() - Date.now()) / 36e5);
    return (
      <Chip 
        icon={<NormalSlaIcon sx={{ fontSize: '0.85rem !important' }} />}
        label={`${hours}h limit`} 
        size="small" 
        color="info" 
        variant="outlined" 
        sx={{ fontWeight: 600 }} 
      />
    );
  };

  const roleName = user?.role || 'Customer';
  const isCustomer = roleName === 'Customer';

  const totalPages = Math.ceil(ticketsList.totalRecords / filters.pageSize) || 1;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Title Queue bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {isCustomer ? 'My Support Incidents' : 'Incident Command Queue'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isCustomer 
              ? 'List of cases submitted under your profile.' 
              : 'Assigned multi-tenant SLA cases in support queue.'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <IconButton onClick={handleRefresh} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshIcon />
          </IconButton>
          {isCustomer && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              New Incident
            </Button>
          )}
        </Stack>
      </Box>

      {/* Grid Filters Bar */}
      <Paper sx={{ p: 2.5, mb: 4 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          {/* Search bar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by title or HD-number..."
              value={filters.criteria?.search || ''}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                }
              }}
            />
          </Grid>

          {/* Status Select */}
          <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
            <TextField
              select
              fullWidth
              label="Incident Stage"
              value={filters.criteria?.status === null ? 'all' : filters.criteria?.status}
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value={TicketStatus.Open}>Open Queue</MenuItem>
              <MenuItem value={TicketStatus.InProgress}>Working (Active)</MenuItem>
              <MenuItem value={TicketStatus.Resolved}>Resolved</MenuItem>
              <MenuItem value={TicketStatus.Closed}>Closed Archive</MenuItem>
            </TextField>
          </Grid>

          {/* Priority Select */}
          <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
            <TextField
              select
              fullWidth
              label="Incident Urgency"
              value={filters.criteria?.priority === null ? 'all' : filters.criteria?.priority}
              onChange={handlePriorityFilterChange}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value={TicketPriority.Low}>Low</MenuItem>
              <MenuItem value={TicketPriority.Medium}>Medium</MenuItem>
              <MenuItem value={TicketPriority.High}>High</MenuItem>
              <MenuItem value={TicketPriority.Urgent}>Urgent</MenuItem>
            </TextField>
          </Grid>

          {/* Sort selection */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Sort Sequence"
              value={filters.sortBy || 'CreatedAtUtc'}
              onChange={handleSortChange}
            >
              <MenuItem value="CreatedAtUtc">Creation Timestamp</MenuItem>
              <MenuItem value="SlaDueAtUtc">SLA Target Due</MenuItem>
              <MenuItem value="Title">Alphabetical Title</MenuItem>
              <MenuItem value="TicketNumber">Ticket Number Code</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* API Failure banners */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Grid records Table list */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} />
          </Box>
        ) : ticketsList.data.length === 0 ? (
          <Box sx={{ p: 6, textAlignment: 'center', textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
              No tickets match active filter criteria.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Try adjusting search parameters or refresh the logs.
            </Typography>
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ticket Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Summary Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Urgency</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Stage</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>SLA Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reporter</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Owner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ticketsList.data.map((ticket: TicketListItem) => (
                <TableRow 
                  key={ticket.id}
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:last-child borderCell': { border: 0 }
                  }}
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {ticket.ticketNumber}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.title}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={priorityLabels[ticket.priority]} 
                      size="small"
                      color={priorityColors[ticket.priority]}
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={statusChips[ticket.status].label} 
                      color={statusChips[ticket.status].color}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    {renderSlaBadge(ticket.slaDueAtUtc, ticket.status)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{ticket.customerName}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {ticket.agentName || 'Unassigned Queue'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {formatDateTime(ticket.createdAtUtc)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <ViewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Pagination Footer */}
      {!isLoading && ticketsList.totalRecords > 0 && (
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 3, px: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Showing {ticketsList.data.length} of {ticketsList.totalRecords} incidents in queue
          </Typography>
          <Pagination 
            count={totalPages} 
            page={filters.pageNumber} 
            onChange={handlePageChange} 
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}

      {/* Slideout Modals */}
      <CreateTicketDrawer 
        open={createOpen} 
        onClose={() => setCreateOpen(false)} 
        onSuccess={handleRefresh}
      />

      <TicketDetailsPanel 
        open={!!selectedTicketId} 
        ticketId={selectedTicketId}
        onClose={() => {
          setSelectedTicketId(null);
          dispatch(clearSelectedTicket());
          handleRefresh(); // Reload list to capture comment additions or owner changes
        }}
      />
    </Box>
  );
};
