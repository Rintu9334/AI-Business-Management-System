from django.db import models
from django.conf import settings

class Employee(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    department = models.CharField(max_length=100, default="General")

    def __str__(self):
        return f"{self.user.username} ({self.department})"
