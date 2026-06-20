// * Import
const validationHelper = require("../helpers/validationHelper");

// * Validation Middleware Functions
const validateGuildEventListingIdFormat = (req, res, next) => {
    validationHelper.validateObjectId(req, res, next);
};

// Define the validation rules for creating, and replacing guild event listings
const validateAllGuildEventListingFields = (req, res, next) => {
    const validationRules = {
        name: "required|string",
        description: "required|string",
        eventDate: "required|date",
        durationMinutes: "required|numeric",
        eventType: "required|string",
        organizer: `required|${validationHelper.objectIdRule}`,
        guild_id: `required|${validationHelper.objectIdRule}`,
        attendees: "array",
        requirements: validationHelper.plainObjectRule,
        recurring: "boolean",
        createdAt: "date",
        recurrencePattern: "string",
        recurrenceDays: "array",
    };
    validationHelper.runValidation(req.body, validationRules, res, next);
};

// Define the validation rules for updating guild event listings (all fields optional but must be valid if provided)
const validateUpdatedGuildEventListingFields = (req, res, next) => {
    const validationRules = {
        name: "string",
        description: "string",
        eventDate: "date",
        durationMinutes: "numeric",
        eventType: "string",
        organizer: validationHelper.objectIdRule,
        guild_id: validationHelper.objectIdRule,
        attendees: "array",
        requirements: validationHelper.plainObjectRule,
        recurring: "boolean",
        createdAt: "date",
        recurrencePattern: "string",
        recurrenceDays: "array",
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
    validateGuildEventListingIdFormat,
    validateAllGuildEventListingFields,
    validateUpdatedGuildEventListingFields,
};
