# AI Prompt Library

## Database Design Prompts

### Prompt 1: Schema Generation
**Prompt**: "Design a PostgreSQL database schema for a project management system with users, projects, tasks, time logs, and comments. Include proper relationships and constraints."
**Context**: Needed a complete database design for the project management dashboard
**Output Quality**: 9/10
**Iterations**: 2 refinements needed
**Final Result**: Implemented User, Project, Task, TimeLog, and Comment models with proper foreign key relationships and SQLAlchemy ORM

### Prompt 2: Model Relationships
**Prompt**: "Create SQLAlchemy models for the project management system with proper relationships and eager loading for performance."
**Context**: Required optimized database queries with joinedload
**Output Quality**: 8/10
**Iterations**: 1 refinement needed
**Final Result**: Implemented models with relationship() definitions and proper back_populates

## Code Generation Prompts

### Prompt 3: FastAPI Endpoint Creation
**Prompt**: "Create a FastAPI endpoint for updating tasks with proper error handling, validation, and email notifications."
**Context**: Needed comprehensive task update functionality
**Output Quality**: 8/10
**Modifications**: Added custom email notification logic and improved error handling

### Prompt 4: React Component Generation
**Prompt**: "Create a React component for displaying task details with inline editing, time tracking, and comments."
**Context**: Required a comprehensive task management interface
**Output Quality**: 7/10
**Modifications**: Simplified component structure and improved state management

### Prompt 5: Redux Slice Creation
**Prompt**: "Create a Redux Toolkit slice for managing tasks with async thunks for API calls."
**Context**: Needed state management for tasks with CRUD operations
**Output Quality**: 9/10
**Modifications**: Added proper error handling and loading states

## Problem-Solving Prompts

### Prompt 6: Email Configuration Debugging
**Prompt**: "Debug why email notifications are not being sent. Check SMTP configuration and FastAPI-Mail setup."
**Context**: Email notifications were failing silently
**Effectiveness**: 8/10
**Impact**: Successfully resolved email delivery issues and implemented proper error handling

### Prompt 7: Docker Container Issues
**Prompt**: "Fix Docker container networking issues. Containers are not communicating properly."
**Context**: Backend and database containers couldn't connect
**Effectiveness**: 9/10
**Impact**: Resolved container networking and port conflicts

### Prompt 8: React State Management
**Prompt**: "Fix React component state resetting issue. File upload component loses selected file on re-render."
**Context**: React StrictMode was causing state resets
**Effectiveness**: 7/10
**Impact**: Implemented useRef for persistent file storage

### Prompt 9: API Route Conflicts
**Prompt**: "Resolve API route conflict between /performance-metrics and /{task_id} endpoints."
**Context**: FastAPI route ordering was causing conflicts
**Effectiveness**: 9/10
**Impact**: Moved performance metrics endpoint to main app level

### Prompt 10: CORS Configuration
**Prompt**: "Configure CORS for FastAPI to allow requests from React frontend in development and production."
**Context**: Frontend couldn't connect to backend API
**Effectiveness**: 8/10
**Impact**: Properly configured CORS for both development and production environments

## Deployment Prompts

### Prompt 11: Vercel Deployment
**Prompt**: "Deploy React frontend to Vercel with proper environment variables and build configuration."
**Context**: Needed production deployment for frontend
**Effectiveness**: 9/10
**Impact**: Successfully deployed frontend with automatic builds

### Prompt 12: Render Backend Deployment
**Prompt**: "Deploy FastAPI backend to Render with PostgreSQL database and environment variables."
**Context**: Needed production deployment for backend
**Effectiveness**: 8/10
**Impact**: Successfully deployed backend with database connection

## Performance Optimization Prompts

### Prompt 13: Database Query Optimization
**Prompt**: "Optimize database queries for task listing with eager loading of relationships."
**Context**: Task listing was slow due to N+1 query problem
**Effectiveness**: 9/10
**Impact**: Implemented joinedload for efficient querying

### Prompt 14: React Performance
**Prompt**: "Optimize React component rendering for large task lists with virtualization."
**Context**: Dashboard was slow with many tasks
**Effectiveness**: 7/10
**Impact**: Implemented proper memoization and optimized re-renders

## Security Prompts

### Prompt 15: JWT Authentication
**Prompt**: "Implement secure JWT authentication with proper token validation and refresh logic."
**Context**: Needed secure user authentication
**Effectiveness**: 9/10
**Impact**: Implemented secure JWT-based authentication system

### Prompt 16: Input Validation
**Prompt**: "Add comprehensive input validation for all API endpoints using Pydantic schemas."
**Context**: Needed to prevent injection attacks and ensure data integrity
**Effectiveness**: 8/10
**Impact**: Implemented proper validation for all request/response schemas 