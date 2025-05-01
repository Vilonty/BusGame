from django.urls import path
from .views import (
    UserProfileView,
    AvatarUploadView,
    LoginView,
    RegisterView,
    LogoutView
)

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),  # ваш текущий путь
    path('profile/avatar/', AvatarUploadView.as_view(), name='avatar-upload'),  # ваш текущий путь
    path('login/', LoginView.as_view(), name='login'),  # ваш текущий путь
    path('register/', RegisterView.as_view(), name='register'),  # ваш текущий путь
    path('logout/', LogoutView.as_view(), name='logout'),  # новый путь
]