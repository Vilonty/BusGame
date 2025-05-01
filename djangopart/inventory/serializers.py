from rest_framework import serializers
from .models import Bus, UserInventory

class BusSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    rarity_display = serializers.SerializerMethodField()
    rarity_class = serializers.SerializerMethodField()

    class Meta:
        model = Bus
        fields = ['id', 'name', 'description', 'image_url',
                 'rarity', 'rarity_display', 'rarity_class', 'created_at']
        read_only_fields = ['created_at']

    def get_image_url(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

    def get_rarity_display(self, obj):
        return obj.get_rarity_display()

    def get_rarity_class(self, obj):
        rarity_classes = {
            1: 'common',
            2: 'uncommon',
            3: 'rare',
            4: 'legendary'
        }
        return rarity_classes.get(obj.rarity, 'common')

class UserInventorySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='bus.id')
    name = serializers.CharField(source='bus.name')
    description = serializers.CharField(source='bus.description')
    image_url = serializers.SerializerMethodField()
    rarity = serializers.IntegerField(source='bus.rarity')
    obtained_at = serializers.DateTimeField()

    class Meta:
        model = UserInventory
        fields = ['id', 'name', 'description', 'image_url', 'rarity', 'obtained_at']

    def get_image_url(self, obj):
        if obj.bus.image and hasattr(obj.bus.image, 'url'):
            return self.context['request'].build_absolute_uri(obj.bus.image.url)
        return None

class BusCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ['name', 'description', 'rarity', 'image']  # Явно перечислите поля
        extra_kwargs = {
            'image': {'required': False}
        }