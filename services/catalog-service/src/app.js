const express = require('express');
const app = express();
app.use(express.json());

// Імітація БД товарів
let products = [
    { id: "1", name: "Laptop", price: 1200, stock: 5, category: "electronics" },
    { id: "2", name: "Smartphone", price: 600, stock: 10, category: "electronics" }
];

// Health check endpoint (Вимога роботи!)
app.get('/health', (req, res) => res.json({ status: "UP", service: "Catalog Service" }));

// GET /products - список, пошук та фільтрація
app.get('/products', (req, res) => {
    const { search, category } = req.query;
    let result = [...products];
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category) result = result.filter(p => p.category === category);
    res.json(result);
});

// GET /products/:id - деталі
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
});

// POST /products/:id/reserve - резервування кількості (Внутрішній ендпоінт)
app.post('/products/:id/reserve', (req, res) => {
    const { quantity } = req.body;
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.stock < quantity) {
        return res.status(400).json({ error: "Not enough stock" });
    }

    product.stock -= quantity; // Зменшуємо залишок
    res.json({ message: "Reserved successfully", remainingStock: product.stock });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Catalog Service running on port ${PORT}`));