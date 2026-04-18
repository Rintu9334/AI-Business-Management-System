from rest_framework import serializers
from .models import Performance

class PerformanceSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Performance
        fields = ['id', 'user', 'username', 'completed_tasks', 'pending_tasks', 'rating']
