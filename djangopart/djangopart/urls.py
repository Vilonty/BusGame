from django.contrib import admin
from django.urls import path, include
from api.views import hello_world

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello_world),  # Более логичный путь
    path('api/auth/', include('accounts.urls')),
    path('', hello_world),
]
