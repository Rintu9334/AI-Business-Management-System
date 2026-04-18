from django.db import models
from django.contrib.auth import get_user_model
from tasks.models import Task

User = get_user_model()

class Performance(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='performance')
    completed_tasks = models.IntegerField(default=0)
    pending_tasks = models.IntegerField(default=0)
    rating = models.FloatField(default=0.0)

    def calculate_metrics(self):
        """
        Dynamically calculate and save tasks logic from the Task model.
        """
        self.completed_tasks = Task.objects.filter(assigned_to=self.user, status='completed').count()
        # Anything not 'completed' is considered pending for this metric
        self.pending_tasks = Task.objects.filter(assigned_to=self.user).exclude(status='completed').count()
        
        total = self.completed_tasks + self.pending_tasks
        if total > 0:
            self.rating = round((self.completed_tasks / total) * 5, 2)
        else:
            self.rating = 0.0
            
        self.save()

    def __str__(self):
        return f"{self.user.username} Performance Metrics"
