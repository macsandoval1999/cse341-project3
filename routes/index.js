// * Imports
const express = require('express');

const passport = require('passport');
const authController = require('../controllers/authController.js');
const authValidation = require('../middleware/authValidation.js');

const swaggerRoutes = require('./swagger.js');
const guildRoutes = require('./guildsRoutes.js');
const playerRoutes = require('./playersRoutes.js');
const guildEventListingsRoutes = require('./guildEventListings.js');
const guildStoreListingsRoutes = require('./guildStoreListings.js');


// * Create router
const router = express.Router();



// * Routes
router.use('/', swaggerRoutes);

router.post('/register', authValidation.validateRegistrationFields, authController.registerUser);
router.post('/login', authValidation.validateLoginFields, authController.loginUser);

router.use('/guilds', guildRoutes);
router.use('/players', playerRoutes);
router.use('/guildEventListings', guildEventListingsRoutes);
router.use('/guildStoreListings', guildStoreListingsRoutes);

router.get('/login', passport.authenticate('github'), (req, res) => {});
router.get('/logout', authController.logoutUser);


// * Export router
module.exports = router;