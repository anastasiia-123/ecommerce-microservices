# 🛍️ E-commerce Microservices (Варіант 1) — Практична №5 (Частина 2)

Проект містить мікросервісну архітектуру для управління каталогом товарів та замовленнями з використанням API Gateway (Nginx).

## 🗺️ Діаграма системи (System Diagram)

```mermaid
graph TD
    Client[Клієнт / REST Client] --> Gateway[Nginx API Gateway на порту 8080]
    Gateway -->|api-products| Catalog[Catalog Service на порту 3001]
    Gateway -->|api-orders| Order[Order Service на порту 3002]
    Order -->|Синхронний HTTP запит| Catalog
    Структура проекту (Монорепозиторій)
services/catalog-service — Управління товарами та залишками на складі (Порт 3001)

services/order-service — Створення замовлень та синхронна перевірка складу (Порт 3002)

gateway/ — Конфігурація Nginx для маршрутизації (Порт 8080)

Як запустити систему через Docker Compose:
Переконайтеся, що Docker Desktop запущено.

Виконайте команду в корені проекту:

Bash
docker-compose up --build
API Gateway буде доступний на порту 8080.

🧪 Перевірка працездатності (Health Endpoints):
Catalog Service Health: GET http://localhost:3001/health

Order Service Health: GET http://localhost:3002/health
---
