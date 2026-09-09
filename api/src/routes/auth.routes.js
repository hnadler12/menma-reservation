const { Router } = require('express')
const authController = require('../controllers/auth.controller')

const router = Router()

router.post('/inscription', authController.inscription)
router.post('/connexion', authController.connexion)

module.exports = router
