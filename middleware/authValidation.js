const validationHelper = require("../helpers/validationHelper");

const isAuthenticated = (req, res, next) => {
    const sessionUser = req.session?.user || req.user;

    if (!sessionUser) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }

    if (req.session && req.session.user === undefined) {
        req.session.user = sessionUser;
    }

    next();
};

const validateRegistrationFields = (req, res, next) => {
    const validationRules = {
        username: "required|string|min:3",
        email: "required|string|email",
        password: "required|string|min:8",
    };

    validationHelper.runValidation(req.body, validationRules, res, next);
};

const validateLoginFields = (req, res, next) => {
    const validationRules = {
        email: "required|string|email",
        password: "required|string",
    };

    validationHelper.runValidation(req.body, validationRules, res, next);
};

module.exports = {
    validateRegistrationFields,
    validateLoginFields,
    isAuthenticated,
};