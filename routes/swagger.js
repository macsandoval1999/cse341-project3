// * Imports
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swaggerDoc.json');

// * Create router
const router = express.Router();

// * Set up the Swagger UI route
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

// * Export router
module.exports = router;