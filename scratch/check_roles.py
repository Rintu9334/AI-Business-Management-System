import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
print(f"Lower: {User.objects.filter(role='employee').count()}")
print(f"Upper: {User.objects.filter(role='Employee').count()}")
print(f"Iexact: {User.objects.filter(role__iexact='employee').count()}")
