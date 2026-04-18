from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer
from users.permissions import IsTaskOwnerOrManagerAdmin
from rest_framework.permissions import IsAuthenticated

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTaskOwnerOrManagerAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.all()
        elif user.role == 'manager':
            return Task.objects.filter(assigned_by=user)
        # Employees only see their own tasks
        return Task.objects.filter(assigned_to=user)

    def update(self, request, *args, **kwargs):
        from rest_framework.response import Response
        task = self.get_object()
        if request.user.role != 'employee' or task.assigned_to != request.user:
            return Response({"error": "Permission denied"}, status=403)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        from rest_framework.response import Response
        task = self.get_object()
        if request.user.role != 'employee' or task.assigned_to != request.user:
            return Response({"error": "Permission denied"}, status=403)
        return super().partial_update(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'manager':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only managers can assign tasks")
            
        project = serializer.validated_data.get('project')
        if project and project.manager != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only assign tasks for projects assigned to you.")
        
        task = serializer.save(assigned_by=user)
        
        # Automatic notification for assigned user
        if task.assigned_to:
            from notifications.models import Notification
            Notification.objects.create(
                user=task.assigned_to,
                message=f"New task assigned: {task.title}"
            )
