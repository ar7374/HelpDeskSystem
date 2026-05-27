import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../shared/api/axiosClient';
import type { LoginResponse, ApiResponse } from '../../shared/types';

export const loginThunk = createAsyncThunk<
  LoginResponse,
  { tenantId: string; email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      credentials
    );

    const apiResponse = response.data;
    if (apiResponse.status && apiResponse.data) {
      const loginData = apiResponse.data;
      
      // Save credentials locally for persistence across refreshes
      localStorage.setItem('accessToken', loginData.token);
      localStorage.setItem('refreshToken', loginData.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(loginData.user));

      return loginData;
    } else {
      return rejectWithValue(apiResponse.message || 'Login failed');
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || 'Invalid email or password';
    return rejectWithValue(errMsg);
  }
});
