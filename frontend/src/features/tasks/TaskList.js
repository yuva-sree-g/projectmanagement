import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchTasks, deleteTask } from './taskSlice';
import { fetchProjects } from '../projects/projectSlice';
import TaskKanban from '../../components/TaskKanban';
import Comments from '../../components/Comments';
import TaskTimeTracking from '../../components/TaskTimeTracking';

const TaskList = () => {
  const dispatch = useDispatch();
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, loading, error } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
  const [showSpecificTask, setShowSpecificTask] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
  }, [dispatch]);

  // Refresh data when navigating back to tasks page
  useEffect(() => {
    const refreshData = () => {
      dispatch(fetchTasks());
      dispatch(fetchProjects());
    };

    // Refresh on component mount and when navigating back
    refreshData();

    // Also refresh when window gains focus (user comes back to tab)
    const handleFocus = () => {
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

  useEffect(() => {
    if (taskId) {
      setShowSpecificTask(true);
      // Refresh data when viewing a specific task to ensure we have the latest data
      dispatch(fetchTasks());
      dispatch(fetchProjects());
    } else {
      setShowSpecificTask(false);
    }
  }, [taskId, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'ready_to_test': return 'bg-orange-100 text-orange-800';
      case 'in_test': return 'bg-indigo-100 text-indigo-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesProject = projectFilter === 'all' || task.project_id === parseInt(projectFilter);
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show specific task view if taskId is provided
  if (showSpecificTask && taskId) {
    const specificTask = tasks.find(task => task.id === parseInt(taskId));
    if (!specificTask) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h2>
            <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      );
    }

    const project = projects.find(p => p.id === specificTask.project_id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Tasks
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {specificTask.title}
                  </h1>
                  <p className="mt-2 text-lg text-gray-600">Task Details</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/tasks/${taskId}/edit`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Task
                  </Link>
                </div>
              </div>
            </div>

            {/* Task Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Task Information */}
                <div className="p-8 border-r border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">Task Information</h3>
                      <p className="text-sm text-gray-500">Details and specifications</p>
                    </div>
                  </div>
                  
                  <dl className="space-y-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Description</dt>
                      <dd className="text-base text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {specificTask.description || 'No description provided'}
                      </dd>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Assignee</dt>
                      <dd className="text-base text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {specificTask.assignee_name || specificTask.assignee_username || 'Unassigned'}
                        </div>
                      </dd>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Status</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(specificTask.status)}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              specificTask.status === 'closed' ? 'bg-green-500' :
                              specificTask.status === 'in_progress' ? 'bg-blue-500' :
                              specificTask.status === 'review' ? 'bg-purple-500' :
                              specificTask.status === 'ready_to_test' ? 'bg-orange-500' :
                              specificTask.status === 'in_test' ? 'bg-indigo-500' :
                              specificTask.status === 'todo' ? 'bg-gray-500' :
                              'bg-gray-500'
                            }`}></div>
                            {specificTask.status === 'in_progress' ? 'In Progress' :
                             specificTask.status === 'ready_to_test' ? 'Ready to Test' :
                             specificTask.status === 'in_test' ? 'In Test' :
                             specificTask.status === 'todo' ? 'To Do' :
                             specificTask.status.charAt(0).toUpperCase() + specificTask.status.slice(1)}
                          </span>
                        </dd>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Priority</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${getPriorityColor(specificTask.priority)}`}>
                            {specificTask.priority.charAt(0).toUpperCase() + specificTask.priority.slice(1)}
                          </span>
                        </dd>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Estimated Hours</dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {specificTask.estimated_hours || '0'}
                          <span className="text-sm font-normal text-gray-500 ml-1">hours</span>
                        </dd>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Actual Hours</dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {specificTask.actual_hours || 0}
                          <span className="text-sm font-normal text-gray-500 ml-1">hours</span>
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Project Information */}
                <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">Project Information</h3>
                      <p className="text-sm text-gray-500">Associated project details</p>
                    </div>
                  </div>
                  
                  <dl className="space-y-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Project</dt>
                      <dd className="text-lg font-semibold text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {project?.title || 'Unknown Project'}
                      </dd>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Created</dt>
                        <dd className="text-base text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(specificTask.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </dd>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Last Updated</dt>
                        <dd className="text-base text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {specificTask.updated_at ? 
                              new Date(specificTask.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 
                              'Never updated'
                            }
                          </div>
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <Comments taskId={parseInt(taskId)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your tasks and track their progress
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                viewMode === 'kanban'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Board
            </button>
          </div>
          <Link
            to="/tasks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Task
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}



      {/* Conditional View Rendering */}
      {viewMode === 'kanban' ? (
        <TaskKanban />
      ) : (
        <>
          {/* Filters - Only show in list view */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="sr-only">
                Search tasks
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                id="status"
                name="status"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="ready_to_test">Ready to Test</option>
                <option value="in_test">In Test</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <select
                id="project"
                name="project"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || projectFilter !== 'all' ? 'No tasks match your filters.' : 'Get started by creating a new task.'}
          </p>
          {!searchTerm && statusFilter === 'all' && projectFilter === 'all' && (
            <div className="mt-6">
              <Link
                to="/tasks/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Task
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredTasks.map((task) => {
              const project = projects.find(p => p.id === task.project_id);
              return (
                <li key={task.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {task.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-gray-900">
                              {task.title}
                            </h3>
                            <div className="ml-2 flex space-x-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {task.description?.substring(0, 100)}
                            {task.description?.length > 100 && '...'}
                          </p>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            {project && (
                              <span className="mr-4">Project: {project.title}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTimeTracking(true);
                          }}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Time
                        </button>
                        <Link
                          to={`/tasks/${task.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
        </>
      )}

      {/* Time Tracking Modal */}
      {showTimeTracking && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TaskTimeTracking 
              task={selectedTask} 
              onClose={() => {
                setShowTimeTracking(false);
                setSelectedTask(null);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList; 