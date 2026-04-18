import csv
import json
from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsAdminOrManager
from tasks.models import Task
from django.db.models import Count
from django.db.models.functions import TruncMonth

from rest_framework.permissions import IsAuthenticated, AllowAny

from django.utils import timezone
from users.models import CustomUser
from projects.models import Project
from attendance.models import Attendance
from performance.models import Performance

class ReportView(APIView):
    """
    GET /api/reports/
    Dynamic role-based analytics payload generator
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role
        
        # Base Queries
        tasks = Task.objects.all()
        performances = Performance.objects.select_related('user').all()
        
        # Scoping based on Roles
        if role == 'manager':
            # Manager sees tasks in their projects
            projects = Project.objects.filter(manager=user)
            tasks = tasks.filter(project__in=projects)
            performances = performances.filter(user__role='employee') # Approximate team tracking
        elif role == 'employee':
            tasks = tasks.filter(assigned_to=user)
            performances = performances.filter(user=user)

        # Filters from request
        days = int(request.GET.get('days', 30))
        project_id = request.GET.get('project_id')
        employee_id = request.GET.get('employee_id')
        status = request.GET.get('status')
        
        if project_id:
            tasks = tasks.filter(project_id=project_id)
        if employee_id:
            tasks = tasks.filter(assigned_to_id=employee_id)
            performances = performances.filter(user_id=employee_id)
        if status and status != 'All':
            tasks = tasks.filter(status__iexact=status)
            
        today = timezone.localdate()
        date_threshold = today - timezone.timedelta(days=days)
        tasks = tasks.filter(created_at__date__gte=date_threshold)

        # Status Counts
        completed = tasks.filter(status__iexact="completed").count()
        pending = tasks.filter(status__iexact="pending").count()
        in_progress = tasks.filter(status__iexact="in_progress").count()
        total_tasks = tasks.count()
        
        efficiency = round((completed / total_tasks * 100), 1) if total_tasks > 0 else 0
        
        # Dynamic Attendance
        if role == 'admin' or role == 'manager':
            # Count ONLY employees
            total_emps = CustomUser.objects.filter(role__iexact="employee", is_active=True).count()

            # Count UNIQUE present employees
            logged_in_today = Attendance.objects.filter(date=today).values('user').distinct().count()
            
            if total_emps > 0:
                attendance_rate = (logged_in_today / total_emps) * 100
            else:
                attendance_rate = 0
            attendance_rate = round(attendance_rate, 1)

        else:
            has_logged = Attendance.objects.filter(user=user, date=today).exists()
            attendance_rate = 100 if has_logged else 0

        # Daily Progress Array (Line Chart)
        daily_progress = []
        for i in range(days-1, -1, -1):
            day = today - timezone.timedelta(days=i)
            c = tasks.filter(updated_at__date=day, status__iexact='completed').count()
            daily_progress.append({"date": day.strftime('%b %d'), "completed": c})

        # Top Performers Array
        performer_data = []
        for p in performances:
            # Skip admin role
            if p.user.role == 'admin':
                continue
                
            c_count = Task.objects.filter(assigned_to=p.user, status__iexact='completed').count()
            t_count = Task.objects.filter(assigned_to=p.user).count()
            pending_count = t_count - c_count
            rating = round((c_count / t_count * 100), 1) if t_count > 0 else 0
            
            performer_data.append({
                "id": p.user.id, 
                "name": p.user.username, 
                "score": rating, 
                "role": p.user.role,
                "completed_tasks": c_count,
                "pending_tasks": pending_count
            })
        
        top_performers = sorted(performer_data, key=lambda x: x['score'], reverse=True)[:10]

        report_data = {
            "total_tasks": total_tasks,
            "completed": completed,
            "pending": pending,
            "in_progress": in_progress,
            "efficiency": f"{efficiency}%",
            "attendance_rate": f"{attendance_rate}%",
            "status_distribution": [
                {"name": "Completed", "value": completed, "color": "#10b981"},
                {"name": "In Progress", "value": in_progress, "color": "#6366f1"},
                {"name": "Pending", "value": pending, "color": "#f59e0b"},
            ],
            "daily_progress": daily_progress,
            "top_performers": top_performers,
            "role": role
        }

        return Response(report_data)

class ReportExportCSVView(APIView):
    """
    GET /api/reports/export/csv/
    Public API for direct CSV download.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        tasks = Task.objects.all()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="report.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Task Title', 'Status', 'Created Date'])
        
        for task in tasks:
            writer.writerow([
                task.title,
                task.status,
                str(task.created_at)
            ])
            
        return response

class ReportExportJSONView(APIView):
    """
    GET /api/reports/export/json/
    Public API for direct JSON download.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        data = list(Task.objects.values('id', 'title', 'status', 'created_at'))
        return JsonResponse(data, safe=False)
