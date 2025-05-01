from django.contrib.auth.models import AbstractUser
from django.db import models
import os


def user_avatar_path(instance, filename):
    # Более безопасный путь с хешированием имени файла
    ext = filename.split('.')[-1]
    filename = f'avatar_{instance.id}.{ext}'
    return f'users/{instance.id}/{filename}'


class User(AbstractUser):
    avatar = models.ImageField(
        upload_to=user_avatar_path,
        null=True,
        blank=True,
        verbose_name='Аватар'
    )
    is_moderator = models.BooleanField(
        default=False,
        verbose_name='Модератор'
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-date_joined']

    def __str__(self):
        return self.username

    @property
    def avatar_url(self):
        if self.avatar and hasattr(self.avatar, 'url'):
            return self.avatar.url
        return '/static/default_avatar.png'