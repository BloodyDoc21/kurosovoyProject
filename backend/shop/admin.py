from django.contrib import admin
from .models import Game, GameAccount, Order, OrderItem, Review


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'slug')
    list_display_links = ('id', 'title')
    search_fields = ('title',)
    prepopulated_fields = {'slug': ('title',)}


@admin.register(GameAccount)
class GameAccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'game', 'seller', 'price', 'level',
                    'is_published', 'created_at')
    list_display_links = ('id', 'title')
    list_editable = ('is_published',)
    list_filter = ('is_published', 'game', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price_at_purchase', 'account')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'status', 'total_price', 'created_at')
    list_display_links = ('id',)
    list_editable = ('status',)        # БП-6: статус меняет только админ
    list_filter = ('status', 'created_at')
    readonly_fields = ('total_price', 'created_at', 'updated_at')
    inlines = [OrderItemInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'account', 'author', 'rating', 'created_at')
    list_display_links = ('id',)
    list_filter = ('rating', 'created_at')
    search_fields = ('text',)
    readonly_fields = ('created_at',)