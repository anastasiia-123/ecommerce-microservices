const express = require('express');
const app = express();
app.use(express.json());

const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:3001';
let orders = [];

app.get('/health', (req, res) => res.json({ status: "UP", service: "Order Service" }));

// POST /orders - створення замовлення з перевіркою та резервуванням у Catalog
app.post('/orders', async (req, res) => {
    const { items, userId } = req.body; // items: [{ productId: "1", quantity: 2 }]

    try {
        // 1. Міжсервісна комунікація: перевіряємо кожен товар
        for (const item of items) {
            const response = await fetch(`${CATALOG_SERVICE_URL}/products/${item.productId}`);
            if (response.status === 404) {
                return res.status(400).json({ error: `Product with ID ${item.productId} does not exist` });
            }
            const product = await response.json();
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
            }
        }

        // 2. Якщо все ок — резервуємо товари в Catalog Service
        for (const item of items) {
            await fetch(`${CATALOG_SERVICE_URL}/products/${item.productId}/reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: item.quantity })
            });
        }

        // 3. Зберігаємо замовлення
        const newOrder = {
            id: String(orders.length + 1),
            userId,
            items,
            status: "pending",
            createdAt: new Date()
        };
        orders.push(newOrder);
        res.status(201).json(newOrder);

    } catch (error) {
        res.status(500).json({ error: "Internal microservice communication error", details: error.message });
    }
});

// GET /orders/:id - деталі замовлення
app.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
});

// PATCH /orders/:id/status - зміна статусу
app.patch('/orders/:id/status', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = req.body.status || order.status;
    res.json(order);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));