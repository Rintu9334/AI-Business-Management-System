from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)

    login_time = models.DateTimeField(default=timezone.now)
    logout_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='IN_PROGRESS', choices=(
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('ABSENT', 'Absent'),
    ))

    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date', '-login_time']

    @property
    def working_hours(self):
        """Calculates exact working hours if logged out."""
        if self.login_time and self.logout_time:
            diff = self.logout_time - self.login_time
            hours = diff.total_seconds() / 3600
            return round(hours, 2)
        return 0

    @property
    def duration_display(self):
        """Returns a string representation of the duration (e.g., '2h 15m')."""
        if self.login_time and self.logout_time:
            diff = self.logout_time - self.login_time
            total_seconds = int(diff.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            if hours > 0:
                return f"{hours}h {minutes}m"
            return f"{minutes}m"
        return "Working..."

    def __str__(self):
        return f"{self.user.username} - {self.login_time.date()}"
