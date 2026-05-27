import React, { useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loadAuditLogsThunk } from './auditLogsThunks';

export const AuditLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { logs, isLoading, error } = useAppSelector((state) => state.auditLogs);

  useEffect(() => {
    dispatch(loadAuditLogsThunk());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(loadAuditLogsThunk());
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '1.85rem', fontWeight: 800 }}>
            System Audit Trail
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administrative history of tenant pipeline updates, SLA breach audits, and session operations.
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* API Errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Logs Table */}
      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ p: 6, textAlignment: 'center', textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
              System audit trail is clean. No incidents recorded.
            </Typography>
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Log Reference</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Operation Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Modified Entity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description Details</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Logged Date (UTC)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {log.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {log.userId}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.action} 
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {log.entityType} ({log.entityId.substring(0, 8)}...)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                    {log.description}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {formatDateTime(log.createdAtUtc)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};
