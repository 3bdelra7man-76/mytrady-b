const express = require('express')
const router = express.Router()
const cardController = require('../controllers/cardController.js')
const auth = require('../middleware/auth')

router.post('/daily', auth, cardController.generateDailyCard)
router.get('/user-cards', auth, cardController.getUserCards)
router.post('/recharge', auth, cardController.rechargeCard)

module.exports = router
