import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectsAPI } from '../../services/api';

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.getAll(params);
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.create(projectData);
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.update(id, projectData);
      return response.data;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await projectsAPI.delete(id);
      return id;
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const firstError = error.response.data.detail[0];
        return rejectWithValue(firstError.msg || 'Validation error');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete project');
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentProject, clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer; 