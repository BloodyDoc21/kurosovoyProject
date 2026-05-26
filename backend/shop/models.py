from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Game(models.Model):
    title = models.CharField('Название игры', max_length=200, db_index=True)
    slug = models.SlugField('URL-идентификатор', max_length=200, unique=True)
    description = models.TextField('Описание игры')
    cover_image = models.ImageField('Обложка', upload_to='games/%Y/%m/%d')

    class Meta:
        verbose_name = 'Игра'
        verbose_name_plural = 'Игры'
        ordering = ['title']

    def __str__(self):
        return self.title


class GameAccount(models.Model):
    title = models.CharField('Заголовок объявления', max_length=200, db_index=True)
    description = models.TextField('Описание аккаунта')
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    level = models.IntegerField('Уровень', default=1)
    is_published = models.BooleanField('Опубликовано', default=True)
    created_at = models.DateTimeField('Создано', auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField('Обновлено', auto_now=True)

    game = models.ForeignKey(
        Game,
        on_delete=models.PROTECT,        
        related_name='accounts',
        verbose_name='Игра',
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,          
        null=True,
        blank=True,
        related_name='accounts',
        verbose_name='Продавец',
    )

    class Meta:
        verbose_name = 'Игровой аккаунт'
        verbose_name_plural = 'Игровые аккаунты'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Order(models.Model):

    class Status(models.TextChoices):
        NEW = 'new', 'Новый'
        PROCESSING = 'processing', 'В обработке'
        COMPLETED = 'completed', 'Завершён'
        CANCELLED = 'cancelled', 'Отменён'

    status = models.CharField(
        'Статус', max_length=20,
        choices=Status.choices, default=Status.NEW,
    )
    total_price = models.DecimalField('Итоговая стоимость', max_digits=10, decimal_places=2)
    created_at = models.DateTimeField('Создан', auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,          
        related_name='orders',
        verbose_name='Покупатель',
    )

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        return f'Заказ #{self.pk} ({self.get_status_display()})'


class OrderItem(models.Model):
    price_at_purchase = models.DecimalField('Цена на момент покупки', max_digits=10, decimal_places=2)

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,          
        related_name='items',
        verbose_name='Заказ',
    )
    account = models.ForeignKey(
        GameAccount,
        on_delete=models.PROTECT,         
        related_name='order_items',
        verbose_name='Игровой аккаунт',
    )

    class Meta:
        verbose_name = 'Позиция заказа'
        verbose_name_plural = 'Позиции заказа'

    def __str__(self):
        return f'{self.account} — {self.price_at_purchase}'


class Review(models.Model):
    rating = models.PositiveSmallIntegerField(
        'Оценка',
        choices=[(i, str(i)) for i in range(1, 6)],
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    text = models.TextField('Текст отзыва')
    created_at = models.DateTimeField('Создан', auto_now_add=True, db_index=True)

    account = models.ForeignKey(
        GameAccount,
        on_delete=models.CASCADE,          
        related_name='reviews',
        verbose_name='Аккаунт',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,          
        related_name='reviews',
        verbose_name='Автор',
    )

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['account', 'author'], name='unique_review_per_account'),
            models.CheckConstraint(check=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                                   name='review_rating_range'),
        ]

    def __str__(self):
        return f'Отзыв на {self.account} ({self.rating}/5)'