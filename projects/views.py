from rest_framework import viewsets
from .models import Project
from .serializers import ProjectSerializer
from users.permissions import IsAdminOrManagerOrReadOnly

class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Project Module.
    - Create project (admin only)
    - List projects (admin: all, manager: assigned only)
    - Update/Delete project (admin only)
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrManagerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'manager':
            return Project.objects.filter(manager=user)
        return Project.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only administrators can initiate projects.")
        serializer.save()
