const express = require("express");

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

const menus = {
    1: [
        {
            id: 101,
            name: "Paneer Butter Masala",
            price: 220
        },
        {
            id: 102,
            name: "Veg Biryani",
            price: 180
        }
    ],
    2: [
        {
            id: 201,
            name: "Butter Chicken",
            price: 280
        },
        {
            id: 202,
            name: "Dal Makhani",
            price: 190
        }
    ],
    3: [
        {
            id: 301,
            name: "Chicken Tikka",
            price: 260
        },
        {
            id: 302,
            name: "Mutton Biryani",
            price: 320
        }
    ]
};

const orders = [];

app.get("/api/health", (req, res) => {
    res.json({
        status: "UP",
        message: "FoodKart backend is running"
    });
});

app.get("/api/restaurants", (req, res) => {
    res.json(restaurants);
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

app.get("/api/restaurants/:id/menu", (req, res) => {
    const restaurantId = Number(req.params.id);

    const menu = menus[restaurantId];

    if (!menu) {
        return res.status(404).json({
            message: "Menu not found"
        });
    }

    res.json(menu);
});

app.post("/api/orders", (req, res) => {
    const { restaurantId, items, customerName } = req.body;

    if (!restaurantId || !items || items.length === 0 || !customerName) {
        return res.status(400).json({
            message: "restaurantId, items and customerName are required"
        });
    }

    const order = {
        id: orders.length + 1,
        restaurantId,
        customerName,
        items,
        status: "PLACED",
        createdAt: new Date().toISOString()
    };

    orders.push(order);

    res.status(201).json(order);
});

app.get("/api/orders/:id", (req, res) => {
    const orderId = Number(req.params.id);

    const order = orders.find(
        (order) => order.id === orderId
    );

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    res.json(order);
});

app.listen(PORT, () => {
    console.log(`FoodKart backend running on port ${PORT}`);
});