import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTasks } from '../features/tasks/taskSlice';
import TaskInlineEdit from './TaskInlineEdit';

const TaskKanban = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);

  const [filteredTasks, setFilteredTasks] = useState({});
  const [editingTask, setEditingTask] = useState(null);

  // Remove the duplicate fetchTasks call since data comes from parent component

  useEffect(() => {
    if (tasks.length > 0) {
      const grouped = {
        todo: tasks.filter(task => task.status === 'todo'),
        in_progress: tasks.filter(task => task.status === 'in_progress'),
        review: tasks.filter(task => task.status === 'review'),
        ready_to_test: tasks.filter(task => task.status === 'ready_to_test'),
        in_test: tasks.filter(task => task.status === 'in_test'),
        closed: tasks.filter(task => task.status === 'closed'),
      };
      setFilteredTasks(grouped);
    }
  }, [tasks]);

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Unknown Project';
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      ready_to_test: 'bg-orange-100 text-orange-800',
      in_test: 'bg-indigo-100 text-indigo-800',
      closed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
      urgent: 'bg-red-200 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleCloseEdit = () => {
    setEditingTask(null);
  };

  const handleSaveEdit = () => {
    // The parent component will handle refreshing the data
  };

  const columns = [
    { key: 'todo', title: 'TO DO', color: 'bg-gray-50' },
    { key: 'in_progress', title: 'IN PROGRESS', color: 'bg-blue-50' },
    { key: 'review', title: 'REVIEW', color: 'bg-purple-50' },
    { key: 'ready_to_test', title: 'READY TO TEST', color: 'bg-orange-50' },
    { key: 'in_test', title: 'IN TEST', color: 'bg-indigo-50' },
    { key: 'closed', title: 'DONE', color: 'bg-green-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
            <p className="text-gray-600 mt-2">Track your tasks by status with our Kanban-style board</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
              <span className="text-sm font-medium text-gray-700">Total Tasks: {tasks.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <div
            key={column.key}
            className={`flex-shrink-0 w-80 ${column.color} rounded-xl p-5 shadow-sm border border-gray-200`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">{column.title}</h3>
              <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-700 shadow-sm border">
                {filteredTasks[column.key]?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {filteredTasks[column.key]?.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg hover:border-primary-300 transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {task.title}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {getProjectName(task.project_id)}
                    </span>
                  </div>

                  {task.estimated_hours && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {task.estimated_hours}h estimated
                      {task.actual_hours > 0 && (
                        <span className="ml-2 text-blue-600">
                          ({task.actual_hours}h logged)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {(!filteredTasks[column.key] || filteredTasks[column.key].length === 0) && (
                <div className="bg-white bg-opacity-50 rounded-lg p-4 border-2 border-dashed border-gray-300 text-center">
                  <p className="text-gray-500 text-sm">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Inline Edit Modal */}
      {editingTask && (
        <TaskInlineEdit
          task={editingTask}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default TaskKanban; 