from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'manager', 'created_at')
    list_filter = ('manager', 'created_at')
    search_fields = ('title', 'description', 'manager__username')
