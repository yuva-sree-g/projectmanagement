import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTimeLog, fetchTimeLogs, deleteTimeLog } from '../features/timelog/timelogSlice';
import { updateTask } from '../features/tasks/taskSlice';

const TaskTimeTracking = ({ task, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { timeLogs, loading } = useSelector((state) => state.timelog);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (task) {
      dispatch(fetchTimeLogs({ task_id: task.id }));
    }
  }, [dispatch, task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hours || formData.hours <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const timeLogData = {
      task_id: task.id,
      hours: parseInt(formData.hours),
      description: formData.description.trim() || null,
      date: new Date(formData.date).toISOString(),
    };

    await dispatch(createTimeLog(timeLogData));
    
    // Update task's actual hours
    const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0) + parseInt(formData.hours);
    await dispatch(updateTask({ id: task.id, taskData: { actual_hours: totalHours } }));
    
    // Reset form
    setFormData({
      hours: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
  };

  const handleDelete = async (timeLogId) => {
    if (window.confirm('Are you sure you want to delete this time log?')) {
      await dispatch(deleteTimeLog(timeLogId));
      
      // Recalculate total hours
      const remainingLogs = timeLogs.filter(log => log.id !== timeLogId);
      const totalHours = remainingLogs.reduce((sum, log) => sum + log.hours, 0);
      await dispatch(updateTask({ id: task.id, taskData: { actual_hours: totalHours } }));
    }
  };

  const getTotalHours = () => {
    return timeLogs.reduce((total, log) => total + log.hours, 0);
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Time Tracking</h3>
          <p className="text-sm text-gray-600">Task: {task.title}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-600">Estimated Hours</p>
              <p className="text-xl font-semibold text-blue-900">{task.estimated_hours || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-600">Actual Hours</p>
              <p className="text-xl font-semibold text-green-900">{task.actual_hours || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-purple-600">Logged Today</p>
              <p className="text-xl font-semibold text-purple-900">{getTotalHours()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Time Log Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {showAddForm ? 'Cancel' : 'Add Time Log'}
        </button>
      </div>

      {/* Add Time Log Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Add Time Log</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  name="hours"
                  min="0.5"
                  step="0.5"
                  value={formData.hours}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.hours ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter hours"
                />
                {errors.hours && (
                  <p className="mt-1 text-sm text-red-600">{errors.hours}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="What you worked on..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Time Log'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Time Logs List */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Time Logs</h4>
        {timeLogs.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No time logs</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start tracking your time by adding your first log.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeLogs.map((timeLog) => (
              <div key={timeLog.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {timeLog.hours} hours
                      </p>
                      {timeLog.description && (
                        <p className="text-sm text-gray-600">{timeLog.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatDate(timeLog.date)}</p>
                      <p className="text-xs text-gray-400">
                        Logged at {formatTime(timeLog.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleDelete(timeLog.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTimeTracking; 