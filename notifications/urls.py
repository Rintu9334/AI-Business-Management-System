from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, ActivityFeedView

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('activities/', ActivityFeedView.as_view(), name='activities-feed'),
    path('', include(router.urls)),
]
