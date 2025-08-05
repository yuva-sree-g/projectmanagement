import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksAPI } from '../../services/api';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.getAll(params);
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.create(taskData);
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.update(id, taskData);
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await tasksAPI.delete(id);
      return id;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete task');
    }
  }
);

export const createTimeLog = createAsyncThunk(
  'tasks/createTimeLog',
  async ({ taskId, timeLogData }, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.createTimeLog(taskId, timeLogData);
      return { taskId, timeLog: response.data };
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to create time log');
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.getMyTasks(params);
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch my tasks');
    }
  }
);

export const fetchMyTaskStats = createAsyncThunk(
  'tasks/fetchMyTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.getMyTaskStats();
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch task stats');
    }
  }
);

export const fetchPerformanceMetrics = createAsyncThunk(
  'tasks/fetchPerformanceMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.getPerformanceMetrics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch performance metrics');
    }
  }
);

const initialState = {
  tasks: [],
  myTasks: [],
  taskStats: null,
  performanceMetrics: null,
  currentTask: null,
  timeLogs: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create time log
      .addCase(createTimeLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimeLog.fulfilled, (state, action) => {
        state.loading = false;
        state.timeLogs.push(action.payload.timeLog);
        // Update task's actual hours
        const task = state.tasks.find(t => t.id === action.payload.taskId);
        if (task) {
          task.actual_hours += action.payload.timeLog.hours;
        }
      })
      .addCase(createTimeLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my tasks
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.myTasks = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my task stats
      .addCase(fetchMyTaskStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTaskStats.fulfilled, (state, action) => {
        state.loading = false;
        state.taskStats = action.payload;
      })
      .addCase(fetchMyTaskStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch performance metrics
      .addCase(fetchPerformanceMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceMetrics = action.payload;
      })
      .addCase(fetchPerformanceMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentTask, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer; 