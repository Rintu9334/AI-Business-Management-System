import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import CustomUser

users = [
    {
        'username': 'bizops_admin',
        'email':    'admin@bizops.com',
        'password': 'BizAdmin@2025',
        'role':     'admin',
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'username': 'bizops_manager',
        'email':    'manager@bizops.com',
        'password': 'BizManager@2025',
        'role':     'manager',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'username': 'bizops_employee',
        'email':    'employee@bizops.com',
        'password': 'BizEmployee@2025',
        'role':     'employee',
        'is_staff': False,
        'is_superuser': False,
    },
]

for u_data in users:
    if not CustomUser.objects.filter(username=u_data['username']).exists():
        u = CustomUser.objects.create_user(
            username=u_data['username'],
            email=u_data['email'],
            password=u_data['password'],
        )
        u.role = u_data['role']
        u.is_staff = u_data['is_staff']
        u.is_superuser = u_data['is_superuser']
        u.save()
        print(f"Created: {u_data['username']} / {u_data['password']} ({u_data['role']})")
    else:
        user = CustomUser.objects.get(username=u_data['username'])
        user.set_password(u_data['password'])
        user.role = u_data['role']
        user.is_staff = u_data['is_staff']
        user.is_superuser = u_data['is_superuser']
        user.save()
        print(f"Updated: {u_data['username']} / {u_data['password']} ({u_data['role']})")
