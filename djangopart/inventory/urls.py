from django.urls import path
from .views import (
    UserInventoryView,
    BusListView,
    BusCreateView,
    BusDetailView,
    scan_ticket  # Добавляем импорт новой функции
)

urlpatterns = [
    path('inventory/', UserInventoryView.as_view(), name='user-inventory'),
    path('buses/', BusListView.as_view(), name='bus-list'),
    path('buses/create/', BusCreateView.as_view(), name='bus-create'),
    path('buses/<int:pk>/', BusDetailView.as_view(), name='bus-detail'),
    # Новый маршрут для сканирования билетов
    path('tickets/scan/', scan_ticket, name='scan-ticket'),
]