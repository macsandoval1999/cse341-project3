// * Import
const validationHelper = require("../helpers/validationHelper");

// * Validation Middleware Functions
const validateGuildIdFormat = (req, res, next) => {
    validationHelper.validateObjectId(req, res, next);
};

// Define the validation rules for creating, and replacing guild
const validateAllGuildFields = (req, res, next) => {
    const validationRules = {
        name: "required|string",
        tag: "required|string",
        alliance: "required|string",
        memberCount: "numeric",
        createdAt: "date",
        description: "string",
        activities: "array",
        ranks: "required|array",
        recruitmentOpen: "required|boolean",
        language: "required|string",
        region: "required|string",
        guildMaster: "required|ObjectId"
    };
    validationHelper.runValidation(req.body, validationRules, res, next);
};

// Define the validation rules for updating guild (all fields optional but must be valid if provided)
const validateUpdatedGuildFields = (req, res, next) => {
    const validationRules = {
        name: "string",
        tag: "string",
        alliance: "string",
        memberCount: "numeric",
        createdAt: "date",
        description: "string",
        activities: "array",
        ranks: "array",
        recruitmentOpen: "boolean",
        language: "string",
        region: "string",
        guildMaster: "ObjectId"
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
    validateGuildIdFormat,
    validateAllGuildFields,
    validateUpdatedGuildFields,
};
