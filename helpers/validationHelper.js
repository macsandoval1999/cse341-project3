// * Imports
const Validator = require("validatorjs");

// * Validation rules
const objectIdRule = "regex:/^[0-9a-fA-F]{24}$/";
const plainObjectRule = "plainObject";

// * Register custom validation rules
Validator.register(
    plainObjectRule,
    (value) => value !== null && typeof value === "object" && !Array.isArray(value),
    "The :attribute field must be a plain object."
);

// * Validation functions
// Generic validation function
const validator = (body, rules, customMessages) =>
    new Validator(body, rules, customMessages);

// Validation error response function
const sendValidationError = (res, err) => {
    res.status(400).send({
        success: false,
        message: "Validation failed",
        errors: err,
    });
};

// isPlainObject helper function for normalizing stats field
const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

// Run validation function
const runValidation = (body, rules, res, next) => {
    const validation = validator(body, rules, {});
    if (validation.fails()) {
        sendValidationError(res, validation.errors);
        return;
    }
    next();
};

// run validation for objectId in URL params
const validateObjectId = (req, res, next) => {
    const validationRules = {
        id: objectIdRule,
    };
    runValidation({ id: req.params?.id }, validationRules, res, next);
};

// * Export
module.exports = {
    objectIdRule,
    plainObjectRule,
    isPlainObject,
    validator,
    sendValidationError,
    runValidation,
    validateObjectId,
};
