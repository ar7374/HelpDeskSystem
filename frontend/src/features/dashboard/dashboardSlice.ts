import { createSlice } from '@reduxjs/toolkit';
import type { DashboardSummary } from '../../shared/types';
import { loadDashboardThunk } from './dashboardThunks';

interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  isLoading: false,
  error: null,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboardThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadDashboardThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(loadDashboardThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
