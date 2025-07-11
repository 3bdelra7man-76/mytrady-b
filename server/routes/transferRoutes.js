const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const auth = require('../middleware/auth');

// POST /api/transfer
router.post('/', auth, transferController.transferPoints);

module.exports = router;
