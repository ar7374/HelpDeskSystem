import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PersonAdd as AddIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { axiosClient } from '../../shared/api/axiosClient';
import type { ApiResponse } from '../../shared/types';
import { RoleChip } from '../../components/RoleChip';
import { PageHeader } from '../../components/PageHeader';
import { AppButton } from '../../components/AppButton';
import { DataTable } from '../../components/DataTable';
import type { Column } from '../../components/DataTable';

interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Agent' | 'Customer';
  createdAtUtc: string;
}

export const UsersPage: React.FC = () => {
  const [usersList, setUsersList] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Role state variables
  const [openEditRole, setOpenEditRole] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [editRole, setEditRole] = useState<string>('Agent');
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !editRole) return;

    try {
      setEditLoading(true);
      setEditError(null);
      setEditSuccess(null);

      const response = await axiosClient.put<ApiResponse<UserDto>>(`/api/users/${selectedUser.id}/role`, {
        role: editRole
      });

      if (response.data && response.data.status) {
        setEditSuccess(response.data.message || 'Clearance updated successfully.');
        
        // Reload list
        fetchUsers();
        
        // Auto close after 1.2s
        setTimeout(() => {
          setOpenEditRole(false);
          setSelectedUser(null);
          setEditSuccess(null);
        }, 1200);
      } else {
        setEditError(response.data.message || 'Failed to update employee role.');
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || err.message || 'An error occurred while updating the role.');
    } finally {
      setEditLoading(false);
    }
  };
  
  // Dialog Open state
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: 'Agent',
    password: ''
  });
  
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosClient.get<ApiResponse<UserDto[]>>('/api/users');
      if (response.data && response.data.status && response.data.data) {
        setUsersList(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load employee list.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while loading employees.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.role) {
      setCreateError('Full name, email address, and role are required.');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);
      setCreateSuccess(null);

      const response = await axiosClient.post<ApiResponse<UserDto>>('/api/users', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password || undefined
      });

      if (response.data && response.data.status) {
        setCreateSuccess(response.data.message || 'Employee created successfully.');
        setForm({
          fullName: '',
          email: '',
          role: 'Agent',
          password: ''
        });
        
        // Reload employee lists
        fetchUsers();
        
        // Auto close after 1.5s
        setTimeout(() => {
          setOpenCreate(false);
          setCreateSuccess(null);
        }, 1500);
      } else {
        setCreateError(response.data.message || 'Failed to create employee.');
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create employee account.');
    } finally {
      setCreateLoading(false);
    }
  };

  const columns: Column<UserDto>[] = [
    {
      id: 'fullName',
      label: 'Employee Name',
      render: (row) => <Box sx={{ fontWeight: 600 }}>{row.fullName}</Box>
    },
    {
      id: 'email',
      label: 'Email Address',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <EmailIcon sx={{ fontSize: 16 }} />
          {row.email}
        </Box>
      )
    },
    {
      id: 'role',
      label: 'Role / Clearance',
      render: (row) => <RoleChip role={row.role} />
    },
    {
      id: 'createdAtUtc',
      label: 'Registered On',
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
      render: (row) => (
        <Tooltip title="Edit Role / Clearance">
          <IconButton
            size="small"
            onClick={() => {
              setSelectedUser(row);
              setEditRole(row.role);
              setOpenEditRole(true);
            }}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader
        title="Employee & User Accounts"
        subtitle="Manage your company's admins, agents, and customer client accounts."
      >
        <Tooltip title="Reload list">
          <IconButton onClick={fetchUsers} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <AppButton
          variant="contained"
          color="primary"
          icon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
          sx={{ py: 1.25, px: 2.5 }}
        >
          Create Employee
        </AppButton>
      </PageHeader>

      {/* Main List Table */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={usersList}
        isLoading={isLoading}
        emptyMessage="No users registered in your tenant yet. Click 'Create Employee' to add one."
        rowKey={(row) => row.id}
      />

      {/* Dialog for user creation */}
      <Dialog 
        open={openCreate} 
        onClose={() => !createLoading && setOpenCreate(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Create Corporate Account
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {createError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {createError}
              </Alert>
            )}
            {createSuccess && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                {createSuccess}
              </Alert>
            )}

            <TextField
              required
              fullWidth
              name="fullName"
              label="Full Name"
              value={form.fullName}
              onChange={handleInputChange}
              disabled={createLoading || !!createSuccess}
            />

            <TextField
              required
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              disabled={createLoading || !!createSuccess}
              helperText="Employees will be able to log in with this Google Email address."
            />

            <FormControl fullWidth>
              <InputLabel id="role-select-label">Access Role</InputLabel>
              <Select
                labelId="role-select-label"
                name="role"
                value={form.role}
                label="Access Role"
                onChange={handleInputChange}
                disabled={createLoading || !!createSuccess}
              >
                <MenuItem value="Admin">Administrator</MenuItem>
                <MenuItem value="Agent">Support Agent</MenuItem>
                <MenuItem value="Customer">Customer Client</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              name="password"
              label="Password (Optional)"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              disabled={createLoading || !!createSuccess}
              helperText="Set an initial password, or leave empty if this employee will login exclusively using Google."
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <AppButton 
              onClick={() => setOpenCreate(false)} 
              disabled={createLoading || !!createSuccess}
              color="inherit"
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="contained"
              isLoading={createLoading}
              disabled={!!createSuccess}
            >
              Register Account
            </AppButton>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog for updating user role / clearance */}
      <Dialog
        open={openEditRole}
        onClose={() => !editLoading && setOpenEditRole(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Update Employee Clearance
        </DialogTitle>
        <Box component="form" onSubmit={handleEditRoleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {selectedUser && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Adjust system clearance level for <strong>{selectedUser.fullName}</strong> ({selectedUser.email}).
              </Typography>
            )}

            {editError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {editError}
              </Alert>
            )}
            {editSuccess && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                {editSuccess}
              </Alert>
            )}

            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="edit-role-select-label">Access Clearance</InputLabel>
              <Select
                labelId="edit-role-select-label"
                value={editRole}
                label="Access Clearance"
                onChange={(e) => setEditRole(e.target.value)}
                disabled={editLoading || !!editSuccess}
              >
                <MenuItem value="Admin">Administrator</MenuItem>
                <MenuItem value="Agent">Support Agent</MenuItem>
                <MenuItem value="Customer">Customer Client</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <AppButton
              onClick={() => {
                setOpenEditRole(false);
                setSelectedUser(null);
              }}
              disabled={editLoading || !!editSuccess}
              color="inherit"
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="contained"
              isLoading={editLoading}
              disabled={!!editSuccess}
            >
              Save Clearance
            </AppButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};
