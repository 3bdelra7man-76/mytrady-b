const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');


router.post('/update', auth, profileController.updatePhone);
router.post('/change-password', auth, profileController.changePassword);
router.post('/delete', auth, profileController.deleteAccount);

module.exports = router;
