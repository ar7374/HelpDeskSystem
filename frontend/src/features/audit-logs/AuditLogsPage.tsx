import React, { useEffect } from 'react';
import { 
  Box, 
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loadAuditLogsThunk } from './auditLogsThunks';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import type { Column } from '../../components/DataTable';

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

  const columns: Column<any>[] = [
    {
      id: 'id',
      label: 'Log Reference',
      render: (row) => (
        <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
          {row.id.substring(0, 8)}...
        </Box>
      )
    },
    {
      id: 'userId',
      label: 'User ID',
      render: (row) => (
        <Box sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          {row.userId}
        </Box>
      )
    },
    {
      id: 'action',
      label: 'Operation Action',
      render: (row) => (
        <Chip 
          label={row.action} 
          size="small"
          color="secondary"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
        />
      )
    },
    {
      id: 'entityType',
      label: 'Modified Entity',
      render: (row) => (
        <Box sx={{ fontSize: '0.85rem' }}>
          {row.entityType} ({row.entityId.substring(0, 8)}...)
        </Box>
      )
    },
    {
      id: 'description',
      label: 'Description Details',
      render: (row) => (
        <Box sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
          {row.description}
        </Box>
      )
    },
    {
      id: 'createdAtUtc',
      label: 'Logged Date (UTC)',
      render: (row) => (
        <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
          {formatDateTime(row.createdAtUtc)}
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <PageHeader
        title="System Audit Trail"
        subtitle="Administrative history of tenant pipeline updates, SLA breach audits, and session operations."
      >
        <IconButton onClick={handleRefresh} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <RefreshIcon />
        </IconButton>
      </PageHeader>

      {/* API Errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Logs Table */}
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="System audit trail is clean. No incidents recorded."
        rowKey={(row) => row.id}
      />
    </Box>
  );
};
