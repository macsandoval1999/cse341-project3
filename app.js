// * Imports
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const GithubStrategy = require("passport-github2").Strategy;
const authController = require("./controllers/authController.js");

const routes = require("./routes");
const mongodb = require("./data/connect.js");

// * ENV config
dotenv.config();
const PORT = process.env.PORT || 3000;

// * Create Express app
const app = express();

// * Middleware
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).json({ error: "Invalid JSON in request body" });
        return;
    }
    next();
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods",
        "Origin, X-Requested-With, Content-Type, Accept, Z-Key"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    next();
});

app.use(cors({methods: ["GET, POST, PUT, DELETE, OPTIONS, PATCH, UPDATE"]}));

app.use(cors({ origin: "*" }));

// * Routes
app.use(routes);

passport.use(
    new GithubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user =
                    await authController.findOrCreateGithubUser(profile);
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get("/", (req, res) => {
    res.send(
        req.session?.user !== undefined
            ? `Logged in as ${req.session.user.username}`
            : "Logged out"
    );
});

app.get(
    "/github/callback",
    passport.authenticate("github", {
        failureRedirect: "/api-docs",
        session: false,
    }),
    authController.completeGithubLogin
);

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
