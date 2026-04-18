from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .models import Attendance
from .serializers import AttendanceSerializer
from django.utils import timezone

# --- Existing System Views ---

class AttendanceListView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Modify attendance queryset based on role
        if user.role == 'admin':
            queryset = Attendance.objects.select_related('user').all().order_by('-date')
        else:
            queryset = Attendance.objects.filter(user=user).order_by('-date')
            
        # Optional backend date filtering
        date_filter = self.request.query_params.get('filter')
        if date_filter == 'today':
            queryset = queryset.filter(date=timezone.localdate())
            
        return queryset

class CheckInView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        today = timezone.localdate()
        
        # 1. Enforce single login per day
        if Attendance.objects.filter(user=user, date=today).exists():
            return Response(
                {"error": "You have already checked in today."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save date explicitly using localdate
        attendance = Attendance.objects.create(
            user=user, 
            date=today,
            login_time=timezone.now(),
            status='IN_PROGRESS'
        )
        serializer = AttendanceSerializer(attendance)
        return Response({
            "message": "Clock-in successful. Status: IN_PROGRESS",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

class CheckOutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        
        # Find active session (In Progress) instead of relying strictly on date
        attendance = Attendance.objects.filter(
            user=user, 
            status='IN_PROGRESS'
        ).order_by('-login_time').first()
        
        # Debug logs for troubleshooting
        print("User:", user)
        print("Found Record:", attendance)
        
        if not attendance:
            return Response(
                {"error": "You must check-in first before checkout."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # If found → update
        attendance.logout_time = timezone.now()
        attendance.status = 'COMPLETED'
        attendance.save()

        
        serializer = AttendanceSerializer(attendance)
        return Response({
            "message": "Clock-out successful. Status: COMPLETED",
            "duration": attendance.duration_display,
            "data": serializer.data
        }, status=status.HTTP_200_OK)


# --- Admin Specific Extensions ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_stats(request):
    """Admin/Manager dashboard summary statistics."""
    if request.user.role not in ['admin', 'manager']:
        return Response({"error": "Unauthorized"}, status=403)
        
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    total_employees = User.objects.filter(role__iexact="employee", is_active=True).count()
    today = timezone.localdate()
    
    # Count UNIQUE present employees
    present_today = Attendance.objects.filter(
        date=today
    ).values('user').distinct().count()

    in_progress = Attendance.objects.filter(date=today, logout_time__isnull=True, user__role='employee').count()
    absent = max(0, total_employees - present_today)
    
    # Correct Formula
    if total_employees > 0:
        attendance_rate = (present_today / total_employees) * 100
    else:
        attendance_rate = 0
    
    attendance_rate = round(attendance_rate, 1)

    
    # Debug logs for terminal monitoring
    print(f"--- Attendance Debug ---")
    print(f"Total Active Employees: {total_employees}")
    print(f"Employees Present Today: {present_today}")
    print(f"Calculated Rate: {attendance_rate}%")
    
    return Response({
        "total_employees": total_employees,
        "present_today": present_today,
        "in_progress": in_progress,
        "absent": absent,
        "attendance_rate": attendance_rate
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_attendance(request, id):
    """Admin can edit an attendance record."""
    if request.user.role not in ['admin', 'manager']:
        return Response({"error": "Unauthorized"}, status=403)
        
    try:
        att = Attendance.objects.get(id=id)
        
        # User might send new login/logout times
        new_login = request.data.get("login")
        new_logout = request.data.get("logout")
        new_status = request.data.get("status")

        if new_login:
            att.login_time = new_login
        if new_logout:
            att.logout_time = new_logout
        if new_status:
            att.status = new_status

        att.save()
        return Response({"message": "Updated successfully"})
    except Attendance.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_attendance(request, id):
    """Admin can delete a record."""
    if request.user.role not in ['admin', 'manager']:
        return Response({"error": "Unauthorized"}, status=403)
        
    try:
        Attendance.objects.get(id=id).delete()
        return Response({"message": "Deleted"})
    except Attendance.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
