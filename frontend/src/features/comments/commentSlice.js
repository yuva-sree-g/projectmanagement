import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { commentsAPI } from '../../services/api';

// Async thunks
export const fetchTaskComments = createAsyncThunk(
  'comments/fetchTaskComments',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await commentsAPI.getByTask(taskId);
      return { taskId, comments: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch task comments');
    }
  }
);

export const fetchProjectComments = createAsyncThunk(
  'comments/fetchProjectComments',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await commentsAPI.getByProject(projectId);
      return { projectId, comments: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch project comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async (commentData, { rejectWithValue }) => {
    try {
      let response;
      if (commentData.task_id) {
        response = await commentsAPI.createForTask(commentData.task_id, commentData);
      } else if (commentData.project_id) {
        response = await commentsAPI.createForProject(commentData.project_id, commentData);
      } else {
        throw new Error('Either task_id or project_id is required');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create comment');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, commentData }, { rejectWithValue }) => {
    try {
      const response = await commentsAPI.update(commentId, commentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await commentsAPI.delete(commentId);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete comment');
    }
  }
);

const initialState = {
  taskComments: {},
  projectComments: {},
  loading: false,
  error: null,
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearComments: (state) => {
      state.taskComments = {};
      state.projectComments = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch task comments
      .addCase(fetchTaskComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskComments.fulfilled, (state, action) => {
        state.loading = false;
        state.taskComments[action.payload.taskId] = action.payload.comments;
      })
      .addCase(fetchTaskComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch project comments
      .addCase(fetchProjectComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectComments.fulfilled, (state, action) => {
        state.loading = false;
        state.projectComments[action.payload.projectId] = action.payload.comments;
      })
      .addCase(fetchProjectComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        const comment = action.payload;
        if (comment.task_id) {
          if (!state.taskComments[comment.task_id]) {
            state.taskComments[comment.task_id] = [];
          }
          state.taskComments[comment.task_id].unshift(comment);
        }
        if (comment.project_id) {
          if (!state.projectComments[comment.project_id]) {
            state.projectComments[comment.project_id] = [];
          }
          state.projectComments[comment.project_id].unshift(comment);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedComment = action.payload;
        // Update in task comments
        Object.keys(state.taskComments).forEach(taskId => {
          const index = state.taskComments[taskId].findIndex(c => c.id === updatedComment.id);
          if (index !== -1) {
            state.taskComments[taskId][index] = updatedComment;
          }
        });
        // Update in project comments
        Object.keys(state.projectComments).forEach(projectId => {
          const index = state.projectComments[projectId].findIndex(c => c.id === updatedComment.id);
          if (index !== -1) {
            state.projectComments[projectId][index] = updatedComment;
          }
        });
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        const deletedCommentId = action.payload;
        // Remove from task comments
        Object.keys(state.taskComments).forEach(taskId => {
          state.taskComments[taskId] = state.taskComments[taskId].filter(c => c.id !== deletedCommentId);
        });
        // Remove from project comments
        Object.keys(state.projectComments).forEach(projectId => {
          state.projectComments[projectId] = state.projectComments[projectId].filter(c => c.id !== deletedCommentId);
        });
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearComments } = commentSlice.actions;
export default commentSlice.reducer; 