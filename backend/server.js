require("dotenv").config();

const express = require("express");

const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const app = express();

const PORT = 3000;

app.use(express.json());

const restaurants = [
    {
        id: 1,
        name: "FoodKart Kitchen",
        cuisine: "Indian",
        location: "Mumbai",
        rating: 4.5
    },
    {
        id: 2,
        name: "Spice House",
        cuisine: "North Indian",
        location: "Pune",
        rating: 4.3
    },
    {
        id: 3,
        name: "Tandoori Hub",
        cuisine: "Mughlai",
        location: "Mumbai",
        rating: 4.6
    }
];


app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            status: "UP",
            database: "UP",
            message: "FoodKart backend is running"
        });
    } catch (error) {
        console.error("Health check failed:", error);

        res.status(503).json({
            status: "DOWN",
            database: "DOWN",
            message: "FoodKart backend database is unavailable"
        });
    }
});

app.get("/api/restaurants", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, address FROM restaurants ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching restaurants:", error);

        res.status(500).json({
            message: "Failed to fetch restaurants"
        });
    }
});

app.get("/api/restaurants/:id", (req, res) => {
    const restaurantId = Number(req.params.id);

    const restaurant = restaurants.find(
        (restaurant) => restaurant.id === restaurantId
    );

    if (!restaurant) {
        return res.status(404).json({
            message: "Restaurant not found"
        });
    }

    res.json(restaurant);
});

app.get("/api/restaurants/:id/menu", async (req, res) => {
    try {
        const restaurantId = Number(req.params.id);

        const result = await pool.query(
            `SELECT id, name, price
             FROM menu_items
             WHERE restaurant_id = $1
             ORDER BY id`,
            [restaurantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Menu not found"
            });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching menu:", error);

        res.status(500).json({
            message: "Failed to fetch menu"
        });
    }
});

app.post("/api/orders", async (req, res) => {
    const { restaurantId, items, customerName } = req.body;

    if (!restaurantId || !items || items.length === 0 || !customerName) {
        return res.status(400).json({
            message: "restaurantId, items and customerName are required"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const orderResult = await client.query(
            `INSERT INTO orders (restaurant_id, customer_name, status)
             VALUES ($1, $2, 'PLACED')
             RETURNING id, restaurant_id, customer_name, status, created_at`,
            [restaurantId, customerName]
        );

        const order = orderResult.rows[0];

        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, menu_item_id, quantity)
                 VALUES ($1, $2, $3)`,
                [order.id, item.menuItemId, item.quantity]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            id: order.id,
            restaurantId: order.restaurant_id,
            customerName: order.customer_name,
            status: order.status,
            items,
            createdAt: order.created_at
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Error creating order:", error);

        res.status(500).json({
            message: "Failed to create order"
        });

    } finally {
        client.release();
    }
});

app.get("/api/orders/:id", async (req, res) => {
    try {
        const orderId = Number(req.params.id);

        const orderResult = await pool.query(
            `SELECT id, restaurant_id, customer_name, status, created_at
             FROM orders
             WHERE id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const order = orderResult.rows[0];

        const itemsResult = await pool.query(
            `SELECT menu_item_id, quantity
             FROM order_items
             WHERE order_id = $1
             ORDER BY id`,
            [orderId]
        );

        res.json({
            id: order.id,
            restaurantId: order.restaurant_id,
            customerName: order.customer_name,
            status: order.status,
            items: itemsResult.rows,
            createdAt: order.created_at
        });

    } catch (error) {
        console.error("Error fetching order:", error);

        res.status(500).json({
            message: "Failed to fetch order"
        });
    }
});

app.listen(PORT, () => {
    console.log(`FoodKart backend running on port ${PORT}`);
});