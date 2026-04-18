from django.urls import path
from .views import (
    AttendanceListView, CheckInView, CheckOutView,
    attendance_stats, update_attendance, delete_attendance
)

urlpatterns = [
    # Basic endpoints
    path('', AttendanceListView.as_view(), name='attendance-list'),
    path('login/', CheckInView.as_view(), name='attendance-login'),
    path('logout/', CheckOutView.as_view(), name='attendance-logout'),
    
    # Admin extensions
    path('stats/', attendance_stats, name='attendance-stats'),
    path('update/<int:id>/', update_attendance, name='admin-attendance-update'),
    path('delete/<int:id>/', delete_attendance, name='admin-attendance-delete'),
]
