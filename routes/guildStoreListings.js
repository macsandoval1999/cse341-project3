// * Imports
const express = require("express");
const guildStoreListingsController = require("../controllers/guildStoreListingsController.js");
const validate = require("../middleware/guildStoreListingsValidation.js");
const { isAuthenticated } = require("../middleware/authValidation.js");

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
    isAuthenticated,
    validate.validateAllGuildStoreListingFields,
    guildStoreListingsController.createGuildStoreListing
);
router.put(
    "/:id",
    isAuthenticated,
    validate.validateGuildStoreListingIdFormat,
    validate.validateAllGuildStoreListingFields,
    guildStoreListingsController.replaceGuildStoreListing
);
router.patch(
    "/:id",
    isAuthenticated,
    validate.validateGuildStoreListingIdFormat,
    validate.validateUpdatedGuildStoreListingFields,
    guildStoreListingsController.updateGuildStoreListing
);
router.delete(
    "/:id",
    isAuthenticated,
    validate.validateGuildStoreListingIdFormat,
    guildStoreListingsController.deleteGuildStoreListing
);

// * Export router
module.exports = router;
