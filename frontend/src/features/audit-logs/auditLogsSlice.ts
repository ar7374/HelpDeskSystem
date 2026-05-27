import { createSlice } from '@reduxjs/toolkit';
import type { AuditLog } from '../../shared/types';
import { loadAuditLogsThunk } from './auditLogsThunks';

interface AuditLogsState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AuditLogsState = {
  logs: [],
  isLoading: false,
  error: null,
};

export const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    clearAuditLogsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAuditLogsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAuditLogsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload;
        state.error = null;
      })
      .addCase(loadAuditLogsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuditLogsError } = auditLogsSlice.actions;
export default auditLogsSlice.reducer;
