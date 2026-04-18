from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        query = User.objects.filter(email=value)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate(self, data):
        # Demo-only check for duplicate password strings
        password = data.get('password')
        if password and User.objects.filter(password=password).exists():
            raise serializers.ValidationError({"password": "Password already in use, choose another"})
        return data

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data.get('role', 'employee'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # User name (Using first_name if available, otherwise username)
        name = self.user.first_name if self.user.first_name else self.user.username
        
        # Structure payload as requested by frontend
        data['user'] = {
            'name': name,
            'role': self.user.role,
            'email': self.user.email,
            'id': self.user.id
        }
        
        # Alias 'access' as 'token' to match requested frontend structure
        data['token'] = data['access']
        
        return data
