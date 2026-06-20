// * Imports
const express = require('express');
const guildsController = require('../controllers/guildsController.js');
const validate = require('../middleware/guildsValidation.js');
const { isAuthenticated } = require('../middleware/authValidation.js');

// * Initialize router
const router = express.Router();

// * Routes
router.get('/',
    guildsController.getAllGuilds
);
router.get('/:id',
    validate.validateGuildIdFormat,
    guildsController.getGuildById
);
router.post('/',
    isAuthenticated,
    validate.validateAllGuildFields,
    guildsController.createGuild
);
router.put('/:id',
    isAuthenticated,
    validate.validateGuildIdFormat,
    validate.validateAllGuildFields,
    guildsController.replaceGuild
);  
router.patch('/:id',
    isAuthenticated,
    validate.validateGuildIdFormat,
    validate.validateUpdatedGuildFields,
    guildsController.updateGuild
);
router.delete('/:id',
    isAuthenticated,
    validate.validateGuildIdFormat,
    guildsController.deleteGuild
);

// * Export router
module.exports = router;