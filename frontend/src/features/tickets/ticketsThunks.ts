import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../shared/api/axiosClient';
import type { 
  TicketListItem, 
  TicketDetails, 
  SearchRequest, 
  TicketSearchCriteria, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  AddCommentRequest, 
  ApiResponse, 
  PaginatedListDto 
} from '../../shared/types';

export const loadTicketsThunk = createAsyncThunk<
  PaginatedListDto<TicketListItem>,
  { tenantId: string; request: SearchRequest<TicketSearchCriteria> },
  { rejectValue: string }
>('tickets/loadAll', async ({ tenantId, request }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post<ApiResponse<PaginatedListDto<TicketListItem>>>(
      `/api/tenants/${tenantId}/tickets`,
      request
    );

    const apiResponse = response.data;
    if (apiResponse.status && apiResponse.data) {
      return apiResponse.data;
    } else {
      return rejectWithValue(apiResponse.message || 'Failed to load tickets');
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || 'Failed to fetch tickets';
    return rejectWithValue(errMsg);
  }
});

export const loadTicketDetailsThunk = createAsyncThunk<
  TicketDetails,
  { tenantId: string; ticketId: string },
  { rejectValue: string }
>('tickets/loadDetails', async ({ tenantId, ticketId }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get<ApiResponse<TicketDetails>>(
      `/api/tenants/${tenantId}/tickets/${ticketId}`
    );

    const apiResponse = response.data;
    if (apiResponse.status && apiResponse.data) {
      return apiResponse.data;
    } else {
      return rejectWithValue(apiResponse.message || 'Failed to load ticket details');
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || 'Failed to fetch ticket details';
    return rejectWithValue(errMsg);
  }
});

export const createTicketThunk = createAsyncThunk<
  TicketDetails,
  CreateTicketRequest,
  { rejectValue: string }
>('tickets/create', async (ticketData, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post<ApiResponse<TicketDetails>>(
      '/api/tickets',
      ticketData
    );

    const apiResponse = response.data;
    if (apiResponse.status && apiResponse.data) {
      return apiResponse.data;
    } else {
      return rejectWithValue(apiResponse.message || 'Failed to create ticket');
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || 'Failed to create ticket';
    return rejectWithValue(errMsg);
  }
});

export const updateTicketThunk = createAsyncThunk<
  TicketDetails,
  { tenantId: string; ticketId: string; request: UpdateTicketRequest },
  { rejectValue: string }
>('tickets/update', async ({ tenantId, ticketId, request }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.put<ApiResponse<TicketDetails>>(
      `/api/tenants/${tenantId}/tickets/${ticketId}`,
      request
    );

    const apiResponse = response.data;
    if (apiResponse.status && apiResponse.data) {
      return apiResponse.data;
    } else {
      return rejectWithValue(apiResponse.message || 'Failed to update ticket');
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || 'Failed to update ticket';
    return rejectWithValue(errMsg);
  }
});

export const addCommentThunk = createAsyncThunk<
  TicketDetails,
  { tenantId: string; ticketId: string; request: AddCommentRequest },
  { rejectValue: string }
>('tickets/addComment', async ({ tenantId, ticketId, request }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post<ApiResponse<TicketDetails>>(
      `/api/tenants/${tenantId}/tickets/${ticketId}/comments`,
      request
    );

    const apiResponse = response.data;
    if (apiResponse.status && apiResponse.data) {
      return apiResponse.data;
    } else {
      return rejectWithValue(apiResponse.message || 'Failed to post comment');
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || 'Failed to add comment';
    return rejectWithValue(errMsg);
  }
});
