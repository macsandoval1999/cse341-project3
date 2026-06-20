// * Imports
const express = require('express');
const guildEventListingsController = require('../controllers/guildEventListingsController.js');
const validate = require('../middleware/guildEventListingsValidation.js');
const { isAuthenticated } = require('../middleware/authValidation.js');

// * Initialize router
const router = express.Router();

// * Routes
router.get('/',
    guildEventListingsController.getAllGuildEventListings
);
router.get('/:id',
    validate.validateGuildEventListingIdFormat,
    guildEventListingsController.getGuildEventListingById
);
router.post('/',
    isAuthenticated,
    validate.validateAllGuildEventListingFields,
    guildEventListingsController.createGuildEventListing
);
router.put('/:id',
    isAuthenticated,
    validate.validateGuildEventListingIdFormat,
    validate.validateAllGuildEventListingFields,
    guildEventListingsController.replaceGuildEventListing
);
router.patch('/:id',
    isAuthenticated,
    validate.validateGuildEventListingIdFormat,
    validate.validateUpdatedGuildEventListingFields,
    guildEventListingsController.updateGuildEventListing
);
router.delete('/:id',
    isAuthenticated,
    validate.validateGuildEventListingIdFormat,
    guildEventListingsController.deleteGuildEventListing
);

// * Export router
module.exports = router;