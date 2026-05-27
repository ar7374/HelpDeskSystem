import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Chip, 
  IconButton, 
  Tooltip, 
  Alert
} from '@mui/material';
import { 
  CheckCircleOutlined as ApproveIcon, 
  HighlightOff as RejectIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { axiosClient } from '../../shared/api/axiosClient';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import { AppButton } from '../../components/AppButton';

interface TenantApprovalDto {
  id: string;
  name: string;
  slug: string;
  status: string; // "Pending", "Approved", "Rejected"
  createdAtUtc: string;
  founderName: string;
  founderEmail: string;
}

export const CompanyApprovalsPage: React.FC = () => {
  const [tenantsList, setTenantsList] = useState<TenantApprovalDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosClient.get('/api/superadmin/tenants');
      if (response.data && response.data.status && response.data.data) {
        setTenantsList(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch company list.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while loading companies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    try {
      setError(null);
      setActionSuccess(null);
      const response = await axiosClient.post(`/api/superadmin/tenants/${id}/approve`);
      if (response.data && response.data.status) {
        setActionSuccess(`Successfully approved company "${name}"!`);
        fetchTenants();
      } else {
        setError(response.data.message || 'Failed to approve tenant.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error occurred while approving company.');
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      setError(null);
      setActionSuccess(null);
      const response = await axiosClient.post(`/api/superadmin/tenants/${id}/reject`);
      if (response.data && response.data.status) {
        setActionSuccess(`Successfully rejected company "${name}".`);
        fetchTenants();
      } else {
        setError(response.data.message || 'Failed to reject tenant.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error occurred while rejecting company.');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Chip label="Approved" size="small" color="success" sx={{ fontWeight: 700, borderRadius: 2 }} />;
      case 'Rejected':
        return <Chip label="Rejected" size="small" color="error" variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }} />;
      case 'Pending':
      default:
        return <Chip label="Pending Review" size="small" color="warning" sx={{ fontWeight: 700, borderRadius: 2 }} />;
    }
  };

  const columns: Column<TenantApprovalDto>[] = [
    {
      id: 'name',
      label: 'Company Name',
      render: (row) => <Box sx={{ fontWeight: 600 }}>{row.name}</Box>
    },
    {
      id: 'slug',
      label: 'Workspace Slug',
      render: (row) => <Box sx={{ fontStyle: 'italic', color: 'primary.main', fontWeight: 600 }}>{row.slug}</Box>
    },
    {
      id: 'founder',
      label: 'Founder Details',
      render: (row) => (
        <Box>
          <Box sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{row.founderName}</Box>
          <Box sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.founderEmail}</Box>
        </Box>
      )
    },
    {
      id: 'status',
      label: 'Approval Status',
      render: (row) => getStatusChip(row.status)
    },
    {
      id: 'createdAtUtc',
      label: 'Applied On',
      render: (row) => (
        <Box sx={{ color: 'text.secondary', fontSize: '0.825rem' }}>
          {new Date(row.createdAtUtc).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Box>
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => {
        if (row.status !== 'Pending') {
          return null;
        }

        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="Approve Workspace">
              <AppButton
                size="small"
                variant="outlined"
                color="success"
                onClick={() => handleApprove(row.id, row.name)}
                sx={{ minWidth: 'auto', p: 0.5, borderRadius: 2 }}
              >
                <ApproveIcon sx={{ fontSize: 18 }} />
              </AppButton>
            </Tooltip>
            <Tooltip title="Reject Workspace">
              <AppButton
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleReject(row.id, row.name)}
                sx={{ minWidth: 'auto', p: 0.5, borderRadius: 2 }}
              >
                <RejectIcon sx={{ fontSize: 18 }} />
              </AppButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader
        title="Company Registrations"
        subtitle="Manage business workspace requests. Approve to create their tenant and activate the founder Admin account."
      >
        <Tooltip title="Refresh applications">
          <IconButton onClick={fetchTenants} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </PageHeader>

      {/* Action alerts */}
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={tenantsList}
        isLoading={isLoading}
        emptyMessage="No company registration requests recorded yet."
        rowKey={(row) => row.id}
      />
    </Box>
  );
};
