# 🏗️ Project Management Dashboard - System Architecture

## 📋 Overview

The Project Management Dashboard is a modern, full-stack web application built with FastAPI, React, and PostgreSQL. This document provides a comprehensive overview of the system architecture, data flow, and technical implementation.

## 🎯 System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Production Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (PostgreSQL)  │
│   CDN/Static    │    │   FastAPI       │    │   Cloud DB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Data Flow Architecture

### Authentication Flow
```
User Interface ──► Frontend (React) ──► Backend (FastAPI) ──► Database (PostgreSQL)
     ▲                    │                    │                    │
     │                    ▼                    ▼                    ▼
     └────────── JWT Token ◄── User Validation ◄── Password Hash
```

### Project Management Flow
```
User Interface ──► Frontend (React) ──► Backend (FastAPI) ──► Database (PostgreSQL)
     ▲                    │                    │                    │
     │                    ▼                    ▼                    ▼
     └────────── Email Notifications ◄── Business Logic ◄── Data Validation
```

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │   Projects  │    │    Tasks    │
│             │    │             │    │             │
│ - id        │    │ - id        │    │ - id        │
│ - username  │    │ - title     │    │ - title     │
│ - email     │    │ - status    │    │ - status    │
│ - password  │    │ - owner_id  │    │ - project_id│
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌─────────────┐
                    │  TimeLogs   │
                    │             │
                    │ - task_id   │
                    │ - user_id   │
                    │ - hours     │
                    └─────────────┘
```

### Database Tables

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

#### Projects Table
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR DEFAULT 'active',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    status taskstatus DEFAULT 'todo',
    priority taskpriority DEFAULT 'medium',
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    project_id INTEGER REFERENCES projects(id),
    assignee_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

#### TimeLogs Table
```sql
CREATE TABLE time_logs (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    user_id INTEGER REFERENCES users(id),
    hours INTEGER NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Technology Stack

### Frontend Layer
```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                          │
├─────────────────────────────────────────────────────────────┤
│ • React 18.x - UI Framework                               │
│ • Redux Toolkit - State Management                        │
│ • React Router - Navigation                               │
│ • Tailwind CSS - Styling                                  │
│ • Axios - HTTP Client                                     │
│ • Chart.js - Data Visualization                           │
└─────────────────────────────────────────────────────────────┘
```

### Backend Layer
```
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                         │
├─────────────────────────────────────────────────────────────┤
│ • FastAPI - Web Framework                                 │
│ • SQLAlchemy - ORM                                        │
│ • PostgreSQL - Database                                   │
│ • JWT - Authentication                                    │
│ • Pydantic - Data Validation                             │
│ • FastAPI-Mail - Email Notifications                     │
│ • Python-dotenv - Environment Management                 │
└─────────────────────────────────────────────────────────────┘
```

### Infrastructure Layer
```
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure                            │
├─────────────────────────────────────────────────────────────┤
│ • Docker - Containerization                               │
│ • Docker Compose - Local Development                      │
│ • Vercel - Frontend Deployment                           │
│ • Render - Backend Deployment                             │
│ • PostgreSQL - Cloud Database                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Security Architecture

### Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  Frontend   │    │  Backend    │
│  Login      │───►│  Form       │───►│  Validate   │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐    ┌─────────────┐
                    │   JWT       │    │  Database   │
                    │  Token      │    │  Check      │
                    └─────────────┘    └─────────────┘
```

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Configurable cross-origin requests
- **Input Validation**: Pydantic models for data validation
- **SQL Injection Protection**: SQLAlchemy ORM
- **Environment Variables**: Secure configuration management

## 📊 API Architecture

### RESTful API Endpoints

#### Authentication
```
POST /auth/login          - User authentication
POST /auth/register       - User registration
```

#### Projects
```
GET    /projects          - List all projects
POST   /projects          - Create new project
GET    /projects/{id}     - Get project details
PUT    /projects/{id}     - Update project
DELETE /projects/{id}     - Delete project
```

#### Tasks
```
GET    /tasks             - List all tasks
POST   /tasks             - Create new task
GET    /tasks/{id}        - Get task details
PUT    /tasks/{id}        - Update task
DELETE /tasks/{id}        - Delete task
GET    /tasks/my-tasks    - Get user's tasks
```

#### Time Tracking
```
POST   /timelog           - Create time log
GET    /timelog           - List time logs
PUT    /timelog/{id}      - Update time log
DELETE /timelog/{id}      - Delete time log
```

## 🚀 Deployment Architecture

### Local Development
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (localhost:3000) │◄──►│   (localhost:8000) │◄──►│   (localhost:5432) │
│   React Dev     │    │   FastAPI Dev   │    │   PostgreSQL   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Production Deployment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (Render DB)   │
│   - CDN         │    │   - FastAPI     │    │   - PostgreSQL  │
│   - Static Files│    │   - Python      │    │   - Cloud       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 State Management Architecture

### Redux Store Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    Redux Store                             │
├─────────────────────────────────────────────────────────────┤
│ • Auth Slice - User authentication state                   │
│ • Projects Slice - Project management state                │
│ • Tasks Slice - Task management state                      │
│ • TimeLog Slice - Time tracking state                      │
│ • Comments Slice - Comment management state                │
└─────────────────────────────────────────────────────────────┘
```

### State Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Action    │───►│   Reducer   │───►│    State    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Component  │
                    │   Render    │
                    └─────────────┘
```

## 📱 Component Architecture

### Frontend Component Hierarchy
```
App
├── Layout
│   ├── Sidebar
│   ├── Header
│   └── Main Content
├── Dashboard
│   ├── PerformanceMetrics
│   └── Statistics
├── Projects
│   ├── ProjectList
│   ├── ProjectKanban
│   └── ProjectForm
├── Tasks
│   ├── TaskList
│   ├── TaskKanban
│   └── TaskForm
└── Auth
    ├── LoginForm
    └── RegisterForm
```

## 🔄 Data Flow Patterns

### CRUD Operations Flow
```
1. User Action (Create/Read/Update/Delete)
2. Component Dispatch Action
3. Redux Thunk API Call
4. Backend API Endpoint
5. Database Operation
6. Response to Frontend
7. State Update
8. UI Re-render
```

### Real-time Updates
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Database  │───►│   Backend   │───►│  Frontend   │
│   Change    │    │   API       │    │   State     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🧪 Testing Architecture

### Testing Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Unit Tests    │    │ Integration     │    │   E2E Tests     │
│   - Components  │    │   Tests         │    │   - User Flows  │
│   - Reducers    │    │   - API Tests   │    │   - Scenarios   │
│   - Utils       │    │   - DB Tests    │    │   - Edge Cases  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📈 Performance Architecture

### Optimization Strategies
- **Frontend**: React.memo, useMemo, useCallback
- **Backend**: Database indexing, query optimization
- **API**: Response caching, pagination
- **Database**: Connection pooling, query optimization

### Monitoring & Logging
- **Application Logs**: Structured logging with levels
- **Performance Metrics**: Response times, throughput
- **Error Tracking**: Exception handling and reporting
- **User Analytics**: Usage patterns and metrics

## 🔧 Development Workflow

### Git Workflow
```
Feature Branch ──► Development ──► Testing ──► Production
     │              │              │              │
     ▼              ▼              ▼              ▼
  Feature     ──►  Staging   ──►  QA      ──►  Live
```

### CI/CD Pipeline
```
Code Push ──► Build ──► Test ──► Deploy ──► Monitor
    │         │        │        │         │
    ▼         ▼        ▼        ▼         ▼
  GitHub   Docker   Jest    Vercel   Logs
```

## 🎯 Key Features Architecture

### Project Management
- **Kanban Board**: Visual project status tracking
- **Project CRUD**: Full project lifecycle management
- **Status Tracking**: Active, On Hold, Completed, Cancelled

### Task Management
- **Task Assignment**: User assignment and tracking
- **Priority Levels**: Low, Medium, High, Urgent
- **Status Workflow**: Todo → In Progress → Review → Ready to Test → In Test → Closed

### Time Tracking
- **Time Logging**: Hours spent on tasks
- **Time Reports**: Summary and analytics
- **Estimation vs Actual**: Track project accuracy

### User Management
- **Authentication**: JWT-based secure login
- **Authorization**: Role-based access control
- **User Profiles**: Personal information management

## 🚀 Scalability Considerations

### Horizontal Scaling
- **Load Balancing**: Multiple backend instances
- **Database Sharding**: Distributed data storage
- **CDN**: Global content delivery

### Vertical Scaling
- **Resource Optimization**: Memory and CPU usage
- **Database Optimization**: Query performance
- **Caching**: Redis for session and data caching

## 🔒 Security Considerations

### Data Protection
- **Encryption**: Data in transit and at rest
- **Access Control**: Role-based permissions
- **Audit Logging**: User activity tracking

### Compliance
- **GDPR**: Data privacy compliance
- **Security Headers**: HTTPS, CSP, HSTS
- **Input Sanitization**: XSS and injection prevention

---

## 📚 Additional Resources

- [API Documentation](./README.md#api-endpoints)
- [Development Setup](./README.md#quick-start)
- [Deployment Guide](./README.md#deployment)
- [Contributing Guidelines](./README.md#contributing)

---

*This architecture document provides a comprehensive overview of the Project Management Dashboard system. For detailed implementation guides, refer to the main README file.* 