// * Imports
const express = require("express");
const guildStoreListingsController = require("../controllers/guildStoreListingsController.js");
const validate = require("../middleware/guildStoreListingsValidation.js");

// * Initialize router
const router = express.Router();

// * Routes
router.get("/", guildStoreListingsController.getAllGuildStoreListings);
router.get(
    "/:id",
    validate.validateGuildStoreListingIdFormat,
    guildStoreListingsController.getGuildStoreListingById
);
router.post(
    "/",
    validate.validateAllGuildStoreListingFields,
    guildStoreListingsController.createGuildStoreListing
);
router.put(
    "/:id",
    validate.validateGuildStoreListingIdFormat,
    validate.validateAllGuildStoreListingFields,
    guildStoreListingsController.replaceGuildStoreListing
);
router.patch(
    "/:id",
    validate.validateGuildStoreListingIdFormat,
    validate.validateUpdatedGuildStoreListingFields,
    guildStoreListingsController.updateGuildStoreListing
);
router.delete(
    "/:id",
    validate.validateGuildStoreListingIdFormat,
    guildStoreListingsController.deleteGuildStoreListing
);

// * Export router
module.exports = router;
