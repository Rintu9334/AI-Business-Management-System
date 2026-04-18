from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Performance
from .serializers import PerformanceSerializer
from tasks.models import Task
from projects.models import Project
from attendance.models import Attendance
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from notifications.models import Notification

User = get_user_model()

class UserPerformanceView(generics.RetrieveAPIView):
    """
    GET /api/performance/
    """
    serializer_class = PerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        # Ensure record exists
        performance, _ = Performance.objects.get_or_create(user=user)
        
        # Calculate stats based on role
        if user.role == 'admin':
            # Admins see system-wide performance summary
            completed = Task.objects.filter(status__iexact='completed').count()
            total = Task.objects.all().count()
        else:
            # Employees only see their own assignments
            completed = Task.objects.filter(assigned_to=user, status__iexact='completed').count()
            total = Task.objects.filter(assigned_to=user).count()
        
        pending = total - completed
        rating = (completed / total * 100) if total > 0 else 0
        
        # Update and save metrics
        performance.completed_tasks = completed
        performance.pending_tasks = pending
        performance.rating = round(rating, 2)
        performance.save()
        
        return performance

class AllPerformanceView(generics.ListAPIView):
    """
    GET /api/performance/all/
    """
    queryset = Performance.objects.all()
    serializer_class = PerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role

        # Base counts
        total_employees = User.objects.filter(role__iexact="employee", is_active=True).count()
        total_managers = User.objects.filter(role__iexact="manager", is_active=True).count()
        
        # Role-based filtering
        if role == 'admin':
            projects = Project.objects.all()
            tasks = Task.objects.all()
            performers_query = Performance.objects.select_related('user').all()
        elif role == 'manager':
            # Manager sees projects they manage and related tasks
            projects = Project.objects.filter(manager=user)
            tasks = Task.objects.filter(project__in=projects)
            performers_query = Performance.objects.filter(user__in=User.objects.filter(role='employee'))
        else: # employee
            projects = Project.objects.filter(tasks__assigned_to=user).distinct()
            tasks = Task.objects.filter(assigned_to=user)
            performers_query = Performance.objects.filter(user=user)

        # Active Tasks (In Progress)
        active_tasks_count = tasks.filter(status='in_progress').count()
        total_tasks_count = tasks.count()
        completed_tasks_count = tasks.filter(status='completed').count()
        
        # System Utilization (Dynamic: Completed / Total)
        utilization_rate = (completed_tasks_count / total_tasks_count * 100) if total_tasks_count > 0 else 0

        # Attendance today (Global for Admin/Manager, Personal for Employee)
        today = timezone.localdate()
        last_week_start = today - timezone.timedelta(days=14)
        current_week_start = today - timezone.timedelta(days=7)

        if role in ['admin', 'manager']:
            # Count UNIQUE present employees
            logged_in_today = Attendance.objects.filter(date=today).values('user').distinct().count()
            
            if total_employees > 0:
                attendance_rate = (logged_in_today / total_employees) * 100
            else:
                attendance_rate = 0
            attendance_rate = round(attendance_rate, 1)
        else:
            has_logged_in = Attendance.objects.filter(user=user, date=today).exists()
            attendance_rate = 100 if has_logged_in else 0

        # Trend Calculations (Completed Tasks this week vs last week)
        current_week_completed = tasks.filter(status='completed', updated_at__date__gte=current_week_start).count()
        last_week_completed = tasks.filter(status='completed', updated_at__date__gte=last_week_start, updated_at__date__lt=current_week_start).count()
        
        # Helper to calculate change
        def get_change(curr, prev):
            if prev == 0: return "+0" if curr == 0 else f"+{curr}"
            change = ((curr - prev) / prev) * 100
            return f"{'+' if change >= 0 else ''}{round(change, 1)}%"

        task_change = get_change(current_week_completed, last_week_completed)
        task_trend = "up" if current_week_completed >= last_week_completed else "down"

        # Task Distribution (Pie Chart)
        task_distribution = [
            {"name": "Completed", "value": completed_tasks_count, "color": "#10B981"},
            {"name": "In Progress", "value": active_tasks_count, "color": "#3B82F6"},
            {"name": "Pending", "value": tasks.filter(status='pending').count(), "color": "#F59E0B"},
        ]

        # Performance Ranking (Bar Chart - Calculated dynamically for top-tier accuracy)
        performer_data = []
        # Get all employees and calculate their fresh rating based on current task counts
        employees = performers_query.select_related('user')
        for p in employees:
            c_count = tasks.filter(assigned_to=p.user, status='completed').count()
            p_count = tasks.filter(assigned_to=p.user).exclude(status='completed').count()
            total = c_count + p_count
            fresh_rating = round((c_count / total * 100), 1) if total > 0 else 0
            performer_data.append({"name": p.user.username, "rating": fresh_rating})
        
        # Sort by rating and take top 5
        performer_data = sorted(performer_data, key=lambda x: x['rating'], reverse=True)[:5]

        # Productivity Trend (Last 7 days)
        trend_data = []
        for i in range(6, -1, -1):
            day = today - timezone.timedelta(days=i)
            count = tasks.filter(updated_at__date=day, status='completed').count()
            trend_data.append({"date": day.strftime("%b %d"), "completed": count})

        # Metric Cards based on role
        if role == 'admin':
            metrics = [
                {"title": "Total Personnel", "value": total_employees + total_managers, "icon": "Users", "change": "Active", "trend": "neutral"},
                {"title": "Utilization", "value": f"{round(utilization_rate)}%", "icon": "Layers", "change": task_change, "trend": task_trend},
                {"title": "Active Tasks", "value": active_tasks_count, "icon": "Activity", "change": "In Progress", "trend": "neutral"},
                {"title": "Attendance Rate", "value": f"{attendance_rate}%", "icon": "Clock", "change": "Stable", "trend": "neutral"},
            ]
        elif role == 'manager':
            metrics = [
                {"title": "Team Members", "value": total_employees, "icon": "Users", "change": "Direct", "trend": "neutral"},
                {"title": "Managed Projects", "value": projects.count(), "icon": "Layers", "change": "Active", "trend": "neutral"},
                {"title": "Active Tasks", "value": active_tasks_count, "icon": "Activity", "change": task_change, "trend": task_trend},
                {"title": "Daily Attendance", "value": f"{attendance_rate}%", "icon": "Clock", "change": "Stable", "trend": "neutral"},
            ]
        else: # employee
            metrics = [
                {"title": "My Assignments", "value": total_tasks_count, "icon": "Users", "change": task_change, "trend": task_trend},
                {"title": "My Utilization", "value": f"{round(utilization_rate)}%", "icon": "Layers", "change": "Velocity", "trend": "neutral"},
                {"title": "Active Tasks", "value": active_tasks_count, "icon": "Activity", "change": "Current", "trend": "neutral"},
                {"title": "Check-in Status", "value": "Present" if attendance_rate == 100 else "Absent", "icon": "Clock", "change": "Today", "trend": "neutral"},
            ]

        return Response({
            "metrics": metrics,
            "task_distribution": task_distribution,
            "performer_data": performer_data,
            "trend_data": trend_data,
            "server_time": timezone.now().isoformat(),
            "role": role,
            "utilization": round(utilization_rate, 1)
        })

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Unauthorized"}, status=403)
        
        total_users = User.objects.count()
        # Active tasks = anything not completed
        active_tasks = Task.objects.exclude(status='completed').count()
        total_tasks = Task.objects.count()
        system_utilization = round((Task.objects.filter(status='completed').count() / total_tasks * 100), 1) if total_tasks > 0 else 0
        
        # Attendance rate
        today = timezone.localdate()
        # Count UNIQUE present employees
        logged_in_today = Attendance.objects.filter(date=today).values('user').distinct().count()

        # Count ONLY employees
        total_emps = User.objects.filter(role__iexact="employee", is_active=True).count()
        
        if total_emps > 0:
            attendance_rate = (logged_in_today / total_emps) * 100
        else:
            attendance_rate = 0
        attendance_rate = round(attendance_rate, 1)
        
        # Top Performers dynamically tracked
        employees = Performance.objects.filter(user__role='employee').select_related('user')
        performer_data = []
        for p in employees:
            c_count = Task.objects.filter(assigned_to=p.user, status='completed').count()
            total = Task.objects.filter(assigned_to=p.user).count()
            rating = round((c_count / total * 100), 1) if total > 0 else 0
            # Only include if they have assigned tasks actually
            if total > 0:
                performer_data.append({"id": p.user.id, "name": p.user.username, "score": rating})
        performer_data = sorted(performer_data, key=lambda x: x['score'], reverse=True)[:5]
        
        # Recent activities (Notifications)
        recent_activities = Notification.objects.all().order_by('-created_at')[:5]
        activities_data = [
            {"id": a.id, "message": a.message, "timestamp": a.created_at, "type": a.type} for a in recent_activities
        ]

        # Productivity Trend (Last 7 days / 30 days) - now tracking pending vs completed
        days_param = int(request.GET.get('days', 7))
        trend_data = []
        for i in range(days_param - 1, -1, -1):
            day = today - timezone.timedelta(days=i)
            c_count = Task.objects.filter(updated_at__date=day, status='completed').count()
            p_count = Task.objects.filter(created_at__date__lte=day).exclude(status='completed', updated_at__date__lte=day).count()
            trend_data.append({"date": day.strftime("%b %d"), "completed": c_count, "pending": p_count})

        return Response({
            "total_users": total_users,
            "active_tasks": active_tasks,
            "attendance_rate": attendance_rate,
            "system_utilization": system_utilization,
            "top_performers": performer_data,
            "recent_activities": activities_data,
            "trend_data": trend_data,
            "server_time": timezone.now().isoformat()
        })
