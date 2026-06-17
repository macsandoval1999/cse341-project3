// * Imports
const express = require('express');

const swaggerRoutes = require('./swagger.js');
const guildRoutes = require('./guildsRoutes.js');
const playerRoutes = require('./playersRoutes.js');
const guildEventListingsRoutes = require('./guildEventListings.js');
const guildStoreListingsRoutes = require('./guildStoreListings.js');


// * Create router
const router = express.Router();



// * Routes
router.use('/', swaggerRoutes);
router.use('/guilds', guildRoutes);
router.use('/players', playerRoutes);
router.use('/guildEventListings', guildEventListingsRoutes);
router.use('/guildStoreListings', guildStoreListingsRoutes);



// * Export router
module.exports = router;