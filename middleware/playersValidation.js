const validationHelper = require("../helpers/validationHelper");

const validatePlayerIdFormat = (req, res, next) => {
    validationHelper.validateObjectId(req, res, next);
};

const validateStatsField = (req, res) => {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "stats")) {
        if (!validationHelper.isPlainObject(req.body.stats)) {
            validationHelper.sendValidationError(res, {
                stats: ["The stats field must be a plain object."],
            });
            return false;
        }

        req.body.stats = { ...req.body.stats };
    }

    return true;
};

// Define the validation rules for creating players and replacing players
const validateAllPlayerFields = (req, res, next) => {
    if (!validateStatsField(req, res)) {
        return;
    }

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
        email: "required|string|email",
        bio: "string",
        guild_id: validationHelper.objectIdRule
    };
    validationHelper.runValidation(req.body, validationRules, res, next);
};

// Define the validation rules for updating players (all fields optional but must be valid if provided)
const validateUpdatedPlayerFields = (req, res, next) => {
    if (!validateStatsField(req, res)) {
        return;
    }

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
        email: "string|email",
        bio: "string",
        guild_id: validationHelper.objectIdRule
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
