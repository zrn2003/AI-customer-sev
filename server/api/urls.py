from django.urls import path
from . import views

urlpatterns = [
    path('auth/register', views.register, name='register'),
    path('auth/login', views.user_login, name='login'),
    
    path('complaints/', views.complaints_list, name='complaints_list'),
    path('complaints/<int:pk>/', views.complaint_detail, name='complaint_detail'),
    path('complaints/<int:pk>/suggest_resolution/', views.suggest_resolution_view, name='suggest_resolution'),
]
