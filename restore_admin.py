import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = "admin"
email = "admin@example.com"
password = "admin"
role = "admin"

if not User.objects.filter(username=username).exists():
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password,
        role=role
    )
    print(f"Successfully created admin user: {username}")
else:
    user = User.objects.get(username=username)
    user.set_password(password)
    user.role = role
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f"Updated existing user '{username}' to admin with password '{password}'")
