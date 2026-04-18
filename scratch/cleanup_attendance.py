import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from attendance.models import Attendance
from django.db.models import Count

# Find duplicates
duplicates = Attendance.objects.values('user', 'date').annotate(count=Count('id')).filter(count__gt=1)

for dup in duplicates:
    user_id = dup['user']
    date = dup['date']
    
    # Keep the earliest one, delete others
    all_for_day = Attendance.objects.filter(user_id=user_id, date=date).order_by('login_time')
    to_keep = all_for_day[0]
    to_delete = all_for_day.exclude(id=to_keep.id)
    
    print(f"Cleaning duplicates for User {user_id} on {date}: Keeping ID {to_keep.id}, deleting {to_delete.count()} records.")
    to_delete.delete()

print("Database cleaned. Ready for migration.")
