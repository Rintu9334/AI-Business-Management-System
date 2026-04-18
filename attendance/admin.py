from django.contrib import admin
from .models import Attendance

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'login_time', 'logout_time', 'status', 'working_hours')
    list_filter = ('date', 'status', 'user')
    search_fields = ('user__username', 'date')
    readonly_fields = ('working_hours',)
