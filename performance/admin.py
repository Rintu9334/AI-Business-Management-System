from django.contrib import admin
from .models import Performance

@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'completed_tasks', 'pending_tasks', 'rating')
    search_fields = ('user__username',)
    readonly_fields = ('completed_tasks', 'pending_tasks', 'rating')
