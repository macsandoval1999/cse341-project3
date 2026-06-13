// * Imports
const express = require('express');
const playerController = require('../controllers/playersController.js');
const validate = require('../middleware/playersValidation.js');

// * Initialize router
const router = express.Router();

// * Routes
router.get('/',
    playerController.getAllPlayers
);
router.get('/:id',
    validate.validatePlayerIdFormat,
    playerController.getPlayerById
);
router.post('/',
    validate.validateAllPlayerFields,
    playerController.createPlayer
);
router.put('/:id',
    validate.validatePlayerIdFormat,
    validate.validateAllPlayerFields,
    playerController.replacePlayer
);
router.patch('/:id',
    validate.validatePlayerIdFormat,
    validate.validateUpdatedPlayerFields,
    playerController.updatePlayer
);
router.delete('/:id',
    validate.validatePlayerIdFormat,
    playerController.deletePlayer
);

// * Export router
module.exports = router;