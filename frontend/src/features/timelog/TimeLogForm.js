import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTimeLog, updateTimeLog, clearError } from './timelogSlice';
import { fetchTasks } from '../tasks/taskSlice';

const TimeLogForm = ({ timeLog = null, onClose, taskId = null }) => {
  const [formData, setFormData] = useState({
    task_id: taskId || '',
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.timelog);
  const { tasks } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch tasks if not already loaded
    if (tasks.length === 0) {
      dispatch(fetchTasks());
    }
  }, [dispatch, tasks.length]);

  useEffect(() => {
    // If editing existing time log, populate form
    if (timeLog) {
      setFormData({
        task_id: timeLog.task_id.toString(),
        hours: timeLog.hours.toString(),
        description: timeLog.description,
        date: new Date(timeLog.date).toISOString().split('T')[0],
      });
    }
  }, [timeLog]);

  useEffect(() => {
    if (error) {
      setErrors({ general: error });
    }
  }, [error]);

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
    
    if (!formData.task_id) {
      newErrors.task_id = 'Task is required';
    }
    
    if (!formData.hours || formData.hours <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (!validateForm()) {
      return;
    }

    const timeLogData = {
      task_id: parseInt(formData.task_id),
      hours: parseInt(formData.hours),
      description: formData.description.trim(),
      date: new Date(formData.date).toISOString(),
    };

    if (timeLog) {
      // Update existing time log
      await dispatch(updateTimeLog({ id: timeLog.id, timeLogData }));
    } else {
      // Create new time log
      await dispatch(createTimeLog(timeLogData));
    }

    // If successful, close form
    if (!error) {
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {timeLog ? 'Edit Time Log' : 'Add Time Log'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Selection */}
          <div>
            <label htmlFor="task_id" className="block text-sm font-medium text-gray-700 mb-1">
              Task
            </label>
            <select
              id="task_id"
              name="task_id"
              value={formData.task_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.task_id ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={!!taskId} // Disable if task is pre-selected
            >
              <option value="">Select a task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} - {task.project?.title}
                </option>
              ))}
            </select>
            {errors.task_id && (
              <p className="mt-1 text-sm text-red-600">{errors.task_id}</p>
            )}
          </div>

          {/* Hours */}
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
              Hours
            </label>
            <input
              type="number"
              id="hours"
              name="hours"
              min="0.5"
              step="0.5"
              value={formData.hours}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.hours ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter hours worked"
            />
            {errors.hours && (
              <p className="mt-1 text-sm text-red-600">{errors.hours}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
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

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe what you worked on..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                timeLog ? 'Update' : 'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeLogForm; 