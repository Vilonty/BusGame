from django.urls import path
from .views import RegisterAPI, LoginAPI, UserAPI, LogoutAPI
from knox import views as knox_views

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('user/', UserAPI.as_view(), name='user'),
]