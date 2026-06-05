# Магазин по продаже игровых аккаунтов

Веб-приложение интернет-магазина игровых аккаунтов.
Траектория Б: Django REST Framework + React SPA + JWT.

## Технологический стек

**Backend:** Python 3.12, Django 5, Django REST Framework, SimpleJWT, PostgreSQL, Pillow, django-cors-headers, django-filter, python-dotenv.

**Frontend:** React 18, React Router, Axios, Vite.

## Требования к окружению

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+

## Структура

```
backend/    Django REST API
frontend/   React SPA (Vite)
```

## Установка и запуск

### 1. База данных PostgreSQL

```sql
CREATE DATABASE game_accounts_db;
CREATE USER game_shop WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE game_accounts_db TO game_shop;
\c game_accounts_db
GRANT ALL ON SCHEMA public TO game_shop;
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

Создай файл `backend/.env` по образцу `.env.example`:

```dotenv
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=game_accounts_db
DB_USER=game_shop
DB_PASSWORD=your_strong_password
DB_HOST=localhost
DB_PORT=5432
```

Применение миграций и запуск:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend: http://127.0.0.1:8000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Настройка CORS

В `backend/config/settings.py` разрешены источники фронтенда:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

## API-эндпоинты

| Endpoint | Метод | Назначение |
|----------|-------|------------|
| `/api/auth/register/` | POST | Регистрация |
| `/api/auth/login/` | POST | Получение JWT |
| `/api/auth/token/refresh/` | POST | Обновление access-токена |
| `/api/auth/profile/` | GET, PATCH | Профиль |
| `/api/games/` | GET | Список игр |
| `/api/accounts/` | GET, POST | Каталог и создание объявлений |
| `/api/accounts/{id}/` | GET, PATCH, DELETE | Карточка/редактирование/удаление |
| `/api/orders/` | GET, POST | История и оформление заказов |
| `/api/reviews/` | GET, POST | Отзывы |

JWT: access — 30 мин., refresh — 1 день, ротация включена.

## Роли

- **Гость** — просмотр каталога и карточек.
- **Пользователь** — покупка, продажа, отзывы, профиль.
- **Администратор** — полный доступ через Django Admin (`/admin/`).