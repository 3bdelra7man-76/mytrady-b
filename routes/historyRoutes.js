const express = require('express');
const router = express.Router();
const { getUserTransactions } = require('../controllers/historyController');
const auth = require('../middleware/auth');

router.get('/', auth, getUserTransactions);

module.exports = router;
