import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import CustomUser

if not CustomUser.objects.filter(username='admin').exists():
    u = CustomUser.objects.create_superuser('admin', 'admin@admin.com', 'admin123')
    u.role = 'admin'
    u.save()
    print('Admin user created — username: admin  password: admin123')
else:
    print('Admin user already exists.')
