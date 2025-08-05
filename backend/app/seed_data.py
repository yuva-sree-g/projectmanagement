#!/usr/bin/env python3
"""
Seed Data Script for Project Management Dashboard
Populates the database with sample projects and tasks for demonstration.
"""

import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from app.database import get_db
from app.models import User, Project, Task, TimeLog, Comment, TaskStatus, TaskPriority
from app.auth import get_password_hash
from app.schemas.user import UserCreate
from app.schemas.project import ProjectCreate
from app.schemas.task import TaskCreate

def create_sample_users(db: Session):
    """Create sample users for demonstration."""
    print("Creating sample users...")
    
    # Check if users already exist
    existing_users = db.query(User).all()
    if existing_users:
        print("Users already exist, skipping user creation.")
        return existing_users
    
    # Create sample users
    users_data = [
        {
            "username": "yuvasreega",
            "email": "yuvasreega@example.com",
            "full_name": "Yuvasree Ganesan",
            "password": "yuvasree"
        },
        {
            "username": "testuser",
            "email": "testuser@example.com", 
            "full_name": "Test User",
            "password": "testuser"
        },
        {
            "username": "developer1",
            "email": "developer1@example.com",
            "full_name": "John Developer",
            "password": "password123"
        },
        {
            "username": "manager1",
            "email": "manager1@example.com",
            "full_name": "Sarah Manager",
            "password": "password123"
        }
    ]
    
    created_users = []
    for user_data in users_data:
        hashed_password = get_password_hash(user_data["password"])
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            hashed_password=hashed_password
        )
        db.add(user)
        created_users.append(user)
    
    db.commit()
    print(f"Created {len(created_users)} users")
    return created_users

def create_sample_projects(db: Session, users: list):
    """Create sample projects for demonstration."""
    print("Creating sample projects...")
    
    # Check if projects already exist
    existing_projects = db.query(Project).all()
    if existing_projects:
        print("Projects already exist, skipping project creation.")
        return existing_projects
    
    # Get users for assignment
    yuvasree = next((u for u in users if u.username == "yuvasreega"), users[0])
    testuser = next((u for u in users if u.username == "testuser"), users[1])
    developer = next((u for u in users if u.username == "developer1"), users[2])
    manager = next((u for u in users if u.username == "manager1"), users[3])
    
    projects_data = [
        {
            "title": "E-Commerce Platform Development",
            "description": "Build a modern e-commerce platform with React frontend and FastAPI backend. Features include user authentication, product catalog, shopping cart, and payment integration.",
            "status": "active",
            "priority": "High",
            "start_date": datetime.now() - timedelta(days=30),
            "end_date": datetime.now() + timedelta(days=60),
            "created_by": yuvasree.id,
            "assigned_to": [yuvasree.id, developer.id, manager.id]
        },
        {
            "title": "Mobile App for Task Management",
            "description": "Develop a cross-platform mobile application for task management using React Native. Include features like task creation, time tracking, and team collaboration.",
            "status": "on_hold",
            "priority": "Medium", 
            "start_date": datetime.now() - timedelta(days=15),
            "end_date": datetime.now() + timedelta(days=90),
            "created_by": testuser.id,
            "assigned_to": [testuser.id, developer.id]
        },
        {
            "title": "AI-Powered Analytics Dashboard",
            "description": "Create an intelligent analytics dashboard that uses machine learning to provide insights and predictions. Integrate with various data sources and provide real-time visualizations.",
            "status": "active",
            "priority": "Urgent",
            "start_date": datetime.now(),
            "end_date": datetime.now() + timedelta(days=45),
            "created_by": manager.id,
            "assigned_to": [manager.id, yuvasree.id, developer.id]
        }
    ]
    
    created_projects = []
    for project_data in projects_data:
        project = Project(
            title=project_data["title"],
            description=project_data["description"],
            status=project_data["status"],
            start_date=project_data["start_date"],
            end_date=project_data["end_date"],
            owner_id=project_data["created_by"]
        )
        db.add(project)
        created_projects.append(project)
    
    db.commit()
    print(f"Created {len(created_projects)} projects")
    return created_projects

def create_sample_tasks(db: Session, projects: list, users: list):
    """Create sample tasks for demonstration."""
    print("Creating sample tasks...")
    
    # Check if tasks already exist
    existing_tasks = db.query(Task).all()
    if existing_tasks:
        print("Tasks already exist, skipping task creation.")
        return existing_tasks
    
    # Get users for assignment
    yuvasree = next((u for u in users if u.username == "yuvasreega"), users[0])
    testuser = next((u for u in users if u.username == "testuser"), users[1])
    developer = next((u for u in users if u.username == "developer1"), users[2])
    manager = next((u for u in users if u.username == "manager1"), users[3])
    
    # Get projects
    ecommerce_project = next((p for p in projects if "E-Commerce" in p.title), projects[0])
    mobile_project = next((p for p in projects if "Mobile App" in p.title), projects[1])
    ai_project = next((p for p in projects if "AI-Powered" in p.title), projects[2])
    
    tasks_data = [
        # E-Commerce Platform Tasks
        {
            "title": "Design User Interface",
            "description": "Create wireframes and mockups for the e-commerce platform user interface. Focus on user experience and responsive design.",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.HIGH,
            "estimated_hours": 16,
            "project_id": ecommerce_project.id,
            "assigned_to": yuvasree.id,
            "created_by": yuvasree.id
        },
        {
            "title": "Implement User Authentication",
            "description": "Develop secure user authentication system with JWT tokens, password hashing, and role-based access control.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.HIGH,
            "estimated_hours": 20,
            "project_id": ecommerce_project.id,
            "assigned_to": developer.id,
            "created_by": yuvasree.id
        },
        {
            "title": "Create Product Catalog API",
            "description": "Build RESTful API endpoints for product management including CRUD operations, search, and filtering.",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.MEDIUM,
            "estimated_hours": 24,
            "project_id": ecommerce_project.id,
            "assigned_to": developer.id,
            "created_by": yuvasree.id
        },
        {
            "title": "Integrate Payment Gateway",
            "description": "Integrate Stripe payment gateway for secure online transactions. Implement webhook handling and payment status tracking.",
            "status": TaskStatus.REVIEW,
            "priority": TaskPriority.URGENT,
            "estimated_hours": 18,
            "project_id": ecommerce_project.id,
            "assigned_to": developer.id,
            "created_by": manager.id
        },
        
        # Mobile App Tasks
        {
            "title": "Setup React Native Environment",
            "description": "Configure development environment for React Native, including necessary dependencies and build tools.",
            "status": TaskStatus.READY_TO_TEST,
            "priority": TaskPriority.MEDIUM,
            "estimated_hours": 8,
            "project_id": mobile_project.id,
            "assigned_to": developer.id,
            "created_by": testuser.id
        },
        {
            "title": "Design Mobile UI Components",
            "description": "Create reusable UI components for the mobile app including buttons, forms, navigation, and task cards.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.MEDIUM,
            "estimated_hours": 12,
            "project_id": mobile_project.id,
            "assigned_to": yuvasree.id,
            "created_by": testuser.id
        },
        {
            "title": "Implement Task CRUD Operations",
            "description": "Develop backend API and frontend functionality for creating, reading, updating, and deleting tasks.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.HIGH,
            "estimated_hours": 16,
            "project_id": mobile_project.id,
            "assigned_to": developer.id,
            "created_by": testuser.id
        },
        {
            "title": "Add Push Notifications",
            "description": "Implement push notifications for task assignments, due date reminders, and team updates.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.LOW,
            "estimated_hours": 14,
            "project_id": mobile_project.id,
            "assigned_to": developer.id,
            "created_by": testuser.id
        },
        
        # AI Analytics Dashboard Tasks
        {
            "title": "Research ML Algorithms",
            "description": "Research and select appropriate machine learning algorithms for data analysis and prediction models.",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.HIGH,
            "estimated_hours": 20,
            "project_id": ai_project.id,
            "assigned_to": yuvasree.id,
            "created_by": manager.id
        },
        {
            "title": "Design Dashboard Layout",
            "description": "Create responsive dashboard layout with charts, graphs, and interactive data visualizations.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.MEDIUM,
            "estimated_hours": 15,
            "project_id": ai_project.id,
            "assigned_to": yuvasree.id,
            "created_by": manager.id
        },
        {
            "title": "Implement Data Pipeline",
            "description": "Build ETL pipeline to collect, process, and store data from various sources for analysis.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.HIGH,
            "estimated_hours": 25,
            "project_id": ai_project.id,
            "assigned_to": developer.id,
            "created_by": manager.id
        },
        {
            "title": "Create Prediction Models",
            "description": "Develop machine learning models for trend prediction, anomaly detection, and business insights.",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.URGENT,
            "estimated_hours": 30,
            "project_id": ai_project.id,
            "assigned_to": developer.id,
            "created_by": manager.id
        }
    ]
    
    created_tasks = []
    for task_data in tasks_data:
        task = Task(
            title=task_data["title"],
            description=task_data["description"],
            status=task_data["status"],
            priority=task_data["priority"],
            estimated_hours=task_data["estimated_hours"],
            project_id=task_data["project_id"],
            assignee_id=task_data["assigned_to"]
        )
        db.add(task)
        created_tasks.append(task)
    
    db.commit()
    print(f"Created {len(created_tasks)} tasks")
    return created_tasks

def create_sample_time_logs(db: Session, tasks: list, users: list):
    """Create sample time logs for demonstration."""
    print("Creating sample time logs...")
    
    # Check if time logs already exist
    existing_logs = db.query(TimeLog).all()
    if existing_logs:
        print("Time logs already exist, skipping time log creation.")
        return existing_logs
    
    # Get users
    yuvasree = next((u for u in users if u.username == "yuvasreega"), users[0])
    developer = next((u for u in users if u.username == "developer1"), users[2])
    
    # Get some tasks
    design_task = next((t for t in tasks if "Design" in t.title), tasks[0])
    auth_task = next((t for t in tasks if "Authentication" in t.title), tasks[1])
    
    time_logs_data = [
        {
            "task_id": design_task.id,
            "user_id": yuvasree.id,
            "hours_spent": 4.5,
            "description": "Created wireframes for main pages",
            "date": datetime.now() - timedelta(days=2)
        },
        {
            "task_id": design_task.id,
            "user_id": yuvasree.id,
            "hours_spent": 3.0,
            "description": "Refined UI components and styling",
            "date": datetime.now() - timedelta(days=1)
        },
        {
            "task_id": auth_task.id,
            "user_id": developer.id,
            "hours_spent": 6.0,
            "description": "Implemented JWT authentication system",
            "date": datetime.now() - timedelta(days=3)
        },
        {
            "task_id": auth_task.id,
            "user_id": developer.id,
            "hours_spent": 2.5,
            "description": "Added password hashing and validation",
            "date": datetime.now() - timedelta(days=2)
        }
    ]
    
    created_logs = []
    for log_data in time_logs_data:
        time_log = TimeLog(
            task_id=log_data["task_id"],
            user_id=log_data["user_id"],
            hours=log_data["hours_spent"],
            description=log_data["description"],
            date=log_data["date"]
        )
        db.add(time_log)
        created_logs.append(time_log)
    
    db.commit()
    print(f"Created {len(created_logs)} time logs")
    return created_logs

def main():
    """Main function to seed the database."""
    print("Starting database seeding...")
    
    # Import database session
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Create sample data
        users = create_sample_users(db)
        projects = create_sample_projects(db, users)
        tasks = create_sample_tasks(db, projects, users)
        time_logs = create_sample_time_logs(db, tasks, users)
        
        print("\n✅ Database seeding completed successfully!")
        print(f"📊 Created:")
        print(f"   - {len(users)} users")
        print(f"   - {len(projects)} projects") 
        print(f"   - {len(tasks)} tasks")
        print(f"   - {len(time_logs)} time logs")
        print("\n🎯 Sample credentials:")
        print("   - yuvasreega / yuvasree")
        print("   - testuser / testuser")
        print("   - developer1 / password123")
        print("   - manager1 / password123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main() 