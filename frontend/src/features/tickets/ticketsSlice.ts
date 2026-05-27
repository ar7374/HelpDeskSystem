import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TicketListItem, TicketDetails, SearchRequest, TicketSearchCriteria, PaginatedListDto, TicketComment } from '../../shared/types';
import { 
  loadTicketsThunk, 
  loadTicketDetailsThunk, 
  createTicketThunk, 
  updateTicketThunk, 
  addCommentThunk 
} from './ticketsThunks';

interface TicketsState {
  ticketsList: PaginatedListDto<TicketListItem>;
  selectedTicket: TicketDetails | null;
  filters: SearchRequest<TicketSearchCriteria>;
  isLoading: boolean;
  error: string | null;
}

const initialFilters: SearchRequest<TicketSearchCriteria> = {
  pageNumber: 1,
  pageSize: 10,
  sortBy: 'CreatedAtUtc',
  sortDirection: 1, // Default Descending
  criteria: {
    status: null,
    priority: null,
    search: '',
  },
};

const initialState: TicketsState = {
  ticketsList: {
    data: [],
    size: 0,
    totalRecords: 0,
  },
  selectedTicket: null,
  filters: initialFilters,
  isLoading: false,
  error: null,
};

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SearchRequest<TicketSearchCriteria>>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
        // Reset page back to 1 when filters are changed
        pageNumber: action.payload.pageNumber !== undefined ? action.payload.pageNumber : 1,
      };
    },
    setCriteria: (state, action: PayloadAction<Partial<TicketSearchCriteria>>) => {
      state.filters.criteria = {
        ...state.filters.criteria,
        ...action.payload,
      };
      state.filters.pageNumber = 1; // Reset to page 1 on filter criteria change
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },
    clearTicketsError: (state) => {
      state.error = null;
    },
    realtimeCommentAdded: (state, action: PayloadAction<TicketComment>) => {
      if (state.selectedTicket && state.selectedTicket.id === action.payload.ticketId) {
        const comments = state.selectedTicket.comments;
        const exists = comments.some((c) => c.id === action.payload.id);
        if (!exists) {
          state.selectedTicket.comments = [...comments, action.payload];
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load All Tickets
      .addCase(loadTicketsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTicketsThunk.fulfilled, (state, action: PayloadAction<PaginatedListDto<TicketListItem>>) => {
        state.isLoading = false;
        state.ticketsList = action.payload;
        state.error = null;
      })
      .addCase(loadTicketsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Load Ticket Details
      .addCase(loadTicketDetailsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTicketDetailsThunk.fulfilled, (state, action: PayloadAction<TicketDetails>) => {
        state.isLoading = false;
        state.selectedTicket = action.payload;
        state.error = null;
      })
      .addCase(loadTicketDetailsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Ticket
      .addCase(createTicketThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTicketThunk.fulfilled, (state, action: PayloadAction<TicketDetails>) => {
        state.isLoading = false;
        state.selectedTicket = action.payload;
        state.error = null;
      })
      .addCase(createTicketThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Ticket Status/Assignment
      .addCase(updateTicketThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTicketThunk.fulfilled, (state, action: PayloadAction<TicketDetails>) => {
        state.isLoading = false;
        state.selectedTicket = action.payload;
        // Optionally update the ticket in the local list in-place so we don't have to trigger a reload thunk
        const index = state.ticketsList.data.findIndex((t: TicketListItem) => t.id === action.payload.id);
        if (index !== -1) {
          state.ticketsList.data[index] = {
            ...state.ticketsList.data[index],
            status: action.payload.status,
            agentName: action.payload.agent?.fullName,
          };
        }
        state.error = null;
      })
      .addCase(updateTicketThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add Comment
      .addCase(addCommentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCommentThunk.fulfilled, (state, action: PayloadAction<TicketDetails>) => {
        state.isLoading = false;
        state.selectedTicket = action.payload; // Comments inside the detailed ticket get updated
        state.error = null;
      })
      .addCase(addCommentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setCriteria, resetFilters, clearSelectedTicket, clearTicketsError, realtimeCommentAdded } = ticketsSlice.actions;
export default ticketsSlice.reducer;
