from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomTokenObtainPairView, UserViewSet, ChangePasswordView, ManagerListView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/change-password/', ChangePasswordView.as_view({'post': 'create'}), name='change-password'),
    path('managers/', ManagerListView.as_view(), name='manager-list'),
    path('', include(router.urls)),
]
