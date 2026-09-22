const express = require("express");

const app = express();

const PORT = 3000;

app.get("/api/health", (req, res) => {
    res.json({
        status: "UP",
        message: "FoodKart backend is running"
    });
});

app.listen(PORT, () => {
    console.log(`FoodKart backend running on port ${PORT}`);
});