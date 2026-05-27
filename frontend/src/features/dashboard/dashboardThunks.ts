import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../shared/api/axiosClient';
import type { DashboardSummary, ApiResponse } from '../../shared/types';

export const loadDashboardThunk = createAsyncThunk<
  DashboardSummary,
  string, // tenantId
  { rejectValue: string }
>('dashboard/load', async (tenantId, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get<ApiResponse<DashboardSummary>>(
      `/api/tenants/${tenantId}/dashboard`
    );

    const apiResponse = response.data;
    if (apiResponse.status && apiResponse.data) {
      return apiResponse.data;
    } else {
      return rejectWithValue(apiResponse.message || 'Failed to load dashboard metrics');
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || 'Failed to connect to backend';
    return rejectWithValue(errMsg);
  }
});
