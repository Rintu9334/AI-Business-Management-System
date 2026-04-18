from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from users.models import CustomUser
from django.db import models
from rest_framework.views import APIView

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def update(self, request, *args, **kwargs):
        # Override to support marking as read easily via PATCH
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class ActivityFeedView(APIView):
    """
    GET /api/notifications/activities/
    Restricted to Admin and Manager. Returns global live activity feed.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'manager']:
            return Response({"error": "Unauthorized operational clearance."}, status=403)
        
        # Load last 10 global activities
        recent_activities = Notification.objects.all().order_by('-created_at')[:10]
        
        activities_data = [
            {
                "id": a.id, 
                "message": a.message, 
                "timestamp": a.created_at.isoformat(), 
                "type": a.type,
                "user": a.user.username
            } for a in recent_activities
        ]
        
        return Response(activities_data)
