// * Imports
const express = require('express');

const swaggerRoutes = require('./swagger.js');
const guildRoutes = require('./guildsRoutes.js');
const playerRoutes = require('./playersRoutes.js');


// * Create router
const router = express.Router();



// * Routes
router.use('/', swaggerRoutes);
router.use('/guilds', guildRoutes);
router.use('/players', playerRoutes);



// * Export router
module.exports = router;