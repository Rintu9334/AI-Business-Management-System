from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    working_hours = serializers.ReadOnlyField()
    duration_display = serializers.ReadOnlyField()

    class Meta:
        model = Attendance
        fields = ['id', 'user', 'username', 'date', 'login_time', 'logout_time', 'working_hours', 'duration_display', 'status']
        # For Admin updates, we might want to allow editing login_time and logout_time
        extra_kwargs = {
            'login_time': {'required': False},
            'logout_time': {'required': False}
        }
