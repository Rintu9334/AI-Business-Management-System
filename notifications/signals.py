from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
from django.utils import timezone
from tasks.models import Task
from projects.models import Project
from attendance.models import Attendance
from users.models import CustomUser
from .models import Notification

@receiver(post_save, sender=Task)
def task_notification_trigger(sender, instance, created, **kwargs):
    if created and instance.assigned_to:
        # Notify Employee
        Notification.objects.create(
            user=instance.assigned_to,
            message=f"New task assigned: {instance.title}",
            type='info'
        )
        # Notify Manager
        if instance.project and instance.project.manager:
            Notification.objects.create(
                user=instance.project.manager,
                message=f"Task '{instance.title}' assigned to {instance.assigned_to.username}",
                type='info'
            )
        
        if instance.deadline:
            days = (instance.deadline - timezone.now()).days
            if days == 1 or days == 0:
                Notification.objects.create(
                    user=instance.assigned_to,
                    message=f"Deadline approaching for '{instance.title}'!",
                    type='warning'
                )
            elif days < 0:
                Notification.objects.create(
                    user=instance.assigned_to,
                    message=f"Task '{instance.title}' is overdue!",
                    type='error'
                )
    elif not created:
        if instance.status == 'completed':
            # Notify Employee
            if instance.assigned_to:
                Notification.objects.create(
                    user=instance.assigned_to,
                    message="Task completed successfully",
                    type='success'
                )
            # Notify Manager
            if instance.project and instance.project.manager and instance.assigned_to:
                Notification.objects.create(
                    user=instance.project.manager,
                    message=f"{instance.assigned_to.username} completed task '{instance.title}'",
                    type='success'
                )

@receiver(post_save, sender=Project)
def project_creation_notification(sender, instance, created, **kwargs):
    if created:
        # Notify Manager
        if instance.manager:
            Notification.objects.create(
                user=instance.manager,
                message="Project created successfully",
                type='success'
            )
        
        # Notify Admin(s)
        admins = CustomUser.objects.filter(role='admin')
        manager_name = instance.manager.username if instance.manager else 'System'
        for admin_user in admins:
            Notification.objects.create(
                user=admin_user,
                message=f"New project '{instance.title}' created by {manager_name}",
                type='info'
            )

@receiver(post_save, sender=Attendance)
def attendance_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            message=f"Session started successfully.",
            type='success'
        )
    elif instance.logout_time:
        Notification.objects.create(
            user=instance.user,
            message=f"Session ended. Total time: {instance.duration_display}",
            type='info'
        )

@receiver(user_logged_in)
def user_logged_in_notification(sender, user, request, **kwargs):
    # Check to prevent excessive spam, but user requested it:
    Notification.objects.create(
        user=user,
        message="A new login was recorded for your account.",
        type='info'
    )
