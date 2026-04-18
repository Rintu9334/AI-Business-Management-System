from django.urls import path
from .views import UserPerformanceView, AllPerformanceView, DashboardStatsView, AdminDashboardView

urlpatterns = [
    path('', UserPerformanceView.as_view(), name='user-performance'),
    path('all/', AllPerformanceView.as_view(), name='all-performance'),
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
]
