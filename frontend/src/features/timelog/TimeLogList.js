import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimeLogs, deleteTimeLog, setFilters, clearFilters } from './timelogSlice';
import TimeLogForm from './TimeLogForm';

const TimeLogList = ({ taskId = null, userId = null }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTimeLog, setEditingTimeLog] = useState(null);
  const [filters, setLocalFilters] = useState({
    start_date: '',
    end_date: '',
  });

  const dispatch = useDispatch();
  const { timeLogs, loading, error } = useSelector((state) => state.timelog);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Set initial filters based on props
    const initialFilters = {};
    if (taskId) initialFilters.task_id = taskId;
    if (userId) initialFilters.user_id = userId;
    
    dispatch(setFilters(initialFilters));
    dispatch(fetchTimeLogs(initialFilters));
  }, [dispatch, taskId, userId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    const filterParams = {
      ...filters,
      ...(taskId && { task_id: taskId }),
      ...(userId && { user_id: userId }),
    };
    dispatch(setFilters(filterParams));
    dispatch(fetchTimeLogs(filterParams));
  };

  const clearAllFilters = () => {
    setLocalFilters({
      start_date: '',
      end_date: '',
    });
    dispatch(clearFilters());
    dispatch(fetchTimeLogs({}));
  };

  const handleEdit = (timeLog) => {
    setEditingTimeLog(timeLog);
    setShowForm(true);
  };

  const handleDelete = async (timeLogId) => {
    if (window.confirm('Are you sure you want to delete this time log?')) {
      await dispatch(deleteTimeLog(timeLogId));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTimeLog(null);
    // Refresh the list
    const currentFilters = { ...filters };
    if (taskId) currentFilters.task_id = taskId;
    if (userId) currentFilters.user_id = userId;
    dispatch(fetchTimeLogs(currentFilters));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTotalHours = () => {
    return timeLogs.reduce((total, log) => total + log.hours, 0);
  };

  if (loading && timeLogs.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Time Logs
            {taskId && <span className="text-sm text-gray-500 ml-2">(Task specific)</span>}
            {userId && <span className="text-sm text-gray-500 ml-2">(User specific)</span>}
          </h2>
          {timeLogs.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Total: {getTotalHours()} hours
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Add Time Log
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Apply Filters
            </button>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Time Logs List */}
      {timeLogs.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No time logs</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first time log entry.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {timeLogs.map((timeLog) => (
              <li key={timeLog.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {timeLog.task_title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {timeLog.project_title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {timeLog.hours} hours
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(timeLog.date)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {timeLog.description}
                      </p>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Logged on {formatDate(timeLog.created_at)} at {formatTime(timeLog.created_at)}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(timeLog)}
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(timeLog.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Time Log Form Modal */}
      {showForm && (
        <TimeLogForm
          timeLog={editingTimeLog}
          onClose={handleCloseForm}
          taskId={taskId}
        />
      )}
    </div>
  );
};

export default TimeLogList; 