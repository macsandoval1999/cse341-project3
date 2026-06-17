// * Import
const validationHelper = require("../helpers/validationHelper");

// * Validation Middleware Functions
const validateGuildStoreListingIdFormat = (req, res, next) => {
    validationHelper.validateObjectId(req, res, next);
};

const validateAllGuildStoreListingFields = (req, res, next) => {
    const validationRules = {
        itemName: "required|string",
        itemType: "required|string",
        subType: "string",
        quality: "string",
        priceGold: "required|numeric",
        quantity: "required|numeric",
        sellerGuild_id: `required|${validationHelper.objectIdRule}`,
        ownerPlayer_id: `required|${validationHelper.objectIdRule}`,
        listedAt: "date",
        description: "string",
        levelRequirement: "numeric",
        traits: "array",
        enchantments: "array",
        sellerNotes: "string"
    };
    validationHelper.runValidation(req.body, validationRules, res, next);
};

const validateUpdatedGuildStoreListingFields = (req, res, next) => {
    const validationRules = {
        itemName: "string",
        itemType: "string",
        subType: "string",
        quality: "string",
        priceGold: "numeric",
        quantity: "numeric",
        sellerGuild_id: validationHelper.objectIdRule,
        ownerPlayer_id: validationHelper.objectIdRule,
        listedAt: "date",
        description: "string",
        levelRequirement: "numeric",
        traits: "array",
        enchantments: "array",
        sellerNotes: "string"
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
    validateGuildStoreListingIdFormat,
    validateAllGuildStoreListingFields,
    validateUpdatedGuildStoreListingFields,
};
