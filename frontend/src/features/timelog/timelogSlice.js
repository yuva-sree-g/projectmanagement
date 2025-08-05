import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { timelogAPI } from '../../services/api';

// Async thunks
export const createTimeLog = createAsyncThunk(
  'timelog/createTimeLog',
  async (timeLogData, { rejectWithValue }) => {
    try {
      const response = await timelogAPI.createTimeLog(timeLogData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create time log');
    }
  }
);

export const fetchTimeLogs = createAsyncThunk(
  'timelog/fetchTimeLogs',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await timelogAPI.getTimeLogs(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch time logs');
    }
  }
);

export const updateTimeLog = createAsyncThunk(
  'timelog/updateTimeLog',
  async ({ id, timeLogData }, { rejectWithValue }) => {
    try {
      const response = await timelogAPI.updateTimeLog(id, timeLogData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update time log');
    }
  }
);

export const deleteTimeLog = createAsyncThunk(
  'timelog/deleteTimeLog',
  async (id, { rejectWithValue }) => {
    try {
      await timelogAPI.deleteTimeLog(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete time log');
    }
  }
);

export const fetchTimeSummary = createAsyncThunk(
  'timelog/fetchTimeSummary',
  async ({ userId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await timelogAPI.getTimeSummary(userId, { startDate, endDate });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch time summary');
    }
  }
);

const initialState = {
  timeLogs: [],
  timeSummary: null,
  loading: false,
  error: null,
  filters: {
    task_id: null,
    user_id: null,
    start_date: null,
    end_date: null,
  },
};

const timelogSlice = createSlice({
  name: 'timelog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        task_id: null,
        user_id: null,
        start_date: null,
        end_date: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Time Log
      .addCase(createTimeLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimeLog.fulfilled, (state, action) => {
        state.loading = false;
        state.timeLogs.unshift(action.payload);
      })
      .addCase(createTimeLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Time Logs
      .addCase(fetchTimeLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.timeLogs = action.payload;
      })
      .addCase(fetchTimeLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Time Log
      .addCase(updateTimeLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTimeLog.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.timeLogs.findIndex(log => log.id === action.payload.id);
        if (index !== -1) {
          state.timeLogs[index] = action.payload;
        }
      })
      .addCase(updateTimeLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Time Log
      .addCase(deleteTimeLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimeLog.fulfilled, (state, action) => {
        state.loading = false;
        state.timeLogs = state.timeLogs.filter(log => log.id !== action.payload);
      })
      .addCase(deleteTimeLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Time Summary
      .addCase(fetchTimeSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.timeSummary = action.payload;
      })
      .addCase(fetchTimeSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, clearFilters } = timelogSlice.actions;
export default timelogSlice.reducer; 