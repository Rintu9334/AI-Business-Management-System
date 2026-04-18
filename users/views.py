from rest_framework import viewsets, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from .permissions import IsAdminUser

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing users.
    GET /api/users/ (All authenticated)
    POST /api/users/ (Admin only)
    PUT /api/users/{id}/ (Admin only)
    DELETE /api/users/{id}/ (Admin only)
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        from rest_framework.response import Response
        from rest_framework import status
        
        instance = self.get_object()
        if instance.role == 'admin':
            return Response(
                {"error": "Security Restriction: System Admin accounts cannot be deleted."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ChangePasswordView(viewsets.ViewSet):
    """
    POST /api/auth/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        from rest_framework.response import Response
        from rest_framework import status
        
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not current_password or not new_password or not confirm_password:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({"error": "Incorrect current password"}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "New passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({"error": "Password must be at least 6 characters long"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        
        return Response({"message": "Password changed successfully. Please log in again."}, status=status.HTTP_200_OK)

from rest_framework import generics

class ManagerListView(generics.ListAPIView):
    """
    GET /api/managers/
    Returns list of active managers.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='manager', is_active=True)
