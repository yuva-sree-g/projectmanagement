import logging
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import Optional
import os
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

load_dotenv()

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "your-email@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "your-app-password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "your-email@gmail.com"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fastmail = FastMail(conf)

async def send_task_assignment_email(
    user_email: str,
    user_name: str,
    task_title: str,
    project_name: str,
    assigned_by: str
):
    """Send email notification when a task is assigned to a user."""
    
    subject = f"New Task Assigned: {task_title}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🎯 New Task Assignment</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello <strong>{user_name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                You have been assigned a new task in the project <strong>{project_name}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Task Details</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Task:</strong> {task_title}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Project:</strong> {project_name}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Assigned by:</strong> {assigned_by}</p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Please log in to your dashboard to view the complete task details and start working on it.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="{os.getenv('FRONTEND_URL', 'https://project-management-dashboard-dno2.vercel.app')}" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View Task
                </a>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated notification from Project Management Dashboard</p>
        </div>
    </div>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[user_email],
        body=html_content,
        subtype="html"
    )
    
    try:
        await fastmail.send_message(message)
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

async def send_task_update_email(
    user_email: str,
    user_name: str,
    task_title: str,
    project_name: str,
    update_type: str,
    updated_by: str
):
    """Send email notification when a task is updated."""
    
    subject = f"Task Updated: {task_title}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">📝 Task Update</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello <strong>{user_name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                A task you're assigned to has been updated in the project <strong>{project_name}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Update Details</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Task:</strong> {task_title}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Project:</strong> {project_name}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Update Type:</strong> {update_type}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Updated by:</strong> {updated_by}</p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Please log in to your dashboard to view the updated task details.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="{os.getenv('FRONTEND_URL', 'https://project-management-dashboard-dno2.vercel.app')}" 
                   style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View Task
                </a>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated notification from Project Management Dashboard</p>
        </div>
    </div>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[user_email],
        body=html_content,
        subtype="html"
    )
    
    try:
        await fastmail.send_message(message)
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

async def send_task_completion_email(
    user_email: str,
    user_name: str,
    task_title: str,
    project_name: str,
    completed_by: str
):
    """Send email notification when a task is completed."""
    
    subject = f"Task Completed: {task_title}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Task Completed</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello <strong>{user_name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                A task has been marked as completed in the project <strong>{project_name}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Completion Details</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Task:</strong> {task_title}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Project:</strong> {project_name}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Completed by:</strong> {completed_by}</p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Great job! The task has been successfully completed.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="{os.getenv('FRONTEND_URL', 'https://project-management-dashboard-dno2.vercel.app')}" 
                   style="background: #ffc107; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View Project
                </a>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated notification from Project Management Dashboard</p>
        </div>
    </div>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[user_email],
        body=html_content,
        subtype="html"
    )
    
    try:
        await fastmail.send_message(message)
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False 