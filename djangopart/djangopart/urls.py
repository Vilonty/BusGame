from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from api.views import hello_world

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello_world),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('inventory.urls')),  # Подключение с префиксом api/
    path('', hello_world),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
