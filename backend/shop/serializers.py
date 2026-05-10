from decimal import Decimal
from rest_framework import serializers
from .models import Game, GameAccount, Order, OrderItem, Review


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ('id', 'title', 'slug', 'description', 'cover_image')


class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'rating', 'text', 'created_at', 'account', 'author')
        read_only_fields = ('id', 'created_at', 'author')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Оценка должна быть от 1 до 5.')
        return value

    def validate(self, attrs):
        request = self.context['request']
        account = attrs['account']
        if Review.objects.filter(account=account, author=request.user).exists():
            raise serializers.ValidationError('Вы уже оставили отзыв на этот аккаунт.')
        return attrs


class GameAccountSerializer(serializers.ModelSerializer):
    seller = serializers.StringRelatedField(read_only=True)
    game_title = serializers.CharField(source='game.title', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = GameAccount
        fields = ('id', 'title', 'description', 'price', 'level',
                  'is_published', 'created_at', 'updated_at',
                  'game', 'game_title', 'seller', 'reviews')
        read_only_fields = ('id', 'created_at', 'updated_at', 'seller')


class GameAccountListSerializer(serializers.ModelSerializer):
    seller = serializers.StringRelatedField(read_only=True)
    game_title = serializers.CharField(source='game.title', read_only=True)

    class Meta:
        model = GameAccount
        fields = ('id', 'title', 'price', 'level', 'is_published',
                  'created_at', 'game', 'game_title', 'seller')


class OrderItemSerializer(serializers.ModelSerializer):
    account_title = serializers.CharField(source='account.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'account', 'account_title', 'price_at_purchase')
        read_only_fields = ('id', 'price_at_purchase')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'status', 'total_price', 'created_at',
                  'updated_at', 'buyer', 'items')
        read_only_fields = ('id', 'status', 'total_price', 'created_at',
                            'updated_at', 'buyer', 'items')


class OrderCreateSerializer(serializers.Serializer):
    account_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )

    def validate_account_ids(self, value):
        accounts = GameAccount.objects.filter(id__in=value, is_published=True)
        if accounts.count() != len(set(value)):
            raise serializers.ValidationError('Некоторые аккаунты не найдены или недоступны.')
        return value

    def create(self, validated_data):
        request = self.context['request']
        account_ids = validated_data['account_ids']
        accounts = GameAccount.objects.filter(id__in=account_ids)

        total = sum((acc.price for acc in accounts), Decimal('0.00'))

        order = Order.objects.create(
            buyer=request.user,
            status=Order.Status.NEW,
            total_price=total,
        )
        OrderItem.objects.bulk_create([
            OrderItem(order=order, account=acc, price_at_purchase=acc.price)
            for acc in accounts
        ])
        return order

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data