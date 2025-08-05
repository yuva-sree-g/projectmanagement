import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { fetchProjects } from '../features/projects/projectSlice';
import { fetchTasks, fetchMyTaskStats, fetchPerformanceMetrics } from '../features/tasks/taskSlice';
import PerformanceMetrics from './PerformanceMetrics';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { tasks, taskStats, performanceMetrics, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Calculate My Tasks count from tasks array (fallback when taskStats API fails)
  const myTasksCount = tasks.filter(task => task.assignee_id === currentUser?.id).length;

  const refreshData = () => {
    dispatch(fetchTasks());
    dispatch(fetchMyTaskStats());
    dispatch(fetchPerformanceMetrics());
    dispatch(fetchProjects());
    setLastUpdated(new Date());
  };

  useEffect(() => {
    refreshData();
  }, [dispatch]);

  // Refresh data when component comes into focus (e.g., when navigating back to dashboard)
  useEffect(() => {
    const handleFocus = () => {
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

  // Refresh data when navigating to dashboard (using React Router's location)
  useEffect(() => {
    refreshData();
  }, [dispatch, location.pathname]);

  // Calculate task status distribution for pie chart
  const getTaskStatusData = () => {
    const statusCounts = {
      todo: 0,
      in_progress: 0,
      review: 0,
      ready_to_test: 0,
      in_test: 0,
      closed: 0,
    };

    tasks.forEach(task => {
      if (statusCounts.hasOwnProperty(task.status)) {
        statusCounts[task.status]++;
      }
    });

    return {
      labels: ['To Do', 'In Progress', 'Review', 'Ready to Test', 'In Test', 'Closed'],
      datasets: [
        {
          data: [
            statusCounts.todo,
            statusCounts.in_progress,
            statusCounts.review,
            statusCounts.ready_to_test,
            statusCounts.in_test,
            statusCounts.closed,
          ],
          backgroundColor: [
            '#6B7280', // Gray for todo
            '#3B82F6', // Blue for in progress
            '#8B5CF6', // Purple for review
            '#F59E0B', // Orange for ready to test
            '#6366F1', // Indigo for in test
            '#10B981', // Green for closed
          ],
          borderColor: [
            '#4B5563',
            '#2563EB',
            '#7C3AED',
            '#D97706',
            '#4F46E5',
            '#059669',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const stats = [
    {
      name: 'Total Projects',
      value: projects.length,
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      onClick: () => navigate('/projects'),
    },
    {
      name: 'Total Tasks',
      value: tasks.length,
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      onClick: () => navigate('/tasks'),
    },
    {
      name: 'My Tasks',
      value: myTasksCount,
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      onClick: () => navigate('/tasks'),
      subtitle: 'Assigned to me',
    },
    {
      name: 'Closed Tasks',
      value: tasks.filter(task => task.status === 'closed').length,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      onClick: () => navigate('/tasks?status=closed'),
    },
  ];

  const recentProjects = projects.slice(0, 5);
  const recentTasks = tasks.slice(0, 5);

  if (projectsLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center relative">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Track your projects and tasks at a glance
          </p>
          <div className="absolute top-0 right-0 flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={refreshData}
              disabled={projectsLoading || tasksLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className={`w-4 h-4 mr-2 ${projectsLoading || tasksLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {projectsLoading || tasksLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className={`${stat.bgColor} rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50`}
              onClick={stat.onClick}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.name}
                    </p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                    <svg
                      className="h-8 w-8 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Status Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Task Status Distribution
              </h3>
              <p className="text-gray-600 mt-1">Overview of all tasks by status</p>
            </div>
            <div className="p-6">
              {tasks.length > 0 ? (
                <div className="flex items-center justify-center">
                  <div className="w-64 h-64">
                    <Pie 
                      data={getTaskStatusData()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true,
                              font: {
                                size: 12
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Create your first task to see the chart</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <PerformanceMetrics metrics={performanceMetrics} />
        </div>

        {/* All Projects and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* All Projects */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                  All Projects
              </h3>
                <p className="text-gray-600 mt-1">All projects in the system</p>
              </div>
              <button
                onClick={() => navigate('/projects')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="p-6">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Create your first project to get started</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate(`/projects`)}
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {project.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {project.description?.substring(0, 60)}
                          {project.description?.length > 60 && '...'}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>Owner: {project.owner?.username || 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All Tasks */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                  All Tasks
              </h3>
                <p className="text-gray-600 mt-1">All tasks in the system</p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="p-6">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Create your first task to get started</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {tasks.map((task) => {
                    const project = projects.find(p => p.id === task.project_id);
                    return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description?.substring(0, 60)}
                          {task.description?.length > 60 && '...'}
                        </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span>Project: {project?.title || 'Unknown'}</span>
                            <span className="mx-2">•</span>
                            <span>Assignee: {task.assignee?.username || 'Unassigned'}</span>
                            <span className="mx-2">•</span>
                            <span>Priority: {task.priority}</span>
                          </div>
                      </div>
                        <div className="flex flex-col items-end space-y-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        task.status === 'closed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                        task.status === 'ready_to_test' ? 'bg-orange-100 text-orange-800' :
                        task.status === 'in_test' ? 'bg-indigo-100 text-indigo-800' :
                        task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                          {task.assignee_id === currentUser?.id && (
                            <span className="text-xs text-purple-600 font-medium">My Task</span>
                          )}
                        </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 