import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../features/projects/projectSlice';
import ProjectInlineEdit from './ProjectInlineEdit';

const ProjectKanban = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, loading } = useSelector((state) => state.projects);

  const [filteredProjects, setFilteredProjects] = useState({});
  const [editingProject, setEditingProject] = useState(null);

  // Remove the duplicate fetchProjects call since data comes from parent component

  useEffect(() => {
    if (projects.length > 0) {
      const grouped = {
        active: projects.filter(project => project.status === 'active'),
        completed: projects.filter(project => project.status === 'completed'),
        on_hold: projects.filter(project => project.status === 'on_hold'),
        cancelled: projects.filter(project => project.status === 'cancelled'),
      };
      setFilteredProjects(grouped);
    }
  }, [projects]);

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleProjectClick = (project) => {
    setEditingProject(project);
  };

  const handleCloseEdit = () => {
    setEditingProject(null);
  };

  const handleSaveEdit = () => {
    // The parent component will handle refreshing the data
  };

  const columns = [
    { key: 'active', title: 'ACTIVE', color: 'bg-green-50' },
    { key: 'on_hold', title: 'ON HOLD', color: 'bg-yellow-50' },
    { key: 'completed', title: 'COMPLETED', color: 'bg-blue-50' },
    { key: 'cancelled', title: 'CANCELLED', color: 'bg-red-50' },
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
            <h1 className="text-3xl font-bold text-gray-900">Project Board</h1>
            <p className="text-gray-600 mt-2">Track your projects by status with our Kanban-style board</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
              <span className="text-sm font-medium text-gray-700">Total Projects: {projects.length}</span>
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
                {filteredProjects[column.key]?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {filteredProjects[column.key]?.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg hover:border-primary-300 transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {project.title}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-gray-600 text-xs mb-3 line-clamp-3">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {project.start_date && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Start: {new Date(project.start_date).toLocaleDateString()}
                      </span>
                    )}
                    {project.end_date && (
                      <span className={`px-2 py-1 rounded ${
                        new Date(project.end_date) < new Date() ? 'bg-red-100 text-red-600' : 'bg-gray-100'
                      }`}>
                        End: {new Date(project.end_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {(!filteredProjects[column.key] || filteredProjects[column.key].length === 0) && (
                <div className="bg-white bg-opacity-50 rounded-lg p-4 border-2 border-dashed border-gray-300 text-center">
                  <p className="text-gray-500 text-sm">No projects</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Inline Edit Modal */}
      {editingProject && (
        <ProjectInlineEdit
          project={editingProject}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ProjectKanban; 