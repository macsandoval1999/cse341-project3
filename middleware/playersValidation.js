const validationHelper = require("../helpers/validationHelper");

const validatePlayerIdFormat = (req, res, next) => {
    validationHelper.validateObjectId(req, res, next);
};

// Define the validation rules for creating players and replacing players
const validateAllPlayerFields = (req, res, next) => {
    const validationRules = {
        username: "required|string",
        displayName: "required|string",
        level: "required|numeric",
        championPoints: "required|numeric",
        class: "required|string",
        alliance: "required|string",
        joinDate: "date",
        role: "string",
        achievements: "array",
        stats: "object",
        email: "required|string|email",
        bio: "string",
        guild_id: "ObjectId"
    };
    validationHelper.runValidation(req.body, validationRules, res, next);
};

// Define the validation rules for updating players (all fields optional but must be valid if provided)
const validateUpdatedPlayerFields = (req, res, next) => {
    const validationRules = {
        username: "string",
        displayName: "string",
        level: "numeric",
        championPoints: "numeric",
        class: "string",
        alliance: "string",
        joinDate: "date",
        role: "string",
        achievements: "array",
        stats: "object",
        email: "string|email",
        bio: "string",
        guild_id: "ObjectId"
    };
    if (Object.keys(req.body || {}).length === 0) {
        res.status(400).send({
            success: false,
            message: "Validation failed",
            errors: { body: ["Request body must include at least one field"] },
        });
        return;
    }
    validationHelper.runValidation(req.body, validationRules, res, next);
};

// * Export
module.exports = {
    validatePlayerIdFormat,
    validateAllPlayerFields,
    validateUpdatedPlayerFields,
};
