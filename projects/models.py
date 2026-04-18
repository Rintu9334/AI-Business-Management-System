from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_projects')
    start_date = models.DateTimeField(null=True, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
