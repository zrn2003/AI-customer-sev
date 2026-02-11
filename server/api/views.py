from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login
from django.db.models import F
from .models import User, Complaint, ComplaintHistory
from .serializers import (
    UserSerializer, UserResponseSerializer, 
    ComplaintSerializer, ComplaintCreateSerializer, ComplaintUpdateSerializer
)
from .ai_engine import ai_engine, generate_ai_suggestion
import datetime

# ==========================================
# AUTHENTICATION
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Check if email exists
            if User.objects.filter(email=serializer.validated_data['email']).exists():
                return Response({'detail': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            return Response({
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
         return Response({'detail': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    # Authenticate using email as username (due to USERNAME_FIELD='email')
    user = authenticate(username=email, password=password)
    
    if user:
        return Response({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        })
    return Response({'detail': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

# ==========================================
# COMPLAINTS
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([AllowAny]) # Todo: secure this later
def complaints_list(request):
    if request.method == 'GET':
        user_id = request.query_params.get('user_id')
        queryset = Complaint.objects.all().order_by('-created_at')
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        serializer = ComplaintSerializer(queryset, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        # Need to reshape request data slightly
        data = request.data.copy()
        user_id = data.get('user_id')
        if not user_id and request.user.is_authenticated:
            user_id = request.user.id
        
        # DRF expects 'user' as pk
        if user_id:
            data['user'] = user_id
            
        serializer = ComplaintCreateSerializer(data=data)
        if serializer.is_valid():
            # 1. AI Analysis
            description = serializer.validated_data['description']
            score, priority, est_time = ai_engine.predict(description)
            
            # Save with AI fields
            complaint = serializer.save(
                ai_severity_score=score,
                priority=priority,
                ai_predicted_resolution_time=est_time
            )
            
            # Re-serialize for full response info
            return Response(ComplaintSerializer(complaint).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
@permission_classes([AllowAny])
def complaint_detail(request, pk):
    complaint = get_object_or_404(Complaint, pk=pk)
    
    if request.method == 'GET':
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)
        
    elif request.method == 'PATCH':
        old_status = complaint.status
        old_resolution = complaint.resolution
        
        # Prepare data with special resolution handling if needed
        data = request.data.copy()
        new_resolution_text = data.get('resolution')
        
        if new_resolution_text:
            if old_resolution:
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                combined_resolution = f"{old_resolution}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n**Update ({timestamp}):**\n{new_resolution_text}"
                data['resolution'] = combined_resolution
            # Else just new_resolution_text is fine
        
        serializer = ComplaintUpdateSerializer(complaint, data=data, partial=True)
        if serializer.is_valid():
            updated_complaint = serializer.save()
            
            # Audit Log Logic: Status Change
            if 'status' in serializer.validated_data and serializer.validated_data['status'] != old_status:
                ComplaintHistory.objects.create(
                    complaint=complaint,
                    action='STATUS_CHANGE',
                    previous_value=old_status,
                    new_value=updated_complaint.status,
                    changed_by=request.user if request.user.is_authenticated else None
                )
            
            # Audit Log Logic: Resolution Added
            if new_resolution_text:
                 ComplaintHistory.objects.create(
                    complaint=complaint,
                    action='RESOLUTION_ADDED',
                    new_value='Resolution Provided',
                    changed_by=request.user if request.user.is_authenticated else None
                )
            
            return Response(ComplaintSerializer(updated_complaint).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def suggest_resolution_view(request, pk):
    complaint = get_object_or_404(Complaint, pk=pk)
    # Check if existing resolution model exists logic
    suggestion = generate_ai_suggestion(complaint.description)
    return Response({"suggestion": suggestion})
