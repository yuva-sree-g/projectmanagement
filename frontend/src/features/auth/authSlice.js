import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        // Extract the first error message from validation errors
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        // Extract the first error message from validation errors
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Registration failed');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // Set a flag to indicate successful registration
        localStorage.setItem('registrationSuccess', 'true');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer; 