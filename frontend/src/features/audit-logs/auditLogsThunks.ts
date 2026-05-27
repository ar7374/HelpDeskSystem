import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../shared/api/axiosClient';
import type { AuditLog, ApiResponse } from '../../shared/types';

export const loadAuditLogsThunk = createAsyncThunk<
  AuditLog[],
  void,
  { rejectValue: string }
>('auditLogs/loadAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get<ApiResponse<AuditLog[]>>(
      '/api/audit-logs'
    );

    const apiResponse = response.data;
    if (apiResponse.status && apiResponse.data) {
      return apiResponse.data;
    } else {
      return rejectWithValue(apiResponse.message || 'Failed to load audit logs');
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || 'Failed to fetch audit trail';
    return rejectWithValue(errMsg);
  }
});
