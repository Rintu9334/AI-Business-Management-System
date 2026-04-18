from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task
from notifications.models import Notification

@receiver(post_save, sender=Task)
def create_task_notification(sender, instance, created, **kwargs):
    if created and instance.assigned_to:
        # Task just created and assigned
        Notification.objects.create(
            user=instance.assigned_to,
            message=f"A new task '{instance.title}' has been assigned to you in project '{instance.project.title}'."
        )
    elif not created and 'assigned_to' in (kwargs.get('update_fields') or []):
        # Task updated with a new assignment (optional refinement)
        Notification.objects.create(
            user=instance.assigned_to,
            message=f"The task '{instance.title}' has been reassigned to you."
        )
