from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from tasks.models import Task
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone

User = get_user_model()

import logging
from .ml_generator import generate_ml_insights

logger = logging.getLogger(__name__)

class AIInsightsView(APIView):
    """
    GET /api/ai/insights/
    Machine Learning based AI insights generator utilizing Random Forests.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        now = timezone.now()
        
        # 1. Real Data Gathering
        employees = User.objects.filter(role='employee')
        tasks = Task.objects.all()

        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='completed').count()
        
        employee_data = []
        overloaded = []
        available = []
        
        for emp in employees:
            emp_tasks = tasks.filter(assigned_to=emp)
            emp_pending = emp_tasks.exclude(status='completed').count()
            emp_completed = emp_tasks.filter(status='completed').count()
            
            employee_data.append({
                'username': emp.username,
                'pending': emp_pending,
                'completed': emp_completed,
                # basic attendance proxy logic for now: 1 (present)
                'attendance_rate': 100 
            })
            
            if emp_pending > 3:
                overloaded.append(emp.username)
            elif emp_pending <= 1:
                available.append(emp.username)
                
        # Base analytics
        task_density = sum(d['pending'] for d in employee_data) / len(employees) if employees else 0
        task_density = round(task_density, 1)
        
        delayed_count = tasks.filter(status__in=['pending', 'in_progress'], deadline__lt=now).count()
        
        # ML Engine Execution (or Dynamic Fallback)
        try:
            insights = generate_ml_insights(employee_data, total_tasks, completed_tasks, delayed_count)
        except Exception as e:
            logger.error(f"ML Processing failed: {e}")
            # Fallback Logic
            risk_score = (task_density * 2) + (delayed_count * 3)
            risk = "HIGH" if risk_score > 10 else "MEDIUM" if risk_score > 5 else "LOW"
            confidence = 85
            delay_pred = "High delays expected" if delayed_count > 0 else "No delay expected"
            best_emp = sorted(employee_data, key=lambda x: x['pending'])[0]['username'] if employee_data else "N/A"
            
            insights = {
                "risk": risk,
                "confidence": confidence,
                "predicted_delay": delay_pred,
                "best_employee": best_emp,
            }

        return Response({
            "risk": insights["risk"],
            "task_density": task_density,
            "predicted_delay": insights["predicted_delay"],
            "best_employee": insights.get("best_employee", "N/A"),
            "confidence": insights["confidence"],
            "workload": {
                "overloaded": overloaded,
                "available": available
            },
            "timestamp": now.isoformat()
        })

class AIAdvisorView(APIView):
    """
    GET /api/ai/advice/
    Dynamic role-based contextual business advice.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role
        now = timezone.now()

        message = ""
        msg_type = "info" # default type: warning | success | info

        if role == 'employee':
            tasks = Task.objects.filter(assigned_to=user)
            pending = tasks.exclude(status='completed').count()
            delayed = tasks.filter(status__in=['pending', 'in_progress'], deadline__lt=now).count()

            if delayed > 0:
                message = f"CRITICAL: You have {delayed} overdue tasks holding back the execution cycle. Focus on them immediately."
                msg_type = "alert"
            elif pending > 0:
                message = f"You have {pending} pending assignments in the queue. Maintain your pace to clear the deck."
                msg_type = "warning"
            else:
                message = "Excellent work! All your assigned tasks are complete. Awaiting further operational deployment."
                msg_type = "success"

        elif role == 'manager':
            from projects.models import Project
            projects = Project.objects.filter(manager=user)
            tasks = Task.objects.filter(project__in=projects)
            delayed = tasks.filter(status__in=['pending', 'in_progress'], deadline__lt=now).count()
            
            # Sub-query employees
            employees = User.objects.filter(role='employee')
            overloaded = employees.annotate(p_count=Count('tasks', filter=~Q(tasks__status='completed'))).filter(p_count__gt=4).count()

            if delayed >= 3:
                message = f"Warning: {delayed} tasks are currently overdue inside your projects. System performance is dragging; re-evalauate assignments."
                msg_type = "alert"
            elif overloaded > 0:
                message = f"Workload Imbalance: {overloaded} employees under your watch have critical backlogs (>4 tasks). Redistribute workload."
                msg_type = "warning"
            else:
                message = "Your team's operational flow is optimal. No critical bottlenecks detected."
                msg_type = "success"

        elif role == 'admin':
            tasks = Task.objects.all()
            total = tasks.count()
            completed = tasks.filter(status='completed').count()
            productivity = (completed / total * 100) if total > 0 else 100
            
            from attendance.models import Attendance
            total_emps = User.objects.filter(role='employee').count()
            logged_in_today = Attendance.objects.filter(login_time__date=now.date()).values('user').distinct().count()
            inactive = total_emps - logged_in_today

            if productivity < 50:
                message = f"System Error: Network productivity is critically low ({round(productivity)}%). Operational acceleration required immediately."
                msg_type = "alert"
            elif inactive > (total_emps * 0.3):  # more than 30% absent
                message = f"Workforce Deficit: {inactive} personnel units are currently offline. Check attendance compliance."
                msg_type = "warning"
            else:
                message = f"All systems nominal. Organization is performing at a steady {round(productivity)}% completion rate."
                msg_type = "success"

        return Response({
            "message": message,
            "type": msg_type
        })
