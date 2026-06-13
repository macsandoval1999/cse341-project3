// * Imports
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const routes = require("./routes");
const mongodb = require("./data/connect.js");

// * ENV config
dotenv.config();
const PORT = process.env.PORT || 3000;

// * Create Express app
const app = express();

// * Middleware
app.use(bodyParser.json());

// * Routes
app.use(routes);
app.get("/", (req, res) => {
    res.send("Welcome to ESO Guilds API");
});

// * Global error handler for uncaught exceptions
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "An unexpected Internal Server Error occurred",
    });
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// * Initialize MongoDB connection and start server
mongodb.database.initDB((err) => {
    if (err) {
        console.error("Failed to initialize database connection:", err);
        process.exit(1);
    } else {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
});
