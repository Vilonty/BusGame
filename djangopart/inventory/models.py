from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Bus(models.Model):
    RARITY_CHOICES = [
        (1, 'Обычный'),
        (2, 'Необычный'),
        (3, 'Редкий'),
        (4, 'Легендарный'),
    ]

    name = models.CharField(max_length=100, verbose_name='Название автобуса')
    description = models.TextField(verbose_name='Описание')
    image = models.ImageField(upload_to='buses/', verbose_name='Изображение')
    rarity = models.IntegerField(choices=RARITY_CHOICES, default=1, verbose_name='Редкость')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Автобус'
        verbose_name_plural = 'Автобусы'

    def __str__(self):
        return self.name


class UserInventory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userinventory_set')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    obtained_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Инвентарь пользователя'
        verbose_name_plural = 'Инвентари пользователей'
        unique_together = ('user', 'bus')

    def __str__(self):
        return f"{self.user.username} - {self.bus.name}"