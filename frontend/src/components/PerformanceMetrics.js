import React from 'react';

const PerformanceMetrics = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance Metrics
          </h3>
          <p className="text-gray-600 mt-1">Team productivity and project health insights</p>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'critical': return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Performance Metrics
        </h3>
        <p className="text-gray-600 mt-1">Team productivity and project health insights</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Productivity Score */}
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Productivity Score</p>
                <p className="text-2xl font-bold text-purple-900">{metrics.productivity_score}%</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Project Health */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Project Health</h4>
          <div className="space-y-3">
            {metrics.project_health.map((project) => (
              <div key={project.project_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{project.project_title}</p>
                  <p className="text-sm text-gray-600">
                    {project.completed_tasks} of {project.total_tasks} tasks completed
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(project.health_status)}`}>
                    {project.completion_rate}%
                  </span>
                  <svg className={`w-4 h-4 ${getHealthColor(project.health_status).split(' ')[0]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getHealthIcon(project.health_status)} />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics; 