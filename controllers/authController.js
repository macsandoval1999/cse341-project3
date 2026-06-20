const bcrypt = require("bcryptjs");
const mongodb = require("../data/connect.js");



const usersCollection = () => mongodb.database.getDB().db().collection("users");



const authController = {};



const buildSessionUser = (user) => ({
    id: user._id?.toString?.() || user.githubId,
    username: user.username,
    email: user.email || null,
    authProvider: user.authProvider,
});



authController.registerUser = async (req, res) => {
    //#swagger.tags = ['Auth']
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            username: 'stargazer',
            email: 'stargazer@example.com',
            password: 'super-secret-password'
        }
    } */
    try {
        const username = req.body.username.trim();
        const email = req.body.email.trim().toLowerCase();
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const existingUser = await usersCollection().findOne({ email });
        if (existingUser) {
            res.status(409).json({
                error: "An account with that email already exists",
            });
            return;
        }
        const user = {
            username,
            email,
            passwordHash,
            authProvider: "local",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const response = await usersCollection().insertOne(user);
        const sessionUser = buildSessionUser({
            ...user,
            _id: response.insertedId,
        });
        req.session.user = sessionUser;
        res.status(201).json({
            message: "User registered successfully",
            user: sessionUser,
        });
    } catch (error) {
        console.error("Failed to register user", error);
        res.status(500).json({ error: "Failed to register user" });
    }
};

authController.loginUser = async (req, res) => {
    //#swagger.tags = ['Auth']
    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            email: 'stargazer@example.com',
            password: 'super-secret-password'
        }
    } */
    try {
        const email = req.body.email.trim().toLowerCase();
        const user = await usersCollection().findOne({
            email,
            authProvider: "local",
        });
        if (!user) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }
        const passwordMatches = await bcrypt.compare(
            req.body.password,
            user.passwordHash
        );
        if (!passwordMatches) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }
        const sessionUser = buildSessionUser(user);
        req.session.user = sessionUser;
        res.status(200).json({
            message: "Login successful",
            user: sessionUser,
        });
    } catch (error) {
        console.error("Failed to log in user", error);
        res.status(500).json({ error: "Failed to log in user" });
    }
};

authController.logoutUser = (req, res, next) => {
    //#swagger.tags = ['Auth']
    if (!req.session?.user && !req.user) { // Check if there is no user in the session and no user in req.user (for Passport authentication)
        res.status(200).json({ message: "No user logged in" });
        return;
    }

    const finishLogout = () => {
        if (!req.session) {
            res.status(200).json({ message: "Logged out successfully" });
            return;
        }
        delete req.session.user;
        req.session.destroy((sessionError) => {
            if (sessionError) {
                next(sessionError);
                return;
            }
            res.clearCookie("connect.sid");
            res.status(200).json({ message: "Logged out successfully" });
        });
    };
    if (typeof req.logout === "function") {
        req.logout((logoutError) => {
            if (logoutError) {
                next(logoutError);
                return;
            }
            finishLogout();
        });
        return;
    }
    finishLogout();
};

authController.completeGithubLogin = (req, res) => {
    req.session.user = req.user;
    res.redirect("/");
};

authController.findOrCreateGithubUser = async (profile) => {
    const githubId = profile.id;
    const email = profile.emails?.[0]?.value?.trim().toLowerCase() || null;
    const username =
        profile.username ||
        profile.displayName ||
        email ||
        `github-${githubId}`;
    const existingUser = await usersCollection().findOne({ githubId });
    if (existingUser) {
        const updatedUser = {
            ...existingUser,
            username,
            email,
            authProvider: "github",
            updatedAt: new Date(),
        };
        await usersCollection().updateOne(
            { _id: existingUser._id },
            {
                $set: {
                    username: updatedUser.username,
                    email: updatedUser.email,
                    authProvider: updatedUser.authProvider,
                    updatedAt: updatedUser.updatedAt,
                },
            }
        );
        return buildSessionUser(updatedUser);
    }
    const newUser = {
        githubId,
        username,
        displayName: profile.displayName || username,
        email,
        authProvider: "github",
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const response = await usersCollection().insertOne(newUser);

    return buildSessionUser({ ...newUser, _id: response.insertedId });
};

module.exports = authController;
