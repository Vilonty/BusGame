from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from django.core.files.storage import default_storage
from .models import Bus, UserInventory
from .serializers import BusSerializer, UserInventorySerializer, BusCreateUpdateSerializer
import pytesseract
from PIL import Image
import re
from django.utils import timezone
import logging
logger = logging.getLogger(__name__)

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


# Для обычных пользователей
class UserInventoryView(generics.ListAPIView):
    serializer_class = UserInventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserInventory.objects.filter(user=self.request.user).select_related('bus')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# Для администраторов
class BusListView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        print("\n=== Полученные данные ===")
        print("POST данные:", request.POST)
        print("FILES:", request.FILES)
        print("Полный request.data:", request.data)

        try:
            response = super().create(request, *args, **kwargs)
            print("Ответ сервера:", response.data)
            return response
        except Exception as e:
            print("Ошибка при создании:", str(e))
            raise

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BusCreateUpdateSerializer
        return BusSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Bus.objects.all()
        return Bus.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save()


class BusCreateView(generics.CreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusCreateUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]


class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BusCreateUpdateSerializer
        return BusSerializer

    def perform_destroy(self, instance):
        # Полное удаление автобуса
        instance.delete()
        print(f"Автобус {instance.id} полностью удален")  # Для логов


# Функция для сканирования билетов
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def scan_ticket(request):
    if 'ticket_image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=400)

    ticket_file = request.FILES['ticket_image']
    file_name = default_storage.save(f'tmp/{ticket_file.name}', ticket_file)
    file_path = default_storage.path(file_name)

    try:
        print("\n=== Начало обработки билета ===")
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img, lang='rus+eng')
        print(f"Распознанный текст:\n{text}")

        # Улучшенный алгоритм поиска номера маршрута
        bus_number = None

        # 1. Ищем явное указание маршрута
        route_match = re.search(r'маршрут[а]?[:\s]*[№#]?\s*(\d{1,3}[а-я]?)', text, re.IGNORECASE)
        if not route_match:
            # 2. Ищем "Mapwpyt i 4" (с учетом возможных ошибок OCR)
            route_match = re.search(r'(?:маршрут|mapwpyt|марш|маршрута|euggueyr.)[^\d]*(\d{1,3})', text, re.IGNORECASE)

        if route_match:
            bus_number = route_match.group(1)
            print(f"Найден номер маршрута: {bus_number}")
        else:
            # 3. Ищем отдельно стоящие цифры в конце строк
            lines = text.split('\n')
            for line in lines:
                line = line.strip()
                if any(word in line.lower() for word in ['маршрут', 'mapwpyt', 'марш']):
                    num_match = re.search(r'(\d{1,3})\s*$', line)
                    if num_match:
                        bus_number = num_match.group(1)
                        print(f"Найден номер в конце строки: {bus_number}")
                        break

        if not bus_number:
            print("\nНомер маршрута не найден на билете")
            return Response({
                'bus_found': False,
                'message': 'Номер маршрута не найден на билете',
                'recognized_text': text
            }, status=200)

        print(f"\n=== ИНФОРМАЦИЯ О НОМЕРЕ МАРШРУТА ===")
        print(f"Окончательный номер: {bus_number}")

        # Ищем автобус с таким номером в названии
        bus = Bus.objects.filter(name__icontains=bus_number).first()

        if not bus:
            print(f"Автобус с номером '{bus_number}' не найден в базе")
            return Response({
                'bus_found': False,
                'bus_number': bus_number,
                'message': f'Автобус №{bus_number} не найден в базе'
            }, status=200)

        print(f"Найден автобус: {bus.name}")

        # Проверяем наличие у пользователя
        if UserInventory.objects.filter(user=request.user, bus=bus).exists():
            print("У пользователя уже есть этот автобус")
            return Response({
                'bus_found': True,
                'bus_number': bus_number,
                'bus_name': bus.name,
                'bus_image': bus.image.url if bus.image else None,
                'message': 'У вас уже есть этот автобус'
            }, status=200)

        # Добавляем в инвентарь
        UserInventory.objects.create(
            user=request.user,
            bus=bus,
            obtained_at=timezone.now()
        )
        print("Автобус успешно добавлен в коллекцию")

        return Response({
            'bus_found': True,
            'bus_number': bus_number,
            'bus_name': bus.name,
            'bus_image': bus.image.url if bus.image else None,
            'message': 'Автобус добавлен в вашу коллекцию'
        }, status=200)

    except Exception as e:
        print(f"\n!!! ОШИБКА: {str(e)}")
        return Response(
            {'error': 'Ошибка обработки'},
            status=500
        )
    finally:
        default_storage.delete(file_name)
        print("\n=== Обработка завершена ===")