import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import projectReducer from '../features/projects/projectSlice';
import taskReducer from '../features/tasks/taskSlice';
import commentReducer from '../features/comments/commentSlice';
import timelogReducer from '../features/timelog/timelogSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    comments: commentReducer,
    timelog: timelogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}); 