// * Imports
const Validator = require("validatorjs");

const objectIdRule = "regex:/^[0-9a-fA-F]{24}$/";

// * Validation functions
// Generic validation function
const validator = (body, rules, customMessages, callback) => {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

// Validation error response function
const sendValidationError = (res, err) => {
    res.status(400).send({
        success: false,
        message: "Validation failed",
        errors: err,
    });
};

// Run validation function
const runValidation = (body, rules, res, next) => {
    validator(body, rules, {}, (err, status) => {
        if (!status) {
            sendValidationError(res, err);
            return;
        }

        next();
    });
};

const validateObjectId = (req, res, next) => {
    const validationRules = {
        id: objectIdRule,
    };

    runValidation({ id: req.params?.id }, validationRules, res, next);
};

// * Export
module.exports = {
    validator,
    sendValidationError,
    runValidation,
    validateObjectId,
};
