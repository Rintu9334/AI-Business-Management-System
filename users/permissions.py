from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admins to access.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsManagerUser(permissions.BasePermission):
    """
    Custom permission to allow managers to access.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'manager')

class IsEmployeeUser(permissions.BasePermission):
    """
    Custom permission to allow employees to access.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'employee')

class IsAdminOrManager(permissions.BasePermission):
    """
    Allows full access to Admin or Manager.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager'])

class IsAdminOrManagerOrReadOnly(permissions.BasePermission):
    """
    Allows full access to Admin or Manager. Others (like Employees) can only read.
    """
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            if request.method in permissions.SAFE_METHODS:
                return True
            return request.user.role in ['admin', 'manager']
        return False

class IsTaskOwnerOrManagerAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to view/edit it.
    Admins and Managers have full access.
    """
    def has_object_permission(self, request, view, obj):
        # Admins and Managers have full access to any task
        if request.user.role in ['admin', 'manager']:
            return True
        
        # Employees can only view/update their own tasks
        # Assuming the model has an 'assigned_to' field
        if request.method in permissions.SAFE_METHODS or request.method in ['PUT', 'PATCH']:
            # They must be assigned to the task
            return getattr(obj, 'assigned_to', None) == request.user
            
        # Employees cannot CREATE or DELETE tasks generally in this logic, 
        # but view/has_permission should be checked for that.
        return False
