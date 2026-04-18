from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('user', 'department')
    list_filter = ('department',)
    search_fields = ('user__username', 'department')
