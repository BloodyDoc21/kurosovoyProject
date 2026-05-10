from rest_framework.routers import DefaultRouter
from .views import GameViewSet, GameAccountViewSet, OrderViewSet, ReviewViewSet

router = DefaultRouter()
router.register('games', GameViewSet, basename='game')
router.register('accounts', GameAccountViewSet, basename='account')
router.register('orders', OrderViewSet, basename='order')
router.register('reviews', ReviewViewSet, basename='review')

urlpatterns = router.urls