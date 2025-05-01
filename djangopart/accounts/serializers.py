from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from inventory.models import UserInventory
from inventory.serializers import UserInventorySerializer

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password', 'avatar')
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'required': False}
        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Пароли должны совпадать"})
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    inventory = serializers.SerializerMethodField()
    rarity_stats = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(read_only=True)  # Добавьте это поле

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'avatar_url',
                 'inventory', 'rarity_stats', 'date_joined', 'is_staff')  # Добавьте is_staff
        read_only_fields = ('id', 'date_joined', 'is_staff')

    def get_inventory(self, obj):
        inventory = obj.userinventory_set.all().select_related('bus')
        return UserInventorySerializer(inventory, many=True, context=self.context).data

    def get_rarity_stats(self, obj):
        from django.db.models import Count
        return obj.userinventory_set.values('bus__rarity').annotate(
            count=Count('bus__rarity')
        ).order_by('bus__rarity')

    def get_avatar_url(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return self.context['request'].build_absolute_uri(obj.avatar.url)
        return None

class AvatarUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('avatar',)
        extra_kwargs = {
            'avatar': {'required': True}
        }