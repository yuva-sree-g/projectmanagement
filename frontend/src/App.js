import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { usersAPI } from './services/api';
import { setUser } from './features/auth/authSlice';

// Components
import Layout from './components/Layout';
import LoginForm from './features/auth/LoginForm';
import RegisterForm from './features/auth/RegisterForm';
import Dashboard from './components/Dashboard';
import ProjectList from './features/projects/ProjectList';
import ProjectForm from './features/projects/ProjectForm';
import TaskList from './features/tasks/TaskList';
import TaskForm from './features/tasks/TaskForm';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated and fetch user data
    if (isAuthenticated && !user) {
      const fetchUser = async () => {
        try {
          const response = await usersAPI.getCurrentUser();
          dispatch(setUser(response.data));
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      };
      fetchUser();
    }
  }, [isAuthenticated, user, dispatch]);

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/new" element={<TaskForm />} />
          <Route path="tasks/:id" element={<TaskList />} />
          <Route path="tasks/:id/edit" element={<TaskForm />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App; 