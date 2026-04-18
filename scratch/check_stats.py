from django.contrib.auth import get_user_model
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

User = get_user_model()
print(f"Total Users: {User.objects.count()}")
for role in ['admin', 'manager', 'employee', 'Admin', 'Manager', 'Employee']:
    count = User.objects.filter(role=role).count()
    if count > 0:
        print(f"Role '{role}': {count}")

from attendance.models import Attendance
from django.utils import timezone
today = timezone.now().date()
present = Attendance.objects.filter(date=today).values('user').distinct().count()
print(f"Present Today (all roles): {present}")
present_emp_lower = Attendance.objects.filter(date=today, user__role='employee').values('user').distinct().count()
print(f"Present Today (role='employee'): {present_emp_lower}")
present_emp_upper = Attendance.objects.filter(date=today, user__role='Employee').values('user').distinct().count()
print(f"Present Today (role='Employee'): {present_emp_upper}")
