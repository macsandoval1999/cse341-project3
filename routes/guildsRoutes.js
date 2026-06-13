// * Imports
const express = require('express');
const guildsController = require('../controllers/guildsController.js');
const validate = require('../middleware/guildsValidation.js');

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
    validate.validateAllGuildFields,
    guildsController.createGuild
);
router.put('/:id',
    validate.validateGuildIdFormat,
    validate.validateAllGuildFields,
    guildsController.replaceGuild
);
router.patch('/:id',
    validate.validateGuildIdFormat,
    validate.validateUpdatedGuildFields,
    guildsController.updateGuild
);
router.delete('/:id',
    validate.validateGuildIdFormat,
    guildsController.deleteGuild
);

// * Export router
module.exports = router;