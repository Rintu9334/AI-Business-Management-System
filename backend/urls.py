from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import JsonResponse
from performance.views import AdminDashboardView

def api_root(request):
    return JsonResponse({
        "message": "Welcome to BizOps Pro AI Backend",
        "status": "Ready",
        "endpoints": {
            "api_root": "/api/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    
    # Auth endpoints -> login/ and register/ available at /api/login/ and /api/register/
    path('api/', include('users.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # App endpoints
    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('api/employees/', include('employees.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/performance/', include('performance.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/ai/', include('ai_module.urls')),
    path('api/reports/', include('reports.urls')),
]
