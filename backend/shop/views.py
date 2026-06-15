from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Game, GameAccount, Order, Review
from .serializers import (
    GameSerializer, GameAccountSerializer, GameAccountListSerializer,
    OrderSerializer, OrderCreateSerializer, ReviewSerializer,
)
from .permissions import IsSellerOrReadOnly, IsAuthorOrReadOnly
from django.db.models import ProtectedError
from rest_framework import status


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]


class GameAccountViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['game']
    search_fields = ['title', 'description']

    def get_queryset(self):
        qs = GameAccount.objects.select_related('game', 'seller')
        if self.request.query_params.get('mine') == 'true':
            if self.request.user.is_authenticated:
                return qs.filter(seller=self.request.user)
            return qs.none()
        if self.action == 'list':
            return qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return GameAccountListSerializer
        return GameAccountSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsSellerOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {'detail': 'Нельзя удалить аккаунт, который уже был куплен. Его можно только скрыть с публикации.'},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return Order.objects.filter(
            buyer=self.request.user
        ).prefetch_related('items__account')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['account']

    def get_queryset(self):
        return Review.objects.select_related('author', 'account')

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAuthorOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)