const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user/profile', auth, authController.getProfile);

module.exports = router;